# Google OAuth Setup Guide

Your `.env.local` has been updated to use HTTPS. Now you need to update the redirect URI in Google Cloud Console.

---

## 🔧 **Update Google Cloud Console**

### **Step 1: Go to Google Cloud Console**
1. Visit [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### **Step 2: Edit OAuth Client**
1. Find your OAuth 2.0 Client ID
2. Click the edit icon (pencil)
3. Scroll to **Authorized redirect URIs**

### **Step 3: Update Redirect URI**

**Remove (if exists):**
```
http://localhost:3000/api/auth/callback/google
```

**Add:**
```
https://localhost:3000/api/auth/callback/google
```

### **Step 4: Save**
1. Click **Save**
2. Wait a few seconds for changes to propagate

---

## ✅ **Verification**

Your `.env.local` now has:
```env
NEXTAUTH_URL=https://localhost:3000
NEXT_PUBLIC_BASE_URL=https://localhost:3000
```

**Restart your server:**
```bash
taskkill /F /IM node.exe
pnpm dev:https
```

**Test Google Sign-In:**
1. Go to `https://localhost:3000/auth/signin`
2. Click "Sign in with Google"
3. Should work without OAuth policy error!

---

## 📋 **Complete Redirect URIs List**

For local development (HTTPS):
```
https://localhost:3000/api/auth/callback/google
```

For production (when deployed):
```
https://yourdomain.com/api/auth/callback/google
```

**Note:** You can have both local and production URIs configured at the same time.

---

## 🔒 **Security Notes**

- HTTPS is required for OAuth in production
- Self-signed certificates work for local development
- Google requires HTTPS for security
- Never commit your `.env.local` file

---

## ✅ **You're All Set!**

Once you update the redirect URI in Google Cloud Console:
- Google Sign-In will work
- No more OAuth policy errors
- Users can sign in with Google seamlessly

The HTTPS server is running at `https://localhost:3000` with the correct configuration!
