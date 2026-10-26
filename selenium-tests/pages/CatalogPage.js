const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');


class CatalogPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      title: By.xpath("//h2[contains(text(), 'Product Catalog')]"),
      searchInput: By.xpath("//input[@placeholder='Search by name or SKU...']"),
      productRows: By.xpath("//table/tbody/tr"),
      noProductsMsg: By.xpath("//td[contains(text(), 'No products found.')]"),
      detailsContainer: By.xpath("//div[.//h3[contains(text(), 'Product Details:')]]"),
      detailsCloseBtn: By.xpath("//div[.//h3[contains(text(), 'Product Details:')]]//button[text()='Close']"),
      cartContainer: By.xpath("//h3[contains(text(), 'Shopping Cart')]/.."),
      cartEmptyMsg: By.xpath("//p[contains(text(), 'Your cart is empty.')]"),
      cartItems: By.xpath("//h3[contains(text(), 'Shopping Cart')]/..//ul/li"),
      customerEmailInput: By.xpath("//input[@type='email']"),
      cartTotal: By.xpath("//h4[contains(text(), 'Total:')]"),
      checkoutBtn: By.xpath("//button[contains(text(), 'Proceed to Checkout')]")
    };
  }

  async isLoaded() {
    await this.waitForVisible(this.locators.title);
    return true;
  }

  async searchProduct(keyword) {
    await this.clearAndType(this.locators.searchInput, keyword);
    await this.sleep(500); // Allow debounce / network fetch
  }

  async getProductCount() {
    const rows = await this.driver.findElements(this.locators.productRows);
    if (rows.length === 1) {
      const text = await rows[0].getText();
      if (text.includes('No products found')) return 0;
    }
    return rows.length;
  }

  async clickProductDetails(productName) {
    const nameLink = By.xpath(`//table//span[contains(text(), '${productName}')]`);
    await this.click(nameLink);
    await this.waitForVisible(this.locators.detailsContainer);
  }

  async isProductDetailsVisible() {
    return await this.isElementPresent(this.locators.detailsContainer);
  }

  async closeProductDetails() {
    await this.click(this.locators.detailsCloseBtn);
    await this.sleep(300);
  }

  async addToCart(productName) {
    const addBtn = By.xpath(
      `//table//tr[.//span[contains(text(), '${productName}')]]//button[contains(text(), 'Add to Cart')]`
    );
    await this.click(addBtn);
    await this.sleep(200);
  }

  async isOutOfStock(productName) {
    const outOfStockBtn = By.xpath(
      `//table//tr[.//span[contains(text(), '${productName}')]]//button[contains(text(), 'Out of Stock')]`
    );
    return await this.isElementPresent(outOfStockBtn);
  }

  async getCartItemCount() {
    const items = await this.driver.findElements(this.locators.cartItems);
    return items.length;
  }

  async getCartTotal() {
    return await this.getText(this.locators.cartTotal);
  }

  async enterCustomerEmail(email) {
    await this.clearAndType(this.locators.customerEmailInput, email);
  }

  async clickCheckout() {
    await this.click(this.locators.checkoutBtn);
  }

  async removeFromCart(index = 0) {
    const removeButtons = await this.driver.findElements(By.xpath("//h3[contains(text(), 'Shopping Cart')]/..//button[text()='Remove']"));
    if (removeButtons[index]) {
      await removeButtons[index].click();
      await this.sleep(200);
    }
  }

  async isCartEmpty() {
    return await this.isElementPresent(this.locators.cartEmptyMsg);
  }
}

module.exports = CatalogPage;
