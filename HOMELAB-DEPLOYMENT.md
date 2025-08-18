# HealthZone Homelab Deployment Guide
## Docker + Cloudflare Tunnel Setup

This guide covers deploying HealthZone to your homelab using Docker containers with Cloudflare Tunnel for secure external access.

## 🏗️ Architecture Overview

```
Internet → Cloudflare Edge → Cloudflare Tunnel → Docker Container (nginx)
```

**Benefits:**
- ✅ No port forwarding required
- ✅ Automatic SSL/TLS termination  
- ✅ DDoS protection via Cloudflare
- ✅ CDN for static assets
- ✅ Easy subdomain management
- ✅ Container isolation and easy updates

## 📋 Prerequisites

### Required Software
- Docker and Docker Compose
- Cloudflare account with domain
- Cloudflared (Cloudflare Tunnel daemon)

### Required Services  
- Supabase project (database/auth)
- Resend account (email service)

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.production

# Edit with your actual values
nano .env.production
```

Required environment variables:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://healthzone.yourdomain.com
```

### 2. Deploy with Docker
```bash
# Make scripts executable (if not already)
chmod +x scripts/*.sh

# Deploy the application
./scripts/docker-deploy.sh
```

### 3. Configure Cloudflare Tunnel

#### Option A: Using Cloudflare Dashboard
1. Go to **Zero Trust** → **Access** → **Tunnels**
2. Create a new tunnel named `homelab` or similar
3. Install `cloudflared` on your homelab server
4. Add a public hostname:
   - **Subdomain**: `healthzone`  
   - **Domain**: `yourdomain.com`
   - **Service**: `http://localhost:3001`

#### Option B: Using CLI
```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create healthzone-tunnel

# Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: <your-tunnel-id>
credentials-file: ~/.cloudflared/<your-tunnel-id>.json

ingress:
  - hostname: healthzone.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
EOF

# Start tunnel
cloudflared tunnel run healthzone-tunnel
```

## 🔧 Container Management

### Daily Operations
```bash
# View status
docker-compose ps

# View logs  
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
./scripts/docker-update.sh
```

### Health Monitoring
```bash
# Check application health
curl http://localhost:3001/health

# Container health status
docker-compose ps
```

## 🔒 Security Configuration

### Cloudflare Settings
1. **SSL/TLS**: Set to "Full" or "Full (strict)"
2. **Security Level**: Medium or High
3. **Browser Integrity Check**: Enable
4. **Challenge Passage**: Enable

### Firewall Rules (Optional)
Create Cloudflare firewall rules to:
- Block suspicious traffic
- Rate limit requests
- Geo-block if needed

## 📊 Performance Optimization

### Cloudflare Caching
The nginx configuration sets appropriate cache headers:
- Static assets: 1 year cache
- HTML files: No cache
- API responses: Handled by Supabase

### Container Resources
Current limits in `docker-compose.yml`:
- CPU: 0.5 cores max, 0.1 reserved
- Memory: 256MB max, 64MB reserved

Adjust based on your homelab resources.

## 🔄 Update Process

### Automatic Updates (Recommended)
```bash
# Create a cron job for weekly updates
crontab -e

# Add this line for Sunday 2 AM updates
0 2 * * 0 cd /path/to/healthzone && ./scripts/docker-update.sh >> /var/log/healthzone-updates.log 2>&1
```

### Manual Updates
```bash
# Update from git and rebuild
./scripts/docker-update.sh

# Or clean rebuild
./scripts/docker-deploy.sh --clean
```

## 🐛 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs healthzone

# Check environment variables
docker-compose exec healthzone env | grep VITE_

# Rebuild clean
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Cloudflare Tunnel Issues
```bash
# Check tunnel status
cloudflared tunnel info <tunnel-id>

# Test local connection
curl http://localhost:3001/health

# Check tunnel logs
journalctl -u cloudflared
```

#### Application Not Loading
1. Verify environment variables are set correctly
2. Check Supabase connection
3. Verify Cloudflare DNS settings
4. Test direct container access: `http://your-server-ip:3001`

### Log Locations
- Container logs: `docker-compose logs`
- Nginx logs: Stored in `healthzone-logs` volume
- Tunnel logs: System journal or Cloudflare dashboard

## 📈 Monitoring

### Basic Monitoring
```bash
# Create monitoring script
cat > monitor-healthzone.sh << 'EOF'
#!/bin/bash
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ HealthZone is healthy"
else
    echo "❌ HealthZone is down"
    # Optional: restart container
    # docker-compose restart healthzone
fi
EOF

chmod +x monitor-healthzone.sh

# Add to cron for every 5 minutes
*/5 * * * * /path/to/monitor-healthzone.sh
```

### Advanced Monitoring (Optional)
- **Uptime Kuma**: Container monitoring dashboard
- **Grafana + Prometheus**: Full metrics stack
- **Cloudflare Analytics**: Built-in web analytics

## 🗄️ Backup Strategy

### Application Backup
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/healthzone"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/healthzone-app-$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  /path/to/healthzone

# Backup environment and config
cp .env.production $BACKUP_DIR/env-$DATE.backup
cp docker-compose.yml $BACKUP_DIR/docker-compose-$DATE.backup

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Database Backup
Your data is in Supabase, which handles backups. Consider:
1. Regular database exports
2. Point-in-time recovery setup
3. Cross-region replication if needed

## 🆘 Disaster Recovery

### Full Recovery Process
1. **Restore server/container**:
   ```bash
   cd /path/to/healthzone
   ./scripts/docker-deploy.sh
   ```

2. **Restore configuration**:
   ```bash
   cp env-backup.backup .env.production
   ```

3. **Verify services**:
   ```bash
   curl https://healthzone.yourdomain.com/health
   ```

## 📞 Support

### Log Collection for Support
```bash
# Collect all relevant logs
./scripts/collect-logs.sh
```

### Performance Metrics
```bash
# Container resource usage
docker stats healthzone-app

# System resources  
htop
df -h
```

---

## 🎯 Summary

Your HealthZone deployment uses:
- **Docker container** for isolation and easy management
- **Nginx** for efficient static file serving
- **Cloudflare Tunnel** for secure external access
- **Automatic health checks** for reliability
- **Resource limits** for homelab optimization

This setup provides enterprise-grade reliability with homelab simplicity! 🏠✨