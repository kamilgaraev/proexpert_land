import { useEffect } from 'react';
import ContactForm from '@/components/landing/ContactForm';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingAdvancedOffers,
  marketingPackages,
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

  const { trackPageView, trackPricingView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_pricing');
    trackPricingView('package_families');
  }, [trackPageView, trackPricingView]);

  return (
    <div className="bg-white pt-28">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_24%),linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]">
        <div className="container-custom py-20 lg:py-24">
          <SectionHeader
            eyebrow="Пакеты"
            title="Выбирайте не тариф ради галочки, а рабочий контур под ваш этап роста"
            description="Пакеты помогают понять, с какого процесса лучше стартовать сейчас и как расширять систему по мере роста команды и числа объектов."
          />
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="container-custom grid gap-5">
          {marketingPackages.map((item) => (
            <PackageFamilyCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="bg-concrete-50 py-20 lg:py-24">
        <div className="container-custom grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.25rem] border border-steel-200 bg-white p-8 shadow-sm">
              <SectionHeader
                eyebrow="Проектные расширения"
                title="Если базового пакета недостаточно, подключаем дополнительные сценарии по согласованию"
                description="Пилотные возможности и индивидуальные расширения обсуждаются только после того, как понятен основной рабочий контур."
              />
              <div className="mt-8 grid gap-4">
                {marketingAdvancedOffers.map((offer) => (
                  <article
                    key={offer.id}
                    className="rounded-[1.75rem] bg-concrete-50 px-6 py-6"
                  >
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
                    {offer.cta}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-steel-950">{offer.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{offer.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-steel-900 bg-steel-950 p-8">
            <SectionHeader
              eyebrow="Как выбрать"
              title="На что опираемся при подборе пакета"
              description="Выбор состава решения зависит не только от размера компании, но и от того, какой процесс сейчас важнее всего собрать в единую систему."
              tone="dark"
            />
            <div className="mt-8 space-y-4">
              {[
                'Сколько объектов и ролей нужно связать между собой уже на первом этапе.',
                'Нужно ли сразу подключать снабжение, финансовый блок или только объектный контур.',
                'Есть ли требования к корпоративному управлению и работе нескольких организаций.',
                'Нужны ли пилотные или индивидуальные расширения поверх базового пакета.',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-7 text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.75rem] bg-white px-5 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-700">
                Что получает заказчик
              </div>
              <div className="mt-3 grid gap-3">
                {marketingTrustFacts.slice(0, 3).map((fact) => (
                  <div key={fact.title} className="text-sm leading-7 text-steel-700">
                    <span className="font-semibold text-steel-950">{fact.title}.</span> {fact.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing-contact" className="py-20 lg:py-24">
        <div className="container-custom grid gap-8 xl:grid-cols-[1fr_420px] xl:items-start">
          <CtaBand
            eyebrow="Подбор решения"
            title="Разложим ваш текущий процесс и подскажем минимально достаточный состав решения"
            description="На встрече покажем, где лучше стартовать, а какие модули стоит подключать уже после первого рабочего результата."
            actions={[]}
            tone="light"
          />
          <ContactForm variant="compact" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
