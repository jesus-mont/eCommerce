# Enterprise E-Commerce Platform

A modular e-commerce demo built using **Java (Spring Boot)**, **React**, **PostgreSQL**, **Flyway**, and **RabbitMQ**. It demonstrates catalog management, indexed search, atomic inventory reservation, and simulated asynchronous checkout.

---
## 📌 Project Overview

The repository contains product CRUD, catalog search, a bundled CSV startup seed, and a simulated payment flow. Product writes require HTTP Basic admin credentials. It is a challenge implementation, not a production deployment: user accounts, real payment integration, user-uploaded CSV files, and operational monitoring are not included.

### 🌐 Accessing the Services

Once the containers are successfully running, you can access the various components at the following endpoints:

| Service | Access URL / Port | Description |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:3000` | React Web UI |
| **Backend API** | `http://localhost:8080` | Spring Boot REST Endpoints |
| **RabbitMQ Management** | `http://localhost:15672` | Message Broker Dashboard (Default guest/guest credentials) |
| **PostgreSQL Database** | `localhost:5432` | Relational Store (Creds defined in `docker-compose.yml`) |


## 🐳 Running with Docker Compose
You can spin up the entire stack (React Frontend, Spring Boot Backend, PostgreSQL Database, and RabbitMQ Message Broker) with a single command using Docker Compose.

Prerequisites
Docker and Docker Compose installed on your machine.

Quick Start Instructions
Clone the repository:

git clone <repository-url>
cd eComerce

Start the application containers:
Run the following command from the root directory containing the docker-compose.yml file:
docker compose up --build

Product create, update, and delete endpoints use HTTP Basic authentication. Local defaults are `admin` / `ecommerceApp`; set `APP_SECURITY_ADMIN_USERNAME` and `APP_SECURITY_ADMIN_PASSWORD` before starting Compose to override them. Change these values outside a local demo.

The React API client sends those credentials only for product create, update, and delete requests. In Compose, the frontend receives the same values as build arguments. For local `npm start`, set `REACT_APP_ADMIN_USERNAME` and `REACT_APP_ADMIN_PASSWORD` to match the API account. These build-time credentials are visible to anyone who can access the frontend bundle, so this shared-account approach is intended for the local challenge demo only.

Stop the containers:
To stop the running services, press Ctrl + C in your terminal, or run:
docker compose down


### Sample Data Details
* **Example CSV File:** `Code Challenge E-Commerce` renamed to `products.csv`
* **CSV Download Date:** October 22, 2026 (confirm this date against the original download record before relying on it).
* The CSV is loaded from the classpath once when the product table is empty. Invalid rows are skipped and reported to application stderr; unknown categories fall back to `MISC`. There is no CSV upload endpoint or import summary in the UI.

---

## 🏗️ Architectural Decisions & Design Approach


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
* **Schema note:** Order items reference their purchase order with a foreign key. Product IDs and SKUs on order items are snapshots without a product foreign key so past orders can remain readable independently of catalog lifecycle.

### 2. Concurrency Control & Stock Management
* **Choice:** PostgreSQL Atomic Conditional SQL Updates inside ACID Transactions
* **Rationale:** Stock deduction uses a conditional database update (`stock >= quantity`) inside the order transaction. PostgreSQL row locks serialize competing updates, and failure to reserve stock aborts order creation. The atomic update is intentionally used instead of an in-memory check, which cannot protect concurrent requests.
* **Alternative Considered:** Redis Pre-Reservations. Intentionally omitted. While Redis provides fast in-memory atomic operations, it introduces cross-system dual-write risks: if an application crashes or database write fails after a Redis deduction, the two systems fall out of sync, requiring complex reservation expirations, compensations, and background reconciliation loops.

### 3. Asynchronous Non-Blocking Payment Processing
- **Choice:** RabbitMQ Message Queue + Transactional Outbox Pattern
- **Rationale:** The API saves the order, reserves stock, and stores an outbox event in one PostgreSQL transaction. A scheduled relay publishes pending events; failed sends remain eligible for retry. Payment is simulated by the consumer. Delivery is at least once, so consumers must remain idempotent. Current order status checks prevent most duplicate processing; monitor and test crash/retry boundaries before production use.
- **Alternative Considered:** Synchronous HTTP payment execution within the REST handler. Rejected because third-party payment gateway latency directly degrades API throughput and client response times.

### 4. Search & Indexing Strategy
* **Choice:** PostgreSQL `pg_trgm` GIN indexes with `unaccent`
* **Rationale:** Search uses case- and accent-insensitive substring matching across name, SKU, description, and category, then ranks matches by trigram similarity. GIN expression indexes are installed by Flyway. Search terms are escaped so `%` and `_` are treated literally. This does not implement multi-word relevance tuning or a dedicated search service.
* **Alternative Considered:** Elasticsearch. Elasticsearch offers robust search, but adding a dedicated search cluster for a single-service architecture introduces unnecessary operational complexity and resource overhead.

### 5. Efficient Bulk CSV Import
* **Choice:** OpenCSV streaming reader for the bundled seed
* **Rationale:** A simple startup seed is sufficient for the supplied example dataset. Rows are validated while reading and saved individually; this is not a high-volume upload pipeline. A future upload feature should return row-level errors and use bounded JDBC batching.

---

## 🧪 Testing Strategy

The platform implements a comprehensive, multi-layered testing strategy to guarantee code quality, transactional safety across distributed boundaries, and a seamless user experience from end to end.

### 1. Frontend Component Testing
- **Tools:** Jest & React Testing Library
- **Scope:** Validates individual React components, local state management, form inputs, and user interactions in isolation. It ensures that UI components render correctly and handle user events robustly before integration.

### 2. Backend Unit Testing
- **Tools:** JUnit 5 & Mockito
- **Scope:** Focuses on business logic services, domain components, and event listeners (such as the asynchronous `PurchaseEventListener`). Collaborators and repositories are mocked to test edge cases, conditional flows (like payment success/failure paths), and error handling deterministically and rapidly.

### 3. Integration & Concurrency Testing
- **Tools:** Spring Boot Test, Testcontainers dependencies, and RabbitMQ integration tests
- **Scope:** Existing integration coverage exercises purchase messaging. PostgreSQL concurrency and migration integration coverage still needs to be added; unit tests alone do not prove atomic stock behavior under concurrent requests.

### 4. End-to-End (E2E) Acceptance Testing
- **Tools:** Selenium
- **Scope:** Selenium tests cover navigation, catalog, product administration, purchase history, and a checkout journey using local/mock services. Authentication-specific browser coverage is not currently present.

## 🛠️ Tech Stack

| Layer | Technology | Key Libraries / Modules |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript | Axios, React Router, Tailwind CSS |
| **Backend API** | Java 17+, Spring Boot 3.x | Spring Data JPA, Spring AMQP, Jakarta Validation |
| **Database** | PostgreSQL 16 | Flyway Migration (`db/migration`), `pg_trgm` |
| **Message Broker** | RabbitMQ 3 | AMQP Protocol + Management Console (Port 15672) |
| **Testing** | JUnit 5, Testcontainers | Real PostgreSQL Integration & Concurrency Tests |
| **Containerization** | Docker, Docker Compose | Multi-stage Dockerfiles |
