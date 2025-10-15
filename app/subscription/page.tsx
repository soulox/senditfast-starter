'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SubscriptionInfo {
  plan: string;
  subscriptionId: string | null;
  status: string | null;
  startedAt: string | null;
  hasActiveSubscription: boolean;
  details?: any;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/authorizenet/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the FREE plan.')) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const response = await fetch('/api/authorizenet/subscription', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Subscription cancelled successfully. You have been downgraded to the FREE plan.');
        fetchSubscription(); // Refresh subscription info
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', background: '#f9fafb', padding: '0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '32px' }}>
            <h1 style={{ 
              fontSize: '32px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '8px'
            }}>
              💳 Subscription Management
            </h1>
            <p style={{ 
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '32px'
            }}>
              Manage your SendItFast subscription and billing
            </p>

            {error && (
              <div style={{ 
                marginBottom: '24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ color: '#991b1b', fontSize: '14px' }}>{error}</p>
              </div>
            )}

            {subscription && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Current Plan */}
                <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                  <h2 style={{ 
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px'
                  }}>
                    Current Plan
                  </h2>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <p style={{ 
                          fontSize: '28px',
                          fontWeight: '800',
                          color: '#1e3a8a'
                        }}>
                          {subscription.plan}
                        </p>
                        {subscription.hasActiveSubscription && (
                          <p style={{ 
                            fontSize: '14px',
                            color: '#1e40af',
                            marginTop: '4px'
                          }}>
                            🔄 Monthly recurring subscription
                          </p>
                        )}
                      </div>
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: subscription.status === 'active' 
                            ? '#dcfce7'
                            : subscription.status === 'cancelled'
                            ? '#f3f4f6'
                            : subscription.status === 'suspended'
                            ? '#fef3c7'
                            : '#f3f4f6',
                          color: subscription.status === 'active'
                            ? '#166534'
                            : subscription.status === 'cancelled'
                            ? '#4b5563'
                            : subscription.status === 'suspended'
                            ? '#92400e'
                            : '#4b5563'
                        }}>
                          {subscription.status === 'active' && '✓ '}
                          {subscription.status?.toUpperCase() || 'NO SUBSCRIPTION'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Details */}
                {subscription.hasActiveSubscription && (
                  <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '24px' }}>
                    <h2 style={{ 
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Subscription Details
                    </h2>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '20px'
                    }}>
                      {subscription.subscriptionId && (
                        <div style={{ 
                          background: '#f9fafb',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#6b7280',
                            marginBottom: '4px'
                          }}>
                            📋 Subscription ID
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            color: '#111827',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all'
                          }}>
                            {subscription.subscriptionId}
                          </div>
                        </div>
                      )}
                      {subscription.startedAt && (
                        <div style={{ 
                          background: '#f9fafb',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#6b7280',
                            marginBottom: '4px'
                          }}>
                            📅 Started On
                          </div>
                          <div style={{ 
                            fontSize: '14px',
                            color: '#111827',
                            fontWeight: '500'
                          }}>
                            {new Date(subscription.startedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}
                      <div style={{ 
                        background: '#f9fafb',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ 
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          🔄 Billing Cycle
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#111827',
                          fontWeight: '500'
                        }}>
                          Monthly
                        </div>
                      </div>
                      <div style={{ 
                        background: '#f9fafb',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ 
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          💰 Amount
                        </div>
                        <div style={{ 
                          fontSize: '18px',
                          color: '#111827',
                          fontWeight: '700'
                        }}>
                          ${subscription.plan === 'PRO' ? '9.99' : subscription.plan === 'BUSINESS' ? '29.99' : '0'}/mo
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div>
                  <h2 style={{ 
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '16px'
                  }}>
                    Actions
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {subscription.hasActiveSubscription ? (
                      <div style={{ 
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                          style={{
                            background: cancelling ? '#fca5a5' : '#dc2626',
                            color: 'white',
                            fontWeight: '600',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: cancelling ? 'not-allowed' : 'pointer',
                            fontSize: '15px',
                            transition: 'all 0.2s',
                            opacity: cancelling ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!cancelling) e.currentTarget.style.background = '#b91c1c';
                          }}
                          onMouseLeave={(e) => {
                            if (!cancelling) e.currentTarget.style.background = '#dc2626';
                          }}
                        >
                          {cancelling ? '⏳ Cancelling...' : '❌ Cancel Subscription'}
                        </button>
                        <p style={{ 
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#991b1b',
                          lineHeight: '1.5'
                        }}>
                          ⚠️ Cancelling will immediately downgrade you to the FREE plan and stop all future billing.
                        </p>
                      </div>
                    ) : (
                      <div style={{ 
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '20px'
                      }}>
                        <button
                          onClick={() => router.push('/pricing')}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '600',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '15px',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 8px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
                          }}
                        >
                          🚀 Upgrade Plan
                        </button>
                        <p style={{ 
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#1e40af',
                          lineHeight: '1.5'
                        }}>
                          {subscription.plan === 'FREE' 
                            ? '✨ Upgrade to PRO or BUSINESS to unlock more features and higher limits'
                            : '💡 Subscribe to continue enjoying premium features'}
                        </p>
                      </div>
                    )}

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => router.push('/dashboard')}
                        style={{
                          color: '#667eea',
                          background: 'none',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '8px 0',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
                      >
                        ← Back to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Plan Features Comparison */}
        <div style={{ 
          marginTop: '32px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '32px'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            📊 Plan Features Comparison
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '8px',
              padding: '20px',
              border: '2px solid #bfdbfe'
            }}>
              <h3 style={{ 
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '12px',
                color: '#0ea5e9'
              }}>
                FREE
              </h3>
              <ul style={{ 
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '2',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li>✓ 100 MB max file size</li>
                <li>✓ 5 transfers/month</li>
                <li>✓ 7 day expiry</li>
                <li>✓ Basic support</li>
              </ul>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
              borderRadius: '8px',
              padding: '20px',
              border: '2px solid #a78bfa'
            }}>
              <h3 style={{ 
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '12px',
                color: '#7c3aed'
              }}>
                PRO - $9.99/mo
              </h3>
              <ul style={{ 
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '2',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li>✓ 2 GB max file size</li>
                <li>✓ 50 transfers/month</li>
                <li>✓ 30 day expiry</li>
                <li>✓ Password protection</li>
                <li>✓ Email notifications</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '8px',
              padding: '20px',
              border: '2px solid #fbbf24'
            }}>
              <h3 style={{ 
                fontWeight: '700',
                fontSize: '18px',
                marginBottom: '12px',
                color: '#f59e0b'
              }}>
                BUSINESS - $29.99/mo
              </h3>
              <ul style={{ 
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '2',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li>✓ 10 GB max file size</li>
                <li>✓ Unlimited transfers</li>
                <li>✓ 90 day expiry</li>
                <li>✓ Password protection</li>
                <li>✓ Email notifications</li>
                <li>✓ Advanced analytics</li>
                <li>✓ API access</li>
                <li>✓ Team collaboration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

