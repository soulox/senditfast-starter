import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { authorizenet } from '@lib/authorizenet';
import { z } from 'zod';

const subscriptionSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
  paymentProfile: z.object({
    customerProfileId: z.string(),
    paymentProfileId: z.string(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const email = user?.email;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { plan } = subscriptionSchema.parse(body);

    // Check if user already has an active subscription
    const existingUser = await sql`
      SELECT authorizenet_subscription_id, subscription_status, plan
      FROM app_user
      WHERE id = ${userId}
    `;

    if (existingUser[0]?.authorizenet_subscription_id && 
        existingUser[0]?.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please cancel it first.' },
        { status: 400 }
      );
    }

    // Determine amount based on plan
    const amount = plan === 'PRO' ? '9.99' : '29.99';

    // Get start date (tomorrow to give payment profile time to settle)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const formattedStartDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`[Subscription] Creating subscription for user ${userId}, plan ${plan}, amount $${amount}`);

    // Create subscription via Authorize.NET ARB
    const result = await authorizenet.createSubscription({
      amount,
      intervalLength: 1,
      intervalUnit: 'months',
      startDate: formattedStartDate,
      totalOccurrences: 9999, // Essentially unlimited
      customerEmail: email,
      plan,
      userId,
    });

    if (result.success && result.subscriptionId) {
      // Update user with subscription info
      await sql`
        UPDATE app_user
        SET 
          authorizenet_subscription_id = ${result.subscriptionId},
          plan = ${plan},
          subscription_started_at = now(),
          subscription_status = 'active'
        WHERE id = ${userId}
      `;

      console.log(`[Subscription] Created subscription ${result.subscriptionId} for user ${userId}`);

      return NextResponse.json({
        success: true,
        subscriptionId: result.subscriptionId,
        message: 'Subscription created successfully',
      });
    } else {
      throw new Error('Failed to create subscription');
    }
  } catch (error: any) {
    console.error('[Subscription] Error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

