import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/landing/ContactForm';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import FaqAccordion from '@/components/marketing/blocks/FaqAccordion';
import PackageFamilyCard from '@/components/marketing/blocks/PackageFamilyCard';
import TrustFactList from '@/components/marketing/blocks/TrustFactList';
import {
  PageHero,
  PageSectionNav,
  SectionHeader,
} from '@/components/marketing/MarketingPrimitives';
import ganttScreenshot from '@/assets/marketing/prohelper-gantt-showcase.jpg';
import paymentsScreenshot from '@/assets/marketing/prohelper-payments-showcase.jpg';
import siteRequestsScreenshot from '@/assets/marketing/prohelper-site-requests-showcase.jpg';
import warehouseScreenshot from '@/assets/marketing/prohelper-warehouse-showcase.jpg';
import {
  marketingCapabilityMatrix,
  marketingCommercialLandingLinks,
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

const homeSections = [
  { label: 'Для кого', href: '#audiences' },
  { label: 'Контуры', href: '#product' },
  { label: 'Доверие', href: '#proof' },
  { label: 'Пакеты', href: '#packages' },
  { label: 'Запуск', href: '#launch' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Контакт', href: '#contact' },
];

const featuredCapabilityIds = [
  'project-control',
  'supply-chain',
  'finance-control',
  'multi-org',
];

const contactHighlights = [
  'Покажем релевантный сценарий под ваш тип компании.',
  'Разберем, с какого контура лучше стартовать.',
  'Сразу обсудим сроки запуска и состав команды.',
];

const proofHighlights = [
  'График показывает задачи, сроки, статусы и фактический прогресс по объекту.',
  'Склад, платежи и заявки остаются в той же рабочей логике проекта.',
  'Можно пройти путь от заявки с площадки до контроля платежа.',
];

const productScreenshots = [
  {
    title: 'График',
    description: 'Задачи, зависимости и план-факт по срокам.',
    image: ganttScreenshot,
    alt: 'Диаграмма Ганта с задачами и сроками в ProHelper',
  },
  {
    title: 'Склад',
    description: 'Остатки, резервы и быстрые складские сценарии.',
    image: warehouseScreenshot,
    alt: 'Рабочий экран склада в ProHelper',
  },
  {
    title: 'Платежи',
    description: 'Реестр документов с суммами, сроками и сигналами.',
    image: paymentsScreenshot,
    alt: 'Реестр платежных документов в ProHelper',
  },
  {
    title: 'Заявки',
    description: 'Запросы с объекта, статусы и связь с платежами.',
    image: siteRequestsScreenshot,
    alt: 'Реестр заявок с объекта в ProHelper',
  },
];

const HomePage = () => {
  const [activeScreenshot, setActiveScreenshot] = useState(productScreenshots[0]);

  const { addFAQSchema } = useSEO({
    ...marketingSeo.home,
    type: 'website',
  });
  const { trackPageView } = useAnalytics();

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
    <div className="marketing-page-shell overflow-hidden bg-white">
      <PageHero
        title="Управляйте объектами, снабжением и финансами в одной системе."
        description="ProHelper помогает подрядчику, генподрядчику и девелоперу связать офис, площадку и руководителя в одном рабочем контуре."
        actions={[
          { label: 'Запросить демонстрацию', href: '#contact', primary: true },
          { label: 'Посмотреть решения', href: marketingPaths.solutions },
        ]}
        nav={homeSections}
        aside={
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                Что внутри ProHelper
              </div>
              <div className="mt-4 space-y-3">
                {[
                  'Объект, заявки и исполнение.',
                  'Снабжение, материалы и склад.',
                  'Финансы, документы и контроль.',
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
              {marketingHeroFacts.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-steel-200 bg-white p-5 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                    {fact.label}
                  </div>
                  <div className="mt-3 text-2xl font-bold text-steel-950">{fact.value}</div>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{fact.detail}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section id="audiences" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Для кого"
            title="Решения для подрядчика, генподрядчика, девелопера и инженерной команды."
            description="Выберите сценарий, который ближе всего к вашей структуре и текущим задачам."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {marketingSolutionSegments.map((segment) => (
              <article
                key={segment.id}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-steel-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                      {segment.audience}
                    </div>
                    <h3 className="mt-2 text-2xl font-bold text-steel-950">{segment.title}</h3>
                  </div>
                  <Link
                    to={marketingPaths.solutions}
                    className="text-sm font-semibold text-steel-500 transition hover:text-construction-700"
                  >
                    Полный сценарий
                  </Link>
                </div>
                <p className="mt-5 text-sm leading-7 text-steel-600">
                  <span className="font-semibold text-steel-950">Проблема:</span> {segment.challenge}
                </p>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  <span className="font-semibold text-steel-950">Что меняется:</span>{' '}
                  {segment.transformation}
                </p>
                <div className="mt-5 grid gap-3">
                  {segment.workflows.map((workflow) => (
                    <div
                      key={workflow}
                      className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-6 text-steel-700"
                    >
                      {workflow}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Контуры"
            title="Один продукт для объекта, снабжения, финансов и корпоративного контроля."
            description="На главной собраны основные контуры, с которых компании обычно начинают запуск."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {featuredCapabilities.map((capability) => (
              <CapabilityCard key={capability.id} capability={capability} />
            ))}
          </div>

          <div className="mt-8">
            <PageSectionNav
              items={[
                { label: 'Смотреть все возможности', href: marketingPaths.features },
                { label: 'Сценарии по ролям', href: marketingPaths.solutions },
                { label: 'Безопасность и доступ', href: marketingPaths.security },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Популярные сценарии"
            title="Отдельные страницы под роли, задачи и ключевые процессы стройки."
            description="Здесь можно сразу перейти к тому сценарию, который ближе всего к вашей роли, текущей задаче или формату работы компании."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingCommercialLandingLinks.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300"
              >
                <div className="text-lg font-bold text-steel-950">{item.label}</div>
                <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <PageSectionNav
              items={[
                { label: 'CRM для строительной компании', href: marketingPaths.constructionCrm },
                { label: 'ERP для строительства', href: marketingPaths.constructionErp },
                { label: 'Учет материалов', href: marketingPaths.materialAccounting },
                { label: 'Исполнительная документация', href: marketingPaths.constructionDocuments },
              ]}
            />
          </div>
        </div>
      </section>

            <section id="proof" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
          <div className="flex flex-col justify-between">
            <div>
              <SectionHeader
                eyebrow="Доверие"
                title="Программа для контроля сроков, заявок, склада и платежей на стройке."
                description="В одном месте видны задачи, сроки, критический путь и таймлайн по объекту."
              />

              <div className="mt-8 grid gap-3">
                {proofHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="rounded-[2rem] border border-steel-200 bg-white p-2 shadow-[0_30px_70px_rgba(15,23,42,0.1)] lg:p-3">
            <div className="overflow-hidden rounded-[1.5rem] border border-steel-100 bg-concrete-50">
              <img
                src={activeScreenshot.image}
                alt={activeScreenshot.alt}
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="px-3 py-4 lg:px-4">
              <div className="text-lg font-bold text-steel-950">{activeScreenshot.title}</div>
              <p className="mt-2 text-sm leading-7 text-steel-600">{activeScreenshot.description}</p>
            </div>
          </div>
        </div>

        <div className="container-custom mt-16 lg:mt-20">
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
            {productScreenshots.map((screenshot) => (
              <button
                type="button"
                key={screenshot.title}
                onClick={() => setActiveScreenshot(screenshot)}
                onMouseEnter={() => setActiveScreenshot(screenshot)}
                aria-pressed={activeScreenshot.title === screenshot.title}
                className={`overflow-hidden rounded-[1.75rem] border bg-white text-left shadow-[0_22px_52px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(15,23,42,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-construction-400 ${
                  activeScreenshot.title === screenshot.title
                    ? 'border-construction-300 ring-2 ring-construction-100'
                    : 'border-steel-200'
                }`}
              >
                <img
                  src={screenshot.image}
                  alt={screenshot.alt}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
                <div className="border-t border-steel-100 px-5 py-5">
                  <h3 className="text-lg font-bold text-steel-950">{screenshot.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-steel-600">{screenshot.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="container-custom mt-14 lg:mt-16">
          <div className="rounded-[2rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="grid gap-4 sm:grid-cols-3">
              {marketingHeroFacts.map((fact) => (
                <article key={fact.label} className="rounded-[1.25rem] bg-concrete-50 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                    {fact.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-steel-950">{fact.value}</div>
                  <p className="mt-2 text-sm leading-6 text-steel-600">{fact.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="container-custom mt-10 lg:mt-12">
          <div className="rounded-[2rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <TrustFactList items={marketingTrustFacts} />
          </div>
        </div>
      </section>

      <section id="packages" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Пакеты"
            title="Пакеты под текущий этап компании."
            description="Начните с нужного контура и расширяйте систему по мере роста команды и числа объектов."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {marketingPackages.slice(0, 4).map((item) => (
              <PackageFamilyCard key={item.slug} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      <section id="launch" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <SectionHeader
              eyebrow="Запуск"
              title="Как проходит запуск ProHelper."
              description="Идем поэтапно: от диагностики процесса до первого рабочего результата."
            />

            <div className="mt-8 space-y-4">
              {marketingLaunchSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[1.25rem] bg-concrete-50 px-4 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-steel-950 text-sm font-bold text-construction-200">
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

          <CtaBand
            eyebrow="Маршрут запуска"
            title="Подберем состав решения под ваш процесс и масштаб компании."
            description="На встрече разложим роли, процессы и ограничения, после чего предложим стартовый контур без лишних модулей."
            actions={[
              { label: 'Перейти к пакетам', href: marketingPaths.pricing, primary: true },
              { label: 'Связаться с нами', href: '#contact' },
            ]}
            tone="dark"
          />
        </div>
      </section>

      <section id="faq" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeader
              eyebrow="FAQ"
              title="Частые вопросы о запуске, ролях и сценариях работы."
              description="Коротко отвечаем на основные вопросы до демонстрации."
            />
          </div>
          <FaqAccordion items={marketingFaqs} />
        </div>
      </section>

      <section id="contact" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(420px,0.92fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Контакт"
              title="Запросите демонстрацию ProHelper."
              description="Расскажите коротко о компании и процессе, а мы покажем релевантный сценарий работы."
            />
            <div className="mt-8 grid gap-3">
              {contactHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <ContactForm variant="full" className="shadow-none" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
