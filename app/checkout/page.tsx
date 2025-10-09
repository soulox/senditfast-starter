'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { signIn } from 'next-auth/react';

declare global {
  interface Window {
    Accept: any;
  }
}

function CheckoutForm() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') as 'PRO' | 'BUSINESS' | null;

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [acceptJsLoaded, setAcceptJsLoaded] = useState(false);
  const [configError, setConfigError] = useState(false);

  const hasPublicKey = process.env.NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY && 
                       process.env.NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY !== 'YOUR_PUBLIC_CLIENT_KEY_HERE';
  const hasApiLoginId = process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/pricing');
    }
    if (!plan || (plan !== 'PRO' && plan !== 'BUSINESS')) {
      router.push('/pricing');
    }
    if (!hasPublicKey || !hasApiLoginId) {
      setConfigError(true);
    }
  }, [status, plan, router, hasPublicKey, hasApiLoginId]);

  if (!plan) return null;

  const planDetails = {
    PRO: { name: 'Pro', price: '$9.99', features: ['100 GB', '30 days', 'Unlimited transfers'] },
    BUSINESS: { name: 'Business', price: '$29.99', features: ['250 GB', '90 days', 'Analytics'] }
  };

  const currentPlan = planDetails[plan];

  // If configuration is missing, show error and redirect to demo mode
  if (configError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          maxWidth: 500,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
            Payment Configuration Required
          </h1>
          <p style={{ color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
            Authorize.Net Accept.js requires a <strong>Public Client Key</strong> to process payments securely.
          </p>
          
          <div style={{
            background: '#fef3c7',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            textAlign: 'left',
            fontSize: 14,
            color: '#92400e'
          }}>
            <strong>Missing Configuration:</strong>
            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
              {!hasApiLoginId && <li>NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID</li>}
              {!hasPublicKey && <li>NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY</li>}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => router.push('/admin')}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              🎯 Use Demo Mode Instead
            </button>
            
            <button
              onClick={() => router.push('/pricing')}
              style={{
                padding: '14px 24px',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← Back to Pricing
            </button>
          </div>

          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#f9fafb',
            borderRadius: 8,
            fontSize: 12,
            color: '#6b7280',
            textAlign: 'left'
          }}>
            <strong>How to configure:</strong>
            <ol style={{ margin: '8px 0 0 20px', padding: 0, lineHeight: 1.8 }}>
              <li>Log in to Authorize.Net Sandbox</li>
              <li>Go to Account → Settings → Manage Public Client Key</li>
              <li>Copy your Public Client Key</li>
              <li>Add to .env.local and restart server</li>
            </ol>
            <div style={{ marginTop: 8 }}>
              See <strong>AUTHORIZENET_SETUP.md</strong> for details
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptJsLoaded) {
      setError('Payment system is still loading. Please wait...');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Prepare card data for Accept.js
      const authData = {
        clientKey: process.env.NEXT_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY,
        apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID
      };

      const cardData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        month: expiryMonth,
        year: expiryYear,
        cardCode: cvv
      };

      const secureData = { authData, cardData };

      // Get payment nonce from Accept.js
      window.Accept.dispatchData(secureData, async (response: any) => {
        if (response.messages.resultCode === 'Error') {
          const errorMsg = response.messages.message.map((m: any) => m.text).join(', ');
          setError(errorMsg);
          setProcessing(false);
          return;
        }

        // Payment nonce received, send to backend
        const { opaqueData } = response;

        try {
          const res = await fetch('/api/authorizenet/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan,
              opaqueData: {
                dataDescriptor: opaqueData.dataDescriptor,
                dataValue: opaqueData.dataValue
              }
            })
          });

          const data = await res.json();

          if (data.success) {
            // Show success overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
              animation: fadeIn 0.3s ease-in;
            `;
            
            const successCard = document.createElement('div');
            successCard.style.cssText = `
              background: white;
              padding: 48px;
              border-radius: 20px;
              box-shadow: 0 25px 80px rgba(0,0,0,0.4);
              text-align: center;
              max-width: 450px;
              animation: slideUp 0.5s ease-out;
            `;
            
            successCard.innerHTML = `
              <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 0.6s ease-in-out;">🎉</div>
              <h2 style="font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">
                Welcome to ${plan}!
              </h2>
              <p style="color: #6b7280; font-size: 16px; margin-bottom: 28px; line-height: 1.6;">
                Your payment was successful. You now have access to all ${plan} features!
              </p>
              <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 16px;">
                <div style="width: 0%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); animation: progress 2s ease-in-out forwards;"></div>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Redirecting to your dashboard...
              </p>
              <style>
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes slideUp {
                  from { transform: translateY(30px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                @keyframes bounce {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.2); }
                }
                @keyframes progress {
                  to { width: 100%; }
                }
              </style>
            `;
            
            overlay.appendChild(successCard);
            document.body.appendChild(overlay);
            
            // Update session to reflect new plan
            await update();
            
            // Redirect after animation
            setTimeout(() => {
              window.location.href = '/dashboard?upgraded=true';
            }, 2200);
          } else {
            setError(data.error || 'Payment failed');
            setProcessing(false);
          }
        } catch (err) {
          setError('Failed to process payment');
          setProcessing(false);
        }
      });
    } catch (err) {
      setError('Failed to process payment');
      setProcessing(false);
    }
  };

  return (
    <>
      <Script
        src={`https://${process.env.NEXT_PUBLIC_AUTHORIZENET_ENVIRONMENT === 'production' ? '' : 'js'}test.authorize.net/v1/Accept.js`}
        onLoad={() => setAcceptJsLoaded(true)}
        strategy="afterInteractive"
      />

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: 500, width: '100%' }}>
          {/* Plan Summary Card */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0' }}>
                Upgrade to {currentPlan.name}
              </h1>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#667eea', marginBottom: 8 }}>
                {currentPlan.price}<span style={{ fontSize: 18, fontWeight: 500 }}>/month</span>
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                {currentPlan.features.join(' • ')}
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14,
                border: '1px solid #fecaca'
              }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Card Number */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                    setCardNumber(formatted);
                  }}
                  placeholder="4111 1111 1111 1111"
                  maxLength={19}
                  required
                  disabled={processing}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Expiry and CVV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Month
                  </label>
                  <input
                    type="text"
                    value={expiryMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setExpiryMonth(value);
                    }}
                    placeholder="MM"
                    maxLength={2}
                    required
                    disabled={processing}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Year
                  </label>
                  <input
                    type="text"
                    value={expiryYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setExpiryYear(value);
                    }}
                    placeholder="YYYY"
                    maxLength={4}
                    required
                    disabled={processing}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setCvv(value);
                    }}
                    placeholder="123"
                    maxLength={4}
                    required
                    disabled={processing}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing || !acceptJsLoaded}
                style={{
                  width: '100%',
                  padding: 16,
                  background: processing || !acceptJsLoaded 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: processing || !acceptJsLoaded ? 'not-allowed' : 'pointer',
                  marginBottom: 16,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                {processing ? '⏳ Processing Payment...' : !acceptJsLoaded ? 'Loading...' : `💳 Pay ${currentPlan.price}`}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => router.push('/pricing')}
                disabled={processing}
                style={{
                  width: '100%',
                  padding: 16,
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </form>

            {/* Security Badge */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                🔒 Secure payment powered by Authorize.Net
              </div>
              <div style={{ fontSize: 11, color: '#9ca3b8' }}>
                Your card details are encrypted and never stored on our servers
              </div>
            </div>

            {/* Test Card Info (only in sandbox) */}
            {process.env.NEXT_PUBLIC_AUTHORIZENET_ENVIRONMENT === 'sandbox' && (
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#fef3c7',
                borderRadius: 8,
                fontSize: 12,
                color: '#92400e'
              }}>
                <strong>Test Mode:</strong> Use card 4111 1111 1111 1111, any future date, any CVV
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}
