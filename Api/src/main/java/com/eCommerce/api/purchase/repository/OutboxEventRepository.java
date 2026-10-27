package com.eCommerce.api.purchase.repository;

import com.eCommerce.api.purchase.domain.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findTop100ByPublishedAtIsNullOrderByCreatedAtAscIdAsc();
}
