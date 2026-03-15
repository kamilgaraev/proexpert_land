import { useEffect } from 'react';
import ContactForm from '@components/landing/ContactForm';
import { useSEO } from '@hooks/useSEO';
import useAnalytics from '@hooks/useAnalytics';
import { solutionStories } from '../../data/marketingContent';

const SolutionsPage = () => {
  useSEO({
    title: 'Решения ProHelper - сценарии для подрядчиков, генподрядчиков и девелоперов',
    description:
      'ProHelper помогает разным типам строительных компаний собирать свой контур управления: подрядчикам, генподрядчикам, девелоперам и инженерным блокам.',
    keywords:
      'решения ProHelper, подрядчик, генподрядчик, девелопер, ПТО, строительная система управления',
    type: 'website',
  });
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('marketing_solutions');
  }, [trackPageView]);

  return (
    <div className="bg-white pt-20">
      <section className="border-b border-construction-100 bg-[radial-gradient(circle_at_top_right,_rgba(234,179,8,0.22),_transparent_24%),linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)]">
        <div className="container-custom py-16 lg:py-20">
          <div className="max-w-4xl">
            <span className="badge-construction">Решения по сегментам</span>
            <h1 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Страница решений должна показывать клиенту его сценарий, а не заставлять его самому собирать картину.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-steel-700">
              Ниже мы разложили ProHelper по типам строительных компаний и ролей. Каждый блок отвечает на
              три вопроса: где болит, что меняется после внедрения и какой пакет логичнее всего рассматривать.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom space-y-6">
          {solutionStories.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="grid gap-6 rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm lg:grid-cols-[0.8fr_1.2fr]"
              >
                <div className="rounded-[1.75rem] bg-steel-950 p-7 text-white">
                  <div className="w-fit rounded-2xl bg-white/10 p-3 text-construction-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-5 text-3xl font-bold">{item.title}</div>
                  <div className="mt-3 text-base leading-7 text-white/75">{item.subtitle}</div>
                  <div className="mt-6 rounded-[1.5rem] bg-white/5 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-construction-200">
                      Подходящий пакет
                    </div>
                    <div className="mt-3 text-xl font-bold">{item.package}</div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] bg-rose-50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Боль</div>
                    <div className="mt-3 text-sm leading-7 text-steel-700">{item.pain}</div>
                  </div>
                  <div className="rounded-[1.5rem] bg-emerald-50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Результат</div>
                    <div className="mt-3 text-sm leading-7 text-steel-700">{item.result}</div>
                  </div>
                  <div className="rounded-[1.5rem] bg-concrete-50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-steel-700">Ключевые контуры</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {item.modules.map((module) => (
                        <div key={module} className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-steel-700 shadow-sm">
                          {module}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="rounded-[2rem] border border-steel-200 bg-white p-8 shadow-sm">
              <div className="inline-flex rounded-full bg-construction-50 px-4 py-2 text-sm font-semibold text-construction-700">
                Нужен кастомный сценарий?
              </div>
              <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
                Покажем, как собрать ваш контур управления без лишних модулей и лишнего бюджета.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-steel-700">
                Если у вас смешанный сценарий, несколько направлений бизнеса или сложная организационная структура,
                на созвоне соберём под вас целевой маршрут внедрения и приоритеты первого этапа.
              </p>
            </div>

            <ContactForm variant="compact" className="shadow-none" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
