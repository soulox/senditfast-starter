'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ApiDocsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userPlan = (session?.user as any)?.plan || 'FREE';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/api-docs');
    }
    if (status === 'authenticated' && userPlan !== 'BUSINESS') {
      router.push('/pricing');
    }
  }, [status, userPlan, router]);

  if (status === 'loading' || userPlan !== 'BUSINESS') {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', margin: 0 }}>
            📚 API Documentation
          </h1>
          <Link
            href="/api-keys"
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
            ← Back to API Keys
          </Link>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Authentication */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
              🔐 Authentication
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              All API requests must include your API key in the <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>Authorization</code> header:
            </p>
            <pre style={{
              background: '#1f2937',
              color: '#10b981',
              padding: 20,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 13,
              fontFamily: 'monospace'
            }}>
{`Authorization: Bearer sif_live_your_api_key_here`}
            </pre>
          </section>

          {/* Create Transfer */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
              📤 Create Transfer
            </h2>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
              <strong>POST</strong> <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>/api/v1/transfers</code>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              Create a new file transfer and get upload URLs.
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Request Body:</div>
              <pre style={{
                background: '#1f2937',
                color: '#e5e7eb',
                padding: 20,
                borderRadius: 8,
                overflow: 'auto',
                fontSize: 12,
                fontFamily: 'monospace'
              }}>
{`{
  "files": [
    {
      "name": "document.pdf",
      "size": 1024000,
      "contentType": "application/pdf"
    }
  ],
  "password": "optional-password",
  "expiryDays": 30
}`}
              </pre>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Response:</div>
              <pre style={{
                background: '#1f2937',
                color: '#e5e7eb',
                padding: 20,
                borderRadius: 8,
                overflow: 'auto',
                fontSize: 12,
                fontFamily: 'monospace'
              }}>
{`{
  "success": true,
  "transfer": {
    "id": "uuid",
    "slug": "abc123",
    "shareUrl": "${baseUrl}/share/abc123",
    "expiresAt": "2025-11-08T00:00:00Z"
  },
  "uploadUrls": [
    {
      "fileId": "uuid",
      "uploadUrl": "https://...",
      "fileName": "document.pdf"
    }
  ]
}`}
              </pre>
            </div>
          </section>

          {/* Get Transfer */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
              📥 Get Transfer
            </h2>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
              <strong>GET</strong> <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>/api/v1/transfers/:slug</code>
            </div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
              Get transfer details and download URLs.
            </p>
            
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Response:</div>
              <pre style={{
                background: '#1f2937',
                color: '#e5e7eb',
                padding: 20,
                borderRadius: 8,
                overflow: 'auto',
                fontSize: 12,
                fontFamily: 'monospace'
              }}>
{`{
  "success": true,
  "transfer": {
    "id": "uuid",
    "slug": "abc123",
    "totalSize": 1024000,
    "expiresAt": "2025-11-08T00:00:00Z",
    "files": [
      {
        "id": "uuid",
        "name": "document.pdf",
        "size": 1024000,
        "downloadUrl": "https://..."
      }
    ]
  }
}`}
              </pre>
            </div>
          </section>

          {/* Rate Limits */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
              ⚡ Rate Limits
            </h2>
            <div style={{
              background: '#f9fafb',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
                <strong>Business Plan:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#6b7280' }}>
                <li>1000 requests per hour</li>
                <li>250 GB per transfer</li>
                <li>Unlimited transfers</li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>
              💬 Support
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Need help? Contact our support team or check out more examples in our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
