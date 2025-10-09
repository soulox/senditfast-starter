# 🔧 Fix "Too Many Redirects" with Cloudflare CDN

## 🔍 The Problem

When using Cloudflare CDN, you're getting an infinite redirect loop because:
- Cloudflare connects to your server via HTTP
- Nginx redirects HTTP to HTTPS
- This creates an endless loop

---

## ✅ **QUICK FIX** (3 Steps)

### Step 1: Update Cloudflare SSL Settings

**On Cloudflare Dashboard:**

1. Go to **SSL/TLS** tab
2. Set encryption mode to: **Full** (or **Full (Strict)**)
   - ❌ NOT "Flexible"
   - ✅ Use "Full"

**Why?** This makes Cloudflare use HTTPS when connecting to your origin server.

### Step 2: Update Nginx Configuration

**On your Ubuntu server:**

```bash
sudo nano /etc/nginx/sites-available/senditfast
```

**Replace the entire file with:**

```nginx
# HTTP - Accept from Cloudflare (don't redirect)
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Accept traffic from Cloudflare
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Trust Cloudflare's protocol header
        proxy_set_header X-Forwarded-Proto https;
        
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    client_max_body_size 10G;
    client_body_timeout 600s;
}

# HTTPS - For direct access (bypassing Cloudflare)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
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
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    client_max_body_size 10G;
    client_body_timeout 600s;
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 3: Reload Nginx

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🧪 **Test the Fix**

```bash
# Clear browser cache
# Or use incognito/private browsing

# Visit your site
https://yourdomain.com
```

**Should work now!** ✅

---

## 🔐 **Alternative Solutions**

### Solution A: Cloudflare Full (Strict) SSL

**Best for production:**

1. Cloudflare → **SSL/TLS** → **Full (Strict)**
2. This requires a valid SSL certificate on your server
3. Use the Nginx config above (with HTTPS block)
4. Cloudflare validates your certificate

### Solution B: Cloudflare Page Rules

**If you want to keep Flexible SSL:**

1. Cloudflare → **Rules** → **Page Rules**
2. Create rule:
   - URL: `http://yourdomain.com/*`
   - Setting: **Always Use HTTPS**
   - **OFF** (disable this rule)

### Solution C: Remove HTTP→HTTPS Redirect from Nginx

**Simplest but less secure for direct access:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # No redirect - just proxy
    location / {
        proxy_pass http://localhost:3000;
        # ... rest of proxy config
    }
}
```

**Trade-off:** Direct HTTP access works, but Cloudflare handles HTTPS.

---

## 🎯 **Recommended Setup**

### For Cloudflare CDN + Ubuntu Server:

**Cloudflare Settings:**
- SSL/TLS mode: **Full** ✅
- Always Use HTTPS: **ON** ✅
- Automatic HTTPS Rewrites: **ON** ✅

**Nginx Settings:**
- Listen on both 80 and 443 ✅
- Don't redirect HTTP to HTTPS ✅
- Trust `X-Forwarded-Proto` header ✅

**Next.js Settings:**
```bash
# In .env.local
NEXTAUTH_URL=https://yourdomain.com  # Use HTTPS
```

---

## 🔍 **Debugging Steps**

### Check Cloudflare SSL Mode:

1. Cloudflare Dashboard → Your domain
2. **SSL/TLS** tab
3. Current mode should be **Full** (not Flexible)

### Check Nginx Configuration:

```bash
# View current config
cat /etc/nginx/sites-available/senditfast

# Test config
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Headers:

```bash
# See what headers Cloudflare is sending
curl -I http://your-server-ip
curl -I https://yourdomain.com
```

### Clear Cloudflare Cache:

1. Cloudflare Dashboard
2. **Caching** → **Configuration**
3. Click **Purge Everything**

---

## 🛡️ **Security with Cloudflare**

### Restrict Access to Cloudflare Only

**Update firewall to only allow Cloudflare IPs:**

```bash
# Install helper script
sudo apt install -y curl

# Create Cloudflare IP allow script
sudo nano /usr/local/bin/update-cloudflare-ips.sh
```

Paste:

```bash
#!/bin/bash
# Only allow Cloudflare IPs to connect

# Flush existing rules
ufw --force reset

# Allow SSH (CRITICAL!)
ufw allow OpenSSH

# Get Cloudflare IPs
CF_IPS_V4=$(curl -s https://www.cloudflare.com/ips-v4)
CF_IPS_V6=$(curl -s https://www.cloudflare.com/ips-v6)

# Allow Cloudflare IPs
for ip in $CF_IPS_V4; do
    ufw allow from $ip to any port 80,443 proto tcp
done

for ip in $CF_IPS_V6; do
    ufw allow from $ip to any port 80,443 proto tcp
done

# Enable firewall
ufw --force enable

echo "✅ Firewall updated to allow only Cloudflare IPs"
ufw status
```

Make executable and run:

```bash
sudo chmod +x /usr/local/bin/update-cloudflare-ips.sh
sudo /usr/local/bin/update-cloudflare-ips.sh
```

**⚠️ WARNING:** Only do this if you're sure Cloudflare is working, or you'll lock yourself out!

---

## 📊 **Verification Checklist**

After applying the fix:

- [ ] Cloudflare SSL mode is **Full** (not Flexible)
- [ ] Nginx config updated and reloaded
- [ ] Browser cache cleared
- [ ] Site loads at `https://yourdomain.com`
- [ ] No redirect loop
- [ ] File uploads work
- [ ] Authentication works

---

## 🔄 **Quick Copy-Paste Fix**

**Run this on your Ubuntu server:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-available/senditfast /etc/nginx/sites-available/senditfast.backup

# Update config
sudo tee /etc/nginx/sites-available/senditfast > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    client_max_body_size 10G;
    client_body_timeout 600s;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
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
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
    
    client_max_body_size 10G;
    client_body_timeout 600s;
}
EOF

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

**Then on Cloudflare:**
- Change SSL mode to **Full**

**That's it!** 🎉

---

## 🆘 **Still Having Issues?**

### Check NextAuth URL:

```bash
# Make sure NEXTAUTH_URL uses https://
grep NEXTAUTH_URL /var/www/senditfast/.env.local
```

Should be:
```
NEXTAUTH_URL=https://yourdomain.com
```

### Disable Cloudflare Temporarily:

1. Cloudflare → DNS
2. Click the orange cloud icon (make it gray)
3. Test if site works without Cloudflare
4. Re-enable (click gray cloud to make it orange)

### Check Cloudflare Rules:

- Cloudflare → **Rules** → **Page Rules**
- Look for any "Always Use HTTPS" rules
- Temporarily disable them

---

**Let me know if the redirect issue is fixed!** 🚀

