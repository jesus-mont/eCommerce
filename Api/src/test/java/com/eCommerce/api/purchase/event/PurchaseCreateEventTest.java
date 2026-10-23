package com.eCommerce.api.purchase.event;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PurchaseCreatedEventTest {

    @Test
    @DisplayName("Should create OrderItemDto record and retrieve fields correctly")
    void testOrderItemDtoAccessors() {
        // Arrange
        Long productId = 10L;
        String sku = "SKU-EVENT-01";
        Integer quantity = 3;
        BigDecimal price = BigDecimal.valueOf(45.50);

        // Act
        PurchaseCreatedEvent.OrderItemDto dto = new PurchaseCreatedEvent.OrderItemDto(
                productId, sku, quantity, price
        );

        // Assert
        assertNotNull(dto);
        assertEquals(productId, dto.productId());
        assertEquals(sku, dto.sku());
        assertEquals(quantity, dto.quantity());
        assertEquals(price, dto.price());
    }

    @Test
    @DisplayName("Should create PurchaseCreatedEvent record and retrieve fields correctly")
    void testPurchaseCreatedEventAccessors() {
        // Arrange
        Long orderId = 100L;
        String customerEmail = "event@example.com";
        BigDecimal totalAmount = BigDecimal.valueOf(136.50);
        OffsetDateTime now = OffsetDateTime.now();

        PurchaseCreatedEvent.OrderItemDto itemDto = new PurchaseCreatedEvent.OrderItemDto(
                10L, "SKU-EVENT-01", 3, BigDecimal.valueOf(45.50)
        );
        List<PurchaseCreatedEvent.OrderItemDto> items = List.of(itemDto);

        // Act
        PurchaseCreatedEvent event = new PurchaseCreatedEvent(
                orderId, customerEmail, items, totalAmount, now
        );

        // Assert
        assertNotNull(event);
        assertEquals(orderId, event.orderId());
        assertEquals(customerEmail, event.customerEmail());
        assertEquals(items, event.items());
        assertEquals(totalAmount, event.totalAmount());
        assertEquals(now, event.createdAt());
        assertEquals(1, event.items().size());
        assertEquals("SKU-EVENT-01", event.items().get(0).sku());
    }
}
