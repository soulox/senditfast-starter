/**
 * Authorize.Net integration for payment processing
 */

interface AuthorizeNetConfig {
  apiLoginId: string;
  transactionKey: string;
  environment: 'sandbox' | 'production';
}

interface CreateSubscriptionParams {
  amount: string;
  intervalLength: number;
  intervalUnit: 'days' | 'months';
  startDate: string;
  totalOccurrences: number;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  plan: 'PRO' | 'BUSINESS';
}

export class AuthorizeNetClient {
  private config: AuthorizeNetConfig;
  private apiEndpoint: string;

  constructor() {
    this.config = {
      apiLoginId: process.env.AUTHORIZENET_API_LOGIN_ID || '',
      transactionKey: process.env.AUTHORIZENET_TRANSACTION_KEY || '',
      environment: (process.env.AUTHORIZENET_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };

    this.apiEndpoint =
      this.config.environment === 'production'
        ? 'https://api.authorize.net/xml/v1/request.api'
        : 'https://apitest.authorize.net/xml/v1/request.api';
  }

  /**
   * Check if Authorize.Net is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.apiLoginId && this.config.transactionKey);
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus() {
    return {
      hasApiLoginId: !!this.config.apiLoginId,
      hasTransactionKey: !!this.config.transactionKey,
      environment: this.config.environment,
      apiEndpoint: this.apiEndpoint,
    };
  }

  /**
   * Create a hosted payment page for subscription
   */
  async createHostedPaymentPage(params: {
    amount: string;
    plan: 'PRO' | 'BUSINESS';
    customerEmail: string;
    userId: string;
  }) {
    const { amount, plan, customerEmail, userId } = params;

    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Ensure URL starts with http:// or https://
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `http://${baseUrl}`;
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    
    console.log('[Authorize.Net] Base URL:', baseUrl);
    console.log('[Authorize.Net] Callback URL:', `${baseUrl}/api/authorizenet/callback`);

    const requestBody = {
      getHostedPaymentPageRequest: {
        merchantAuthentication: {
          name: this.config.apiLoginId,
          transactionKey: this.config.transactionKey,
        },
        transactionRequest: {
          transactionType: 'authCaptureTransaction',
          amount: amount,
          order: {
            invoiceNumber: `${plan}-${Date.now()}`,
            description: `SendItFast ${plan} Plan`,
          },
          customer: {
            email: customerEmail,
          },
          billTo: {
            email: customerEmail,
          },
          // Store metadata in user fields (part of transactionRequest)
          userFields: {
            userField: [
              { name: 'userId', value: userId },
              { name: 'plan', value: plan },
            ],
          },
        },
        hostedPaymentSettings: {
          setting: [
            {
              settingName: 'hostedPaymentButtonOptions',
              settingValue: '{"text": "Pay"}'
            },
            {
              settingName: 'hostedPaymentPaymentOptions',
              settingValue: '{"cardCodeRequired": true, "showCreditCard": true, "showBankAccount": false}'
            }
          ]
        },
      },
    };

    try {
      console.log('[Authorize.Net] Sending request to:', this.apiEndpoint);
      console.log('[Authorize.Net] Environment:', this.config.environment);
      console.log('[Authorize.Net] API Login ID:', this.config.apiLoginId ? `${this.config.apiLoginId.substring(0, 4)}...` : 'NOT SET');
      console.log('[Authorize.Net] Settings being sent:', JSON.stringify(requestBody.getHostedPaymentPageRequest.hostedPaymentSettings, null, 2));

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error('[Authorize.Net] HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Authorize.Net] Response:', JSON.stringify(data, null, 2));

      if (data.messages?.resultCode === 'Ok') {
        return {
          success: true,
          token: data.token,
          hostedPaymentPageUrl: `https://${
            this.config.environment === 'production' ? 'accept' : 'test.authorize'
          }.net/payment/payment?token=${data.token}`,
        };
      } else {
        const errorMessage = data.messages?.message?.[0]?.text || 'Failed to create hosted payment page';
        const errorCode = data.messages?.message?.[0]?.code || 'UNKNOWN';
        console.error('[Authorize.Net] API Error:', errorCode, errorMessage);
        throw new Error(`${errorMessage} (Code: ${errorCode})`);
      }
    } catch (error) {
      console.error('[Authorize.Net] API Error:', error);
      throw error;
    }
  }

  /**
   * Create a recurring subscription
   */
  async createSubscription(params: CreateSubscriptionParams) {
    const requestBody = {
      ARBCreateSubscriptionRequest: {
        merchantAuthentication: {
          name: this.config.apiLoginId,
          transactionKey: this.config.transactionKey,
        },
        subscription: {
          name: `SendItFast ${params.plan} Plan`,
          paymentSchedule: {
            interval: {
              length: params.intervalLength,
              unit: params.intervalUnit,
            },
            startDate: params.startDate,
            totalOccurrences: params.totalOccurrences,
          },
          amount: params.amount,
          order: {
            description: `SendItFast ${params.plan} Plan Subscription`,
          },
          customer: {
            email: params.customerEmail,
          },
        },
      },
    };

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.messages?.resultCode === 'Ok') {
        return {
          success: true,
          subscriptionId: data.subscriptionId,
        };
      } else {
        throw new Error(
          data.messages?.message?.[0]?.text || 'Failed to create subscription'
        );
      }
    } catch (error) {
      console.error('Authorize.Net Subscription Error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    // Implement webhook signature verification
    // This requires the webhook signature key from Authorize.Net
    const crypto = require('crypto');
    const signatureKey = process.env.AUTHORIZENET_SIGNATURE_KEY || '';
    
    const hash = crypto
      .createHmac('sha512', signatureKey)
      .update(payload)
      .digest('hex')
      .toUpperCase();

    return hash === signature.toUpperCase();
  }
}

export const authorizenet = new AuthorizeNetClient();
