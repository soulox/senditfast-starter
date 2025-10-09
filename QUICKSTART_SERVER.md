# ⚡ Quick Start - Ubuntu Server Deployment

The fastest way to deploy SendItFast to your Ubuntu server.

## 🎯 One-Command Deployment

### Step 1: SSH into your server

```bash
ssh your-user@your-server-ip
```

### Step 2: Run the automated deployment script

```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/senditfast-starter/main/scripts/deploy-ubuntu.sh | bash
```

**OR manually:**

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/senditfast-starter.git
cd senditfast-starter

# Make script executable
chmod +x scripts/deploy-ubuntu.sh

# Run deployment
./scripts/deploy-ubuntu.sh
```

---

## 🔧 Manual Quick Setup (If Script Fails)

### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm and PM2
sudo npm install -g pnpm pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. Deploy Application

```bash
# Create directory
sudo mkdir -p /var/www/senditfast
sudo chown -R $USER:$USER /var/www/senditfast
cd /var/www/senditfast

# Clone repository
git clone https://github.com/YOUR_USERNAME/senditfast-starter.git .

# Install dependencies
pnpm install

# Configure environment
nano .env.local
# Add your environment variables (see UBUNTU_DEPLOYMENT.md)

# Build
pnpm build

# Start with PM2
pm2 start npm --name "senditfast" -- start
pm2 save
pm2 startup  # Follow the command it outputs
```

### 3. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/senditfast
```

Paste (replace `yourdomain.com`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    client_max_body_size 10G;
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/senditfast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Get SSL Certificate

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ Verification

Check if everything is running:

```bash
# Check PM2
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check if app is responding
curl http://localhost:3000

# View logs
pm2 logs senditfast
```

Visit your domain: `https://yourdomain.com` 🎉

---

## 🔄 Deploying Updates

After making changes and pushing to GitHub:

```bash
cd /var/www/senditfast
git pull origin main
pnpm install
pnpm build
pm2 restart senditfast
```

Or use the update script:

```bash
~/update-senditfast.sh
```

---

## 📊 Key Files & Locations

- **Application**: `/var/www/senditfast`
- **Nginx Config**: `/etc/nginx/sites-available/senditfast`
- **SSL Certificates**: `/etc/letsencrypt/live/yourdomain.com/`
- **PM2 Logs**: `~/.pm2/logs/`
- **Environment**: `/var/www/senditfast/.env.local`

---

## 🆘 Troubleshooting

### App won't start
```bash
pm2 logs senditfast --lines 100
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Restart app
pm2 restart senditfast

# Check Nginx
sudo nginx -t
```

### Can't connect to database
```bash
# Verify DATABASE_URL
cd /var/www/senditfast
grep DATABASE_URL .env.local

# Test connection (requires psql)
psql $DATABASE_URL -c "SELECT 1"
```

---

## 📞 Need Help?

See the full guide: `UBUNTU_DEPLOYMENT.md`

Common commands:
- `pm2 status` - Check app status
- `pm2 logs senditfast` - View logs
- `pm2 restart senditfast` - Restart app
- `sudo systemctl restart nginx` - Restart Nginx
- `sudo certbot renew` - Renew SSL

**Your app should now be live!** 🚀

