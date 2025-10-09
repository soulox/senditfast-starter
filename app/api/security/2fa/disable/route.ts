import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export const runtime = 'edge';


export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    // Disable 2FA and remove secret
    await sql`
      UPDATE app_user
      SET two_factor_enabled = false,
          two_factor_secret = NULL
      WHERE id = ${userId}
    `;

    console.log(`[2FA] Disabled for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error: any) {
    console.error('[2FA] Disable error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
