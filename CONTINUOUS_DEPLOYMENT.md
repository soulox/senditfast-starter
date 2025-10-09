# 🔄 Continuous Deployment Setup

Automate your deployments so every `git push` to main automatically updates your server.

---

## **Option 1: GitHub Actions** ⭐ (Recommended)

Fully automated CD with GitHub's built-in CI/CD.

### Setup Steps:

#### 1. On Your Ubuntu Server

```bash
# Run the CD setup script
cd /var/www/senditfast
bash scripts/setup-cd.sh
```

This will:
- Generate an SSH key for GitHub Actions
- Display the values you need to add to GitHub Secrets
- Show your server IP and username

#### 2. On GitHub

1. Go to your repository: `https://github.com/YOUR_USERNAME/senditfast-starter`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these **4 secrets**:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `SERVER_HOST` | Your server IP | `123.45.67.89` |
| `SERVER_USER` | SSH username | `ubuntu` or `root` |
| `SERVER_PORT` | SSH port | `22` |
| `SERVER_SSH_KEY` | Private key content | `-----BEGIN OPENSSH...` |

**For SERVER_SSH_KEY**: Copy the ENTIRE output from `~/.ssh/github_actions` (including BEGIN/END lines)

#### 3. Push to Deploy

```bash
# On your local machine
git add .
git commit -m "Enable continuous deployment"
git push origin main
```

**That's it!** Every push to `main` now auto-deploys! 🎉

#### 4. Monitor Deployments

- Go to your GitHub repo → **Actions** tab
- See deployment status in real-time
- View logs if something fails

---

## **Option 2: Git Post-Receive Hook** 🪝

Direct git-based deployment (no GitHub Actions needed).

### Setup:

#### 1. On Your Server - Create Bare Git Repository

```bash
# Create bare repo for receiving pushes
mkdir -p ~/senditfast-deploy.git
cd ~/senditfast-deploy.git
git init --bare

# Create post-receive hook
cat > hooks/post-receive << 'HOOKEOF'
#!/bin/bash

# Configuration
WORK_TREE=/var/www/senditfast
GIT_DIR=$HOME/senditfast-deploy.git

echo "🔄 Deploying SendItFast..."

# Checkout latest code
git --work-tree=$WORK_TREE --git-dir=$GIT_DIR checkout -f main

# Navigate to work directory
cd $WORK_TREE

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run migrations
echo "🗄️ Running migrations..."
pnpm migrate || echo "Migration skipped"

# Build
echo "🔨 Building..."
pnpm build

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart senditfast

echo "✅ Deployment complete!"
pm2 status
HOOKEOF

# Make hook executable
chmod +x hooks/post-receive
```

#### 2. On Your Local Machine - Add Remote

```bash
# Add your server as a git remote
git remote add production ssh://your-user@your-server-ip/home/your-user/senditfast-deploy.git

# Deploy
git push production main
```

**Every `git push production main` now deploys!** 🚀

---

## **Option 3: Webhook Deployment** 🌐

Trigger deployment via HTTP webhook.

### Setup:

#### 1. Create Webhook Endpoint on Server

```bash
# Create webhook script
sudo nano /usr/local/bin/deploy-senditfast
```

Paste:

```bash
#!/bin/bash
cd /var/www/senditfast
git pull origin main
pnpm install
pnpm migrate || true
pnpm build
pm2 restart senditfast
echo "Deployment completed at $(date)" >> /var/log/senditfast-deploy.log
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/deploy-senditfast
```

#### 2. Install Webhook Server

```bash
# Install webhook package
sudo apt install -y webhook

# Create webhook config
sudo mkdir -p /etc/webhook
sudo nano /etc/webhook/hooks.json
```

Paste:

```json
[
  {
    "id": "deploy-senditfast",
    "execute-command": "/usr/local/bin/deploy-senditfast",
    "command-working-directory": "/var/www/senditfast",
    "trigger-rule": {
      "match": {
        "type": "payload-hmac-sha256",
        "secret": "YOUR_WEBHOOK_SECRET_HERE",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

#### 3. Start Webhook Service

```bash
# Start webhook listener
webhook -hooks /etc/webhook/hooks.json -verbose -port 9000 &

# Or create systemd service for auto-start
sudo nano /etc/systemd/system/webhook.service
```

Paste:

```ini
[Unit]
Description=Webhook Server
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/usr/bin/webhook -hooks /etc/webhook/hooks.json -verbose -port 9000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable webhook
sudo systemctl start webhook
```

#### 4. Configure GitHub Webhook

1. GitHub repo → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `http://your-server-ip:9000/hooks/deploy-senditfast`
3. **Content type**: `application/json`
4. **Secret**: Your webhook secret from hooks.json
5. **Events**: Just the push event
6. **Active**: ✅

---

## **Option 4: Simple Cron-Based Pull** ⏰

Checks for updates every 5 minutes and deploys if changes found.

### Setup:

```bash
# Create auto-deploy script
cat > ~/auto-deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/senditfast

# Fetch latest
git fetch origin main

# Check if there are changes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ $LOCAL != $REMOTE ]; then
    echo "📥 Changes detected, deploying..."
    git pull origin main
    pnpm install
    pnpm migrate || true
    pnpm build
    pm2 restart senditfast
    echo "✅ Deployed at $(date)"
else
    echo "✓ Already up to date"
fi
EOF

chmod +x ~/auto-deploy.sh

# Add to crontab (every 5 minutes)
crontab -e
```

Add this line:

```bash
*/5 * * * * /home/YOUR_USERNAME/auto-deploy.sh >> /var/log/senditfast-auto-deploy.log 2>&1
```

---

## **Option 5: Watchtower-Style Pull** 🔍

Uses `inotify` to watch for changes.

```bash
# Install inotify
sudo apt install -y inotify-tools

# Create watch script
cat > ~/watch-deploy.sh << 'EOF'
#!/bin/bash
while true; do
    cd /var/www/senditfast
    git fetch origin main
    
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ $LOCAL != $REMOTE ]; then
        echo "📥 New version detected, deploying..."
        git pull origin main
        pnpm install
        pnpm build
        pm2 restart senditfast
        echo "✅ Deployed at $(date)"
    fi
    
    sleep 300  # Check every 5 minutes
done
EOF

chmod +x ~/watch-deploy.sh

# Run in background with PM2
pm2 start ~/watch-deploy.sh --name "deploy-watcher"
pm2 save
```

---

## 🎯 **Comparison**

| Method | Auto-Deploy | Setup Difficulty | Real-time | Logs | Best For |
|--------|-------------|------------------|-----------|------|----------|
| **GitHub Actions** | ✅ Instant | Medium | ✅ Yes | ✅ GitHub UI | **Best overall** |
| **Git Hook** | ✅ On push | Easy | ✅ Yes | Server logs | Direct control |
| **Webhook** | ✅ Instant | Hard | ✅ Yes | Server logs | Advanced users |
| **Cron** | ⏰ 5 min delay | Very Easy | ❌ No | Server logs | Simple projects |
| **Watcher** | ⏰ 5 min delay | Easy | ❌ No | PM2 logs | Background |

---

## ⭐ **Recommended Setup: GitHub Actions**

Here's exactly what to do:

### On Your Ubuntu Server:

```bash
cd /var/www/senditfast

# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N "" -C "github-actions"

# Add to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Display private key (copy this for GitHub)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "COPY THIS PRIVATE KEY TO GITHUB SECRETS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ~/.ssh/github_actions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Display server info
echo ""
echo "Add these to GitHub Secrets:"
echo "SERVER_HOST: $(curl -s ifconfig.me)"
echo "SERVER_USER: $USER"
echo "SERVER_PORT: 22"
```

### On GitHub:

1. **Go to**: `https://github.com/soulox/senditfast-starter/settings/secrets/actions`
2. **Add 4 secrets**:
   - `SERVER_HOST` → Your server IP
   - `SERVER_USER` → Your username (e.g., `ubuntu`, `root`)
   - `SERVER_PORT` → `22`
   - `SERVER_SSH_KEY` → The entire private key content

### Test It:

```bash
# On your local machine
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions CD"
git push origin main
```

Go to GitHub → Actions tab → Watch it deploy! 🎉

---

## 🔔 **Optional: Deployment Notifications**

### Add Slack Notifications to GitHub Actions:

Add this to `.github/workflows/deploy.yml` after the deploy step:

```yaml
      - name: 📢 Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Discord Notifications:

```yaml
      - name: 📢 Notify Discord
        if: always()
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK }}
          status: ${{ job.status }}
          title: "Deployment Status"
```

---

## 🔍 **Monitoring Deployments**

### View GitHub Actions Logs:
- Go to repo → **Actions** tab
- Click on any workflow run
- Expand steps to see detailed logs

### View Server Logs:

```bash
# PM2 logs
pm2 logs senditfast

# Deployment logs (if using cron)
tail -f /var/log/senditfast-auto-deploy.log

# System logs
journalctl -u senditfast -f
```

---

## 🚨 **Rollback on Failure**

### Manual Rollback:

```bash
cd /var/www/senditfast

# View commit history
git log --oneline -10

# Rollback to previous version
git reset --hard HEAD~1  # Go back 1 commit
# or
git checkout <commit-hash>

# Rebuild and restart
pnpm install
pnpm build
pm2 restart senditfast
```

### Automated Rollback in GitHub Actions:

Add to workflow (after deploy step):

```yaml
      - name: 🔄 Rollback on Failure
        if: failure()
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/senditfast
            git reset --hard HEAD~1
            pnpm install
            pnpm build
            pm2 restart senditfast
            echo "⚠️ Rolled back to previous version"
```

---

## 📊 **Deployment Workflow**

With GitHub Actions enabled:

```
1. Local: git commit -m "Add feature"
2. Local: git push origin main
         ↓
3. GitHub: Detects push to main
         ↓
4. GitHub Actions: Runs workflow
         ↓
5. Server: SSH in and execute:
   - git pull
   - pnpm install
   - pnpm build
   - pm2 restart
         ↓
6. ✅ Live in ~2-3 minutes!
```

---

## 🎯 **Best Practice Workflow**

### Development Flow:

```bash
# Feature branch
git checkout -b feature/new-thing
# ... make changes ...
git commit -m "Add new feature"
git push origin feature/new-thing

# Create PR on GitHub
# Review, test
# Merge to main

# Auto-deploys to production! ✅
```

### With Environments:

Update `.github/workflows/deploy.yml` to support staging:

```yaml
on:
  push:
    branches:
      - main          # Production
      - staging       # Staging environment

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    
    steps:
      - name: Determine Environment
        id: env
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "environment=production" >> $GITHUB_OUTPUT
            echo "server=${{ secrets.PROD_SERVER_HOST }}" >> $GITHUB_OUTPUT
          else
            echo "environment=staging" >> $GITHUB_OUTPUT
            echo "server=${{ secrets.STAGING_SERVER_HOST }}" >> $GITHUB_OUTPUT
          fi
      
      - name: Deploy to ${{ steps.env.outputs.environment }}
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ steps.env.outputs.server }}
          # ... rest of config
```

---

## 🔐 **Security Best Practices**

### 1. Use Deploy Keys (Not Root)

```bash
# Create dedicated deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Set up app directory
sudo chown -R deploy:deploy /var/www/senditfast

# Use 'deploy' user in GitHub Actions
```

### 2. Limit SSH Key Permissions

Edit `~/.ssh/authorized_keys` and prepend to the GitHub Actions key:

```bash
command="/usr/local/bin/deploy-senditfast",no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-ed25519 AAAA...
```

### 3. Use Deployment Tokens

Instead of SSH, use personal access tokens:

```yaml
- name: Deploy
  run: |
    curl -X POST https://your-server.com/api/deploy \
      -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}"
```

---

## 📈 **Advanced Features**

### Health Checks

Add to workflow:

```yaml
      - name: 🏥 Health Check
        run: |
          sleep 10  # Wait for app to start
          STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://yourdomain.com)
          if [ $STATUS -ne 200 ]; then
            echo "Health check failed! Status: $STATUS"
            exit 1
          fi
          echo "✅ Health check passed"
```

### Deployment Approval

Add manual approval for production:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://yourdomain.com
    # ... rest of job
```

Then in GitHub repo **Settings** → **Environments** → **production**:
- ✅ Enable "Required reviewers"
- Add yourself as reviewer

### Database Migrations with Backup

Update deploy script:

```bash
# Backup database before migration
pg_dump $DATABASE_URL > ~/backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql

# Run migration
pnpm migrate
```

---

## 🧪 **Testing CD Setup**

### 1. Test SSH Connection (from GitHub Actions)

```bash
# On your server
ssh -T git@github.com  # Should show GitHub message

# Test GitHub Actions can connect
ssh -i ~/.ssh/github_actions user@localhost  # Should work
```

### 2. Test Deployment

```bash
# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "Test CD"
git push origin main

# Watch on GitHub Actions tab
# Check server: pm2 logs senditfast
```

---

## 🔄 **Deployment Checklist**

Before pushing to production:

- [ ] All tests pass locally
- [ ] Environment variables up to date
- [ ] Database migrations tested
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors
- [ ] Git commit message is descriptive

---

## 📊 **Monitoring Production**

### Set Up Uptime Monitoring:

**UptimeRobot** (Free):
1. Go to https://uptimerobot.com
2. Add monitor for `https://yourdomain.com`
3. Get alerts if site goes down

**Better Uptime** (Free tier):
1. Go to https://betteruptime.com
2. Monitor your site
3. Get SMS/email alerts

### Application Monitoring:

```bash
# Install PM2 Plus (free monitoring)
pm2 install pm2-logrotate

# View real-time metrics
pm2 monit

# Web dashboard
pm2 web  # Access at http://server-ip:9615
```

---

## 🆘 **Troubleshooting CD**

### GitHub Actions Fails to Connect:

```bash
# On server, verify SSH key is in authorized_keys
cat ~/.ssh/authorized_keys | grep github_actions

# Test SSH manually
ssh -i ~/.ssh/github_actions user@server-ip
```

### Build Fails on Server:

```bash
# Check PM2 logs
pm2 logs senditfast --err

# Check disk space
df -h

# Check memory
free -h

# Clear build cache
cd /var/www/senditfast
rm -rf .next
pnpm build
```

### Deployment Succeeds but App Doesn't Update:

```bash
# Check git status
cd /var/www/senditfast
git status
git log --oneline -5

# Force pull
git reset --hard origin/main
pm2 restart senditfast
```

---

## ✅ **Success Indicators**

Your CD is working when:

1. ✅ Push to GitHub triggers Actions workflow
2. ✅ Workflow shows green checkmark
3. ✅ Server shows updated code: `git log`
4. ✅ PM2 shows restart: `pm2 status`
5. ✅ Website shows changes immediately

---

## 🎉 **You're All Set!**

With GitHub Actions CD:
- **Push** → **Auto-Deploy** → **Live in 2-3 minutes**
- Zero manual intervention
- Full deployment logs
- Rollback capability
- Production-ready workflow

**Happy shipping! 🚀**

