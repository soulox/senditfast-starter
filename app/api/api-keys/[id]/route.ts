import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export const runtime = 'edge';


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: keyId } = await params;

    // Revoke API key (soft delete)
    const result = await sql`
      UPDATE api_key
      SET revoked_at = NOW()
      WHERE id = ${keyId} AND user_id = ${userId} AND revoked_at IS NULL
      RETURNING id
    ` as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    console.log(`[API Keys] Revoked key ${keyId} for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'API key revoked'
    });
  } catch (error: any) {
    console.error('[API Keys] Error revoking key:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
