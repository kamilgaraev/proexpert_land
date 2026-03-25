import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import ContactForm from '@/components/landing/ContactForm';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import FaqAccordion from '@/components/marketing/blocks/FaqAccordion';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import SegmentPreviewCard from '@/components/marketing/blocks/SegmentPreviewCard';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  marketingCapabilityMatrix,
  marketingFaqs,
  marketingHeroFacts,
  marketingLaunchSteps,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingSolutionSegments,
  marketingTrustFacts,
} from '@/data/marketingRegistry';
import useAnalytics from '@/hooks/useAnalytics';
import { useSEO } from '@/hooks/useSEO';

const heroAudienceTags = [
  'Подрядчик',
  'Генподрядчик',
  'Девелопер',
  'ПТО',
  'Управляющая компания',
];

const heroSignals = [
  {
    title: 'Объект',
    label: 'Заявки, задачи и исполнение',
    text: 'Площадка, офис и ПТО работают в одном рабочем контуре без потерь в статусах и сроках.',
    icon: BuildingOffice2Icon,
    accent: ['Задачи и сроки', 'Ответственные и статусы'],
  },
  {
    title: 'Снабжение',
    label: 'Материалы, закупка и остатки',
    text: 'Потребности с объекта быстрее доходят до закупки, склада и контроля движения материалов.',
    icon: CubeIcon,
    accent: ['Потребности с площадки', 'Закупка и склад'],
  },
  {
    title: 'Финансы',
    label: 'Платежи, акты и документы',
    text: 'Финансовый блок и проектный контекст остаются связаны, поэтому решение принимается быстрее.',
    icon: ClipboardDocumentListIcon,
    accent: ['Платежи и акты', 'Документы в контексте'],
  },
];

const heroCommandCard = {
  title: 'Руководитель видит картину без ручного свода',
  text: 'Вместо разрозненных таблиц команда получает понятный свод по объектам, снабжению, платежам и исполнению.',
  accent: ['Свод по объектам', 'Контроль отклонений', 'Понятный следующий шаг'],
};

const featuredCapabilityIds = [
  'project-control',
  'supply-chain',
  'finance-control',
  'multi-org',
];

const contactHighlights = [
  'Разберем текущий процесс до показа системы.',
  'Сфокусируемся на самом болезненном участке работы.',
  'Предложим маршрут запуска без лишних модулей.',
  'Отдельно обсудим безопасность и документы, если это важно на старте.',
];

const HomePage = () => {
  const { addFAQSchema } = useSEO({
    ...marketingSeo.home,
    type: 'website',
  });
  const { trackButtonClick, trackPageView } = useAnalytics();

  useEffect(() => {
    addFAQSchema(marketingFaqs);
  }, [addFAQSchema]);

  useEffect(() => {
    trackPageView('marketing_home');
  }, [trackPageView]);

  const featuredCapabilities = featuredCapabilityIds
    .map((id) => marketingCapabilityMatrix.find((capability) => capability.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="overflow-hidden bg-white">
      <section className="relative overflow-hidden bg-steel-950 pt-[9rem] text-white lg:pt-[10.5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.22),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(125,211,252,0.16),_transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,1)_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-blueprint opacity-20 xl:block" />
        <div className="absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-construction-500/10 blur-3xl" />

        <div className="container-custom relative pb-28 lg:pb-32">
          <div className="grid gap-14 xl:grid-cols-[minmax(0,1.02fr)_minmax(620px,0.98fr)] xl:items-center">
            <div className="max-w-[720px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                ProHelper для строительных компаний
              </div>
              <h1 className="mt-7 max-w-[700px] text-[clamp(3.35rem,6.6vw,6.2rem)] font-bold leading-[0.93] tracking-[-0.04em]">
                Управляйте строительством в одной системе.
              </h1>
              <p className="mt-6 max-w-[700px] text-[1.35rem] font-medium leading-[1.55] text-white/88 lg:text-[1.5rem]">
                Объекты, заявки, снабжение, финансы и документы связаны в одном рабочем контуре
                для офиса, площадки и руководителя.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
                Вместо разрозненных таблиц, чатов и ручных сводок команда получает понятный
                процесс от события на объекте до управленческого решения.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to={`${marketingPaths.home}#contact`}
                  onClick={() => trackButtonClick('hero_demo', 'marketing_home')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-steel-950 transition hover:bg-construction-100"
                >
                  Запросить демонстрацию
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to={marketingPaths.solutions}
                  onClick={() => trackButtonClick('hero_solutions', 'marketing_home')}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Посмотреть сценарии
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                {heroAudienceTags.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/72"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative xl:pl-2">
              <div className="absolute -inset-10 rounded-[3rem] bg-construction-400/12 blur-3xl" />
              <div className="relative rounded-[3rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl lg:p-8">
                <div className="rounded-[2.3rem] border border-white/10 bg-steel-900/88 p-7 lg:p-8">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                    Как выглядит рабочий контур
                  </div>
                  <h2 className="mt-4 max-w-2xl text-[2rem] font-bold leading-tight text-white lg:text-[2.35rem]">
                    Не набор разрозненных функций, а единый маршрут работы от объекта до решения.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                    Внутри одного процесса остаются заявки, материалы, платежи, документы и
                    контроль по объектам. Это и есть основной эффект продукта для команды.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {heroSignals.map((signal) => {
                      const Icon = signal.icon;

                      return (
                        <article
                          key={signal.title}
                          className="rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-6"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-construction-200">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-construction-200">
                                {signal.title}
                              </div>
                              <div className="mt-2 text-lg font-bold leading-tight text-white">
                                {signal.label}
                              </div>
                            </div>
                          </div>
                          <p className="mt-5 text-sm leading-7 text-white/70">{signal.text}</p>
                          <div className="mt-6 flex flex-wrap gap-2.5">
                            {signal.accent.map((item) => (
                              <div
                                key={item}
                                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/78"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(251,146,60,0.10))] p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-construction-200">
                        <ChartBarSquareIcon className="h-6 w-6" />
                      </div>
                      <div className="mt-5 text-xl font-bold text-white">{heroCommandCard.title}</div>
                      <p className="mt-3 text-sm leading-7 text-white/72">{heroCommandCard.text}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {heroCommandCard.accent.map((item) => (
                        <div
                          key={item}
                          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-5 text-sm font-semibold leading-7 text-white/78"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {marketingHeroFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[2.1rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur"
              >
                <div className="text-4xl font-bold leading-none text-white">{fact.value}</div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                  {fact.label}
                </div>
                <p className="mt-5 max-w-md text-base leading-8 text-white/70">{fact.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Кому подходит"
            title="Сценарии для подрядчика, генподрядчика, девелопера и инженерной команды"
            description="Каждый сценарий собран вокруг реальной рабочей боли, а не вокруг случайного списка экранов."
            align="center"
          />
          <div className="mt-14 grid gap-6 xl:grid-cols-2">
            {marketingSolutionSegments.map((segment) => (
              <SegmentPreviewCard
                key={segment.id}
                segment={segment}
                linkTo={marketingPaths.solutions}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-20 lg:py-28">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Возможности"
            title="Что помогает держать строительный процесс под контролем"
            description="Показываем только те контуры, которые уже имеют понятный рабочий сценарий в продукте."
          />

          <div className="mt-14 grid gap-6 xl:grid-cols-12">
            {featuredCapabilities.map((capability, index) => (
              <div
                key={capability.id}
                className={index === 0 || index === 3 ? 'xl:col-span-7' : 'xl:col-span-5'}
              >
                <CapabilityCard capability={capability} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Пакеты"
            title="Стартуйте с нужного контура, а не с перегруженного внедрения"
            description="Пакеты помогают выбрать понятную точку входа: объект, снабжение, финансы, отчетность или корпоративный контур."
          />
          <div className="mt-14 grid gap-6 xl:grid-cols-2">
            {marketingPackages.slice(0, 4).map((item) => (
              <PackageFamilyCard key={item.slug} item={item} compact />
            ))}
          </div>
          <div className="mt-10">
            <CtaBand
              eyebrow="Как выбрать пакет"
              title="Поможем собрать минимально достаточный состав решения под ваш этап"
              description="На созвоне разложим текущий процесс по ролям и покажем, с какого контура лучше стартовать именно сейчас."
              actions={[
                { label: 'Перейти к пакетам', href: marketingPaths.pricing, primary: true },
                { label: 'Связаться с нами', href: marketingPaths.contact },
              ]}
              tone="light"
            />
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-20 lg:py-28">
        <div className="container-custom grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2.25rem] border border-steel-200 bg-white p-8 shadow-sm lg:p-9">
            <SectionHeader
              eyebrow="Запуск"
              title="Как проходит внедрение"
              description="Начинаем с процесса, который быстрее всего даст управляемый результат, и только потом наращиваем систему."
            />
            <div className="mt-8 space-y-4">
              {marketingLaunchSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[1.75rem] bg-concrete-50 px-5 py-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-steel-950 text-sm font-bold text-construction-200">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-steel-950">{step.title}</div>
                    <p className="mt-2 text-sm leading-7 text-steel-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-steel-900 bg-steel-950 p-8 lg:p-9">
            <SectionHeader
              eyebrow="Доверие"
              title="То, что важно клиенту еще до старта"
              description="Показываем безопасность и прозрачность человеческим языком: разграничение доступа, работа с документами и понятный процесс запуска."
              tone="dark"
            />
            <div className="mt-8">
              <TrustFactList items={marketingTrustFacts} tone="dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <SectionHeader eyebrow="FAQ" title="Частые вопросы" align="center" />
          <div className="mx-auto mt-14 max-w-4xl">
            <FaqAccordion items={marketingFaqs} />
          </div>
        </div>
      </section>

      <section id="contact" className="bg-steel-950 py-20 lg:py-28">
        <div className="container-custom grid gap-10 xl:grid-cols-[0.95fr_0.85fr] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Демонстрация"
              title="Покажем ProHelper на вашем сценарии, а не на абстрактной витрине"
              description="Разберем роли команды, текущий процесс и подберем маршрут запуска: от первого объекта до корпоративного контура."
              tone="dark"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {contactHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-7 text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ContactForm variant="full" className="border-white/10 bg-white shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
