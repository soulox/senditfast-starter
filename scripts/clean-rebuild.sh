#!/bin/bash

# Clean Rebuild Script for Server
# Run this on your Ubuntu server when you have build issues

set -e

echo "🧹 SendItFast Clean Rebuild Script"
echo "===================================="
echo ""

cd /var/www/senditfast

# Stop the application
echo "⏸️  Stopping application..."
pm2 stop senditfast 2>/dev/null || echo "App not running"

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main

# Remove build artifacts
echo "🗑️  Removing old build artifacts..."
rm -rf .next
rm -rf .pnpm-store

# Optional: Remove node_modules for complete clean
read -p "Remove node_modules? (complete clean, takes longer) [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --force

# Run migrations
echo "🗄️  Running database migrations..."
pnpm migrate || echo "⚠️  Migration failed or already applied"

# Build application
echo "🔨 Building application..."
NODE_ENV=production pnpm build

echo ""
echo "✅ Build complete! Starting application..."

# Start with PM2
pm2 start npm --name "senditfast" -- start 2>/dev/null || pm2 restart senditfast
pm2 save

echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Recent Logs:"
pm2 logs senditfast --lines 20 --nostream

echo ""
echo "🎉 Done! Visit your site to test."
echo ""

