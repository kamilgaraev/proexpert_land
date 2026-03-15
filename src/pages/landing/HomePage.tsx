import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContactForm from '@components/landing/ContactForm';
import { useSEO } from '@hooks/useSEO';
import useAnalytics from '@hooks/useAnalytics';
import {
  aiFeatures,
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
} from '../../data/marketingContent';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { addFAQSchema } = useSEO({
    title: 'ProHelper — система управления строительными проектами',
    description:
      'Объедините объекты, снабжение, финансы и AI в одной системе. Меньше хаоса, больше контроля. Запуск от 3 дней.',
    keywords:
      'управление строительством, программа для строительной компании, учёт материалов на стройке, прораб приложение, строительная CRM, сметы онлайн, AI генерация смет, ProHelper',
    type: 'website',
  });
  const { trackButtonClick, trackPageView } = useAnalytics();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [aiIndex, setAiIndex] = useState(0);

  useEffect(() => {
    addFAQSchema(marketingFaqs);
  }, [addFAQSchema]);

  useEffect(() => {
    trackPageView('marketing_home');
  }, [trackPageView]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAiIndex((i) => (i + 1) % aiFeatures.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden bg-white">
      <section className="relative min-h-screen bg-[#09090f] pt-20 flex items-center">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(249,115,22,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 90% 80%, rgba(234,179,8,0.12) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 0h80v80H0z' fill='none'/%3E%3Cpath d='M0 80L80 0M-20 20L20 -20M60 100L100 60' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="container-custom relative w-full py-20 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-construction-500/25 bg-construction-500/8 px-5 py-2.5 text-sm font-semibold text-construction-300 backdrop-blur-sm">
                <SparklesIcon className="h-4 w-4 text-construction-400" />
                Теперь с AI-ассистентом и генерацией смет
              </div>

              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl xl:text-[4.5rem]">
                Стройте больше.{' '}
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-construction-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Контролируйте всё.
                  </span>
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
                ProHelper объединяет объекты, команду, снабжение и финансы в одной системе.
                AI-ассистент на базе YandexGPT анализирует ваши проекты и отвечает
                на вопросы по данным вашей компании.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#contact"
                  onClick={() => trackButtonClick('hero_cta_primary', 'marketing_home')}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-construction-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_50px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_0_70px_rgba(249,115,22,0.55)] hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Получить бесплатное демо</span>
                  <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-construction-500 to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
                <Link
                  to="/pricing"
                  onClick={() => trackButtonClick('hero_cta_secondary', 'marketing_home')}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:-translate-y-0.5"
                >
                  Посмотреть тарифы
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  'Запуск за 3 рабочих дня',
                  'Мобильное приложение для прораба',
                  'AI-анализ рисков по вашим данным',
                  'От подрядчика до холдинга',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-slate-400"
                  >
                    <CheckIcon className="h-4 w-4 shrink-0 text-construction-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-construction-500/20 via-transparent to-amber-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
                <div className="border-b border-white/10 bg-white/[0.04] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/70" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                    <div className="ml-4 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1">
                      <SparklesIcon className="h-3.5 w-3.5 text-construction-400" />
                      <span className="text-xs text-slate-400">AI-ассистент ProHelper</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {aiFeatures.map((feat, i) => {
                    const Icon = feat.icon;
                    const isActive = aiIndex === i;
                    return (
                      <div
                        key={feat.question}
                        className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-7 w-7 shrink-0 rounded-lg bg-slate-700 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-slate-300" />
                          </div>
                          <div className="rounded-2xl rounded-tl-sm bg-white/8 px-4 py-3 text-sm text-slate-300">
                            {feat.question}
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-start gap-3 ml-10">
                            <div className="h-7 w-7 shrink-0 rounded-lg bg-construction-500/20 flex items-center justify-center">
                              <SparklesIcon className="h-4 w-4 text-construction-400" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm border border-construction-500/20 bg-construction-500/10 px-4 py-3 text-sm leading-6 text-slate-200">
                              {feat.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-2 pt-2">
                    {aiFeatures.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAiIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${aiIndex === i ? 'w-6 bg-construction-400' : 'w-1.5 bg-white/20'}`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-slate-500">Примеры вопросов к AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-construction-400">{item.value}</div>
                <div className="mt-2 text-sm font-semibold text-white">{item.label}</div>
                <div className="mt-1.5 text-sm leading-6 text-slate-500">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#09090f] to-[#0f0f18] py-24">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-construction-500/25 bg-construction-500/10 px-4 py-2 text-sm font-semibold text-construction-300">
              <SparklesIcon className="h-4 w-4" />
              AI-возможности
            </span>
            <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
              Не просто система.{' '}
              <span className="bg-gradient-to-r from-construction-400 to-amber-400 bg-clip-text text-transparent">
                Умная система.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Два AI-модуля, которые работают с вашими реальными данными и экономят
              часы ручной работы каждый день.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-construction-500/30">
              <div className="absolute top-0 right-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-construction-500/10 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-construction-500/15 border border-construction-500/20 px-4 py-2.5">
                  <SparklesIcon className="h-5 w-5 text-construction-300" />
                  <span className="text-sm font-bold text-construction-200">AI-ассистент</span>
                </div>
                <h3 className="mt-5 text-2xl font-bold text-white">
                  Спросите что угодно по вашим проектам
                </h3>
                <p className="mt-3 text-slate-400 leading-7">
                  Ассистент работает с вашими реальными данными — объектами, бюджетами,
                  материалами и контрактами. Построен на YandexGPT — работает без VPN,
                  данные не покидают защищённую инфраструктуру.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    '"Какие проекты в зоне риска?" → мгновенный анализ',
                    '"Хватит ли цемента?" → проверка остатков и прогноз',
                    '"Сколько потрачено за месяц?" → сводка по бюджетам',
                    'История диалогов и контекст между сессиями',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-construction-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 inline-flex rounded-full bg-construction-500/15 px-3 py-1 text-xs font-semibold text-construction-300">
                  YandexGPT 5 Pro · от 3 990 ₽/мес
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-amber-500/30">
              <div className="absolute top-0 right-0 h-64 w-64 translate-x-16 -translate-y-16 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-amber-500/15 border border-amber-500/20 px-4 py-2.5">
                  <SparklesIcon className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-bold text-amber-200">AI-генерация смет</span>
                </div>
                <h3 className="mt-5 text-2xl font-bold text-white">
                  Смета из чертежей за 15 минут, не за 3 дня
                </h3>
                <p className="mt-3 text-slate-400 leading-7">
                  Загружаете чертежи, спецификации или фотографии объекта. AI распознаёт
                  их через Yandex Vision OCR, анализирует похожие проекты вашей компании
                  и генерирует смету с разбивкой по позициям.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'OCR-распознавание PDF, JPG, PNG, Excel чертежей',
                    'Автоподбор позиций из каталога смет организации',
                    'Анализ похожих проектов для точности расчётов',
                    'Экспорт в PDF, Excel, Word',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                  YandexGPT 5 + Yandex Vision · до 10 генераций/мес
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-construction">Узнаёте себя?</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Эти проблемы знакомы каждой строительной компании
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-500">
              Мы разработали ProHelper, потому что видели: строительный бизнес тонет
              не из-за нехватки людей — а из-за разрозненных инструментов и ручного хаоса.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {businessProblems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-construction-200"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 rounded-2xl bg-slate-100 p-3.5 text-slate-600 group-hover:bg-construction-500 group-hover:text-white transition-all">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-steel-950">{item.title}</h3>
                      <div className="mt-4 flex gap-2 items-start rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3">
                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                        <p className="text-sm leading-6 text-steel-700">{item.pain}</p>
                      </div>
                      <div className="mt-3 flex gap-2 items-start rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <p className="text-sm leading-6 text-steel-700">{item.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#09090f] py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300">
              До и после
            </span>
            <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
              Как меняется работа компании
            </h2>
            <p className="mt-4 text-slate-400">Включая AI-возможности</p>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/8">
            <div className="grid text-xs font-bold uppercase tracking-widest sm:grid-cols-[1.1fr_1fr_1fr]">
              <div className="border-b border-white/8 bg-white/4 px-8 py-4 text-slate-500 sm:border-b-0 sm:border-r">Ситуация</div>
              <div className="border-b border-white/8 bg-white/4 px-8 py-4 text-rose-400/60 sm:border-b-0 sm:border-r">Без системы</div>
              <div className="bg-white/4 px-8 py-4 text-construction-400/80">С ProHelper + AI</div>
            </div>
            {comparisonItems.map((item, i) => (
              <div
                key={item.label}
                className={`grid border-t border-white/8 sm:grid-cols-[1.1fr_1fr_1fr] ${i % 2 === 0 ? 'bg-white/[0.015]' : ''}`}
              >
                <div className="px-8 py-6 text-sm font-bold text-white sm:border-r sm:border-white/8">{item.label}</div>
                <div className="px-8 py-6 text-sm leading-7 text-slate-500 sm:border-r sm:border-white/8">{item.withoutProHelper}</div>
                <div className="px-8 py-6 text-sm leading-7 text-construction-300">{item.withProHelper}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-safety">Что включено</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Всё в одном месте — включая AI
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-500">
              Каждый модуль работает в связке с остальными. Данные не дублируются,
              команда работает в одном контексте.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {platformCapabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`group relative rounded-3xl border p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${
                    item.isAI
                      ? 'border-construction-200 bg-gradient-to-br from-construction-50 to-orange-50/50 hover:border-construction-300 hover:shadow-construction-100'
                      : 'border-white bg-white hover:border-slate-200 hover:shadow-slate-100'
                  }`}
                >
                  {item.isAI && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-construction-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-construction-600">
                      <SparklesIcon className="h-3 w-3" />
                      AI
                    </div>
                  )}
                  <div className={`rounded-2xl p-3.5 w-fit transition-colors ${item.isAI ? 'bg-construction-100 text-construction-600 group-hover:bg-construction-500 group-hover:text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-steel-950 group-hover:text-construction-300'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-5 text-lg font-bold text-steel-950">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                  <ul className="mt-5 space-y-2.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-sm leading-6 text-steel-700">
                        <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${item.isAI ? 'text-construction-500' : 'text-slate-400'}`} />
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

      <section className="bg-white py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-steel">Для каждой роли</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              Каждый в вашей команде получит то, что ему нужно
            </h2>
            <p className="mt-5 text-lg leading-8 text-steel-500">
              ProHelper — не один интерфейс для всех. Директор, прораб, снабженец и ПТО
              видят разные данные и работают в своём режиме.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {roleScenarios.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-600 group-hover:bg-construction-500 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-steel-600">
                      {item.role}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-steel-950">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-7 text-steel-500">{item.challenge}</p>
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                    {item.outcomes.map((outcome) => (
                      <div
                        key={outcome}
                        className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-steel-700"
                      >
                        <CheckIcon className="mb-1.5 h-4 w-4 text-construction-500" />
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

      <section id="pricing" className="bg-[linear-gradient(180deg,#0f0f18_0%,#09090f_100%)] py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300">
              Тарифы
            </span>
            <h2 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
              Начните с нужного уровня
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              AI-модули доступны как дополнение к любому пакету.
            </p>
          </div>

          <div className="mt-14 grid gap-5 xl:grid-cols-3">
            {packageItems.map((item) => {
              const isPrimary = item.accent === 'primary';
              const isDark = item.accent === 'dark';
              return (
                <div
                  key={item.name}
                  className={`relative rounded-3xl p-8 ${
                    isPrimary
                      ? 'bg-gradient-to-b from-construction-600 to-construction-700 shadow-[0_30px_80px_rgba(249,115,22,0.3)] ring-1 ring-construction-400'
                      : isDark
                        ? 'bg-white/[0.06] border border-white/10'
                        : 'bg-white/[0.04] border border-white/10'
                  }`}
                >
                  {isPrimary && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-steel-950 shadow-lg">
                      Популярный
                    </div>
                  )}
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isPrimary ? 'bg-white/20 text-white' : 'bg-white/8 text-slate-400'}`}>
                    {item.audience}
                  </div>
                  <div className="mt-6 text-3xl font-bold text-white">{item.name}</div>
                  <div className={`mt-2 text-lg font-semibold ${isPrimary ? 'text-construction-100' : 'text-construction-400'}`}>
                    {item.price}
                  </div>
                  <p className={`mt-4 text-sm leading-7 ${isPrimary ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.summary}
                  </p>
                  <ul className="mt-7 space-y-3">
                    {item.features.map((feature) => (
                      <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${isPrimary ? 'text-white/90' : 'text-slate-300'}`}>
                        <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${isPrimary ? 'text-construction-200' : 'text-construction-400'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    onClick={() => trackButtonClick(`package_${item.name.toLowerCase()}`, 'marketing_home')}
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition hover:-translate-y-0.5 ${
                      isPrimary
                        ? 'bg-white text-construction-700 hover:bg-construction-50'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {item.cta}
                    <ArrowRightIcon className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-white/8 bg-white/[0.03] p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-5 w-5 text-construction-400" />
                  <div className="text-xl font-bold text-white">Дополнительные AI-модули и инструменты</div>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  AI-ассистент, AI-генерация смет, расширенная аналитика и другие модули доступны к любому пакету.
                </p>
              </div>
              <Link
                to="/pricing"
                className="inline-flex shrink-0 items-center gap-2 justify-center rounded-2xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Полный список модулей
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-4">
              {moduleHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`rounded-2xl border p-5 ${item.isAI ? 'border-construction-500/20 bg-construction-500/8' : 'border-white/8 bg-white/4'}`}
                  >
                    <div className={`rounded-xl p-2.5 w-fit ${item.isAI ? 'bg-construction-500/20 text-construction-300' : 'bg-white/8 text-slate-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {item.isAI && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-construction-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-construction-400">
                        <SparklesIcon className="h-2.5 w-2.5" />
                        AI
                      </div>
                    )}
                    <div className={`mt-3 font-bold ${item.isAI ? 'text-white' : 'text-slate-200'}`}>{item.title}</div>
                    <div className="mt-1.5 text-sm leading-6 text-slate-400">{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="badge-safety">Почему ProHelper</span>
              <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
                Система, которая работает с первого дня
              </h2>
              <p className="mt-5 text-lg leading-8 text-steel-500">
                Мы не просто продаём лицензию. Мы помогаем команде принять систему,
                а AI-возможности делают это ценным с первых же дней.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {marketingSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <div key={signal.title} className="rounded-3xl border border-white bg-white p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="rounded-2xl bg-construction-50 p-3 text-construction-600 w-fit">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-4 text-base font-bold text-steel-950">{signal.title}</div>
                    <p className="mt-2 text-sm leading-7 text-steel-500">{signal.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-steel">Как начать</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">
              От заявки до работающей системы — 4 шага
            </h2>
          </div>

          <div className="mt-14 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-7 top-14 bottom-14 w-0.5 bg-gradient-to-b from-construction-300 via-construction-500 to-slate-200 hidden lg:block" />
              <div className="space-y-5">
                {launchSteps.map((item, index) => (
                  <div
                    key={item.title}
                    className="relative flex gap-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-steel-950 text-xl font-bold text-construction-400 relative z-10">
                      {index + 1}
                    </div>
                    <div className="self-center">
                      <h3 className="text-xl font-bold text-steel-950">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-7 text-steel-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 py-24 lg:py-32">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <span className="badge-steel">Частые вопросы</span>
            <h2 className="mt-5 text-4xl font-bold text-steel-950 sm:text-5xl">Отвечаем честно</h2>
          </div>

          <div className="mt-12 max-w-3xl mx-auto space-y-2.5">
            {marketingFaqs.map((item, i) => (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-5 px-7 py-5 text-left transition hover:bg-slate-50"
                >
                  <span className="text-base font-semibold text-steel-950">{item.question}</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}
                >
                  <div className="border-t border-slate-100 px-7 py-5 text-sm leading-7 text-steel-600">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#09090f] py-24 lg:py-32">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-construction-400/25 bg-construction-500/10 px-4 py-2 text-sm font-semibold text-construction-300">
                <SparklesIcon className="h-4 w-4" />
                Бесплатная демонстрация
              </div>
              <h2 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
                Покажем, как ProHelper и AI работают на вашем бизнесе
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-400">
                Оставьте заявку — менеджер свяжется в течение рабочего дня. Разберём
                вашу ситуацию, покажем AI-демо и предложим конкретный план.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-construction-300">На созвоне</div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Разберём ваш текущий процесс: сколько объектов, где теряете деньги
                    и время, что AI-инструменты могут решить прямо сейчас.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-construction-300">На выходе</div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Конкретная рекомендация: пакет, модули, AI-возможности и как
                    провести запуск без стресса для команды.
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
