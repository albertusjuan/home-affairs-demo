// CORS Proxy for Development
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;
const TARGET = 'https://hub.wyniai.com';

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Proxy middleware
app.use('/', createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
        console.log(`→ ${req.method} ${req.path}`);
    },
    onProxyRes: (proxyRes) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));

app.listen(PORT, () => {
    console.log(`🔧 CORS Proxy: http://localhost:${PORT} → ${TARGET}`);
});

