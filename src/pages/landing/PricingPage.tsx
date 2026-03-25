import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import {
  MaturityBadge,
  PackageIcon,
  SectionHeader,
  SurfaceBadges,
  formatPackageTierPrice,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';
import { generatePricingSchema } from '@/utils/seo';

const PricingPage = () => {
  useSEO({
    ...marketingSeo.pricing,
    type: 'website',
    structuredData: generatePricingSchema(),
  });

  const { trackButtonClick, trackPageView, trackPricingView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_pricing');
    trackPricingView('package_families');
  }, [trackPageView, trackPricingView]);

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Pricing"
            title="Пакетные семейства ProHelper из действующей модели личного кабинета"
            description="Не отдельная маркетинговая сетка, а тот же package layer, который уже живёт в LK и масштабируется за счёт модулей и enterprise-контуров."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid gap-6 xl:grid-cols-2">
            {marketingPackages.map((item) => (
              <article
                key={item.slug}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-construction-50 text-construction-700">
                    <PackageIcon slug={item.slug} className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-steel-950">{item.name}</h2>
                    <p className="mt-2 text-sm leading-7 text-steel-600">
                      {item.description}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-construction-700">
                      {item.bestFor}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {item.tiers.map((tier) => (
                    <div
                      key={`${item.slug}-${tier.key}`}
                      className="rounded-[1.5rem] border border-steel-200 bg-concrete-50 p-5"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
                        {tier.label}
                      </div>
                      <div className="mt-3 text-2xl font-bold text-steel-950">
                        {formatPackageTierPrice(tier)}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-steel-600">
                        {tier.description}
                      </p>
                      <div className="mt-4 grid gap-3">
                        {tier.highlights.map((highlight) => (
                          <div
                            key={highlight}
                            className="rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-steel-700 shadow-sm"
                          >
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeader
              eyebrow="Advanced modules"
              title="Дополнительные контуры включаются как расширение"
              description="AI и enterprise-модули не ломают пакетную логику: они подключаются по мере зрелости процесса и уровня квалификации команды."
            />

            <div className="mt-8 space-y-4">
              {marketingAdvancedOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-lg font-bold text-steel-950">{offer.title}</div>
                    <MaturityBadge maturity={offer.maturity} />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{offer.summary}</p>
                  <div className="mt-4">
                    <SurfaceBadges surfaces={offer.surfaces} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-steel-200 bg-steel-950 p-8 text-white">
            <SectionHeader
              eyebrow="Почему так"
              title="Pricing объясняет рост, а не только цену"
              description="Главная задача страницы — быстро показать, с какого контура стартовать и когда подключать соседние семейства пакетов."
            />
            <div className="mt-8 space-y-4">
              {marketingTrustFacts.slice(0, 4).map((fact) => (
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
              to={marketingPaths.solutions}
              onClick={() => trackButtonClick('pricing_to_solutions', 'marketing_pricing')}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-steel-950 transition hover:-translate-y-0.5 hover:bg-construction-100"
            >
              Посмотреть решения
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing-contact" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="rounded-[2rem] border border-steel-200 bg-white p-8 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
              Подбор пакета
            </div>
            <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
              Поможем собрать минимально достаточный контур под ваш текущий этап.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-steel-600">
              На созвоне разложим текущий процесс по ролям, покажем релевантные
              пакетные семейства и сразу пометим, где уместны advanced-модули, а где
              лучше начать с базового ядра.
            </p>
          </div>

          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
