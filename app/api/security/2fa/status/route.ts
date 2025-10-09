import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    const [userData] = await sql`
      SELECT two_factor_enabled
      FROM app_user
      WHERE id = ${userId}
      LIMIT 1
    ` as any[];

    return NextResponse.json({
      success: true,
      enabled: userData?.two_factor_enabled || false
    });
  } catch (error: any) {
    console.error('[2FA] Status check error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to check 2FA status' },
      { status: 500 }
    );
  }
}
