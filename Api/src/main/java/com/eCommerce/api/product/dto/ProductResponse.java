package com.eCommerce.api.product.dto;

import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.domain.ProductCategory;

import java.math.BigDecimal;
import java.time.OffsetDateTime;


public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        ProductCategory category,
        BigDecimal price,
        Integer stock,
        BigDecimal weightKg,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static ProductResponse fromEntity(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                product.getWeightKg(),
                product.getIsActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}