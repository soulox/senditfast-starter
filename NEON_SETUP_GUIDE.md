# Neon Database Setup Guide

## Step 1: Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (free, no credit card required)
3. Sign up with GitHub, Google, or email

## Step 2: Create Your Database

1. Click "Create a project"
2. Give it a name: `senditfast`
3. Select a region (choose closest to your users):
   - US East (Ohio) - `us-east-2`
   - US West (Oregon) - `us-west-2`
   - Europe (Frankfurt) - `eu-central-1`
4. Click "Create Project"

## Step 3: Get Connection String

1. After project creation, you'll see the connection details
2. Copy the **Connection string** (it looks like this):
   ```
   postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
   ```
3. Save this - you'll need it next!

## Step 4: Configure Your App

1. Open your `.env.local` file (or create it from `env.example.txt`)
2. Add your connection string:
   ```bash
   DATABASE_URL=postgresql://[your-connection-string-here]
   ```

## Step 5: Run Database Migration

Open your terminal and run:

```bash
# Install dependencies (if you haven't already)
pnpm install

# Run the migration to create tables
pnpm migrate
```

You should see: `Schema applied.`

## Step 6: Verify Setup

1. Go back to Neon dashboard
2. Click "SQL Editor" in the left sidebar
3. Run this query to verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
4. You should see 5 tables:
   - `app_user`
   - `transfer`
   - `file_object`
   - `recipient`
   - `transfer_event`

## Step 7: Test Your App

```bash
pnpm dev
```

Visit `http://localhost:3000` and try:
1. Sign up for an account
2. This will test database connectivity!

## Neon Dashboard Features

### Monitoring
- **SQL Editor**: Run queries directly
- **Metrics**: See database usage
- **Branches**: Create dev/staging databases (like git branches!)

### Connection Pooling
Neon automatically handles connection pooling - no configuration needed!

### Backups
- Automatic daily backups
- Point-in-time recovery available
- Retention: 7 days (free tier)

## Free Tier Limits

- ✅ **Storage**: 0.5 GB (plenty for MVP)
- ✅ **Compute**: 100 hours/month
- ✅ **Projects**: 1
- ✅ **Branches**: 10

If you exceed limits, Neon will notify you before charging.

## Production Tips

### Security
1. Never commit `.env.local` to git (already in `.gitignore`)
2. Use different databases for dev/staging/production
3. Rotate credentials periodically

### Performance
1. Add indexes if queries slow down (schema already has key indexes)
2. Use Neon branches for testing migrations
3. Monitor query performance in Neon dashboard

### Scaling
When you outgrow free tier:
- **Pro Plan**: $19/month
  - 10 GB storage
  - Unlimited compute hours
  - Read replicas
  - Priority support

## Troubleshooting

### "Connection refused"
- Check your connection string is correct
- Verify your IP isn't blocked (Neon allows all IPs by default)
- Check if Neon project is sleeping (free tier pauses after inactivity)

### "SSL required"
The connection string from Neon includes `?sslmode=require` - this is normal and required.

### "Too many connections"
Unlikely with Neon's connection pooling, but if it happens:
- Use connection pooling
- Check for connection leaks in your code

## Need Help?

- Neon Docs: https://neon.tech/docs
- Neon Discord: https://discord.gg/neon
- Neon Support: support@neon.tech

## Next Steps

Once your database is set up:
1. ✅ Configure Backblaze B2 for file storage
2. ✅ Set up Stripe for payments
3. ✅ Configure Resend for emails
4. ✅ Deploy to Cloudflare Pages

---

**You're all set!** Your database is ready for development. 🚀

