import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieBanner from '@/components/marketing/CookieBanner';

interface MarketingShellProps {
  children: ReactNode;
}

const MarketingShell = ({ children }: MarketingShellProps) => {
  return (
    <div className="flex min-h-[100svh] flex-col overflow-x-hidden bg-white font-sans">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

export default MarketingShell;
