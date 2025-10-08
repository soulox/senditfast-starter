# SendItFast — Full-Stack File Transfer App

A production-ready file transfer application built with Next.js, deployed on Cloudflare Pages, with secure file storage on Backblaze B2.

## 🚀 Features Implemented

### ✅ Core Features
- **File Upload & Download**
  - Multipart upload support for large files (up to 5GB+)
  - Drag-and-drop file upload interface
  - Real-time progress tracking
  - Secure presigned URLs for B2 storage
  
- **Authentication & Authorization**
  - NextAuth with email/password authentication
  - Protected routes and API endpoints
  - User sessions with JWT
  - Secure password hashing with bcrypt

- **Transfer Management**
  - Create and manage file transfers
  - Password-protected transfers
  - Automatic expiration
  - Transfer analytics and tracking
  - Download event logging

- **Payment Integration**
  - Stripe checkout integration
  - Three pricing tiers (Free, Pro, Business)
  - Automatic plan upgrades/downgrades via webhooks
  - Subscription management

- **Email Notifications**
  - Transfer sharing via email (Mailgun)
  - Team invitations (Business plan)
  - Beautiful HTML email templates
  - Mobile-responsive design

- **Security & Performance**
  - Rate limiting on all endpoints
  - Input validation with Zod
  - SQL injection protection
  - CORS and security headers

- **Automatic Cleanup**
  - Automatic deletion of expired transfer files from B2
  - Admin panel for manual cleanup and monitoring
  - Cron job support for scheduled cleanup
  - Serverless function endpoints for external triggers

### 📊 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Client-side file upload with chunking

**Backend:**
- Cloudflare Pages + Functions (Workers)
- Neon Postgres (serverless, edge-compatible)
- Backblaze B2 (S3-compatible storage)
- NextAuth for authentication

**Payments & Email:**
- Authorize.Net for payments
- Mailgun for email notifications

**Validation & Security:**
- Zod for schema validation
- bcrypt for password hashing
- Rate limiting middleware

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 18+ and pnpm
- Neon Postgres account
- Backblaze B2 account
- Authorize.Net account (for payments)
- Mailgun account (optional, for emails)

### 2. Environment Variables

Copy `env.example.txt` to `.env.local` and fill in your credentials:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Backblaze B2
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_BUCKET=your-bucket-name
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_REGION=us-west-004

# Authorize.Net
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID=your_api_login_id
NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY=your_public_client_key

# Mailgun (for emails)
MAILGUN_API_KEY=key-your_api_key
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_FROM_EMAIL=noreply@yourdomain.com

# NextAuth
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### 3. Database Setup

Run the migration to create tables:

```bash
pnpm install
pnpm migrate
```

### 4. Local Development

```bash
pnpm dev
```

Visit `http://localhost:3000`

### 5. Deploy to Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build configuration:
   - **Build command:** `pnpm run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
3. Add all environment variables from `.env.local`
4. Deploy!

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── stripe/       # Payment webhooks
│   │   ├── transfers/    # Transfer management
│   │   └── upload/       # File upload endpoints
│   ├── auth/             # Auth pages (signin/signup)
│   ├── components/       # React components
│   ├── dashboard/        # User dashboard
│   ├── new/              # Upload page
│   ├── pricing/          # Pricing page
│   └── share/[slug]/     # Public share page
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── b2.ts             # B2 storage utilities
│   ├── db.ts             # Database connection
│   ├── email.ts          # Email sending
│   ├── get-user.ts       # Auth helpers
│   ├── rate-limit.ts     # Rate limiting
│   └── stripe.ts         # Stripe configuration
infra/sql/
└── schema.sql            # Database schema
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ Rate limiting on auth endpoints (5 req/15min)
- ✅ Rate limiting on upload endpoints (10 req/min)
- ✅ Rate limiting on API endpoints (100 req/min)
- ✅ Input validation with Zod on all routes
- ✅ SQL injection protection (parameterized queries)
- ✅ JWT-based sessions
- ✅ Stripe webhook signature verification

## 📈 Database Schema

Five main tables:
- `app_user` - User accounts with Stripe integration
- `transfer` - File transfer metadata
- `file_object` - Individual files in transfers
- `recipient` - Email recipients with tracking
- `transfer_event` - Analytics and activity logs

## 🎨 Features by Page

### Home Page (`/`)
- Landing page with feature highlights
- Call-to-action buttons
- Responsive design

### Upload Page (`/new`)
- Drag-and-drop file upload
- Multiple file selection
- Real-time progress bars
- Email notification prompts

### Dashboard (`/dashboard`)
- List of user's transfers
- Transfer status and metadata
- Quick access to share links

### Share Page (`/share/[slug]`)
- Public file download page
- Password protection support
- File metadata display
- Download tracking

### Pricing Page (`/pricing`)
- Three tier plans
- Stripe checkout integration
- Current plan indication

## 🚦 Rate Limits

- **Auth endpoints:** 5 requests per 15 minutes
- **Upload endpoints:** 10 requests per minute
- **API endpoints:** 100 requests per minute
- **Download endpoints:** 50 requests per minute

## 📧 Email Templates

Two email types:
1. **Transfer notification** - Sent to recipients with share link
2. **Download notification** - Sent to owner when file is downloaded

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Uploads
- `POST /api/upload/create` - Initialize multipart upload
- `POST /api/upload/complete` - Complete multipart upload

### Transfers
- `GET /api/transfers` - List user's transfers
- `POST /api/transfers/create` - Create new transfer
- `POST /api/transfers/[id]/notify` - Send email notifications

### Sharing
- `GET /api/share/[slug]` - Get transfer metadata
- `GET /api/share/[slug]/download` - Get download URL

### Payments
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## 🧹 Automatic Cleanup System

The application includes a comprehensive cleanup system to automatically delete expired transfer files from Backblaze B2:

### Manual Cleanup
- **Admin Panel**: Visit `/admin` to view cleanup statistics and manually trigger cleanup
- **Script**: Run `pnpm cleanup` to execute cleanup via command line

### Automated Cleanup Options

#### 1. Cron Job (Linux/Mac)
```bash
# Run cleanup every 6 hours
0 */6 * * * cd /path/to/project && pnpm cleanup

# Or using the direct script
0 */6 * * * cd /path/to/project && node scripts/cleanup-cron.js
```

#### 2. Vercel Cron Jobs
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### 3. GitHub Actions
Create `.github/workflows/cleanup.yml`:
```yaml
name: Cleanup Expired Transfers
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          curl -X POST https://your-app.vercel.app/api/cron/cleanup
```

#### 4. External Cron Service
Use services like [cron-job.org](https://cron-job.org) to call:
```
POST https://your-app.vercel.app/api/cron/cleanup
```

### Cleanup Features
- **Smart Processing**: Processes up to 100 expired transfers per run
- **B2 Versioning**: Properly handles B2 file versioning to completely remove files
- **Error Handling**: Continues processing even if individual files fail
- **Statistics**: Detailed logging and statistics for monitoring
- **Database Updates**: Marks transfers as EXPIRED in the database

## 📝 TODO for Production

- [ ] Add unit and integration tests
- [ ] Implement virus scanning for uploads
- [ ] Add file encryption at rest
- [ ] Set up monitoring and logging (Sentry, LogDrain)
- [ ] Configure CDN caching rules
- [ ] Add download password verification
- [ ] Implement team seats for Business plan
- [ ] Add file preview capabilities
- [ ] Set up automated backups
- [ ] Add GDPR compliance features

## 📄 License

MIT License - feel free to use this for your own projects!
