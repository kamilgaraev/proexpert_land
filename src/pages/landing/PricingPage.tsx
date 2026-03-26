import { useEffect } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import { PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
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
        title="Пакетная модель стала проще: не тарифы ради галочек, а рабочие контуры под этап компании."
        description="На странице ниже пакетная логика привязана к реальным сценариям внедрения. Это помогает быстро понять, с чего стартовать и как расширять систему дальше."
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
              Что изменилось
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Пакеты объясняются через точку входа в продукт.',
                'Отдельно вынесены проектные расширения и пилотные функции.',
                'Страница быстрее проводит к обсуждению бюджета и состава решения.',
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
              title="Подбор пакета теперь описан человеческим языком, без ощущения запутанной тарифной сетки."
              description="Это важно для enterprise-клиента: цена сама по себе мало что говорит, если не видно логики запуска и состава базового контура."
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
              title="Проектные расширения и пилоты отделены от базовых пакетов, чтобы не перегружать выбор."
              description="Сначала определяется основной рабочий контур, а уже затем обсуждаются AI-сценарии, интеграции и кастомные надстройки."
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

      <section id="contact" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.92fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Контакт"
              title="Финальный блок страницы ведет не в тупик, а к нормальному обсуждению бюджета и сценария."
              description="Оставьте короткую заявку, и мы предложим стартовый состав решения под ваш процесс, команду и организационную структуру."
            />
          </div>
          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
