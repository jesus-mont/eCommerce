package com.eCommerce.api.purchase.repository;

import com.eCommerce.api.purchase.domain.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
}
