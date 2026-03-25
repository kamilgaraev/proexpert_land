import { useEffect } from 'react';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
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

const groupedCapabilities = marketingCapabilityMatrix.reduce<Record<string, MarketingCapability[]>>(
  (accumulator, capability) => {
    accumulator[capability.businessContour] ??= [];
    accumulator[capability.businessContour].push(capability);
    return accumulator;
  },
  {},
);

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
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.12),_transparent_22%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <SectionHeader
            eyebrow="Возможности"
            title="Ключевые процессы собраны в единую систему, а не разбросаны по отдельным инструментам"
            description="Каждый контур ниже связан с конкретной рабочей задачей: объект, снабжение, финансы, документы, отчетность или корпоративное управление."
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom space-y-10">
          {Object.entries(groupedCapabilities).map(([contour, capabilities], index) => (
            <section
              key={contour}
              className={`rounded-[2.25rem] border p-8 shadow-sm ${
                index % 2 === 0
                  ? 'border-steel-200 bg-white'
                  : 'border-steel-900 bg-steel-950 text-white'
              }`}
            >
              <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <div
                    className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                      index % 2 === 0 ? 'text-construction-700' : 'text-construction-200'
                    }`}
                  >
                    {contour}
                  </div>
                  <h2 className="mt-5 text-3xl font-bold leading-tight">
                    {capabilities[0]?.summary}
                  </h2>
                  <p
                    className={`mt-5 text-sm leading-7 ${
                      index % 2 === 0 ? 'text-steel-600' : 'text-white/70'
                    }`}
                  >
                    Контур собирает несколько связанных сценариев и помогает команде работать
                    в одном процессе без лишних переключений между инструментами.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {capabilities.map((capability) => (
                    <CapabilityCard
                      key={capability.id}
                      capability={capability}
                      tone={index % 2 === 0 ? 'light' : 'dark'}
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionHeader
              eyebrow="Пилотные сценарии"
              title="Отдельные расширения подключаются только там, где для них уже созрел процесс"
              description="Пилотные и проектные функции не продаются как базовая часть продукта. Мы обсуждаем их только в релевантном сценарии."
            />
            <div className="mt-8 grid gap-4">
              {marketingAdvancedOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
                    {offer.cta}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-steel-950">{offer.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-steel-600">{offer.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-steel-900 bg-steel-950 p-8">
            <SectionHeader
              eyebrow="Безопасность"
              title="Техническая зрелость важна, но на сайте мы говорим о ней человеческим языком"
              description="Ниже собраны основные принципы, которые важны заказчику на этапе оценки продукта."
              tone="dark"
            />
            <div className="mt-8 grid gap-4">
              {marketingSecuritySections.slice(0, 3).map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5"
                >
                  <div className="text-lg font-bold text-white">{section.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/75">{section.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Если нужна подробная оценка, покажем релевантный контур и материалы по безопасности"
            description="На встрече разберем ваш текущий процесс, покажем рабочий сценарий и отдельно обсудим вопросы доступа, документов и запуска."
            actions={[
              { label: 'Запросить демонстрацию', href: marketingPaths.contact, primary: true },
              { label: 'Страница безопасности', href: marketingPaths.security },
            ]}
          />
          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeader
                eyebrow="Почему нам доверяют"
                title="То, что важно клиенту еще до запуска"
                description="Понятные роли, прозрачный процесс, централизованная работа с документами и сводная картина по объектам."
              />
            </div>
            <TrustFactList items={marketingTrustFacts} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
