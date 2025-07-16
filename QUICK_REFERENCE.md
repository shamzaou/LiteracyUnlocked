# Quick Reference - LiteracyUnlocked Management

## 🚀 Quick Status Check
```bash
# Check everything is running
pm2 status && sudo systemctl status nginx
```

## 🔄 Website Control

### Turn OFF 🔴
```bash
# Graceful shutdown (recommended)
pm2 stop childcomiccraft

# Complete shutdown
sudo systemctl stop nginx
pm2 stop childcomiccraft
```

### Turn ON 🟢
```bash
# Start everything
sudo systemctl start nginx
pm2 start ecosystem.config.json --env production
```

## 🔧 Most Common Commands

### Restart After Changes
```bash
cd /var/www/LiteracyUnlocked
git pull
npm run build
pm2 restart childcomiccraft
```

### Check Logs
```bash
# Application logs
pm2 logs childcomiccraft --lines 20

# Website access logs
sudo tail /var/log/nginx/childcomiccraft_access.log

# Error logs
sudo tail /var/log/nginx/childcomiccraft_error.log
```

### Test Website
```bash
# Quick health check
curl https://literacyunlocked.ae/health

# Full website test
curl -I https://literacyunlocked.ae
```

## 🆘 Emergency Reset
```bash
# Nuclear option - restart everything
sudo systemctl restart nginx
pm2 restart all
```

---

**Live Website**: https://literacyunlocked.ae  
**Admin**: shamzaou@student.42abudhabi.ae  
**Server IP**: 31.97.186.195
