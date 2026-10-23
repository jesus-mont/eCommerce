package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.config.RabbitMQConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PurchaseProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private PurchaseProducer purchaseProducer;

    @Test
    @DisplayName("Should send purchase event payload to RabbitTemplate using correct exchange and routing key")
    void testSendPurchaseEvent() {
        // Arrange
        Object eventPayload = "Test-Event-Payload-Object";

        // Act
        purchaseProducer.sendPurchaseEvent(eventPayload);

        // Assert
        verify(rabbitTemplate, times(1)).convertAndSend(
                RabbitMQConfig.PURCHASE_EXCHANGE,
                RabbitMQConfig.PURCHASE_ROUTING_KEY,
                eventPayload
        );
    }
}
