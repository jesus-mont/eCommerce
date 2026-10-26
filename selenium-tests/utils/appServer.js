const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('../config/testConfig');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};


class AppServer {
  constructor(port = config.uiPort, buildDir = config.buildDir) {
    this.port = port;
    this.buildDir = buildDir;
    this.server = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        let filePath = path.join(this.buildDir, req.url.split('?')[0]);

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            filePath = path.join(this.buildDir, 'index.html');
          }

          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';

          fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
              res.writeHead(500);
              return res.end('Error loading ' + filePath);
            }
            res.writeHead(200, {
              'Content-Type': contentType,
              'Cache-Control': 'no-cache'
            });
            res.end(content);
          });
        });
      });

      this.server.on('error', reject);
      this.server.listen(this.port, () => {
        resolve(`http://localhost:${this.port}`);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}

module.exports = AppServer;
