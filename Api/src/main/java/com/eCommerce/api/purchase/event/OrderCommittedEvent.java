package com.eCommerce.api.purchase.event;

public record OrderCommittedEvent(PurchaseCreatedEvent purchaseEvent) {}
