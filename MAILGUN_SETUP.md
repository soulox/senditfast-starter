# Mailgun Email Setup Guide

SendItFast uses Mailgun for sending email notifications. Follow this guide to set up Mailgun for your application.

---

## 📧 **What You'll Need**

1. **Mailgun API Key**
2. **Mailgun Domain**
3. **From Email Address**

---

## 🚀 **Step-by-Step Setup**

### **1. Create a Mailgun Account**

1. Go to [https://www.mailgun.com](https://www.mailgun.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### **2. Get Your API Key**

1. Log in to your Mailgun dashboard
2. Go to **Settings** → **API Keys**
3. Copy your **Private API Key** (starts with `key-...`)
4. Keep this key secure!

### **3. Set Up Your Domain**

#### **Option A: Use Mailgun Sandbox (Testing)**
- Mailgun provides a sandbox domain for testing
- Go to **Sending** → **Domains**
- Copy your sandbox domain (e.g., `sandboxXXXXX.mailgun.org`)
- **Note:** Sandbox domains can only send to authorized recipients

#### **Option B: Use Your Own Domain (Production)**
1. Go to **Sending** → **Domains** → **Add New Domain**
2. Enter your domain (e.g., `mg.yourdomain.com`)
3. Follow the DNS configuration instructions:
   - Add TXT records for domain verification
   - Add MX records for receiving
   - Add CNAME records for tracking
4. Wait for DNS propagation (can take up to 48 hours)
5. Verify domain status shows "Active"

### **4. Configure Authorized Recipients (Sandbox Only)**

If using sandbox domain:
1. Go to **Sending** → **Domains** → Select your sandbox domain
2. Click **Authorized Recipients**
3. Add email addresses you want to send to
4. Verify each email address

### **5. Add Environment Variables**

Add these to your `.env.local` file:

```env
# Mailgun Configuration
MAILGUN_API_KEY=key-your_private_api_key_here
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
```

**Example (Sandbox):**
```env
MAILGUN_API_KEY=key-1234567890abcdef1234567890abcdef
MAILGUN_DOMAIN=sandbox1234567890abcdef.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandbox1234567890abcdef.mailgun.org
```

**Example (Production):**
```env
MAILGUN_API_KEY=key-1234567890abcdef1234567890abcdef
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
```

---

## 📝 **Environment Variables Explained**

| Variable | Description | Example |
|----------|-------------|---------|
| `MAILGUN_API_KEY` | Your Mailgun private API key | `key-abc123...` |
| `MAILGUN_DOMAIN` | Your Mailgun sending domain | `mg.example.com` |
| `MAILGUN_FROM_EMAIL` | The "From" email address | `noreply@example.com` |

---

## ✅ **Testing Your Setup**

### **1. Restart Your Development Server**

```bash
# Kill existing processes
taskkill /F /IM node.exe

# Start HTTPS server
pnpm dev:https
```

### **2. Send a Test Transfer**

1. Go to `https://localhost:3000`
2. Sign in
3. Upload files
4. Enter a recipient email (must be authorized if using sandbox)
5. Click "Send"
6. Check the recipient's inbox

### **3. Check Mailgun Logs**

1. Go to Mailgun dashboard
2. Click **Sending** → **Logs**
3. View delivery status and any errors

---

## 🎯 **Email Features in SendItFast**

### **Transfer Notifications**
- Sent when someone shares files with you
- Includes:
  - Sender name
  - File count and size
  - Download link
  - Expiration date
  - Optional message

### **Team Invitations** (Business Plan)
- Sent when invited to join a team
- Includes:
  - Inviter name
  - Team name
  - Accept invitation link

---

## 🔧 **Troubleshooting**

### **Emails Not Sending**

**Check 1: Environment Variables**
```bash
# Verify variables are set
echo %MAILGUN_API_KEY%
echo %MAILGUN_DOMAIN%
```

**Check 2: API Key Validity**
- Make sure you're using the **Private API Key**, not Public
- Key should start with `key-`

**Check 3: Domain Status**
- Go to Mailgun dashboard → Domains
- Ensure domain status is "Active" (green)

**Check 4: Authorized Recipients (Sandbox)**
- If using sandbox, recipient must be authorized
- Check **Authorized Recipients** section

**Check 5: Server Logs**
```
Look for lines starting with [Email] in your terminal
```

### **DNS Configuration Issues**

If your custom domain isn't verifying:
1. Double-check all DNS records match Mailgun's instructions
2. Wait 24-48 hours for DNS propagation
3. Use [DNS Checker](https://dnschecker.org) to verify records
4. Contact Mailgun support if issues persist

### **Emails Going to Spam**

To improve deliverability:
1. Set up SPF, DKIM, and DMARC records (Mailgun provides these)
2. Use a custom domain instead of sandbox
3. Warm up your domain by sending gradually increasing volumes
4. Maintain good sender reputation

---

## 💰 **Mailgun Pricing**

### **Free Tier**
- 5,000 emails/month for 3 months
- Then pay-as-you-go

### **Pay-As-You-Go**
- $0.80 per 1,000 emails
- No monthly fee

### **Foundation Plan**
- $35/month
- 50,000 emails included
- Additional emails at reduced rate

**Recommendation:** Start with free tier for testing, upgrade as needed.

---

## 📚 **Additional Resources**

- [Mailgun Documentation](https://documentation.mailgun.com)
- [Mailgun API Reference](https://documentation.mailgun.com/en/latest/api_reference.html)
- [Domain Verification Guide](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)
- [Email Best Practices](https://www.mailgun.com/blog/email-best-practices/)

---

## 🎉 **You're All Set!**

Once configured, SendItFast will automatically send beautiful email notifications for:
- File transfer notifications
- Team invitations (Business plan)

Recipients will receive professionally designed HTML emails with:
- Clear call-to-action buttons
- File details and expiration info
- Mobile-responsive design
- Plain text fallback
