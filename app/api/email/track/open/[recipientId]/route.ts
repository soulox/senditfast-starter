import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recipientId: string }> }
) {
  try {
    const { recipientId } = await params;

    // Update opened_at timestamp
    await sql`
      UPDATE recipient
      SET opened_at = NOW()
      WHERE id = ${recipientId} AND opened_at IS NULL
    `;

    console.log(`[Email Tracking] Email opened by recipient ${recipientId}`);

    // Return 1x1 transparent GIF
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('[Email Tracking] Open tracking error:', error);
    // Return pixel even on error to avoid broken images
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif'
      }
    });
  }
}
