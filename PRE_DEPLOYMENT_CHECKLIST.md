# ✅ Pre-Deployment Checklist for SendItFast

Complete this checklist before deploying to Cloudflare Pages.

---

## 🔍 **Code Review**

### **Files & Configuration:**
- [x] All features implemented and tested locally
- [x] No hardcoded secrets in code
- [x] `.gitignore` includes `.env.local`, `.next/`, `.ssl/`
- [x] `package.json` has correct build scripts
- [x] TypeScript compiles without errors
- [ ] No console.logs in production code (optional cleanup)
- [x] All dependencies are production-ready

### **Environment Variables:**
- [x] All variables documented
- [x] Separate dev/prod credentials ready
- [x] `NEXTAUTH_SECRET` generated (production)
- [x] All API keys obtained (production)

---

## 🗄️ **Database**

### **Neon Postgres:**
- [ ] Production database created
- [ ] Connection string obtained
- [ ] All migrations run successfully:
  - [ ] `schema.sql` (main tables)
  - [ ] `business-features.sql` (team, API keys, branding, audit)
  - [ ] `add-2fa.sql` (two-factor auth)
  - [ ] `add-password-reset.sql` (password reset tokens)
- [ ] Database accessible from Cloudflare IPs
- [ ] Connection pooling configured
- [ ] Backup strategy in place

**Migration Commands:**
```bash
# Set production DATABASE_URL in .env.local temporarily
node scripts/migrate.js infra/sql/schema.sql
node scripts/migrate.js infra/sql/business-features.sql
node scripts/migrate.js infra/sql/add-2fa.sql
node scripts/migrate.js infra/sql/add-password-reset.sql
```

---

## ☁️ **Backblaze B2**

### **Storage Setup:**
- [ ] Production bucket created
- [ ] Bucket is private (not public)
- [ ] Application key created with proper permissions
- [ ] CORS configured for your domain
- [ ] Lifecycle rules set (optional)
- [ ] Credentials ready for Cloudflare

**CORS Configuration for B2:**
```json
[
  {
    "corsRuleName": "allowCloudflare",
    "allowedOrigins": [
      "https://your-domain.pages.dev",
      "https://yourdomain.com"
    ],
    "allowedOperations": [
      "s3_get",
      "s3_head",
      "s3_put"
    ],
    "allowedHeaders": ["*"],
    "exposeHeaders": ["ETag"],
    "maxAgeSeconds": 3600
  }
]
```

---

## 🔐 **Authentication**

### **NextAuth:**
- [ ] `NEXTAUTH_SECRET` generated (32+ chars)
  ```bash
  openssl rand -base64 32
  ```
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Session strategy configured

### **Google OAuth:**
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] Credentials created (Client ID & Secret)
- [ ] Redirect URI added: `https://yourdomain.com/api/auth/callback/google`
- [ ] Scopes configured: email, profile

---

## 💳 **Payments (Authorize.Net)**

### **Production Setup:**
- [ ] Authorize.Net production account created
- [ ] API Login ID obtained
- [ ] Transaction Key obtained
- [ ] Public Client Key obtained
- [ ] Test transaction successful
- [ ] Webhook configured (if applicable)
- [ ] Production mode enabled (`AUTHORIZENET_ENVIRONMENT=production`)

**⚠️ Important:**
- Use production credentials, not sandbox
- Test with real card (small amount)
- Verify funds are captured

---

## 📧 **Email (Mailgun)**

### **Production Setup:**
- [ ] Mailgun account verified
- [ ] Custom domain added and verified
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Domain status: Active
- [ ] API key obtained
- [ ] From email configured
- [ ] Test email sent successfully

**DNS Records Required:**
- TXT record for domain verification
- MX records for receiving
- CNAME records for tracking

---

## 🔒 **Security**

### **SSL/TLS:**
- [ ] Cloudflare provides automatic SSL (no action needed)
- [ ] Custom domain SSL configured (if applicable)

### **Secrets:**
- [ ] All secrets in environment variables (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Production secrets different from dev

### **Rate Limiting:**
- [ ] Rate limiting configured in code
- [ ] Cloudflare rate limiting rules (optional)

### **CORS:**
- [ ] CORS headers configured
- [ ] Only allow your domains
- [ ] B2 CORS configured

---

## 🧪 **Testing**

### **Local Testing:**
- [x] All features work on `https://localhost:3000`
- [x] File upload/download works
- [x] Payments work (test mode)
- [x] Emails send (test mode)
- [x] Authentication works
- [x] 2FA works
- [x] QR codes generate
- [x] File preview works
- [x] Custom branding applies

### **Build Testing:**
```bash
# Test production build
pnpm run pages:build

# Should complete without errors
# Check output in .vercel/output/static
```

---

## 📦 **Dependencies**

### **Production Dependencies:**
All installed and working:
- [x] Next.js 14
- [x] React 18
- [x] NextAuth
- [x] Neon Postgres driver
- [x] AWS S3 SDK (for B2)
- [x] Mailgun SDK
- [x] QR Code libraries
- [x] Speakeasy (2FA)
- [x] Zod validation
- [x] bcryptjs

### **Verify No Dev Dependencies in Production:**
```bash
# Check package.json
# Ensure dev dependencies are in "devDependencies"
```

---

## 🌍 **Domain & DNS**

### **If Using Custom Domain:**
- [ ] Domain purchased
- [ ] Nameservers pointed to Cloudflare
- [ ] DNS records propagated
- [ ] SSL certificate issued (automatic)
- [ ] Domain verified in Cloudflare Pages

### **DNS Records:**
```
Type: CNAME
Name: @
Content: your-project.pages.dev
Proxy: Yes (orange cloud)

Type: CNAME  
Name: www
Content: your-project.pages.dev
Proxy: Yes (orange cloud)
```

---

## 📊 **Monitoring Setup**

### **Before Launch:**
- [ ] Error tracking configured (Sentry, optional)
- [ ] Uptime monitoring (UptimeRobot, optional)
- [ ] Performance monitoring
- [ ] Database monitoring (Neon dashboard)
- [ ] Storage monitoring (B2 dashboard)

### **Cloudflare Analytics:**
- [ ] Enable Web Analytics
- [ ] Set up alerts for errors
- [ ] Monitor bandwidth usage

---

## 💰 **Cost Estimation**

### **Monthly Costs (Estimated):**

**Cloudflare Pages:**
- Free tier: $0
- Paid: $20/month (if needed)

**Neon Postgres:**
- Free tier: $0 (0.5GB storage)
- Pro: $19/month (10GB storage)

**Backblaze B2:**
- First 10GB storage: Free
- Additional: $0.005/GB/month
- Downloads: First 1GB free/day

**Mailgun:**
- Free: 5,000 emails/month (3 months)
- Pay-as-you-go: $0.80/1,000 emails

**Authorize.Net:**
- $25/month + transaction fees
- Or custom pricing

**Total Estimated:**
- **Minimum:** $25/month (just Authorize.Net)
- **Typical:** $50-100/month (with paid tiers)
- **Scale:** Increases with usage

---

## 🎯 **Go-Live Strategy**

### **Soft Launch (Recommended):**
1. Deploy to Cloudflare
2. Test with internal team
3. Invite beta users
4. Monitor for issues
5. Fix bugs
6. Public launch

### **Hard Launch:**
1. Deploy to production
2. Announce immediately
3. Monitor closely
4. Be ready for issues

---

## 📝 **Final Steps Before Deploy**

### **1. Environment Variables Spreadsheet**

Create a spreadsheet with all variables:
- Variable name
- Dev value (masked)
- Prod value (masked)
- Description
- Required/Optional

### **2. Backup Current State**

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Backup .env.local
cp .env.local .env.local.backup

# Tag current version
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

### **3. Create Rollback Plan**

- Keep previous deployment active
- Have database backup
- Document rollback steps
- Test rollback procedure

---

## ✅ **Ready to Deploy?**

**If you can check all these:**
- ✅ All migrations run on production DB
- ✅ All environment variables ready
- ✅ Build succeeds locally
- ✅ All features tested
- ✅ OAuth providers configured
- ✅ Payment gateway in production mode
- ✅ Email service configured
- ✅ Monitoring set up

**Then you're ready to deploy to Cloudflare!** 🚀

---

## 🆘 **Need Help?**

**If you encounter issues:**
1. Check Cloudflare build logs
2. Review error messages
3. Test locally with production build
4. Check environment variables
5. Verify database connectivity
6. Review this checklist again

**Resources:**
- `CLOUDFLARE_DEPLOYMENT.md` - Detailed deployment guide
- Cloudflare Discord - Community support
- GitHub Issues - Report bugs

---

**Next Step:** Follow `CLOUDFLARE_DEPLOYMENT.md` for step-by-step deployment instructions! 🚀
