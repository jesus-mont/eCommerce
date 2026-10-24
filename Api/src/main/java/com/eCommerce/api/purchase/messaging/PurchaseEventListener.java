package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.config.RabbitMQConfig;
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

    public PurchaseEventListener(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.PURCHASE_QUEUE)
    public void handlePurchaseCreated(PurchaseCreatedEvent event) {
        Optional<PurchaseOrder> optionalOrder = purchaseOrderRepository.findById(event.orderId());

        if (optionalOrder.isEmpty()) {
            System.err.println("Warning: not order find yer or  invalid ID: " + event.orderId());
            return;
        }

        PurchaseOrder order = optionalOrder.get();
        if (order.getStatus() == OrderStatus.COMPLETED) {
            return;
        }

        order.setStatus(OrderStatus.COMPLETED);
        purchaseOrderRepository.save(order);
    }
}
