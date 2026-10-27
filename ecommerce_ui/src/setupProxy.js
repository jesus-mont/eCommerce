const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
    const username = process.env.APP_SECURITY_ADMIN_USERNAME || 'admin';
    const password = process.env.APP_SECURITY_ADMIN_PASSWORD || 'ecommerceApp';
    const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    app.use('/api', createProxyMiddleware({
        target: process.env.API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        onProxyReq(proxyReq, request) {
            const method = request.method.toUpperCase();
            const url = request.originalUrl || request.url;
            const isProductWrite = ['POST', 'PUT', 'DELETE'].includes(method)
                && /^\/api\/products(?:\/\d+)?\/?(?:\?|$)/.test(url);
            const isPurchaseHistoryRead = method === 'GET' && /^\/api\/purchases(?:\/|\?|$)/.test(url);
            if (isProductWrite || isPurchaseHistoryRead) {
                proxyReq.setHeader('Authorization', authorization);
            }
        },
    }));
};
