#!/bin/bash

# Verification script to ensure all Cloudflare configs are removed
# Run this on your Ubuntu server

echo "🔍 Verifying Clean Configuration"
echo "=================================="
echo ""

cd /var/www/senditfast

echo "1️⃣ Checking for runtime exports in API routes..."
if grep -r "export const runtime" app/api/ 2>/dev/null; then
    echo "⚠️  Found runtime exports (should be removed for Ubuntu deployment)"
else
    echo "✅ No runtime exports found"
fi
echo ""

echo "2️⃣ Checking for dynamic exports..."
if grep -r "export const dynamic" app/ 2>/dev/null; then
    echo "⚠️  Found dynamic exports"
else
    echo "✅ No dynamic exports found"
fi
echo ""

echo "3️⃣ Checking for Cloudflare packages..."
if grep -i "cloudflare" package.json; then
    echo "⚠️  Found Cloudflare packages"
else
    echo "✅ No Cloudflare packages"
fi
echo ""

echo "4️⃣ Checking for wrangler.toml..."
if [ -f "wrangler.toml" ]; then
    echo "⚠️  wrangler.toml still exists"
else
    echo "✅ wrangler.toml removed"
fi
echo ""

echo "5️⃣ Checking Next.js config..."
cat next.config.mjs
echo ""

echo "6️⃣ Checking for Edge Runtime in build output..."
if [ -d ".next" ]; then
    if grep -r "edge-runtime" .next/ 2>/dev/null | head -5; then
        echo "⚠️  Found edge-runtime references in build"
    else
        echo "✅ No edge-runtime in build"
    fi
else
    echo "⚠️  .next directory not found - need to build"
fi
echo ""

echo "7️⃣ Checking NextAuth route..."
cat app/api/auth/\[...nextauth\]/route.ts
echo ""

echo "=================================="
echo "✅ Verification complete!"
echo ""
echo "If you see any ⚠️ warnings above, run:"
echo "  git pull origin main"
echo "  rm -rf .next node_modules"
echo "  pnpm install"
echo "  pnpm build"
echo ""

