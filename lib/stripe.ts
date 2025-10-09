import Stripe from 'stripe';

// Stripe is deprecated in favor of Authorize.Net
// Keeping for backwards compatibility
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any, // Using compatible version
    })
  : null;

export const PLANS = {
  FREE: {
    name: 'Free',
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
    expiryDays: 7,
    price: 0,
  },
  PRO: {
    name: 'Pro',
    maxFileSize: 100 * 1024 * 1024 * 1024, // 100GB
    expiryDays: 30,
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  BUSINESS: {
    name: 'Business',
    maxFileSize: 250 * 1024 * 1024 * 1024, // 250GB
    expiryDays: 90,
    price: 29.99,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
  },
};

