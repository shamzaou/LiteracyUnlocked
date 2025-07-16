#!/bin/bash

# ChildComicCraft Backup Script
# Creates a backup of the application and database

set -e

BACKUP_DIR="/root/backups"
APP_DIR="/var/www/ChildComicCraft"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="childcomiccraft_backup_$DATE"

echo "📦 Creating backup: $BACKUP_NAME"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create application backup
echo "Backing up application files..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_app.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=logs \
    -C /var/www \
    ChildComicCraft

# Backup environment file separately (sensitive)
echo "Backing up environment configuration..."
cp "$APP_DIR/.env" "$BACKUP_DIR/${BACKUP_NAME}_env.txt"

# If using PostgreSQL locally, backup database
if [ ! -z "$DATABASE_URL" ] && [[ $DATABASE_URL == *"localhost"* ]]; then
    echo "Backing up local database..."
    # Extract database name from URL
    DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
    pg_dump $DB_NAME > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"
fi

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "childcomiccraft_backup_*" -mtime +7 -delete

echo "✅ Backup created successfully:"
echo "Application: $BACKUP_DIR/${BACKUP_NAME}_app.tar.gz"
echo "Environment: $BACKUP_DIR/${BACKUP_NAME}_env.txt"
[ -f "$BACKUP_DIR/${BACKUP_NAME}_database.sql" ] && echo "Database: $BACKUP_DIR/${BACKUP_NAME}_database.sql"

echo ""
echo "Backup size:"
du -sh "$BACKUP_DIR/${BACKUP_NAME}"*
