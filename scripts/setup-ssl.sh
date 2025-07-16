#!/bin/bash

# SSL Certificate Setup Script for ChildComicCraft
# Sets up Let's Encrypt SSL certificate using Certbot

set -e

echo "🔒 Setting up SSL certificate for ChildComicCraft..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script as root (use sudo)"
    exit 1
fi

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Prompt for domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
read -p "Enter www subdomain as well? (y/n): " INCLUDE_WWW

# Build domain list
DOMAINS="-d $DOMAIN_NAME"
if [ "$INCLUDE_WWW" = "y" ] || [ "$INCLUDE_WWW" = "Y" ]; then
    DOMAINS="$DOMAINS -d www.$DOMAIN_NAME"
fi

# Prompt for email
read -p "Enter your email address for certificate notifications: " EMAIL

echo "Setting up SSL certificate for: $DOMAIN_NAME"

# Test Nginx configuration first
if ! nginx -t; then
    echo "Nginx configuration has errors. Please fix them first."
    exit 1
fi

# Obtain certificate
echo "Obtaining SSL certificate..."
certbot --nginx $DOMAINS --email $EMAIL --agree-tos --no-eff-email --redirect

# Test certificate renewal
echo "Testing certificate renewal..."
certbot renew --dry-run

# Set up auto-renewal cron job
if ! crontab -l | grep -q "certbot renew"; then
    echo "Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
fi

echo "✅ SSL certificate setup completed!"
echo ""
echo "Your site should now be accessible via HTTPS:"
echo "https://$DOMAIN_NAME"
[ "$INCLUDE_WWW" = "y" ] && echo "https://www.$DOMAIN_NAME"
echo ""
echo "Certificate will auto-renew every 12 hours."
echo "You can manually renew with: certbot renew"
