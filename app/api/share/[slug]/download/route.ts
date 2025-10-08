import { sql } from '@lib/db';
import { NextRequest } from 'next/server';

// Use mock B2 if MOCK_B2=true in env
const useMock = process.env.MOCK_B2 === 'true';
const { getDownloadUrl } = useMock
  ? require('@lib/b2-mock')
  : require('@lib/b2');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Handle both async and sync params for Next.js 14 compatibility
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing fileId' }), 
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const [row] = await sql`
      select fo.b2_key, fo.name, fo.size_bytes, fo.content_type 
      from file_object fo
      join transfer t on t.id = fo.transfer_id
      where t.slug = ${slug} 
        and t.status = 'ACTIVE' 
        and t.expires_at > now() 
        and fo.id = ${fileId}
      limit 1
    ` as any[];

    if (!row) {
      return new Response(
        JSON.stringify({ error: 'File not found or transfer expired' }), 
        { status: 404, headers: { 'content-type': 'application/json' } }
      );
    }

    // Generate a presigned download URL (valid for 1 hour)
    const downloadUrl = await getDownloadUrl(row.b2_key, 3600);

    // Record download event
    await sql`
      insert into transfer_event (transfer_id, type, meta)
      values (
        (select transfer_id from file_object where id = ${fileId}),
        'DOWNLOAD',
        ${JSON.stringify({ fileId, fileName: row.name })}
      )
    `;

    return new Response(
      JSON.stringify({
        downloadUrl,
        fileName: row.name,
        fileSize: row.size_bytes,
        contentType: row.content_type,
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Download error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate download URL' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
