import Providers from './components/Providers';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://senditfast.net'),
  title: {
    default: 'SendItFast - Send Large Files Securely & Fast | File Transfer Service',
    template: '%s | SendItFast'
  },
  description: 'Send large files up to 250GB securely with password protection, automatic expiration, and download analytics. Fast, reliable file transfer service for businesses and individuals.',
  keywords: [
    'file transfer',
    'send large files',
    'secure file sharing',
    'file transfer service',
    'large file transfer',
    'share files online',
    'password protected files',
    'file sharing',
    'cloud file transfer',
    'send files securely',
    'business file transfer',
    'encrypted file sharing'
  ],
  authors: [{ name: 'SendItFast' }],
  creator: 'SendItFast',
  publisher: 'SendItFast',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://senditfast.net',
    title: 'SendItFast - Send Large Files Securely & Fast',
    description: 'Send large files up to 250GB securely with password protection, automatic expiration, and download analytics.',
    siteName: 'SendItFast',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SendItFast - Secure File Transfer Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SendItFast - Send Large Files Securely & Fast',
    description: 'Send large files up to 250GB securely with password protection and analytics.',
    images: ['/og-image.png'],
    creator: '@senditfast',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://senditfast.net',
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: 'technology',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Providers>
          <Header />
          <main style={{ padding: 24, flex: 1 }}>{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
