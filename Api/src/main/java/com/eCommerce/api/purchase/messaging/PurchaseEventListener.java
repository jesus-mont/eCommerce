package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.config.RabbitMQConfig;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PurchaseEventListener {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public PurchaseEventListener(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.PURCHASE_QUEUE)
    @Transactional
    public void handlePurchaseCreated(PurchaseCreatedEvent event) {
        PurchaseOrder order = purchaseOrderRepository.findById(event.orderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.orderId()));

        // Lógica de procesamiento de cobro exitoso y actualización de estado
        order.setStatus(OrderStatus.COMPLETED);
        purchaseOrderRepository.save(order);
    }
}
