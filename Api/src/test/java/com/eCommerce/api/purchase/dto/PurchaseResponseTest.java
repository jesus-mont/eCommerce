package com.eCommerce.api.purchase.dto;

import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.OrderItem;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PurchaseResponseTest {

    @Test
    @DisplayName("Should create PurchaseResponse and ItemResponse correctly using constructor")
    void testPurchaseResponseConstructorAndGetters() {
        // Arrange
        Long id = 1L;
        String email = "test@example.com";
        OrderStatus status = OrderStatus.PENDING;
        BigDecimal total = BigDecimal.valueOf(150.00);
        OffsetDateTime now = OffsetDateTime.now();

        PurchaseResponse.ItemResponse itemResponse = new PurchaseResponse.ItemResponse(
                10L, "SKU-PROD", 2, BigDecimal.valueOf(75.00)
        );
        List<PurchaseResponse.ItemResponse> items = List.of(itemResponse);

        // Act
        PurchaseResponse response = new PurchaseResponse(id, email, status, total, items, now);

        // Assert
        assertNotNull(response);
        assertEquals(id, response.id());
        assertEquals(email, response.customerEmail());
        assertEquals(status, response.status());
        assertEquals(total, response.totalAmount());
        assertEquals(items, response.items());
        assertEquals(now, response.createdAt());

        assertEquals(10L, itemResponse.productId());
        assertEquals("SKU-PROD", itemResponse.sku());
        assertEquals(2, itemResponse.quantity());
        assertEquals(BigDecimal.valueOf(75.00), itemResponse.price());
    }

    @Test
    @DisplayName("Should map PurchaseOrder entity to PurchaseResponse DTO successfully using fromEntity")
    void testFromEntityMapping() {
        // Arrange
        OffsetDateTime now = OffsetDateTime.now();

        PurchaseOrder order = PurchaseOrder.builder()
                .id(1L)
                .customerEmail("customer@example.com")
                .status(OrderStatus.COMPLETED)
                .totalAmount(BigDecimal.valueOf(200.00))
                .createdAt(now)
                .updatedAt(now)
                .build();

        OrderItem item = OrderItem.builder()
                .id(5L)
                .purchaseOrder(order)
                .productId(2L)
                .sku("SKU-TEST")
                .quantity(4)
                .price(BigDecimal.valueOf(50.00))
                .build();

        order.getItems().add(item);

        // Act
        PurchaseResponse response = PurchaseResponse.fromEntity(order);

        // Assert
        assertNotNull(response);
        assertEquals(order.getId(), response.id());
        assertEquals(order.getCustomerEmail(), response.customerEmail());
        assertEquals(order.getStatus(), response.status());
        assertEquals(order.getTotalAmount(), response.totalAmount());
        assertEquals(order.getCreatedAt(), response.createdAt());

        assertNotNull(response.items());
        assertEquals(1, response.items().size());

        PurchaseResponse.ItemResponse mappedItem = response.items().get(0);
        assertEquals(item.getProductId(), mappedItem.productId());
        assertEquals(item.getSku(), mappedItem.sku());
        assertEquals(item.getQuantity(), mappedItem.quantity());
        assertEquals(item.getPrice(), mappedItem.price());
    }
}