const { spawn } = require('child_process');
const http = require('http');
const MockApiServer = require('./utils/mockApiServer');
const AppServer = require('./utils/appServer');
const config = require('./config/testConfig');

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port, method: 'HEAD', timeout: 1000 }, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function main() {
  console.log('====================================================');
  console.log('       Starting Selenium Automation Test Suite       ');
  console.log('====================================================');

  let mockApi = null;
  let appServer = null;

  try {
    const isApiRunning = await isPortOpen(config.apiPort);
    if (isApiRunning) {
      console.log(`[Services] Detected running API service on port ${config.apiPort}`);
    } else {
      console.log(`[Services] Starting Mock API Server on port ${config.apiPort}...`);
      mockApi = new MockApiServer(config.apiPort);
      await mockApi.start();
      console.log(`[Services] Mock API Server running at http://localhost:${config.apiPort}`);
    }

    const isUiRunning = await isPortOpen(config.uiPort);
    if (isUiRunning) {
      console.log(`[Services] Detected running UI service on port ${config.uiPort}`);
    } else {
      console.log(`[Services] Starting UI Static Server on port ${config.uiPort}...`);
      appServer = new AppServer(config.uiPort, config.buildDir);
      await appServer.start();
      console.log(`[Services] UI Server running at http://localhost:${config.uiPort}`);
    }

    console.log(`[Browser] Running Chrome in ${config.headless ? 'HEADLESS' : 'HEADED'} mode.`);
    console.log('----------------------------------------------------');

    const testArgs = [
      '--test',
      'tests/01_navigation.test.js',
      'tests/02_catalog.test.js',
      'tests/03_productAdmin.test.js',
      'tests/04_purchaseHistory.test.js',
      'tests/05_endToEndFlow.test.js'
    ];

    const child = spawn(process.execPath, testArgs, {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: `http://localhost:${config.uiPort}` }
    });

    child.on('close', async (code) => {
      console.log('----------------------------------------------------');
      console.log(`[Suite] Tests finished with exit code: ${code}`);

      if (mockApi) {
        console.log('[Services] Stopping Mock API Server...');
        await mockApi.stop();
      }
      if (appServer) {
        console.log('[Services] Stopping UI Server...');
        await appServer.stop();
      }
      console.log('====================================================');
      process.exit(code);
    });

  } catch (err) {
    console.error('[Error] Setup error:', err);
    if (mockApi) await mockApi.stop();
    if (appServer) await appServer.stop();
    process.exit(1);
  }
}

main();
