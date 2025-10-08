import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Validate token
    const [resetToken] = await sql`
      SELECT id, user_id, expires_at, used_at
      FROM password_reset_token
      WHERE token = ${token}
      LIMIT 1
    ` as any[];

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (resetToken.used_at) {
      return NextResponse.json(
        { success: false, error: 'Reset token already used' },
        { status: 400 }
      );
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Reset token expired' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await sql`
      UPDATE app_user
      SET password_hash = ${passwordHash}
      WHERE id = ${resetToken.user_id}
    `;

    // Mark token as used
    await sql`
      UPDATE password_reset_token
      SET used_at = NOW()
      WHERE id = ${resetToken.id}
    `;

    console.log(`[Password Reset] Password reset for user ${resetToken.user_id}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('[Password Reset] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
