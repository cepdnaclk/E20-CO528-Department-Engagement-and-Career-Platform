const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: '*', credentials: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Proxy configuration — each service handles its own /api/* prefix
const services = [
  { path: '/api/auth', target: 'http://localhost:5001' },
  { path: '/api/feed', target: 'http://localhost:5002' },
  { path: '/api/jobs', target: 'http://localhost:5003' },
  { path: '/api/events', target: 'http://localhost:5004' },
  { path: '/api/research', target: 'http://localhost:5005' },
  { path: '/api/messages', target: 'http://localhost:5006' },
  { path: '/api/notifications', target: 'http://localhost:5007' },
  { path: '/api/analytics', target: 'http://localhost:5008' },
];

services.forEach((svc) => {
  app.use(svc.path, createProxyMiddleware({
    target: svc.target,
    changeOrigin: true,
    // Do NOT rewrite — let the downstream service see the full /api/* path
    pathRewrite: undefined,
  }));
});

// WebSocket proxy for socket.io
app.use('/socket.io', createProxyMiddleware({
  target: 'http://localhost:5006',
  changeOrigin: true,
  ws: true
}));

app.get('/health', (req, res) => res.json({ status: 'API Gateway running' }));

const PORT = 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));

