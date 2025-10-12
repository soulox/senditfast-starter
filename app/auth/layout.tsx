import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main style={{ flex: 1, padding: 0 }}>{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}

