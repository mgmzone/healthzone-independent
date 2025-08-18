#!/bin/bash

# HealthZone Automated Update Script
# This script pulls latest changes and updates the Docker container if needed

set -e

# Configuration
PROJECT_DIR="/opt/healthzone-independent"
BACKUP_DIR="/backup/healthzone-updates"
LOG_FILE="/var/log/healthzone-updates.log"
DISCORD_WEBHOOK_URL=""  # Optional: Add your Discord webhook for notifications

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send Discord notification (optional)
send_notification() {
    local message="$1"
    local status="$2"  # success, warning, error
    
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        local color=""
        case $status in
            "success") color="3066993";;  # Green
            "warning") color="16776960";; # Yellow  
            "error") color="15158332";;   # Red
        esac
        
        curl -H "Content-Type: application/json" \
             -X POST \
             -d "{\"embeds\":[{\"title\":\"HealthZone Update\",\"description\":\"$message\",\"color\":$color,\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}]}" \
             "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
}

# Function to create backup before update
create_backup() {
    local backup_name="healthzone-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    log_message "Creating backup: $backup_name"
    
    # Export current container image as backup
    docker save healthzone-independent-healthzone:latest | gzip > "$BACKUP_DIR/$backup_name-image.tar.gz"
    
    # Backup environment and configuration
    cp "$PROJECT_DIR/.env.production" "$BACKUP_DIR/$backup_name-env.backup" 2>/dev/null || true
    cp "$PROJECT_DIR/docker-compose.yml" "$BACKUP_DIR/$backup_name-docker-compose.yml"
    
    # Keep only last 7 backups
    find "$BACKUP_DIR" -name "healthzone-*" -mtime +7 -delete 2>/dev/null || true
    
    echo "$backup_name"
}

# Function to rollback if update fails
rollback() {
    local backup_name="$1"
    log_message "ROLLING BACK: Loading backup image $backup_name"
    
    if [ -f "$BACKUP_DIR/$backup_name-image.tar.gz" ]; then
        docker load < "$BACKUP_DIR/$backup_name-image.tar.gz"
        cd "$PROJECT_DIR"
        docker compose down
        docker compose up -d
        log_message "Rollback completed"
        send_notification "🔄 HealthZone update failed and was rolled back to $backup_name" "warning"
    else
        log_message "ERROR: Backup image not found for rollback"
        send_notification "❌ HealthZone update failed and rollback also failed!" "error"
    fi
}

# Main update function
main() {
    log_message "🔄 Starting automated update check"
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        log_message "ERROR: Project directory $PROJECT_DIR not found"
        send_notification "❌ HealthZone project directory not found: $PROJECT_DIR" "error"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Fetch latest changes from remote
    log_message "Fetching latest changes from repository"
    git fetch origin main
    
    # Check if updates are available
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/main)
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        log_message "✅ No updates available. Current version: ${LOCAL_COMMIT:0:8}"
        exit 0
    fi
    
    log_message "📥 Updates available: ${LOCAL_COMMIT:0:8} -> ${REMOTE_COMMIT:0:8}"
    send_notification "📥 HealthZone updates available, starting deployment..." "warning"
    
    # Create backup before update
    BACKUP_NAME=$(create_backup)
    
    # Pull latest changes
    log_message "Pulling latest changes"
    if ! git pull origin main; then
        log_message "ERROR: Failed to pull latest changes"
        send_notification "❌ Failed to pull latest HealthZone changes" "error"
        exit 1
    fi
    
    # Check if container is currently running
    if docker compose ps | grep -q "healthzone-app"; then
        CONTAINER_WAS_RUNNING=true
        log_message "Container is running, will restart after update"
    else
        CONTAINER_WAS_RUNNING=false
        log_message "Container is not running"
    fi
    
    # Update the application
    log_message "🏗️ Building updated container"
    if ! docker compose build --no-cache; then
        log_message "ERROR: Failed to build updated container"
        rollback "$BACKUP_NAME"
        exit 1
    fi
    
    # Restart services
    log_message "🔄 Restarting services"
    if ! docker compose down; then
        log_message "WARNING: Failed to stop container gracefully"
    fi
    
    if ! docker compose up -d; then
        log_message "ERROR: Failed to start updated container"
        rollback "$BACKUP_NAME"
        exit 1
    fi
    
    # Wait for service to be ready
    log_message "⏳ Waiting for service to be ready"
    sleep 15
    
    # Health check
    for i in {1..6}; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_message "✅ Update completed successfully! New version: ${REMOTE_COMMIT:0:8}"
            send_notification "✅ HealthZone updated successfully to version ${REMOTE_COMMIT:0:8}" "success"
            
            # Clean up old images
            docker image prune -f > /dev/null 2>&1 || true
            
            exit 0
        fi
        log_message "Health check attempt $i/6 failed, retrying..."
        sleep 10
    done
    
    # If we get here, health check failed
    log_message "ERROR: Health check failed after update"
    rollback "$BACKUP_NAME"
    exit 1
}

# Run main function
main "$@"