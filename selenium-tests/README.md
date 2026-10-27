# E-Commerce Selenium Automation Test Suite

Comprehensive End-to-End (E2E) automation test suite for the **Enterprise E-Commerce Platform**, built using **Selenium WebDriver** and the **Page Object Model (POM)** pattern.

---

## 🏗️ Architecture & Design Pattern

The test framework is architected using the industry-standard **Page Object Model (POM)** to separate test assertions from UI locators and DOM interactions:

```
selenium-tests/
├── config/
│   └── testConfig.js           # Environment configurations (ports, timeouts, headless flag)
├── utils/
│   ├── driverFactory.js        # Selenium WebDriver builder with optimized ChromeOptions
│   ├── mockApiServer.js        # Built-in Node.js mock API for standalone execution
│   └── appServer.js            # Built-in HTTP static server for React production build
├── pages/
│   ├── BasePage.js             # Common browser actions, explicit waits & alert handlers
│   ├── NavigationPage.js       # Top navigation bar & view switching
│   ├── CatalogPage.js          # Product Catalog, search bar, details card & cart checkout
│   ├── ProductAdminPage.js     # Product Administration, creation/edit form & inventory table
│   └── PurchaseHistoryPage.js  # Purchase orders table & detailed view panel
├── tests/
│   ├── 01_navigation.test.js       # Navigation across all application views
│   ├── 02_catalog.test.js          # Product search, details view, cart & checkout flow
│   ├── 03_productAdmin.test.js     # Full CRUD: create, duplicate SKU check, edit, delete
│   ├── 04_purchaseHistory.test.js  # Order inspection, details modal, status & item list
│   └── 05_endToEndFlow.test.js     # Complete multi-module business process flow
├── run-tests.js                # Test runner orchestrating services & test execution
└── package.json
```

---

## 🧪 Test Suites Overview

| Suite | File | Tests | Description |
| :--- | :--- | :---: | :--- |
| **01 - Navigation** | `01_navigation.test.js` | 4 | Verifies default views, active view highlights, and switching between Catalog, Admin, and History. |
| **02 - Product Catalog** | `02_catalog.test.js` | 9 | Tests inventory loading, real-time search filtering, details card, stock limit enforcement, cart calculations, missing email alert, and checkout. |
| **03 - Product Admin** | `03_productAdmin.test.js` | 7 | Verifies product creation, duplicate SKU validation, editing existing items, canceling edits, and alert-based delete confirmation. |
| **04 - Purchase History** | `04_purchaseHistory.test.js` | 3 | Verifies order listing, opening detailed item breakdown (SKU, price, quantity), and closing the panel. |
| **05 - End-to-End Flow** | `05_endToEndFlow.test.js` | 5 | Multi-module E2E scenario: Admin creates stock -> Customer finds & buys 2 units -> Order created & verified in History -> Admin verifies stock decremented. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Google Chrome** (Selenium Manager automatically manages the matching ChromeDriver)

### Installation
Build the frontend first so the runner can serve its static files when no UI is already running. From the repository root:
```bash
cd ecommerce_ui
npm install
npm run build

cd ../selenium-tests
npm install
```

### Running Tests
Execute all suites in headless mode (default for CI/CD):
```bash
npm test
```

Execute in headed mode (opens a visible Chrome browser window):
```bash
npm run test:headed
```

---

## ⚙️ Environment Variables

The runner checks ports `3000` (UI) and `8080` (API). If a service is already listening, it reuses it; otherwise, it serves the frontend build and starts a built-in Node.js mock API. The tests expect the mock API fixture data, so stop other services on those ports before running the suite. A frontend build is required when the runner needs to start its own UI server.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `BASE_URL` | `http://localhost:3000` | Target URL for the React frontend application |
| `API_PORT` | `8080` | Port for the backend API |
| `UI_PORT` | `3000` | Port for the frontend UI static server |
| `HEADLESS` | `true` | Set to `false` to see Chrome UI during test execution |
| `BROWSER` | `chrome` | Browser engine (Chrome) |
