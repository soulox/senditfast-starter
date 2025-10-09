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

    // Update user's plan
    await sql`
      UPDATE app_user
      SET plan = ${plan}
      WHERE id = ${userId}
    `;

    console.log(`[Authorize.Net] Updated user ${userId} to ${plan} plan`);
  } catch (error) {
    console.error('[Authorize.Net] Error handling payment success:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    const userId = payload.payload?.profile?.customerProfileId;
    
    console.log(`[Authorize.Net] Subscription created: ${subscriptionId} for user: ${userId}`);
    
    // You can store subscription ID in the database if needed
    // await sql`
    //   UPDATE app_user
    //   SET authorizenet_subscription_id = ${subscriptionId}
    //   WHERE id = ${userId}
    // `;
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    console.log(`[Authorize.Net] Subscription updated: ${subscriptionId}`);
    
    // Handle subscription updates if needed
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionCancelled(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    
    // Find user by subscription ID and downgrade to FREE
    // This requires storing the subscription ID in the database
    console.log(`[Authorize.Net] Subscription cancelled: ${subscriptionId}`);
    
    // await sql`
    //   UPDATE app_user
    //   SET plan = 'FREE'
    //   WHERE authorizenet_subscription_id = ${subscriptionId}
    // `;
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription cancelled:', error);
    throw error;
  }
}

async function handleSubscriptionSuspended(payload: any) {
  try {
    const subscriptionId = payload.payload?.id;
    console.log(`[Authorize.Net] Subscription suspended: ${subscriptionId}`);
    
    // Handle subscription suspension (e.g., payment failed)
    // You might want to send an email notification to the user
  } catch (error) {
    console.error('[Authorize.Net] Error handling subscription suspended:', error);
    throw error;
  }
}
