# Build Fixes - October 2025

## Issues Fixed

### 1. TypeScript Path Alias Issue
**Error:**
```
Module not found: Can't resolve '@/lib/superadmin-auth'
Module not found: Can't resolve '@/lib/db'
```

**Cause:** The `tsconfig.json` had path aliases for `@lib/*` and `@components/*`, but the superadmin routes were using `@/lib/*`.

**Fix:** Added `@/*` path alias to `tsconfig.json`:
```json
"paths": {
  "@/*": ["./"]  // Added this
  "@lib/*": ["lib/*"],
  "@components/*": ["app/components/*"]
}
```

---

### 2. Neon SQL Dynamic Queries
**Error:**
```
Property 'unsafe' does not exist on type 'NeonQueryFunction<false, false>'
```

**Cause:** The Neon SQL client doesn't support `.unsafe()` for dynamic parameterized queries. It requires template literals.

**Affected Files:**
- `app/api/superadmin/users/[id]/route.ts` (PATCH method)
- `app/api/superadmin/users/route.ts` (GET method)

**Fix:** Rewrote dynamic SQL queries using Neon's template literal syntax:

**Before:**
```typescript
const updateQuery = `UPDATE app_user SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
const [updatedUser] = await sql.unsafe(updateQuery, values) as any[];
```

**After:**
```typescript
const [updatedUser] = await sql`
  UPDATE app_user 
  SET 
    plan = COALESCE(${updates.plan || null}, plan),
    role = COALESCE(${updates.role || null}, role),
    name = COALESCE(${updates.name || null}, name),
    email = COALESCE(${updates.email || null}, email)
  WHERE id = ${params.id}
  RETURNING id, email, name, plan, role
` as any[];
```

For the users list with search/filter, created conditional branches for different query combinations.

---

### 3. Icon Generation Build Errors
**Error:**
```
TypeError: Invalid URL
at new URL (node:internal/url:825:25)
at fileURLToPath (node:internal/url:1605:12)
```

**Cause:** Next.js was trying to statically generate icon routes during build on Windows, causing path resolution errors.

**Affected Files:**
- `app/icon.tsx`
- `app/apple-icon.tsx`

**Fix:** Added runtime configuration to skip static generation:
```typescript
// Skip static generation - generate at runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

---

## Build Status

✅ **Build now completes successfully!**

### Build Output Summary:
- **Total Routes:** 60 static pages + 49 dynamic API routes
- **Icon Routes:** Now generating dynamically at runtime
- **Bundle Size:** 87.3 kB shared JS
- **Middleware:** 26.7 kB

### Expected Warnings (Not Errors):
During build, you'll see warnings like:
```
[API Keys] Error fetching keys: Route /api/api-keys couldn't be rendered 
statically because it used `headers`.
```

These are **expected and normal** because:
1. These routes require authentication (use `headers()`)
2. They're marked as dynamic with `ƒ` in build output
3. They're server-rendered on demand, not statically generated
4. This is the correct behavior for authenticated API routes

---

## How to Deploy

### Local Build:
```bash
pnpm build
pnpm start
```

### Ubuntu Server:
```bash
cd /var/www/senditfast
git pull origin main
bash scripts/force-clean-build.sh
```

The force clean build script will:
1. Stop PM2
2. Pull latest code
3. Delete all build artifacts and caches
4. Fresh install dependencies
5. Clean build
6. Verify no edge-runtime in NextAuth
7. Start fresh PM2 instance

---

## Files Modified

1. `tsconfig.json` - Added `@/*` path alias
2. `app/api/superadmin/users/[id]/route.ts` - Fixed dynamic UPDATE query
3. `app/api/superadmin/users/route.ts` - Fixed dynamic SELECT with search/filter
4. `app/icon.tsx` - Added dynamic runtime
5. `app/apple-icon.tsx` - Added dynamic runtime

---

## Next Steps

1. **Deploy to Ubuntu Server:**
   ```bash
   cd /var/www/senditfast
   bash scripts/force-clean-build.sh
   ```

2. **Test Google OAuth:**
   - Visit: `https://senditfast.net/auth/signin`
   - Click "Sign in with Google"
   - Should work now ✅

3. **Monitor Logs:**
   ```bash
   pm2 logs senditfast
   ```

---

## Related Issues

This fixes the build errors that were preventing deployment. The Google OAuth `(0, s.i) is not a function` error should also be resolved after the clean rebuild on the server, as:

1. All Cloudflare Edge Runtime references have been removed
2. NextAuth is using standard Node.js runtime
3. Build is now clean and consistent
4. Icon routes won't cause build failures on the server

---

Last Updated: October 13, 2025

