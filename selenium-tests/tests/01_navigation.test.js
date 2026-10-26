const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createDriver, quitDriver } = require('../utils/driverFactory');
const NavigationPage = require('../pages/NavigationPage');
const CatalogPage = require('../pages/CatalogPage');
const ProductAdminPage = require('../pages/ProductAdminPage');
const PurchaseHistoryPage = require('../pages/PurchaseHistoryPage');

describe('01 - Navigation Suite', () => {
  let driver;
  let nav;
  let catalog;
  let admin;
  let history;

  before(async () => {
    driver = await createDriver();
    nav = new NavigationPage(driver);
    catalog = new CatalogPage(driver);
    admin = new ProductAdminPage(driver);
    history = new PurchaseHistoryPage(driver);
    await nav.navigate('/');
  });

  after(async () => {
    await quitDriver(driver);
  });

  it('should load application and default to Catalog & Shop view', async () => {
    const isNavLoaded = await nav.isLoaded();
    assert.strictEqual(isNavLoaded, true, 'Navigation bar should be visible');

    const isCatalogLoaded = await catalog.isLoaded();
    assert.strictEqual(isCatalogLoaded, true, 'Catalog view should be active by default');
  });

  it('should navigate to Product Management view', async () => {
    await nav.goToProductAdmin();
    const isAdminLoaded = await admin.isLoaded();
    assert.strictEqual(isAdminLoaded, true, 'Product Admin view should load');
  });

  it('should navigate to Purchase History view', async () => {
    await nav.goToPurchaseHistory();
    const isHistoryLoaded = await history.isLoaded();
    assert.strictEqual(isHistoryLoaded, true, 'Purchase History view should load');
  });

  it('should navigate back to Catalog & Shop view', async () => {
    await nav.goToCatalog();
    const isCatalogLoaded = await catalog.isLoaded();
    assert.strictEqual(isCatalogLoaded, true, 'Catalog view should load again');
  });
});
