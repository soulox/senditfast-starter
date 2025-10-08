'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function SecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/security');
      return;
    }

    if (status === 'authenticated') {
      fetch2FAStatus();
    }
  }, [status, router]);

  const fetch2FAStatus = async () => {
    try {
      const res = await fetch('/api/security/2fa/status');
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(data.enabled);
      }
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/security/2fa/setup', {
        method: 'POST'
      });

      const data = await res.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setShowSetup(true);
      } else {
        setError(data.error || 'Failed to setup 2FA');
      }
    } catch (err) {
      setError('Failed to setup 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Two-factor authentication enabled successfully!');
        setTwoFactorEnabled(true);
        setShowSetup(false);
        setQrCode(null);
        setSecret(null);
        setVerificationCode('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setProcessing(false);
    }
  };

  const disable2FA = async () => {
    const confirmed = confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.');
    if (!confirmed) return;

    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/security/2fa/disable', {
        method: 'POST'
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Two-factor authentication disabled');
        setTwoFactorEnabled(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
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
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: '0 0 8px 0' }}>
              🔐 Security Settings
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              Manage two-factor authentication and security options
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

        {/* 2FA Status Card */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: twoFactorEnabled ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32
            }}>
              {twoFactorEnabled ? '✅' : '⚠️'}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: '0 0 6px 0' }}>
                Two-Factor Authentication
              </h2>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: twoFactorEnabled ? '#065f46' : '#92400e',
                background: twoFactorEnabled ? '#d1fae5' : '#fef3c7',
                padding: '4px 12px',
                borderRadius: 4,
                display: 'inline-block'
              }}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your authenticator app in addition to your password.
          </p>

          {!twoFactorEnabled ? (
            <button
              onClick={setup2FA}
              disabled={processing}
              style={{
                padding: '14px 28px',
                background: processing ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: processing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              {processing ? '⏳ Setting up...' : '🔐 Enable 2FA'}
            </button>
          ) : (
            <button
              onClick={disable2FA}
              disabled={processing}
              style={{
                padding: '14px 28px',
                background: processing ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? '⏳ Processing...' : '🔓 Disable 2FA'}
            </button>
          )}
        </div>

        {/* Info Card */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1f2937', marginBottom: 16 }}>
            How It Works
          </h3>
          <ol style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Click "Enable 2FA" and scan the QR code with your app</li>
            <li>Enter the 6-digit code from your app to verify</li>
            <li>From now on, you'll need your password + code to sign in</li>
          </ol>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup && qrCode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
          onClick={() => !processing && setShowSetup(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'slideUp 0.3s ease-out',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 12
            }}>
              🔐 Set Up 2FA
            </h2>

            <p style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 24
            }}>
              Scan this QR code with your authenticator app
            </p>

            {/* QR Code */}
            <div style={{
              padding: 20,
              background: 'white',
              borderRadius: 12,
              display: 'inline-block',
              marginBottom: 20,
              border: '2px solid #e5e7eb'
            }}>
              <QRCodeSVG
                value={qrCode}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Manual Entry */}
            <div style={{
              background: '#f9fafb',
              padding: 16,
              borderRadius: 8,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                Or enter this code manually:
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1f2937',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {secret}
              </div>
            </div>

            {/* Verification Input */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
                textAlign: 'left'
              }}>
                Enter 6-digit code from your app
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: 16,
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 24,
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSetup(false)}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={verify2FA}
                disabled={processing || verificationCode.length !== 6}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: processing || verificationCode.length !== 6 ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: processing || verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                {processing ? '⏳ Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
