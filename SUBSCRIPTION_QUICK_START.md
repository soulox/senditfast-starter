# 🚀 Subscription Quick Start

## TL;DR

**Recurring subscriptions are now handled by Authorize.NET** and work automatically. Here's what you need to know:

## 3-Step Setup

### 1. Run Database Migration

```bash
node scripts/migrate.js infra/sql/add-authorizenet-subscription.sql
```

### 2. Configure Webhooks

**In Authorize.NET Dashboard:**
1. Go to Account → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/authorizenet/webhook`
3. Subscribe to all subscription events
4. Copy the Signature Key to `.env.local`:

```env
AUTHORIZENET_SIGNATURE_KEY=your_signature_key_here
```

### 3. Test It

1. Go to `/pricing`
2. Click "Upgrade Now"
3. Use test card: `4111111111111111`
4. Check `/subscription` page

## How It Works

### User Experience

```
User clicks "Upgrade" 
  ↓
Authorize.NET payment page
  ↓
Payment successful
  ↓
User upgraded to PRO/BUSINESS
  ↓
Authorize.NET charges monthly automatically
  ↓
User can cancel anytime at /subscription
```

### Technical Flow

```
1. Checkout creates payment page
2. User pays via Authorize.NET
3. Webhook fires → App upgrades user
4. Authorize.NET bills monthly
5. Webhooks keep app synced
```

## Key Files Changed/Created

### New Files
- ✅ `app/subscription/page.tsx` - Subscription management UI
- ✅ `app/api/authorizenet/subscription/route.ts` - API for subscription CRUD
- ✅ `app/api/authorizenet/create-subscription/route.ts` - Direct subscription creation
- ✅ `infra/sql/add-authorizenet-subscription.sql` - Database migration

### Modified Files
- ✅ `lib/authorizenet.ts` - Added subscription methods
- ✅ `app/api/authorizenet/webhook/route.ts` - Completed webhook handlers
- ✅ `app/api/stripe/checkout/route.ts` - Added recurring subscription flow
- ✅ `app/pricing/page.tsx` - Added subscription messaging
- ✅ `app/components/Header.tsx` - Added subscription link
- ✅ `infra/sql/schema.sql` - Updated base schema

## What Users See

### Pricing Page
- "Monthly recurring • Cancel anytime"
- "💳 Subscriptions are billed monthly and managed by Authorize.Net"
- Link to subscription management

### Header (for PRO/BUSINESS)
- "💳 Subscription" link

### Subscription Page
- Current plan and status
- Subscription details (ID, start date, amount)
- "Cancel Subscription" button
- Plan comparison

## Subscription Management

### View Subscription
```
GET /api/authorizenet/subscription
```

### Cancel Subscription
```
DELETE /api/authorizenet/subscription
```

## Billing

| Plan | Monthly Price | Status |
|------|--------------|--------|
| FREE | $0 | Free forever |
| PRO | $9.99 | Recurring |
| BUSINESS | $29.99 | Recurring |

## Webhook Events Handled

✅ Payment captured → Upgrade user  
✅ Subscription created → Activate subscription  
✅ Subscription updated → Sync status  
✅ Subscription cancelled → Downgrade to FREE  
✅ Subscription suspended → Mark as suspended  
✅ Subscription terminated → Downgrade to FREE  
✅ Subscription expired → Downgrade to FREE  

## Testing

### Sandbox Test Cards
- **Approved:** `4111111111111111`
- **Declined:** `4000000000000002`
- **Expiration:** Any future date
- **CVV:** Any 3 digits

### Test Checklist
- [ ] User can upgrade to PRO
- [ ] Database stores subscription ID
- [ ] User can view subscription at `/subscription`
- [ ] User can cancel subscription
- [ ] User downgrades to FREE after cancel
- [ ] Webhooks process correctly

## Production Checklist

- [ ] Switch `AUTHORIZENET_ENVIRONMENT` to `production`
- [ ] Use production API credentials
- [ ] Update webhook URL to production domain
- [ ] Use production signature key
- [ ] Test with real (small) payment
- [ ] Monitor webhooks for 24 hours

## FAQ

**Q: Who charges the customer monthly?**  
A: Authorize.NET automatically charges them on their billing date.

**Q: What happens if payment fails?**  
A: Authorize.NET retries automatically and sends a webhook. Subscription gets marked as "suspended."

**Q: Can users cancel anytime?**  
A: Yes! They go to `/subscription` and click "Cancel Subscription."

**Q: Do I need to write cron jobs?**  
A: No! Authorize.NET handles everything. You just process webhooks.

**Q: How do I change pricing?**  
A: Update the amounts in `app/api/stripe/checkout/route.ts` (line 60).

**Q: Can users upgrade mid-cycle?**  
A: Currently no. To implement: create new subscription, cancel old one, and prorate.

## Documentation

📖 **Detailed Guide:** `RECURRING_SUBSCRIPTION_GUIDE.md`  
📋 **Implementation Summary:** `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md`  
🔧 **Authorize.NET Setup:** `AUTHORIZENET_SETUP.md`

## Need Help?

1. Check webhook logs in Authorize.NET dashboard
2. Review server console for errors
3. Verify all environment variables are set
4. Ensure webhook signature verification passes

---

## You're Done! 🎉

Your app now has fully automated recurring subscriptions. Authorize.NET handles all the billing, and your app stays synced via webhooks. Users can manage everything themselves.

**Ready to test?** Go to `/pricing` and click "Upgrade Now"! 🚀

