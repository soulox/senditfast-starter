'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
            margin: '0 0 16px 0'
          }}>
            About SendItFast
          </h1>
          <p style={{
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 32px 0'
          }}>
            Fast, secure file transfers for everyone
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'white',
              color: '#667eea',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Mission */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
            <h2 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: 16
            }}>
              Our Mission
            </h2>
          </div>
          <p style={{
            fontSize: 18,
            color: '#374151',
            lineHeight: 1.8,
            textAlign: 'center',
            maxWidth: 700,
            margin: '0 auto'
          }}>
            We believe file sharing should be <strong>simple, fast, and secure</strong>. SendItFast was built to eliminate the frustration of email attachment limits, slow upload speeds, and complicated file sharing processes. Our mission is to provide a seamless file transfer experience for individuals and businesses of all sizes.
          </p>
        </div>

        {/* Story */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 24
          }}>
            Our Story
          </h2>
          <div style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 20 }}>
              SendItFast was born out of a simple frustration: sending large files shouldn't be complicated. As creative professionals and developers, we constantly struggled with email attachment limits, slow upload speeds, and unreliable file sharing services.
            </p>
            <p style={{ marginBottom: 20 }}>
              We knew there had to be a better way. So we built SendItFast - a file transfer service that prioritizes speed, security, and simplicity. No unnecessary features, no confusing interfaces, just fast and reliable file transfers.
            </p>
            <p style={{ marginBottom: 0 }}>
              Today, SendItFast serves thousands of users worldwide, from freelance designers to enterprise teams, all trusting us with their most important files.
            </p>
          </div>
        </div>

        {/* Values */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 32,
            textAlign: 'center'
          }}>
            Our Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 24
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Speed
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                We optimize every aspect of our service for maximum speed and performance.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Security
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Your files are encrypted and protected with enterprise-grade security.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Simplicity
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                No complicated setup or learning curve. Just upload and share.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Accessibility
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                File sharing should be available to everyone, everywhere.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💚</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Reliability
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                99.9% uptime guarantee. Your files are always available when you need them.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Support
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                We're here to help. Fast, friendly support when you need it.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 32,
            textAlign: 'center'
          }}>
            SendItFast by the Numbers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#667eea',
                marginBottom: 8
              }}>
                10,000+
              </div>
              <div style={{ fontSize: 16, color: '#6b7280' }}>
                Active Users
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#667eea',
                marginBottom: 8
              }}>
                1M+
              </div>
              <div style={{ fontSize: 16, color: '#6b7280' }}>
                Files Transferred
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#667eea',
                marginBottom: 8
              }}>
                50TB+
              </div>
              <div style={{ fontSize: 16, color: '#6b7280' }}>
                Data Transferred
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#667eea',
                marginBottom: 8
              }}>
                99.9%
              </div>
              <div style={{ fontSize: 16, color: '#6b7280' }}>
                Uptime
              </div>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 40,
          marginBottom: 24,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 24
          }}>
            Built with Modern Technology
          </h2>
          <p style={{
            fontSize: 16,
            color: '#6b7280',
            lineHeight: 1.8,
            marginBottom: 24
          }}>
            SendItFast is built on cutting-edge technology to ensure the best performance, security, and reliability:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              fontSize: 14,
              color: '#374151'
            }}>
              <strong>⚡ Edge Computing:</strong> Global CDN for lightning-fast uploads and downloads
            </div>
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              fontSize: 14,
              color: '#374151'
            }}>
              <strong>🔒 Encryption:</strong> TLS/SSL encryption for all data in transit
            </div>
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              fontSize: 14,
              color: '#374151'
            }}>
              <strong>☁️ Cloud Storage:</strong> Enterprise-grade storage with 99.999% durability
            </div>
            <div style={{
              padding: 16,
              background: '#f9fafb',
              borderRadius: 8,
              fontSize: 14,
              color: '#374151'
            }}>
              <strong>🚀 Serverless:</strong> Auto-scaling infrastructure for peak performance
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 48,
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h2 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 16
          }}>
            Join Us Today
          </h2>
          <p style={{
            fontSize: 18,
            color: '#6b7280',
            marginBottom: 32,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Experience the fastest, most secure way to share files. Start with our free plan today!
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/auth/signup"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: '#f3f4f6',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
