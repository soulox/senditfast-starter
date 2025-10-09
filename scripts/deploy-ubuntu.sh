#!/bin/bash

# SendItFast Ubuntu Deployment Script
# This script automates the deployment process on Ubuntu servers

set -e  # Exit on any error

echo "🚀 SendItFast Ubuntu Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please don't run as root. Use sudo when needed.${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. System Update
echo -e "${YELLOW}📦 Step 1: Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# 2. Install Node.js 22
echo -e "${YELLOW}📦 Step 2: Installing Node.js 22...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "Node.js already installed: $NODE_VERSION"
    read -p "Reinstall? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}✅ Node.js installed: $(node --version)${NC}"
echo ""

# 3. Install pnpm
echo -e "${YELLOW}📦 Step 3: Installing pnpm...${NC}"
if ! command_exists pnpm; then
    sudo npm install -g pnpm
fi
echo -e "${GREEN}✅ pnpm installed: $(pnpm --version)${NC}"
echo ""

# 4. Install PM2
echo -e "${YELLOW}📦 Step 4: Installing PM2...${NC}"
if ! command_exists pm2; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 installed: $(pm2 --version)${NC}"
echo ""

# 5. Install Nginx
echo -e "${YELLOW}📦 Step 5: Installing Nginx...${NC}"
if ! command_exists nginx; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi
echo -e "${GREEN}✅ Nginx installed and running${NC}"
echo ""

# 6. Install Git
echo -e "${YELLOW}📦 Step 6: Installing Git...${NC}"
if ! command_exists git; then
    sudo apt install -y git
fi
echo -e "${GREEN}✅ Git installed: $(git --version)${NC}"
echo ""

# 7. Create app directory
echo -e "${YELLOW}📁 Step 7: Setting up application directory...${NC}"
APP_DIR="/var/www/senditfast"
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    echo -e "${GREEN}✅ Created $APP_DIR${NC}"
else
    echo -e "${YELLOW}Directory $APP_DIR already exists${NC}"
fi
echo ""

# 8. Clone repository (if empty)
echo -e "${YELLOW}📥 Step 8: Setting up code...${NC}"
if [ ! -f "$APP_DIR/package.json" ]; then
    read -p "Enter your GitHub repository URL (or press Enter to skip): " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        cd $APP_DIR
        git clone $REPO_URL .
        echo -e "${GREEN}✅ Repository cloned${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipped repository clone - you'll need to copy files manually${NC}"
    fi
else
    echo -e "${GREEN}✅ Code already present${NC}"
fi
echo ""

# 9. Install dependencies
if [ -f "$APP_DIR/package.json" ]; then
    echo -e "${YELLOW}📦 Step 9: Installing dependencies...${NC}"
    cd $APP_DIR
    pnpm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# 10. Configure environment
echo -e "${YELLOW}⚙️  Step 10: Environment configuration...${NC}"
if [ ! -f "$APP_DIR/.env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    echo "Please edit $APP_DIR/.env.local with your configuration"
    cat > $APP_DIR/.env.local << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# NextAuth
NEXTAUTH_SECRET=change-this-to-a-random-32-char-string
NEXTAUTH_URL=https://yourdomain.com

# Backblaze B2
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET=your_bucket_name
B2_ENDPOINT=https://s3.us-west-001.backblazeb2.com

# Optional Services
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_FROM_EMAIL=

AUTHORIZENET_API_LOGIN_ID=
AUTHORIZENET_TRANSACTION_KEY=
AUTHORIZENET_ENVIRONMENT=sandbox

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Production mode
MOCK_B2=false
NODE_ENV=production
EOF
    echo -e "${RED}⚠️  IMPORTANT: Edit .env.local with your actual values!${NC}"
    echo "Run: nano $APP_DIR/.env.local"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi
echo ""

# 11. Build application
if [ -f "$APP_DIR/package.json" ]; then
    echo -e "${YELLOW}🔨 Step 11: Building application...${NC}"
    cd $APP_DIR
    read -p "Build now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pnpm build
        echo -e "${GREEN}✅ Build complete${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipped build - run 'pnpm build' later${NC}"
    fi
    echo ""
fi

# 12. Start with PM2
echo -e "${YELLOW}🚀 Step 12: Starting application with PM2...${NC}"
cd $APP_DIR
if pm2 list | grep -q "senditfast"; then
    echo "App already running, restarting..."
    pm2 restart senditfast
else
    pm2 start npm --name "senditfast" -- start
    pm2 save
fi
echo -e "${GREEN}✅ Application started${NC}"
echo ""

# 13. Setup PM2 startup
echo -e "${YELLOW}🔄 Step 13: Configuring PM2 auto-startup...${NC}"
pm2 startup | grep sudo | bash
pm2 save
echo -e "${GREEN}✅ PM2 will auto-start on server reboot${NC}"
echo ""

# 14. Configure Nginx
echo -e "${YELLOW}🌐 Step 14: Nginx configuration...${NC}"
read -p "Enter your domain name (e.g., senditfast.com): " DOMAIN

if [ ! -z "$DOMAIN" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/senditfast"
    
    sudo tee $NGINX_CONFIG > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    client_max_body_size 10G;
    client_body_timeout 600s;
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/senditfast /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart
    sudo nginx -t && sudo systemctl restart nginx
    
    echo -e "${GREEN}✅ Nginx configured for $DOMAIN${NC}"
    echo ""
    
    # 15. SSL Setup
    echo -e "${YELLOW}🔒 Step 15: SSL Certificate (Let's Encrypt)...${NC}"
    read -p "Install SSL certificate now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ! command_exists certbot; then
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        read -p "Enter email for SSL certificate: " EMAIL
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
        
        echo -e "${GREEN}✅ SSL certificate installed${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL skipped. Run manually: sudo certbot --nginx -d $DOMAIN${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx configuration skipped${NC}"
fi
echo ""

# 16. Firewall
echo -e "${YELLOW}🔥 Step 16: Firewall configuration...${NC}"
if ! command_exists ufw; then
    sudo apt install -y ufw
fi

read -p "Configure firewall? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  Firewall skipped${NC}"
fi
echo ""

# 17. Create update script
echo -e "${YELLOW}📝 Step 17: Creating update script...${NC}"
cat > ~/update-senditfast.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating SendItFast..."
cd /var/www/senditfast
git pull origin main
pnpm install
pnpm migrate
pnpm build
pm2 restart senditfast
echo "✅ Update complete!"
pm2 logs senditfast --lines 50
EOF
chmod +x ~/update-senditfast.sh
echo -e "${GREEN}✅ Update script created: ~/update-senditfast.sh${NC}"
echo ""

# 18. Setup cron job for cleanup
echo -e "${YELLOW}⏰ Step 18: Setting up cleanup cron job...${NC}"
read -p "Add daily cleanup cron job? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    (crontab -l 2>/dev/null; echo "0 2 * * * curl -X POST http://localhost:3000/api/cron/cleanup >> /var/log/senditfast-cleanup.log 2>&1") | crontab -
    echo -e "${GREEN}✅ Cron job added (runs daily at 2 AM)${NC}"
else
    echo -e "${YELLOW}⚠️  Cron job skipped${NC}"
fi
echo ""

# Final status
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Access your application:"
if [ ! -z "$DOMAIN" ]; then
    echo "   https://$DOMAIN"
else
    echo "   http://$(curl -s ifconfig.me):80"
fi
echo ""
echo "📝 Next Steps:"
echo "   1. Edit .env.local: nano $APP_DIR/.env.local"
echo "   2. Run migrations: cd $APP_DIR && pnpm migrate"
echo "   3. View logs: pm2 logs senditfast"
echo "   4. Monitor: pm2 monit"
echo ""
echo "🔄 To deploy updates in the future:"
echo "   ~/update-senditfast.sh"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"

