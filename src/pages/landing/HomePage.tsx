import { useEffect } from 'react';
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
import ganttScreenshot from '@/assets/marketing/gantt-schedule-30.png';
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
  'Реальный интерфейс с графиком работ, сроками и статусами задач.',
  'Видно, как команда контролирует путь, отклонения и зависимости.',
  'Демо можно показывать на живом сценарии клиента, а не на абстрактной витрине.',
];

const HomePage = () => {
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
    <div className="overflow-hidden bg-white">
      <PageHero
        eyebrow="Платформа управления строительством"
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
                title="Показываем не обещания, а реальный экран из ProHelper."
                description="На демонстрации клиент видит рабочие данные: задачи, сроки, критический путь и таймлайн по объекту."
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

            <div className="mt-8 rounded-[1.5rem] border border-construction-200 bg-construction-50/70 px-5 py-4 text-sm leading-7 text-steel-700">
              Ниже встроен реальный скрин из админки ProHelper с диаграммой Ганта.
            </div>
          </div>

          <div className="rounded-[2rem] border border-steel-200 bg-white p-3 shadow-[0_30px_70px_rgba(15,23,42,0.08)] lg:p-4">
            <div className="rounded-[1.5rem] border border-steel-100 bg-concrete-50 p-2">
              <img
                src={ganttScreenshot}
                alt="Диаграмма Ганта в ProHelper"
                className="h-auto w-full rounded-[1rem] border border-steel-200 object-cover"
              />
            </div>

            <div className="grid gap-4 px-2 pb-2 pt-5 sm:grid-cols-2 xl:grid-cols-3">
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

        <div className="container-custom mt-8">
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
