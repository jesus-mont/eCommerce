const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class NavigationPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      appTitle: By.xpath("//nav//h3[contains(text(), 'E-Commerce App')]"),
      catalogBtn: By.xpath("//nav//button[contains(text(), 'Catalog & Shop')]"),
      adminBtn: By.xpath("//nav//button[contains(text(), 'Product Management')]"),
      purchasesBtn: By.xpath("//nav//button[contains(text(), 'Purchase History')]")
    };
  }

  async isLoaded() {
    return await this.isElementPresent(this.locators.appTitle);
  }

  async goToCatalog() {
    await this.click(this.locators.catalogBtn);
    await this.sleep(200);
  }

  async goToProductAdmin() {
    await this.click(this.locators.adminBtn);
    await this.sleep(200);
  }

  async goToPurchaseHistory() {
    await this.click(this.locators.purchasesBtn);
    await this.sleep(200);
  }
}

module.exports = NavigationPage;
