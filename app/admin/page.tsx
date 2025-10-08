'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CleanupStats {
  expiredCount: number;
  totalSizeMB: number;
  oldestExpired: string | null;
}

interface CleanupResult {
  processed: number;
  deleted: number;
  errors: string[];
  timestamp: string;
}

export default function AdminPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [changingPlan, setChangingPlan] = useState(false);
  const [planChangeSuccess, setPlanChangeSuccess] = useState<string>('');

  if (status === 'loading') {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!session?.user) {
    router.push('/auth/signin?callbackUrl=/admin');
    return null;
  }

  const fetchStats = async () => {
    try {
      setError('');
      const response = await fetch('/api/admin/cleanup');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (error) {
      setError('Failed to fetch cleanup statistics');
    }
  };

  const runCleanup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setCleanupResult(data.result);
        // Refresh stats after cleanup
        await fetchStats();
      } else {
        setError(data.error || 'Failed to run cleanup');
      }
    } catch (error) {
      setError('Failed to run cleanup');
    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (newPlan: 'FREE' | 'PRO' | 'BUSINESS') => {
    setChangingPlan(true);
    setError('');
    setPlanChangeSuccess('');
    
    try {
      const response = await fetch('/api/admin/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      const data = await response.json();
      
      if (data.success) {
        setPlanChangeSuccess(`Plan changed to ${newPlan}! Updating...`);
        
        // Update the session to reflect the new plan
        await update();
        
        // Show success message briefly then reload
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setError(data.error || 'Failed to change plan');
      }
    } catch (error) {
      setError('Failed to change plan');
    } finally {
      setChangingPlan(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: 32,
        borderRadius: 16,
        marginBottom: 32,
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          ⚙️ Account Settings
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Manage your profile and subscription
        </p>
      </div>

      {/* User Profile Section */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>👤 Profile Information</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 32,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            {session.user?.email?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              {session.user?.name || 'User'}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
              {session.user?.email}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 6,
                background: (session.user as any)?.plan === 'BUSINESS' 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : (session.user as any)?.plan === 'PRO'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#e5e7eb',
                color: (session.user as any)?.plan === 'FREE' ? '#6b7280' : 'white'
              }}>
                {(session.user as any)?.plan || 'FREE'} PLAN
              </span>
              {(session.user as any)?.plan === 'BUSINESS' && (
                <span style={{ fontSize: 20 }}>👑</span>
              )}
              {(session.user as any)?.plan === 'PRO' && (
                <span style={{ fontSize: 20 }}>⚡</span>
              )}
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          padding: 20,
          background: '#f9fafb',
          borderRadius: 8
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
              Member Since
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
              Status
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>
              Active
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
              Account Type
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
              {(session.user as any)?.plan === 'FREE' ? 'Free' : 'Premium'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          border: '1px solid #fecaca'
        }}>
          ❌ {error}
        </div>
      )}

      {planChangeSuccess && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          border: '1px solid #6ee7b7'
        }}>
          ✅ {planChangeSuccess}
        </div>
      )}

      {/* Plan Changer */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>👤 Your Plan & Features</h2>

        {/* Current Plan Display */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '2px solid #0ea5e9',
          borderRadius: 10,
          padding: 20,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 600, marginBottom: 4 }}>CURRENT PLAN</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0c4a6e' }}>
                {(session.user as any)?.plan || 'FREE'}
              </div>
            </div>
            {(session.user as any)?.plan === 'BUSINESS' && (
              <div style={{ fontSize: 32 }}>👑</div>
            )}
            {(session.user as any)?.plan === 'PRO' && (
              <div style={{ fontSize: 32 }}>⚡</div>
            )}
            {!(session.user as any)?.plan || (session.user as any)?.plan === 'FREE' ? (
              <div style={{ fontSize: 32 }}>🆓</div>
            ) : null}
          </div>

          {/* Plan Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#0369a1', marginBottom: 4 }}>Max Size</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0c4a6e' }}>
                {(session.user as any)?.plan === 'BUSINESS' ? '250 GB' : 
                 (session.user as any)?.plan === 'PRO' ? '100 GB' : '10 GB'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#0369a1', marginBottom: 4 }}>Expiry</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0c4a6e' }}>
                {(session.user as any)?.plan === 'BUSINESS' ? '90 days' : 
                 (session.user as any)?.plan === 'PRO' ? '30 days' : '7 days'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#0369a1', marginBottom: 4 }}>Transfers</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0c4a6e' }}>
                {(session.user as any)?.plan === 'FREE' ? '5/month' : 'Unlimited'}
              </div>
            </div>
          </div>

          {/* Premium Features */}
          {(session.user as any)?.plan !== 'FREE' && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #bae6fd' }}>
              <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 600, marginBottom: 8 }}>UNLOCKED FEATURES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(session.user as any)?.plan === 'PRO' || (session.user as any)?.plan === 'BUSINESS' ? (
                  <>
                    <span style={{ fontSize: 12, background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      🔒 Password Protection
                    </span>
                    <span style={{ fontSize: 12, background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      ⏰ Extended Expiry
                    </span>
                    <span style={{ fontSize: 12, background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      📧 Email Notifications
                    </span>
                  </>
                ) : null}
                {(session.user as any)?.plan === 'BUSINESS' && (
                  <>
                    <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      📊 Analytics Dashboard
                    </span>
                    <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      👥 Team Management (5 seats)
                    </span>
                    <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      🔑 API Access
                    </span>
                    <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      🎨 Custom Branding
                    </span>
                    <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 4, fontWeight: 500 }}>
                      🛡️ Audit Logs
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Only show FREE option if user is currently on FREE plan */}
          {(session.user as any)?.plan === 'FREE' && (
            <button
              onClick={() => changePlan('FREE')}
              disabled={true}
              style={{
                padding: '10px 20px',
                background: '#e5e7eb',
                color: '#6b7280',
                border: '2px solid #0ea5e9',
                borderRadius: 8,
                cursor: 'not-allowed',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              ✓ Current
            </button>
          )}

          <button
            onClick={() => changePlan('PRO')}
            disabled={changingPlan || (session.user as any)?.plan === 'PRO'}
            style={{
              padding: '10px 20px',
              background: (session.user as any)?.plan === 'PRO' ? '#e5e7eb' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: changingPlan || (session.user as any)?.plan === 'PRO' ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {(session.user as any)?.plan === 'PRO' ? '✓ Current' : 'Switch to PRO'}
          </button>

          <button
            onClick={() => changePlan('BUSINESS')}
            disabled={changingPlan || (session.user as any)?.plan === 'BUSINESS'}
            style={{
              padding: '10px 20px',
              background: (session.user as any)?.plan === 'BUSINESS' ? '#e5e7eb' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              color: (session.user as any)?.plan === 'BUSINESS' ? '#6b7280' : '#78350f',
              border: (session.user as any)?.plan === 'BUSINESS' ? 'none' : '2px solid #f59e0b',
              borderRadius: 8,
              cursor: changingPlan || (session.user as any)?.plan === 'BUSINESS' ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 700,
              textShadow: 'none'
            }}
          >
            {(session.user as any)?.plan === 'BUSINESS' ? '✓ Current' : 'Upgrade to Business'}
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
          💡 Quickly switch between plans to access different features and limits.
        </div>
      </div>

      {/* Business Features Quick Links */}
      {(session.user as any)?.plan === 'BUSINESS' && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>👑 Business Features</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Link
              href="/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '2px solid #0ea5e9',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 28 }}>📊</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>Analytics</div>
                <div style={{ fontSize: 11, color: '#0369a1' }}>View insights</div>
              </div>
            </Link>

            <Link
              href="/team"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #10b981',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 28 }}>👥</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#064e3b' }}>Team</div>
                <div style={{ fontSize: 11, color: '#065f46' }}>Manage members</div>
              </div>
            </Link>

            <Link
              href="/api-keys"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #f59e0b',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 28 }}>🔑</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#78350f' }}>API Keys</div>
                <div style={{ fontSize: 11, color: '#92400e' }}>Manage access</div>
              </div>
            </Link>

            <Link
              href="/branding"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                border: '2px solid #ec4899',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 28 }}>🎨</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#831843' }}>Branding</div>
                <div style={{ fontSize: 11, color: '#9f1239' }}>Customize look</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Security & Privacy */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>🔒 Security & Privacy</h2>
        
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
          Manage two-factor authentication, privacy settings, and GDPR rights.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/security"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            🔐 Two-Factor Auth
          </Link>
          <Link
            href="/privacy"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            🔒 Privacy & Data
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
