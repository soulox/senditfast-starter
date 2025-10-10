import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Learn About SendItFast File Transfer',
  description: 'Learn about SendItFast, our mission to simplify file sharing, and how we help 10,000+ users transfer files securely. Built with speed, security, and simplicity in mind.',
  keywords: ['about senditfast', 'file transfer company', 'secure file sharing team', 'file transfer mission', 'about us'],
  openGraph: {
    title: 'About SendItFast - Fast, Secure File Transfers',
    description: 'Learn about our mission to make file sharing simple, fast, and secure for everyone.',
    url: 'https://senditfast.net/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://senditfast.net/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data for About Page
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About SendItFast',
    description: 'Learn about SendItFast file transfer service',
    mainEntity: {
      '@type': 'Organization',
      name: 'SendItFast',
      description: 'Fast, secure file transfers for everyone',
      foundingDate: '2024',
      url: 'https://senditfast.net',
      slogan: 'Fast, secure file transfers for everyone',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: '10+',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      {children}
    </>
  );
}

