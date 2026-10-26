const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { createDriver, quitDriver } = require('../utils/driverFactory');
const NavigationPage = require('../pages/NavigationPage');
const ProductAdminPage = require('../pages/ProductAdminPage');

describe('03 - Product Administration Suite', () => {
  let driver;
  let nav;
  let admin;

  before(async () => {
    driver = await createDriver();
    nav = new NavigationPage(driver);
    admin = new ProductAdminPage(driver);
    await nav.navigate('/');
    await nav.goToProductAdmin();
  });

  after(async () => {
    await quitDriver(driver);
  });

  it('should render the administration view and product inventory', async () => {
    const isLoaded = await admin.isLoaded();
    assert.strictEqual(isLoaded, true, 'Product administration should load');
  });

  it('should create a new product with all fields', async () => {
    const newProduct = {
      name: 'Noise Cancelling Headphones',
      sku: 'SKU-HEADPHONES-99',
      price: '199.99',
      stock: '20',
      weightKg: '0.4',
      category: 'ELECTRONICS',
      description: 'Active noise cancelling wireless over-ear headphones'
    };

    await admin.fillForm(newProduct);
    await admin.submitForm();

    const msg = await admin.getMessageText();
    assert.ok(
      msg.includes('Product created successfully'),
      `Expected success message, got: ${msg}`
    );

    const isInTable = await admin.isProductInTable(newProduct.name);
    assert.strictEqual(isInTable, true, 'New product should appear in the inventory table');
  });

  it('should show error when creating product with duplicate SKU', async () => {
    const duplicateProduct = {
      name: 'Duplicate Headphones',
      sku: 'SKU-HEADPHONES-99',
      price: '150.00',
      stock: '5',
      weightKg: '0.4',
      category: 'ELECTRONICS'
    };

    await admin.fillForm(duplicateProduct);
    await admin.submitForm();

    const msg = await admin.getMessageText();
    assert.ok(
      msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('error'),
      `Expected duplicate SKU error message, got: ${msg}`
    );
  });

  it('should load product into form when clicking edit and update it', async () => {
    await admin.clickEdit('Noise Cancelling Headphones');
    const mode = await admin.getFormMode();
    assert.strictEqual(mode, 'Edit Product', 'Form header should switch to Edit Product');

    await admin.fillForm({ price: '179.99' });
    await admin.submitForm();

    const msg = await admin.getMessageText();
    assert.ok(
      msg.includes('Product updated successfully'),
      `Expected update success message, got: ${msg}`
    );
  });

  it('should cancel edit mode without saving changes', async () => {
    await admin.clickEdit('Gaming Laptop Pro');
    assert.strictEqual(await admin.getFormMode(), 'Edit Product');

    await admin.clickCancel();
    assert.strictEqual(await admin.getFormMode(), 'Create New Product');
  });

  it('should cancel product deletion when confirmation alert is dismissed', async () => {
    await admin.clickDelete('Noise Cancelling Headphones', false); 
    const isInTable = await admin.isProductInTable('Noise Cancelling Headphones');
    assert.strictEqual(isInTable, true, 'Product should remain in table when delete is cancelled');
  });

  it('should delete product when confirmation alert is accepted', async () => {
    await admin.clickDelete('Noise Cancelling Headphones', true);

    const msg = await admin.getMessageText();
    assert.ok(
      msg.includes('Product deleted successfully'),
      `Expected delete message, got: ${msg}`
    );

    const isInTable = await admin.isProductInTable('Noise Cancelling Headphones');
    assert.strictEqual(isInTable, false, 'Deleted product should no longer appear in table');
  });
});
