import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';

export const runtime = 'edge';


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ recipientId: string }> }
) {
  try {
    const { recipientId } = await params;

    // Update downloaded_at timestamp (using this for click tracking)
    await sql`
      UPDATE recipient
      SET downloaded_at = NOW()
      WHERE id = ${recipientId} AND downloaded_at IS NULL
    `;

    console.log(`[Email Tracking] Link clicked by recipient ${recipientId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Email Tracking] Click tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
