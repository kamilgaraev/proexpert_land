import { useEffect } from "react";
import CapabilityCard from "@/components/marketing/blocks/CapabilityCard";
import CtaBand from "@/components/marketing/blocks/CtaBand";
import TrustFactList from "@/components/marketing/blocks/TrustFactList";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import {
  marketingAdvancedOffers,
  marketingCapabilityMatrix,
  marketingModuleLandingLinks,
  marketingPaths,
  marketingSecuritySections,
  marketingSeo,
  marketingTrustFacts,
} from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";
import type { MarketingCapability } from "@/types/marketing";

const groupedCapabilities = marketingCapabilityMatrix.reduce<
  Record<string, MarketingCapability[]>
>((accumulator, capability) => {
  accumulator[capability.businessContour] ??= [];
  accumulator[capability.businessContour].push(capability);
  return accumulator;
}, {});

const contourEntries = Object.entries(groupedCapabilities).map(
  ([contour, capabilities], index) => ({
    id: `contour-${index + 1}`,
    contour,
    capabilities,
  }),
);

const FeaturesPage = () => {
  useSEO({
    ...marketingSeo.features,
    type: "website",
  });

  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("marketing_features");
  }, [trackPageView]);

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Функции МОСТ"
        title="Что можно делать в системе управления строительством."
        description="Обзор возможностей без привязки к одной роли: объекты и задачи, графики, документы, снабжение, финансы, качество, безопасность, техника, люди и сводные данные."
        actions={[
          {
            label: "Посмотреть возможности",
            href: "#contour-1",
            primary: true,
          },
          { label: "Выбрать решение", href: marketingPaths.solutions },
        ]}
        nav={[
          ...contourEntries.map((entry) => ({
            label: entry.contour,
            href: `#${entry.id}`,
          })),
          { label: "Расширения", href: "#advanced" },
          { label: "Доверие", href: "#trust" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Доступ к функциям
            </div>
            <div className="mt-4 grid gap-3">
              {marketingSecuritySections.slice(0, 3).map((section) => (
                <div
                  key={section.title}
                  className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  <span className="font-semibold text-steel-950">
                    {section.title}.
                  </span>{" "}
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
                  ? "border-steel-200 bg-white"
                  : "border-steel-900 bg-steel-950 text-white"
              }`}
            >
              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
                <div>
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      index % 2 === 0
                        ? "text-construction-700"
                        : "text-construction-200"
                    }`}
                  >
                    {entry.contour}
                  </div>
                  <h2 className="mt-3 text-[2rem] font-bold leading-tight">
                    {entry.capabilities[0]?.summary}
                  </h2>
                  <p
                    className={`mt-5 text-sm leading-7 ${
                      index % 2 === 0 ? "text-steel-600" : "text-white/72"
                    }`}
                  >
                    В этом разделе собраны связанные функции. Карточки поясняют,
                    кому они нужны, какие рабочие данные используют и в каких
                    интерфейсах доступны.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {entry.capabilities.map((capability) => (
                    <CapabilityCard
                      key={capability.id}
                      capability={capability}
                      tone={index % 2 === 0 ? "light" : "dark"}
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
              description="Статус на карточке показывает, входит ли функция в готовый продукт или требует отдельного согласования."
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
                  <h3 className="mt-3 text-xl font-bold text-steel-950">
                    {offer.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-steel-600">
                    {offer.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <CtaBand
            eyebrow="Демонстрация"
            title="Запросите показ нужных разделов МОСТ."
            description="На встрече разберём задачу, покажем выбранные функции и ответим на вопросы о ролях, доступе и документах."
            actions={[
              {
                label: "Запросить демонстрацию",
                href: marketingPaths.contact,
                primary: true,
              },
              { label: "Страница безопасности", href: marketingPaths.security },
            ]}
            tone="dark"
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Страницы возможностей"
            title="Подробнее о материалах, документах, мобильной работе и ИИ."
            description="Профильные страницы разбирают входные данные, последовательность работы и результат каждой функции."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingModuleLandingLinks.map((item) => (
              <MarketingLink
                key={item.href + item.label}
                href={item.href}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300"
              >
                <div className="text-lg font-bold text-steel-950">
                  {item.label}
                </div>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  {item.description}
                </p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div>
            <SectionHeader
              eyebrow="Доступ и данные"
              title="Роли определяют доступные разделы и действия."
              description="Рабочие записи и файлы относятся к объектам и другим сущностям системы, а права назначаются пользователям."
            />
          </div>
          <TrustFactList items={marketingTrustFacts} />
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
