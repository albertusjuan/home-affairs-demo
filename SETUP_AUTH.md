# Quick Setup Guide - Authentication

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details and wait for provisioning (~2 minutes)

### Step 2: Run SQL Schema
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Open `supabase-schema.sql` from this repo
3. Copy all contents
4. Paste into SQL Editor and click **RUN**
5. You should see: "Hong Kong Home Affairs AI Assistant database schema created successfully!"

### Step 3: Get API Keys
1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long key starting with `eyJ...`)

### Step 4: Configure Local File
1. Open `supabase-config.local.js`
2. Replace placeholders with your values:

```javascript
const SUPABASE_LOCAL_CONFIG = {
    SUPABASE_URL: 'https://xxxxx.supabase.co',     // ← Paste your URL here
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1Ni...'     // ← Paste your key here
};
```

3. Save the file

### Step 5: Test It!
1. Start proxy: `npm run proxy`
2. Start server: `python -m http.server 8080`
3. Open: http://localhost:8080/auth.html
4. Create account and test login

## 📁 Files Created

| File | Description |
|------|-------------|
| `auth.html` | Login/Signup page |
| `auth.js` | Authentication logic |
| `auth-styles.css` | Auth page styling |
| `supabase-schema.sql` | Database setup ⭐ **Copy this to Supabase** |
| `supabase-config.js` | Config template (committed) |
| `supabase-config.local.js` | Your credentials ⭐ **Add your keys here** |
| `docs/AUTHENTICATION.md` | Full documentation |

## ✅ Features

- ✨ Beautiful login/signup interface
- 🔐 Secure password hashing
- 👤 User session management
- 🚪 Logout functionality
- 🔄 Auto-redirect if not logged in
- 💾 Optional "Remember me"
- 📧 Email verification support
- 🛡️ Row Level Security enabled

## 🔧 How It Works

```
┌──────────────────────────────────────┐
│  User visits index.html              │
│  ↓                                    │
│  Check Supabase session              │
│  ↓                                    │
│  No session? → Redirect to auth.html │
│  ↓                                    │
│  User logs in                        │
│  ↓                                    │
│  Session created → Back to app       │
└──────────────────────────────────────┘
```

## 🚨 Important Security Notes

- **Never commit** `supabase-config.local.js` (it's gitignored)
- Use **HTTPS** in production
- Enable **email verification** in Supabase for production
- Review **Row Level Security** policies in the SQL file

## 📚 Full Documentation

See `docs/AUTHENTICATION.md` for:
- Detailed setup instructions
- API reference
- Database schema details
- Customization options
- Troubleshooting guide
- Production deployment checklist

## 🆘 Quick Troubleshooting

**Problem**: "Supabase configuration not found"  
**Solution**: Make sure `supabase-config.local.js` exists with your keys

**Problem**: "Invalid login credentials"  
**Solution**: Check Supabase dashboard → Authentication → Users to verify account exists

**Problem**: Infinite redirect loop  
**Solution**: Clear browser storage:
```javascript
localStorage.clear();
sessionStorage.clear();
```

---

## 🎉 That's It!

Your authentication system is now ready. All user accounts will be stored securely in Supabase.

**Next Steps:**
1. Test login/signup flow
2. Customize email templates in Supabase (optional)
3. Deploy to production with HTTPS

Need help? Check `docs/AUTHENTICATION.md` for detailed documentation.

