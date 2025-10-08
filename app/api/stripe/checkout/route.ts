import { requireUser } from '@lib/get-user';
import { authorizenet } from '@lib/authorizenet';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
});

export async function POST(req: Request) {
  try {
    // Check if Authorize.Net is configured
    if (!authorizenet.isConfigured()) {
      const status = authorizenet.getConfigStatus();
      console.error('[Checkout] Authorize.Net not configured:', status);
      return new Response(
        JSON.stringify({ 
          error: 'Payment processing is not configured. Please set AUTHORIZENET_API_LOGIN_ID and AUTHORIZENET_TRANSACTION_KEY in your environment variables.' 
        }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const user = await requireUser();
    const userId = (user as any).id;
    const email = user?.email;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required for checkout' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { plan } = checkoutSchema.parse(body);

    // Determine amount based on plan
    const amount = plan === 'PRO' ? '9.99' : '29.99';

    console.log(`[Checkout] Creating payment page for user ${userId}, plan ${plan}, amount $${amount}`);

    // Create Authorize.Net hosted payment page
    const result = await authorizenet.createHostedPaymentPage({
      amount,
      plan,
      customerEmail: email,
      userId,
    });

    if (result.success) {
      console.log(`[Checkout] Payment page created successfully`);
      return new Response(
        JSON.stringify({ url: result.hostedPaymentPageUrl }),
        { headers: { 'content-type': 'application/json' } }
      );
    } else {
      throw new Error('Failed to create payment page');
    }
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid data', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create checkout session' 
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

