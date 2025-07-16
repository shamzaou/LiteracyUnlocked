#!/bin/bash

# ChildComicCraft Monitoring Script
# Checks application health and sends alerts if needed

APP_NAME="childcomiccraft"
HEALTH_URL="http://localhost:3001/health"
LOG_FILE="/var/log/childcomiccraft-monitor.log"

# Function to log with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Check if application is running
check_pm2_status() {
    if pm2 list | grep -q "$APP_NAME.*online"; then
        return 0
    else
        return 1
    fi
}

# Check application health endpoint
check_health_endpoint() {
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Restart application if needed
restart_application() {
    log_message "Attempting to restart $APP_NAME..."
    pm2 restart $APP_NAME
    sleep 10
    
    if check_pm2_status && check_health_endpoint; then
        log_message "Application restarted successfully"
        return 0
    else
        log_message "Failed to restart application"
        return 1
    fi
}

# Main monitoring logic
main() {
    log_message "Starting health check for $APP_NAME"
    
    # Check PM2 status
    if ! check_pm2_status; then
        log_message "ERROR: Application not running in PM2"
        restart_application || {
            log_message "CRITICAL: Failed to restart application"
            exit 1
        }
    fi
    
    # Check health endpoint
    if ! check_health_endpoint; then
        log_message "WARNING: Health endpoint not responding"
        restart_application || {
            log_message "CRITICAL: Failed to restart application"
            exit 1
        }
    fi
    
    # Check disk space
    DISK_USAGE=$(df /var/www | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 85 ]; then
        log_message "WARNING: Disk usage is ${DISK_USAGE}%"
    fi
    
    # Check memory usage
    MEMORY_USAGE=$(pm2 show $APP_NAME | grep "memory usage" | awk '{print $4}' | sed 's/M//')
    if [ ! -z "$MEMORY_USAGE" ] && [ "$MEMORY_USAGE" -gt 800 ]; then
        log_message "WARNING: High memory usage: ${MEMORY_USAGE}MB"
    fi
    
    log_message "Health check completed successfully"
}

# Run the monitoring
main
