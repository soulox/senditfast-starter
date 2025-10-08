import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    // Gather all user data
    const [userData] = await sql`
      SELECT id, email, name, plan, created_at
      FROM app_user
      WHERE id = ${userId}
      LIMIT 1
    ` as any[];

    const transfers = await sql`
      SELECT id, slug, expires_at, max_downloads, total_size_bytes, status, created_at
      FROM transfer
      WHERE owner_id = ${userId}
      ORDER BY created_at DESC
    `;

    const files = await sql`
      SELECT f.id, f.name, f.size_bytes, f.content_type, f.created_at, t.slug as transfer_slug
      FROM file_object f
      JOIN transfer t ON t.id = f.transfer_id
      WHERE t.owner_id = ${userId}
      ORDER BY f.created_at DESC
    `;

    const recipients = await sql`
      SELECT r.email, r.sent_at, r.opened_at, r.downloaded_at, t.slug as transfer_slug
      FROM recipient r
      JOIN transfer t ON t.id = r.transfer_id
      WHERE t.owner_id = ${userId}
      ORDER BY r.sent_at DESC
    `;

    const events = await sql`
      SELECT e.type, e.ip, e.country, e.created_at, t.slug as transfer_slug
      FROM transfer_event e
      JOIN transfer t ON t.id = e.transfer_id
      WHERE t.owner_id = ${userId}
      ORDER BY e.created_at DESC
      LIMIT 1000
    `;

    // Get team memberships
    const teamMembers = await sql`
      SELECT id, email, name, role, status, invited_at, accepted_at
      FROM team_member
      WHERE owner_id = ${userId}
      ORDER BY invited_at DESC
    `;

    // Get API keys (without hashes)
    const apiKeys = await sql`
      SELECT id, name, key_prefix, created_at, last_used_at, expires_at
      FROM api_key
      WHERE user_id = ${userId} AND revoked_at IS NULL
      ORDER BY created_at DESC
    `;

    // Get branding
    const [branding] = await sql`
      SELECT logo_url, primary_color, secondary_color, custom_domain, company_name
      FROM custom_branding
      WHERE user_id = ${userId}
      LIMIT 1
    ` as any[];

    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: 'GDPR Data Export',
      user: userData,
      transfers: transfers,
      files: files,
      recipients: recipients,
      events: events,
      teamMembers: teamMembers,
      apiKeys: apiKeys,
      branding: branding || null
    };

    console.log(`[Privacy] User ${userId} exported their data`);

    // Return as JSON file download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="senditfast-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (error: any) {
    console.error('[Privacy] Export error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
