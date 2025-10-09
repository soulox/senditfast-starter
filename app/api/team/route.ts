import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';

export const runtime = 'edge';


export async function GET(req: NextRequest) {
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

    // Get team members
    const members = await sql`
      SELECT 
        id, email, name, role, status, 
        invited_at, accepted_at, last_active_at
      FROM team_member
      WHERE owner_id = ${userId}
      ORDER BY invited_at DESC
    `;

    return NextResponse.json({
      success: true,
      members
    });
  } catch (error: any) {
    console.error('[Team] Error fetching members:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
