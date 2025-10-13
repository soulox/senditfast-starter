'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header
      style={{
        padding: '16px 32px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ 
            fontSize: '22px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            lineHeight: '1'
          }}>
            SendItFast
          </div>
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            fontWeight: '500',
            letterSpacing: '0.5px',
            marginTop: '2px'
          }}>
            FILE TRANSFER
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {status === 'loading' ? (
          <span style={{ color: '#9ca3af', fontSize: 14 }}>Loading...</span>
        ) : session ? (
          <>
            <Link 
              href="/new" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              New Transfer
            </Link>
            <Link
              href="/dashboard"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              Dashboard
            </Link>
            {(session.user as any)?.plan === 'BUSINESS' && (
              <>
                <Link
                  href="/analytics"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
                >
                  📊 Analytics
                </Link>
                <Link
                  href="/team"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
                >
                  👥 Team
                </Link>
                <Link
                  href="/api-keys"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
                >
                  🔑 API
                </Link>
              </>
            )}
            <Link
              href="/admin"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              ⚙️ Settings
            </Link>
            <Link
              href="/pricing"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              Pricing
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingLeft: '12px',
              borderLeft: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {session.user?.email?.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ 
                  color: '#4b5563', 
                  fontSize: 14,
                  fontWeight: '500',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {session.user?.name || session.user?.email}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: (session.user as any)?.plan === 'BUSINESS' 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : (session.user as any)?.plan === 'PRO'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#e5e7eb',
                  color: (session.user as any)?.plan === 'FREE' ? '#6b7280' : 'white',
                  width: 'fit-content'
                }}>
                  {(session.user as any)?.plan || 'FREE'}
                </span>
              </div>
              <button
                onClick={() => {
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
                  signOut({ callbackUrl: baseUrl });
                }}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#667eea';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/pricing"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              Pricing
            </Link>
            <Link 
              href="/auth/signin" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
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
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

