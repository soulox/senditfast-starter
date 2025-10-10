import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { sql } from './db';
import { NextResponse } from 'next/server';

export interface SuperAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

/**
 * Verify if the current user is a super admin
 */
export async function verifySuperAdmin(): Promise<SuperAdminUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  try {
    const [user] = await sql`
      SELECT id, email, name, role
      FROM app_user
      WHERE id = ${(session.user as any).id}
      AND role IN ('SUPER_ADMIN', 'ADMIN')
      LIMIT 1
    ` as any[];

    if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error('[SuperAdmin] Verification error:', error);
    return null;
  }
}

/**
 * Middleware to protect super admin routes
 */
export async function requireSuperAdmin() {
  const admin = await verifySuperAdmin();
  
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized. Super admin access required.' },
      { status: 403 }
    );
  }

  return admin;
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetUserId?: string,
  details?: any,
  request?: Request
) {
  try {
    const ip = request?.headers.get('x-forwarded-for') || 
               request?.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await sql`
      INSERT INTO admin_audit_log (admin_id, action, target_user_id, details, ip_address, user_agent)
      VALUES (
        ${adminId},
        ${action},
        ${targetUserId || null},
        ${details ? JSON.stringify(details) : null}::jsonb,
        ${ip}::inet,
        ${userAgent}
      )
    `;
  } catch (error) {
    console.error('[SuperAdmin] Failed to log action:', error);
    // Don't throw - audit logging failure shouldn't break the operation
  }
}

/**
 * Check if user has permission for specific action
 */
export function hasPermission(
  admin: SuperAdminUser,
  action: 'VIEW_USERS' | 'EDIT_USERS' | 'DELETE_USERS' | 'CHANGE_PLANS' | 'VIEW_ANALYTICS'
): boolean {
  // SUPER_ADMIN has all permissions
  if (admin.role === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN has limited permissions
  if (admin.role === 'ADMIN') {
    const allowedActions: string[] = ['VIEW_USERS', 'VIEW_ANALYTICS'];
    return allowedActions.includes(action);
  }

  return false;
}

