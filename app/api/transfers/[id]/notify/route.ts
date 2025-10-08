import { sql } from '@lib/db';
import { requireUser } from '@lib/get-user';
import { sendTransferEmail } from '@lib/email';
import { z } from 'zod';

const notifySchema = z.object({
  recipients: z.array(z.string().email()),
  message: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const { id: transferId } = await params;

    const body = await req.json();
    const { recipients, message } = notifySchema.parse(body);

    // Verify transfer ownership and get transfer details
    const [transfer] = await sql`
      SELECT 
        t.slug, 
        t.owner_id, 
        t.expires_at,
        t.total_size_bytes,
        COUNT(f.id)::int as file_count
      FROM transfer t
      LEFT JOIN file_object f ON f.transfer_id = t.id
      WHERE t.id = ${transferId}
      GROUP BY t.id, t.slug, t.owner_id, t.expires_at, t.total_size_bytes
      LIMIT 1
    ` as any[];

    if (!transfer) {
      return new Response(JSON.stringify({ error: 'Transfer not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (transfer.owner_id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'content-type': 'application/json' }
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
    const transferUrl = `${baseUrl}/share/${transfer.slug}`;

    // Send emails to recipients
    const results = await Promise.allSettled(
      recipients.map(async (email) => {
        // Insert recipient record
        const [recipient] = await sql`
          INSERT INTO recipient (transfer_id, email, sent_at)
          VALUES (${transferId}, ${email}, NOW())
          RETURNING id
        ` as any[];

        // Send email with full details and tracking
        return sendTransferEmail({
          to: email,
          transferUrl,
          senderName: (user as any).name || (user as any).email,
          expiresAt: new Date(transfer.expires_at),
          fileCount: transfer.file_count,
          totalSize: transfer.total_size_bytes,
          message,
          recipientId: recipient.id
        });
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        total: recipients.length,
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notify error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid data', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Failed to send notifications' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

