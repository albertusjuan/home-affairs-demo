# Authentication System - Hong Kong Home Affairs AI Assistant

## Overview

This document describes the authentication system implementation using Supabase for user management.

## Features

✅ **User Registration** - Create new accounts with email and password  
✅ **User Login** - Secure authentication with session management  
✅ **Session Persistence** - "Remember me" functionality  
✅ **Protected Routes** - Auto-redirect to login if not authenticated  
✅ **User Profile** - Display logged-in user info  
✅ **Logout** - Secure session termination  
✅ **Password Validation** - Minimum 8 characters with letters and numbers  
✅ **Email Verification** - Optional email confirmation (Supabase feature)

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Copy the contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **RUN** to execute the schema

This will create:
- `users` table
- `user_sessions` table (optional)
- `conversation_history` table (optional)
- Indexes and Row Level Security policies

### 3. Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 4. Configure Local Settings

1. Open `supabase-config.local.js`
2. Replace the placeholder values:

```javascript
const SUPABASE_LOCAL_CONFIG = {
    SUPABASE_URL: 'https://your-project.supabase.co',  // ← Your Project URL
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← Your Anon Key
};
```

3. Save the file (this file is gitignored for security)

### 5. Enable Email Authentication in Supabase

1. Go to **Authentication** → **Providers** in Supabase
2. Ensure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation, reset password emails

### 6. Test the System

1. Start the CORS proxy:
   ```bash
   npm run proxy
   ```

2. Start the web server:
   ```bash
   python -m http.server 8080
   ```

3. Open `http://localhost:8080/auth.html`
4. Create a test account
5. Login and verify redirect to main app

---

## File Structure

```
home-affairs-demo/
├── auth.html                      # Login/Signup page
├── auth.js                        # Authentication logic
├── auth-styles.css                # Authentication page styles
├── supabase-config.js             # Supabase config template (committed)
├── supabase-config.local.js       # Local credentials (gitignored)
├── supabase-schema.sql            # Database schema
├── index.html                     # Main app (requires auth)
├── app.js                         # Main app logic (updated with auth)
└── docs/
    └── AUTHENTICATION.md          # This file
```

---

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User visits index.html                                   │
│     ↓                                                         │
│  2. app.js checks for active Supabase session                │
│     ↓                                                         │
│  3. No session? → Redirect to auth.html                      │
│     ↓                                                         │
│  4. User logs in or signs up                                 │
│     ↓                                                         │
│  5. Supabase creates session                                 │
│     ↓                                                         │
│  6. Redirect back to index.html                              │
│     ↓                                                         │
│  7. Session found! → Load chat interface                     │
│     ↓                                                         │
│  8. User info displayed in header with logout button         │
└─────────────────────────────────────────────────────────────┘
```

### Session Management

- **Session Storage**: Supabase stores session in browser localStorage
- **Session Duration**: Default 1 hour (configurable in Supabase)
- **Auto-refresh**: Supabase SDK automatically refreshes expired sessions
- **Remember Me**: Optional feature to persist session longer

### Security Features

1. **Row Level Security (RLS)**:
   - Users can only access their own data
   - Policies enforced at database level

2. **Password Hashing**:
   - Passwords hashed with bcrypt
   - Never stored in plain text

3. **JWT Tokens**:
   - Secure token-based authentication
   - Tokens auto-expire

4. **HTTPS Only** (Production):
   - All authentication traffic encrypted
   - Required for production deployment

---

## API Reference

### AuthManager Class (auth.js)

#### `handleLogin()`
Authenticates user with email and password.

```javascript
// Called when login form is submitted
await authManager.handleLogin();
```

#### `handleSignup()`
Creates new user account.

```javascript
// Called when signup form is submitted
await authManager.handleSignup();
```

#### `checkExistingSession()`
Checks if user has active session.

```javascript
// Auto-redirects to main app if session exists
await authManager.checkExistingSession();
```

### HomeAffairsAI Class Updates (app.js)

#### `initSupabase()`
Initializes Supabase client.

```javascript
await this.initSupabase();
```

#### `checkAuth()`
Verifies user authentication, redirects if not logged in.

```javascript
await this.checkAuth();
```

#### `handleLogout()`
Logs out user and clears session.

```javascript
await this.handleLogout();
```

---

## Database Schema

### Users Table

| Column       | Type         | Description                    |
|--------------|--------------|--------------------------------|
| id           | UUID         | Primary key                    |
| email        | VARCHAR(255) | User email (unique)            |
| password_hash| VARCHAR(255) | Bcrypt hashed password         |
| full_name    | VARCHAR(255) | User's full name               |
| created_at   | TIMESTAMP    | Account creation time          |
| updated_at   | TIMESTAMP    | Last update time               |
| last_login   | TIMESTAMP    | Last successful login          |
| is_active    | BOOLEAN      | Account active status          |

### User Sessions Table (Optional)

| Column       | Type         | Description                    |
|--------------|--------------|--------------------------------|
| id           | UUID         | Primary key                    |
| user_id      | UUID         | Foreign key to users           |
| session_token| VARCHAR(255) | Session identifier             |
| created_at   | TIMESTAMP    | Session start time             |
| expires_at   | TIMESTAMP    | Session expiration time        |
| ip_address   | VARCHAR(45)  | User's IP address              |
| user_agent   | TEXT         | Browser user agent             |

### Conversation History Table (Optional)

| Column         | Type         | Description                    |
|----------------|--------------|--------------------------------|
| id             | UUID         | Primary key                    |
| user_id        | UUID         | Foreign key to users           |
| session_id     | UUID         | Chat session identifier        |
| message_role   | VARCHAR(20)  | 'user' or 'assistant'          |
| message_content| TEXT         | Message text                   |
| created_at     | TIMESTAMP    | Message timestamp              |
| metadata       | JSONB        | Additional data                |

---

## Customization

### Disable Authentication

If you want to use the app without authentication:

1. In `app.js`, modify `checkAuth()`:

```javascript
async checkAuth() {
    console.log('ℹ Authentication disabled');
    return; // Skip auth check
}
```

2. Users can access the app without logging in

### Custom Email Templates

1. Go to Supabase **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

### Password Requirements

In `auth.js`, modify validation in `handleSignup()`:

```javascript
// Current: Minimum 8 characters with letters and numbers
if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
    this.showError('signupError', 'Password must contain both letters and numbers');
    return;
}

// Custom: Add special character requirement
if (!/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
    this.showError('signupError', 'Password must contain letters, numbers, and special characters');
    return;
}
```

---

## Troubleshooting

### Issue: "Supabase configuration not found"

**Solution**: Make sure `supabase-config.local.js` exists with correct credentials.

### Issue: "Invalid login credentials"

**Possible causes**:
1. Email not verified (check Supabase email settings)
2. Incorrect password
3. Account doesn't exist

**Solution**: 
- Check Supabase **Authentication** → **Users** table
- Verify email confirmation status
- Try password reset

### Issue: Redirect loop between auth.html and index.html

**Solution**: Clear browser localStorage and try again:
```javascript
localStorage.clear();
sessionStorage.clear();
```

### Issue: CORS errors with Supabase

**Solution**: Ensure CORS proxy is running and Supabase URL is correctly configured.

---

## Production Deployment

### Security Checklist

- [ ] Enable HTTPS for all pages
- [ ] Set secure cookie flags in Supabase
- [ ] Configure allowed redirect URLs in Supabase
- [ ] Enable email verification requirement
- [ ] Set up proper CORS headers
- [ ] Never commit `supabase-config.local.js` to git
- [ ] Use environment variables for production credentials
- [ ] Enable rate limiting on Supabase
- [ ] Set up monitoring and alerts

### Environment Variables

For production, use environment variables instead of config files:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Load in JavaScript:
```javascript
const SUPABASE_CONFIG = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
};
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Version**: 1.0  
**Last Updated**: 2026-01-26  
**Author**: Wyni Technology  
**Status**: Ready for Testing ✅

