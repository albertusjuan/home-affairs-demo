# System Architecture - Hong Kong Home Affairs AI Assistant

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Component Details](#component-details)
4. [CORS Issue & Solution](#cors-issue--solution)
5. [Data Flow](#data-flow)
6. [Technology Stack](#technology-stack)
7. [Security Considerations](#security-considerations)

---

## Overview

The Hong Kong Home Affairs AI Assistant is a web-based chatbot that provides information exclusively from official Hong Kong government websites (had.gov.hk and hyab.gov.hk). The system uses the WYNI AI Hub Developer API for natural language processing and web search capabilities.

### Key Design Principles

1. **Official Sources Only** - Strict domain filtering ensures information comes only from government websites
2. **Stateless API** - Uses Developer API which requires context to be passed with each request
3. **Real-time Streaming** - Server-Sent Events (SSE) for live response updates
4. **Zero Build Process** - Pure HTML/CSS/JavaScript for easy deployment
5. **Multi-turn Context** - Maintains conversation history client-side

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Frontend (http://localhost:8080)                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │ │
│  │  │index.html│  │styles.css│  │  app.js  │                 │ │
│  │  └──────────┘  └──────────┘  └──────────┘                 │ │
│  │                      │                                      │ │
│  │                      │ Fetch API Request                    │ │
│  │                      ▼                                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────│──────────────────────────────────────┘
                           │
                           │ HTTP Request (with CORS headers)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              CORS PROXY (http://localhost:3001)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  cors-proxy.js (Express + http-proxy-middleware)           │ │
│  │                                                             │ │
│  │  • Adds CORS headers                                       │ │
│  │  • Forwards requests to backend                            │ │
│  │  • Handles preflight OPTIONS requests                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────│──────────────────────────────────────┘
                           │
                           │ Proxied Request
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           WYNI AI HUB (https://hub.wyniai.com)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Developer API Endpoints                                    │ │
│  │  • POST /api/v1/developer/agent/query/stream               │ │
│  │  • Authentication: Bearer token (API key)                  │ │
│  │  • Returns: SSE stream with answer chunks                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ Web Search                           │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  AI Agent with Web Search Tool                             │ │
│  │  • Searches only had.gov.hk and hyab.gov.hk                │ │
│  │  • Extracts relevant information                           │ │
│  │  • Generates natural language response                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────│──────────────────────────────────────┘
                           │
                           │ Search Queries
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              OFFICIAL GOVERNMENT WEBSITES                        │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   had.gov.hk         │    │   hyab.gov.hk        │          │
│  │  (Home Affairs Dept) │    │  (Home & Youth       │          │
│  │                      │    │   Affairs Bureau)    │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend (Browser)

**Files**: `index.html`, `styles.css`, `app.js`, `config.js`

**Responsibilities**:
- Render chat interface with HK Government branding
- Handle user input and display messages
- Manage conversation history (stored in sessionStorage)
- Parse SSE stream events
- Display citations in drawer
- Provide visual feedback (loading states, animations)

**Key Features**:
- **Conversation History**: Stores last 10 messages in `conversationHistory` array
- **Context Passing**: Sends `context_history` with each API request
- **SSE Handling**: Processes events: `start`, `thinking`, `tool_start`, `answer_chunk`, `sources`, `done`
- **Domain Filtering**: Only displays citations from allowed domains

### 2. CORS Proxy (Node.js)

**File**: `cors-proxy.js`

**Why It's Needed**: See [CORS Issue & Solution](#cors-issue--solution) section below

**Responsibilities**:
- Add CORS headers to all responses
- Forward requests from frontend to backend
- Handle preflight OPTIONS requests
- Proxy SSE streams

**Configuration**:
```javascript
// Allowed headers
'Access-Control-Allow-Headers': 
  'Origin, X-Requested-With, Content-Type, Accept, Authorization'

// Allowed origins
'Access-Control-Allow-Origin': '*'
```

### 3. WYNI AI Hub Backend

**Endpoint**: `POST /api/v1/developer/agent/query/stream`

**Authentication**: Bearer token (Developer API key)

**Request Format**:
```json
{
  "message": "User question with system prompt",
  "tool_groups": ["web"],
  "context_history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

**Response**: Server-Sent Events (SSE) stream

**Events**:
- `start` - Processing begins
- `thinking` - AI is analyzing
- `tool_start` - Web search initiated
- `answer_chunk` - Response token
- `sources` - Citation URLs
- `done` - Stream complete

---

## CORS Issue & Solution

### What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that restricts web pages from making requests to a different domain than the one serving the web page.

### The Problem

Our architecture has this setup:
- **Frontend**: Running on `http://localhost:8080` (Python web server)
- **Backend API**: Running on `https://hub.wyniai.com` (WYNI AI Hub)

When the browser tries to make a request from `localhost:8080` to `hub.wyniai.com`, the browser blocks it with a CORS error:

```
Access to fetch at 'https://hub.wyniai.com/api/v1/developer/agent/query/stream' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

### Why Does This Happen?

1. **Different Origins**: `localhost:8080` ≠ `hub.wyniai.com`
2. **Security Policy**: Browsers block cross-origin requests by default
3. **Preflight Requests**: Browser sends OPTIONS request first to check if cross-origin request is allowed
4. **Missing Headers**: Backend doesn't return required CORS headers for localhost

### The Solution: CORS Proxy

We introduce a **proxy server** that runs on `localhost:3001`:

```
Browser (localhost:8080)
    ↓ Same origin (localhost)
CORS Proxy (localhost:3001)
    ↓ Server-to-server (no CORS)
Backend API (hub.wyniai.com)
```

**How It Works**:

1. **Browser → Proxy**: Request from `localhost:8080` to `localhost:3001` ✅ (Same origin, no CORS issue)
2. **Proxy → Backend**: Server-to-server request to `hub.wyniai.com` ✅ (Servers don't enforce CORS)
3. **Proxy adds CORS headers**: Response includes `Access-Control-Allow-Origin: *`
4. **Proxy → Browser**: Response with CORS headers ✅ (Browser accepts it)

**Implementation** (`cors-proxy.js`):

```javascript
// Add CORS headers to all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Proxy all requests
app.use('/', createProxyMiddleware({
    target: 'https://hub.wyniai.com',
    changeOrigin: true
}));
```

### Production Alternative

In production, you can avoid the CORS proxy by:

1. **Same-Origin Deployment**: Deploy frontend and backend on same domain
2. **Backend CORS Configuration**: Configure backend to allow your frontend domain
3. **API Gateway**: Use a reverse proxy (Nginx, Apache) to serve both frontend and proxy API requests

---

## Data Flow

### 1. User Sends Message

```javascript
// User types: "What youth grants are available?"

// Frontend adds to conversation history
conversationHistory.push({
    role: 'user',
    content: 'What youth grants are available?'
});

// Prepend system prompt on first message
if (isFirstMessage) {
    message = SYSTEM_PROMPT + "\n\nUser Question: " + message;
}
```

### 2. API Request

```javascript
// POST to CORS proxy
fetch('http://localhost:3001/api/v1/developer/agent/query/stream', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer dak-xxx',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: message,
        tool_groups: ['web'],
        context_history: conversationHistory.slice(-10) // Last 10 messages
    })
});
```

### 3. CORS Proxy Forwards

```javascript
// Proxy adds CORS headers and forwards to backend
→ https://hub.wyniai.com/api/v1/developer/agent/query/stream
```

### 4. Backend Processing

```
1. Receives request with context_history
2. AI analyzes question with conversation context
3. Executes web_search tool on had.gov.hk and hyab.gov.hk
4. Extracts relevant information
5. Generates natural language response
6. Streams response via SSE
```

### 5. SSE Stream Response

```javascript
// Frontend receives events
event: start
data: {"query":"..."}

event: thinking
data: {}

event: tool_start
data: {"tool_name":"web_search"}

event: answer_chunk
data: {"chunk":"The Home and Youth Affairs Bureau..."}

event: answer_chunk
data: {"chunk":" provides various grants..."}

event: sources
data: {"sources":[{"url":"https://www.hyab.gov.hk/...","title":"..."}]}

event: done
data: {}
```

### 6. Frontend Updates UI

```javascript
// Display answer chunks in real-time
content += chunk;
messageElement.innerHTML = formatMarkdown(content);

// Show citations in drawer
updateCitations(sources);

// Save to conversation history
conversationHistory.push({
    role: 'assistant',
    content: fullResponse
});
sessionStorage.setItem('conversation_history', JSON.stringify(conversationHistory));
```

---

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Gradients, animations, flexbox, grid
- **JavaScript (ES6+)** - Async/await, fetch API, EventSource (SSE)
- **Marked.js** - Markdown parsing
- **Google Fonts** - Inter font family

### CORS Proxy
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **http-proxy-middleware** - Proxy middleware

### Backend (WYNI AI Hub)
- **FastAPI** - Python web framework
- **OpenAI GPT** - Language model
- **Web Search Tool** - Custom search implementation
- **PostgreSQL** - Database (for user data, not used by Developer API)

### Development Tools
- **Python HTTP Server** - Local web server
- **Git** - Version control
- **npm** - Package management

---

## Security Considerations

### 1. API Key Protection

**Risk**: API key exposure in client-side code

**Mitigation**:
- Store in `config.local.js` (gitignored)
- Never commit to repository
- Use environment variables in production
- Rotate keys regularly

### 2. Domain Filtering

**Risk**: AI might cite unauthorized sources

**Mitigation**:
```javascript
// Client-side filtering
const ALLOWED_DOMAINS = [
    'https://www.had.gov.hk/',
    'https://www.hyab.gov.hk/'
];

const filtered = sources.filter(s => 
    ALLOWED_DOMAINS.some(d => s.url.startsWith(d))
);
```

**Additional**: System prompt instructs AI to search only these domains

### 3. XSS Prevention

**Risk**: Malicious content in AI responses

**Mitigation**:
- Use `marked.js` for safe HTML rendering
- Escape user input
- Content Security Policy headers (in production)

### 4. HTTPS in Production

**Risk**: Man-in-the-middle attacks

**Mitigation**:
- Use HTTPS for all production deployments
- SSL/TLS certificates (Let's Encrypt)
- Secure cookie flags

### 5. Rate Limiting

**Risk**: API abuse

**Mitigation**:
- Backend rate limiting (handled by WYNI AI Hub)
- Client-side request throttling
- API key quotas

---

## Performance Optimizations

### 1. Conversation History Management

```javascript
// Only send last 10 messages to reduce payload size
context_history: conversationHistory.slice(-10)
```

### 2. Streaming Responses

- SSE allows progressive rendering
- User sees response as it's generated
- Better perceived performance

### 3. Minimal Dependencies

- No React, Vue, or Angular
- Pure JavaScript = faster load times
- Total bundle size: ~40KB (uncompressed)

### 4. Efficient DOM Updates

```javascript
// Update existing element instead of recreating
element.innerHTML = formatMarkdown(content);
// vs creating new elements each time
```

---

## Deployment Options

### Development (Current Setup)

```bash
# Terminal 1: CORS Proxy
npm run proxy

# Terminal 2: Web Server
python -m http.server 8080
```

### Production Option 1: Static Hosting + CORS Proxy

```
Frontend: Netlify/Vercel/GitHub Pages
CORS Proxy: Heroku/Railway/Render
Backend: WYNI AI Hub (existing)
```

### Production Option 2: VPS with Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    # Serve frontend
    location / {
        root /var/www/home-affairs;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass https://hub.wyniai.com;
        proxy_set_header Authorization "Bearer $api_key";
    }
}
```

### Production Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001 8080
CMD ["sh", "-c", "node cors-proxy.js & python3 -m http.server 8080"]
```

---

## Monitoring & Logging

### Client-Side

```javascript
// Console logging for debugging
console.log('✓ Session created:', conversationId);
console.log('✓ Including context history:', messages.length);
console.log('✓ Sources received:', sources.length);
```

### Server-Side (CORS Proxy)

```javascript
// Request logging
console.log(`→ ${req.method} ${req.path}`);
```

### Production Recommendations

- **Error Tracking**: Sentry, Rollbar
- **Analytics**: Google Analytics, Mixpanel
- **Logging**: CloudWatch, Datadog
- **Uptime Monitoring**: Pingdom, UptimeRobot

---

## Scalability Considerations

### Current Limitations

1. **Stateless API**: No server-side session storage
2. **Client-side History**: Limited to browser sessionStorage
3. **Single Proxy Instance**: No load balancing

### Scaling Solutions

1. **Multiple Proxy Instances**: Load balancer + multiple CORS proxies
2. **CDN**: CloudFlare for static assets
3. **Redis**: Shared session storage across instances
4. **WebSocket**: Alternative to SSE for bidirectional communication

---

## Future Enhancements

1. **User Authentication**: Login system with user profiles
2. **Conversation Persistence**: Save conversations to database
3. **Multi-language Support**: Traditional Chinese interface
4. **Voice Input**: Speech-to-text integration
5. **Export Conversations**: PDF/CSV export
6. **Admin Dashboard**: Usage analytics and monitoring

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-21  
**Author**: Wyni Technology  
**Status**: Production Ready ✅

