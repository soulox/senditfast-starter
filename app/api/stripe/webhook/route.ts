import { stripe } from '@lib/stripe';
import { sql } from '@lib/db';
import Stripe from 'stripe';

export const runtime = 'edge';


export async function POST(req: Request) {
  // Stripe webhooks are deprecated - using Authorize.Net instead
  // This endpoint is kept for backwards compatibility only
  
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Stripe is not configured. Using Authorize.Net for payments.' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata || {};

        if (userId && plan) {
          // Update user's plan and store Stripe customer ID
          await sql`
            update app_user
            set plan = ${plan}, stripe_customer_id = ${session.customer as string}
            where id = ${userId}
          `;

          console.log(`Updated user ${userId} to plan ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Check if subscription is active
        const isActive = subscription.status === 'active';
        if (!isActive) {
          // Downgrade to FREE if subscription is not active
          await sql`
            update app_user
            set plan = 'FREE'
            where stripe_customer_id = ${customerId}
          `;

          console.log(`Downgraded customer ${customerId} to FREE plan`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Downgrade to FREE when subscription is cancelled
        await sql`
          update app_user
          set plan = 'FREE'
          where stripe_customer_id = ${customerId}
        `;

        console.log(`Subscription cancelled for customer ${customerId}, downgraded to FREE`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error) {
      return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }

    return new Response('Webhook Error', { status: 400 });
  }
}
