import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import ContactForm from '@components/landing/ContactForm';
import { useSEO } from '@hooks/useSEO';
import useAnalytics from '@hooks/useAnalytics';
import {
  businessProblems,
  comparisonItems,
  heroStats,
  launchSteps,
  marketingFaqs,
  marketingSignals,
  moduleHighlights,
  packageItems,
  platformCapabilities,
  roleScenarios,
  trustPills,
} from '../../data/marketingContent';

const HomePage = () => {
  const { addFAQSchema } = useSEO({
    title: 'ProHelper - цифровая система для строительных компаний',
    description:
      'ProHelper помогает строительным компаниям связать проекты, снабжение, документы, финансы, аналитику и AI в одной платформе.',
    keywords:
      'строительная ERP, управление стройкой, учёт материалов, графики работ, снабжение, строительная аналитика, сметы, акты, ProHelper',
    type: 'website',
  });
  const { trackButtonClick, trackPageView } = useAnalytics();

  useEffect(() => {
    addFAQSchema(marketingFaqs);
  }, [addFAQSchema]);

  useEffect(() => {
    trackPageView('marketing_home');
  }, [trackPageView]);

  return (
    <div className="overflow-hidden bg-white pt-20">
      <section className="relative border-b border-construction-100 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(234,179,8,0.2),_transparent_28%),linear-gradient(180deg,#fffdf9_0%,#ffffff_54%,#f8fafc_100%)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-blueprint opacity-40" />
        <div className="container-custom relative py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-construction-200 bg-white/90 px-4 py-2 text-sm font-semibold text-construction-700 shadow-sm">
                ProHelper для стройки
                <span className="h-1.5 w-1.5 rounded-full bg-safety-500" />
                backend, админка, мобильный контур и аналитика в одной системе
              </div>

              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-steel-950 sm:text-5xl xl:text-6xl">
                Лендинг для продукта, который действительно
                <span className="block text-construction-600">умеет управлять стройкой, а не только обещать это.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-steel-700 sm:text-xl">
                ProHelper собирает в одном контуре проекты, договоры, документы, материалы, графики,
                финансы, управленческую аналитику и AI. Руководитель получает прозрачность, команда
                работает быстрее, а компания масштабируется без хаоса.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/pricing"
                  onClick={() => trackButtonClick('hero_pricing', 'marketing_home')}
                  className="inline-flex items-center justify-center rounded-2xl bg-steel-950 px-7 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
                >
                  Посмотреть пакеты и тарифы
                </Link>
                <a
                  href="#contact"
                  onClick={() => trackButtonClick('hero_contact', 'marketing_home')}
                  className="inline-flex items-center justify-center rounded-2xl border border-construction-300 bg-white px-7 py-4 text-base font-semibold text-construction-700 transition hover:-translate-y-0.5 hover:border-construction-500 hover:bg-construction-50"
                >
                  Получить демонстрацию
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {trustPills.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-steel-200 bg-white/80 px-4 py-4 text-sm leading-6 text-steel-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-construction-200/40 via-transparent to-safety-200/50 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-steel-200 bg-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)]">
                <div className="border-b border-steel-100 bg-steel-950 px-6 py-5 text-white">
                  <div className="text-sm font-semibold uppercase tracking-[0.24em] text-construction-300">
                    Единый контур управления
                  </div>
                  <div className="mt-2 text-2xl font-bold">Что видит руководитель в ProHelper</div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-construction-50 p-5">
                      <div className="text-sm font-semibold text-construction-700">Проекты и статусы</div>
                      <div className="mt-2 text-3xl font-bold text-steel-950">Под контролем</div>
                      <div className="mt-2 text-sm text-steel-600">
                        Этапы, документы и прогресс видны без ручной сводки.
                      </div>
                    </div>
                    <div className="rounded-2xl bg-safety-50 p-5">
                      <div className="text-sm font-semibold text-safety-700">Материалы и закупки</div>
                      <div className="mt-2 text-3xl font-bold text-steel-950">Прозрачно</div>
                      <div className="mt-2 text-sm text-steel-600">
                        Потребность, остатки и движение материалов привязаны к объекту.
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-steel-200 bg-steel-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-steel-700">Сильный backend-слой</div>
                        <div className="mt-1 text-xl font-bold text-steel-950">
                          Роли, логи, пакеты, платежи, отчётность и AI
                        </div>
                      </div>
                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        Enterprise ready
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {marketingSignals.map((signal) => {
                        const Icon = signal.icon;

                        return (
                          <div key={signal.title} className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="rounded-2xl bg-construction-100 p-2 text-construction-700">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="text-sm font-semibold text-steel-900">{signal.title}</div>
                            </div>
                            <div className="mt-3 text-sm leading-6 text-steel-600">{signal.text}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.75rem] border border-steel-200 bg-white px-6 py-6 shadow-sm"
              >
                <div className="text-2xl font-bold text-steel-950">{item.value}</div>
                <div className="mt-2 text-base font-semibold text-steel-800">{item.label}</div>
                <div className="mt-2 text-sm leading-6 text-steel-600">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-18 lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="badge-construction">Где теряется маржа</span>
            <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
              Проблема большинства строительных компаний не в отсутствии данных, а в отсутствии единой системы.
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-700">
              Когда объект, снабжение, документы и деньги живут в разных местах, компания теряет скорость,
              управляемость и прогнозируемость. Поэтому лендинг должен продавать не “красивые карточки”, а
              понятный путь к единому контуру работы.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {businessProblems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-steel-200 bg-gradient-to-br from-white to-concrete-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-construction-100 p-3 text-construction-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-xl font-bold text-steel-950">{item.title}</div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-sm leading-6 text-steel-700">
                    <span className="font-semibold text-rose-700">Сейчас:</span> {item.pain}
                  </div>
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm leading-6 text-steel-700">
                    <span className="font-semibold text-emerald-700">С ProHelper:</span> {item.result}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-steel-950 py-18 text-white lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-construction-300">
              До и после внедрения
            </span>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
              ProHelper переводит компанию из режима “ручного героизма” в режим управляемой системы.
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10">
            <div className="grid bg-white/5 text-sm font-semibold uppercase tracking-[0.2em] text-white/60 sm:grid-cols-[0.95fr_1fr_1fr]">
              <div className="border-b border-white/10 px-6 py-4 sm:border-b-0 sm:border-r">Зона сравнения</div>
              <div className="border-b border-white/10 px-6 py-4 sm:border-b-0 sm:border-r">Без ProHelper</div>
              <div className="px-6 py-4">С ProHelper</div>
            </div>
            {comparisonItems.map((item) => (
              <div
                key={item.label}
                className="grid border-t border-white/10 bg-white/[0.03] sm:grid-cols-[0.95fr_1fr_1fr]"
              >
                <div className="px-6 py-5 text-base font-semibold text-white">{item.label}</div>
                <div className="px-6 py-5 text-sm leading-7 text-white/75">{item.withoutProHelper}</div>
                <div className="px-6 py-5 text-sm leading-7 text-construction-200">{item.withProHelper}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-18 lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="badge-safety">Основа продажи</span>
            <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
              Лендинг продаёт сильнее всего тогда, когда за ним стоит реальная продуктовая глубина.
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-700">
              У ProHelper уже есть то, чего обычно не хватает большинству маркетинговых сайтов: сильный backend,
              модульность, административный контур, реальные роли и возможность собирать разные сценарии внедрения.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {platformCapabilities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-steel-950 p-3 text-construction-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-steel-950">{item.title}</div>
                      <div className="mt-1 text-sm text-steel-600">{item.description}</div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {item.bullets.map((bullet) => (
                      <div key={bullet} className="rounded-2xl bg-concrete-50 px-4 py-3 text-sm leading-6 text-steel-700">
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-18 lg:py-24">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <span className="badge-steel">Роли и сценарии</span>
              <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
                Каждый отдел получает свой полезный сценарий, а не просто доступ в систему.
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel-700">
                Это критично для конверсии: клиенту важно увидеть себя внутри продукта уже на этапе лендинга.
                Поэтому на первом касании мы показываем не абстрактные “фичи”, а реальные сценарии ролей.
              </p>
            </div>

            <div className="grid gap-5">
              {roleScenarios.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.role}
                    className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-2xl bg-construction-100 p-3 text-construction-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="rounded-full bg-steel-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-steel-700">
                        {item.role}
                      </div>
                    </div>
                    <div className="mt-4 text-2xl font-bold text-steel-950">{item.title}</div>
                    <div className="mt-3 text-sm leading-7 text-steel-700">{item.challenge}</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {item.outcomes.map((outcome) => (
                        <div key={outcome} className="rounded-2xl bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700">
                          {outcome}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] py-18 lg:py-24">
        <div className="container-custom">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="badge-construction">Пакеты роста</span>
              <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
                Вместо перегруза десятками экранов мы продаём через понятную логику зрелости компании.
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel-700">
                На первом касании клиенту проще выбрать не модуль поштучно, а уровень зрелости бизнеса.
                Поэтому пакеты выступают основным решением, а модули усиливают внедрение дальше.
              </p>
            </div>

            <Link
              to="/pricing"
              onClick={() => trackButtonClick('packages_page', 'marketing_home')}
              className="inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-4 text-base font-semibold text-steel-900 transition hover:-translate-y-0.5 hover:border-steel-500"
            >
              Открыть полную страницу тарифов
            </Link>
          </div>

          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {packageItems.map((item) => {
              const accentClass =
                item.accent === 'primary'
                  ? 'border-construction-300 bg-steel-950 text-white'
                  : item.accent === 'dark'
                    ? 'border-steel-950 bg-steel-900 text-white'
                    : 'border-white bg-white text-steel-950';

              const chipClass =
                item.accent === 'secondary'
                  ? 'bg-construction-50 text-construction-700'
                  : 'bg-white/10 text-construction-200';

              const bulletClass = item.accent === 'secondary' ? 'text-steel-700' : 'text-white/80';
              const summaryClass = item.accent === 'secondary' ? 'text-steel-600' : 'text-white/75';
              const buttonClass =
                item.accent === 'secondary'
                  ? 'bg-construction-600 text-white hover:bg-construction-700'
                  : 'bg-white text-steel-950 hover:bg-construction-100';

              return (
                <div
                  key={item.name}
                  className={`rounded-[2rem] border p-7 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.5)] ${accentClass}`}
                >
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${chipClass}`}>
                    {item.audience}
                  </div>
                  <div className="mt-5 text-3xl font-bold">{item.name}</div>
                  <div className="mt-3 text-lg font-semibold text-construction-300">{item.price}</div>
                  <div className={`mt-4 text-sm leading-7 ${summaryClass}`}>{item.summary}</div>
                  <div className="mt-6 space-y-3">
                    {item.features.map((feature) => (
                      <div key={feature} className={`rounded-2xl px-4 py-4 text-sm leading-6 ${item.accent === 'secondary' ? 'bg-concrete-50' : 'bg-white/5'} ${bulletClass}`}>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#contact"
                    onClick={() => trackButtonClick(`package_${item.name.toLowerCase()}`, 'marketing_home')}
                    className={`mt-7 inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold transition hover:-translate-y-0.5 ${buttonClass}`}
                  >
                    {item.cta}
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[2rem] border border-steel-200 bg-white p-7 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-2xl font-bold text-steel-950">Модули, которые усиливают внедрение</div>
                <div className="mt-2 max-w-3xl text-sm leading-7 text-steel-700">
                  После выбора пакета компания может расширять систему без полной перестройки процесса.
                  Это сильный апсейл-слой и хороший аргумент для продаж на средний и enterprise сегмент.
                </div>
              </div>
              <div className="rounded-full bg-construction-50 px-4 py-2 text-sm font-semibold text-construction-700">
                Пакеты + модульное расширение
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {moduleHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-steel-200 bg-concrete-50 p-5">
                    <div className="rounded-2xl bg-white p-3 text-construction-700 shadow-sm w-fit">
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
      </section>

      <section className="bg-white py-18 lg:py-24">
        <div className="container-custom">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <span className="badge-safety">Запуск и внедрение</span>
              <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
                Чтобы лендинг конвертировал, следующий шаг после заявки должен быть предсказуемым.
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel-700">
                Вместо абстрактного “мы вам перезвоним” мы показываем понятный маршрут: диагностика,
                сборка контура, пилот и масштабирование. Это снижает тревогу и повышает доверие на этапе заявки.
              </p>
            </div>

            <div className="space-y-4">
              {launchSteps.map((item, index) => (
                <div
                  key={item.title}
                  className="grid gap-4 rounded-[1.75rem] border border-steel-200 bg-concrete-50 p-6 shadow-sm sm:grid-cols-[72px_1fr]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-steel-950 text-lg font-bold text-construction-300">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-steel-950">{item.title}</div>
                    <div className="mt-2 text-sm leading-7 text-steel-700">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-concrete-50 py-18 lg:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="badge-steel">FAQ</span>
            <h2 className="mt-5 text-3xl font-bold text-steel-950 sm:text-4xl">
              Снимаем ключевые вопросы до того, как клиент уйдёт думать в пустоту.
            </h2>
          </div>

          <div className="mt-10 grid gap-4">
            {marketingFaqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.5rem] border border-white bg-white px-6 py-5 shadow-sm"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-steel-950">
                  {item.question}
                </summary>
                <div className="mt-4 text-sm leading-7 text-steel-700">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-steel-950 py-18 text-white lg:py-24">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
              <div className="inline-flex rounded-full border border-construction-400/30 bg-construction-500/10 px-4 py-2 text-sm font-semibold text-construction-200">
                Финальный CTA
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-bold sm:text-4xl">
                Если продукт сильный, лендинг должен доводить до разговора о внедрении, а не просто до просмотра цен.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
                Оставьте заявку, и мы покажем релевантный сценарий под ваш тип компании: какие пакеты брать,
                какие модули подключать в первую очередь и как запускать пилот без лишнего шума.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/5 p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">
                    На созвоне
                  </div>
                  <div className="mt-3 text-sm leading-7 text-white/75">
                    Разберём текущий контур: объект, снабжение, ПТО, финансы, точки потери скорости и управляемости.
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/5 p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-construction-200">
                    На выходе
                  </div>
                  <div className="mt-3 text-sm leading-7 text-white/75">
                    Получите понятный маршрут запуска: пакет, модули, приоритеты и формат следующего шага.
                  </div>
                </div>
              </div>
            </div>

            <ContactForm variant="compact" className="border-white/10 bg-white/95 shadow-none" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
