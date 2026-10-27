package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.product.repository.ProductRepository;
import com.eCommerce.api.purchase.domain.OrderItem;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseEventListenerIntegrationTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private PurchaseEventListener purchaseEventListener;



    @Test
    void handlePurchaseCreated_OrderNotFound_ShouldReturnEarly() {
        String customerEmail = "test@test.com";
        String sku = "PROD-001";
        PurchaseCreatedEvent.OrderItemDto itemDto = new PurchaseCreatedEvent.OrderItemDto(1L,sku,1, BigDecimal.valueOf(150));
        PurchaseCreatedEvent event = new PurchaseCreatedEvent(1L, customerEmail,List.of(itemDto), itemDto.price(), OffsetDateTime.now() );;
        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.empty());

        purchaseEventListener.handlePurchaseCreated(event);

        verify(purchaseOrderRepository).findById(1L);
        verifyNoMoreInteractions(purchaseOrderRepository, productRepository);
    }

    @Test
    void handlePurchaseCreated_OrderNotPending_ShouldReturnEarly() {
        String customerEmail = "test@test.com";
        String sku = "PROD-001";
        PurchaseCreatedEvent.OrderItemDto itemDto = new PurchaseCreatedEvent.OrderItemDto(1L,sku,1, BigDecimal.valueOf(150));
        PurchaseCreatedEvent event = new PurchaseCreatedEvent(1L, customerEmail,List.of(itemDto), itemDto.price(), OffsetDateTime.now() );
        PurchaseOrder order = new PurchaseOrder();
        order.setId(1L);
        order.setStatus(OrderStatus.COMPLETED);

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        purchaseEventListener.handlePurchaseCreated(event);

        verify(purchaseOrderRepository).findById(1L);
        verify(purchaseOrderRepository, never()).save(any());
        verifyNoInteractions(productRepository);
    }

    @Test
    void handlePurchaseCreated_PaymentSuccess_ShouldCompleteOrder() {
        String customerEmail = "test@test.com";
        String sku = "PROD-001";
        PurchaseCreatedEvent.OrderItemDto itemDto = new PurchaseCreatedEvent.OrderItemDto(1L,sku,1, BigDecimal.valueOf(150));
        PurchaseCreatedEvent event = new PurchaseCreatedEvent(1L, customerEmail,List.of(itemDto), itemDto.price(), OffsetDateTime.now() );
        PurchaseOrder order = new PurchaseOrder();
        order.setId(1L);
        order.setStatus(OrderStatus.PENDING);
        order.setCustomerEmail(customerEmail);

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        purchaseEventListener.handlePurchaseCreated(event);

        verify(purchaseOrderRepository).findById(1L);
        verify(purchaseOrderRepository).save(order);
        assert order.getStatus() == OrderStatus.COMPLETED;
        verifyNoInteractions(productRepository);
    }

    @Test
    void handlePurchaseCreated_PaymentFailed_ShouldRestoreStockAndFailOrder() {

        String customerEmail = "fail-user@example.com";
        String sku = "PROD-001";
        PurchaseCreatedEvent.OrderItemDto itemDto = new PurchaseCreatedEvent.OrderItemDto(1L,sku,1, BigDecimal.valueOf(150));
        PurchaseCreatedEvent event = new PurchaseCreatedEvent(1L, customerEmail,List.of(itemDto), itemDto.price(), OffsetDateTime.now() );

        OrderItem item = new OrderItem();
        item.setProductId(100L);
        item.setQuantity(3);

        PurchaseOrder order = new PurchaseOrder();
        order.setId(1L);
        order.setStatus(OrderStatus.PENDING);
        order.setCustomerEmail(customerEmail);
        order.setItems(List.of(item));

        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        purchaseEventListener.handlePurchaseCreated(event);

        verify(purchaseOrderRepository).findById(1L);
        verify(purchaseOrderRepository).save(order);
        assert order.getStatus() == OrderStatus.FAILED;
        verify(productRepository).restoreStock(100L, 3);
    }
}