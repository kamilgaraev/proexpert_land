import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import ContactForm from '@components/landing/ContactForm';
import { useSEO } from '@hooks/useSEO';
import useAnalytics from '@hooks/useAnalytics';
import { moduleHighlights, packageItems } from '../../data/marketingContent';

const PricingPage = () => {
  useSEO({
    title: 'Тарифы ProHelper - пакеты внедрения для строительных компаний',
    description:
      'Пакеты ProHelper построены вокруг зрелости строительной компании: Start для быстрого запуска, Business для управляемого роста, Enterprise для сложных контуров.',
    keywords:
      'тарифы ProHelper, цены строительная ERP, внедрение стройка, Start Business Enterprise, модули ProHelper',
    type: 'website',
  });
  const { trackButtonClick, trackPricingView, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPricingView('pricing_page');
    trackPageView('marketing_pricing');
  }, [trackPageView, trackPricingView]);

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-construction-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_28%),linear-gradient(180deg,#fff7ed_0%,#ffffff_68%)]">
        <div className="container-custom py-16 lg:py-20">
          <div className="max-w-4xl">
            <span className="badge-construction">Тарифы и пакеты</span>
            <h1 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Продаём не «ещё один тариф», а понятный маршрут роста для строительной компании.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-steel-700">
              На этой странице клиент должен быстро понять, с чего стартовать, когда переходить на более
              сильный пакет и как подключать модули без ощущения, что ему навязывают сложный конструктор.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid gap-5 xl:grid-cols-3">
            {packageItems.map((item) => {
              const accentClass =
                item.accent === 'primary'
                  ? 'border-construction-300 bg-steel-950 text-white'
                  : item.accent === 'dark'
                    ? 'border-steel-950 bg-steel-900 text-white'
                    : 'border-steel-200 bg-white text-steel-950';

              const chipClass =
                item.accent === 'secondary'
                  ? 'bg-construction-50 text-construction-700'
                  : 'bg-white/10 text-construction-200';

              const summaryClass = item.accent === 'secondary' ? 'text-steel-600' : 'text-white/75';
              const bulletClass = item.accent === 'secondary' ? 'bg-concrete-50 text-steel-700' : 'bg-white/5 text-white/80';
              const buttonClass =
                item.accent === 'secondary'
                  ? 'bg-construction-600 text-white hover:bg-construction-700'
                  : 'bg-white text-steel-950 hover:bg-construction-100';

              return (
                <div key={item.name} className={`rounded-[2rem] border p-7 shadow-sm ${accentClass}`}>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${chipClass}`}>
                    {item.audience}
                  </div>
                  <div className="mt-5 text-3xl font-bold">{item.name}</div>
                  <div className="mt-3 text-lg font-semibold text-construction-300">{item.price}</div>
                  <div className={`mt-4 text-sm leading-7 ${summaryClass}`}>{item.summary}</div>
                  <div className="mt-6 space-y-3">
                    {item.features.map((feature) => (
                      <div key={feature} className={`rounded-2xl px-4 py-4 text-sm leading-6 ${bulletClass}`}>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#pricing-contact"
                    onClick={() => trackButtonClick(`pricing_${item.name.toLowerCase()}`, 'marketing_pricing')}
                    className={`mt-7 inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5 ${buttonClass}`}
                  >
                    {item.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <span className="badge-safety">Как читать эту страницу</span>
              <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
                Клиент должен быстро увидеть себя в пакете, а не тонуть в деталях конфигурации.
              </h2>
              <div className="mt-6 space-y-4 text-base leading-8 text-steel-700">
                <p>
                  <span className="font-semibold text-steel-950">Start</span> нужен, когда компания только
                  собирает единый процесс и хочет навести порядок по объектам, ролям и базовой отчётности.
                </p>
                <p>
                  <span className="font-semibold text-steel-950">Business</span> нужен, когда без снабжения,
                  складского контура, аналитики и управленческой прозрачности компания уже начинает терять скорость.
                </p>
                <p>
                  <span className="font-semibold text-steel-950">Enterprise</span> нужен там, где важны
                  архитектура, масштаб, несколько уровней управления и более сложная организационная структура.
                </p>
              </div>
              <Link
                to="/solutions"
                onClick={() => trackButtonClick('pricing_to_solutions', 'marketing_pricing')}
                className="mt-8 inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-4 text-base font-semibold text-steel-900 transition hover:-translate-y-0.5 hover:border-steel-500"
              >
                Посмотреть сценарии по типам компаний
              </Link>
            </div>

            <div className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
              <div className="text-2xl font-bold text-steel-950">Модули, которые масштабируют систему дальше</div>
              <div className="mt-3 text-sm leading-7 text-steel-700">
                Модульный слой важен как инструмент апсейла и кастомизации. Но для конверсии мы показываем его
                после пакетов, чтобы не ломать выбор на первом касании.
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {moduleHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-[1.5rem] bg-concrete-50 p-5">
                      <div className="w-fit rounded-2xl bg-white p-3 text-construction-700 shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mt-4 text-lg font-bold text-steel-950">{item.title}</div>
                      <div className="mt-2 text-sm leading-6 text-steel-700">{item.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing-contact" className="bg-steel-950 py-16 text-white lg:py-20">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <div className="inline-flex rounded-full border border-construction-400/30 bg-construction-500/10 px-4 py-2 text-sm font-semibold text-construction-200">
                Выбор тарифа без перегруза
              </div>
              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                Не уверены, какой пакет подойдёт именно вашему процессу?
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
                Оставьте заявку. Мы разложим текущий процесс по ролям, покажем релевантный пакет и подскажем,
                какие модули действительно нужны на первом этапе, а какие лучше подключать позже.
              </p>
            </div>

            <ContactForm variant="compact" className="border-white/10 bg-white/95 shadow-none" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
