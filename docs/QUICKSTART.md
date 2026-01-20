# Quick Start Guide - Hong Kong Home Affairs AI Assistant

## Get Started in 3 Minutes! ⚡

### Option 1: Test Locally (Fastest)

1. **Open the application**:
   ```bash
   # Navigate to project directory
   cd "C:\Users\Albert\Documents\Wyni Technology\home-affairs-demo"
   
   # Open index.html in your browser
   start index.html
   ```
   
   Or simply double-click `index.html` in File Explorer.

2. **Configure API connection**:
   - Enter your WYNI API Hub URL
   - Enter your email and password
   - Click "Sign In"

3. **Start chatting**:
   - Ask questions about Hong Kong Home Affairs
   - Example: "What are the latest youth grants available?"
   - Watch real-time responses stream in
   - Check citations in the drawer at the bottom

**That's it!** No installation, no build process, just open and run!

---

### Option 2: Deploy to Production Server

#### Using Python (Quick Web Server)

```bash
cd "C:\Users\Albert\Documents\Wyni Technology\home-affairs-demo"
python -m http.server 8080
```

Then open: http://localhost:8080

#### Using Node.js

```bash
cd "C:\Users\Albert\Documents\Wyni Technology\home-affairs-demo"
npx serve -p 8080
```

Then open: http://localhost:8080

---

### Option 3: Deploy to Hostinger VPS

```bash
# SSH into your VPS
ssh your-username@your-vps-ip

# Navigate to web directory
cd /var/www/html

# Clone the repository
git clone https://github.com/albertusjuan/home-affairs-demo.git

# Set permissions
chmod -R 755 home-affairs-demo
chown -R www-data:www-data home-affairs-demo

# Done! Access at your domain
```

**See DEPLOYMENT.md for detailed production deployment instructions.**

---

## Configuration

### Default Settings (config.js)

- **Tenant**: home-affairs-hk
- **Enabled Tools**: web_search only
- **Mode**: fast
- **Allowed Domains**: had.gov.hk, hyab.gov.hk

### Customize (Optional)

Edit `config.js` to change:
- API endpoint defaults
- System prompt wording
- Allowed domains
- UI behavior

---

## File Structure

```
📁 home-affairs-demo/
├── 🌐 index.html          ← Open this to start
├── 🎨 styles.css          ← All styling
├── ⚙️ app.js              ← Main logic
├── 🔧 config.js           ← Configuration
├── 📖 README.md           ← Full documentation
├── 🚀 DEPLOYMENT.md       ← Production deployment
├── 📊 MODULE_STATUS.md    ← Project status
└── ⚡ QUICKSTART.md       ← This file
```

---

## Testing Checklist

### Before First Use

- [ ] Have WYNI API Hub URL ready
- [ ] Have valid user credentials
- [ ] Backend API is running and accessible
- [ ] Modern browser installed (Chrome, Firefox, Safari, Edge)

### After Opening

- [ ] Login screen appears with HK Gov branding
- [ ] Navy Blue (#003366) and Red (#E60012) colors visible
- [ ] "Secure Official Source" badge in header
- [ ] No console errors (press F12 to check)

### During Use

- [ ] Messages send successfully
- [ ] Responses stream in real-time
- [ ] Loading indicator shows "Consulting Home Affairs Database..."
- [ ] Citations appear in bottom drawer
- [ ] Only had.gov.hk and hyab.gov.hk sources shown
- [ ] Links are clickable and open in new tab

---

## Troubleshooting

### Login Failed
**Problem**: Can't log in  
**Solution**: 
- Check API URL format (must include https://)
- Verify credentials are correct
- Test API URL in browser first
- Check browser console for errors (F12)

### No Response After Sending Message
**Problem**: Message sent but no response  
**Solution**: 
- Check browser console for errors
- Verify backend is running
- Check network tab (F12) for failed requests
- Ensure conversation session was created

### Citations Not Showing
**Problem**: No sources in drawer  
**Solution**: 
- Ask questions that require web search
- Ensure backend is searching had.gov.hk and hyab.gov.hk
- Check SSE 'sources' event in network tab
- Try different queries

### Page Not Loading
**Problem**: Blank page or errors  
**Solution**: 
- Check all files are in same directory
- Open browser console (F12) for errors
- Try different browser
- Clear browser cache

---

## Example Queries to Try

1. **Youth Programs**:
   - "What are the latest youth grants available?"
   - "How do I apply for youth development programs?"

2. **Community Services**:
   - "How do I register for community services?"
   - "What services does the Home Affairs Department provide?"

3. **District Facilities**:
   - "What facilities are available in Central district?"
   - "Where can I find community centers in Hong Kong?"

4. **General Information**:
   - "What is the Home and Youth Affairs Bureau?"
   - "How do I contact the Home Affairs Department?"

---

## Next Steps

### For Development
1. ✅ Test locally (open index.html)
2. ✅ Verify all features work
3. ✅ Customize config if needed

### For Production
1. 📋 Choose deployment method (see DEPLOYMENT.md)
2. 📋 Set up SSL certificate (Let's Encrypt)
3. 📋 Configure web server (Apache/Nginx)
4. 📋 Test in production environment
5. 📋 Set up monitoring/logging

### For Users
1. 🔐 Get credentials from admin
2. 🌐 Access the application URL
3. 💬 Start asking questions!

---

## Support & Resources

- **Full Documentation**: README.md
- **Deployment Guide**: DEPLOYMENT.md
- **Project Status**: MODULE_STATUS.md
- **API Reference**: API_documentation.md
- **Requirements**: Task Specification...md

- **GitHub**: https://github.com/albertusjuan/home-affairs-demo
- **Issues**: Submit via GitHub Issues

---

## Quick Reference

| Action | How To |
|--------|--------|
| **Start locally** | Open index.html |
| **Login** | Enter API URL, email, password |
| **Send message** | Type and press Enter (or click send) |
| **View sources** | Check drawer at bottom |
| **Logout** | Click logout button (top right) |
| **Clear chat** | Logout and login again |
| **Check errors** | Press F12 for console |

---

## System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Enabled
- **LocalStorage**: Enabled
- **Network**: Access to WYNI API Hub
- **Screen**: Any size (responsive design)

---

## Production Checklist

Before going live:

- [ ] SSL certificate installed (HTTPS)
- [ ] Web server configured
- [ ] File permissions set correctly
- [ ] Security headers configured
- [ ] CORS configured if needed
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Load testing completed

---

**Happy Chatting!** 🎉

For detailed information, see README.md or DEPLOYMENT.md.

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-20  
**Status**: Production Ready ✅

