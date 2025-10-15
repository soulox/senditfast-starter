import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { authorizenet } from '@lib/authorizenet';

/**
 * GET - Get current user's subscription details
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    // Get user's subscription info
    const result = await sql`
      SELECT 
        plan,
        authorizenet_subscription_id,
        subscription_status,
        subscription_started_at
      FROM app_user
      WHERE id = ${userId}
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userInfo = result[0];

    // If user has a subscription, get details from Authorize.NET
    let subscriptionDetails = null;
    if (userInfo.authorizenet_subscription_id) {
      try {
        const subResult = await authorizenet.getSubscription(
          userInfo.authorizenet_subscription_id
        );
        if (subResult.success) {
          subscriptionDetails = subResult.subscription;
        }
      } catch (error) {
        console.error('[Subscription] Error fetching subscription details:', error);
        // Continue without detailed subscription info
      }
    }

    return NextResponse.json({
      plan: userInfo.plan,
      subscriptionId: userInfo.authorizenet_subscription_id,
      status: userInfo.subscription_status,
      startedAt: userInfo.subscription_started_at,
      details: subscriptionDetails,
      hasActiveSubscription: !!(
        userInfo.authorizenet_subscription_id && 
        userInfo.subscription_status === 'active'
      ),
    });
  } catch (error: any) {
    console.error('[Subscription] GET error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel user's subscription
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;

    // Get user's subscription info
    const result = await sql`
      SELECT 
        authorizenet_subscription_id,
        subscription_status,
        plan
      FROM app_user
      WHERE id = ${userId}
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userInfo = result[0];

    if (!userInfo.authorizenet_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      );
    }

    if (userInfo.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Cancel subscription via Authorize.NET
    const cancelResult = await authorizenet.cancelSubscription(
      userInfo.authorizenet_subscription_id
    );

    if (cancelResult.success) {
      // Update database - downgrade to FREE
      await sql`
        UPDATE app_user
        SET 
          plan = 'FREE',
          subscription_status = 'cancelled',
          authorizenet_subscription_id = NULL
        WHERE id = ${userId}
      `;

      console.log(`[Subscription] Cancelled subscription for user ${userId}`);

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    } else {
      throw new Error('Failed to cancel subscription');
    }
  } catch (error: any) {
    console.error('[Subscription] DELETE error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

