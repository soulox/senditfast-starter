import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { z } from 'zod';

export const runtime = 'edge';


const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['member', 'admin']).default('member')
});

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { email, name, role } = inviteSchema.parse(body);

    // Check if already invited
    const [existing] = await sql`
      SELECT id FROM team_member
      WHERE owner_id = ${userId} AND email = ${email}
      LIMIT 1
    ` as any[];

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This email has already been invited' },
        { status: 400 }
      );
    }

    // Check team size limit (5 for Business plan)
    const [countResult] = await sql`
      SELECT COUNT(*)::int as count
      FROM team_member
      WHERE owner_id = ${userId}
    ` as any[];

    if (countResult.count >= 5) {
      return NextResponse.json(
        { success: false, error: 'Team size limit reached (5 members max)' },
        { status: 400 }
      );
    }

    // Create team member invitation
    const [newMember] = await sql`
      INSERT INTO team_member (owner_id, email, name, role, status)
      VALUES (${userId}, ${email}, ${name || null}, ${role}, 'pending')
      RETURNING id, email, name, role, status, invited_at
    ` as any[];

    console.log(`[Team] Invited ${email} to team of user ${userId}`);

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
    const acceptUrl = `${baseUrl}/team/accept/${newMember.id}`;
    
    const { sendTeamInviteEmail } = await import('@lib/email');
    await sendTeamInviteEmail({
      to: email,
      inviterName: (user as any).name,
      inviterEmail: (user as any).email,
      teamName: (user as any).name ? `${(user as any).name}'s team` : undefined,
      acceptUrl
    });

    return NextResponse.json({
      success: true,
      member: newMember,
      message: 'Invitation sent successfully'
    });
  } catch (error: any) {
    console.error('[Team] Error inviting member:', error);

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
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
