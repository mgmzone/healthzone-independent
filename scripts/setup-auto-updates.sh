#!/bin/bash

# HealthZone Auto-Update Setup Script
# This script sets up automated updates using systemd timer

set -e

PROJECT_DIR="/opt/healthzone-independent"
SERVICE_USER="root"

echo "🤖 Setting up HealthZone automated updates..."

# Create systemd service file
cat > /etc/systemd/system/healthzone-update.service << EOF
[Unit]
Description=HealthZone Automated Update
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$SERVICE_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=$PROJECT_DIR/scripts/auto-update.sh
StandardOutput=journal
StandardError=journal

# Security settings
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$PROJECT_DIR /backup /var/log /tmp
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
EOF

# Create systemd timer file
cat > /etc/systemd/system/healthzone-update.timer << EOF
[Unit]
Description=Run HealthZone automated updates
Requires=healthzone-update.service

[Timer]
# Run every 4 hours
OnCalendar=*:0/4:00
# Run 5 minutes after boot
OnBootSec=5min
# If missed, run immediately
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Create health monitoring service
cat > /etc/systemd/system/healthzone-health.service << EOF
[Unit]
Description=HealthZone Health Check
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$SERVICE_USER
ExecStart=/bin/bash -c 'curl -f http://localhost:3001/health || exit 1'
StandardOutput=journal
StandardError=journal
EOF

# Create health monitoring timer (every 5 minutes)
cat > /etc/systemd/system/healthzone-health.timer << EOF
[Unit]
Description=Run HealthZone health checks
Requires=healthzone-health.service

[Timer]
OnCalendar=*:*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Reload systemd and enable services
systemctl daemon-reload

# Enable and start the update timer
systemctl enable healthzone-update.timer
systemctl start healthzone-update.timer

# Enable and start the health check timer
systemctl enable healthzone-health.timer
systemctl start healthzone-health.timer

echo "✅ Automated updates configured!"
echo ""
echo "📋 Service Status:"
systemctl status healthzone-update.timer --no-pager -l
echo ""
systemctl status healthzone-health.timer --no-pager -l
echo ""
echo "📝 Useful Commands:"
echo "  Status:           systemctl status healthzone-update.timer"
echo "  View logs:        journalctl -u healthzone-update.service -f"
echo "  Manual update:    systemctl start healthzone-update.service"
echo "  Stop auto-update: systemctl disable healthzone-update.timer"
echo "  Health logs:      journalctl -u healthzone-health.service -f"
echo ""
echo "🔍 Next run times:"
systemctl list-timers healthzone-*
echo ""
echo "📁 Logs will be stored in: /var/log/healthzone-updates.log"
echo "💾 Backups will be stored in: /backup/healthzone-updates/"