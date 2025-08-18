# HealthZone Automated Updates

This document covers the automated update system for your HealthZone homelab deployment.

## 🤖 Overview

The automated update system provides:
- **Automatic git pulls** every 4 hours
- **Zero-downtime updates** when changes are detected
- **Automatic rollback** if updates fail
- **Health monitoring** every 5 minutes
- **Backup creation** before each update
- **Discord notifications** (optional)

## 🚀 Setup Instructions

### On Your Docker Server (docker.local):

```bash
# Navigate to project directory
cd /opt/healthzone-independent

# Pull the latest automation scripts
git pull

# Run the automated setup
sudo ./scripts/setup-auto-updates.sh
```

This creates:
- systemd services for updates and monitoring
- Automatic backup system
- Health check monitoring
- Log rotation

## 📊 Monitoring & Status

### Check Overall Status
```bash
# Comprehensive status dashboard
./scripts/healthzone-status.sh
```

### Check Service Status
```bash
# Auto-update timer status
sudo systemctl status healthzone-update.timer

# Health check timer status  
sudo systemctl status healthzone-health.timer

# View recent update logs
sudo journalctl -u healthzone-update.service -n 50
```

### Manual Operations
```bash
# Trigger manual update check
sudo systemctl start healthzone-update.service

# View real-time logs
sudo journalctl -u healthzone-update.service -f

# Check when next update will run
sudo systemctl list-timers healthzone-*
```

## 🔧 Configuration

### Update Frequency
Edit `/etc/systemd/system/healthzone-update.timer`:
```ini
[Timer]
# Run every 4 hours (change as needed)
OnCalendar=*:0/4:00
```

Then reload: `sudo systemctl daemon-reload && sudo systemctl restart healthzone-update.timer`

### Discord Notifications (Optional)
Edit the auto-update script:
```bash
sudo nano /opt/healthzone-independent/scripts/auto-update.sh

# Add your Discord webhook URL
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK/URL"
```

### Backup Retention
By default, backups are kept for 7 days. Change this in `auto-update.sh`:
```bash
# Keep only last X backups (change +7 to desired days)
find "$BACKUP_DIR" -name "healthzone-*" -mtime +7 -delete
```

## 📁 File Locations

| Item | Location |
|------|----------|
| Update logs | `/var/log/healthzone-updates.log` |
| Backup images | `/backup/healthzone-updates/` |
| Service files | `/etc/systemd/system/healthzone-*` |
| Scripts | `/opt/healthzone-independent/scripts/` |

## 🔄 Update Process

When updates are available, the system:

1. **Fetches** latest changes from GitHub
2. **Creates backup** of current container image
3. **Pulls** new code from repository  
4. **Builds** new Docker image
5. **Gracefully stops** old container
6. **Starts** new container
7. **Health checks** the new deployment
8. **Rolls back** if health checks fail
9. **Cleans up** old images and backups
10. **Sends notification** (if configured)

## 🆘 Troubleshooting

### Updates Not Running
```bash
# Check timer status
sudo systemctl status healthzone-update.timer

# Check if timer is enabled
sudo systemctl is-enabled healthzone-update.timer

# View timer logs
sudo journalctl -u healthzone-update.timer
```

### Update Failures
```bash
# Check update service logs
sudo journalctl -u healthzone-update.service -n 100

# Manual rollback to specific backup
cd /opt/healthzone-independent
sudo docker load < /backup/healthzone-updates/healthzone-YYYYMMDD_HHMMSS-image.tar.gz
sudo docker compose down && sudo docker compose up -d
```

### Health Check Issues
```bash
# Test health endpoint manually
curl http://localhost:3001/health

# Check health timer
sudo systemctl status healthzone-health.timer

# View health check logs
sudo journalctl -u healthzone-health.service -n 20
```

### Disk Space Issues
```bash
# Clean up old Docker images
docker system prune -a

# Clean up old backups manually
sudo find /backup/healthzone-updates -name "healthzone-*" -mtime +3 -delete

# Check disk usage
df -h
docker system df
```

## 🔒 Security Notes

- Services run as root (required for Docker access)
- Backups contain sensitive configuration
- Ensure `/backup` directory has proper permissions
- Consider encrypting backup directory
- Monitor logs for unauthorized access attempts

## 📈 Customization

### Adding Custom Health Checks
Edit `healthzone-health.service` to add more checks:
```bash
sudo systemctl edit healthzone-health.service
```

### Custom Notification Systems
Modify `auto-update.sh` to add:
- Slack notifications
- Email alerts  
- SMS notifications
- Custom webhook endpoints

### Pre/Post Update Hooks
Add custom scripts in the update process:
```bash
# In auto-update.sh, add before/after main update logic
# source ./scripts/pre-update-hook.sh
# ... update logic ...
# source ./scripts/post-update-hook.sh
```

## 📞 Support

If you encounter issues:

1. **Check status**: `./scripts/healthzone-status.sh`
2. **Collect logs**: `./scripts/collect-logs.sh`  
3. **Review this documentation**
4. **Check systemd journals**: `journalctl -u healthzone-*`

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Status dashboard | `./scripts/healthzone-status.sh` |
| Manual update | `sudo systemctl start healthzone-update.service` |
| Stop auto-updates | `sudo systemctl disable healthzone-update.timer` |
| Enable auto-updates | `sudo systemctl enable healthzone-update.timer` |
| View logs | `sudo journalctl -u healthzone-update.service -f` |
| Check timers | `sudo systemctl list-timers healthzone-*` |

Your HealthZone deployment will now stay automatically updated with the latest improvements and security fixes! 🚀