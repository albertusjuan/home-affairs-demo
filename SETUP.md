# Setup Guide - Developer API Key Authentication

## What You Need

1. ✅ **Developer API Key** (starts with `dak-...`)
2. ❓ **API URL** (WYNI server address)

## Step 1: Get Your API URL

The API URL is the base address of your WYNI server. Common formats:

- `https://api.wyni.technology`
- `https://your-company.wyni.ai`
- `https://wyni.your-domain.com`

**Where to find it:**
- Ask your system administrator
- Check your WYNI dashboard URL (it's usually similar)
- Check your account welcome email

**Examples of what it looks like:**
```
✅ https://api.wyni.technology
✅ https://demo.wyni.ai
✅ https://wyni.example.com

❌ dak-xxxxx (this is your API key, not URL)
❌ wyni.technology (missing https://)
```

## Step 2: Configure config.js

Open `config.js` and update **TWO values**:

```javascript
// 1. Your WYNI server URL
API_URL: 'https://your-actual-server.com',

// 2. Your Developer API key
API_KEY: 'dak-your-actual-key-here',
```

## Step 3: Save and Test

1. Save `config.js`
2. Open `index.html` in your browser
3. Check browser console (F12) for validation messages

## What's Different with Developer API?

**Traditional Login:**
- Requires: Email + Password
- Gets: JWT token (expires in 30 days)
- Must login each time token expires

**Developer API (What you're using):**
- Requires: API Key only
- No login needed
- API key doesn't expire (unless revoked)
- Simpler, but key must be kept secure

## API Endpoints Used

Developer API uses different endpoints:

```
POST /api/v1/developer/agent/query          # Single response
POST /api/v1/developer/agent/query/stream   # Streaming (SSE)
```

**Headers:**
```javascript
Authorization: Bearer dak-your-key-here
// or
X-API-Key: dak-your-key-here
```

## Troubleshooting

### "API_URL is required"
- You haven't set the API_URL yet
- Ask your admin for the WYNI server address

### "401 Unauthorized"
- Your API key is invalid or revoked
- Check the key is correct in config.js
- Contact admin to verify key is active

### "API_KEY should start with dak-"
- You might have pasted the API URL in the API_KEY field
- Or you have a different type of key
- Developer API keys always start with `dak-`

## Security Notes

- ✅ `config.js` is gitignored (won't be committed)
- ✅ API key is stored locally only
- ✅ Always use HTTPS in production
- ⚠️ Never share your API key
- ⚠️ Never commit config.js with real key

## Need Help?

**Don't know your API URL?**
1. Check your WYNI account dashboard
2. Ask your system administrator
3. Check welcome/onboarding emails

**Don't have an API key?**
1. Log into WYNI Hub
2. Go to Profile → Developer API
3. Click "Create key"
4. Copy the key (shown only once!)

**Still stuck?**
- Contact: albertus.s@wyni.technology
- Check: `docs/API_documentation.md`

---

**Quick Checklist:**
- [ ] I have my API URL
- [ ] I have my Developer API key (starts with dak-)
- [ ] I've updated config.js with both values
- [ ] I've saved config.js
- [ ] I'm ready to test!

