package com.eCommerce.api.purchase.dto;

import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record PurchaseResponse(
        Long id,
        String customerEmail,
        OrderStatus status,
        BigDecimal totalAmount,
        List<ItemResponse> items,
        OffsetDateTime createdAt
) {
    public record ItemResponse(
            Long productId,
            String sku,
            Integer quantity,
            BigDecimal price
    ) {}

    public static PurchaseResponse fromEntity(PurchaseOrder order) {
        List<ItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new ItemResponse(
                        item.getProductId(),
                        item.getSku(),
                        item.getQuantity(),
                        item.getPrice()
                ))
                .toList();

        return new PurchaseResponse(
                order.getId(),
                order.getCustomerEmail(),
                order.getStatus(),
                order.getTotalAmount(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}
