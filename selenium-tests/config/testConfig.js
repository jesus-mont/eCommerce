const path = require('path');

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiPort: parseInt(process.env.API_PORT || '8080', 10),
  uiPort: parseInt(process.env.UI_PORT || '3000', 10),
  headless: process.env.HEADLESS !== 'false',
  implicitWaitMs: 3000,
  explicitWaitTimeoutMs: 10000,
  pollIntervalMs: 250,
  browser: process.env.BROWSER || 'chrome',
  windowSize: { width: 1440, height: 900 },
  buildDir: path.resolve(__dirname, '../../ecommerce_ui/build')
};

module.exports = config;
