import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import speakeasy from 'speakeasy';
import { z } from 'zod';


const verifySchema = z.object({
  token: z.string().length(6)
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    const body = await req.json();
    const { token } = verifySchema.parse(body);

    // Get user's secret
    const [userData] = await sql`
      SELECT two_factor_secret
      FROM app_user
      WHERE id = ${userId}
      LIMIT 1
    ` as any[];

    if (!userData?.two_factor_secret) {
      return NextResponse.json(
        { success: false, error: '2FA not set up' },
        { status: 400 }
      );
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: userData.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps before/after for clock skew
    });

    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await sql`
      UPDATE app_user
      SET two_factor_enabled = true
      WHERE id = ${userId}
    `;

    console.log(`[2FA] Enabled for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error: any) {
    console.error('[2FA] Verify error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
