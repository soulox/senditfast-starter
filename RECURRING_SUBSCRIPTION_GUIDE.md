# 🔄 Recurring Subscription Implementation Guide

This application now uses **Authorize.NET ARB (Automated Recurring Billing)** to handle monthly recurring subscriptions for PRO and BUSINESS plans.

## Overview

Recurring subscriptions are **fully managed by Authorize.NET**, meaning:
- ✅ Authorize.NET automatically charges customers monthly
- ✅ Authorize.NET handles payment retries on failures
- ✅ Authorize.NET sends webhooks for subscription events
- ✅ The application automatically updates user plans based on webhooks
- ✅ Users can cancel subscriptions anytime

## Architecture

### Flow Diagram

```
User clicks "Upgrade" → Checkout Flow → Authorize.NET Payment Page → 
Payment Success → Webhook Notifies App → Subscription Created → 
Monthly Auto-Billing by Authorize.NET → Webhooks Keep App Synced
```

## Database Schema

### New Fields Added to `app_user` Table

```sql
authorizenet_subscription_id text       -- Subscription ID from Authorize.NET
subscription_started_at timestamptz    -- When subscription began
subscription_status text               -- active, cancelled, suspended, expired
```

**Migration:** Run `node scripts/migrate.js infra/sql/add-authorizenet-subscription.sql`

## Key Components

### 1. Checkout Flow (`app/api/stripe/checkout/route.ts`)

- Creates hosted payment page via Authorize.NET
- Sets `subscription_status = 'pending'` for recurring subscriptions
- User completes payment on Authorize.NET's secure page
- Webhook handles subscription creation after payment

**Note:** The route is named `/api/stripe/checkout` for backwards compatibility, but it uses Authorize.NET.

### 2. Subscription API (`lib/authorizenet.ts`)

Three main methods:

```typescript
// Create a new subscription
createSubscription(params: CreateSubscriptionParams)

// Cancel an existing subscription  
cancelSubscription(subscriptionId: string)

// Get subscription details
getSubscription(subscriptionId: string)
```

### 3. Webhook Handler (`app/api/authorizenet/webhook/route.ts`)

Handles these Authorize.NET events:

| Event | Action |
|-------|--------|
| `net.authorize.payment.authcapture.created` | Updates user plan after initial payment |
| `net.authorize.customer.subscription.created` | Activates subscription in database |
| `net.authorize.customer.subscription.updated` | Syncs subscription status changes |
| `net.authorize.customer.subscription.cancelled` | Downgrades user to FREE plan |
| `net.authorize.customer.subscription.suspended` | Marks subscription as suspended (payment failed) |
| `net.authorize.customer.subscription.terminated` | Downgrades user to FREE plan |
| `net.authorize.customer.subscription.expired` | Downgrades user to FREE plan |

### 4. Subscription Management (`app/subscription/page.tsx`)

User-facing page where customers can:
- ✅ View current subscription details
- ✅ See subscription status and billing info
- ✅ Cancel their subscription
- ✅ Upgrade to a different plan

### 5. Subscription API Routes

**GET `/api/authorizenet/subscription`**
- Returns user's subscription information
- Fetches live details from Authorize.NET

**DELETE `/api/authorizenet/subscription`**
- Cancels user's subscription
- Downgrades to FREE plan
- Sends cancellation request to Authorize.NET

## Setup Instructions

### 1. Configure Authorize.NET

Add to your `.env.local`:

```env
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox  # or 'production'
AUTHORIZENET_SIGNATURE_KEY=your_signature_key
NEXT_PUBLIC_BASE_URL=http://localhost:3005
```

### 2. Set Up Webhooks

1. Go to Authorize.NET Dashboard → Account → Webhooks
2. Add webhook endpoint: `https://your-domain.com/api/authorizenet/webhook`
3. Subscribe to these events:
   - `net.authorize.payment.authcapture.created`
   - `net.authorize.customer.subscription.created`
   - `net.authorize.customer.subscription.updated`
   - `net.authorize.customer.subscription.cancelled`
   - `net.authorize.customer.subscription.suspended`
   - `net.authorize.customer.subscription.terminated`
   - `net.authorize.customer.subscription.expired`
4. Copy the Signature Key and add it to your `.env.local`

### 3. Run Database Migration

```bash
node scripts/migrate.js infra/sql/add-authorizenet-subscription.sql
```

### 4. Test the Flow

1. Go to `/pricing` page
2. Click "Upgrade Now" on PRO or BUSINESS
3. Complete payment on Authorize.NET page
4. Verify user is upgraded in database
5. Check `/subscription` page to view subscription

## Pricing Plans

| Plan | Price | Billing |
|------|-------|---------|
| FREE | $0 | N/A |
| PRO | $9.99/month | Recurring |
| BUSINESS | $29.99/month | Recurring |

Amounts are configured in `app/api/stripe/checkout/route.ts` (line 60).

## User Experience

### For Users with Active Subscriptions

- See "💳 Subscription" link in header
- Can view subscription details at `/subscription`
- Can cancel anytime (immediate downgrade to FREE)
- Authorize.NET handles all billing automatically

### Subscription Status

| Status | Meaning |
|--------|---------|
| `pending` | Payment initiated, waiting for confirmation |
| `active` | Subscription active, will auto-renew |
| `cancelled` | User cancelled, no more charges |
| `suspended` | Payment failed, needs attention |
| `expired` | Subscription period ended |

## Important Notes

### Payment Processing

- **First Payment:** Processed immediately via hosted payment page
- **Recurring Payments:** Processed automatically by Authorize.NET on billing date
- **Failed Payments:** Authorize.NET retries automatically, sends webhook on suspension

### Subscription Cancellation

- Cancellation is **immediate** - user is downgraded to FREE right away
- To implement "cancel at end of billing period," you would need to:
  1. Keep subscription active in Authorize.NET
  2. Set a flag in database for "pending cancellation"
  3. Cancel via webhook when subscription expires naturally

### Testing in Sandbox

Use Authorize.NET test cards:
- **Approved:** 4111111111111111
- **Declined:** 4000000000000002
- Expiration: Any future date
- CVV: Any 3 digits

### Webhook Security

All webhooks are verified using HMAC-SHA512 signature:

```typescript
verifyWebhookSignature(signature: string, payload: string): boolean
```

Never process a webhook without signature verification!

## API Reference

### Create Subscription Endpoint

**POST** `/api/authorizenet/create-subscription`

```json
{
  "plan": "PRO" | "BUSINESS",
  "paymentProfile": {
    "customerProfileId": "string",
    "paymentProfileId": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "12345678",
  "message": "Subscription created successfully"
}
```

### Get Subscription

**GET** `/api/authorizenet/subscription`

**Response:**
```json
{
  "plan": "PRO",
  "subscriptionId": "12345678",
  "status": "active",
  "startedAt": "2025-10-15T10:30:00Z",
  "hasActiveSubscription": true,
  "details": { /* Authorize.NET subscription object */ }
}
```

### Cancel Subscription

**DELETE** `/api/authorizenet/subscription`

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

## Troubleshooting

### Subscription not created after payment

1. Check webhook logs for errors
2. Verify webhook signature key is correct
3. Check that webhook endpoint is publicly accessible
4. Look for webhook events in Authorize.NET dashboard

### User still charged after cancellation

1. Verify subscription was cancelled in Authorize.NET dashboard
2. Check if cancellation request succeeded in logs
3. Manually cancel in Authorize.NET if needed

### Payment failed but user still has access

1. Authorize.NET sends `subscription.suspended` webhook
2. Implement grace period logic if desired
3. Consider downgrading immediately or after X failed attempts

## Future Enhancements

### Potential Improvements

1. **Email Notifications**
   - Send email when subscription is created
   - Notify user before renewal
   - Alert on payment failures

2. **Grace Period**
   - Don't downgrade immediately on payment failure
   - Give users 3-7 days to update payment method

3. **Plan Changes**
   - Allow upgrading from PRO to BUSINESS
   - Prorate charges for mid-cycle changes

4. **Annual Billing**
   - Offer annual plans at discounted rate
   - Use `intervalUnit: 'years'` in subscription creation

5. **Usage-Based Billing**
   - Track usage beyond plan limits
   - Charge overages or enforce hard limits

## Summary

✅ **Recurring billing is fully automated by Authorize.NET**
✅ **Application stays synced via webhooks**
✅ **Users can manage subscriptions from `/subscription` page**
✅ **All payment logic handled by Authorize.NET's secure platform**

Your application is now production-ready for recurring subscriptions!

