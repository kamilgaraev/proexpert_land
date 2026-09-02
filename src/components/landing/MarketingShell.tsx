import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieBanner from "@/components/marketing/CookieBanner";
import "@/styles/marketing.css";
import "@/styles/marketing-pages.css";
import "@/styles/marketing-pricing.css";

interface MarketingShellProps {
  children: ReactNode;
}

const MarketingShell = ({ children }: MarketingShellProps) => {
  return (
    <div className="most-marketing flex min-h-[100svh] flex-col">
      <a className="most-skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <Navbar />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

export default MarketingShell;
