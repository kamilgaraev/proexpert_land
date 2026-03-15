import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const { addFAQSchema } = useSEO({
    title: 'ProHelper — система управления строительными проектами',
    description: 'Объедините объекты, снабжение, финансы и команду в одной системе. Меньше хаоса, больше контроля. Запуск от 3 дней.',
    keywords: 'управление строительством, программа для строительной компании, учёт материалов на стройке, прораб приложение, строительная CRM, сметы онлайн, ProHelper',
    type: 'website',
  });
  const { trackButtonClick, trackPageView } = useAnalytics();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    addFAQSchema(marketingFaqs);
  }, [addFAQSchema]);

  useEffect(() => {
    trackPageView('marketing_home');
  }, [trackPageView]);

  return (
    <div className="overflow-hidden bg-white">
      <section className="relative min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] pt-20 flex items-center">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-construction-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-construction-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative w-full py-20 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-construction-500/30 bg-construction-500/10 px-5 py-2.5 text-sm font-semibold text-construction-300">
              <span className="h-2 w-2 rounded-full bg-construction-400 animate-pulse" />
              Специально для строительного бизнеса
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] text-white sm:text-6xl xl:text-7xl">
              Стройте больше.{' '}
              <span className="text-construction-400">Контролируйте</span>{' '}
              всё.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              ProHelper объединяет объекты, команду, снабжение и финансы в одной системе.
              Руководитель видит реальную картину, прораб работает со смартфона, снабженец
              не теряет заявки.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                onClick={() => trackButtonClick('hero_cta_primary', 'marketing_home')}
                className="inline-flex items-center justify-center rounded-2xl bg-construction-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(249,115,22,0.4)] transition hover:bg-construction-400 hover:-translate-y-0.5 active:translate-y-0"
              >
                Получить бесплатную демонстрацию
              </a>
              <Link
                to="/pricing"
                onClick={() => trackButtonClick('hero_cta_secondary', 'marketing_home')}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:-translate-y-0.5"
              >
                Посмотреть тарифы
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {trustPills.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-construction-400">{item.value}</div>
                <div className="mt-2 text-base font-semibold text-white">{item.label}</div>
                <div className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-construction">Узнаёте себя?</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Эти проблемы знакомы{' '}
              <span className="text-construction-600">каждой строительной компании</span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-600">
              Мы разработали ProHelper, потому что сами видели: строительный бизнес тонет не из-за нехватки
              людей или денег — а из-за разрозненных инструментов.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {businessProblems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-steel-100 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-construction-200"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 rounded-2xl bg-construction-100 p-3.5 text-construction-700 group-hover:bg-construction-600 group-hover:text-white transition-colors">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-steel-950">{item.title}</h3>
                      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Сейчас</span>
                        <p className="mt-1 text-sm leading-6 text-steel-700">{item.pain}</p>
                      </div>
                      <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">С ProHelper</span>
                        <p className="mt-1 text-sm leading-6 text-steel-700">{item.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-steel-950 py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-construction-300">
              До и после
            </span>
            <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
              Как меняется работа компании
            </h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid bg-white/5 text-xs font-bold uppercase tracking-widest text-white/40 sm:grid-cols-[1fr_1fr_1fr]">
              <div className="border-b border-white/10 px-8 py-4 sm:border-b-0 sm:border-r">Ситуация</div>
              <div className="border-b border-white/10 px-8 py-4 sm:border-b-0 sm:border-r text-rose-400/70">Без системы</div>
              <div className="px-8 py-4 text-construction-400/80">С ProHelper</div>
            </div>
            {comparisonItems.map((item, i) => (
              <div
                key={item.label}
                className={`grid border-t border-white/10 sm:grid-cols-[1fr_1fr_1fr] ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}`}
              >
                <div className="px-8 py-6 text-base font-bold text-white">{item.label}</div>
                <div className="px-8 py-6 text-sm leading-7 text-white/60 sm:border-l sm:border-white/10">{item.withoutProHelper}</div>
                <div className="px-8 py-6 text-sm leading-7 text-construction-300 sm:border-l sm:border-white/10">{item.withProHelper}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-safety">Возможности платформы</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Всё, что нужно строительной компании — в одном месте
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-600">
              ProHelper не набор разрозненных инструментов. Это единая система, где каждый модуль
              работает в связке с остальными.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {platformCapabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-white bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-construction-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-steel-950 p-3.5 text-construction-400 group-hover:bg-construction-500 group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-steel-950">{item.title}</div>
                      <div className="mt-0.5 text-sm text-steel-500">{item.description}</div>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-sm leading-6 text-steel-700">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-steel">Для каждой роли</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Каждый в вашей команде получит то, что ему нужно
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-600">
              ProHelper — не один интерфейс для всех. Директор, прораб, снабженец и ПТО
              видят разные данные и работают в удобном для себя режиме.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {roleScenarios.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  className="rounded-3xl border border-steel-100 bg-gradient-to-br from-white to-slate-50 p-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-construction-100 p-3 text-construction-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-steel-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-steel-700">
                      {item.role}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-steel-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{item.challenge}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {item.outcomes.map((outcome) => (
                      <div key={outcome} className="rounded-2xl bg-construction-50 border border-construction-100 px-4 py-3 text-sm leading-6 text-steel-800">
                        <CheckIcon className="h-4 w-4 text-construction-600 mb-1.5" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-construction">Тарифы</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Выберите подходящий пакет
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-600">
              Начните с нужного вам уровня. Добавляйте функции по мере роста.
            </p>
          </div>

          <div className="mt-14 grid gap-6 xl:grid-cols-3">
            {packageItems.map((item) => {
              const isPrimary = item.accent === 'primary';
              const isDark = item.accent === 'dark';

              return (
                <div
                  key={item.name}
                  className={`relative rounded-3xl p-8 ${
                    isPrimary
                      ? 'bg-steel-950 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.7)] ring-2 ring-construction-500'
                      : isDark
                        ? 'bg-steel-900 text-white'
                        : 'bg-white border border-steel-200 shadow-sm'
                  }`}
                >
                  {isPrimary && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-construction-500 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                      Популярный
                    </div>
                  )}
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isPrimary || isDark ? 'bg-white/10 text-construction-300' : 'bg-construction-50 text-construction-700'}`}>
                    {item.audience}
                  </div>
                  <div className="mt-6 text-3xl font-bold">{item.name}</div>
                  <div className={`mt-2 text-lg font-semibold ${isPrimary || isDark ? 'text-construction-400' : 'text-construction-600'}`}>
                    {item.price}
                  </div>
                  <p className={`mt-4 text-sm leading-7 ${isPrimary || isDark ? 'text-white/70' : 'text-steel-600'}`}>
                    {item.summary}
                  </p>
                  <ul className="mt-7 space-y-3">
                    {item.features.map((feature) => (
                      <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${isPrimary || isDark ? 'text-white/85' : 'text-steel-700'}`}>
                        <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${isPrimary || isDark ? 'text-construction-400' : 'text-construction-600'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    onClick={() => trackButtonClick(`package_${item.name.toLowerCase()}`, 'marketing_home')}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-bold transition hover:-translate-y-0.5 ${
                      isPrimary
                        ? 'bg-construction-500 text-white hover:bg-construction-400'
                        : isDark
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-steel-950 text-white hover:bg-steel-800'
                    }`}
                  >
                    {item.cta}
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl border border-steel-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-2xl font-bold text-steel-950">Дополнительные модули</div>
                <p className="mt-2 text-sm text-steel-600">
                  Расширяйте систему именно теми инструментами, которые нужны вашей компании.
                </p>
              </div>
              <Link
                to="/pricing"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-steel-300 bg-white px-6 py-3 text-sm font-semibold text-steel-900 transition hover:border-steel-500"
              >
                Полный список модулей →
              </Link>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-4">
              {moduleHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-steel-100 bg-slate-50 p-5">
                    <div className="rounded-xl bg-white p-2.5 text-construction-700 shadow-sm w-fit">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 font-bold text-steel-950">{item.title}</div>
                    <div className="mt-1.5 text-sm leading-6 text-steel-600">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="badge-safety">Почему нам доверяют</span>
              <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
                Система, которая работает с первого дня
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel-600">
                Мы не просто продаём лицензию. Мы помогаем команде принять систему и начать
                работать в ней — быстро и без лишнего стресса.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {marketingSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.title} className="rounded-3xl border border-white bg-white p-6 shadow-sm">
                    <div className="rounded-2xl bg-construction-100 p-3 text-construction-700 w-fit">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-4 text-lg font-bold text-steel-950">{signal.title}</div>
                    <p className="mt-2 text-sm leading-7 text-steel-600">{signal.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-steel">Как начать</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              От заявки до работающей системы — 4 шага
            </h2>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {launchSteps.map((item, index) => (
              <div
                key={item.title}
                className="flex gap-6 rounded-3xl border border-steel-100 bg-gradient-to-br from-white to-slate-50 p-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-steel-950 text-xl font-bold text-construction-400">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-steel-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-steel-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 py-20 lg:py-28">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge-steel">Частые вопросы</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Отвечаем честно
            </h2>
          </div>

          <div className="mt-12 max-w-3xl mx-auto space-y-3">
            {marketingFaqs.map((item, i) => (
              <div
                key={item.question}
                className="rounded-2xl border border-white bg-white shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left"
                >
                  <span className="text-base font-semibold text-steel-950">{item.question}</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 shrink-0 text-steel-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-steel-100 px-7 py-5 text-sm leading-7 text-steel-600">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-steel-950 py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <div className="inline-flex rounded-full border border-construction-400/30 bg-construction-500/10 px-4 py-2 text-sm font-semibold text-construction-300">
                Бесплатная демонстрация
              </div>
              <h2 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
                Покажем, как ProHelper работает на вашем типе бизнеса
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
                Оставьте заявку — менеджер свяжется в течение рабочего дня. Разберём вашу
                ситуацию и покажем только то, что актуально именно для вас.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="text-sm font-bold uppercase tracking-widest text-construction-300">На созвоне</div>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Разберём ваш текущий процесс: сколько объектов, где теряете деньги и время,
                    что хотелось бы улучшить в первую очередь.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="text-sm font-bold uppercase tracking-widest text-construction-300">На выходе</div>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Получите конкретную рекомендацию: какой пакет подходит, с чего начать
                    и как провести запуск без лишнего стресса для команды.
                  </p>
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
