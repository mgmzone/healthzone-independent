# HealthZone Administration Guide
## Complete Step-by-Step Guide for Deployment, Updates, and Maintenance

---

## 🏗️ Initial Deployment

### Prerequisites
- Docker server (docker.local) with Docker Compose v2
- Cloudflare account with domain access
- Supabase project configured
- Resend account for email services
- SSH access to Docker server

### Step 1: Clone and Setup Repository
```bash
# SSH into Docker server
ssh root@docker.local

# Navigate to installation directory
cd /opt

# Clone the repository
git clone https://github.com/mgmzone/healthzone-independent.git
cd healthzone-independent

# Switch to main branch (should be default)
git checkout main
```

### Step 2: Configure Environment Variables
```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit environment file
nano .env.production
```

**Required Environment Variables:**
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_URL=https://healthzone.mgm.zone

# Deployment Configuration
NODE_ENV=production
```

### Step 3: Deploy Application
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run deployment script
./scripts/docker-deploy.sh
```

**Expected Output:**
- Environment validation ✅
- Docker image build ✅
- Container startup ✅
- Health checks ✅
- Access URLs displayed

### Step 4: Configure Cloudflare Tunnel
1. **Access Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Navigate to**: Zero Trust → Access → Tunnels
3. **Add Public Hostname**:
   - **Subdomain**: `healthzone`
   - **Domain**: `mgm.zone`
   - **Service**: `http://localhost:3001`
   - **Save**

### Step 5: Configure Supabase Edge Functions
In Supabase project dashboard → Edge Functions → Settings, add:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=HealthZone <noreply@mgm.zone>
ALLOWED_ORIGIN=https://healthzone.mgm.zone
```

### Step 6: Verify Deployment
```bash
# Test local access
curl http://localhost:3001/health
# Should return: healthy

# Test external access
curl https://healthzone.mgm.zone/health
# Should return: healthy

# Check container status
docker compose ps
```

---

## 🤖 Automated Updates Setup

### Step 1: Enable Automated Updates
```bash
# Navigate to project directory
cd /opt/healthzone-independent

# Pull latest automation scripts
git pull

# Run automated setup (one command)
sudo ./scripts/setup-auto-updates.sh
```

### Step 2: Verify Automation Services
```bash
# Check update timer status
sudo systemctl status healthzone-update.timer

# Check health monitoring
sudo systemctl status healthzone-health.timer

# View next scheduled runs
sudo systemctl list-timers healthzone-*
```

### Step 3: Test Manual Update
```bash
# Trigger manual update check
sudo systemctl start healthzone-update.service

# Watch update progress
sudo journalctl -u healthzone-update.service -f
```

---

## 📊 Daily Monitoring

### Check Overall Status
```bash
# Run comprehensive status dashboard
cd /opt/healthzone-independent
./scripts/healthzone-status.sh
```

**Status Dashboard Shows:**
- System information
- Container health
- Application health  
- External accessibility
- Repository status
- Auto-update status
- Recent activity
- Storage usage
- Backup status

### Quick Health Checks
```bash
# Application health
curl http://localhost:3001/health

# Container status
docker compose ps

# Recent logs
docker compose logs --tail=20

# Resource usage
docker stats healthzone-app --no-stream
```

### View Logs
```bash
# Application logs
docker compose logs -f

# Update logs
sudo tail -f /var/log/healthzone-updates.log

# System service logs
sudo journalctl -u healthzone-update.service -f
sudo journalctl -u healthzone-health.service -f
```

---

## 🔄 Manual Updates

### Standard Update Process
```bash
# Navigate to project
cd /opt/healthzone-independent

# Check for available updates
git fetch origin main
git log HEAD..origin/main --oneline

# Run update script
./scripts/docker-update.sh
```

### Emergency Update
```bash
# Stop automated updates temporarily
sudo systemctl stop healthzone-update.timer

# Pull specific version
git pull origin main

# Force rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify health
curl http://localhost:3001/health

# Re-enable automated updates
sudo systemctl start healthzone-update.timer
```

---

## 🛠️ Maintenance Tasks

### Weekly Maintenance
```bash
# 1. Check system status
./scripts/healthzone-status.sh

# 2. Review update logs
sudo tail -50 /var/log/healthzone-updates.log

# 3. Clean up Docker system
docker system prune -f

# 4. Check disk usage
df -h
docker system df

# 5. Verify backups
ls -la /backup/healthzone-updates/
```

### Monthly Maintenance
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Clean old backups (keep last 14 days)
sudo find /backup/healthzone-updates -name "healthzone-*" -mtime +14 -delete

# 3. Check service timers
sudo systemctl list-timers healthzone-*

# 4. Review and rotate logs if needed
sudo logrotate -f /etc/logrotate.conf
```

### Security Updates
```bash
# 1. Check for security updates
sudo apt list --upgradable | grep -i security

# 2. Apply security updates
sudo apt upgrade -y

# 3. Restart if kernel updated
sudo reboot # (if needed)

# 4. Verify services after reboot
systemctl status docker
systemctl status healthzone-update.timer
./scripts/healthzone-status.sh
```

---

## 🆘 Troubleshooting

### Container Won't Start
```bash
# 1. Check container logs
docker compose logs healthzone

# 2. Check environment variables
cat .env.production

# 3. Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Check port conflicts
sudo netstat -tulpn | grep :3001
```

### Application Not Accessible
```bash
# 1. Test local access
curl -v http://localhost:3001/

# 2. Check Cloudflare Tunnel
# (Check Cloudflare dashboard for tunnel status)

# 3. Test DNS resolution
nslookup healthzone.mgm.zone

# 4. Check firewall
sudo ufw status
```

### Updates Failing
```bash
# 1. Check update service logs
sudo journalctl -u healthzone-update.service -n 50

# 2. Check Git repository
cd /opt/healthzone-independent
git status
git fetch origin main

# 3. Manual rollback if needed
# Find latest backup
ls -t /backup/healthzone-updates/healthzone-*-image.tar.gz | head -1

# Load backup image
docker load < /backup/healthzone-updates/healthzone-YYYYMMDD_HHMMSS-image.tar.gz
docker compose down && docker compose up -d
```

### Performance Issues
```bash
# 1. Check resource usage
docker stats healthzone-app
htop

# 2. Check disk space
df -h
docker system df

# 3. Clean up if needed
docker system prune -a
docker volume prune

# 4. Check for memory leaks
docker compose restart healthzone
```

### Health Check Failures
```bash
# 1. Test health endpoint
curl -v http://localhost:3001/health

# 2. Check nginx config
docker compose exec healthzone cat /etc/nginx/conf.d/default.conf

# 3. Check container internal health
docker compose exec healthzone wget --spider http://localhost/health

# 4. Restart if needed
docker compose restart healthzone
```

---

## 📁 File Locations Reference

| Component | Location |
|-----------|----------|
| **Application Files** | `/opt/healthzone-independent/` |
| **Environment Config** | `/opt/healthzone-independent/.env.production` |
| **Docker Compose** | `/opt/healthzone-independent/docker-compose.yml` |
| **Scripts** | `/opt/healthzone-independent/scripts/` |
| **Update Logs** | `/var/log/healthzone-updates.log` |
| **Backup Images** | `/backup/healthzone-updates/` |
| **Systemd Services** | `/etc/systemd/system/healthzone-*` |

---

## 🔧 Configuration Management

### Modify Update Frequency
```bash
# Edit update timer
sudo systemctl edit healthzone-update.timer

# Add override:
[Timer]
OnCalendar=*:0/2:00  # Every 2 hours instead of 4

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart healthzone-update.timer
```

### Enable Discord Notifications
```bash
# Edit update script
sudo nano /opt/healthzone-independent/scripts/auto-update.sh

# Find and modify:
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK/URL"
```

### Adjust Resource Limits
```bash
# Edit docker-compose.yml
nano /opt/healthzone-independent/docker-compose.yml

# Modify under deploy.resources.limits:
limits:
  cpus: '1.0'      # Increase CPU
  memory: 512M     # Increase memory

# Apply changes
docker compose up -d
```

---

## 🚨 Emergency Procedures

### Complete Service Restoration
```bash
# 1. Stop all services
docker compose down
sudo systemctl stop healthzone-*.timer
sudo systemctl stop healthzone-*.service

# 2. Restore from backup
cd /opt/healthzone-independent
LATEST_BACKUP=$(ls -t /backup/healthzone-updates/healthzone-*-image.tar.gz | head -1)
docker load < "$LATEST_BACKUP"

# 3. Restore configuration
BACKUP_DATE=$(echo $LATEST_BACKUP | grep -o '[0-9]\{8\}_[0-9]\{6\}')
cp "/backup/healthzone-updates/healthzone-${BACKUP_DATE}-env.backup" .env.production

# 4. Start services
docker compose up -d
sudo systemctl start healthzone-update.timer
sudo systemctl start healthzone-health.timer

# 5. Verify
./scripts/healthzone-status.sh
```

### Disable Automatic Updates (Emergency)
```bash
# Stop and disable all automation
sudo systemctl stop healthzone-update.timer
sudo systemctl stop healthzone-health.timer
sudo systemctl disable healthzone-update.timer
sudo systemctl disable healthzone-health.timer

# Manual operations only
echo "Automatic updates disabled - manual operations only"
```

---

## 📋 Quick Reference Commands

| Task | Command |
|------|---------|
| **Status Dashboard** | `./scripts/healthzone-status.sh` |
| **View Logs** | `docker compose logs -f` |
| **Update Logs** | `sudo tail -f /var/log/healthzone-updates.log` |
| **Manual Update** | `sudo systemctl start healthzone-update.service` |
| **Restart App** | `docker compose restart` |
| **Stop App** | `docker compose down` |
| **Start App** | `docker compose up -d` |
| **Service Status** | `sudo systemctl status healthzone-*` |
| **Check Timers** | `sudo systemctl list-timers healthzone-*` |
| **Resource Usage** | `docker stats healthzone-app --no-stream` |
| **Disk Usage** | `docker system df` |
| **Health Check** | `curl http://localhost:3001/health` |
| **Collect Diagnostics** | `./scripts/collect-logs.sh` |

---

## 📞 Support Checklist

When reporting issues, collect this information:

```bash
# 1. Run status dashboard
./scripts/healthzone-status.sh > status.txt

# 2. Collect comprehensive logs
./scripts/collect-logs.sh

# 3. Check recent changes
cd /opt/healthzone-independent
git log --oneline -10

# 4. System information
uname -a
docker --version
docker compose --version
```

This provides all necessary information for troubleshooting and support.

---

**🎯 This guide covers all aspects of HealthZone administration. Bookmark this document and refer to it for all deployment, maintenance, and troubleshooting tasks.**