// Simple CORS Proxy for Development Testing
// DO NOT USE IN PRODUCTION!

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all origins (dev only!)
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));

// Proxy all requests to WYNI backend
app.use('/api', createProxyMiddleware({
    target: 'https://hub.wyniai.com',
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying: ${req.method} ${req.url}`);
    }
}));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🔧 CORS Proxy running on http://localhost:${PORT}`);
    console.log(`Forward requests to: https://hub.wyniai.com`);
    console.log(`\n⚠️  This is for DEVELOPMENT ONLY!`);
});


