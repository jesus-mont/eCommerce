package com.eCommerce.api.purchase.messaging;

import com.eCommerce.api.purchase.event.OrderCommittedEvent;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.messaging.OrderCommitListener;
import com.eCommerce.api.purchase.messaging.PurchaseProducer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderCommitListenerTest {

    @Mock
    private PurchaseProducer purchaseProducer;

    @InjectMocks
    private OrderCommitListener orderCommitListener;

    @Test
    void shouldSendPurchaseEventWhenOrderCommittedEventIsHandled() {
        PurchaseCreatedEvent mockPurchaseEvent = new PurchaseCreatedEvent(
                1L,
                "customer@example.com",
                List.of(),
                new BigDecimal("99.99"),
                OffsetDateTime.now()
        );

        OrderCommittedEvent committedEvent = new OrderCommittedEvent(mockPurchaseEvent);

        orderCommitListener.handleOrderCommitted(committedEvent);

        verify(purchaseProducer, times(1)).sendPurchaseEvent(mockPurchaseEvent);
    }
}