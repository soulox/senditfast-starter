#!/bin/bash

# Google OAuth Debugging Script
# Run this on your Ubuntu server to diagnose redirect issues

echo "🔍 Google OAuth Configuration Diagnostics"
echo "=========================================="
echo ""

cd /var/www/senditfast

echo "📋 Environment Variables:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "NEXTAUTH_URL:"
grep NEXTAUTH_URL .env.local || echo "❌ NOT SET!"

echo ""
echo "NEXT_PUBLIC_BASE_URL:"
grep NEXT_PUBLIC_BASE_URL .env.local || echo "❌ NOT SET!"

echo ""
echo "GOOGLE_CLIENT_ID:"
grep GOOGLE_CLIENT_ID .env.local | sed 's/=.*/=***REDACTED***/'

echo ""
echo "GOOGLE_CLIENT_SECRET:"
grep GOOGLE_CLIENT_SECRET .env.local | sed 's/=.*/=***REDACTED***/'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Checking for suspicious domains in codebase:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if grep -r "bedpage" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git 2>/dev/null; then
    echo "⚠️ Found 'bedpage' references in code!"
else
    echo "✅ No 'bedpage' found in code"
fi
echo ""

echo "🔍 Checking PM2 environment:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 env senditfast 2>/dev/null | grep -E "NEXTAUTH_URL|GOOGLE_CLIENT" | sed 's/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=***REDACTED***/'
echo ""

echo "🔍 Current Git Branch and Commit:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git branch
echo "Latest commit:"
git log --oneline -1
echo ""

echo "🔍 Testing App Response:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking if app is running on localhost:3000..."
curl -s http://localhost:3000 | head -20 || echo "❌ App not responding"
echo ""

echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ TODO - Fix any issues above, then:"
echo "   1. Make sure NEXTAUTH_URL=https://senditfast.net"
echo "   2. Make sure GOOGLE_CLIENT_ID is correct"
echo "   3. pm2 restart senditfast"
echo "   4. Clear browser cache and cookies"
echo "   5. Wait 5-10 min for Google changes to propagate"
echo ""

