const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createDriver, quitDriver } = require('../utils/driverFactory');
const NavigationPage = require('../pages/NavigationPage');
const CatalogPage = require('../pages/CatalogPage');
const ProductAdminPage = require('../pages/ProductAdminPage');
const PurchaseHistoryPage = require('../pages/PurchaseHistoryPage');

describe('05 - End-to-End Business Flow Suite', () => {
  let driver;
  let nav;
  let catalog;
  let admin;
  let history;

  const testProduct = {
    name: 'Smart 4K Action Camera',
    sku: 'SKU-CAMERA-E2E',
    price: '250.00',
    stock: '3',
    weightKg: '0.25',
    category: 'ELECTRONICS',
    description: 'Waterproof 4K ultra-HD action camera with Wi-Fi'
  };

  const customerEmail = 'sarah.connor@cyberdyne.org';

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

  it('Step 1: Admin creates a new product with stock = 3', async () => {
    await nav.goToProductAdmin();
    await admin.fillForm(testProduct);
    await admin.submitForm();

    const msg = await admin.getMessageText();
    assert.ok(msg.includes('Product created successfully'));

    const isInTable = await admin.isProductInTable(testProduct.name);
    assert.strictEqual(isInTable, true, 'Product should appear in admin table');
  });

  it('Step 2: Customer finds product in catalog and adds 2 units to cart', async () => {
    await nav.goToCatalog();
    await catalog.searchProduct(testProduct.name);

    const count = await catalog.getProductCount();
    assert.strictEqual(count, 1, 'Should find the newly created camera');

    await catalog.clickProductDetails(testProduct.name);
    assert.strictEqual(await catalog.isProductDetailsVisible(), true);
    await catalog.closeProductDetails();

    await catalog.addToCart(testProduct.name);
    await catalog.addToCart(testProduct.name);

    const total = await catalog.getCartTotal();
    assert.ok(total.includes('500.00'), `Expected total $500.00 for 2 cameras, got: ${total}`);
  });

  it('Step 3: Customer executes checkout and verifies confirmation', async () => {
    await catalog.enterCustomerEmail(customerEmail);
    await catalog.clickCheckout();

    const alertText = await catalog.handleAlert('accept');
    assert.ok(
      alertText.includes('Order successfully created'),
      `Expected order creation alert, got: ${alertText}`
    );

    assert.strictEqual(await catalog.isCartEmpty(), true, 'Cart should be empty after purchase');
  });

  it('Step 4: Customer checks Purchase History for the new order', async () => {
    await nav.goToPurchaseHistory();
    await history.clickDetailsForEmail(customerEmail);

    const details = await history.getDetailsText();
    assert.ok(details.includes(customerEmail), 'Order details must show customer email');
    assert.ok(details.includes('500.00'), 'Order details must show total $500.00');
    assert.ok(details.includes(testProduct.sku), 'Order items must show camera SKU');
    assert.ok(details.includes('Quantity: 2'), 'Order items must show Quantity: 2');

    await history.closeDetails();
  });

  it('Step 5: Admin verifies product inventory stock decremented from 3 to 1', async () => {
    await nav.goToProductAdmin();
    await admin.searchProduct(testProduct.name);

    await admin.clickEdit(testProduct.name);
    const stockVal = await admin.driver.findElement(admin.locators.stockInput).getAttribute('value');
    assert.strictEqual(stockVal, '1', `Expected stock to be 1 after purchasing 2 out of 3 units, got: ${stockVal}`);

    await admin.clickCancel();
  });
});
