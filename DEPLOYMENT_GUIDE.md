# Production Deployment Guide for ChildComicCraft

## Overview
This guide will help you deploy ChildComicCraft to your Hostinger VPS with a custom domain.

## Prerequisites
- Hostinger KVM 2 VPS
- Domain name pointed to your VPS IP
- SSH access to your VPS

## Step 1: VPS Initial Setup

### 1.1 Connect to your VPS
```bash
ssh root@your-server-ip
```

### 1.2 Update the system
```bash
apt update && apt upgrade -y
```

### 1.3 Install required software
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx for reverse proxy
apt install -y nginx

# Install Git
apt install -y git

# Install UFW firewall
apt install -y ufw
```

### 1.4 Configure firewall
```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

## Step 2: Deploy Application

### 2.1 Clone your repository
```bash
cd /var/www
git clone https://github.com/shamzaou/ChildComicCraft.git
cd ChildComicCraft
```

### 2.2 Install dependencies and build
```bash
npm install
npm run build
```

### 2.3 Set up environment variables
```bash
cp .env.example .env
nano .env
```

Add your production environment variables:
```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_url_here
SESSION_SECRET=your_very_secure_session_secret_here
```

### 2.4 Start application with PM2
```bash
pm2 start dist/index.js --name "childcomiccraft"
pm2 save
pm2 startup
```

## Step 3: Configure Nginx

### 3.1 Create Nginx configuration
```bash
nano /etc/nginx/sites-available/childcomiccraft
```

### 3.2 Test and enable configuration
```bash
nginx -t
ln -s /etc/nginx/sites-available/childcomiccraft /etc/nginx/sites-enabled/
systemctl restart nginx
```

## Step 4: SSL Certificate (Optional but Recommended)

### 4.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 4.2 Obtain SSL certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 5: Database Setup

### 5.1 Set up your database (if using external service like Neon)
- Create database on your preferred service
- Update DATABASE_URL in .env file

### 5.2 Run database migrations
```bash
npm run db:push
```

## Step 6: Monitoring and Maintenance

### 6.1 Monitor application
```bash
pm2 status
pm2 logs childcomiccraft
```

### 6.2 Set up automatic updates (optional)
```bash
crontab -e
```

Add this line for daily updates at 2 AM:
```
0 2 * * * cd /var/www/ChildComicCraft && git pull && npm install && npm run build && pm2 restart childcomiccraft
```

## Troubleshooting

### Common issues:
1. **Port already in use**: Change PORT in .env
2. **Permission denied**: Check file permissions with `chown -R www-data:www-data /var/www/ChildComicCraft`
3. **Nginx not starting**: Check config with `nginx -t`
4. **App crashes**: Check logs with `pm2 logs childcomiccraft`

## Security Considerations
- Keep system updated: `apt update && apt upgrade`
- Use strong passwords
- Consider fail2ban for SSH protection
- Regular backups of your application and database
- Monitor logs regularly

## Backup Strategy
```bash
# Create backup script
nano /root/backup.sh

# Add automated backups to crontab
crontab -e
```
