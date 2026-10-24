package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.config.RabbitMQConfig;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.awaitility.Awaitility.await;
import java.time.Duration;

@SpringBootTest
@ActiveProfiles("test")
class PurchaseEventListenerIntegrationTest {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", () -> "localhost");
        registry.add("spring.rabbitmq.port", () -> 5672);
        registry.add("spring.rabbitmq.username", () -> "guest");
        registry.add("spring.rabbitmq.password", () -> "guest");
    }

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Test
    @DisplayName("Should receive message from queue, process payment and update status to COMPLETED")
    void shouldProcessMessageAndUpdateOrderStatus() {
        PurchaseOrder order = PurchaseOrder.builder()
                .customerEmail("customer@test.com")
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(150.00))
                .build();
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        PurchaseCreatedEvent event = new PurchaseCreatedEvent(
                savedOrder.getId(),
                savedOrder.getCustomerEmail(),
                List.of(new PurchaseCreatedEvent.OrderItemDto(1L, "SKU-TEST", 1, BigDecimal.valueOf(150.00))),
                savedOrder.getTotalAmount(),
                OffsetDateTime.now()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PURCHASE_EXCHANGE,
                RabbitMQConfig.PURCHASE_ROUTING_KEY,
                event
        );

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            PurchaseOrder updatedOrder = purchaseOrderRepository.findById(savedOrder.getId()).orElseThrow();
            assertEquals(OrderStatus.COMPLETED, updatedOrder.getStatus());
        });
    }
}
