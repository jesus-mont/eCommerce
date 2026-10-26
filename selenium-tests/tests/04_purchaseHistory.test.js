const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createDriver, quitDriver } = require('../utils/driverFactory');
const NavigationPage = require('../pages/NavigationPage');
const PurchaseHistoryPage = require('../pages/PurchaseHistoryPage');

describe('04 - Purchase History Suite', () => {
  let driver;
  let nav;
  let history;

  before(async () => {
    driver = await createDriver();
    nav = new NavigationPage(driver);
    history = new PurchaseHistoryPage(driver);
    await nav.navigate('/');
    await nav.goToPurchaseHistory();
  });

  after(async () => {
    await quitDriver(driver);
  });

  it('should render purchase history table with orders', async () => {
    const isLoaded = await history.isLoaded();
    assert.strictEqual(isLoaded, true, 'Purchase History view should load');

    const count = await history.getPurchaseRowCount();
    assert.ok(count > 0, `Expected orders in history table, found: ${count}`);
  });

  it('should view details for a specific purchase order', async () => {
    await history.clickDetailsForEmail('alex.smith@example.com');
    const isOpen = await history.isDetailsPanelOpen();
    assert.strictEqual(isOpen, true, 'Order details panel should be visible');

    const details = await history.getDetailsText();
    assert.ok(details.includes('alex.smith@example.com'), 'Details should show customer email');
    assert.ok(details.includes('COMPLETED'), 'Details should show COMPLETED status');
    assert.ok(details.includes('SKU-LAPTOP-01'), 'Details should list purchased SKU item');
  });

  it('should close the purchase details panel', async () => {
    await history.closeDetails();
    const isOpen = await history.isDetailsPanelOpen();
    assert.strictEqual(isOpen, false, 'Order details panel should be closed');
  });
});
