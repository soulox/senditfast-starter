import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';
import { z } from 'zod';
import crypto from 'crypto';


const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const [user] = await sql`
      SELECT id, email, name
      FROM app_user
      WHERE email = ${email}
      LIMIT 1
    ` as any[];

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[Password Reset] Email not found: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset email has been sent'
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    await sql`
      INSERT INTO password_reset_token (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `;

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Import email function dynamically
    const { sendPasswordResetEmail } = await import('@lib/email');
    await sendPasswordResetEmail({
      to: email,
      resetUrl,
      userName: user.name
    });

    console.log(`[Password Reset] Reset email sent to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Reset email sent'
    });
  } catch (error: any) {
    console.error('[Password Reset] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
