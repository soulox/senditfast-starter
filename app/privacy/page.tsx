'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/privacy');
    }
  }, [status, router]);

  const exportData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/privacy/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `senditfast-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Your data has been exported successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to export data');
      }
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete your account and all associated data including:\n\n' +
      '• All your transfers and files\n' +
      '• Your account information\n' +
      '• Team memberships\n' +
      '• API keys\n' +
      '• All settings and preferences\n\n' +
      'This action CANNOT be undone. Are you absolutely sure?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your last chance. Type DELETE in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const typed = prompt('Type DELETE to confirm account deletion:');
    if (typed !== 'DELETE') {
      alert('Account deletion cancelled. You must type DELETE exactly.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/privacy/delete-account', {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        alert('Your account has been deleted. You will now be signed out.');
        window.location.href = '/';
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ fontSize: 18, color: 'white', fontWeight: 500 }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '0 0 8px 0' }}>
              🔒 Privacy & Data Management
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              Manage your data and privacy settings (GDPR Compliant)
            </p>
          </div>
          <Link
            href="/admin"
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#667eea',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            ← Back
          </Link>
        </div>

        {/* Messages */}
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

        {success && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid #6ee7b7'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Your Rights */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            Your GDPR Rights
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Under the General Data Protection Regulation (GDPR), you have the following rights regarding your personal data:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 24 }}>✅</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Right to Access
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  You can request a copy of all personal data we hold about you.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 24 }}>✏️</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Right to Rectification
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  You can update or correct inaccurate personal information.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 24 }}>🗑️</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Right to Erasure
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  You can request deletion of your personal data ("right to be forgotten").
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 24 }}>📦</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Right to Data Portability
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  You can export your data in a machine-readable format.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8
            }}>
              <div style={{ fontSize: 24 }}>🚫</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Right to Object
                </h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  You can object to processing of your personal data for marketing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
            📥 Export Your Data
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
            Download a copy of all your personal data in JSON format. This includes your account information, transfers, and activity logs.
          </p>
          <button
            onClick={exportData}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            {loading ? '⏳ Exporting...' : '📥 Export My Data'}
          </button>
        </div>

        {/* Cookie Preferences */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
            🍪 Cookie Preferences
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
            Manage your cookie preferences and consent settings. You can change these at any time.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('cookieConsent');
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🍪 Update Cookie Preferences
          </button>
        </div>

        {/* Delete Account */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #fee2e2'
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginBottom: 12 }}>
            ⚠️ Delete Account
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          <div style={{
            background: '#fef3c7',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
              ⚠️ This will permanently delete:
            </p>
            <ul style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
              <li>Your account and profile</li>
              <li>All transfers and files</li>
              <li>Team memberships and invitations</li>
              <li>API keys and access tokens</li>
              <li>Analytics and activity logs</li>
              <li>Custom branding settings</li>
            </ul>
          </div>

          <button
            onClick={deleteAccount}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Processing...' : '🗑️ Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
