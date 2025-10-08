import Link from 'next/link';

export default function Home() {
  return (
    <section style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, marginBottom: 16, fontWeight: 700 }}>
        Send large files securely — fast.
      </h1>
      <p style={{ fontSize: 20, color: '#666', marginBottom: 32 }}>
        Simple file transfers with expiry, passwords, and analytics.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
        <Link
          href="/new"
          style={{
            padding: '14px 32px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 6,
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          Send Files →
        </Link>
        <Link
          href="/dashboard"
          style={{
            padding: '14px 32px',
            backgroundColor: 'white',
            color: '#0070f3',
            textDecoration: 'none',
            border: '2px solid #0070f3',
            borderRadius: 6,
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          Dashboard
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
          textAlign: 'left',
          marginTop: 60,
        }}
      >
        <div>
          <h3 style={{ marginBottom: 8 }}>🔒 Secure</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Password-protected transfers with automatic expiration
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: 8 }}>⚡ Fast</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Optimized multipart uploads for large files
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: 8 }}>📊 Analytics</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            Track downloads and recipient engagement
          </p>
        </div>
        <div>
          <h3 style={{ marginBottom: 8 }}>💰 Affordable</h3>
          <p style={{ color: '#666', fontSize: 14 }}>
            <Link href="/pricing" style={{ color: '#0070f3' }}>
              Simple pricing
            </Link>{' '}
            that scales with you
          </p>
        </div>
      </div>
    </section>
  );
}
