const http = require('http');
const url = require('url');

class MockApiServer {
  constructor(port = 8080) {
    this.port = port;
    this.server = null;
    this.resetData();
  }

  resetData() {
    this.products = [
      {
        id: 1,
        name: 'Gaming Laptop Pro',
        sku: 'SKU-LAPTOP-01',
        category: 'ELECTRONICS',
        description: 'High performance gaming laptop 16GB RAM',
        price: 1299.99,
        stock: 5,
        weightKg: 2.3
      },
      {
        id: 2,
        name: 'Wireless Ergonomic Mouse',
        sku: 'SKU-MOUSE-02',
        category: 'ELECTRONICS',
        description: '2.4Ghz optical wireless mouse',
        price: 29.99,
        stock: 25,
        weightKg: 0.15
      },
      {
        id: 3,
        name: 'Mechanical Keyboard RGB',
        sku: 'SKU-KB-03',
        category: 'ELECTRONICS',
        description: 'Blue switches mechanical tactile keyboard',
        price: 79.99,
        stock: 12,
        weightKg: 0.95
      },
      {
        id: 4,
        name: 'Organic Cotton T-Shirt',
        sku: 'SKU-SHIRT-04',
        category: 'CLOTHING',
        description: '100% organic cotton casual crewneck',
        price: 19.99,
        stock: 50,
        weightKg: 0.2
      },
      {
        id: 5,
        name: 'Running Shoes Boost',
        sku: 'SKU-SHOE-05',
        category: 'FOOTWEAR',
        description: 'Lightweight cushioned marathon running shoes',
        price: 110.00,
        stock: 8,
        weightKg: 0.7
      },
      {
        id: 6,
        name: 'Stainless Steel Water Bottle',
        sku: 'SKU-BOTTLE-06',
        category: 'SPORTS',
        description: 'Insulated 750ml thermal water flask',
        price: 24.50,
        stock: 0,  
        weightKg: 0.35
      }
    ];

    this.purchases = [
      {
        id: 101,
        customerEmail: 'alex.smith@example.com',
        status: 'COMPLETED',
        totalAmount: '1329.98',
        createdAt: '2026-10-21T14:30:00Z',
        items: [
          { sku: 'SKU-LAPTOP-01', quantity: 1, price: '1299.99' },
          { sku: 'SKU-MOUSE-02', quantity: 1, price: '29.99' }
        ]
      },
      {
        id: 102,
        customerEmail: 'maria.garcia@example.com',
        status: 'COMPLETED',
        totalAmount: '79.99',
        createdAt: '2026-10-22T09:15:00Z',
        items: [
          { sku: 'SKU-KB-03', quantity: 1, price: '79.99' }
        ]
      }
    ];

    this.nextProductId = 7;
    this.nextPurchaseId = 103;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
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

  sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
  }

  async parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        if (!body) return resolve({});
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });
  }

  async handleRequest(req, res) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      return res.end();
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    const method = req.method;

    try {
      if (method === 'GET' && pathname === '/api/products/search') {
        const q = (query.q || '').toLowerCase().trim();
        const page = parseInt(query.page || '0', 10);
        const size = parseInt(query.size || '20', 10);

        const filtered = this.products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
        );

        const start = page * size;
        const paged = filtered.slice(start, start + size);

        return this.sendJson(res, 200, {
          content: paged,
          totalPages: Math.ceil(filtered.length / size) || 1,
          totalElements: filtered.length,
          number: page,
          size
        });
      }

      const productDetailMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (method === 'GET' && productDetailMatch) {
        const id = parseInt(productDetailMatch[1], 10);
        const prod = this.products.find(p => p.id === id);
        if (!prod) {
          return this.sendJson(res, 404, { message: `Product not found with id ${id}` });
        }
        return this.sendJson(res, 200, prod);
      }

      if (method === 'PUT' && productDetailMatch) {
        const id = parseInt(productDetailMatch[1], 10);
        const body = await this.parseBody(req);
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
          return this.sendJson(res, 404, { message: `Product not found with id ${id}` });
        }

        const updated = {
          ...this.products[index],
          ...body,
          id,
          price: parseFloat(body.price),
          stock: parseInt(body.stock, 10),
          weightKg: parseFloat(body.weightKg)
        };
        this.products[index] = updated;
        return this.sendJson(res, 200, updated);
      }

      if (method === 'DELETE' && productDetailMatch) {
        const id = parseInt(productDetailMatch[1], 10);
        const initialLen = this.products.length;
        this.products = this.products.filter(p => p.id !== id);
        if (this.products.length === initialLen) {
          return this.sendJson(res, 404, { message: `Product not found with id ${id}` });
        }
        return this.sendJson(res, 200, { message: 'Product deleted successfully' });
      }

      if (method === 'GET' && pathname === '/api/products') {
        const page = parseInt(query.page || '0', 10);
        const size = parseInt(query.size || '20', 10);
        const start = page * size;
        const paged = this.products.slice(start, start + size);

        return this.sendJson(res, 200, {
          content: paged,
          totalPages: Math.ceil(this.products.length / size) || 1,
          totalElements: this.products.length,
          number: page,
          size
        });
      }

      if (method === 'POST' && pathname === '/api/products') {
        const body = await this.parseBody(req);
        if (!body.name || !body.sku) {
          return this.sendJson(res, 400, { message: 'Name and SKU are required' });
        }

        const existing = this.products.find(p => p.sku.toLowerCase() === body.sku.toLowerCase());
        if (existing) {
          return this.sendJson(res, 400, { message: `Product with SKU ${body.sku} already exists` });
        }

        const newProduct = {
          id: this.nextProductId++,
          name: body.name,
          sku: body.sku,
          category: body.category || '',
          description: body.description || '',
          price: parseFloat(body.price || '0'),
          stock: parseInt(body.stock || '0', 10),
          weightKg: parseFloat(body.weightKg || '0')
        };
        this.products.unshift(newProduct);
        return this.sendJson(res, 201, newProduct);
      }

      const purchaseDetailMatch = pathname.match(/^\/api\/purchases\/(\d+)$/);
      if (method === 'GET' && purchaseDetailMatch) {
        const id = parseInt(purchaseDetailMatch[1], 10);
        const purchase = this.purchases.find(p => p.id === id);
        if (!purchase) {
          return this.sendJson(res, 404, { message: `Purchase order not found with id ${id}` });
        }
        return this.sendJson(res, 200, purchase);
      }

      if (method === 'GET' && pathname === '/api/purchases') {
        const page = parseInt(query.page || '0', 10);
        const size = parseInt(query.size || '20', 10);
        const start = page * size;
        const paged = this.purchases.slice(start, start + size);

        return this.sendJson(res, 200, {
          content: paged,
          totalPages: Math.ceil(this.purchases.length / size) || 1,
          totalElements: this.purchases.length,
          number: page,
          size
        });
      }

      if (method === 'POST' && pathname === '/api/purchases') {
        const body = await this.parseBody(req);
        if (!body.customerEmail || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return this.sendJson(res, 400, { message: 'Invalid order payload' });
        }

        let total = 0;
        const orderItems = [];

        for (const item of body.items) {
          const product = this.products.find(p => p.id === item.productId);
          if (!product) {
            return this.sendJson(res, 400, { message: `Product ${item.productId} not found` });
          }
          if (product.stock < item.quantity) {
            return this.sendJson(res, 400, { message: `Insufficient stock for product ${product.name}` });
          }
          product.stock -= item.quantity;
          total += product.price * item.quantity;
          orderItems.push({
            sku: product.sku,
            quantity: item.quantity,
            price: product.price.toFixed(2)
          });
        }

        const newOrder = {
          id: this.nextPurchaseId++,
          customerEmail: body.customerEmail,
          status: 'COMPLETED',
          totalAmount: total.toFixed(2),
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          items: orderItems
        };

        this.purchases.unshift(newOrder);
        return this.sendJson(res, 201, newOrder);
      }

      return this.sendJson(res, 404, { message: `Endpoint not found: ${method} ${pathname}` });
    } catch (err) {
      console.error('Mock server error:', err);
      return this.sendJson(res, 500, { message: err.message });
    }
  }
}

module.exports = MockApiServer;
