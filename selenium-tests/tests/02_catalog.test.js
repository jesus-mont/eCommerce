const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createDriver, quitDriver } = require('../utils/driverFactory');
const NavigationPage = require('../pages/NavigationPage');
const CatalogPage = require('../pages/CatalogPage');

describe('02 - Product Catalog & Shopping Cart Suite', () => {
  let driver;
  let nav;
  let catalog;

  before(async () => {
    driver = await createDriver();
    nav = new NavigationPage(driver);
    catalog = new CatalogPage(driver);
    await nav.navigate('/');
    await nav.goToCatalog();
  });

  after(async () => {
    await quitDriver(driver);
  });

  it('should display the product inventory table with items', async () => {
    await catalog.isLoaded();
    const count = await catalog.getProductCount();
    assert.ok(count > 0, `Expected products in catalog, found: ${count}`);
  });

  it('should filter products when searching by keyword', async () => {
    await catalog.searchProduct('Laptop');
    const count = await catalog.getProductCount();
    assert.strictEqual(count, 1, 'Search for Laptop should return 1 product');

    await catalog.searchProduct('');
    const fullCount = await catalog.getProductCount();
    assert.ok(fullCount > 1, 'Clearing search should restore catalog items');
  });

  it('should open and close the product details view', async () => {
    await catalog.clickProductDetails('Wireless Ergonomic Mouse');
    const isOpen = await catalog.isProductDetailsVisible();
    assert.strictEqual(isOpen, true, 'Product details card should open');

    await catalog.closeProductDetails();
    const isStillOpen = await catalog.isProductDetailsVisible();
    assert.strictEqual(isStillOpen, false, 'Product details card should close');
  });

  it('should verify Out of Stock button is disabled for items with zero stock', async () => {
    const isOut = await catalog.isOutOfStock('Stainless Steel Water Bottle');
    assert.strictEqual(isOut, true, 'Zero-stock item should show disabled Out of Stock button');
  });

  it('should add products to shopping cart and calculate total price', async () => {
    assert.strictEqual(await catalog.isCartEmpty(), true, 'Cart should initially be empty');

    await catalog.addToCart('Wireless Ergonomic Mouse');
    assert.strictEqual(await catalog.getCartItemCount(), 1, 'Cart should have 1 item');

    const total = await catalog.getCartTotal();
    assert.ok(total.includes('29.99'), `Total should reflect price of mouse, got: ${total}`);
  });

  it('should increment product quantity when added again', async () => {
    await catalog.addToCart('Wireless Ergonomic Mouse');
    const total = await catalog.getCartTotal();
    assert.ok(total.includes('59.98'), `Total should double for 2 units, got: ${total}`);
  });

  it('should remove product from shopping cart', async () => {
    await catalog.removeFromCart(0);
    assert.strictEqual(await catalog.isCartEmpty(), true, 'Cart should be empty after removing item');
  });

  it('should alert if checkout is attempted without email', async () => {
    await catalog.addToCart('Mechanical Keyboard RGB');
    await catalog.clickCheckout();

    const alertText = await catalog.handleAlert('accept');
    assert.ok(
      alertText.includes('Please enter your customer email'),
      `Expected email alert, got: ${alertText}`
    );
  });

  it('should complete checkout successfully when customer email is provided', async () => {
    await catalog.enterCustomerEmail('shopper@test.com');
    await catalog.clickCheckout();

    const confirmationAlert = await catalog.handleAlert('accept');
    assert.ok(
      confirmationAlert.includes('Order successfully created'),
      `Expected confirmation alert, got: ${confirmationAlert}`
    );

    await catalog.sleep(300);
    assert.strictEqual(await catalog.isCartEmpty(), true, 'Cart should be empty after checkout');
  });
});
