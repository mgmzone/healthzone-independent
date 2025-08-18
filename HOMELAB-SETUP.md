# HealthZone Homelab Deployment - Step by Step Guide

This guide walks you through deploying HealthZone from your GitHub repository to your homelab Docker server.

## 📋 Prerequisites Checklist

### ✅ Before You Start
- [ ] Docker server running in your homelab
- [ ] Git installed on the Docker server  
- [ ] Cloudflare account with domain
- [ ] Supabase project created and configured
- [ ] Resend account for email service

### ✅ Information You'll Need
- [ ] Your Supabase project URL and anon key
- [ ] Your domain name for the app
- [ ] SSH access to your Docker server
- [ ] Resend API key (for email functions)

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Your Docker Server
```bash
# SSH into your homelab Docker server
ssh username@your-docker-server-ip

# Or if you're already on the server, open terminal
```

### Step 2: Clone the Repository
```bash
# Navigate to your preferred directory (e.g., /opt, /home/user, etc.)
cd /opt

# Clone your forked repository
git clone https://github.com/mgmzone/healthzone-independent.git

# Enter the directory
cd healthzone-independent

# Switch to the migration branch (with all improvements)
git checkout migration/from-lovable-to-independent
```

### Step 3: Configure Environment Variables
```bash
# Copy the production environment template
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
# or use your preferred editor: vim, code, etc.
```

**Fill in these values in `.env.production`:**
```bash
VITE_SUPABASE_URL=https://kvmvekesxdzwodnfabdr.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
VITE_APP_URL=https://healthzone.yourdomain.com
NODE_ENV=production
```

### Step 4: Deploy with Docker
```bash
# Make deployment scripts executable
chmod +x scripts/*.sh

# Deploy the application
./scripts/docker-deploy.sh

# This script will:
# - Validate environment variables
# - Build the Docker image
# - Start the container
# - Run health checks
# - Show deployment status
```

**Expected Output:**
```
🏠 Starting HealthZone Homelab Deployment
[INFO] Docker is running
[INFO] Using environment file: .env.production
[SUCCESS] Environment variables validated
[INFO] Building HealthZone Docker image...
[INFO] Starting HealthZone container...
[INFO] Waiting for container to be healthy...
[SUCCESS] Container is healthy and running!
🎉 HealthZone deployment completed!
```

### Step 5: Verify Local Deployment
```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:3001/health

# View logs if needed
docker-compose logs -f
```

### Step 6: Configure Cloudflare Tunnel

#### Option A: Using Cloudflare Dashboard (Recommended)
1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your domain

2. **Create Tunnel**
   - Go to **Zero Trust** → **Access** → **Tunnels**
   - Click **Create a tunnel**
   - Name it: `homelab-healthzone`
   - Choose **Cloudflared**

3. **Install Cloudflared on Your Server**
   ```bash
   # Download and install cloudflared
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   
   # Or for other systems, check: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

4. **Configure Tunnel**
   - Copy the install command from Cloudflare dashboard
   - Run it on your server (looks like):
   ```bash
   sudo cloudflared service install eyJhIjoiY...
   ```

5. **Add Public Hostname**
   - In Cloudflare dashboard, click **Add a public hostname**
   - **Subdomain**: `healthzone`
   - **Domain**: `yourdomain.com` 
   - **Service**: `HTTP://localhost:3001`
   - Click **Save**

#### Option B: Using CLI (Advanced)
```bash
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create healthzone-tunnel

# Configure tunnel
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: $(cloudflared tunnel list | grep healthzone-tunnel | awk '{print $1}')
credentials-file: ~/.cloudflared/$(cloudflared tunnel list | grep healthzone-tunnel | awk '{print $1}').json

ingress:
  - hostname: healthzone.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
EOF

# Add DNS record
cloudflared tunnel route dns healthzone-tunnel healthzone.yourdomain.com

# Start tunnel service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### Step 7: Configure Supabase Edge Functions

1. **Set Environment Variables in Supabase**
   - Go to your Supabase project dashboard
   - Navigate to **Edge Functions** → **Settings**
   - Add these secrets:
   ```
   SUPABASE_URL=https://kvmvekesxdzwodnfabdr.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=your-resend-api-key
   FROM_EMAIL=HealthZone <noreply@yourdomain.com>
   ALLOWED_ORIGIN=https://healthzone.yourdomain.com
   ```

2. **Deploy Edge Functions** (if not already deployed)
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link project
   supabase login
   supabase link --project-ref kvmvekesxdzwodnfabdr

   # Deploy functions
   supabase functions deploy send-email
   supabase functions deploy send-weekly-summary
   ```

### Step 8: Test Your Deployment

1. **Test Local Access**
   ```bash
   curl http://localhost:3001/health
   # Should return: healthy
   ```

2. **Test Through Cloudflare** (after tunnel is configured)
   ```bash
   curl https://healthzone.yourdomain.com/health
   # Should return: healthy
   ```

3. **Test in Browser**
   - Open https://healthzone.yourdomain.com
   - Try logging in / creating account
   - Test main functionality

## 🔧 Post-Deployment Configuration

### DNS Configuration
If using Cloudflare Tunnel, DNS is automatically handled. If not:
1. Point your domain to Cloudflare nameservers
2. Set Cloudflare SSL to "Full" or "Full (strict)"

### Security Settings
1. **Cloudflare Security**
   - SSL/TLS: Full (strict) 
   - Security Level: Medium
   - Enable DDoS protection

2. **Firewall Rules** (optional)
   - Block countries if needed
   - Rate limiting rules

### Monitoring Setup
```bash
# Create monitoring cron job
crontab -e

# Add health check every 5 minutes
*/5 * * * * curl -f http://localhost:3001/health > /dev/null 2>&1 || echo "HealthZone down: $(date)" >> /var/log/healthzone-alerts.log
```

## 🔄 Ongoing Maintenance

### Regular Updates
```bash
# Update application
cd /opt/healthzone-independent
git pull
./scripts/docker-update.sh
```

### Monitoring Commands
```bash
# Check status
docker-compose ps

# View logs  
docker-compose logs -f

# Container resource usage
docker stats healthzone-app

# System resources
htop
df -h
```

### Backup Strategy
```bash
# Create backup script
cat > backup-healthzone.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf ~/backups/healthzone-$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  /opt/healthzone-independent
EOF

chmod +x backup-healthzone.sh

# Run weekly via cron
0 2 * * 0 ~/backup-healthzone.sh
```

## 🆘 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs healthzone

# Rebuild clean
docker-compose down
docker-compose build --no-cache  
docker-compose up -d
```

### Can't Access Through Domain
1. Check Cloudflare tunnel status: `systemctl status cloudflared`
2. Check DNS propagation: `dig healthzone.yourdomain.com`
3. Test local access: `curl http://localhost:3001/health`

### Email Functions Not Working
1. Check Supabase edge function logs
2. Verify environment variables in Supabase
3. Test Resend API key separately

### Collect Diagnostics
```bash
# Run log collection script
./scripts/collect-logs.sh

# This creates a tar.gz file with all logs and diagnostics
```

## 📞 Getting Help

### Log Locations
- **Application logs**: `docker-compose logs`
- **Cloudflare logs**: `journalctl -u cloudflared`
- **System logs**: `/var/log/`

### Useful Commands
```bash
# Container management
docker-compose ps          # Status
docker-compose restart     # Restart
docker-compose down        # Stop
docker-compose up -d       # Start

# System info
docker system info         # Docker status
systemctl status docker    # Docker service
netstat -tulpn | grep 3001 # Port check
```

---

## 🎉 Success Checklist

After completing all steps, verify:
- [ ] Container is running and healthy
- [ ] Local access works (http://localhost:3001)
- [ ] Domain access works (https://healthzone.yourdomain.com)
- [ ] Login/signup functionality works
- [ ] Email functions are working
- [ ] Monitoring is configured

**Congratulations! Your HealthZone homelab deployment is complete! 🏠✨**