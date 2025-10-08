'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Branding {
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  company_name: string | null;
}

export default function BrandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#667eea');
  const [secondaryColor, setSecondaryColor] = useState('#764ba2');
  const [customDomain, setCustomDomain] = useState('');
  const [companyName, setCompanyName] = useState('');

  const userPlan = (session?.user as any)?.plan || 'FREE';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/branding');
      return;
    }

    if (status === 'authenticated' && userPlan !== 'BUSINESS') {
      router.push('/pricing');
      return;
    }

    if (status === 'authenticated') {
      fetchBranding();
    }
  }, [status, userPlan, router]);

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/branding');
      const data = await res.json();
      if (data.success && data.branding) {
        setLogoUrl(data.branding.logo_url || '');
        setPrimaryColor(data.branding.primary_color || '#667eea');
        setSecondaryColor(data.branding.secondary_color || '#764ba2');
        setCustomDomain(data.branding.custom_domain || '');
        setCompanyName(data.branding.company_name || '');
      }
    } catch (err) {
      console.error('Failed to fetch branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          custom_domain: customDomain || null,
          company_name: companyName || null
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Branding settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save branding');
      }
    } catch (err) {
      setError('Failed to save branding');
    } finally {
      setSaving(false);
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
              🎨 Custom Branding
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              Customize the look and feel of your transfers
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{
              padding: '12px 24px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block'
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

        {/* Branding Form */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <form onSubmit={saveBranding}>
            {/* Company Name */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Logo URL */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Logo URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                URL to your company logo (recommended: 200x50px)
              </div>
            </div>

            {/* Colors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Primary Color
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: 60,
                      height: 44,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#667eea"
                    style={{
                      flex: 1,
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Secondary Color
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{
                      width: 60,
                      height: 44,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#764ba2"
                    style={{
                      flex: 1,
                      padding: 12,
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Custom Domain */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Custom Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="share.yourdomain.com"
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                Custom domain for your share links (requires DNS configuration)
              </div>
            </div>

            {/* Preview */}
            <div style={{
              padding: 20,
              background: '#f9fafb',
              borderRadius: 8,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>
                PREVIEW
              </div>
              <div style={{
                padding: 24,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                borderRadius: 8,
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  {companyName || 'Your Company'}
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  File Transfer Service
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: 16,
                background: saving ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              {saving ? '💾 Saving...' : '💾 Save Branding Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
