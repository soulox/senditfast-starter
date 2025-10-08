import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { z } from 'zod';

const paymentSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
  opaqueData: z.object({
    dataDescriptor: z.string(),
    dataValue: z.string()
  })
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const email = user?.email;

    const body = await req.json();
    const { plan, opaqueData } = paymentSchema.parse(body);

    const amount = plan === 'PRO' ? '9.99' : '29.99';

    // Prepare Authorize.Net request
    const apiLoginId = process.env.AUTHORIZENET_API_LOGIN_ID;
    const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
    const environment = process.env.AUTHORIZENET_ENVIRONMENT || 'sandbox';

    const apiEndpoint = environment === 'production'
      ? 'https://api.authorize.net/xml/v1/request.api'
      : 'https://apitest.authorize.net/xml/v1/request.api';

    const requestBody = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: apiLoginId,
          transactionKey: transactionKey
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: amount,
          payment: {
            opaqueData: {
              dataDescriptor: opaqueData.dataDescriptor,
              dataValue: opaqueData.dataValue
            }
          },
          order: {
            invoiceNumber: `${Date.now()}`,
            description: `SendItFast ${plan} Plan`
          },
          customer: {
            email: email
          },
          userFields: {
            userField: [
              { name: 'userId', value: userId },
              { name: 'plan', value: plan }
            ]
          }
        }
      }
    };

    console.log('[Authorize.Net] Processing payment for user:', userId, 'plan:', plan);

    // Send request to Authorize.Net
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('[Authorize.Net] Payment response:', JSON.stringify(data, null, 2));

    if (data.messages?.resultCode === 'Ok' && data.transactionResponse?.responseCode === '1') {
      // Payment successful - upgrade user
      await sql`
        UPDATE app_user
        SET plan = ${plan}
        WHERE id = ${userId}
      `;

      console.log(`[Authorize.Net] Payment successful! User ${userId} upgraded to ${plan}`);

      return NextResponse.json({
        success: true,
        transactionId: data.transactionResponse.transId,
        message: 'Payment successful'
      });
    } else {
      // Payment failed
      const errorMsg = data.transactionResponse?.errors?.[0]?.errorText 
        || data.messages?.message?.[0]?.text 
        || 'Payment declined';

      console.error('[Authorize.Net] Payment failed:', errorMsg);

      return NextResponse.json({
        success: false,
        error: errorMsg
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Authorize.Net] Process payment error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
