const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/testConfig');


async function createDriver(overrides = {}) {
  const isHeadless = overrides.headless !== undefined ? overrides.headless : config.headless;
  const options = new chrome.Options();

  if (isHeadless) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-infobars',
    `--window-size=${config.windowSize.width},${config.windowSize.height}`
  );

  const driver = await new Builder()
    .forBrowser(config.browser)
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: config.implicitWaitMs,
    pageLoad: 30000,
    script: 15000
  });

  return driver;
}

/**
 *
 * @param {import('selenium-webdriver').WebDriver} driver
 */
async function quitDriver(driver) {
  if (driver) {
    try {
      await driver.quit();
    } catch (err) {
    }
  }
}

module.exports = {
  createDriver,
  quitDriver
};
