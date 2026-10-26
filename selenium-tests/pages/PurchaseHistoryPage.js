const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');


class PurchaseHistoryPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.locators = {
      title: By.xpath("//h2[contains(text(), 'Purchase History')]"),
      purchaseRows: By.xpath("//table/tbody/tr"),
      noPurchasesMsg: By.xpath("//td[contains(text(), 'No purchases found.')]"),
      detailsPlaceholder: By.xpath("//p[contains(text(), 'Select a purchase to view its details.')]"),
      detailsPanel: By.xpath("//h3[contains(text(), 'Purchase Details')]/.."),
      detailCloseBtn: By.xpath("//button[contains(text(), 'Close Details')]"),
      detailItems: By.xpath("//h3[contains(text(), 'Purchase Details')]/..//ul/li")
    };
  }

  async isLoaded() {
    await this.waitForVisible(this.locators.title);
    return true;
  }

  async getPurchaseRowCount() {
    const rows = await this.driver.findElements(this.locators.purchaseRows);
    if (rows.length === 1) {
      const text = await rows[0].getText();
      if (text.includes('No purchases found')) return 0;
    }
    return rows.length;
  }

  async clickDetailsForEmail(email) {
    const viewBtn = By.xpath(
      `//table//tr[.//td[contains(text(), '${email}')]]//button[contains(text(), 'View Details')]`
    );
    await this.click(viewBtn);
    await this.sleep(300);
  }

  async isDetailsPanelOpen() {
    return await this.isElementPresent(this.locators.detailCloseBtn);
  }

  async closeDetails() {
    await this.click(this.locators.detailCloseBtn);
    await this.sleep(200);
  }

  async getDetailsText() {
    return await this.getText(this.locators.detailsPanel);
  }
}

module.exports = PurchaseHistoryPage;
