import { sql } from '@lib/db';
import { requireUser } from '@lib/get-user';
import { NextRequest } from 'next/server';

// Use mock B2 if MOCK_B2=true in env
const useMock = process.env.MOCK_B2 === 'true';
const { deleteFiles } = useMock
  ? require('@lib/b2-mock')
  : require('@lib/b2');

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    // Handle both async and sync params for Next.js 14 compatibility
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Verify the transfer belongs to the user
    const [transfer] = await sql`
      select id, owner_id 
      from transfer 
      where id = ${id}
      limit 1
    ` as any[];

    if (!transfer) {
      return new Response(
        JSON.stringify({ error: 'Transfer not found' }),
        { status: 404, headers: { 'content-type': 'application/json' } }
      );
    }

    if (transfer.owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    // Get all file B2 keys for this transfer
    const files = await sql`
      select b2_key 
      from file_object 

export const runtime = 'nodejs';

      where transfer_id = ${id}
    ` as any[];

    console.log(`Transfer ${id}: Found ${files.length} files to delete`);
    
    // Delete files from B2
    if (files.length > 0) {
      const b2Keys = files.map((f: any) => f.b2_key);
      console.log('B2 keys to delete:', b2Keys);
      
      try {
        await deleteFiles(b2Keys);
        console.log(`✅ Deleted ${b2Keys.length} files from B2`);
      } catch (error) {
        console.error('❌ Failed to delete files from B2:', error);
        // Continue with database deletion even if B2 deletion fails
      }
    } else {
      console.log('No files to delete from B2');
    }

    // Delete the transfer (cascade will handle file_object and transfer_event)
    await sql`
      delete from transfer 
      where id = ${id}
    `;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'content-type': 'application/json' } }
    );

  } catch (error) {
    console.error('Transfer delete error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to delete transfer' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

