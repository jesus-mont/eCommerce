# Enterprise E-Commerce Platform

A production-ready, modular monolith e-commerce application built using **Java (Spring Boot)**, **React**, **PostgreSQL**, **Flyway**, and **RabbitMQ**, designed for transactional correctness, concurrency safety, and operational simplicity.

---

## 📌 Project Overview

This repository contains an end-to-end e-commerce platform supporting product catalog management, bulk CSV imports with row-level validation, trigram-indexed search, and an idempotent checkout flow.

### Sample Data Details
* **Example CSV File:** `Code Challenge E-Commerce`
* **CSV Download Date:** October 21, 2026

---

## 🏗️ Architectural Decisions & Design Approach

```text
               ┌───────────────────────────────────────────┐
               │          React + TypeScript UI            │
               └─────────────────────┬─────────────────────┘
                                     │ REST API
                                     ▼
               ┌───────────────────────────────────────────┐
               │       Spring Boot Modular Monolith        │
               │   (Catalog, Search, Orders, CSV Import)   │
               └──────────────┬──────────────────┬─────────┘
                              │                  │
                              ▼                  ▼
                    ┌───────────────────┐  ┌───────────┐
                    │    PostgreSQL     │  │ RabbitMQ  │
                    │ (Flyway + Outbox) │  │  (Queue)  │
                    └───────────────────┘  └───────────┘

### 1. Relational Data Store & Schema Migrations
* **Choice:** PostgreSQL + Flyway
* **Rationale:** Relational data consistency (`ACID`) is non-negotiable for e-commerce inventory and transactional orders. Flyway executes version-controlled SQL migration scripts (`db/migration/V1__*.sql`) on application startup, guaranteeing exact database schema reproducibility and seamless initialization across fresh Docker environments.

### 2. Concurrency Control & Stock Management
* **Choice:** PostgreSQL Atomic Conditional SQL Updates inside ACID Transactions
* **Rationale:** Stock deduction is executed directly at the persistence layer using conditional SQL statements (`UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty`) within a single `@Transactional` boundary. This relies on PostgreSQL's row-level locking to handle concurrent updates safely, ensuring that stock deductions and order creations either commit or roll back together atomically.
* **Alternative Considered:** Redis Pre-Reservations. Intentionally omitted. While Redis provides fast in-memory atomic operations, it introduces cross-system dual-write risks: if an application crashes or database write fails after a Redis deduction, the two systems fall out of sync, requiring complex reservation expirations, compensations, and background reconciliation loops.

### 3. Asynchronous Non-Blocking Payment Processing
- **Choice:** RabbitMQ Message Queue + Transactional Outbox Pattern
- **Rationale:** Decouples order request ingestion from payment gateway execution. To prevent dual-write inconsistencies, the API creates the order (`PENDING_PAYMENT`), deducts stock, and records an outbox event inside a single PostgreSQL `@Transactional` boundary. A background worker picks up the outbox event, dispatches it to RabbitMQ, simulates payment, and updates the order status to `PAID` or `FAILED`. On payment failure, reserved stock is released exactly once.
- **Alternative Considered:** Synchronous HTTP payment execution within the REST handler. Rejected because third-party payment gateway latency directly degrades API throughput and client response times.

### 4. Search & Indexing Strategy
* **Choice:** PostgreSQL B-Tree & Trigram (`pg_trgm`) GIN Indexes
* **Rationale:** Native PostgreSQL trigram GIN indexes enable fast partial text matching, fuzzy searches, and paginated queries across `name`, `sku`, and `category` fields with microsecond latency without adding extra container dependencies.
* **Alternative Considered:** Elasticsearch. Elasticsearch offers robust search, but adding a dedicated search cluster for a single-service architecture introduces unnecessary operational complexity and resource overhead.

### 5. Efficient Bulk CSV Import
* **Choice:** Apache Commons CSV + Spring Data JPA Batching
* **Rationale:** Processes incoming CSV files using a streaming reader combined with JDBC batch execution (`batchUpdate`) rather than single-row `save()` loops in JPA, ensuring low memory footprint and high processing speed during large uploads.     

## 🛠️ Tech Stack

| Layer | Technology | Key Libraries / Modules |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript | Axios, React Router, Tailwind CSS |
| **Backend API** | Java 17+, Spring Boot 3.x | Spring Data JPA, Spring AMQP, Jakarta Validation |
| **Database** | PostgreSQL 16 | Flyway Migration (`db/migration`), `pg_trgm` |
| **Message Broker** | RabbitMQ 3 | AMQP Protocol + Management Console (Port 15672) |
| **Testing** | JUnit 5, Testcontainers | Real PostgreSQL Integration & Concurrency Tests |
| **Containerization** | Docker, Docker Compose | Multi-stage Dockerfiles |