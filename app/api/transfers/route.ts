import { sql } from '@lib/db';
import { requireUser } from '@lib/get-user';

export async function GET() {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    const rows = await sql`
      select id, slug, total_size_bytes, status, created_at, expires_at
      from transfer
      where owner_id = ${userId}
      order by created_at desc
      limit 50
    ` as any;

    return new Response(JSON.stringify({ items: rows }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Transfers list error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch transfers' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
