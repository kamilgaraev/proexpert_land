import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import {
  MaturityBadge,
  PackageIcon,
  SectionHeader,
  SurfaceBadges,
  formatPackageTierPrice,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingSolutionSegments,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';

const SolutionsPage = () => {
  useSEO({
    ...marketingSeo.solutions,
    type: 'website',
  });

  const { trackButtonClick, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_solutions');
  }, [trackPageView]);

  const capabilityMap = new Map(
    marketingCapabilityMatrix.map((capability) => [capability.id, capability]),
  );
  const packageMap = new Map(marketingPackages.map((item) => [item.slug, item]));

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Solutions"
            title="Сценарии ProHelper по сегментам строительного бизнеса"
            description="Для каждого сегмента показываем боль, подтверждённые workflow, доступные surface-ы и релевантные пакетные семейства."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom space-y-6">
          {marketingSolutionSegments.map((segment) => {
            const capabilities = segment.capabilityIds
              .map((capabilityId) => capabilityMap.get(capabilityId))
              .filter((item): item is NonNullable<typeof item> => Boolean(item));
            const packages = segment.recommendedPackageSlugs
              .map((packageSlug) => packageMap.get(packageSlug))
              .filter((item): item is NonNullable<typeof item> => Boolean(item));

            return (
              <article
                key={segment.id}
                className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm"
              >
                <div className="grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
                  <div className="rounded-[1.75rem] bg-steel-950 p-7 text-white">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                      {segment.title}
                    </div>
                    <h1 className="mt-4 text-3xl font-bold">{segment.audience}</h1>
                    <p className="mt-4 text-sm leading-7 text-white/75">
                      {segment.challenge}
                    </p>
                    <div className="mt-5">
                      <SurfaceBadges surfaces={segment.surfaces} />
                    </div>
                    <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-200">
                        После внедрения
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/80">
                        {segment.transformation}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.75rem] bg-concrete-50 p-6">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
                        Подтверждённые workflow
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {segment.workflows.map((workflow) => (
                          <div
                            key={workflow}
                            className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-steel-700 shadow-sm"
                          >
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
                            {workflow}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      {capabilities.map((capability) => (
                        <article
                          key={capability.id}
                          className="rounded-[1.75rem] border border-steel-200 bg-white p-5"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-lg font-bold text-steel-950">
                              {capability.title}
                            </div>
                            <MaturityBadge maturity={capability.maturity} />
                          </div>
                          <p className="mt-3 text-sm leading-7 text-steel-600">
                            {capability.publicClaim}
                          </p>
                          <div className="mt-4">
                            <SurfaceBadges surfaces={capability.surfaces} />
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">
                        Релевантные пакетные семейства
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        {packages.map((item) => (
                          <div
                            key={item.slug}
                            className="rounded-[1.5rem] bg-concrete-50 p-5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-construction-700 shadow-sm">
                                <PackageIcon slug={item.slug} className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-semibold text-steel-950">{item.name}</div>
                                <div className="text-sm text-steel-500">
                                  {formatPackageTierPrice(item.tiers[0])}
                                </div>
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-steel-600">
                              {item.bestFor}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="rounded-[2rem] border border-steel-200 bg-white p-8 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
              Нужен кастомный сценарий
            </div>
            <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
              Соберём rollout-маршрут без лишних модулей и лишнего шума.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-steel-600">
              Если у вас смешанный контур, несколько ролей или переход к holding-модели,
              на созвоне выделим приоритетный поток внедрения и покажем, что имеет смысл
              запускать сразу, а что оставить на следующий этап.
            </p>
            <Link
              to={marketingPaths.pricing}
              onClick={() => trackButtonClick('solutions_to_pricing', 'marketing_solutions')}
              className="mt-8 inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-4 text-sm font-semibold text-steel-900 transition hover:border-steel-500"
            >
              Перейти к пакетам
            </Link>
          </div>

          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
