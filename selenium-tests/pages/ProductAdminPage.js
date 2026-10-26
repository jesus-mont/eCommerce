const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');


class ProductAdminPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      title: By.xpath("//h2[contains(text(), 'Product Administration')]"),
      formTitle: By.xpath("//form/h3"),
      nameInput: By.css('input[name="name"]'),
      skuInput: By.css('input[name="sku"]'),
      priceInput: By.css('input[name="price"]'),
      stockInput: By.css('input[name="stock"]'),
      weightInput: By.css('input[name="weightKg"]'),
      categorySelect: By.css('select[name="category"]'),
      descriptionTextarea: By.css('textarea[name="description"]'),
      submitBtn: By.xpath("//form//button[@type='submit']"),
      cancelBtn: By.xpath("//form//button[text()='Cancel']"),
      messageBanner: By.xpath("//div[contains(@style, 'padding: 10px') and contains(@style, 'margin-bottom: 20px')]"),
      searchInput: By.xpath("//input[@placeholder='Search by name or SKU...']"),
      productRows: By.xpath("//table/tbody/tr"),
      noProductsMsg: By.xpath("//td[contains(text(), 'No products found in the database.')]")
    };
  }

  async isLoaded() {
    await this.waitForVisible(this.locators.title);
    return true;
  }

  async fillForm({ name, sku, price, stock, weightKg, category, description }) {
    if (name !== undefined) await this.clearAndType(this.locators.nameInput, name);
    if (sku !== undefined) await this.clearAndType(this.locators.skuInput, sku);
    if (price !== undefined) await this.clearAndType(this.locators.priceInput, String(price));
    if (stock !== undefined) await this.clearAndType(this.locators.stockInput, String(stock));
    if (weightKg !== undefined) await this.clearAndType(this.locators.weightInput, String(weightKg));

    if (category) {
      const selectElem = await this.waitForElement(this.locators.categorySelect);
      await this.driver.executeScript((el, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, selectElem, category);
      await this.sleep(150);
    }

    if (description !== undefined) {
      await this.clearAndType(this.locators.descriptionTextarea, description);
    }
  }

  async submitForm() {
    await this.click(this.locators.submitBtn);
    await this.sleep(500); // Wait for response & refresh
  }

  async clickCancel() {
    await this.click(this.locators.cancelBtn);
    await this.sleep(200);
  }

  async getMessageText() {
    await this.waitForVisible(this.locators.messageBanner);
    return await this.getText(this.locators.messageBanner);
  }

  async clickEdit(productName) {
    const editBtn = By.xpath(`//table//tr[.//span[contains(text(), '${productName}')]]//button[text()='Edit']`);
    await this.click(editBtn);
    await this.sleep(200);
  }

  async clickDelete(productName, confirm = true) {
    const deleteBtn = By.xpath(`//table//tr[.//span[contains(text(), '${productName}')]]//button[text()='Delete']`);
    await this.click(deleteBtn);
    await this.handleAlert(confirm ? 'accept' : 'dismiss');
    await this.sleep(500);
  }

  async searchProduct(keyword) {
    await this.clearAndType(this.locators.searchInput, keyword);
    await this.sleep(500);
  }

  async isProductInTable(productName) {
    const row = By.xpath(`//table//tr[.//span[contains(text(), '${productName}')]]`);
    return await this.isElementPresent(row);
  }

  async getFormMode() {
    return await this.getText(this.locators.formTitle);
  }
}

module.exports = ProductAdminPage;
