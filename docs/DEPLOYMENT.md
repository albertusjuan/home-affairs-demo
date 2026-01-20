# Deployment Guide - Hong Kong Home Affairs AI Assistant

## Overview

This guide covers deployment to Hostinger VPS and other production environments.

## Prerequisites

- SSH access to your VPS
- Git installed on the server
- Web server (Apache/Nginx) configured
- SSL certificate (recommended for production)

## Deployment Options

### Option 1: Hostinger VPS Deployment (Recommended)

#### Step 1: Connect to VPS

```bash
ssh your-username@your-vps-ip
# Or use the hostname
ssh your-username@your-domain.com
```

#### Step 2: Navigate to Web Directory

```bash
# For Apache (typical)
cd /var/www/html

# For Nginx (typical)
cd /usr/share/nginx/html

# Or your custom web root
cd /path/to/your/webroot
```

#### Step 3: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/albertusjuan/home-affairs-demo.git

# Or update existing deployment
cd home-affairs-demo
git pull origin main
```

#### Step 4: Set Permissions

```bash
# Ensure proper file permissions
chmod -R 755 home-affairs-demo
chown -R www-data:www-data home-affairs-demo  # Ubuntu/Debian
# or
chown -R apache:apache home-affairs-demo       # CentOS/RHEL
```

#### Step 5: Configure Web Server

##### For Apache (with .htaccess)

Create `.htaccess` file in the project root:

```apache
# Enable HTTPS redirect (if SSL is configured)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"

# Enable CORS if needed
Header set Access-Control-Allow-Origin "*"

# Cache static assets
<FilesMatch "\.(css|js|jpg|jpeg|png|gif|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Don't cache HTML
<FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</FilesMatch>
```

##### For Nginx

Create or edit Nginx configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS (if SSL configured)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html/home-affairs-demo;
    index index.html;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CORS (if needed)
    add_header Access-Control-Allow-Origin "*" always;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.(html|htm)$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
}
```

Then reload Nginx:

```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

#### Step 6: SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache  # For Apache
# or
sudo apt install certbot python3-certbot-nginx   # For Nginx

# Obtain certificate
sudo certbot --apache -d your-domain.com -d www.your-domain.com
# or
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Option 2: Quick Deploy Script

Create a deployment script on your VPS:

```bash
#!/bin/bash
# deploy-home-affairs.sh

echo "🚀 Deploying Hong Kong Home Affairs AI Assistant..."

# Configuration
DEPLOY_DIR="/var/www/html/home-affairs-demo"
REPO_URL="https://github.com/albertusjuan/home-affairs-demo.git"
BRANCH="main"

# Navigate to deployment directory
cd "$(dirname "$DEPLOY_DIR")"

# Check if directory exists
if [ -d "$DEPLOY_DIR" ]; then
    echo "📦 Updating existing deployment..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "📦 Cloning repository..."
    git clone $REPO_URL
    cd "$DEPLOY_DIR"
fi

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 755 .
chown -R www-data:www-data .  # Adjust user as needed

# Clear cache if needed
if [ -d "cache" ]; then
    rm -rf cache/*
fi

echo "✅ Deployment complete!"
echo "🌐 Access at: https://your-domain.com"
```

Make it executable and run:

```bash
chmod +x deploy-home-affairs.sh
sudo ./deploy-home-affairs.sh
```

### Option 3: Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copy application files
COPY . /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  home-affairs-web:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    environment:
      - TZ=Asia/Hong_Kong
```

Deploy:

```bash
docker-compose up -d
```

## Post-Deployment Configuration

### 1. Update API Configuration

After deployment, users need to configure their API URL in the login screen. You can optionally pre-configure this:

Edit `config.js` and update the default API URL:

```javascript
// In the login form, set default value
document.getElementById('apiUrl').value = 'https://your-api-url.com';
```

### 2. Test the Deployment

1. Visit your deployed URL
2. Check browser console for any errors
3. Test login with valid credentials
4. Send a test query
5. Verify sources are displayed correctly

### 3. Monitor Logs

#### Apache Logs
```bash
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log
```

#### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/html/home-affairs-demo
          git pull origin main
          chmod -R 755 .
          chown -R www-data:www-data .
```

Add secrets in GitHub: Settings → Secrets → Actions:
- `VPS_HOST`: Your VPS IP or hostname
- `VPS_USERNAME`: SSH username
- `VPS_SSH_KEY`: Private SSH key

## Continuous Deployment

For automatic deployment on every push:

1. Set up GitHub Actions (see above)
2. Or use a webhook-based deployment
3. Or schedule periodic pulls via cron

### Cron-based Auto-Update

```bash
# Edit crontab
crontab -e

# Add this line to pull updates every hour
0 * * * * cd /var/www/html/home-affairs-demo && git pull origin main >> /var/log/home-affairs-deploy.log 2>&1
```

## Troubleshooting

### Issue: 403 Forbidden

**Solution**: Check file permissions

```bash
chmod -R 755 /var/www/html/home-affairs-demo
chown -R www-data:www-data /var/www/html/home-affairs-demo
```

### Issue: CORS Errors

**Solution**: Configure proper CORS headers in web server config (see above)

### Issue: SSE Connection Fails

**Solution**: 
1. Ensure proxy settings allow SSE
2. For Nginx, add:
   ```nginx
   proxy_set_header Connection '';
   proxy_http_version 1.1;
   chunked_transfer_encoding off;
   ```

### Issue: JWT Token Not Persisting

**Solution**: Ensure HTTPS is enabled for localStorage to work properly

## Security Checklist

- [ ] SSL/HTTPS enabled
- [ ] Security headers configured
- [ ] File permissions set correctly
- [ ] Directory listing disabled
- [ ] Sensitive files (.git) not accessible
- [ ] Regular security updates applied
- [ ] Firewall configured properly
- [ ] Rate limiting configured (if applicable)

## Performance Optimization

### 1. Enable Gzip Compression

**Apache**: Add to `.htaccess`
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

**Nginx**: Add to config
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. Enable Browser Caching

Already configured in the web server configs above.

### 3. CDN Integration (Optional)

Use Cloudflare or similar CDN:
1. Point your domain to Cloudflare nameservers
2. Enable proxy (orange cloud)
3. Configure caching rules
4. Enable Auto Minify for JS, CSS, HTML

## Rollback Procedure

If something goes wrong:

```bash
cd /var/www/html/home-affairs-demo

# View commit history
git log --oneline

# Rollback to previous commit
git reset --hard <commit-hash>

# Or rollback to previous version
git reset --hard HEAD~1
```

## Maintenance

### Regular Updates

```bash
# Pull latest changes
cd /var/www/html/home-affairs-demo
git pull origin main

# Restart web server if needed
sudo systemctl restart apache2  # or nginx
```

### Backup

```bash
# Backup current deployment
tar -czf home-affairs-backup-$(date +%Y%m%d).tar.gz /var/www/html/home-affairs-demo

# Store backups
mv home-affairs-backup-*.tar.gz /backups/
```

## Support

For deployment issues:
- Check logs first
- Review this documentation
- Contact: albertusjuan@wyni.technology

---

**Last Updated**: 2026-01-20
**Deployment Version**: 1.0.0

