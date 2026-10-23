package com.eCommerce.api.purchase.service;

import com.eCommerce.api.purchase.dto.CreatePurchaseRequest;
import com.eCommerce.api.purchase.dto.PurchaseResponse;

public interface PurchaseService {
    PurchaseResponse createPurchase(CreatePurchaseRequest request);
}
