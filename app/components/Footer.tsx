'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#1f2937',
      color: 'white',
      padding: '48px 20px 24px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
          marginBottom: 40
        }}>
          {/* Company */}
          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 16,
              color: 'white'
            }}>
              SendItFast
            </h3>
            <p style={{
              fontSize: 14,
              color: '#9ca3af',
              lineHeight: 1.6,
              marginBottom: 16
            }}>
              Fast, secure file transfers for everyone. Send files up to 250 GB with ease.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Product
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href="/pricing"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                Pricing
              </Link>
              <Link
                href="/use-cases"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                Use Cases
              </Link>
              <Link
                href="/api-docs"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                API Documentation
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Support
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href="/help"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                Help Center
              </Link>
              <Link
                href="/faq"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Company
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href="/about"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                About Us
              </Link>
              <Link
                href="/legal"
                style={{
                  color: '#d1d5db',
                  textDecoration: 'none',
                  fontSize: 14,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
              >
                Legal & Privacy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid #374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>
              © {new Date().getFullYear()} SendItFast. All rights reserved.
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#10b981',
              background: '#064e3b',
              padding: '4px 10px',
              borderRadius: 4,
              border: '1px solid #10b981'
            }}>
              ✓ GDPR Compliant
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link
              href="/legal"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: 13,
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              Terms
            </Link>
            <Link
              href="/legal"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: 13,
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              Privacy
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('cookieConsent');
                window.location.reload();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              🍪 Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
