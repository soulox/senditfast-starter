# 🚀 Ubuntu Server Deployment Guide

This guide will help you deploy SendItFast to your Ubuntu server with a production-ready setup.

## 📋 Prerequisites

- Ubuntu 20.04+ server with root/sudo access
- Domain name pointed to your server's IP address
- SSH access to your server

---

## 🔧 Part 1: Server Preparation

### 1.1 Connect to Your Server

```bash
ssh root@your-server-ip
# or
ssh your-user@your-server-ip
```

### 1.2 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Node.js 22.x

```bash
# Install Node.js 22 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v22.x.x
npm --version
```

### 1.4 Install pnpm

```bash
sudo npm install -g pnpm
pnpm --version
```

### 1.5 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 --version
```

### 1.6 Install Nginx (Web Server)

```bash
sudo apt install -y nginx
sudo systemctl status nginx  # Should be active
```

### 1.7 Install Git

```bash
sudo apt install -y git
```

---

## 📦 Part 2: Deploy the Application

### 2.1 Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/senditfast
sudo chown -R $USER:$USER /var/www/senditfast
cd /var/www/senditfast
```

### 2.2 Clone Your Repository

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/senditfast-starter.git .

# Or if you haven't pushed yet, use rsync from your local machine:
# rsync -avz --exclude 'node_modules' --exclude '.next' \
#   /path/to/local/senditfast-starter/ user@server-ip:/var/www/senditfast/
```

### 2.3 Install Dependencies

```bash
cd /var/www/senditfast
pnpm install
```

### 2.4 Create Environment File

```bash
nano .env.local
```

**Paste this configuration** (update with your actual values):

```bash
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@your-neon-host/dbname?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here-min-32-chars
NEXTAUTH_URL=https://yourdomain.com

# Backblaze B2
B2_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET=your_b2_bucket_name
B2_ENDPOINT=https://s3.us-west-001.backblazeb2.com

# Mailgun (Optional)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com

# Authorize.Net (Optional)
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox
NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID=your_api_login_id
NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY=your_public_client_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Mock B2 (set to false for production)
MOCK_B2=false
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

### 2.5 Run Database Migration

```bash
pnpm migrate

# If you need business features:
pnpm migrate infra/sql/business-features.sql
pnpm migrate infra/sql/add-password-reset.sql
```

### 2.6 Build the Application

```bash
pnpm build
```

### 2.7 Start with PM2

```bash
# Start the app
pm2 start npm --name "senditfast" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to auto-start on server reboot
pm2 startup
# Run the command that PM2 outputs (it will be something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user

# Check status
pm2 status
pm2 logs senditfast
```

**Your app is now running on `http://localhost:3000`!** 🎉

---

## 🌐 Part 3: Configure Nginx Reverse Proxy

### 3.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/senditfast
```

**Paste this configuration** (replace `yourdomain.com` with your actual domain):

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for file uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    # Increase max upload size for file transfers
    client_max_body_size 10G;
    client_body_timeout 600s;
}
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

### 3.2 Enable the Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/senditfast /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Part 4: Set Up SSL with Let's Encrypt

### 4.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Get SSL Certificate

```bash
# Make sure your domain points to this server first!
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect (option 2)
```

### 4.3 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

**SSL certificates auto-renew every 90 days!** ✅

---

## 🔄 Part 5: Set Up Automatic Updates

### 5.1 Create Update Script

```bash
nano ~/update-senditfast.sh
```

**Paste this:**

```bash
#!/bin/bash

echo "🔄 Updating SendItFast..."

cd /var/www/senditfast

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Run migrations
pnpm migrate

# Build application
pnpm build

# Restart PM2
pm2 restart senditfast

echo "✅ Update complete!"
pm2 logs senditfast --lines 50
```

**Make it executable:**

```bash
chmod +x ~/update-senditfast.sh
```

**Usage:**

```bash
~/update-senditfast.sh
```

---

## 🧹 Part 6: Set Up Automatic Cleanup Cron Job

### 6.1 Edit Crontab

```bash
crontab -e
```

### 6.2 Add Cleanup Job

Add this line to run cleanup daily at 2 AM:

```bash
0 2 * * * curl -X POST http://localhost:3000/api/cron/cleanup >> /var/log/senditfast-cleanup.log 2>&1
```

**Save and exit**

---

## 📊 Part 7: Monitoring & Maintenance

### Check Application Status

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs senditfast

# View specific number of log lines
pm2 logs senditfast --lines 100

# Monitor in real-time
pm2 monit
```

### Check Nginx Status

```bash
# Status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Check System Resources

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top
# or
htop  # Install with: sudo apt install htop
```

---

## 🔐 Part 8: Security Hardening

### 8.1 Set Up Firewall

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow OpenSSH

# Allow HTTP & HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 8.2 Configure Fail2Ban (Optional but Recommended)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

---

## 🔄 Part 9: Common Tasks

### Deploy New Version

```bash
~/update-senditfast.sh
```

### Restart Application

```bash
pm2 restart senditfast
```

### View Logs

```bash
# Application logs
pm2 logs senditfast

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Stop Application

```bash
pm2 stop senditfast
```

### Delete Application from PM2

```bash
pm2 delete senditfast
```

---

## 🐛 Troubleshooting

### App Not Starting

```bash
# Check PM2 logs
pm2 logs senditfast --err

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart senditfast
```

### 502 Bad Gateway

```bash
# Check if Next.js is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues

```bash
# Test database connection
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.DATABASE_URL)"

# Check if DATABASE_URL is set
grep DATABASE_URL .env.local
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart app
pm2 restart senditfast

# Set memory limit for PM2
pm2 restart senditfast --max-memory-restart 1G
```

---

## 📈 Part 10: Performance Optimization

### 10.1 Enable Gzip Compression in Nginx

Edit your Nginx config:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add in the `http` block:

```nginx
# Gzip Settings
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss 
           application/rss+xml font/truetype font/opentype 
           application/vnd.ms-fontobject image/svg+xml;
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

### 10.2 PM2 Cluster Mode (Optional - for multi-core)

```bash
# Stop current instance
pm2 delete senditfast

# Start in cluster mode (uses all CPU cores)
pm2 start npm --name "senditfast" -i max -- start

# Save
pm2 save
```

---

## 🔄 Part 11: Backup Strategy

### 11.1 Database Backups

Your Neon database has automatic backups. For local backups:

```bash
# Create backup directory
mkdir -p ~/backups

# Add to crontab (daily backup at 3 AM)
crontab -e
```

Add:

```bash
0 3 * * * pg_dump $DATABASE_URL > ~/backups/senditfast-$(date +\%Y\%m\%d).sql 2>&1
```

### 11.2 Application Backups

```bash
# Backup .env.local
cp /var/www/senditfast/.env.local ~/backups/.env.local.backup

# Full app backup
cd /var/www
tar -czf ~/backups/senditfast-$(date +%Y%m%d).tar.gz senditfast/
```

---

## 📊 Part 12: Monitoring Setup

### 12.1 PM2 Monitoring

```bash
# View dashboard
pm2 monit

# Enable PM2 web monitoring (optional)
pm2 web
# Access at: http://your-server-ip:9615
```

### 12.2 Set Up Log Rotation

```bash
pm2 install pm2-logrotate

# Configure (optional)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🎯 Quick Reference Commands

### Application Management
```bash
pm2 status                    # Check status
pm2 restart senditfast       # Restart app
pm2 stop senditfast          # Stop app
pm2 logs senditfast          # View logs
pm2 monit                    # Monitor resources
~/update-senditfast.sh       # Deploy update
```

### Nginx Management
```bash
sudo systemctl status nginx       # Check status
sudo systemctl restart nginx      # Restart
sudo nginx -t                     # Test config
sudo systemctl reload nginx       # Reload config
```

### SSL Certificate
```bash
sudo certbot renew              # Renew SSL
sudo certbot certificates       # List certificates
```

---

## 🌟 Success Checklist

After deployment, verify:

- [ ] App accessible at `https://yourdomain.com`
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid (green padlock)
- [ ] Sign in/sign up works
- [ ] File upload works
- [ ] Database connected (check dashboard)
- [ ] PM2 shows "online" status
- [ ] Nginx returns 200 OK

---

## 💡 Production Tips

1. **Set up monitoring**: Use Uptime Robot (free) to monitor your site
2. **Regular updates**: Run `~/update-senditfast.sh` weekly
3. **Check logs**: `pm2 logs senditfast` daily for errors
4. **Monitor disk space**: `df -h` - B2 files can fill disk if cached
5. **Keep Node.js updated**: Check for security updates monthly
6. **Backup .env.local**: Store securely off-server

---

## 🆘 Need Help?

### Useful Resources
- PM2 docs: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx docs: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/docs/

### Common Issues
- Port 3000 in use: `sudo lsof -i :3000` then kill process
- Permission denied: Check file ownership with `ls -la`
- 502 error: App not running - check `pm2 status`
- SSL issues: Check domain DNS and run `sudo certbot renew`

---

**You're all set! 🎉**

Your SendItFast application should now be running on your Ubuntu server with:
- ✅ Production-ready setup
- ✅ SSL encryption
- ✅ Process management (PM2)
- ✅ Reverse proxy (Nginx)
- ✅ Auto-restart on crashes
- ✅ Auto-start on server reboot

