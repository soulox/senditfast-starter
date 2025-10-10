# 🔐 Super Admin Control Panel - Setup Guide

## Overview

The Super Admin Control Panel is a secure, role-based administration interface for managing users, plans, usage analytics, and system monitoring for Send

ItFast.

### Features

✅ **User Management**
- View all users with pagination and filtering
- Search by email or name
- Change user plans (FREE, PRO, BUSINESS)
- View user details and transfer history
- Delete user accounts

✅ **Analytics Dashboard**
- Real-time statistics and metrics
- User growth trends
- Plan distribution
- Storage usage monitoring
- Top users by storage

✅ **Role-Based Access Control**
- SUPER_ADMIN: Full access to all features
- ADMIN: Read-only access to users and analytics
- USER: Regular user access

✅ **Audit Logging**
- Track all admin actions
- Record IP addresses and user agents
- Monitor system changes
- Compliance-ready logs

✅ **Security Features**
- Separate authentication layer
- Permission-based access
- Action logging
- Prevent self-deletion

---

## 🚀 Installation Steps

### 1. Run Database Migration

Apply the super admin schema to your database:

```bash
# Using psql
psql $DATABASE_URL -f infra/sql/add-super-admin.sql

# Or using the migrate script
node scripts/migrate.js
```

This will:
- Add `role` column to `app_user` table
- Create `admin_audit_log` table
- Create `user_usage_stats` table  
- Set up views and triggers for analytics
- Add indexes for performance

### 2. Promote Your First Super Admin

Connect to your database and promote your user account:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE app_user 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-email@example.com';
```

Verify the change:

```sql
SELECT id, email, name, role FROM app_user WHERE role = 'SUPER_ADMIN';
```

### 3. Access the Super Admin Panel

Navigate to:
```
https://senditfast.net/superadmin
```

or locally:
```
http://localhost:3000/superadmin
```

---

## 🌐 Subdomain Configuration (Recommended)

For enhanced security, host the admin panel on a separate subdomain.

### Option 1: Using Next.js Middleware (Recommended)

Create `middleware.ts` in the project root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if request is from admin subdomain
  if (hostname.startsWith('admin.')) {
    // Only allow /superadmin routes
    if (!request.nextUrl.pathname.startsWith('/superadmin') && 
        !request.nextUrl.pathname.startsWith('/api/superadmin')) {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
  }
  
  // Block /superadmin from main domain (optional security measure)
  if (!hostname.startsWith('admin.') && 
      request.nextUrl.pathname.startsWith('/superadmin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/superadmin/:path*', '/api/superadmin/:path*'],
};
```

### Option 2: Nginx Reverse Proxy

If you're using Nginx, route the subdomain:

```nginx
# admin.senditfast.net -> /superadmin
server {
    listen 443 ssl http2;
    server_name admin.senditfast.net;

    ssl_certificate /etc/ssl/certs/senditfast.crt;
    ssl_certificate_key /etc/ssl/private/senditfast.key;

    location / {
        proxy_pass http://localhost:3000/superadmin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/superadmin {
        proxy_pass http://localhost:3000/api/superadmin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Option 3: Cloudflare DNS

Add a CNAME record:
```
Type: CNAME
Name: admin
Content: senditfast.net
Proxy: Enabled (Orange cloud)
```

---

## 👥 User Roles

### SUPER_ADMIN
**Full administrative access**

Permissions:
- ✅ View all users
- ✅ Edit user details (name, email, plan, role)
- ✅ Change user plans
- ✅ Delete users
- ✅ View analytics
- ✅ View audit logs
- ✅ Promote/demote admins

### ADMIN
**Read-only administrative access**

Permissions:
- ✅ View all users
- ✅ View analytics
- ❌ Cannot edit users
- ❌ Cannot delete users
- ❌ Cannot change roles

### USER
**Regular user**

Permissions:
- ✅ Access own dashboard
- ✅ Manage own transfers
- ❌ Cannot access admin panel

---

## 🔒 Security Best Practices

### 1. Use Strong Authentication
```sql
-- Require 2FA for all admin accounts
UPDATE app_user 
SET two_factor_enabled = true 
WHERE role IN ('SUPER_ADMIN', 'ADMIN');
```

### 2. Limit Super Admin Accounts
- Only promote trusted personnel
- Use ADMIN role for support staff
- Regularly audit admin access

### 3. Monitor Audit Logs
```sql
-- View recent admin actions
SELECT 
  a.created_at,
  u.email as admin_email,
  a.action,
  a.details,
  a.ip_address
FROM admin_audit_log a
JOIN app_user u ON a.admin_id = u.id
ORDER BY a.created_at DESC
LIMIT 50;
```

### 4. IP Whitelisting (Optional)

In your hosting provider or firewall, restrict `/superadmin` to specific IPs:

```nginx
# Nginx example
location /superadmin {
    allow 203.0.113.0/24;  # Your office IP range
    allow 198.51.100.0/24; # VPN IP range
    deny all;
    
    proxy_pass http://localhost:3000;
}
```

### 5. Use HTTPS Only
Never access the admin panel over HTTP.

```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name admin.senditfast.net;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Available API Endpoints

### Authentication
All endpoints require authentication and proper role.

### GET /api/superadmin/stats
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_users": 1234,
    "free_users": 1000,
    "pro_users": 200,
    "business_users": 34,
    "new_users_30d": 150,
    "active_users_30d": 800,
    "total_storage_used": 1073741824,
    "signupTrend": [...],
    "planDistribution": [...],
    "transfers": {...}
  }
}
```

### GET /api/superadmin/users
List all users with pagination

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `search` - Search by email/name
- `plan` - Filter by plan (FREE, PRO, BUSINESS)
- `sortBy` - Sort field (created_at, email, etc.)
- `sortOrder` - asc or desc

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25
  }
}
```

### GET /api/superadmin/users/:id
Get user details

**Response:**
```json
{
  "success": true,
  "user": {...},
  "transfers": [...],
  "usage": [...]
}
```

### PATCH /api/superadmin/users/:id
Update user

**Body:**
```json
{
  "plan": "PRO",
  "role": "ADMIN",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### DELETE /api/superadmin/users/:id
Delete user (cannot delete self)

---

## 🔍 Common Tasks

### Promote a User to Admin
```sql
UPDATE app_user 
SET role = 'ADMIN' 
WHERE email = 'support@senditfast.net';
```

### Demote an Admin to User
```sql
UPDATE app_user 
SET role = 'USER' 
WHERE email = 'former-admin@senditfast.net';
```

### View User's Usage Statistics
```sql
SELECT 
  month,
  transfers_count,
  total_size_bytes,
  total_downloads
FROM user_usage_stats
WHERE user_id = 'user-uuid-here'
ORDER BY month DESC;
```

### Find Top Storage Users
```sql
SELECT 
  email,
  plan,
  storage_used_bytes,
  ROUND(storage_used_bytes / 1024.0 / 1024.0 / 1024.0, 2) as storage_gb
FROM app_user
WHERE storage_used_bytes > 0
ORDER BY storage_used_bytes DESC
LIMIT 20;
```

### Audit Recent Admin Actions
```sql
SELECT 
  al.created_at,
  u.email as admin,
  al.action,
  target.email as target_user,
  al.details
FROM admin_audit_log al
JOIN app_user u ON al.admin_id = u.id
LEFT JOIN app_user target ON al.target_user_id = target.id
ORDER BY al.created_at DESC
LIMIT 100;
```

---

## 🐛 Troubleshooting

### "Access Denied" Error
1. Verify your role in database:
```sql
SELECT email, role FROM app_user WHERE email = 'your-email@example.com';
```

2. Make sure role is 'SUPER_ADMIN' or 'ADMIN'

3. Clear browser cache and re-login

### Can't See Users List
- Check database connection
- Verify `admin_user_overview` view exists
- Check browser console for errors

### Statistics Not Loading
- Ensure `admin_dashboard_stats` view is created
- Check if triggers are active:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_usage_stats';
```

### Slow Performance
Add indexes:
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transfer_owner_created 
ON transfer(owner_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_user_plan 
ON app_user(plan);
```

---

## 📈 Monitoring & Maintenance

### Weekly Tasks
- Review audit logs
- Check for unusual activity
- Monitor storage usage trends

### Monthly Tasks
- Review user growth
- Analyze plan distribution
- Check system performance
- Update admin access list

### As Needed
- Promote/demote admins
- Handle user issues
- Generate reports
- System maintenance

---

## 🎓 Training Resources

### For New Admins
1. Start with read-only ADMIN role
2. Familiarize with user interface
3. Practice on test accounts
4. Review audit logs regularly

### For Super Admins
1. Understand all permissions
2. Review security practices
3. Know how to handle emergencies
4. Keep credentials secure

---

## 🆘 Support

### Issues or Questions?
- Check audit logs for clues
- Review database views
- Check server logs
- Contact development team

### Emergency Actions

**Lock All Accounts:**
```sql
-- NOT RECOMMENDED - Use only in emergencies
UPDATE app_user SET role = 'USER' WHERE role IN ('ADMIN', 'SUPER_ADMIN');
```

**Reset Admin Access:**
```sql
-- Promote yourself back to super admin
UPDATE app_user SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
```

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- User management
- Analytics dashboard
- Audit logging
- Role-based access control
- Plan management

### Planned Features
- Advanced analytics
- Bulk operations
- Export functionality
- Email notifications
- Custom reports
- API key management

---

*Last Updated: 2025*
*Super Admin Panel v1.0.0*

