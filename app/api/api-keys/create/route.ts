import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const runtime = 'edge';


const createKeySchema = z.object({
  name: z.string().min(1).max(100)
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const userPlan = (user as any).plan || 'FREE';

    // Only allow Business plan users
    if (userPlan !== 'BUSINESS') {
      return NextResponse.json(
        { success: false, error: 'API access is only available on the Business plan' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name } = createKeySchema.parse(body);

    // Check API key limit (10 keys max)
    const [countResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM api_key
      WHERE user_id = ${userId} AND revoked_at IS NULL
    ` as any[];

    if (countResult.count >= 10) {
      return NextResponse.json(
        { success: false, error: 'API key limit reached (10 keys max)' },
        { status: 400 }
      );
    }

    // Generate API key: sif_live_<32 random chars>
    const randomBytes = crypto.randomBytes(24);
    const apiKey = `sif_live_${randomBytes.toString('base64url')}`;
    const keyPrefix = apiKey.substring(0, 12); // For display
    const keyHash = await bcrypt.hash(apiKey, 10);

    // Store API key
    const [newKey] = await sql`
      INSERT INTO api_key (user_id, name, key_hash, key_prefix)
      VALUES (${userId}, ${name}, ${keyHash}, ${keyPrefix})
      RETURNING id, name, key_prefix, created_at
    ` as any[];

    console.log(`[API Keys] Created new key "${name}" for user ${userId}`);

    return NextResponse.json({
      success: true,
      key: apiKey, // Return the full key ONLY on creation
      keyInfo: newKey,
      message: 'API key created successfully. Save it now - you won\'t be able to see it again!'
    });
  } catch (error: any) {
    console.error('[API Keys] Error creating key:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
