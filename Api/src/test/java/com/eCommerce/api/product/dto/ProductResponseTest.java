package com.eCommerce.api.product.dto;

import com.eCommerce.api.product.domain.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ProductResponseTest {

    @Test
    @DisplayName("Should map entity to product response successfully")
    void fromEntity_Success() {
        OffsetDateTime now = OffsetDateTime.now();
        Product product = Product.builder()
                .id(1L)
                .sku("SKU-001")
                .name("Laptop")
                .description("Gaming Laptop")
                .category("ELECTRONICS")
                .price(new BigDecimal("1200.00"))
                .stock(10)
                .weightKg(new BigDecimal("2.5"))
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        ProductResponse response = ProductResponse.fromEntity(product);

        assertNotNull(response);
        assertEquals(product.getId(), response.id());
        assertEquals(product.getSku(), response.sku());
        assertEquals(product.getName(), response.name());
        assertEquals(product.getDescription(), response.description());
        assertEquals(product.getCategory(), response.category());
        assertEquals(product.getPrice(), response.price());
        assertEquals(product.getStock(), response.stock());
        assertEquals(product.getWeightKg(), response.weightKg());
        assertEquals(product.getIsActive(), response.isActive());
        assertEquals(product.getCreatedAt(), response.createdAt());
        assertEquals(product.getUpdatedAt(), response.updatedAt());
    }
}