# E-Commerce Challenge

A small e-commerce application with a Java 21 / Spring Boot API, React UI, PostgreSQL database, and RabbitMQ message broker. It supports product management, catalog search, a bundled CSV startup seed, and checkout with simulated asynchronous payment.

## Features

- Product create, read, update, and soft delete. Deleted products remain in the database and their SKU remains reserved.
- Product search across name, SKU, description, and category. Search is case- and accent-insensitive, supports multiple terms, and uses PostgreSQL trigram similarity and GIN indexes.
- Checkout reserves stock with a conditional SQL update. Payment is simulated asynchronously; an email containing `fail` causes payment failure and the reserved stock is restored.
- A bundled CSV (`Api/src/main/resources/products.csv`) seeds the database at startup only when the products table is empty. Invalid rows are generally skipped and reported to application stderr. Duplicate SKUs are skipped. Unknown categories currently become `MISC`. The importer strips non-numeric characters from price and weight, including minus signs, so negative input can be imported as a positive value.
- Product create, update, and delete API routes require HTTP Basic admin credentials. Reads, search, and purchases are public in this demo.

CSV import is not exposed as an upload API or UI. The import requirement is therefore only partially implemented: the supplied CSV is used as startup seed data.


## Run with Docker Compose

Prerequisites: Docker with the Compose plugin.

From the repository root:

```bash
docker compose up --build
```

Open the UI at `http://localhost:3000`. The API is at `http://localhost:8080`; RabbitMQ management is at `http://localhost:15672` (default `guest` / `guest`). PostgreSQL listens on port `5432`.

The local demo admin credentials default to `admin` / `ecommerceApp`. Override them before building and starting Compose:

```bash
APP_SECURITY_ADMIN_USERNAME=my-admin APP_SECURITY_ADMIN_PASSWORD=my-password docker compose up --build
```

The frontend receives these credentials at build time, so they are included in its static bundle and are not suitable for production. To stop the stack, run `docker compose down`. Product data persists in the Compose volume; `docker compose down -v` also removes that data.

## Run locally without the app containers

Prerequisites: Java 21, Node.js 18+, npm, and Docker. Start PostgreSQL and RabbitMQ from the repository root:

```bash
docker compose up -d postgres rabbitmq
```

In one terminal, start the API (default local DB and broker settings are in `Api/src/main/resources/application.properties`):

```bash
cd Api
bash ./mvnw spring-boot:run
```

In another terminal, start the UI. Set the admin credentials to match the API account if you changed its defaults:

```bash
cd ecommerce_ui
REACT_APP_ADMIN_USERNAME=admin REACT_APP_ADMIN_PASSWORD=ecommerceApp npm install
REACT_APP_ADMIN_USERNAME=admin REACT_APP_ADMIN_PASSWORD=ecommerceApp npm start
```

On Windows, run `mvnw.cmd spring-boot:run` from the `Api` directory. The UI expects the API at `http://localhost:8080/api`.

## Tests

Backend unit and controller tests:

```bash
cd Api
bash ./mvnw test
```

The backend suite contains JUnit, Mockito, and Spring MVC tests. Testcontainers dependencies are present in the Maven configuration, but the current tests do not use them; there is no real PostgreSQL/RabbitMQ integration or concurrency test coverage. On Windows, run `mvnw.cmd test` instead.

Frontend tests (Jest / React Testing Library):

```bash
cd ecommerce_ui
npm install
npm test -- --watchAll=false
```

Selenium browser tests:

```bash
cd ecommerce_ui
npm install
npm run build
cd ../selenium-tests
npm install
npm test
```

The Selenium suite uses Chrome and Selenium Manager. See [selenium-tests/README.md](selenium-tests/README.md) for environment settings and headed mode.
The runner uses any services already listening on ports 3000 and 8080; otherwise, it starts a static server from `ecommerce_ui/build` and its Node mock API. The tests expect the mock fixture data, so stop other services on those ports before running the suite.

## Design choices and trade-offs

### PostgreSQL and migrations

PostgreSQL stores products, orders, order items, and outbox events. Flyway migrations define the schema, constraints, and search indexes. PostgreSQL was chosen for relational consistency and transactional inventory/order updates; a document database was an alternative, but would add work to maintain those relationships and consistency rules.

### Product lifecycle and stock

Deleting a product sets `is_active` to false. Inactive products are omitted from catalog reads, while the unique SKU constraint means a deleted SKU cannot be reused. This preserves old order references and avoids silently creating a second product identity.

Checkout reserves inventory with `UPDATE ... WHERE stock >= quantity` in the order transaction. If any item cannot be reserved, the transaction fails rather than recording a partially reserved order. This database-side conditional update was chosen over a read-then-save stock change, which is vulnerable to concurrent requests.

### Search

Search uses PostgreSQL `unaccent` and `pg_trgm`, with GIN expression indexes on product name, description, SKU, and category. The query matches each non-empty search term against these fields and ranks results by name/SKU similarity. Elasticsearch was considered but would add a separate service and operational cost for this small application.

### Payment events

The API writes the order, stock reservation, and an outbox event in one database transaction. A scheduled publisher sends unpublished events to RabbitMQ and retries events it cannot publish. The listener processes only orders still in `PENDING`, marks payment `COMPLETED` or `FAILED`, and restores stock on failure. Payment is a simulation, not a real provider integration. The outbox addresses the database/message-broker dual-write gap, though delivery and crash-retry behavior still warrant real-broker integration testing before production use.

### CSV policy

OpenCSV reads the bundled sample at startup and saves valid rows individually. Duplicate SKUs are skipped; invalid rows are logged. This is adequate for the supplied seed file, not a high-volume import pipeline. A user-upload flow with a row-by-row import report is a known missing feature.

## Known limitations

- There are no user accounts or customer authentication. Admin product writes use one shared HTTP Basic account, and its frontend credentials are visible in the built bundle.
- CSV upload and its row-level results are not implemented.
- The frontend uses Create React App (`react-scripts`) and plain JavaScript/JSX. The API URL is currently fixed to `http://localhost:8080/api`.
- Automated tests include backend unit/controller tests, frontend component tests, and Selenium browser flows. The Selenium suite uses a mock API when it can start one; it is not a live-stack integration suite. There is no real PostgreSQL concurrency or RabbitMQ failure test coverage.
- The API Docker build skips tests (`mvn clean package -DskipTests`); run the test commands above separately.

## Sample CSV provenance

The challenge's `Code Challenge E-Commerce` example is stored as `Api/src/main/resources/products.csv`. The recorded download date is October 22, 2026; verify it against the original download record if precise provenance is required.
