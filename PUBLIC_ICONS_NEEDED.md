# Static Icons Needed

The dynamic icon generation (`icon.tsx` and `apple-icon.tsx`) was removed because it causes errors on Windows due to path issues with the `@vercel/og` library.

## Required Icon Files

You need to add these files to the `public/` directory:

### 1. `public/favicon.ico`
- Size: 16x16 or 32x32
- Format: ICO
- Purpose: Browser tab icon

### 2. `public/icon-32x32.png`
- Size: 32x32
- Format: PNG
- Purpose: Standard favicon

### 3. `public/icon-192x192.png`
- Size: 192x192
- Format: PNG
- Purpose: Android/Chrome

### 4. `public/apple-icon.png`
- Size: 180x180
- Format: PNG
- Purpose: iOS/Apple devices

## How to Create Icons

### Option 1: Use an Online Generator
1. Go to https://favicon.io/favicon-generator/
2. Create an icon with:
   - Text: **S** (for SendItFast)
   - Background: `#667eea` (purple gradient start)
   - Font: Bold
3. Download the generated icon pack
4. Copy the files to `public/`

### Option 2: Use Figma/Photoshop
1. Create a 512x512 canvas
2. Add gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
3. Add white bold "S" in center
4. Export as PNG at different sizes
5. Use online converter for .ico file

### Option 3: Temporary Placeholder
For now, the app will work without icons (browsers will use default). You can add them later.

## Current Status

✅ Dynamic icon generation removed (fixes Windows errors)
✅ Metadata configured in `app/layout.tsx`
⚠️ Actual icon files need to be created and added to `public/`

## What Happens Without Icons?

- App will work fine
- Browsers will show default generic icon
- No errors or warnings
- Can be added anytime later

---

**Note:** This fix is to resolve the Windows development errors. On your Ubuntu production server, you can either:
1. Add static icon files to `public/` (recommended)
2. Or keep the dynamic icon generation (works on Linux)

For consistency, I recommend using static icons across all environments.

