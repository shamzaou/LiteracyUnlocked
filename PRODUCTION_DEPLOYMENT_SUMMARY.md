# LiteracyUnlocked Production Deployment Summary

## 🚀 Deployment Overview

Your **LiteracyUnlocked** comic creation application has been successfully deployed to production with the following configuration:

- **Domain**: `https://literacyunlocked.ae`
- **Server IP**: `31.97.186.195`
- **SSL**: Let's Encrypt certificate (auto-renewing)
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **Node.js Port**: 3001
- **Environment**: Production

---

## 🌐 Live URLs

- **Main Website**: https://literacyunlocked.ae
- **Alternative URL**: https://www.literacyunlocked.ae
- **Health Check**: https://literacyunlocked.ae/health
- **API Base**: https://literacyunlocked.ae/api/

---

## 📂 File Locations

```
/var/www/LiteracyUnlocked/              # Application root
├── dist/                               # Built application
│   ├── public/                         # Static files served by Nginx
│   └── index.js                        # Server bundle
├── logs/                               # PM2 application logs
├── .env                                # Environment variables
└── ecosystem.config.json               # PM2 configuration

/etc/nginx/sites-available/childcomiccraft  # Nginx configuration
/etc/letsencrypt/live/literacyunlocked.ae/   # SSL certificates
```

---

## 🛠️ Management Commands

### Application Management (PM2)

```bash
# Check application status
pm2 status

# View application logs (real-time)
pm2 logs childcomiccraft

# View last 50 log lines
pm2 logs childcomiccraft --lines 50

# Restart application
pm2 restart childcomiccraft

# Stop application
pm2 stop childcomiccraft

# Start application
pm2 start childcomiccraft

# Start with ecosystem config
pm2 start ecosystem.config.json --env production

# View detailed process info
pm2 show childcomiccraft

# Monitor CPU/Memory usage
pm2 monit
```

### Web Server Management (Nginx)

```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (graceful restart)
sudo systemctl reload nginx

# Stop Nginx
sudo systemctl stop nginx

# Start Nginx
sudo systemctl start nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View application-specific logs
sudo tail -f /var/log/nginx/childcomiccraft_error.log
sudo tail -f /var/log/nginx/childcomiccraft_access.log
```

### SSL Certificate Management

```bash
# Check certificate status
sudo certbot certificates

# Test certificate renewal
sudo certbot renew --dry-run

# Force certificate renewal
sudo certbot renew --force-renewal

# Check auto-renewal timer
sudo systemctl status certbot.timer
```

---

## 🔄 Website Control (On/Off)

### 🔴 Turn Website OFF

**Option 1: Stop Application Only (Nginx shows error)**
```bash
pm2 stop childcomiccraft
```

**Option 2: Stop Nginx (Website completely inaccessible)**
```bash
sudo systemctl stop nginx
```

**Option 3: Disable Site (Most graceful)**
```bash
# Remove symlink to disable site
sudo rm /etc/nginx/sites-enabled/childcomiccraft
sudo systemctl reload nginx
```

### 🟢 Turn Website ON

**Option 1: Start Application**
```bash
pm2 start childcomiccraft
# or
pm2 start ecosystem.config.json --env production
```

**Option 2: Start Nginx**
```bash
sudo systemctl start nginx
```

**Option 3: Re-enable Site**
```bash
# Re-create symlink
sudo ln -sf /etc/nginx/sites-available/childcomiccraft /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. Website not accessible**
```bash
# Check if application is running
pm2 status

# Check if Nginx is running
sudo systemctl status nginx

# Check for port conflicts
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

**2. SSL Certificate Issues**
```bash
# Check certificate expiry
sudo certbot certificates

# Test certificate
curl -I https://literacyunlocked.ae

# Renew certificate manually
sudo certbot renew
```

**3. Application Errors**
```bash
# Check application logs
pm2 logs childcomiccraft --lines 100

# Check system resources
free -h
df -h
top
```

**4. Nginx Configuration Issues**
```bash
# Test configuration
sudo nginx -t

# Check syntax errors
sudo nginx -T
```

---

## 📊 Monitoring

### Health Checks

```bash
# Test website availability
curl -I https://literacyunlocked.ae

# Test API health
curl https://literacyunlocked.ae/health

# Test specific API endpoint
curl -X POST https://literacyunlocked.ae/api/test-openai
```

### Log Monitoring

```bash
# Watch application logs
pm2 logs childcomiccraft --lines 0

# Watch Nginx access logs
sudo tail -f /var/log/nginx/childcomiccraft_access.log

# Watch system logs
sudo journalctl -f
```

---

## 🔄 Updates and Deployments

### Code Updates

```bash
# Navigate to application directory
cd /var/www/LiteracyUnlocked

# Pull latest changes
git pull origin main

# Install new dependencies (if package.json changed)
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart childcomiccraft

# Check if everything is working
curl -I https://literacyunlocked.ae/health
```

### Environment Updates

```bash
# Edit environment variables
nano /var/www/LiteracyUnlocked/.env

# Restart application to load new environment
pm2 restart childcomiccraft
```

---

## 🔒 Security

### Firewall Status
```bash
# Check firewall rules
sudo ufw status

# Current allowed ports:
# - 22 (SSH)
# - 80 (HTTP)
# - 443 (HTTPS)
```

### SSL Security
- **Certificate**: Let's Encrypt (free, auto-renewing)
- **Expiry**: Automatically renewed before expiration
- **Security Headers**: Configured in Nginx
- **HTTPS Redirect**: Automatic for all HTTP requests

---

## 📈 Performance

### Optimization Features
- **Gzip Compression**: Enabled for text files
- **Static File Caching**: 1-year cache for assets
- **Process Management**: PM2 cluster mode
- **Memory Limit**: 1GB restart threshold

---

## 🆘 Emergency Procedures

### Complete System Restart
```bash
# Restart everything in order
sudo systemctl restart nginx
pm2 restart all
sudo systemctl restart certbot.timer
```

### Backup Important Files
```bash
# Backup application
sudo tar -czf /root/literacyunlocked-backup-$(date +%Y%m%d).tar.gz /var/www/LiteracyUnlocked

# Backup Nginx config
sudo cp /etc/nginx/sites-available/childcomiccraft /root/nginx-backup-$(date +%Y%m%d).conf

# Backup SSL certificates (auto-backed up by certbot)
sudo cp -r /etc/letsencrypt /root/letsencrypt-backup-$(date +%Y%m%d)/
```

---

## 📞 Contact & Support

- **Project Repository**: https://github.com/shamzaou/LiteracyUnlocked
- **Admin Email**: shamzaou@student.42abudhabi.ae
- **Deployment Date**: July 16, 2025

---

## 📝 Deployment History

### What Was Accomplished

1. ✅ **Application Build**: Fixed path resolution issues and built for production
2. ✅ **PM2 Setup**: Configured process management with auto-restart
3. ✅ **Nginx Configuration**: Set up reverse proxy with optimization
4. ✅ **Domain Configuration**: Configured literacyunlocked.ae domain
5. ✅ **SSL Certificate**: Installed Let's Encrypt certificate with auto-renewal
6. ✅ **Security Headers**: Implemented security best practices
7. ✅ **Performance Optimization**: Enabled gzip, caching, and compression
8. ✅ **Monitoring**: Set up logging and health checks

### Architecture

```
Internet → Nginx (Port 80/443) → Node.js App (Port 3001)
    ↓           ↓                      ↓
  HTTPS      Reverse Proxy          PM2 Process
  SSL        Static Files           Application Logic
  Domain     Compression            API Endpoints
```

---

## 🔧 Recent Fixes

### Image Editing Issue Resolved ✅
**Issue**: "Image load error - Could not load the comic image for editing"
**Root Cause**: OpenAI API returns temporary URLs that expire, making images inaccessible for editing
**Solution**: 
- Modified the image generation service to automatically download and store images locally
- Images are now saved to `/var/www/LiteracyUnlocked/dist/public/generated-images/`
- Updated Nginx configuration to serve stored images with proper caching
- Images now have permanent URLs like `/generated-images/comic-timestamp-id.png`

**Technical Details**:
- Added image download functionality in `server/openai.ts`
- Images are downloaded immediately after generation from OpenAI
- Local storage ensures images remain accessible for editing indefinitely
- Nginx serves images with 1-year cache headers for optimal performance

### Email 413 Error Fixed ✅
**Issue**: "Failed to send email - 413 Request Entity Too Large"
**Root Cause**: Both Nginx and Express had body size limits too small for email requests with HD image data
**Solution**: 
- Increased Nginx `client_max_body_size` to 50MB for both server-wide and API-specific requests
- Increased Express `json()` and `urlencoded()` limits to 50MB for large payloads
- Updated email service to convert relative image URLs to absolute URLs for better email compatibility
- Emails now include `https://literacyunlocked.ae` prefix for local image URLs

**Technical Details**:
- Added `client_max_body_size 50M;` to Nginx configuration
- Added `{ limit: '50mb' }` to Express middleware in `server/index.ts`
- Modified `server/email.ts` to handle relative URLs properly
- Email images now use absolute URLs for better email client compatibility
- Both layers now support HD image data (3MB+ files)

### 504 Gateway Timeout Fixed ✅
**Issue**: "504 Gateway Time-out" when generating HD quality comics
**Root Cause**: HD image generation (1024x1792, quality: "hd") takes longer than Nginx's default 60-second timeout
**Solution**: 
- Increased Nginx proxy timeouts to 300 seconds (5 minutes) for API routes
- Maintained 60-second connection timeout for optimal user experience
- HD image generation now completes successfully in ~55 seconds

**Technical Details**:
- Updated `proxy_read_timeout` and `proxy_send_timeout` to 300s in Nginx
- HD images are significantly larger (3.2MB vs 1.7MB for standard quality)
- Portrait format (1024x1792) provides better comic layout for mobile viewing
- Timeout settings balanced for performance vs reliability
