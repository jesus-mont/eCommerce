const { By, until, Key } = require('selenium-webdriver');
const config = require('../config/testConfig');


class BasePage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.explicitWaitTimeoutMs;
  }

  /**
   * @param {string} [path='']
   */
  async navigate(path = '') {
    const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
    await this.driver.get(url);
  }

  /**

   * @param {import('selenium-webdriver').Locator} locator
   * @param {number} [timeout]
   * @returns {Promise<import('selenium-webdriver').WebElement>}
   */
  async waitForElement(locator, timeout = this.timeout) {
    return await this.driver.wait(until.elementLocated(locator), timeout, `Element not found: ${locator}`);
  }

  /**
   * @param {import('selenium-webdriver').Locator} locator
   * @param {number} [timeout]
   * @returns {Promise<import('selenium-webdriver').WebElement>}
   */
  async waitForVisible(locator, timeout = this.timeout) {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${locator}`);
    return element;
  }

  /**
   * @param {import('selenium-webdriver').Locator} locator
   */
  async click(locator) {
    const element = await this.waitForVisible(locator);
    await element.click();
  }

  /**
   * @param {import('selenium-webdriver').Locator} locator
   * @param {string} text
   */
  async type(locator, text) {
    const element = await this.waitForVisible(locator);
    await element.sendKeys(text);
  }

  /**
   * @param {import('selenium-webdriver').Locator} locator
   * @param {string} text
   */
  async clearAndType(locator, text) {
    const element = await this.waitForVisible(locator);
    await this.driver.executeScript((el) => {
      const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) {
        desc.set.call(el, '');
      } else {
        el.value = '';
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, element);

    if (text) {
      await element.sendKeys(text);
    }
  }

  /**
   * @param {import('selenium-webdriver').Locator} locator
   * @returns {Promise<string>}
   */
  async getText(locator) {
    const element = await this.waitForVisible(locator);
    return (await element.getText()).trim();
  }

  /**
   * @param {import('selenium-webdriver').Locator} locator
   * @returns {Promise<boolean>}
   */
  async isElementPresent(locator) {
    const elements = await this.driver.findElements(locator);
    return elements.length > 0;
  }

  /**
   * @param {'accept'|'dismiss'} [action='accept']
   * @returns {Promise<string>} The alert text.
   */
  async handleAlert(action = 'accept') {
    await this.driver.wait(until.alertIsPresent(), 5000, 'Alert did not appear');
    const alert = await this.driver.switchTo().alert();
    const alertText = await alert.getText();
    if (action === 'dismiss') {
      await alert.dismiss();
    } else {
      await alert.accept();
    }
    return alertText;
  }

  /**
   * @param {number} ms
   */
  async sleep(ms) {
    await new Promise(res => setTimeout(res, ms));
  }
}

module.exports = BasePage;
