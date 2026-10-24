package com.eCommerce.api.purchase.service;

import com.eCommerce.api.common.exception.ResourceNotFoundException;
import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.repository.ProductRepository;
import com.eCommerce.api.purchase.domain.OrderItem;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.dto.CreatePurchaseRequest;
import com.eCommerce.api.purchase.dto.PurchaseResponse;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.event.OrderCommittedEvent;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PurchaseServiceImpl(
            PurchaseOrderRepository purchaseOrderRepository,
            ProductRepository productRepository,
            ApplicationEventPublisher eventPublisher
            ) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public PurchaseResponse createPurchase(CreatePurchaseRequest request) {
        PurchaseOrder order = PurchaseOrder.builder()
                .customerEmail(request.customerEmail())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<PurchaseCreatedEvent.OrderItemDto> eventItems = new ArrayList<>();

        for (CreatePurchaseRequest.ItemRequest itemReq : request.items()) {
            Product product = productRepository.findByIdAndIsActiveTrue(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.productId()));

            if (product.getStock() < itemReq.quantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - itemReq.quantity());
            try {
                productRepository.save(product);
            } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                throw new IllegalStateException("product: '" + product.getName() + "'was updated by other transaction. Please try again.");
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .purchaseOrder(order)
                    .productId(product.getId())
                    .sku(product.getSku())
                    .quantity(itemReq.quantity())
                    .price(product.getPrice())
                    .build();

            order.getItems().add(orderItem);

            eventItems.add(new PurchaseCreatedEvent.OrderItemDto(
                    product.getId(),
                    product.getSku(),
                    itemReq.quantity(),
                    product.getPrice()
            ));
        }

        if (eventItems.isEmpty()){
            throw new IllegalArgumentException("Purchase must contain at least one item");
        }

        order.setTotalAmount(totalAmount);
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        PurchaseCreatedEvent event = new PurchaseCreatedEvent(
                savedOrder.getId(),
                savedOrder.getCustomerEmail(),
                eventItems,
                savedOrder.getTotalAmount(),
                savedOrder.getCreatedAt()
        );

        eventPublisher.publishEvent(new OrderCommittedEvent(event));

        return PurchaseResponse.fromEntity(savedOrder);
    }
    @Override
    public Page<PurchaseResponse> getAllPurchases(Pageable pageable) {
        return purchaseOrderRepository.findAll(pageable)
                .map(PurchaseResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        return purchaseOrderRepository.findById(id).map(PurchaseResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
    }

}
