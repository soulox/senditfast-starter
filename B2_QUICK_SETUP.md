# Backblaze B2 Quick Setup Guide

## Why B2?
- **Very cheap**: $0.005/GB/month (10x cheaper than AWS S3)
- **Free tier**: 10 GB storage, 1 GB daily downloads
- **S3-compatible**: Works with standard S3 SDKs
- **No egress fees** when downloading via Cloudflare

## Step 1: Create Account (5 minutes)

1. Go to [backblaze.com/b2](https://www.backblaze.com/b2/cloud-storage.html)
2. Click "Sign Up" (free account, no credit card for free tier)
3. Verify your email

## Step 2: Create Bucket (2 minutes)

1. In B2 dashboard, click "Buckets" → "Create a Bucket"
2. Settings:
   - **Bucket Name**: `senditfast-uploads` (must be globally unique)
   - **Files in Bucket**: `Private` (important for security!)
   - **Default Encryption**: Disabled (we'll enable later if needed)
   - **Object Lock**: Disabled
3. Click "Create Bucket"

## Step 3: Create Application Key (2 minutes)

1. Click "App Keys" in sidebar
2. Click "Add a New Application Key"
3. Settings:
   - **Name**: `senditfast-app`
   - **Allow access to Bucket(s)**: Select your bucket
   - **Type of Access**: Read and Write
   - **Allow List All Bucket Names**: Yes
   - **File name prefix**: Leave empty
   - **Duration**: Leave empty (doesn't expire)
4. Click "Create New Key"

⚠️ **IMPORTANT**: Copy these immediately (you won't see them again!):
   - **keyID**: Starts with something like `005a1b2c3d4e5f6...`
   - **applicationKey**: Long string like `K005abcdef123456...`

## Step 4: Get Bucket Info

1. Go back to "Buckets"
2. Click on your bucket name
3. Note the **Endpoint** (looks like: `s3.us-west-004.backblazeb2.com`)
4. Note the **Region** (e.g., `us-west-004`)

## Step 5: Update .env.local

Open your `.env.local` file and update:

```bash
# Backblaze B2 (S3-compatible)
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com  # Your endpoint
B2_BUCKET=senditfast-uploads                         # Your bucket name
B2_KEY_ID=005a1b2c3d4e5f6...                        # Your keyID
B2_APPLICATION_KEY=K005abcdef123456...               # Your applicationKey
B2_REGION=us-west-004                                # Your region
```

## Step 6: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
pnpm dev
```

## Step 7: Test Upload

1. Go to http://localhost:3003/new
2. Drag & drop a small file (< 10MB for testing)
3. Click "Upload All"
4. You should see progress!

## Verify It Works

1. In B2 dashboard → Buckets → Your bucket
2. Click "Browse Files"
3. You should see `uploads/` folder with your test file!

## Cost Calculator

**Example scenario:**
- Store: 100 GB = $0.50/month
- Downloads: 500 GB/month = $1.00/month
- API calls: ~100,000 = $0.40/month
- **Total**: ~$2/month for moderate usage

**Free tier includes:**
- 10 GB storage (free forever)
- 1 GB downloads per day (30 GB/month free)
- Perfect for testing and MVP!

## Troubleshooting

### "Access Denied" error
- Check your Application Key has Read/Write access
- Verify the bucket name is correct
- Make sure Files in Bucket is set to "Private"

### "Region not found"
- Verify your endpoint and region match
- Format: `https://s3.{region}.backblazeb2.com`

### Upload fails immediately
- Check your keyID and applicationKey are correct
- Restart dev server after changing .env.local
- Check browser console for specific error

## Security Best Practices

1. ✅ Set bucket to "Private" (never "Public")
2. ✅ Use presigned URLs (already implemented)
3. ✅ Rotate keys every 90 days
4. ✅ Use separate keys for dev/production
5. ✅ Never commit `.env.local` to git

## Next Steps

Once uploads work:
- Test download flow
- Configure Stripe for payments
- Set up email notifications
- Deploy to production!

---

**Need help?** B2 support is very responsive: support@backblaze.com

