# Quick Setup Guide - API Key Based (No Login)

This is a simplified version that uses WYNI Developer API keys instead of user login.

## ✅ Advantages

- **No Login Required** - Just configure once with API key
- **No CORS Issues** - Uses Developer API which has CORS enabled
- **Simpler** - Fewer moving parts
- **Faster** - No authentication flow

---

## 🚀 Setup Steps

### Step 1: Get Your WYNI Developer API Key

1. Go to: `https://hub.wyniai.com`
2. Log in with your WYNI account
3. Navigate to: **Profile Menu → Developer API → Create Key**
4. Create a new key with:
   - **Name**: `Home Affairs Chatbot`
   - **Scopes**: `web` (or `search` and `web`)
5. Copy the API key (starts with `dak-...`)
   ⚠️ **Save it now - it's only shown once!**

### Step 2: Create Configuration File

1. Copy the example config:
   ```bash
   copy config.local.example.js config.local.js
   ```

2. Edit `config.local.js`:
   ```javascript
   const LOCAL_CONFIG = {
       API_KEY: 'dak-your-actual-api-key-here',  // ← Paste your key here
       API_BASE_URL: 'https://hub.wyniai.com',
   };
   ```

3. Save the file

### Step 3: Use the Simplified Version

1. Open `index.simple.html` in your browser:
   ```
   http://localhost:8080/index.simple.html
   ```

2. Start chatting immediately - no login needed!

---

## 📁 File Structure

```
home-affairs-demo/
├── index.simple.html         # Simplified HTML (no login)
├── app.simple.js             # Simplified app (API key based)
├── config.local.example.js   # Configuration template
├── config.local.js           # Your actual config (gitignored)
├── styles.css                # Same styles
└── config.js                 # Shared config
```

---

## 🔒 Security Notes

- ✅ `config.local.js` is in `.gitignore` (won't be committed)
- ⚠️ **Never** commit your API key to Git
- ⚠️ **Never** share your `config.local.js` file
- ✅ API keys can be rotated if compromised

---

## 🔧 Configuration Options

### Required

```javascript
API_KEY: 'dak-xxxx-yyyy'  // Your WYNI Developer API key
```

### Optional

```javascript
API_BASE_URL: 'https://hub.wyniai.com'  // Change if using different server

CUSTOM_SYSTEM_PROMPT: 'Your custom prompt...'  // Override default prompt
```

---

## 📊 Comparison: Simple vs Full Version

| Feature | Simple (API Key) | Full (Login) |
|---------|-----------------|--------------|
| **Setup** | Edit one config file | User login each time |
| **CORS** | ✅ No issues | ❌ Needs backend config |
| **Authentication** | API key | Email + Password + JWT |
| **Multi-user** | ❌ Single API key | ✅ Multiple users |
| **Best For** | Development, demos | Production, multi-user |

---

## 🐛 Troubleshooting

### Error: "Configuration Required"

**Cause**: `config.local.js` not found or invalid  
**Fix**: 
1. Create `config.local.js` from `config.local.example.js`
2. Update the API_KEY value
3. Refresh the page

### Error: "401 Unauthorized"

**Cause**: Invalid or expired API key  
**Fix**:
1. Go to WYNI Developer API
2. Check if key is active
3. Create a new key if needed
4. Update `config.local.js`

### Error: "403 Forbidden"

**Cause**: API key doesn't have required permissions  
**Fix**:
1. Check key scopes include `web` or `search`
2. Create new key with correct scopes

### Error: API calls failing

**Cause**: Wrong base URL  
**Fix**:
1. Verify `API_BASE_URL` in `config.local.js`
2. Should be `https://hub.wyniai.com` (or your server)

---

## 🎯 Quick Start Commands

```bash
# 1. Create config file
copy config.local.example.js config.local.js

# 2. Edit config.local.js and add your API key

# 3. Start dev server (if not running)
python -m http.server 8080

# 4. Open in browser
# http://localhost:8080/index.simple.html
```

---

## 🔄 Switching Between Versions

### Use Simplified Version (API Key)
```
http://localhost:8080/index.simple.html
```

### Use Full Version (Login)
```
http://localhost:8080/index.html
```

Both versions use the same styling and features, just different authentication methods.

---

## ✨ Features (Same as Full Version)

- ✅ Real-time streaming responses
- ✅ Source citations from official HK Gov sites
- ✅ Loading animations
- ✅ Responsive design
- ✅ Citation drawer
- ✅ Multi-turn conversations
- ✅ Hong Kong government branding

---

## 📝 Getting Your API Key

### Via Web UI:

1. Login to https://hub.wyniai.com
2. Click your profile (top right)
3. Select "Developer API"
4. Click "Create API Key"
5. Enter name: "Home Affairs Chatbot"
6. Select scopes: `web`
7. Click "Create"
8. **Copy the key immediately!**

### Via API (Advanced):

```bash
# Get your user token first, then:
curl -X POST "https://hub.wyniai.com/api/v1/developer/api-keys" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Home Affairs Chatbot","scopes":["web"]}'
```

---

## ✅ You're Ready!

Once `config.local.js` is set up:

1. Open: `http://localhost:8080/index.simple.html`
2. Start chatting immediately!
3. No login, no CORS issues, just works! 🎉

---

**Version**: 1.0.0 (Simplified)  
**Last Updated**: 2026-01-20  
**Recommended For**: Development & Testing

