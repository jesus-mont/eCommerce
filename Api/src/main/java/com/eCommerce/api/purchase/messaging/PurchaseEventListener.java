package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.config.RabbitMQConfig;
import com.eCommerce.api.product.repository.ProductRepository;
import com.eCommerce.api.purchase.domain.OrderItem;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class PurchaseEventListener {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;

    public PurchaseEventListener(PurchaseOrderRepository purchaseOrderRepository, ProductRepository productRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.PURCHASE_QUEUE)
    @Transactional
    public void handlePurchaseCreated(PurchaseCreatedEvent event) {
        Long orderId = event.orderId();
        Optional<PurchaseOrder> optionalOrder = purchaseOrderRepository.findById(event.orderId());

        if (optionalOrder.isEmpty()) {
            System.err.println("Warning: not order find yer or  invalid ID: " + event.orderId());
            return;
        }


        PurchaseOrder order = optionalOrder.get();
        if (!OrderStatus.PENDING.equals(order.getStatus())) {
            return;
        }
        boolean paymentSuccess = simulatePaymentGateway(order);

        if (paymentSuccess) {
            order.setStatus(OrderStatus.COMPLETED);
            purchaseOrderRepository.save(order);
            System.out.println("Payment SUCCESS for order ID: " + orderId);
        } else {
            order.setStatus(OrderStatus.FAILED);
            purchaseOrderRepository.save(order);

            for (OrderItem item : order.getItems()) {
                productRepository.restoreStock(item.getProductId(), item.getQuantity());
            }
            System.out.println("Payment FAILED for order ID: " + orderId + ". Stock restored.");
        }

    }

    private boolean simulatePaymentGateway(PurchaseOrder order) {

        if (order.getCustomerEmail() != null && order.getCustomerEmail().contains("fail")) {
            return false;
        }
       return true;
    }
}
