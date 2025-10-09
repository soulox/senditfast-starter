#!/bin/bash

# Force Clean Build - Removes ALL Edge Runtime artifacts
# Run this on your Ubuntu server

set -e

echo "🧹 Force Clean Build Script"
echo "============================"
echo ""

cd /var/www/senditfast

# Stop app
echo "⏸️  Stopping application..."
pm2 stop senditfast 2>/dev/null || echo "App not running"

# Pull latest
echo "📥 Pulling latest code..."
git pull origin main

# Remove ALL build and cache directories
echo "🗑️  Removing all build artifacts and caches..."
rm -rf .next
rm -rf node_modules
rm -rf .pnpm-store
rm -rf pnpm-lock.yaml
rm -rf .turbo
rm -rf .cache

# Clear pnpm cache globally
echo "🗑️  Clearing pnpm global cache..."
pnpm store prune

# Fresh install
echo "📦 Fresh install of dependencies..."
pnpm install --no-frozen-lockfile

# Build with clean cache
echo "🔨 Building application (clean)..."
NODE_ENV=production pnpm build

# Verify no edge-runtime
echo ""
echo "🔍 Verifying clean build..."
if grep -r "edge-runtime" .next/ 2>/dev/null | head -1; then
    echo "⚠️  WARNING: Still found edge-runtime references"
    echo "This might be from AWS SDK - it's in dependencies but shouldn't affect NextAuth"
else
    echo "✅ Clean build - no edge-runtime found"
fi

# Check NextAuth specifically
echo ""
echo "🔍 Checking NextAuth route build..."
if [ -f ".next/server/app/api/auth/[...nextauth]/route.js" ]; then
    echo "✅ NextAuth route built successfully"
    
    # Check if it's using edge-runtime
    if grep -q "edge-runtime" .next/server/app/api/auth/\[...nextauth\]/route.js 2>/dev/null; then
        echo "❌ ERROR: NextAuth route is using edge-runtime!"
        echo "This is the problem - NextAuth should use Node.js runtime"
    else
        echo "✅ NextAuth route is NOT using edge-runtime (good!)"
    fi
else
    echo "⚠️  NextAuth route not found in build"
fi

echo ""
echo "🚀 Starting application..."
pm2 delete senditfast 2>/dev/null || true
pm2 start npm --name "senditfast" -- start
pm2 save

echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Recent Logs:"
pm2 logs senditfast --lines 20 --nostream

echo ""
echo "=================================="
echo "✅ Force clean build complete!"
echo ""
echo "Test Google OAuth now at:"
echo "https://senditfast.net/auth/signin"
echo ""

