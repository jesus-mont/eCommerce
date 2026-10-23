package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class PurchaseProducer {

    private final RabbitTemplate rabbitTemplate;

    public PurchaseProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendPurchaseEvent(Object eventPayload) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PURCHASE_EXCHANGE,
                RabbitMQConfig.PURCHASE_ROUTING_KEY,
                eventPayload
        );
    }
}