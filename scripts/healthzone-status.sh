#!/bin/bash

# HealthZone Status Dashboard
# Shows comprehensive status of your HealthZone deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Function to print status with color
print_status() {
    local status="$1"
    local message="$2"
    
    case $status in
        "OK") echo -e "${GREEN}✅ $message${NC}";;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}";;
        "ERROR") echo -e "${RED}❌ $message${NC}";;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}";;
        "HEADER") echo -e "\n${BOLD}${BLUE}$message${NC}";;
    esac
}

print_status "HEADER" "🏥 HealthZone Status Dashboard"

# System Information
print_status "HEADER" "System Information"
echo "  Hostname: $(hostname)"
echo "  Uptime: $(uptime -p)"
echo "  Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"

# Container Status
print_status "HEADER" "Container Status"
if docker compose ps | grep -q healthzone-app; then
    CONTAINER_STATUS=$(docker inspect healthzone-app --format '{{.State.Status}}')
    CONTAINER_HEALTH=$(docker inspect healthzone-app --format '{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    
    if [ "$CONTAINER_STATUS" = "running" ]; then
        print_status "OK" "Container is running"
        
        if [ "$CONTAINER_HEALTH" = "healthy" ]; then
            print_status "OK" "Health check: healthy"
        elif [ "$CONTAINER_HEALTH" = "starting" ]; then
            print_status "WARNING" "Health check: starting"
        elif [ "$CONTAINER_HEALTH" = "unhealthy" ]; then
            print_status "ERROR" "Health check: unhealthy"
        else
            print_status "INFO" "Health check: $CONTAINER_HEALTH"
        fi
    else
        print_status "ERROR" "Container status: $CONTAINER_STATUS"
    fi
    
    # Container resource usage
    echo "  Resource usage:"
    docker stats --no-stream healthzone-app --format "    CPU: {{.CPUPerc}}  Memory: {{.MemUsage}}" 2>/dev/null || echo "    Resource info unavailable"
else
    print_status "ERROR" "Container not found or not running"
fi

# Application Health
print_status "HEADER" "Application Health"
if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
    print_status "OK" "HTTP health check passed"
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3001/)
    echo "  Response time: ${RESPONSE_TIME}s"
else
    print_status "ERROR" "HTTP health check failed"
fi

# Check if accessible via domain
if [ -n "$(grep VITE_APP_URL /opt/healthzone-independent/.env.production 2>/dev/null)" ]; then
    DOMAIN=$(grep VITE_APP_URL /opt/healthzone-independent/.env.production | cut -d'=' -f2)
    if curl -f -s "$DOMAIN/health" > /dev/null 2>&1; then
        print_status "OK" "External access via $DOMAIN working"
    else
        print_status "WARNING" "External access via $DOMAIN may have issues"
    fi
fi

# Git Status
print_status "HEADER" "Repository Status"
if [ -d "/opt/healthzone-independent/.git" ]; then
    cd /opt/healthzone-independent
    CURRENT_COMMIT=$(git rev-parse HEAD)
    CURRENT_BRANCH=$(git branch --show-current)
    
    echo "  Branch: $CURRENT_BRANCH"
    echo "  Commit: ${CURRENT_COMMIT:0:8}"
    
    # Check if there are available updates
    git fetch origin main 2>/dev/null
    REMOTE_COMMIT=$(git rev-parse origin/main)
    
    if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
        print_status "OK" "Repository is up to date"
    else
        print_status "WARNING" "Updates available: ${CURRENT_COMMIT:0:8} -> ${REMOTE_COMMIT:0:8}"
    fi
else
    print_status "WARNING" "Git repository not found"
fi

# Auto-update Status
print_status "HEADER" "Auto-Update Status"
if systemctl is-enabled healthzone-update.timer >/dev/null 2>&1; then
    if systemctl is-active healthzone-update.timer >/dev/null 2>&1; then
        print_status "OK" "Auto-updates enabled and running"
        NEXT_UPDATE=$(systemctl list-timers healthzone-update.timer --no-pager | grep healthzone-update.timer | awk '{print $1, $2}')
        echo "  Next check: $NEXT_UPDATE"
    else
        print_status "WARNING" "Auto-updates enabled but timer not running"
    fi
else
    print_status "INFO" "Auto-updates not configured"
fi

# Recent Logs
print_status "HEADER" "Recent Activity"
if [ -f "/var/log/healthzone-updates.log" ]; then
    echo "  Last 3 update log entries:"
    tail -3 /var/log/healthzone-updates.log | sed 's/^/    /'
else
    print_status "INFO" "No update logs found"
fi

# Disk Usage
print_status "HEADER" "Storage Information"
echo "  Docker disk usage:"
docker system df | tail -n +2 | sed 's/^/    /'

# Backup Status
if [ -d "/backup/healthzone-updates" ]; then
    BACKUP_COUNT=$(find /backup/healthzone-updates -name "healthzone-*" 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        print_status "OK" "$BACKUP_COUNT backup(s) available"
        LATEST_BACKUP=$(ls -t /backup/healthzone-updates/healthzone-* 2>/dev/null | head -1 | xargs basename)
        echo "  Latest: $LATEST_BACKUP"
    else
        print_status "WARNING" "No backups found"
    fi
else
    print_status "INFO" "Backup directory not found"
fi

echo ""
print_status "INFO" "For more details:"
echo "  Container logs: docker compose logs -f"
echo "  Update logs:    tail -f /var/log/healthzone-updates.log"
echo "  System status:  systemctl status healthzone-*"