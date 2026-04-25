import { useEffect, useMemo, useState } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingCommercialLandingLinks,
  marketingPackages,
  marketingSalesOffers,
  marketingSeo,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';
import { generatePricingSchema } from '@/utils/seo';

const pricingPrinciples = [
  'Стартуем с того контура, где сейчас выше всего ручная нагрузка и потери.',
  'Не включаем все модули одновременно, если команда еще не готова к этому процессно.',
  'Расширяем систему по мере роста числа объектов, ролей и юридических лиц.',
];

const basePlans = [
  {
    slug: 'start',
    name: 'Start',
    price: 4900,
    fit: 'Первый рабочий контур для небольшой команды.',
    includedPackageSlugs: [] as string[],
  },
  {
    slug: 'business',
    name: 'Business',
    price: 9900,
    fit: 'Основной выбор для компании с несколькими объектами.',
    includedPackageSlugs: ['objects-execution'],
  },
  {
    slug: 'profi',
    name: 'Profi',
    price: 19900,
    fit: 'Выгоднее, когда нужно сразу несколько строительных контуров.',
    includedPackageSlugs: ['objects-execution', 'finance-acts', 'supply-warehouse', 'holding-analytics'],
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    price: 49900,
    fit: 'Проектная конфигурация для холдинга, интеграций и SLA.',
    includedPackageSlugs: ['objects-execution', 'finance-acts', 'supply-warehouse', 'holding-analytics', 'ai-contour'],
  },
];

const formatPrice = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const PricingPage = () => {
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('business');
  const [selectedPackageSlugs, setSelectedPackageSlugs] = useState<Set<string>>(
    new Set(['supply-warehouse', 'finance-acts']),
  );

  useSEO({
    ...marketingSeo.pricing,
    type: 'website',
    structuredData: generatePricingSchema(),
  });

  const { trackPageView, trackPricingView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_pricing');
    trackPricingView('package_families');
  }, [trackPageView, trackPricingView]);

  const selectedPlan = basePlans.find((plan) => plan.slug === selectedPlanSlug) ?? basePlans[1];
  const packageTierBySlug = useMemo(
    () =>
      new Map(
        marketingPackages.map((item) => [
          item.slug,
          {
            family: item,
            tier: item.tiers[0],
          },
        ]),
      ),
    [],
  );

  const calculator = useMemo(() => {
    const included = new Set(selectedPlan.includedPackageSlugs);
    const selectedPaidPackages = Array.from(selectedPackageSlugs)
      .filter((slug) => !included.has(slug))
      .map((slug) => packageTierBySlug.get(slug))
      .filter(Boolean) as Array<{ family: (typeof marketingPackages)[number]; tier: (typeof marketingPackages)[number]['tiers'][number] }>;

    const packagesPrice = selectedPaidPackages.reduce((sum, item) => sum + item.tier.price, 0);
    const standalonePrice = selectedPaidPackages.reduce((sum, item) => sum + item.tier.standalonePrice, 0);

    return {
      selectedPaidPackages,
      packagesPrice,
      standalonePrice,
      monthly: selectedPlan.price + packagesPrice,
      saved: Math.max(standalonePrice - packagesPrice, 0),
    };
  }, [packageTierBySlug, selectedPackageSlugs, selectedPlan]);

  const togglePackage = (slug: string) => {
    if (selectedPlan.includedPackageSlugs.includes(slug)) {
      return;
    }

    setSelectedPackageSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Пакеты"
        title="Пакеты ProHelper под ваш этап развития."
        description="Выберите стартовый контур для объекта, снабжения, финансов, отчетности или корпоративного управления."
        actions={[
          { label: 'Подобрать пакет', href: '#contact', primary: true },
          { label: 'Посмотреть решения', href: '/solutions' },
        ]}
        nav={[
          { label: 'Пакеты', href: '#packages' },
          { label: 'Как выбираем', href: '#principles' },
          { label: 'Расширения', href: '#addons' },
          { label: 'Контакт', href: '#contact' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Как выбирать пакет
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Опираемся на ваш приоритетный процесс.',
                'Не перегружаем старт лишними модулями.',
                'Расширяем систему по мере роста компании.',
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

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Готовые офферы"
            title="Сначала выбираем рабочий сценарий, а не отдельные функции."
            description="Так клиент сразу видит стоимость закрытого строительного процесса: объект, снабжение, финансы, ПТО или холдинг."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {marketingSalesOffers.map((offer) => (
              <article
                key={offer.title}
                className={`rounded-[1.75rem] border p-6 shadow-sm ${
                  offer.planSlug === 'business'
                    ? 'border-construction-300 bg-construction-50'
                    : 'border-steel-200 bg-white'
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                  {offer.planName}
                </div>
                <h2 className="mt-3 text-2xl font-bold text-steel-950">{offer.title}</h2>
                <div className="mt-4 text-3xl font-bold text-steel-950">{offer.priceLabel}</div>
                <p className="mt-4 text-sm leading-7 text-steel-700">{offer.audience}</p>
                <div className="mt-5 rounded-[1.2rem] bg-white/80 px-4 py-4 text-sm leading-7 text-steel-700">
                  {offer.outcome}
                </div>
                <p className="mt-4 text-sm leading-7 text-steel-600">{offer.comparison}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5">
          {marketingPackages.map((item) => (
            <PackageFamilyCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="bg-steel-950 py-16 text-white lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.8fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Калькулятор"
              title="Соберите тариф и пакеты без покупки лишнего."
              description="Пакеты показывают бизнес-результат. Отдельные модули остаются для точной донастройки после выбора основного сценария."
              tone="dark"
            />

            <div className="mt-8 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                {basePlans.map((plan) => (
                  <button
                    key={plan.slug}
                    type="button"
                    onClick={() => setSelectedPlanSlug(plan.slug)}
                    className={`rounded-[1.35rem] border px-5 py-5 text-left transition ${
                      selectedPlan.slug === plan.slug
                        ? 'border-construction-300 bg-construction-500 text-steel-950'
                        : 'border-white/15 bg-white/5 text-white hover:border-white/35'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-lg font-bold">{plan.name}</span>
                      <span className="text-sm font-semibold">{formatPrice(plan.price)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 opacity-80">{plan.fit}</p>
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {marketingPackages.map((item) => {
                  const included = selectedPlan.includedPackageSlugs.includes(item.slug);
                  const selected = selectedPackageSlugs.has(item.slug) || included;
                  const tier = item.tiers[0];

                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => togglePackage(item.slug)}
                      className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                        selected
                          ? 'border-construction-300 bg-white text-steel-950'
                          : 'border-white/15 bg-white/5 text-white hover:border-white/35'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold">{item.name}</div>
                          <p className="mt-2 text-xs leading-5 opacity-75">{tier.businessOutcome}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold">
                          {included ? 'в тарифе' : formatPrice(tier.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-white/12 bg-white p-6 text-steel-950 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Расчет в месяц
            </div>
            <div className="mt-4 flex items-end justify-between gap-4 border-b border-steel-100 pb-5">
              <div>
                <div className="text-sm text-steel-500">Итого</div>
                <div className="mt-1 text-4xl font-bold">{formatPrice(calculator.monthly)}</div>
              </div>
              {calculator.saved > 0 ? (
                <div className="rounded-full bg-construction-100 px-3 py-1 text-xs font-semibold text-construction-800">
                  экономия {formatPrice(calculator.saved)}
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-steel-500">Базовый тариф</span>
                <span className="font-semibold">{formatPrice(selectedPlan.price)}</span>
              </div>
              {calculator.selectedPaidPackages.map(({ family, tier }) => (
                <div key={family.slug} className="flex justify-between gap-3">
                  <span className="text-steel-500">{family.name}</span>
                  <span className="font-semibold">{formatPrice(tier.price)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
              Business отмечен как основной выбор: он дает рабочий строительный контур для компании с несколькими объектами, а пакеты расширяют его по процессам.
            </div>
          </aside>
        </div>
      </section>

      <section id="principles" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeader
              eyebrow="Как выбираем"
              title="Как подобрать пакет под вашу компанию."
              description="Смотрим на текущий процесс, состав команды и организационную структуру."
            />
          </div>

          <div className="grid gap-4">
            {pricingPrinciples.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-steel-200 bg-white px-5 py-5 shadow-sm">
                <div className="text-sm leading-7 text-steel-700">{item}</div>
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-steel-900 bg-steel-950 px-5 py-5 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
                Что получает заказчик
              </div>
              <div className="mt-4 grid gap-3">
                {marketingTrustFacts.slice(0, 3).map((fact) => (
                  <div key={fact.title} className="text-sm leading-7 text-white/76">
                    <span className="font-semibold text-white">{fact.title}.</span> {fact.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="addons" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div>
            <SectionHeader
              eyebrow="Расширения"
              title="Проектные расширения и пилотные сценарии."
              description="Дополнительные функции обсуждаются отдельно после выбора базового контура."
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
                  <h2 className="mt-3 text-xl font-bold text-steel-950">{offer.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{offer.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <CtaBand
            eyebrow="Подбор решения"
            title="Разложим ваш процесс и предложим минимально достаточный состав решения."
            description="На встрече покажем, где лучше стартовать, а какие блоки стоит подключать уже после первого рабочего результата."
            actions={[{ label: 'Оставить заявку', href: '#contact', primary: true }]}
            tone="light"
          />
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Подбор по сценарию"
            title="Стоимость проще обсуждать через конкретную роль, боль или контур запуска."
            description="Поэтому из пакетов ведем в отдельные посадочные: так пользователь сразу понимает, какой сценарий и какой объем внедрения ему нужен."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingCommercialLandingLinks.slice(0, 6).map((item) => (
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

      <section id="contact" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.92fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Контакт"
              title="Подберем состав решения и формат запуска."
              description="Оставьте короткую заявку, и мы предложим стартовый пакет под ваш процесс и команду."
            />
          </div>
          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
