'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSendFiles = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session) {
      e.preventDefault();
      router.push('/auth/signup');
    }
  };
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
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
        <Link
          href={session ? '/new' : '/auth/signup'}
          onClick={handleSendFiles}
          style={{
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
          }}
          title={!session ? 'Sign up to get started' : 'Start sending files'}
        >
          {session ? 'Start Sending Files →' : 'Get Started Free →'}
        </Link>
        <Link
          href={session ? '/dashboard' : '/pricing'}
          style={{
            padding: '16px 40px',
            backgroundColor: 'white',
            color: '#667eea',
            textDecoration: 'none',
            border: '2px solid #667eea',
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {session ? 'View Dashboard' : 'View Pricing'}
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
      </section>

      {/* Affordable Plans - Full Width CTA */}
      <section
        style={{
          marginTop: 48,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '48px 32px',
          borderRadius: '16px',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: 16, fontSize: 32, fontWeight: 700 }}>💰 Affordable Plans for Everyone</h2>
        <p style={{ fontSize: 18, marginBottom: 24, lineHeight: 1.6, maxWidth: 600, margin: '0 auto 24px' }}>
          Start free, upgrade as you grow. Plans from <strong>$0/month</strong> to enterprise solutions that scale with your business needs
        </p>
        <Link
          href="/pricing"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            backgroundColor: 'white',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          View Pricing Plans →
        </Link>
      </section>
    </article>
    </>
  );
}
