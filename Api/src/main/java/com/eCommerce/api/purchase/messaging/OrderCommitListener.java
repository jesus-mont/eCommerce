package com.eCommerce.api.purchase.messaging;
import com.eCommerce.api.purchase.event.OrderCommittedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderCommitListener {

    private final PurchaseProducer purchaseProducer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCommitted(OrderCommittedEvent event) {
        purchaseProducer.sendPurchaseEvent(event.purchaseEvent());
    }
}
