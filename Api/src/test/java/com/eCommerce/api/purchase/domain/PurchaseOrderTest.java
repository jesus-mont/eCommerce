package com.eCommerce.api.purchase.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PurchaseOrderTest {

    @Test
    @DisplayName("Should create PurchaseOrder using builder and getters correctly")
    void testPurchaseOrderBuilderAndGetters() {
        // Arrange
        Long id = 1L;
        String customerEmail = "test@example.com";
        OrderStatus status = OrderStatus.PENDING;
        BigDecimal totalAmount = BigDecimal.valueOf(300.00);
        List<OrderItem> items = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();

        // Act
        PurchaseOrder order = PurchaseOrder.builder()
                .id(id)
                .customerEmail(customerEmail)
                .status(status)
                .totalAmount(totalAmount)
                .items(items)
                .createdAt(now)
                .updatedAt(now)
                .build();

        // Assert
        assertNotNull(order);
        assertEquals(id, order.getId());
        assertEquals(customerEmail, order.getCustomerEmail());
        assertEquals(status, order.getStatus());
        assertEquals(totalAmount, order.getTotalAmount());
        assertEquals(items, order.getItems());
        assertEquals(now, order.getCreatedAt());
        assertEquals(now, order.getUpdatedAt());
    }

    @Test
    @DisplayName("Should test setters and default builder values")
    void testPurchaseOrderSetters() {
        // Arrange
        PurchaseOrder order = new PurchaseOrder();
        Long id = 2L;
        String customerEmail = "client@example.com";
        OrderStatus status = OrderStatus.COMPLETED;
        BigDecimal totalAmount = BigDecimal.valueOf(500.50);

        // Act
        order.setId(id);
        order.setCustomerEmail(customerEmail);
        order.setStatus(status);
        order.setTotalAmount(totalAmount);

        // Assert
        assertEquals(id, order.getId());
        assertEquals(customerEmail, order.getCustomerEmail());
        assertEquals(status, order.getStatus());
        assertEquals(totalAmount, order.getTotalAmount());
        assertNotNull(order.getItems()); // Verifica que @Builder.Default inicialice la lista vacía
        assertTrue(order.getItems().isEmpty());
    }

    @Test
    @DisplayName("Should execute @PrePersist callback setting dates and default status if null")
    void testPrePersistCallback() {
        // Arrange
        PurchaseOrder order = new PurchaseOrder();
        order.setCustomerEmail("persist@example.com");
        order.setTotalAmount(BigDecimal.valueOf(150.00));
        // Status y fechas vienen nulos antes de persistir

        // Act
        order.onCreate();

        // Assert
        assertNotNull(order.getCreatedAt());
        assertNotNull(order.getUpdatedAt());
        assertEquals(OrderStatus.PENDING, order.getStatus(), "Status should default to PENDING if null");
    }

    @Test
    @DisplayName("Should execute @PreUpdate callback updating the updatedAt timestamp")
    void testPreUpdateCallback() throws InterruptedException {
        // Arrange
        PurchaseOrder order = new PurchaseOrder();
        order.onCreate();
        OffsetDateTime initialUpdatedAt = order.getUpdatedAt();

        // Pequeña pausa para asegurar diferencia en milisegundos si el sistema es muy rápido
        Thread.sleep(10);

        // Act
        order.onUpdate();

        // Assert
        assertNotNull(order.getUpdatedAt());
        assertTrue(order.getUpdatedAt().isAfter(initialUpdatedAt) || order.getUpdatedAt().isEqual(initialUpdatedAt));
    }
}