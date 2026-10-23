package com.eCommerce.api.purchase.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record PurchaseCreatedEvent(
        Long orderId,
        String customerEmail,
        List<OrderItemDto> items,
        BigDecimal totalAmount,
        OffsetDateTime createdAt
) {
    public record OrderItemDto(
            Long productId,
            String sku,
            Integer quantity,
            BigDecimal price
    ) {}
}
