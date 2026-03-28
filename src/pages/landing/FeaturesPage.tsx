import { useEffect } from 'react';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingCapabilityMatrix,
  marketingModuleLandingLinks,
  marketingPaths,
  marketingSecuritySections,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';
import type { MarketingCapability } from '@/types/marketing';

const groupedCapabilities = marketingCapabilityMatrix.reduce<Record<string, MarketingCapability[]>>(
  (accumulator, capability) => {
    accumulator[capability.businessContour] ??= [];
    accumulator[capability.businessContour].push(capability);
    return accumulator;
  },
  {},
);

const contourEntries = Object.entries(groupedCapabilities).map(([contour, capabilities], index) => ({
  id: `contour-${index + 1}`,
  contour,
  capabilities,
}));

const FeaturesPage = () => {
  useSEO({
    ...marketingSeo.features,
    type: 'website',
  });

  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_features');
  }, [trackPageView]);

  return (
    <div className="bg-white pt-28">
      <PageHero
        eyebrow="Продукт"
        title="Ключевые возможности ProHelper для строительной компании."
        description="Объект, снабжение, финансы, документы, отчетность и корпоративное управление в одном продукте."
        actions={[
          { label: 'Запросить демонстрацию', href: marketingPaths.contact, primary: true },
          { label: 'Посмотреть решения', href: marketingPaths.solutions },
        ]}
        nav={[
          ...contourEntries.map((entry) => ({ label: entry.contour, href: `#${entry.id}` })),
          { label: 'Расширения', href: '#advanced' },
          { label: 'Доверие', href: '#trust' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно на старте
            </div>
            <div className="mt-4 grid gap-3">
              {marketingSecuritySections.slice(0, 3).map((section) => (
                <div
                  key={section.title}
                  className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  <span className="font-semibold text-steel-950">{section.title}.</span>{' '}
                  {section.description}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section className="py-16 lg:py-20">
        <div className="container-custom space-y-6">
          {contourEntries.map((entry, index) => (
            <section
              id={entry.id}
              key={entry.id}
              className={`rounded-[1.9rem] border p-6 lg:p-7 ${
                index % 2 === 0
                  ? 'border-steel-200 bg-white'
                  : 'border-steel-900 bg-steel-950 text-white'
              }`}
            >
              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
                <div>
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      index % 2 === 0 ? 'text-construction-700' : 'text-construction-200'
                    }`}
                  >
                    {entry.contour}
                  </div>
                  <h2 className="mt-3 text-[2rem] font-bold leading-tight">
                    {entry.capabilities[0]?.summary}
                  </h2>
                  <p
                    className={`mt-5 text-sm leading-7 ${
                      index % 2 === 0 ? 'text-steel-600' : 'text-white/72'
                    }`}
                  >
                    Контур объединяет несколько связанных сценариев и позволяет команде работать в
                    единой логике, а не пересобирать процесс вручную между разными инструментами.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {entry.capabilities.map((capability) => (
                    <CapabilityCard
                      key={capability.id}
                      capability={capability}
                      tone={index % 2 === 0 ? 'light' : 'dark'}
                      compact
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section id="advanced" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div>
            <SectionHeader
              eyebrow="Расширения"
              title="Пилотные расширения и интеграции."
              description="Дополнительные сценарии подключаются отдельно, когда базовый контур уже определен."
            />
            <div className="mt-8 grid gap-4">
              {marketingAdvancedOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-[1.5rem] border border-steel-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                    {offer.cta}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-steel-950">{offer.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{offer.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <CtaBand
            eyebrow="Оценка контура"
            title="Если нужен предметный разбор, покажем только релевантный блок и материалы по безопасности."
            description="На встрече разберем ваш текущий процесс, покажем рабочий сценарий и отдельно пройдемся по вопросам доступа, документов и проектного запуска."
            actions={[
              { label: 'Запросить демонстрацию', href: marketingPaths.contact, primary: true },
              { label: 'Страница безопасности', href: marketingPaths.security },
            ]}
            tone="dark"
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Модульные страницы"
            title="Отдельные страницы по материалам, документам, мобильному контуру и AI."
            description="Если вам нужен конкретный рабочий блок, можно сразу перейти в профильный сценарий и посмотреть его без лишнего перегруза."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingModuleLandingLinks.map((item) => (
              <MarketingLink
                key={item.href + item.label}
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

      <section id="trust" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div>
            <SectionHeader
              eyebrow="Доверие"
              title="Прозрачность процессов, ролей и доступа."
              description="Показываем, как ProHelper поддерживает управляемость и корпоративные требования."
            />
          </div>
          <TrustFactList items={marketingTrustFacts} />
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
