import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token provided' });
    }

    // Check if token exists and is not expired
    const [resetToken] = await sql`
      SELECT id, expires_at, used_at
      FROM password_reset_token
      WHERE token = ${token}
      LIMIT 1
    ` as any[];

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Invalid token' });
    }

    if (resetToken.used_at) {
      return NextResponse.json({ valid: false, error: 'Token already used' });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token expired' });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[Password Reset] Validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
