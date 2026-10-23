package com.eCommerce.api.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreatePurchaseRequest(
        @NotBlank(message = "Customer email is mandatory")
        @Email(message = "Invalid email format")
        String customerEmail,

        @NotEmpty(message = "Purchase must contain at least one item")
        @Valid
        List<ItemRequest> items
) {
    public record ItemRequest(
            @NotNull(message = "Product ID is mandatory")
            Long productId,

            @NotNull(message = "Quantity is mandatory")
            @Positive(message = "Quantity must be greater than zero")
            Integer quantity
    ) {}
}