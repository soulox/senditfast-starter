import { sql } from './db';
import { NextRequest } from 'next/server';

export async function logAudit({
  userId,
  action,
  resourceType,
  resourceId,
  req,
  metadata
}: {
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  req?: NextRequest;
  metadata?: any;
}) {
  try {
    const ipAddress = req?.headers.get('x-forwarded-for') || 
                     req?.headers.get('x-real-ip') || 
                     null;
    const userAgent = req?.headers.get('user-agent') || null;

    await sql`
      INSERT INTO audit_log (
        user_id, action, resource_type, resource_id,
        ip_address, user_agent, metadata
      )
      VALUES (
        ${userId}, ${action}, ${resourceType || null}, ${resourceId || null},
        ${ipAddress}, ${userAgent}, ${metadata ? JSON.stringify(metadata) : null}
      )
    `;

    console.log(`[Audit] ${action} by user ${userId}`);
  } catch (error) {
    console.error('[Audit] Failed to log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

export const AuditActions = {
  // Auth
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REGISTER: 'auth.register',
  
  // Transfers
  TRANSFER_CREATE: 'transfer.create',
  TRANSFER_DELETE: 'transfer.delete',
  TRANSFER_DOWNLOAD: 'transfer.download',
  
  // Team
  TEAM_INVITE: 'team.invite',
  TEAM_REMOVE: 'team.remove',
  
  // API Keys
  API_KEY_CREATE: 'api_key.create',
  API_KEY_REVOKE: 'api_key.revoke',
  
  // Branding
  BRANDING_UPDATE: 'branding.update',
  
  // Plan
  PLAN_UPGRADE: 'plan.upgrade',
  PLAN_DOWNGRADE: 'plan.downgrade'
};
