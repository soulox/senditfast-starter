import { sql } from '@lib/db';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Handle both async and sync params for Next.js 14 compatibility
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    const [t] = await sql`
      select 
        t.id, 
        t.slug, 
        t.expires_at, 
        t.owner_id,
        password_hash is not null as requires_password
      from transfer t
      where t.slug = ${slug} 
        and t.status = 'ACTIVE' 
        and t.expires_at > now()
      limit 1
    ` as any[];

    if (!t) {
      return new Response(JSON.stringify({ error: 'Transfer not found or expired' }), { 
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    const files = await sql`
      select id, name, size_bytes, content_type
      from file_object 

      where transfer_id = ${t.id}
    ` as any;

    // Get branding if Business plan user
    const [branding] = await sql`
      SELECT 
        cb.logo_url,
        cb.primary_color,
        cb.secondary_color,
        cb.company_name
      FROM custom_branding cb
      JOIN app_user u ON u.id = cb.user_id
      WHERE cb.user_id = ${t.owner_id} AND u.plan = 'BUSINESS'
      LIMIT 1
    ` as any[];

    return new Response(
      JSON.stringify({ 
        ...t, 
        files,
        branding: branding || null
      }), 
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Share fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch transfer' }), 
      { 
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    );
  }
}
