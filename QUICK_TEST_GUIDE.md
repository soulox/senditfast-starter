# Quick Test Guide - Try It Now!

## 🎯 Test the New UX Improvements

### Test 1: Upload Without Sign In (See Warning)
1. Go to: **http://localhost:3003/new**
2. You'll see:
   ```
   ⚠️ Sign In Required
   You must be signed in to upload and share files.
   [Sign In Now →]
   ```
3. Try to upload a file - buttons will be **disabled** (grayed out)
4. Hover over button - tooltip says "Sign in to upload"

---

### Test 2: Sign In Flow
1. Click **"Sign In Now →"** button
2. On sign-in page, you'll see:
   ```
   ⚠️ Please sign in to continue
   ```
3. **Create account** (if you haven't):
   - Click "Sign up" at bottom
   - Email: `test@example.com`
   - Password: `password123`
4. After sign-in, **auto-redirects** back to `/new`

---

### Test 3: Upload With Auth (Success!)
1. After sign-in, you'll see:
   ```
   ✓ Signed in as test@example.com
   ```
2. **Upload a file:**
   - Drag & drop or click to browse
   - Click "Upload All" (now **blue** and enabled!)
   - Watch progress bar
3. **Create transfer:**
   - Click "Create Transfer" (now **green** and enabled!)
   - Choose whether to email recipients
   - Get redirected to share page

---

### Test 4: Session Expired (Auto-Redirect)
1. After uploading, **clear your cookies** (or wait for session expiry)
2. Click "Create Transfer"
3. You'll see:
   ```
   ❌ Session expired. Redirecting to sign in...
   ```
4. **Auto-redirects** after 2 seconds to sign-in page

---

## 📊 Visual States You'll See

### State 1: Not Authenticated
```
┌────────────────────────────────┐
│ Send Files                     │
├────────────────────────────────┤
│ ⚠️  Sign In Required           │
│ You must be signed in...       │
│ [Sign In Now →]                │
├────────────────────────────────┤
│ [Drop Files Here]              │
│ [Upload All - GRAY/DISABLED]   │
└────────────────────────────────┘
```

### State 2: Authenticated
```
┌────────────────────────────────┐
│ Send Files                     │
├────────────────────────────────┤
│ ✓ Signed in as test@...        │
├────────────────────────────────┤
│ [Drop Files Here]              │
│ [Upload All - BLUE/ENABLED]    │
└────────────────────────────────┘
```

### State 3: Error
```
┌────────────────────────────────┐
│ Send Files                     │
├────────────────────────────────┤
│ ❌ Session expired. Redirecting│
├────────────────────────────────┤
│ (Redirecting in 2 seconds...)  │
└────────────────────────────────┘
```

---

## ✅ What's Different Now

| Before | After |
|--------|-------|
| No auth indication | Clear auth status banner |
| Silent 401 errors | Visible error messages |
| Buttons always enabled | Disabled when not signed in |
| No guidance | Clear "Sign In Now" button |
| Console errors only | User-friendly messages |
| Manual navigation | Auto-redirect on error |

---

## 🎨 Color Guide

- 🟡 **Yellow**: Warning (sign in required)
- 🟢 **Green**: Success (signed in)
- 🔵 **Blue**: Info (checking auth)
- 🔴 **Red**: Error (something failed)
- ⚫ **Gray**: Disabled (can't use yet)

---

## 🐛 Things to Notice

1. **No more silent failures** - Every error shows a message
2. **Can't upload when logged out** - Buttons are disabled
3. **Auto-redirect** - Saves you from clicking around
4. **Preserved callback** - Returns to upload page after sign-in
5. **Tooltips** - Hover over disabled buttons for hints

---

**Ready to test? Restart your dev server and go to http://localhost:3003/new!** 🚀

