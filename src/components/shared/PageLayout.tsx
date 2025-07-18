import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SEOHead } from './SEOHead';
import { getPageSEOData, generateOrganizationSchema } from '../../utils/seo';
import Footer from '@components/landing/Footer';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  hero?: boolean;
  seoPage?: string;
  showFooter?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  subtitle, 
  children, 
  showBackButton = true, 
  backTo = '/',
  hero = true,
  seoPage,
  showFooter = true
}) => {
  const seoData = seoPage ? getPageSEOData(seoPage) : null;
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {seoData && (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          canonicalUrl={seoData.canonicalUrl}
          structuredData={organizationSchema}
        />
      )}
      <div className="min-h-screen bg-gradient-to-b from-concrete-50 to-white">
      {hero && (
        <div className="bg-gradient-to-r from-construction-600 via-construction-500 to-safety-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
          <div className="container-custom relative z-10 py-16 md:py-24">
            {showBackButton && (
              <Link 
                to={backTo}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Вернуться назад
              </Link>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xl text-white/90">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container-custom py-16">
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
    </>
  );
};

export default PageLayout; 