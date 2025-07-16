#!/bin/bash

# ChildComicCraft Update Script
# Run this script to update the application after making changes

set -e

APP_NAME="childcomiccraft"
APP_DIR="/var/www/ChildComicCraft"

echo "🔄 Updating ChildComicCraft..."

cd $APP_DIR

# Pull latest changes
echo "Pulling latest changes..."
git pull

# Install/update dependencies
echo "Updating dependencies..."
npm install

# Build application
echo "Building application..."
npm run build

# Restart application
echo "Restarting application..."
pm2 restart $APP_NAME

# Run database migrations if needed
echo "Running database migrations..."
npm run db:push

echo "✅ Update completed successfully!"
echo "Application status:"
pm2 status $APP_NAME
