import Navbar from '@components/landing/Navbar';
import Hero from '@components/landing/Hero';
import Features from '@components/landing/Features';
import HowItWorks from '@components/landing/HowItWorks';
import Pricing from '@components/landing/Pricing';
import Footer from '@components/landing/Footer';
import SEOHead from '@components/shared/SEOHead';

const LandingPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "ProExpert - Система управления строительными проектами",
    "description": "Единая экосистема для строительных компаний: от учета материалов на объекте до финансовой отчетности",
    "url": "https://prohelper.pro",
    "mainEntity": {
      "@type": "Organization",
      "@id": "https://prohelper.pro/#organization",
      "name": "ProExpert",
      "url": "https://prohelper.pro",
      "description": "Ведущий поставщик SaaS решений для строительной отрасли",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Russian"
      }
    }
  };

  return (
    <>
      <SEOHead
        title="ProExpert - Система управления строительными проектами"
        description="Единая экосистема для строительных компаний: от учета материалов на объекте до финансовой отчетности. Объединяем прорабов, администраторов и владельцев в одной платформе."
        keywords="прораб, строительство, учет материалов, управление проектами, строительные работы, финансовый учет, SaaS, строительная отчетность, строительные компании"
        canonicalUrl="https://prohelper.pro/"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-to-b from-cyber-bg to-slate-900">
        <Navbar />
        <div className="pt-16">
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LandingPage; 