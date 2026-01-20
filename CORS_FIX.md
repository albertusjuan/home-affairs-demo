# CORS Issue Fix Guide

## The Problem

You're seeing this error:
```
Access to fetch at 'https://hub.wyniai.com/api/v1/developer/agent/query/stream' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks requests from one domain (localhost:8080) to another domain (hub.wyniai.com) unless the server explicitly allows it.

## Solutions

### Solution 1: Fix on Server (Recommended for Production)

**Contact your WYNI API administrator** and ask them to add CORS headers for Developer API endpoints:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, x-tenant-subdomain
Access-Control-Max-Age: 86400
```

Or for localhost development only:
```
Access-Control-Allow-Origin: http://localhost:8080
```

### Solution 2: Use Non-Streaming Endpoint (Current Fallback)

The app now automatically falls back to the non-streaming endpoint if streaming fails due to CORS. This should work but won't show real-time streaming.

**Features:**
- ✅ Avoids CORS preflight issues
- ✅ Works with current server config
- ❌ No real-time streaming (waits for complete response)

### Solution 3: Deploy to Same Domain

Deploy your chatbot to the same domain as the API:
- API: `https://hub.wyniai.com`
- Chatbot: `https://hub.wyniai.com/chatbot`
- Result: No CORS issues (same origin)

### Solution 4: Use a Proxy (Development Only)

For local development, use a proxy server:

**Using Node.js http-proxy:**
```javascript
// proxy-server.js
const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, x-tenant-subdomain');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  proxy.web(req, res, { target: 'https://hub.wyniai.com' });
}).listen(3000);

console.log('Proxy running on http://localhost:3000');
```

Then update config.js:
```javascript
API_URL: 'http://localhost:3000',
```

### Solution 5: Browser Extension (Development Only - Not Recommended)

Install "CORS Unblock" or "Allow CORS" browser extension. 

**⚠️ Security Warning:** Only use for development, never in production!

## Current Implementation

The chatbot now:

1. **Tries streaming first** (optimal user experience)
2. **Falls back to non-streaming** if CORS blocks streaming
3. **Shows error message** if both fail

## Testing CORS Fix

Once your admin adds CORS headers, test with:

```bash
curl -i -X OPTIONS https://hub.wyniai.com/api/v1/developer/agent/query/stream \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```

You should see:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
```

## For Production Deployment

When deploying to production:

### Option A: Same Domain Deployment
```
API:     https://hub.wyniai.com/api/
Chatbot: https://hub.wyniai.com/
Result:  No CORS issues
```

### Option B: Subdomain Deployment
```
API:     https://api.wyniai.com/
Chatbot: https://chatbot.wyniai.com/
Result:  Need CORS headers allowing chatbot.wyniai.com
```

### Option C: Different Domain
```
API:     https://hub.wyniai.com/
Chatbot: https://homeaffairs.gov.hk/
Result:  Need CORS headers allowing homeaffairs.gov.hk
```

## Contact

If CORS issues persist, contact your WYNI API administrator with this information:

**Request:**
"Please enable CORS for Developer API endpoints to allow the Home Affairs chatbot. Need headers for `/api/v1/developer/agent/query` and `/api/v1/developer/agent/query/stream` endpoints."

**Required Headers:**
```
Access-Control-Allow-Origin: http://localhost:8080 (for dev)
Access-Control-Allow-Origin: https://your-production-domain.com (for prod)
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, x-tenant-subdomain
```

## Current Status

✅ **Non-streaming works** (fallback)  
⏳ **Streaming needs CORS fix** (ask admin)

The chatbot is fully functional using non-streaming mode. For real-time streaming, contact your API administrator to enable CORS.

