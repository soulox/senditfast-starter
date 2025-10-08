# 💳 Authorize.Net Setup Guide

To enable the upgrade functionality on the pricing page, you need to configure Authorize.Net credentials.

## Steps to Set Up Authorize.Net:

### 1. Create an Authorize.Net Account
- Go to [https://www.authorize.net](https://www.authorize.net)
- Sign up for an account or log in
- For testing, you can use the **Sandbox** environment

### 2. Get Your API Credentials

#### For Sandbox (Testing):
1. Go to [https://sandbox.authorize.net](https://sandbox.authorize.net)
2. Log in with your sandbox credentials
3. Navigate to **Account** → **Settings** → **API Credentials & Keys**
4. Note your **API Login ID** and **Transaction Key**
   - If you don't have a Transaction Key, click **New Transaction Key**
   - **Important**: Save the Transaction Key immediately - it won't be shown again!

#### For Production:
1. Go to [https://account.authorize.net](https://account.authorize.net)
2. Log in to your production account
3. Navigate to **Account** → **Settings** → **API Credentials & Keys**
4. Get your **API Login ID** and **Transaction Key**

### 3. Get Your Public Client Key (for Accept.js)

For embedded payment forms, you need a Public Client Key:

1. In the Authorize.Net dashboard, go to **Account** → **Settings** → **Manage Public Client Key**
2. Click **Generate New Key** (or use existing one)
3. Copy the **Public Client Key** (starts with something like `5FcB6WrfHGS76gHW...`)

### 4. Add Credentials to Environment Variables

Add these lines to your `.env.local` file:

```env
# Authorize.Net Configuration
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox
# Change to 'production' when ready to go live

# Public Client Key (for Accept.js embedded forms)
NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID=your_api_login_id
NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY=your_public_client_key

# Authorize.Net Signature Key (for webhooks)
AUTHORIZENET_SIGNATURE_KEY=your_signature_key

# Your application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3005
```

### 5. Get Your Signature Key (For Webhooks)

1. In the Authorize.Net dashboard, go to **Account** → **Settings** → **Webhooks**
2. Click **Add Endpoint**
3. Set the webhook URL: `https://your-domain.com/api/authorizenet/webhook`
4. Select the events you want to receive:
   - `net.authorize.payment.authcapture.created`
   - `net.authorize.customer.subscription.created`
   - `net.authorize.customer.subscription.updated`
   - `net.authorize.customer.subscription.cancelled`
   - `net.authorize.customer.subscription.suspended`
   - `net.authorize.customer.subscription.terminated`
   - `net.authorize.customer.subscription.expired`
5. Save and copy the **Signature Key**
6. Add it to your `.env.local` as `AUTHORIZENET_SIGNATURE_KEY`

### 6. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
pnpm dev
```

## Testing the Integration

### Test Credit Cards (Sandbox Only):

**Approved Transaction:**
- Card Number: `4111111111111111` (Visa)
- Card Number: `5424000000000015` (Mastercard)
- Expiration: Any future date (e.g., 12/2025)
- CVV: Any 3 digits (e.g., 123)

**Declined Transaction:**
- Card Number: `4000000000000002`
- Expiration: Any future date
- CVV: Any 3 digits

**Other Test Scenarios:**
- For more test cards, see [Authorize.Net Testing Guide](https://developer.authorize.net/hello_world/testing_guide/)

### Testing Flow:

1. Go to `/pricing` page
2. Click **"🚀 Upgrade Now"** on Pro or Business plan
3. You'll be redirected to Authorize.Net's hosted payment page
4. Enter test card details
5. Complete the payment
6. You'll be redirected back to your dashboard

## Hosted Payment Page Customization

The payment page is customized with your brand colors. You can further customize it in the Authorize.Net dashboard:

1. Go to **Account** → **Settings** → **Payment Form**
2. Customize colors, logos, and text
3. Save your changes

## Production Checklist

Before going live:

- [ ] Switch `AUTHORIZENET_ENVIRONMENT` to `production`
- [ ] Use production API credentials
- [ ] Update `NEXT_PUBLIC_BASE_URL` to your production domain
- [ ] Set up production webhooks
- [ ] Test with real credit cards (small amounts)
- [ ] Verify SSL certificate is valid
- [ ] Review Authorize.Net security settings
- [ ] Set up email notifications for failed payments

## Pricing Plans

The application is configured with these plans:

- **Pro Plan**: $9.99/month
- **Business Plan**: $29.99/month

These amounts are hardcoded in `app/api/stripe/checkout/route.ts`. To change them, update the `amount` variable in that file.

## Webhook Events

The application handles these Authorize.Net webhook events:

- `net.authorize.payment.authcapture.created` - Payment successful, upgrades user
- `net.authorize.customer.subscription.created` - Subscription created
- `net.authorize.customer.subscription.updated` - Subscription updated
- `net.authorize.customer.subscription.cancelled` - Subscription cancelled, downgrades to FREE
- `net.authorize.customer.subscription.suspended` - Payment failed
- `net.authorize.customer.subscription.terminated` - Subscription ended
- `net.authorize.customer.subscription.expired` - Subscription expired

## Troubleshooting

### "Authorize.Net is not configured" error:
- Check that all environment variables are set correctly
- Restart your development server after adding variables
- Verify your API credentials are correct

### Payment page doesn't load:
- Check that `AUTHORIZENET_ENVIRONMENT` is set to `sandbox` or `production`
- Verify your API Login ID and Transaction Key are correct
- Check browser console for errors

### Webhook not working:
- Verify the webhook URL is publicly accessible (use ngrok for local testing)
- Check that the Signature Key is correct
- Look at server logs for webhook errors

## Need Help?

- [Authorize.Net Developer Documentation](https://developer.authorize.net/)
- [API Reference](https://developer.authorize.net/api/reference/)
- [Testing Guide](https://developer.authorize.net/hello_world/testing_guide/)
- [Webhooks Documentation](https://developer.authorize.net/api/reference/features/webhooks.html)

## Current Configuration Status

Your `.env.local` should have:
- ✅ `AUTHORIZENET_API_LOGIN_ID` - **Required**
- ✅ `AUTHORIZENET_TRANSACTION_KEY` - **Required**
- ✅ `AUTHORIZENET_ENVIRONMENT` - **Required** (sandbox or production)
- ✅ `AUTHORIZENET_SIGNATURE_KEY` - **Required for webhooks**
- ✅ `NEXT_PUBLIC_BASE_URL` - **Required**
