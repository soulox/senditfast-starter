import { sql } from '@lib/db';

export const runtime = 'edge';


export async function POST() {
  const [u] = await sql`insert into app_user (email, name) values ('dev@example.com','Dev User') on conflict (email) do update set name=excluded.name returning id, email, name` as any[];
  return new Response(JSON.stringify({ user: u }), { headers: { 'content-type': 'application/json' } });
}
