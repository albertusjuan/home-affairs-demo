# Quick Start Guide

## The Problem
Browsers block requests from `localhost:8080` to `hub.wyniai.com` due to CORS policy.

## The Solution
We use a CORS proxy that runs on `localhost:3001` to forward requests to `hub.wyniai.com`.

## How to Run

### 1. Start CORS Proxy (Terminal 1)
```bash
cd "C:\Users\Albert\Documents\Wyni Technology\home-affairs-demo"
npm run proxy
```

### 2. Start Web Server (Terminal 2)
```bash
cd "C:\Users\Albert\Documents\Wyni Technology\home-affairs-demo"
python -m http.server 8080
```

### 3. Open Browser
Go to: **http://localhost:8080**

## Architecture

```
Browser (localhost:8080)
    ↓
CORS Proxy (localhost:3001)
    ↓
Backend API (hub.wyniai.com)
```

## Your Config

File: `config.local.js`
- API URL: `http://localhost:3001` (proxies to hub.wyniai.com)
- API Key: `dak-0947171a-ikCVLEzk40GUFqzEZVC4ZVuNYjevxSuH`

## Troubleshooting

**CORS Error?**
- Make sure CORS proxy is running on port 3001
- Check: `netstat -ano | findstr :3001`

**Port Already in Use?**
- Kill process: `Stop-Process -Id <PID> -Force`

**Nothing Happens?**
- Open F12 console and check for errors
- Verify both servers are running

