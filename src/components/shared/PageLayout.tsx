import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
  showFooter = false,
}) => {
  const seoData = seoPage ? getPageSEOData(seoPage) : null;
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {seoData ? (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          canonicalUrl={seoData.canonicalUrl}
          structuredData={organizationSchema}
        />
      ) : null}

      <div className="marketing-page-shell min-h-screen">
        {hero ? (
          <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.16),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
            <div className="container-custom py-12 sm:py-14 lg:py-20">
              {showBackButton ? (
                <Link
                  to={backTo}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-steel-500 transition-colors hover:text-construction-700"
                >
                  <ArrowLeftIcon className="h-5 w-5 transition-transform hover:-translate-x-1" />
                  Вернуться назад
                </Link>
              ) : null}

              <div className="mt-5 max-w-4xl">
                <div className="inline-flex items-center rounded-full border border-construction-200 bg-construction-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-construction-700">
                  ProHelper
                </div>
                <h1 className="mt-4 font-sans text-[clamp(2rem,5.4vw,4.1rem)] font-bold leading-[0.98] tracking-tight text-steel-950">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-5 max-w-3xl text-base leading-7 text-steel-600 sm:text-lg sm:leading-8">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <div className="container-custom py-12 sm:py-14 lg:py-16">{children}</div>
        {showFooter ? <Footer /> : null}
      </div>
    </>
  );
};

export default PageLayout;
