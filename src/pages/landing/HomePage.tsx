import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/landing/ContactForm';
import CapabilityCard from '@/components/marketing/blocks/CapabilityCard';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import FaqAccordion from '@/components/marketing/blocks/FaqAccordion';
import AdminProductDemo from '@/components/marketing/blocks/AdminProductDemo';
import MarketingPricingSnapshot from '@/components/marketing/blocks/MarketingPricingSnapshot';
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
  { label: 'Боли', href: '#pain' },
  { label: 'Система', href: '#product-system' },
  { label: 'Для кого', href: '#audiences' },
  { label: 'Контуры', href: '#product' },
  { label: 'Команда', href: '#team' },
  { label: 'Пакеты', href: '#packages' },
  { label: 'Контакт', href: '#contact' },
];

const featuredCapabilityIds = [
  'project-control',
  'supply-chain',
  'finance-control',
  'pir-project-documentation',
  'quality-handover',
  'construction-safety',
  'machinery-labor',
  'change-control',
  'multi-org',
];

const contactHighlights = [
  'Покажем релевантный сценарий под ваш тип компании.',
  'Разберем, с какого контура лучше стартовать.',
  'Сразу обсудим сроки запуска и состав команды.',
];

const painItems = [
  {
    title: 'Статусы живут в чатах',
    text: 'Руководитель узнает реальное состояние объекта через звонки, пересланные фото и ручной свод к планерке.',
  },
  {
    title: 'Снабжение отрывается от графика',
    text: 'Заявки, остатки, закупки и платежи не связаны с этапами работ, поэтому дефицит материалов всплывает слишком поздно.',
  },
  {
    title: 'Деньги не привязаны к объекту',
    text: 'Платежи, договоры, акты и лимиты собираются в разных таблицах, а отклонения становятся видны уже после факта.',
  },
  {
    title: 'ПИР, качество и приемка идут отдельно',
    text: 'Проектные версии, дефекты, punch-list и исполнительная документация живут рядом с проектом только в ручных отчетах.',
  },
  {
    title: 'Ресурсы и безопасность видны поздно',
    text: 'Техника, выработка, персонал, инструктажи и инциденты фиксируются отдельно от сроков, бюджета и ежедневного контроля.',
  },
];

const teamRoleItems = [
  {
    role: 'Руководитель',
    text: 'Видит портфель объектов, деньги, риски и задержки без ручной консолидации отчетов.',
  },
  {
    role: 'Прораб',
    text: 'Ставит статусы, отправляет заявки и фиксирует работы с телефона прямо на площадке.',
  },
  {
    role: 'Снабженец',
    text: 'Понимает потребность по объектам, контролирует закупки, поставки и остатки материалов.',
  },
  {
    role: 'Финансист',
    text: 'Связывает платежи, документы, лимиты и обязательства с конкретными проектами.',
  },
  {
    role: 'Проектная команда',
    text: 'Ведет ПД, РД, IFC, замечания, нормоконтроль и выпуск комплектов в проектном контексте.',
  },
  {
    role: 'Стройконтроль и ОТ',
    text: 'Фиксирует дефекты, повторные проверки, инструктажи, нарушения, инциденты и предписания.',
  },
  {
    role: 'Механик и бригады',
    text: 'Видит технику, смены, простои, ГСМ, наряды, выработку и трудозатраты по объектам.',
  },
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
    <div className="marketing-page-shell overflow-hidden">
      <PageHero
        title="Управляйте стройкой от ПИР до приемки в одной системе."
        description="ProHelper помогает подрядчику, генподрядчику и девелоперу связать офис, площадку, ПИР, снабжение, финансы, качество, безопасность, ресурсы и заказчика в одном рабочем контуре."
        actions={[
          { label: 'Запросить демонстрацию', href: '#contact', primary: true },
          { label: 'Посмотреть пакеты', href: '#pricing' },
        ]}
        aside={
          <div className="overflow-hidden rounded-[1.75rem] border border-steel-200 bg-white shadow-[0_30px_70px_rgba(15,23,42,0.1)]">
            <img
              src={productScreenshots[0].image}
              alt={productScreenshots[0].alt}
              className="h-auto w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                Рабочий экран ProHelper
              </div>
              <div className="mt-2 text-lg font-bold text-steel-950">{productScreenshots[0].title}</div>
              <p className="mt-2 text-sm leading-7 text-steel-600">{productScreenshots[0].description}</p>
            </div>
          </div>
        }
      />

      <section className="border-b border-steel-100 bg-white py-8">
        <div className="container-custom">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-3">
              {marketingHeroFacts.map((fact) => (
                <article key={fact.label} className="rounded-[1.25rem] bg-concrete-50 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-steel-500">
                    {fact.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-steel-950">{fact.value}</div>
                  <p className="mt-2 text-sm leading-6 text-steel-600">{fact.detail}</p>
                </article>
              ))}
            </div>
            <PageSectionNav items={homeSections} className="lg:max-w-[360px]" />
          </div>
        </div>
      </section>

      <section id="pain" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Почему меняют таблицы"
            title="Когда стройка живет в Excel, чатах и звонках, контроль появляется слишком поздно."
            description="Главная ценность ProHelper — собрать операционный контур стройки так, чтобы решения принимались по актуальным данным: от проектных версий и снабжения до качества, безопасности, ресурсов, изменений и приемки."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {painItems.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm">
                <div className="text-xl font-bold text-steel-950">{item.title}</div>
                <p className="mt-4 text-sm leading-7 text-steel-600">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-steel-950 p-6 text-white lg:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Что меняется
            </div>
            <div className="mt-3 max-w-4xl text-2xl font-bold leading-tight">
              Объект, ПИР, заявки, материалы, качество, безопасность, ресурсы, изменения, документы и деньги становятся частями одного маршрута.
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Команда видит не разрозненные файлы, а связанный процесс: что нужно сделать, кто отвечает, какие ресурсы нужны и где появляются отклонения.
            </p>
          </div>
        </div>
      </section>

      <AdminProductDemo />

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
                    <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-construction-700">
                      {segment.audience}
                    </div>
                    <h3 className="mt-2 text-2xl font-bold text-steel-950">{segment.title}</h3>
                  </div>
                  <Link
                    to={marketingPaths.solutions}
                    className="text-sm font-medium text-steel-500 transition hover:text-construction-700"
                  >
                    Полный сценарий
                  </Link>
                </div>
                <p className="mt-5 text-sm leading-7 text-steel-600">
                  <span className="font-medium text-steel-950">Проблема:</span> {segment.challenge}
                </p>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  <span className="font-medium text-steel-950">Что меняется:</span>{' '}
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
            eyebrow="Что внутри"
            title="Один продукт для объекта, ПИР, снабжения, финансов, качества, безопасности и ресурсов."
            description="Показываем не перечень функций, а рабочие контуры, которые связывают офис, площадку, проектную команду, стройконтроль и руководителя."
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

          <div className="mt-8 rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <TrustFactList items={marketingTrustFacts} />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Сценарии"
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
                { label: 'ПИР и проектная документация', href: marketingPaths.pirProjectDocumentation },
                { label: 'Охрана труда', href: marketingPaths.constructionSafety },
                { label: 'Учет материалов', href: marketingPaths.materialAccounting },
                { label: 'Исполнительная документация', href: marketingPaths.constructionDocuments },
                { label: 'RFI и изменения', href: marketingPaths.changeControl },
              ]}
            />
          </div>
        </div>
      </section>

      <section id="team" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Один сервис для команды"
            title="Каждая роль видит свой участок, а руководитель — всю стройку целиком."
            description="ProHelper не заменяет людей новым хаосом из экранов: он соединяет роли вокруг объекта, проектной документации, сроков, материалов, качества, безопасности, ресурсов и денег."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {teamRoleItems.map((item) => (
              <article key={item.role} className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                  {item.role}
                </div>
                <p className="mt-4 text-sm leading-7 text-steel-700">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-center">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                  Мобильный контур
                </div>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-steel-950">
                  Прораб работает на площадке, а офис сразу видит изменения.
                </h2>
              </div>
              <p className="text-sm leading-7 text-steel-600">
                Заявки, статусы, фотофиксация и замечания не теряются в мессенджерах. Полевой контур становится частью общего процесса, а не отдельным источником ручной отчетности.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingPricingSnapshot />

      <section id="packages" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Пакеты"
            title="Пакеты под текущий этап компании."
            description="Начните с нужного контура и расширяйте систему по мере роста команды и числа объектов."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {marketingPackages.slice(0, 6).map((item) => (
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
            description="На встрече разложим роли, процессы и ограничения, после чего предложим стартовый контур без лишних направлений."
            actions={[
              { label: 'Зарегистрироваться', href: '/register?plan=business', primary: true },
              { label: 'Сравнить тарифы', href: marketingPaths.pricing },
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
