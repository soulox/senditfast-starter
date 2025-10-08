import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { z } from 'zod';

const changePlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'BUSINESS']),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    const body = await req.json();
    const { plan } = changePlanSchema.parse(body);

    // Update user's plan
    await sql`
      UPDATE app_user
      SET plan = ${plan}
      WHERE id = ${userId}
    `;

    console.log(`[Admin] Updated user ${userId} to ${plan} plan`);

    return NextResponse.json({ 
      success: true, 
      message: `Plan updated to ${plan}`,
      plan 
    });
  } catch (error: any) {
    console.error('[Admin] Error changing plan:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change plan' },
      { status: 500 }
    );
  }
}
