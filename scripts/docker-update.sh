#!/bin/bash

# HealthZone Docker Update Script
# Quick update script for homelab deployments

set -e

echo "🔄 Updating HealthZone..."

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Rebuild and restart
echo "🏗️  Rebuilding container..."
docker compose build --no-cache

echo "🔄 Restarting services..."
docker compose down
docker compose up -d

echo "⏳ Waiting for service to be ready..."
sleep 10

# Check health
if docker compose ps | grep -q "healthy"; then
    echo "✅ Update completed successfully!"
    docker compose ps
else
    echo "❌ Service may not be healthy. Check logs:"
    docker compose logs --tail=20
fi