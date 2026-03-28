import { useEffect } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import {
  MarketingLink,
  PageHero,
  SectionHeader,
  SurfaceBadges,
} from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingPackages,
  marketingPaths,
  marketingRoleLandingLinks,
  marketingSeo,
  marketingSolutionSegments,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';

const solutionNav = marketingSolutionSegments.map((segment) => ({
  label: segment.title,
  href: `#${segment.id}`,
}));

const SolutionsPage = () => {
  useSEO({
    ...marketingSeo.solutions,
    type: 'website',
  });

  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_solutions');
  }, [trackPageView]);

  const capabilityMap = new Map(
    marketingCapabilityMatrix.map((capability) => [capability.id, capability]),
  );
  const packageMap = new Map(marketingPackages.map((item) => [item.slug, item]));

  return (
    <div className="bg-white pt-28">
      <PageHero
        eyebrow="Решения"
        title="Решения ProHelper для подрядчика, генподрядчика, девелопера и ПТО."
        description="Выберите сценарий, который соответствует вашей структуре, задачам и этапу развития компании."
        actions={[
          { label: 'Подобрать сценарий запуска', href: '#solutions', primary: true },
          { label: 'Открыть пакеты', href: marketingPaths.pricing },
        ]}
        nav={[...solutionNav, { label: 'Контакт', href: '#contact' }]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что вы увидите
            </div>
            <div className="mt-4 space-y-3">
              {[
                'Типовой сценарий вашей команды.',
                'Контуры и рабочие потоки в системе.',
                'Рекомендуемые пакеты и следующий шаг.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section id="solutions" className="py-16 lg:py-20">
        <div className="container-custom space-y-6">
          {marketingSolutionSegments.map((segment) => {
            const capabilities = segment.capabilityIds
              .map((capabilityId) => capabilityMap.get(capabilityId))
              .filter((item): item is NonNullable<typeof item> => Boolean(item));
            const packages = segment.recommendedPackageSlugs
              .map((packageSlug) => packageMap.get(packageSlug))
              .filter((item): item is NonNullable<typeof item> => Boolean(item));

            return (
              <section
                id={segment.id}
                key={segment.id}
                className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7"
              >
                <div className="grid gap-8 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                      {segment.audience}
                    </div>
                    <h2 className="mt-3 text-[2rem] font-bold leading-tight text-steel-950">
                      {segment.title}
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-steel-600">
                      <span className="font-semibold text-steel-950">Текущая проблема:</span>{' '}
                      {segment.challenge}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-steel-600">
                      <span className="font-semibold text-steel-950">Целевой сценарий:</span>{' '}
                      {segment.transformation}
                    </p>

                    <div className="mt-6">
                      <SurfaceBadges surfaces={segment.surfaces} />
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                        Рабочие потоки
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {segment.workflows.map((workflow) => (
                          <div
                            key={workflow}
                            className="rounded-[1.2rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                          >
                            {workflow}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                          Связанные контуры
                        </div>
                        <div className="mt-4 grid gap-3">
                          {capabilities.map((capability) => (
                            <div
                              key={capability.id}
                              className="rounded-[1.2rem] border border-steel-200 px-4 py-4"
                            >
                              <div className="text-base font-semibold text-steel-950">
                                {capability.title}
                              </div>
                              <p className="mt-2 text-sm leading-7 text-steel-600">
                                {capability.publicClaim}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                          Рекомендуемые пакеты
                        </div>
                        <div className="mt-4 grid gap-3">
                          {packages.map((item) => (
                            <div key={item.slug} className="rounded-[1.2rem] bg-concrete-50 px-4 py-4">
                              <div className="text-base font-semibold text-steel-950">{item.name}</div>
                              <p className="mt-2 text-sm leading-7 text-steel-600">
                                {item.bestFor}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Роли"
            title="Отдельные страницы под прораба, ПТО, снабжение и руководство стройкой."
            description="Здесь каждая роль вынесена в отдельный сценарий, чтобы команде было проще увидеть свой рабочий контур без смешения задач."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingRoleLandingLinks.map((item) => (
              <MarketingLink
                key={item.href}
                href={item.href}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300"
              >
                <div className="text-lg font-bold text-steel-950">{item.label}</div>
                <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Если ваш сценарий смешанный, соберем демонстрацию под структуру команды и текущий масштаб."
            description="Разберем роли, процессы и приоритетные точки контроля, после чего покажем релевантный маршрут запуска без перегруженного экскурса по всему продукту."
            actions={[
              { label: 'Перейти к пакетам', href: marketingPaths.pricing, primary: true },
              { label: 'О продукте', href: marketingPaths.about },
            ]}
            tone="light"
          />
        </div>
      </section>

      <section id="contact" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.92fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Контакт"
              title="Обсудим ваш сценарий и покажем релевантную демонстрацию."
              description="Достаточно нескольких вводных о компании, роли и процессе, чтобы подготовить предметный созвон."
            />
            <div className="mt-8 grid gap-3">
              {[
                'Уточняем роли команды и текущий этап компании.',
                'Выбираем приоритетный контур для первого запуска.',
                'При необходимости отдельно подключаем блок безопасности и документов.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
