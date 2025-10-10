import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans - Affordable File Transfer | SendItFast',
  description: 'Choose the perfect file transfer plan for your needs. Free plan available. Pro and Business plans with advanced features starting at $9.99/month. Send files up to 250GB.',
  keywords: ['file transfer pricing', 'file sharing plans', 'affordable file transfer', 'business file sharing', 'send large files pricing'],
  openGraph: {
    title: 'SendItFast Pricing - Plans Starting at $9.99/month',
    description: 'Flexible pricing plans for secure file transfer. Free plan available with no credit card required.',
    url: 'https://senditfast.net/pricing',
    type: 'website',
  },
  alternates: {
    canonical: 'https://senditfast.net/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data for Pricing
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'SendItFast File Transfer Service',
    description: 'Secure file transfer service with multiple pricing tiers',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString(),
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '9.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString(),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        '@type': 'Offer',
        name: 'Business Plan',
        price: '29.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: new Date().toISOString(),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {children}
    </>
  );
}

