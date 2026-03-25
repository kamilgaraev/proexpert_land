import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import {
  MaturityBadge,
  SectionHeader,
  SurfaceBadges,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingCapabilityMatrix,
  marketingPaths,
  marketingSecuritySections,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';
import type { MarketingCapability } from '@/types/marketing';

const groupCapabilitiesByContour = () => {
  return marketingCapabilityMatrix.reduce<Record<string, MarketingCapability[]>>(
    (accumulator, capability) => {
      const contour = capability.businessContour;
      accumulator[contour] ??= [];
      accumulator[contour].push(capability);
      return accumulator;
    },
    {},
  );
};

const FeaturesPage = () => {
  useSEO({
    ...marketingSeo.features,
    type: 'website',
  });

  const { trackButtonClick, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_features');
  }, [trackPageView]);

  const groupedCapabilities = groupCapabilitiesByContour();

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_20%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Features"
            title="Возможности ProHelper по бизнес-контурам"
            description="Не список фич ради списка, а рабочие capability с surface-ами, зрелостью и подтверждённым местом в продукте."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom space-y-8">
          {Object.entries(groupedCapabilities).map(([contour, capabilities]) => (
            <section key={contour} className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
              <div className="max-w-3xl">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
                  {contour}
                </div>
                <h2 className="mt-4 text-3xl font-bold text-steel-950">
                  {capabilities[0]?.summary}
                </h2>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {capabilities.map((capability) => (
                  <article
                    key={capability.id}
                    className="rounded-[1.75rem] bg-concrete-50 p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-steel-950">
                        {capability.title}
                      </h3>
                      <MaturityBadge maturity={capability.maturity} />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-steel-600">
                      {capability.publicClaim}
                    </p>
                    <div className="mt-4">
                      <SurfaceBadges surfaces={capability.surfaces} />
                    </div>
                    <div className="mt-5 grid gap-3">
                      {capability.outcomes.map((outcome) => (
                        <div
                          key={outcome}
                          className="rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-steel-700 shadow-sm"
                        >
                          {outcome}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Advanced"
            title="Отдельно маркируем beta, alpha и early access"
            description="Advanced-модули показываем только как расширения к базовым контурам, а не как mass-market ready promises."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {marketingAdvancedOffers.map((offer) => (
              <article
                key={offer.id}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
                    Advanced module
                  </div>
                  <MaturityBadge maturity={offer.maturity} />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-steel-950">
                  {offer.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-steel-600">{offer.summary}</p>
                <div className="mt-4">
                  <SurfaceBadges surfaces={offer.surfaces} />
                </div>
                <div className="mt-5 text-sm font-semibold text-construction-700">
                  {offer.cta}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeader
              eyebrow="Security"
              title="Поверхности и доступ разделены архитектурно"
              description="Security-контур опирается на JWT, role definitions, response-контракты и S3-ориентированное файловое хранение."
            />
            <div className="mt-8 grid gap-4">
              {marketingSecuritySections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-steel-950">{section.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-steel-600">
                    {section.description}
                  </p>
                  <div className="mt-5 grid gap-3">
                    {section.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-steel-200 bg-steel-950 p-8 text-white">
            <SectionHeader
              eyebrow="Trust"
              title="Почему это важно для корпоративной продажи"
              description="Публичный сайт должен не только перечислять возможности, но и показывать, что платформа технически зрелая."
            />
            <div className="mt-8 space-y-4">
              {marketingTrustFacts.map((fact) => (
                <div
                  key={fact.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5"
                >
                  <div className="text-lg font-bold">{fact.title}</div>
                  <p className="mt-2 text-sm leading-7 text-white/75">{fact.text}</p>
                </div>
              ))}
            </div>

            <Link
              to={marketingPaths.security}
              onClick={() => trackButtonClick('features_to_security', 'marketing_features')}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-steel-950 transition hover:-translate-y-0.5 hover:bg-construction-100"
            >
              Открыть security-страницу
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
