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

const heroSignals = [
  {
    title: 'Объект под контролем',
    text: 'Задачи, статусы и рабочие договоренности остаются в одном контуре.',
    icon: BuildingOffice2Icon,
  },
  {
    title: 'Снабжение без потерь',
    text: 'Потребности с площадки быстрее доходят до закупки и учета материалов.',
    icon: CubeIcon,
  },
  {
    title: 'Финансы и документы связаны',
    text: 'Платежи, акты и проектный контекст видны руководителю в одной логике.',
    icon: ClipboardDocumentListIcon,
  },
  {
    title: 'Руководитель видит картину',
    text: 'Отчетность и контроль собираются без ручного свода в конце периода.',
    icon: ChartBarSquareIcon,
  },
];

const featuredCapabilityIds = [
  'project-control',
  'supply-chain',
  'finance-control',
  'multi-org',
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
      <section className="relative overflow-hidden bg-steel-950 pt-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.22),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(125,211,252,0.16),_transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,1)_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-blueprint opacity-20 lg:block" />

        <div className="container-custom relative pb-20">
          <div className="grid gap-12 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                ProHelper для строительных компаний
              </div>
              <h1 className="mt-6 max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
                Управляйте стройкой в одной системе: объект, снабжение, финансы и документы.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                ProHelper помогает собрать рабочий процесс между офисом, площадкой, ПТО,
                снабжением и руководителем без разрозненных таблиц, чатов и ручного свода.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {marketingHeroFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="text-2xl font-bold text-white">{fact.value}</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-construction-200">
                      {fact.label}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/70">{fact.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-construction-400/10 blur-3xl" />
              <div className="relative rounded-[2.25rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="rounded-[1.75rem] border border-white/10 bg-steel-900/85 p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-construction-200">
                    Как выглядит рабочий контур
                  </div>
                  <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
                    Не набор функций, а единый маршрут от заявки до управленческого решения.
                  </h2>
                  <div className="mt-6 grid gap-4">
                    {heroSignals.map((signal) => {
                      const Icon = signal.icon;

                      return (
                        <div
                          key={signal.title}
                          className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-construction-200">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-base font-semibold text-white">{signal.title}</div>
                            <p className="mt-2 text-sm leading-6 text-white/70">{signal.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-white px-5 py-5 text-steel-950">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-construction-700">
                      Для кого
                    </div>
                    <div className="mt-3 text-sm leading-7 text-steel-700">
                      Подрядчик, генподрядчик, девелопер, ПТО и управляющая команда.
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] bg-construction-50 px-5 py-5 text-steel-950">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-construction-700">
                      Как запускаем
                    </div>
                    <div className="mt-3 text-sm leading-7 text-steel-700">
                      Начинаем с ключевого процесса и расширяем систему по мере роста команды.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Кому подходит"
            title="Сценарии для подрядчика, генподрядчика, девелопера и инженерной команды"
            description="Каждый сценарий собран вокруг реальной рабочей боли, а не вокруг случайного списка экранов."
            align="center"
          />
          <div className="mt-12 grid gap-5 xl:grid-cols-2">
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

      <section className="bg-concrete-50 py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Возможности"
            title="Что помогает держать процесс под контролем"
            description="Показываем только те контуры, которые уже имеют понятный рабочий сценарий в продукте."
          />

          <div className="mt-12 grid gap-5 xl:grid-cols-12">
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

      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Пакеты"
            title="Стартуйте с нужного контура, а не с перегруженного внедрения"
            description="Пакеты помогают выбрать точку входа: объект, снабжение, финансы, аналитика или корпоративный контур."
          />
          <div className="mt-12 grid gap-5 xl:grid-cols-2">
            {marketingPackages.slice(0, 4).map((item) => (
              <PackageFamilyCard key={item.slug} item={item} compact />
            ))}
          </div>
          <div className="mt-8">
            <CtaBand
              eyebrow="Как выбрать пакет"
              title="Поможем собрать минимально достаточный состав решения под ваш этап"
              description="На созвоне разложим текущий процесс по ролям и покажем, с какого контура лучше стартовать сейчас."
              actions={[
                { label: 'Перейти к пакетам', href: marketingPaths.pricing, primary: true },
                { label: 'Связаться с нами', href: marketingPaths.contact },
              ]}
              tone="light"
            />
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-24">
        <div className="container-custom grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.25rem] border border-steel-200 bg-white p-8 shadow-sm">
            <SectionHeader
              eyebrow="Запуск"
              title="Как проходит внедрение"
              description="Начинаем с процесса, который быстрее всего даст управляемый результат, и только потом наращиваем систему."
            />
            <div className="mt-8 space-y-4">
              {marketingLaunchSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[1.5rem] bg-concrete-50 px-5 py-5"
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

          <div className="rounded-[2.25rem] border border-steel-900 bg-steel-950 p-8">
            <SectionHeader
              eyebrow="Доверие"
              title="Безопасность и прозрачность без лишнего технарского шума"
              description="На сайте показываем то, что важно клиенту: разграничение доступа, понятную работу с документами и прозрачность процессов."
              tone="dark"
            />
            <div className="mt-8">
              <TrustFactList items={marketingTrustFacts} tone="dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <SectionHeader eyebrow="FAQ" title="Частые вопросы" align="center" />
          <div className="mx-auto mt-12 max-w-4xl">
            <FaqAccordion items={marketingFaqs} />
          </div>
        </div>
      </section>

      <section id="contact" className="bg-steel-950 py-16 lg:py-24">
        <div className="container-custom grid gap-10 xl:grid-cols-[0.95fr_0.85fr] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Демонстрация"
              title="Покажем ProHelper на вашем сценарии, а не на абстрактной витрине"
              description="Разберем роли команды, текущий процесс и подберем маршрут запуска: от первого объекта до корпоративного контура."
              tone="dark"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                'Разбор текущего процесса до показа системы.',
                'Фокус на той зоне, где команда теряет больше всего времени.',
                'Понятный маршрут запуска без лишних модулей.',
                'Отдельное обсуждение безопасности и юридических документов.',
              ].map((item) => (
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
