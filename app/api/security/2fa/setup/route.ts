import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import speakeasy from 'speakeasy';


export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const email = (user as any).email;

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `SendItFast (${email})`,
      issuer: 'SendItFast'
    });

    // Store secret temporarily (not enabled yet)
    await sql`
      UPDATE app_user
      SET two_factor_secret = ${secret.base32}
      WHERE id = ${userId}
    `;

    console.log(`[2FA] Setup initiated for user ${userId}`);

    return NextResponse.json({
      success: true,
      qrCode: secret.otpauth_url,
      secret: secret.base32
    });
  } catch (error: any) {
    console.error('[2FA] Setup error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
