package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.purchase.domain.OutboxEvent;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxPublisherTest {
    @Mock private OutboxEventRepository repository;
    @Mock private PurchaseProducer producer;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void doesNothingWhenNoEventsArePending() {
        when(repository.findTop100ByPublishedAtIsNullOrderByCreatedAtAscIdAsc()).thenReturn(List.of());
        OutboxPublisher publisher = new OutboxPublisher(repository, producer, objectMapper);

        publisher.publishPending();

        verify(repository).findTop100ByPublishedAtIsNullOrderByCreatedAtAscIdAsc();
        verifyNoInteractions(producer);
    }

    @Test
    void publishesEventsAndMarksThemPublished() throws Exception {
        PurchaseCreatedEvent payload = new PurchaseCreatedEvent(11L, "buyer@example.com", List.of(),
                new BigDecimal("24.50"), OffsetDateTime.now());
        OutboxEvent event = event(1L, objectMapper.writeValueAsString(payload));
        when(repository.findTop100ByPublishedAtIsNullOrderByCreatedAtAscIdAsc()).thenReturn(List.of(event));
        OutboxPublisher publisher = new OutboxPublisher(repository, producer, objectMapper);

        publisher.publishPending();

        ArgumentCaptor<PurchaseCreatedEvent> published = ArgumentCaptor.forClass(PurchaseCreatedEvent.class);
        verify(producer).sendPurchaseEvent(published.capture());
        assertEquals(payload.orderId(), published.getValue().orderId());
        assertEquals(payload.customerEmail(), published.getValue().customerEmail());
        assertNotNull(event.getPublishedAt());
    }

    @Test
    void leavesFailedEventPendingAndContinuesWithLaterEvents() throws Exception {
        OutboxEvent malformed = event(1L, "not-json");
        PurchaseCreatedEvent payload = new PurchaseCreatedEvent(12L, "buyer@example.com", List.of(),
                new BigDecimal("12.00"), OffsetDateTime.now());
        OutboxEvent next = event(2L, objectMapper.writeValueAsString(payload));
        when(repository.findTop100ByPublishedAtIsNullOrderByCreatedAtAscIdAsc())
                .thenReturn(List.of(malformed, next));
        OutboxPublisher publisher = new OutboxPublisher(repository, producer, objectMapper);

        publisher.publishPending();

        assertNull(malformed.getPublishedAt());
        assertNotNull(next.getPublishedAt());
        ArgumentCaptor<PurchaseCreatedEvent> published = ArgumentCaptor.forClass(PurchaseCreatedEvent.class);
        verify(producer).sendPurchaseEvent(published.capture());
        assertEquals(12L, published.getValue().orderId());
    }

    private OutboxEvent event(Long id, String payload) {
        return OutboxEvent.builder().id(id).eventType("PurchaseCreatedEvent").payload(payload)
                .createdAt(OffsetDateTime.now()).build();
    }
}
