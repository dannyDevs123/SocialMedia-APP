const { createProxyMiddleware } = require('http-proxy-middleware');

// Create React App dev proxy — avoids CORS during local development.
// Equivalent to Vite's server.proxy config.
module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_PROXY_TARGET || 'http://localhost:5000';

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );

  app.use(
    '/uploads',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
