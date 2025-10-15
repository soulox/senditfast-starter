'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '5 GB per transfer',
      '7 days expiry',
      'Basic support',
      'Up to 10 transfers/month',
      'Standard download speed'
    ],
    plan: 'FREE',
    popular: false,
    gradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    accentColor: '#0ea5e9'
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    features: [
      '100 GB per transfer',
      '30 days expiry',
      'Priority support',
      'Email notifications',
      'Unlimited transfers',
      'Faster download speed',
      'Password protection'
    ],
    plan: 'PRO',
    popular: true,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accentColor: '#667eea'
  },
  {
    name: 'Business',
    price: '$29.99',
    period: '/month',
    features: [
      '250 GB per transfer',
      '90 days expiry',
      'Priority support',
      'Email notifications',
      'Team seats (5 users)',
      'Analytics dashboard',
      'Custom branding',
      'API access',
      'Advanced security'
    ],
    plan: 'BUSINESS',
    popular: false,
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    accentColor: '#f59e0b'
  },
];

export default function Pricing() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    // Redirect to embedded checkout page
    router.push(`/checkout?plan=${plan}`);
  };

  const handleFreePlan = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }
    
    // For free plan, just redirect to dashboard or show a message
    router.push('/dashboard');
  };

  const currentPlan = (session?.user as any)?.plan || 'FREE';

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ 
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: 12,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Choose Your Plan
          </h1>
          <p style={{ 
            fontSize: '16px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 16,
            maxWidth: 500,
            margin: '0 auto 16px'
          }}>
            Simple, transparent pricing that scales with your needs
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: 16,
            color: 'white',
            fontSize: 12,
            fontWeight: 500
          }}>
            ✨ Start with Free plan • Monthly recurring • Cancel anytime
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'stretch'
        }}>
          {plans.map((planItem, index) => {
            const isCurrentPlan = currentPlan === planItem.plan;
            const isFree = planItem.plan === 'FREE';

            return (
              <div
                key={planItem.plan}
                style={{
                  position: 'relative',
                  background: 'white',
                  borderRadius: 20,
                  padding: 0,
                  boxShadow: planItem.popular 
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  transform: planItem.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!planItem.popular) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!planItem.popular) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {/* Popular Badge */}
                {planItem.popular && (
                  <div style={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: planItem.gradient,
                    color: 'white',
                    padding: '8px 24px',
                    borderRadius: '0 0 12px 12px',
                    fontSize: 14,
                    fontWeight: 600,
                    zIndex: 10
                  }}>
                    🚀 Most Popular
                  </div>
                )}

                {/* Header */}
                <div style={{
                  background: planItem.gradient,
                  padding: '24px 20px 20px',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <h3 style={{ 
                    fontSize: '22px',
                    fontWeight: '700',
                    color: planItem.accentColor,
                    marginBottom: 6,
                    margin: '0 0 6px 0'
                  }}>
                    {planItem.name}
                  </h3>
                  
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ 
                      fontSize: '36px',
                      fontWeight: '800',
                      color: planItem.accentColor
                    }}>
                      {planItem.price}
                    </span>
                    <span style={{ 
                      color: planItem.accentColor,
                      opacity: 0.8,
                      fontSize: 16,
                      fontWeight: 500
                    }}>
                      {planItem.period}
                    </span>
                  </div>

                  {isFree && (
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: planItem.accentColor,
                      padding: '6px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      ✨ Perfect for getting started
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ padding: '20px' }}>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    margin: '0 0 20px 0' 
                  }}>
                    {planItem.features.map((feature, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 0',
                          borderBottom: idx < planItem.features.length - 1 ? '1px solid #f1f5f9' : 'none',
                          fontSize: 14,
                          color: '#475569'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: planItem.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <span style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>✓</span>
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#e2e8f0',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'not-allowed'
                      }}
                    >
                      ✓ Current Plan
                    </button>
                  ) : isFree ? (
                    <button
                      onClick={handleFreePlan}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: planItem.gradient,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                      }}
                    >
                      🚀 Start Free Forever
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(planItem.plan)}
                      disabled={loading === planItem.plan}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: planItem.gradient,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: loading === planItem.plan ? 'not-allowed' : 'pointer',
                        opacity: loading === planItem.plan ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                        }
                      }}
                    >
                      {loading === planItem.plan ? '⏳ Processing...' : '🚀 Upgrade Now'}
                    </button>
                  )}

                  {!isFree && !isCurrentPlan && (
                    <p style={{
                      textAlign: 'center',
                      fontSize: 11,
                      color: '#94a3b8',
                      marginTop: 8,
                      marginBottom: 0
                    }}>
                      Monthly subscription • Cancel anytime
                    </p>
                  )}
                  {isFree && !isCurrentPlan && (
                    <p style={{
                      textAlign: 'center',
                      fontSize: 11,
                      color: '#94a3b8',
                      marginTop: 8,
                      marginBottom: 0
                    }}>
                      No credit card required
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 40,
          color: 'rgba(255,255,255,0.8)'
        }}>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            All plans include 99.9% uptime guarantee and secure file encryption
          </p>
          <p style={{ fontSize: 13, marginBottom: 12, fontStyle: 'italic' }}>
            💳 Subscriptions are billed monthly and managed by Authorize.Net
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12 }}>🔒 SSL Encrypted</span>
            <span style={{ fontSize: 12 }}>⚡ Fast Upload</span>
            <span style={{ fontSize: 12 }}>📧 Email Support</span>
            <span style={{ fontSize: 12 }}>🔄 Cancel Anytime</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <a 
              href="/subscription" 
              style={{ 
                color: 'white', 
                textDecoration: 'underline',
                fontSize: 13,
                opacity: 0.9
              }}
            >
              Manage your subscription →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
