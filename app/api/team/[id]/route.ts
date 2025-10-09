import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


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
        { success: false, error: 'Team management is only available on the Business plan' },
        { status: 403 }
      );
    }

    const { id: memberId } = await params;

    // Delete team member (only if they belong to this user's team)
    const result = await sql`
      DELETE FROM team_member
      WHERE id = ${memberId} AND owner_id = ${userId}
      RETURNING id
    ` as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Team member not found' },
        { status: 404 }
      );
    }

    console.log(`[Team] Removed member ${memberId} from team of user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Team member removed'
    });
  } catch (error: any) {
    console.error('[Team] Error removing member:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
