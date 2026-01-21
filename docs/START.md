# Hong Kong Home Affairs AI Assistant - Quick Start Guide

## Overview

A specialized AI chatbot interface for Hong Kong Home Affairs inquiries. The system provides high-accuracy information strictly from official government domains (had.gov.hk and hyab.gov.hk).

---

## Prerequisites

1. **Node.js** - For running the CORS proxy
2. **Python 3** - For running the development web server
3. **WYNI Developer API Key** - Required for backend access
4. **Modern Browser** - Chrome, Firefox, Safari, or Edge

---

## Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
cd "home-affairs-demo"
npm install
```

### Step 2: Configure API Key

Create `config.local.js` in the project root:

```javascript
const LOCAL_CONFIG = {
    API_KEY: 'your-developer-api-key-here',
    API_BASE_URL: 'http://localhost:3001'
};

window.LOCAL_CONFIG = LOCAL_CONFIG;
```

**⚠️ IMPORTANT**: Never commit `config.local.js` - it contains your API key!

### Step 3: Start CORS Proxy

```bash
npm run proxy
```

This starts the proxy on `http://localhost:3001`

### Step 4: Start Web Server

In a new terminal:

```bash
python -m http.server 8080
```

### Step 5: Open Browser

Navigate to: **http://localhost:8080**

---

## Usage

1. **First Time**: The interface loads with your API key pre-configured
2. **Ask Questions**: Type questions about Hong Kong Home Affairs services
3. **View Citations**: Official sources appear in the drawer at the bottom
4. **Multi-Turn**: Ask follow-up questions - context is maintained automatically

---

## Project Structure

```
home-affairs-demo/
├── index.html              # Main application interface
├── styles.css              # Complete styling (HK Gov branding)
├── app.js                  # Core application logic
├── config.js               # Base configuration
├── config.local.js         # Your API key (DO NOT COMMIT)
├── config.local.example.js # Template for config.local.js
├── cors-proxy.js           # CORS proxy server
├── package.json            # Node.js dependencies
├── .gitignore              # Excludes config.local.js
├── START.md                # This file
├── ARCHITECTURE.md         # System architecture & CORS explanation
├── README.md               # Full documentation
└── docs/
    └── Task Specification...md  # Original requirements
```

---

## Key Features

✅ **Official Sources Only** - Searches only had.gov.hk and hyab.gov.hk  
✅ **Real-time Streaming** - SSE for live response updates  
✅ **Multi-turn Conversations** - Maintains context across questions  
✅ **Auto Citations** - Sources displayed automatically  
✅ **Beautiful UI** - Professional HK Government branding  
✅ **Zero Build Process** - Pure HTML/CSS/JavaScript  

---

## Troubleshooting

### CORS Errors
**Problem**: "blocked by CORS policy"  
**Solution**: Ensure CORS proxy is running on port 3001

### Port Already in Use
**Problem**: Port 3001 or 8080 already in use  
**Solution**: 
```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# Or use different ports
python -m http.server 8000
```

### API Key Not Working
**Problem**: Authentication fails  
**Solution**: 
1. Verify API key in `config.local.js`
2. Check key hasn't expired
3. Ensure `config.local.js` is loaded in `index.html`

### No Response
**Problem**: Query sent but no response  
**Solution**:
1. Open browser console (F12)
2. Check for errors
3. Verify both proxy and web server are running
4. Test API key with curl (see docs)

---

## For Production Deployment

See `ARCHITECTURE.md` for production deployment options including:
- Direct backend integration (no CORS proxy needed)
- VPS deployment instructions
- Docker containerization
- SSL/HTTPS setup

---

## Important Notes

1. **API Key Security**: Never commit `config.local.js` to git
2. **CORS Proxy**: Required only for local development
3. **Multi-turn Context**: Uses `context_history` (Developer API is stateless)
4. **Session Storage**: Conversation history stored in browser sessionStorage

---

## Support

For issues or questions:
- Check `ARCHITECTURE.md` for technical details
- Review browser console for errors
- Verify all services are running

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-21  
**Status**: Production Ready ✅
