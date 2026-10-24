package com.eCommerce.api.purchase.service;

import com.eCommerce.api.purchase.dto.CreatePurchaseRequest;
import com.eCommerce.api.purchase.dto.PurchaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PurchaseService {
    PurchaseResponse createPurchase(CreatePurchaseRequest request);
    Page<PurchaseResponse> getAllPurchases(Pageable pageable);
    PurchaseResponse getPurchaseById(Long id);
}
