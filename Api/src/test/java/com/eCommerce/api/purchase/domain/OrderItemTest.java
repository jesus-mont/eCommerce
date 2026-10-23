package com.eCommerce.api.purchase.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class OrderItemTest {

    @Test
    @DisplayName("Should create OrderItem using builder and getters correctly")
    void testOrderItemBuilderAndGetters() {
        // Arrange
        Long id = 1L;
        PurchaseOrder purchaseOrder = PurchaseOrder.builder().id(100L).build();
        Long productId = 50L;
        String sku = "SKU-PROD-001";
        Integer quantity = 3;
        BigDecimal price = BigDecimal.valueOf(150.50);

        // Act
        OrderItem orderItem = OrderItem.builder()
                .id(id)
                .purchaseOrder(purchaseOrder)
                .productId(productId)
                .sku(sku)
                .quantity(quantity)
                .price(price)
                .build();

        // Assert
        assertNotNull(orderItem);
        assertEquals(id, orderItem.getId());
        assertEquals(purchaseOrder, orderItem.getPurchaseOrder());
        assertEquals(productId, orderItem.getProductId());
        assertEquals(sku, orderItem.getSku());
        assertEquals(quantity, orderItem.getQuantity());
        assertEquals(price, orderItem.getPrice());
    }

    @Test
    @DisplayName("Should test setters and no-args constructor")
    void testOrderItemSettersAndNoArgsConstructor() {
        // Arrange
        OrderItem orderItem = new OrderItem();
        Long id = 2L;
        PurchaseOrder purchaseOrder = new PurchaseOrder();
        Long productId = 75L;
        String sku = "SKU-PROD-002";
        Integer quantity = 1;
        BigDecimal price = BigDecimal.valueOf(99.99);

        // Act
        orderItem.setId(id);
        orderItem.setPurchaseOrder(purchaseOrder);
        orderItem.setProductId(productId);
        orderItem.setSku(sku);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(price);

        // Assert
        assertEquals(id, orderItem.getId());
        assertEquals(purchaseOrder, orderItem.getPurchaseOrder());
        assertEquals(productId, orderItem.getProductId());
        assertEquals(sku, orderItem.getSku());
        assertEquals(quantity, orderItem.getQuantity());
        assertEquals(price, orderItem.getPrice());
    }

    @Test
    @DisplayName("Should test all-args constructor")
    void testOrderItemAllArgsConstructor() {
        // Arrange
        Long id = 1L;
        PurchaseOrder purchaseOrder = new PurchaseOrder();
        Long productId = 10L;
        String sku = "SKU-TEST";
        Integer quantity = 5;
        BigDecimal price = BigDecimal.valueOf(25.00);

        // Act
        OrderItem orderItem = new OrderItem(id, purchaseOrder, productId, sku, quantity, price);

        // Assert
        assertEquals(id, orderItem.getId());
        assertEquals(purchaseOrder, orderItem.getPurchaseOrder());
        assertEquals(productId, orderItem.getProductId());
        assertEquals(sku, orderItem.getSku());
        assertEquals(quantity, orderItem.getQuantity());
        assertEquals(price, orderItem.getPrice());
    }
}
