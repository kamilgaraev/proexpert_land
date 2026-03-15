import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@hooks/useSEO';
import useAnalytics from '@hooks/useAnalytics';
import { featureGroups, marketingSignals } from '../../data/marketingContent';

const FeaturesPage = () => {
  useSEO({
    title: 'Возможности ProHelper - проекты, снабжение, документы, финансы и AI',
    description:
      'Возможности ProHelper сгруппированы по бизнес-контрам: объекты, документы, снабжение, финансы, аналитика, безопасность и поддержка.',
    keywords:
      'возможности ProHelper, функции строительной ERP, склад, снабжение, финансы, AI, управление проектами',
    type: 'website',
  });
  const { trackButtonClick, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_features');
  }, [trackPageView]);

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-steel-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(234,179,8,0.16),_transparent_22%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <div className="max-w-4xl">
            <span className="badge-steel">Возможности платформы</span>
            <h1 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Эта страница нужна не для перечисления фич, а для демонстрации глубины продукта и зрелости платформы.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-steel-700">
              Мы показываем возможности ProHelper по бизнес-контурам, потому что именно так строительная компания
              понимает ценность продукта: что закроет объект, что поможет снабжению, что увидит руководитель и
              насколько управляемой станет система в целом.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureGroups.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
                <div className="w-fit rounded-2xl bg-steel-950 p-3 text-construction-300">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-5 text-2xl font-bold text-steel-950">{item.title}</div>
                <div className="mt-3 text-sm leading-7 text-steel-700">{item.description}</div>
                <div className="mt-6 space-y-3">
                  {item.points.map((point) => (
                    <div key={point} className="rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="badge-construction">Почему это убеждает</span>
            <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
              Для продающего лендинга важно не только “что умеет система”, но и “насколько она взрослая”.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {marketingSignals.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[1.75rem] border border-white bg-white p-6 shadow-sm">
                  <div className="w-fit rounded-2xl bg-construction-100 p-3 text-construction-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-xl font-bold text-steel-950">{item.title}</div>
                  <div className="mt-3 text-sm leading-7 text-steel-700">{item.text}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[2rem] border border-steel-200 bg-steel-950 p-8 text-white">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-3xl font-bold">Нужен быстрый разбор релевантных модулей под ваш процесс?</div>
                <div className="mt-4 max-w-3xl text-base leading-8 text-white/75">
                  Мы не будем показывать весь каталог подряд. На созвоне сразу соберём только те блоки, которые
                  реально усиливают ваш текущий этап развития компании.
                </div>
              </div>
              <Link
                to="/pricing"
                onClick={() => trackButtonClick('features_to_pricing', 'marketing_features')}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-semibold text-steel-950 transition hover:-translate-y-0.5 hover:bg-construction-100"
              >
                Перейти к пакетам
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
