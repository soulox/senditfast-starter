# 🚀 Cloudflare Deployment Guide for SendItFast

Complete guide to deploy your SendItFast application to Cloudflare Pages with Workers.

---

## 📋 **Pre-Deployment Checklist**

### **✅ What's Ready:**
- ✅ Next.js 14 application
- ✅ App Router architecture
- ✅ API routes (compatible with Workers)
- ✅ Neon Postgres (serverless, edge-compatible)
- ✅ Backblaze B2 (S3-compatible storage)
- ✅ NextAuth authentication
- ✅ Authorize.Net payments
- ✅ Mailgun emails
- ✅ All features implemented

### **⚠️ Considerations:**
- Some features may need adjustments for Workers environment
- Environment variables must be configured in Cloudflare
- Database connection pooling for edge
- File upload limits (Workers has 100MB request limit)

---

## 🎯 **Deployment Strategy**

### **Recommended Approach: Cloudflare Pages + Workers**

**Why Cloudflare Pages:**
- ✅ Free tier available
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Preview deployments
- ✅ Edge computing

**Architecture:**
```
┌─────────────────────────────────────────┐
│         Cloudflare Pages                │
│  (Static Assets + SSR/API Routes)       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Cloudflare Workers                 │
│  (Serverless Functions / API Routes)    │
└─────────────────────────────────────────┘
                  ↓
┌──────────────┬──────────────┬───────────┐
│  Neon DB     │  B2 Storage  │  External │
│  (Postgres)  │  (Files)     │  APIs     │
└──────────────┴──────────────┴───────────┘
```

---

## 🛠️ **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

1. **Ensure `.gitignore` is correct:**
```bash
# Check that these are ignored
.env.local
.next/
node_modules/
.ssl/
```

2. **Commit all changes:**
```bash
git add .
git commit -m "Prepare for Cloudflare deployment"
git push origin main
```

---

### **Step 2: Configure Cloudflare Pages**

1. **Go to Cloudflare Dashboard:**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages**
   - Click **Create Application** → **Pages**

2. **Connect Git Repository:**
   - Connect to GitHub/GitLab
   - Select your `senditfast-starter` repository
   - Click **Begin Setup**

3. **Build Configuration:**
   ```
   Framework preset: Next.js
   Build command: pnpm run pages:build
   Build output directory: .vercel/output/static
   Root directory: /
   ```

4. **Environment Variables:**
   Click **Add variable** and add ALL variables from your `.env.local`:

---

### **Step 3: Environment Variables**

**Copy these from your `.env.local`:**

#### **Database:**
```env
DATABASE_URL=postgresql://...
```

#### **Backblaze B2:**
```env
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_BUCKET=your-bucket-name
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_REGION=us-west-004
MOCK_B2=false
```

#### **NextAuth:**
```env
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_BASE_URL=https://your-domain.pages.dev
```

#### **Google OAuth:**
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### **Authorize.Net:**
```env
AUTHORIZENET_API_LOGIN_ID=your-api-login-id
AUTHORIZENET_TRANSACTION_KEY=your-transaction-key
NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID=your-api-login-id
NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY=your-public-client-key
AUTHORIZENET_ENVIRONMENT=production
```

#### **Mailgun:**
```env
MAILGUN_API_KEY=key-your-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
```

**⚠️ Important:**
- Use production credentials, not sandbox/test
- Update `NEXTAUTH_URL` to your actual domain
- Update `NEXT_PUBLIC_BASE_URL` to your actual domain
- Generate new `NEXTAUTH_SECRET` for production

---

### **Step 4: Deploy**

1. **Click "Save and Deploy"**
2. Wait for build to complete (3-5 minutes)
3. Cloudflare will provide a URL: `https://your-project.pages.dev`

---

### **Step 5: Post-Deployment Configuration**

#### **1. Update OAuth Redirect URIs**

**Google Cloud Console:**
- Add: `https://your-project.pages.dev/api/auth/callback/google`

**Authorize.Net:**
- Update callback URLs if needed

#### **2. Update Environment Variables**

Go back to Cloudflare Pages settings and update:
```env
NEXTAUTH_URL=https://your-project.pages.dev
NEXT_PUBLIC_BASE_URL=https://your-project.pages.dev
```

Then **Redeploy** (Settings → Deployments → Retry deployment)

#### **3. Configure Custom Domain (Optional)**

1. Go to **Custom domains** in Cloudflare Pages
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `senditfast.com`)
4. Follow DNS instructions
5. Wait for SSL certificate (automatic)

If using custom domain, update:
```env
NEXTAUTH_URL=https://senditfast.com
NEXT_PUBLIC_BASE_URL=https://senditfast.com
```

---

## ⚙️ **Cloudflare-Specific Adjustments**

### **1. Update `next.config.mjs`**

The current config should work, but verify:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] }
  }
};
export default nextConfig;
```

### **2. Workers Compatibility**

**Current Status:**
- ✅ Neon Postgres (edge-compatible)
- ✅ B2 via S3 SDK (compatible)
- ✅ NextAuth (compatible)
- ⚠️ File uploads (need to handle 100MB limit)

**File Upload Consideration:**
Cloudflare Workers has a 100MB request limit. For larger files:
- Current implementation uses multipart upload (✅ Good)
- Files are chunked on client-side (✅ Good)
- Each chunk is under 100MB (✅ Should work)

### **3. Cron Jobs**

Update `wrangler.toml` for automated cleanup:

```toml
name = "senditfast"
compatibility_date = "2025-01-01"

[triggers]
crons = ["0 2 * * *"]  # Run cleanup at 2 AM daily

[vars]
# Non-sensitive vars can go here
```

Create a cron handler:
```typescript
// app/api/cron/route.ts
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Run cleanup
  const { cleanupExpiredTransfers } = await import('@lib/cleanup');
  await cleanupExpiredTransfers();
  
  return new Response('OK');
}
```

---

## 🔒 **Security Considerations**

### **1. Secrets Management**

**Never commit:**
- `.env.local`
- API keys
- Database credentials
- OAuth secrets

**Use Cloudflare:**
- All secrets in environment variables
- Encrypted at rest
- Only accessible to your Workers

### **2. Production Checklist**

- [ ] Generate new `NEXTAUTH_SECRET` (32+ characters)
- [ ] Use production Authorize.Net credentials
- [ ] Use production Mailgun domain (not sandbox)
- [ ] Configure proper CORS headers
- [ ] Enable rate limiting
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain with SSL

---

## 📊 **Database Migrations**

### **Run Migrations on Production Database:**

1. **Update `.env.local` temporarily:**
```env
DATABASE_URL=your-production-neon-url
```

2. **Run all migrations:**
```bash
node scripts/migrate.js infra/sql/schema.sql
node scripts/migrate.js infra/sql/business-features.sql
node scripts/migrate.js infra/sql/add-2fa.sql
node scripts/migrate.js infra/sql/add-password-reset.sql
```

3. **Verify tables:**
```sql
-- Connect to Neon and verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🧪 **Testing Before Production**

### **1. Preview Deployment**

Cloudflare creates preview deployments for each commit:
- Test all features on preview URL
- Verify environment variables
- Check API routes
- Test file uploads
- Verify payments (use test mode)

### **2. Test Checklist**

- [ ] Sign up / Sign in
- [ ] Google OAuth
- [ ] Password reset
- [ ] File upload (small and large)
- [ ] File download
- [ ] File preview
- [ ] QR code generation
- [ ] Email notifications
- [ ] Payment flow (test mode)
- [ ] 2FA setup
- [ ] Team management
- [ ] API keys
- [ ] Custom branding
- [ ] Analytics dashboard

---

## 🚨 **Known Limitations & Workarounds**

### **1. File Upload Size (100MB Worker Limit)**

**Current Implementation:**
- ✅ Client-side chunking (good!)
- ✅ Multipart upload to B2 (good!)
- ✅ Proxy through API route

**If Issues Arise:**
- Consider direct client → B2 upload with CORS
- Use presigned URLs for direct upload
- Bypass Workers for large uploads

### **2. Cold Starts**

**Workers may have cold starts:**
- First request might be slower
- Keep-alive not available
- Solution: Warm-up requests or accept slight delay

### **3. Execution Time Limits**

**Workers timeout after 30 seconds (free) or 15 minutes (paid):**
- File uploads should complete quickly (streaming)
- Long-running tasks (cleanup) should be async
- Use Durable Objects for long operations if needed

---

## 💰 **Cloudflare Pricing**

### **Free Tier:**
- 500 deployments/month
- Unlimited requests
- Unlimited bandwidth
- 100,000 Workers requests/day

### **Paid Plans:**
- **Pages Pro:** $20/month
  - Advanced features
  - More build minutes
  - Priority support

- **Workers Paid:** $5/month
  - 10M requests included
  - $0.50 per additional million
  - No daily limits

**Recommendation:** Start with free tier, upgrade as needed.

---

## 🔄 **CI/CD Pipeline**

### **Automatic Deployments:**

Cloudflare automatically deploys on:
- Push to main branch → Production
- Pull requests → Preview deployments
- Commits to other branches → Preview

### **Deployment Workflow:**
```
1. Developer pushes code
2. Cloudflare detects change
3. Runs build command
4. Deploys to edge network
5. Updates live site (or preview)
6. Sends notification
```

---

## 📈 **Monitoring & Analytics**

### **Cloudflare Analytics:**
- Request volume
- Error rates
- Response times
- Geographic distribution
- Bandwidth usage

### **Application Monitoring:**
- Use Cloudflare Logpush
- Set up error tracking (Sentry)
- Monitor database performance (Neon)
- Track B2 storage usage

---

## 🔧 **Troubleshooting**

### **Build Fails:**
```bash
# Test build locally first
pnpm run pages:build

# Check for errors
# Fix any TypeScript errors
# Ensure all dependencies are installed
```

### **Environment Variables Not Working:**
- Verify all variables are set in Cloudflare
- Check for typos
- Redeploy after adding variables
- Use `NEXT_PUBLIC_` prefix for client-side vars

### **Database Connection Issues:**
- Ensure Neon allows connections from Cloudflare IPs
- Use connection pooling
- Check DATABASE_URL format
- Verify SSL mode

### **File Upload Fails:**
- Check B2 credentials
- Verify CORS settings on B2 bucket
- Test with small files first
- Check Workers request size limits

---

## 🎯 **Production Optimization**

### **1. Performance:**
- Enable Cloudflare caching for static assets
- Use CDN for file downloads
- Optimize images
- Minify JavaScript/CSS

### **2. Security:**
- Enable Cloudflare WAF (Web Application Firewall)
- Set up rate limiting rules
- Configure DDoS protection
- Use Cloudflare Access for admin routes

### **3. Reliability:**
- Set up health checks
- Configure failover
- Monitor uptime
- Set up alerts

---

## 📝 **Deployment Commands**

### **Local Build Test:**
```bash
# Test the build
pnpm run pages:build

# Preview locally
pnpm run pages:preview
```

### **Manual Deploy (if needed):**
```bash
# Install Wrangler CLI
pnpm add -D wrangler

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=senditfast
```

---

## 🌐 **Custom Domain Setup**

### **1. Add Domain to Cloudflare:**
- Add your domain to Cloudflare
- Update nameservers at registrar
- Wait for DNS propagation

### **2. Configure Pages Custom Domain:**
- Pages → Custom domains
- Add your domain
- Cloudflare handles SSL automatically

### **3. Update All URLs:**
```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### **4. Update OAuth Providers:**
- Google: Add `https://yourdomain.com/api/auth/callback/google`
- Authorize.Net: Update callback URLs

---

## 📊 **Post-Deployment Checklist**

### **Immediate (Day 1):**
- [ ] Verify site loads
- [ ] Test sign up/sign in
- [ ] Test file upload (small file)
- [ ] Test file download
- [ ] Check error logs
- [ ] Verify emails send
- [ ] Test payment flow (test mode)

### **Week 1:**
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify all features work
- [ ] Test from different locations
- [ ] Mobile testing
- [ ] Load testing

### **Ongoing:**
- [ ] Monitor costs
- [ ] Review analytics
- [ ] Check storage usage
- [ ] Update dependencies
- [ ] Security updates

---

## 🚧 **Potential Issues & Solutions**

### **Issue 1: Build Timeout**
**Solution:**
- Reduce dependencies
- Optimize build process
- Use Cloudflare Pages Pro for longer builds

### **Issue 2: Cold Start Latency**
**Solution:**
- Accept slight delay on first request
- Use Durable Objects for stateful operations
- Implement warming strategy

### **Issue 3: Large File Uploads**
**Solution:**
- Already using multipart upload (good!)
- Ensure chunks are under 100MB
- Consider direct B2 upload with presigned URLs

### **Issue 4: Database Connection Pool**
**Solution:**
- Neon handles this automatically
- Use `@neondatabase/serverless` (already using ✅)
- Configure connection limits if needed

---

## 💡 **Alternative Deployment Options**

### **Option 1: Vercel (Easier)**
**Pros:**
- Simpler Next.js deployment
- Better Next.js support
- Easy environment variables
- Automatic HTTPS

**Cons:**
- More expensive
- Less control
- Not as fast globally

**Deploy to Vercel:**
```bash
pnpm add -D vercel
npx vercel
```

### **Option 2: Cloudflare Workers (Current)**
**Pros:**
- Global edge network
- Very fast
- Affordable
- Scalable

**Cons:**
- More complex setup
- Some Next.js features limited
- 100MB request limit

### **Option 3: Hybrid (Recommended for Large Files)**
**Architecture:**
- Cloudflare Pages for app
- Direct B2 uploads (presigned URLs)
- Bypass Workers for large files

---

## 📚 **Required Updates for Production**

### **1. Update `next.config.mjs`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] }
  },
  images: {
    domains: ['your-b2-domain.com'], // If using Next Image
  },
  // Optimize for Cloudflare
  output: 'standalone',
};
export default nextConfig;
```

### **2. Add `wrangler.toml` Configuration:**
```toml
name = "senditfast"
compatibility_date = "2025-01-01"
pages_build_output_dir = ".vercel/output/static"

[triggers]
crons = ["0 2 * * *"]  # Cleanup at 2 AM daily

# Bind to KV for caching (optional)
# [[kv_namespaces]]
# binding = "CACHE"
# id = "your-kv-id"
```

### **3. Create `_headers` file:**
```
# .vercel/output/static/_headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  
/api/*
  Access-Control-Allow-Origin: https://yourdomain.com
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
```

### **4. Create `_redirects` file:**
```
# .vercel/output/static/_redirects
/api/* 200
/* /index.html 200
```

---

## 🎯 **Launch Checklist**

### **Pre-Launch:**
- [ ] All features tested on preview
- [ ] Database migrated to production
- [ ] All environment variables set
- [ ] OAuth providers configured
- [ ] Payment gateway in production mode
- [ ] Email service configured (production domain)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place

### **Launch Day:**
- [ ] Deploy to production
- [ ] Smoke test all features
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify emails send
- [ ] Test payments (small amount)
- [ ] Monitor database load

### **Post-Launch:**
- [ ] Announce launch
- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Fix any issues quickly
- [ ] Scale as needed

---

## 📞 **Support Resources**

### **Cloudflare:**
- [Pages Documentation](https://developers.cloudflare.com/pages/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Community Forum](https://community.cloudflare.com/)
- [Discord](https://discord.gg/cloudflaredev)

### **Next.js on Cloudflare:**
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Compatibility Guide](https://github.com/cloudflare/next-on-pages/blob/main/docs/supported.md)

---

## 🎉 **You're Ready to Deploy!**

**Quick Deploy Steps:**
1. Push code to GitHub
2. Connect to Cloudflare Pages
3. Configure environment variables
4. Deploy!
5. Update OAuth redirect URIs
6. Test everything
7. Go live! 🚀

**Estimated Time:** 30-60 minutes for first deployment

**Your SendItFast application is production-ready and optimized for Cloudflare's global edge network!** 🌍✨
