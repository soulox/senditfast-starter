# 🔒 Admin Subdomain Configuration

## Security: Subdomain-Only Access

The super admin panel is **ONLY accessible via subdomain** for enhanced security:

✅ **Allowed:** `admin.senditfast.net` (production)  
✅ **Allowed:** `admin.localhost:3000` (local dev)  
❌ **Blocked:** `senditfast.net/superadmin` (main domain)  
❌ **Blocked:** `localhost:3000/superadmin` (main domain)

---

## 🚀 Production Setup

### Option 1: Cloudflare DNS (Recommended - 2 minutes)

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your `senditfast.net` domain

2. **Add CNAME Record**
   ```
   Type: CNAME
   Name: admin
   Target: senditfast.net
   Proxy status: Proxied (Orange cloud ☁️)
   TTL: Auto
   ```

3. **Save and Wait**
   - DNS propagation: ~2-5 minutes
   - SSL certificate: Auto-provisioned by Cloudflare

4. **Test Access**
   ```
   https://admin.senditfast.net
   ```

### Option 2: Nginx Reverse Proxy

If you're using Nginx directly:

```nginx
# Admin subdomain configuration
server {
    listen 443 ssl http2;
    server_name admin.senditfast.net;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/senditfast.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/senditfast.net/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

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
    }

    # Rate limiting (optional)
    limit_req_zone $binary_remote_addr zone=admin:10m rate=10r/s;
    limit_req zone=admin burst=20 nodelay;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name admin.senditfast.net;
    return 301 https://$server_name$request_uri;
}
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Custom Domain

Use a completely different domain like `sendadmin.com`:

1. **Point DNS A record to your server IP**
2. **Configure SSL certificate**
3. **Update environment variables**

---

## 💻 Local Development Setup

### Method 1: Edit Hosts File (Recommended)

**Windows:**
```powershell
# Run as Administrator
notepad C:\Windows\System32\drivers\etc\hosts

# Add this line:
127.0.0.1 admin.localhost
```

**macOS/Linux:**
```bash
sudo nano /etc/hosts

# Add this line:
127.0.0.1 admin.localhost
```

**Access:**
```
http://admin.localhost:3000
```

### Method 2: Use localhost with port

The middleware also allows `admin.localhost` automatically:
```
http://admin.localhost:3000
```

### Method 3: Browser Extension

Install a hosts file manager extension:
- **Chrome/Edge:** "Virtual Hosts" extension
- **Firefox:** "Host Switch Plus"

Map: `admin.localhost → 127.0.0.1`

---

## 🧪 Testing the Security

### ✅ Should Work:
```bash
# Production
curl https://admin.senditfast.net/superadmin

# Local development  
curl http://admin.localhost:3000/superadmin
```

### ❌ Should Be Blocked:
```bash
# Main domain access (returns 403)
curl https://senditfast.net/superadmin
# Response: {"error":"Access Denied","message":"Super admin panel must be accessed via admin subdomain"}

# Local main domain (returns 403)
curl http://localhost:3000/superadmin
# Response: {"error":"Access Denied"}
```

---

## 🔐 Security Features

### 1. Domain Isolation
- Admin panel isolated on separate subdomain
- Cannot be accessed from main domain
- Reduces attack surface

### 2. Automatic Redirect
```
admin.senditfast.net/ → admin.senditfast.net/superadmin
```

### 3. Route Protection
All super admin routes are protected:
- `/superadmin/*`
- `/api/superadmin/*`

### 4. Logging
Security violations are logged:
```
[Security] Blocked super admin access from main domain: senditfast.net
```

---

## 📊 Middleware Logic

```typescript
// middleware.ts

if (isSuperAdminRoute && !isAdminSubdomain) {
  // Block access from main domain
  return 403 Access Denied
}

if (isAdminSubdomain && pathname === '/') {
  // Redirect root to super admin
  return redirect('/superadmin')
}
```

---

## 🛠️ Troubleshooting

### Issue: "Access Denied" when accessing admin subdomain

**Check hostname detection:**
```javascript
// Add to middleware.ts for debugging
console.log('Hostname:', hostname);
console.log('Is Admin Subdomain:', isAdminSubdomain);
```

**Verify DNS:**
```bash
# Check DNS resolution
nslookup admin.senditfast.net

# Or use dig
dig admin.senditfast.net
```

### Issue: Localhost not working

**Solution 1: Update hosts file**
```
127.0.0.1 admin.localhost
```

**Solution 2: Use full subdomain**
```
http://admin.localhost:3000
```

**Solution 3: Disable middleware temporarily for testing**
```typescript
// middleware.ts - Add at the top
if (process.env.NODE_ENV === 'development') {
  return NextResponse.next(); // Skip in dev mode
}
```

### Issue: SSL certificate errors on subdomain

**Cloudflare:** Certificates are auto-provisioned (wait 5 minutes)

**Let's Encrypt:**
```bash
# Include subdomain in certificate
sudo certbot certonly --nginx -d senditfast.net -d admin.senditfast.net
```

**Wildcard certificate:**
```bash
sudo certbot certonly --dns-cloudflare -d "*.senditfast.net" -d senditfast.net
```

---

## 🚀 Deployment Checklist

Production deployment:

- [ ] Add DNS record for admin subdomain
- [ ] Verify DNS propagation (`nslookup admin.senditfast.net`)
- [ ] Ensure SSL certificate covers subdomain
- [ ] Test subdomain access: `https://admin.senditfast.net`
- [ ] Verify main domain is blocked: `https://senditfast.net/superadmin`
- [ ] Check middleware logs for security events
- [ ] Update firewall rules (optional)
- [ ] Configure rate limiting (optional)
- [ ] Set up monitoring alerts

---

## 📈 Advanced: IP Whitelisting

Add extra security with IP restrictions:

**Cloudflare Firewall Rules:**
```
(http.host eq "admin.senditfast.net" and not ip.src in {203.0.113.0/24})
Action: Block
```

**Nginx:**
```nginx
# In admin server block
location /superadmin {
    allow 203.0.113.0/24;  # Office network
    allow 198.51.100.5;     # Your home IP
    deny all;
    
    proxy_pass http://localhost:3000;
}
```

---

## 🔄 Migration from Main Domain

If users bookmarked old URLs:

**Option 1: Show helpful message**
```typescript
// Already implemented in middleware.ts
// Returns 403 with helpful message
```

**Option 2: Auto-redirect (less secure)**
```typescript
// middleware.ts - NOT RECOMMENDED
if (isSuperAdminRoute && !isAdminSubdomain) {
  const adminUrl = new URL(request.url);
  adminUrl.host = 'admin.senditfast.net';
  return NextResponse.redirect(adminUrl);
}
```

---

## 📚 Related Documentation

- `SUPER_ADMIN_SETUP.md` - Full admin panel documentation
- `QUICK_ADMIN_SETUP.md` - Quick start guide
- `middleware.ts` - Security implementation

---

## ✅ Summary

**Production Access:**
```
https://admin.senditfast.net/superadmin
```

**Local Development:**
```
http://admin.localhost:3000/superadmin
```

**Security:** Main domain access is completely blocked by middleware. The super admin panel is isolated on a separate subdomain for maximum security.

---

*For questions or issues, refer to the troubleshooting section or contact the development team.*

