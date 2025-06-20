import Navbar from '@components/landing/Navbar';
import Hero from '@components/landing/Hero';
import Features from '@components/landing/Features';
import HowItWorks from '@components/landing/HowItWorks';
import Pricing from '@components/landing/Pricing';
import Footer from '@components/landing/Footer';

const LandingPage = () => {
  return (
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
  );
};

export default LandingPage; 