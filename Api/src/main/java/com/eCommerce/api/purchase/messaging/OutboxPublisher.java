package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.purchase.domain.OutboxEvent;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@RequiredArgsConstructor
public class OutboxPublisher {
    private static final Logger logger = LoggerFactory.getLogger(OutboxPublisher.class);
    private final OutboxEventRepository repository;
    private final PurchaseProducer producer;
    private final ObjectMapper objectMapper;

    @Scheduled(fixedDelayString = "${app.outbox.poll-delay-ms:1000}")
    @Transactional
    public void publishPending() {
        for (OutboxEvent event : repository.findTop100ByPublishedAtIsNullOrderByCreatedAtAscIdAsc()) {
            try {
                PurchaseCreatedEvent payload = objectMapper.readValue(event.getPayload(), PurchaseCreatedEvent.class);
                producer.sendPurchaseEvent(payload);
                event.setPublishedAt(OffsetDateTime.now());
            } catch (Exception e) {
                logger.warn("Unable to publish outbox event {}. It will be retried.", event.getId(), e);
                continue;
            }
        }
    }
}
