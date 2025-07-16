#!/bin/bash

# ChildComicCraft Deployment Script
# Run this script on your VPS to deploy the application

set -e  # Exit on any error

echo "🚀 Starting ChildComicCraft deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="childcomiccraft"
APP_DIR="/var/www/ChildComicCraft"
NGINX_AVAILABLE="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
else
    print_status "PM2 already installed"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt install -y nginx
else
    print_status "Nginx already installed"
fi

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git pull origin main || git pull origin master
else
    print_status "Cloning repository..."
    git clone https://github.com/shamzaou/ChildComicCraft.git $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build application
print_status "Building application..."
npm run build

# Set up environment file
if [ ! -f "$APP_DIR/.env" ]; then
    print_warning "Environment file not found. Creating from template..."
    cp .env.production .env
    print_warning "Please edit $APP_DIR/.env with your actual values"
    print_warning "Required variables: OPENAI_API_KEY, DATABASE_URL, SESSION_SECRET"
fi

# Set proper permissions
print_status "Setting permissions..."
chown -R www-data:www-data $APP_DIR
chmod +x $APP_DIR/scripts/*.sh 2>/dev/null || true

# Configure Nginx
if [ ! -f "$NGINX_AVAILABLE" ]; then
    print_status "Configuring Nginx..."
    cp nginx.conf $NGINX_AVAILABLE
    
    # Prompt for domain name
    read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME
    if [ ! -z "$DOMAIN_NAME" ]; then
        sed -i "s/yourdomain.com/$DOMAIN_NAME/g" $NGINX_AVAILABLE
        print_status "Updated Nginx config with domain: $DOMAIN_NAME"
    fi
    
    # Enable site
    ln -sf $NGINX_AVAILABLE $NGINX_ENABLED
    
    # Test Nginx configuration
    if nginx -t; then
        print_status "Nginx configuration is valid"
        systemctl reload nginx
    else
        print_error "Nginx configuration has errors"
        exit 1
    fi
else
    print_status "Nginx already configured"
fi

# Configure firewall
print_status "Configuring firewall..."
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# Start application with PM2
print_status "Starting application with PM2..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.json
pm2 save
pm2 startup systemd -u root --hp /root

# Run database migrations
print_status "Running database migrations..."
npm run db:push || print_warning "Database migration failed - please check your DATABASE_URL"

print_status "✅ Deployment completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Edit $APP_DIR/.env with your actual environment variables"
print_status "2. Restart the application: pm2 restart $APP_NAME"
print_status "3. (Optional) Set up SSL certificate: certbot --nginx -d yourdomain.com"
print_status ""
print_status "Useful commands:"
print_status "- Check application status: pm2 status"
print_status "- View logs: pm2 logs $APP_NAME"
print_status "- Restart application: pm2 restart $APP_NAME"
print_status "- Test Nginx: nginx -t"
