package com.eCommerce.api.purchase.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "outbox_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OutboxEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String eventType;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
    @Column(name = "published_at")
    private OffsetDateTime publishedAt;
    @PrePersist void onCreate() { createdAt = OffsetDateTime.now(); }
}
