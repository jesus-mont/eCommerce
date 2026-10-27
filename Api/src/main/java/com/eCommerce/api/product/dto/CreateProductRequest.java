package com.eCommerce.api.product.dto;

import com.eCommerce.api.product.domain.ProductCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank(message = "SKU is required")
        @jakarta.validation.constraints.Size(max = 255)
        String sku,

        @NotBlank(message = "Name is required")
        @jakarta.validation.constraints.Size(max = 255)
        String name,

        @jakarta.validation.constraints.Size(max = 10000)
        String description,

        @NotNull(message = "Category is required")
        ProductCategory category,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        @jakarta.validation.constraints.Digits(integer = 10, fraction = 2)
        BigDecimal price,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        @jakarta.validation.constraints.Max(Integer.MAX_VALUE)
        Integer stock,

        @NotNull(message = "Weight is required")
        @DecimalMin(value = "0.001", message = "Weight must be greater than 0")
        @jakarta.validation.constraints.Digits(integer = 5, fraction = 3)
        BigDecimal weightKg
) {}
