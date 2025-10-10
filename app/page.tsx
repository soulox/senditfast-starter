import Link from 'next/link';

export default function Home() {
  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SendItFast',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    description: 'Send large files up to 250GB securely with password protection, automatic expiration, and download analytics.',
    url: 'https://senditfast.net',
    image: 'https://senditfast.net/og-image.png',
    creator: {
      '@type': 'Organization',
      name: 'SendItFast',
      url: 'https://senditfast.net',
    },
    featureList: [
      'Secure file transfer',
      'Password protection',
      'Automatic expiration',
      'Download analytics',
      'Large file support up to 250GB',
      'Multipart uploads',
    ],
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SendItFast',
    url: 'https://senditfast.net',
    logo: 'https://senditfast.net/logo.png',
    description: 'Fast, secure file transfers for everyone',
    sameAs: [
      'https://twitter.com/senditfast',
      'https://www.linkedin.com/company/senditfast',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@senditfast.net',
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      
      <article style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
      <header>
        <h1 style={{ fontSize: 48, marginBottom: 16, fontWeight: 700 }}>
          Send Large Files Securely — Fast & Easy
        </h1>
        <p style={{ fontSize: 20, color: '#666', marginBottom: 32 }}>
          Secure file transfer service with password protection, automatic expiration, and real-time analytics. Send files up to 250GB instantly.
        </p>
      </header>
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

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
          textAlign: 'left',
          marginTop: 60,
        }}
        aria-label="Key Features"
      >
        <article>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>🔒 Secure File Transfer</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            Enterprise-grade security with password-protected transfers and automatic expiration for sensitive data
          </p>
        </article>
        <article>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>⚡ Lightning Fast</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            Optimized multipart uploads and CDN delivery for large files up to 250GB
          </p>
        </article>
        <article>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>📊 Real-Time Analytics</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            Track downloads, monitor recipient engagement, and view detailed transfer statistics
          </p>
        </article>
        <article>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>💰 Affordable Plans</h2>
          <p style={{ color: '#666', fontSize: 14 }}>
            <Link href="/pricing" style={{ color: '#0070f3' }}>
              Flexible pricing plans
            </Link>{' '}
            that scale with your business needs
          </p>
        </article>
      </section>
    </article>
    </>
  );
}
