import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';
import { authorizenet } from '@lib/authorizenet';


export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-anet-signature') || '';

    // Verify webhook signature
    if (!authorizenet.verifyWebhookSignature(signature, body)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const eventType = payload.eventType;
    const notificationId = payload.notificationId;

    console.log(`[Authorize.Net Webhook] Event: ${eventType}, ID: ${notificationId}`);

    // Handle different event types
    switch (eventType) {
      case 'net.authorize.payment.authcapture.created':
        await handlePaymentSuccess(payload);
        break;

      case 'net.authorize.customer.subscription.created':
        await handleSubscriptionCreated(payload);
        break;

      case 'net.authorize.customer.subscription.updated':
        await handleSubscriptionUpdated(payload);
        break;

      case 'net.authorize.customer.subscription.cancelled':
      case 'net.authorize.customer.subscription.terminated':
      case 'net.authorize.customer.subscription.expired':
        await handleSubscriptionCancelled(payload);
        break;

      case 'net.authorize.customer.subscription.suspended':
        await handleSubscriptionSuspended(payload);
        break;

      default:
        console.log(`[Authorize.Net Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Authorize.Net Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payload: any) {
  try {
    const userId = payload.payload?.userFields?.find((f: any) => f.name === 'userId')?.value;
    const plan = payload.payload?.userFields?.find((f: any) => f.name === 'plan')?.value;

    if (!userId || !plan) {
      console.error('[Authorize.Net] Missing userId or plan in payment payload');
      return;
    }

    // Check if this is a subscription setup payment
    const user = await sql`
      SELECT subscription_status, authorizenet_subscription_id
      FROM app_user
      WHERE id = ${userId}
    `;

    const isSubscriptionSetup = user[0]?.subscription_status === 'pending';

    // Update user's plan
    await sql`
      UPDATE app_user
      SET plan = ${plan}
      WHERE id = ${userId}
    `;

    console.log(`[Authorize.Net] Updated user ${userId} to ${plan} plan`);

    // If this was a subscription setup, the subscription will be created via separate webhook
    if (isSubscriptionSetup) {
      console.log(`[Authorize.Net] Payment is for subscription setup, waiting for subscription created webhook`);
    }
  } catch (error) {
    console.error('[Authorize.Net] Error handling payment success:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    const customerEmail = payload.payload?.profile?.email || payload.payload?.email;
    
    console.log(`[Authorize.Net] Subscription created: ${subscriptionId}`);
    console.log('[Authorize.Net] Full payload:', JSON.stringify(payload, null, 2));
    
    if (!subscriptionId) {
      console.error('[Authorize.Net] No subscription ID in payload');
      return;
    }

    // Find user by email since Authorize.NET might not send customer ID
    if (customerEmail) {
      await sql`
        UPDATE app_user
        SET 
          authorizenet_subscription_id = ${subscriptionId},
          subscription_started_at = now(),
          subscription_status = 'active'
        WHERE email = ${customerEmail}
        AND (subscription_status = 'pending' OR subscription_status IS NULL)
      `;
      
      console.log(`[Authorize.Net] Updated user with email ${customerEmail} with subscription ${subscriptionId}`);
    } else {
      console.error('[Authorize.Net] No customer email found in subscription payload');
    }
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    const status = payload.payload?.status;
    
    console.log(`[Authorize.Net] Subscription updated: ${subscriptionId}, status: ${status}`);
    
    if (!subscriptionId) {
      console.error('[Authorize.Net] No subscription ID in payload');
      return;
    }

    // Update subscription status if changed
    if (status) {
      await sql`
        UPDATE app_user
        SET subscription_status = ${status}
        WHERE authorizenet_subscription_id = ${subscriptionId}
      `;
      
      console.log(`[Authorize.Net] Updated subscription ${subscriptionId} status to ${status}`);
    }
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionCancelled(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    
    if (!subscriptionId) {
      console.error('[Authorize.Net] No subscription ID in payload');
      return;
    }

    console.log(`[Authorize.Net] Subscription cancelled: ${subscriptionId}`);
    
    // Find user by subscription ID and downgrade to FREE
    await sql`
      UPDATE app_user
      SET 
        plan = 'FREE',
        subscription_status = 'cancelled',
        authorizenet_subscription_id = NULL
      WHERE authorizenet_subscription_id = ${subscriptionId}
    `;
    
    console.log(`[Authorize.Net] Downgraded user with subscription ${subscriptionId} to FREE plan`);
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription cancelled:', error);
    throw error;
  }
}

async function handleSubscriptionSuspended(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    
    if (!subscriptionId) {
      console.error('[Authorize.Net] No subscription ID in payload');
      return;
    }

    console.log(`[Authorize.Net] Subscription suspended: ${subscriptionId}`);
    
    // Update subscription status to suspended (payment failed)
    await sql`
      UPDATE app_user
      SET subscription_status = 'suspended'
      WHERE authorizenet_subscription_id = ${subscriptionId}
    `;
    
    console.log(`[Authorize.Net] Suspended subscription ${subscriptionId} - payment failed`);
    
    // TODO: Send email notification to user about payment failure
    // You might want to give them a grace period before downgrading
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription suspended:', error);
    throw error;
  }
}
