import { useEffect } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingCommercialLandingLinks,
  marketingPackages,
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

const PricingPage = () => {
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

  return (
    <div className="bg-white pt-28">
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

      <section id="packages" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5">
          {marketingPackages.map((item) => (
            <PackageFamilyCard key={item.slug} item={item} />
          ))}
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
