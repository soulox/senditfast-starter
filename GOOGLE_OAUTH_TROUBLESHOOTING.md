# 🔧 Google OAuth Redirect Issues - Troubleshooting Guide

## 🚨 **Issue: Redirecting to Wrong Domain (bedpage.com)**

If Google OAuth is redirecting to the wrong domain, follow these steps:

---

## ✅ **Step 1: Verify Server Environment**

**On your Ubuntu server:**

```bash
cd /var/www/senditfast

# Check environment variables
cat .env.local | grep -E "NEXTAUTH_URL|GOOGLE_|NEXT_PUBLIC_BASE_URL"
```

**Should show:**
```bash
NEXTAUTH_URL=https://senditfast.net
NEXT_PUBLIC_BASE_URL=https://senditfast.net
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-secret
```

**If any are wrong, fix them:**

```bash
nano .env.local
```

Update to:
```bash
NEXTAUTH_URL=https://senditfast.net
NEXT_PUBLIC_BASE_URL=https://senditfast.net
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Restart the app:**
```bash
pm2 restart senditfast
pm2 logs senditfast --lines 20
```

---

## ✅ **Step 2: Clear All Caches**

### Browser Cache:

**Option A: Use Incognito/Private Mode**
- Open a private/incognito window
- Try Google sign-in again

**Option B: Clear Browser Data**
- Chrome: Settings → Privacy → Clear browsing data
- Select "Cookies" and "Cached images and files"
- Time range: "All time"
- Clear data

### Cloudflare Cache:

1. Go to Cloudflare Dashboard
2. **Caching** → **Configuration**
3. Click **Purge Everything**
4. Wait 30 seconds

### Server-Side Sessions:

```bash
# Clear any old NextAuth sessions
# NextAuth uses JWT by default (no server sessions to clear)
# But restart the app to be sure
pm2 restart senditfast
```

---

## ✅ **Step 3: Verify Google Cloud Console**

### Check OAuth Credentials:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your **OAuth 2.0 Client ID**
3. Verify **Authorized JavaScript origins**:
   ```
   https://senditfast.net
   https://www.senditfast.net
   ```

4. Verify **Authorized redirect URIs**:
   ```
   https://senditfast.net/api/auth/callback/google
   https://www.senditfast.net/api/auth/callback/google
   ```

5. **IMPORTANT:** Make sure there are NO other redirect URIs listed (especially no bedpage.com!)

6. Click **Save**

7. **Wait 5-10 minutes** for Google to propagate changes

---

## ✅ **Step 4: Test the OAuth Flow**

### Manual Test:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Visit: `https://senditfast.net/auth/signin`
4. Click "Sign in with Google"
5. Watch the network requests:
   - Should go to `accounts.google.com`
   - Then redirect back to `senditfast.net/api/auth/callback/google`

### Check Redirect URL in Browser:

When you click "Sign in with Google", the URL should look like:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=https://senditfast.net/api/auth/callback/google
  &response_type=code
  ...
```

**Check the `redirect_uri` parameter** - it should be `senditfast.net`, not `bedpage.com`!

---

## 🔍 **If redirect_uri is Wrong:**

### Check Server-Side Code:

**On your server:**

```bash
cd /var/www/senditfast

# Search for any hardcoded URLs
grep -r "bedpage" .
grep -r "bedpage" .env.local

# Check for any old environment variables
env | grep -i next
env | grep -i auth
```

### Check Running Process Environment:

```bash
# Check what environment variables PM2 is using
pm2 env senditfast | grep -E "NEXTAUTH|BASE_URL|GOOGLE"
```

**If they're wrong:**

```bash
# Edit .env.local
nano .env.local

# MUST restart PM2 for env changes to take effect
pm2 restart senditfast

# Or delete and recreate:
pm2 delete senditfast
pm2 start npm --name "senditfast" -- start
pm2 save
```

---

## 🚨 **Common Causes**

### Cause 1: Wrong NEXTAUTH_URL

**Problem:** `NEXTAUTH_URL` is set to old domain or wrong value

**Fix:**
```bash
# .env.local MUST have:
NEXTAUTH_URL=https://senditfast.net

# NOT http:// (must be https://)
# NOT localhost
# NOT old domain
```

### Cause 2: Multiple Google OAuth Clients

**Problem:** You're using the wrong Google Client ID

**Fix:**
1. Check Google Cloud Console
2. Make sure you're using the CORRECT client ID
3. Delete any old OAuth clients

### Cause 3: Browser Cookie from Old Domain

**Problem:** Browser has cookies from previous testing

**Fix:**
```
1. Open DevTools (F12)
2. Application → Cookies
3. Delete ALL cookies for senditfast.net
4. Try again in incognito
```

### Cause 4: Cloudflare Cached Redirect

**Problem:** Cloudflare cached an old redirect

**Fix:**
1. Cloudflare → Caching → Purge Everything
2. Or temporarily set Cloudflare to "DNS Only" (gray cloud)
3. Test again
4. Re-enable Cloudflare (orange cloud)

---

## 🔬 **Deep Debugging**

### Check What URL Next.js is Using:

Add temporary logging:

<function_calls>
<invoke name="read_file">
<parameter name="target_file">app/auth/signin/page.tsx
