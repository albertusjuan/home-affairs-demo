# Vercel Deployment Guide

## Architecture Overview

The application uses a **server-side proxy** to avoid CORS issues:

```
Browser (Frontend) → Vercel Serverless Function (Proxy) → WYNI AI Hub (Backend)
```

### Why We Need a Proxy

Your senior is correct - we should NOT call the API directly from the browser because:

1. **CORS Restrictions**: Browsers block cross-origin requests for security
2. **API Key Exposure**: Direct calls expose your API key in browser network requests  
3. **Backend-to-Backend**: APIs should be called from server-side code, not client-side

### How It Works

1. **Frontend** (`app.js`) calls `/api/proxy` on your Vercel domain
2. **Vercel Proxy** (`api/proxy.js`) forwards the request to `https://hub.wyniai.com`
3. **WYNI AI Hub** processes the request and streams the response back
4. **Vercel Proxy** streams the response back to the browser

## Environment Variables

Set these in your Vercel project:

| Variable | Value | Required |
|----------|-------|----------|
| `WYNI_API_BASE_URL` | `https://hub.wyniai.com` | Yes |

**Note**: The API key is provided by the user in the browser, not stored on the server.

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Add Environment Variable:
   - **Name**: `WYNI_API_BASE_URL`
   - **Value**: `https://hub.wyniai.com`
6. Click "Deploy"

#### Option B: Via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variable
vercel env add WYNI_API_BASE_URL
# When prompted, enter: https://hub.wyniai.com

# Deploy to production
vercel --prod
```

### 3. Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Enter your WYNI Developer API Key
3. Start chatting!

## Local Development

### Option 1: Vercel Dev (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Run local development server
vercel dev
```

This runs the Vercel proxy locally at `http://localhost:3000`.

### Option 2: Python Server + Manual Proxy

```bash
# Terminal 1: Run CORS proxy
node cors-proxy.js

# Terminal 2: Run frontend
python -m http.server 8080
```

Visit `http://localhost:8080` and enter your API key.

## File Structure

```
home-affairs-demo/
├── api/
│   └── proxy.js              # Vercel serverless function (proxy)
├── docs/
│   ├── API_documentation.md
│   ├── ARCHITECTURE.md
│   ├── START.md
│   └── VERCEL_DEPLOYMENT.md  # This file
├── index.html                # Frontend UI
├── styles.css                # Styling
├── app.js                    # Frontend logic
├── config.js                 # Public configuration
├── config.local.js           # Local API key (git-ignored)
├── vercel.json               # Vercel configuration
├── cors-proxy.js             # Local development proxy (optional)
└── README.md
```

## Troubleshooting

### Error: "Proxy request failed"

- Check that `WYNI_API_BASE_URL` is set correctly in Vercel
- Verify your API key is valid
- Check Vercel function logs

### Error: "Authorization failed"

- Your API key might be expired or invalid
- Generate a new key at [hub.wyniai.com](https://hub.wyniai.com)

### Local Development Not Working

If using `vercel dev`:
```bash
vercel env pull  # Pull environment variables
vercel dev       # Restart dev server
```

If using cors-proxy:
```bash
# Make sure cors-proxy is running
node cors-proxy.js
```

## Security Notes

1. **Never commit `config.local.js`** - it contains your API key
2. **Use environment variables** for production deployment
3. **API key is user-provided** - not stored on the server
4. **Proxy validates requests** - only forwards to WYNI AI Hub

## Next Steps

After deployment:

1. ✅ Test the chatbot with various queries
2. ✅ Monitor Vercel function logs for errors
3. ✅ Set up custom domain (optional)
4. ✅ Configure HTTPS (automatic on Vercel)

---

**Your senior's advice was spot-on**: Always use a backend proxy for API calls instead of calling from the browser directly! 🎯

