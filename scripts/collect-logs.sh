#!/bin/bash

# HealthZone Log Collection Script
# For troubleshooting and support

DATE=$(date +%Y%m%d_%H%M%S)
LOG_DIR="/tmp/healthzone-logs-$DATE"

echo "📋 Collecting HealthZone logs and diagnostics..."

mkdir -p "$LOG_DIR"

# System information
echo "🖥️ Collecting system info..."
{
    echo "=== System Information ==="
    uname -a
    echo ""
    echo "=== Docker Version ==="
    docker --version
    docker-compose --version
    echo ""
    echo "=== Disk Usage ==="
    df -h
    echo ""
    echo "=== Memory Usage ==="
    free -h
} > "$LOG_DIR/system-info.txt"

# Docker information
echo "🐳 Collecting Docker info..."
{
    echo "=== Docker System Info ==="
    docker system info 2>/dev/null || echo "Docker system info failed"
    echo ""
    echo "=== Container Status ==="
    docker-compose ps 2>/dev/null || echo "Docker compose ps failed"
    echo ""
    echo "=== Docker Images ==="
    docker images | grep healthzone
} > "$LOG_DIR/docker-info.txt"

# Application logs
echo "📄 Collecting application logs..."
if docker-compose ps | grep -q healthzone; then
    docker-compose logs --tail=1000 > "$LOG_DIR/app-logs.txt" 2>&1
else
    echo "No running healthzone container found" > "$LOG_DIR/app-logs.txt"
fi

# Configuration (sanitized)
echo "⚙️ Collecting configuration..."
{
    echo "=== Docker Compose Configuration ==="
    cat docker-compose.yml 2>/dev/null || echo "docker-compose.yml not found"
    echo ""
    echo "=== Environment Variables (sanitized) ==="
    if [ -f ".env.production" ]; then
        grep -v "KEY\|SECRET\|TOKEN" .env.production | grep -v "^#" || echo "No safe env vars to show"
    elif [ -f ".env.local" ]; then
        grep -v "KEY\|SECRET\|TOKEN" .env.local | grep -v "^#" || echo "No safe env vars to show"
    else
        echo "No environment file found"
    fi
} > "$LOG_DIR/configuration.txt"

# Health checks
echo "🏥 Running health checks..."
{
    echo "=== Container Health Check ==="
    if docker-compose ps | grep -q healthy; then
        echo "Container is healthy"
    else
        echo "Container is not healthy"
    fi
    echo ""
    echo "=== HTTP Health Check ==="
    curl -s http://localhost:3001/health 2>&1 || echo "Health endpoint not accessible"
    echo ""
    echo "=== Port Check ==="
    netstat -tulpn | grep :3001 || echo "Port 3001 not listening"
} > "$LOG_DIR/health-checks.txt"

# Resource usage
echo "📊 Collecting resource usage..."
{
    echo "=== Container Resource Usage ==="
    docker stats --no-stream healthzone-app 2>/dev/null || echo "Container stats not available"
    echo ""
    echo "=== Process List ==="
    ps aux | grep -E "(docker|nginx|cloudflared)" | grep -v grep
} > "$LOG_DIR/resource-usage.txt"

# Create archive
echo "📦 Creating log archive..."
cd /tmp
tar -czf "healthzone-logs-$DATE.tar.gz" "healthzone-logs-$DATE/"

echo "✅ Log collection complete!"
echo ""
echo "📁 Logs collected in: /tmp/healthzone-logs-$DATE.tar.gz"
echo "📧 You can send this file for support or debugging"
echo ""
echo "🔍 Quick summary:"
echo "   System: $(uname -s) $(uname -r)"
echo "   Docker: $(docker --version 2>/dev/null || echo 'Not available')"
echo "   Container: $(docker-compose ps 2>/dev/null | grep healthzone || echo 'Not running')"
echo ""

# Cleanup
rm -rf "$LOG_DIR"