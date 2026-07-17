import { useEffect } from "react";
import { Link } from "react-router-dom";
import ContactForm from "@/components/landing/ContactForm";
import CapabilityCard from "@/components/marketing/blocks/CapabilityCard";
import CtaBand from "@/components/marketing/blocks/CtaBand";
import FaqAccordion from "@/components/marketing/blocks/FaqAccordion";
import AdminProductDemo from "@/components/marketing/blocks/AdminProductDemo";
import MarketingPricingSnapshot from "@/components/marketing/blocks/MarketingPricingSnapshot";
import PackageFamilyCard from "@/components/marketing/blocks/PackageFamilyCard";
import TrustFactList from "@/components/marketing/blocks/TrustFactList";
import {
  PageHero,
  PageSectionNav,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import ganttScreenshot from "@/assets/marketing/prohelper-gantt-showcase.jpg";
import paymentsScreenshot from "@/assets/marketing/prohelper-payments-showcase.jpg";
import siteRequestsScreenshot from "@/assets/marketing/prohelper-site-requests-showcase.jpg";
import warehouseScreenshot from "@/assets/marketing/prohelper-warehouse-showcase.jpg";
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
} from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { useSEO } from "@/hooks/useSEO";

const homeSections = [
  { label: "Зачем", href: "#pain" },
  { label: "Система", href: "#product-system" },
  { label: "Для кого", href: "#audiences" },
  { label: "Возможности", href: "#product" },
  { label: "Команда", href: "#team" },
  { label: "Пакеты", href: "#packages" },
  { label: "Контакт", href: "#contact" },
];

const featuredCapabilityIds = [
  "project-control",
  "supply-chain",
  "finance-control",
  "pir-project-documentation",
  "quality-handover",
  "construction-safety",
  "machinery-labor",
  "change-control",
  "multi-org",
];

const contactHighlights = [
  "Покажем разделы, которые относятся к вашей задаче.",
  "Разберём роли сотрудников и доступ к данным.",
  "Уточним состав пользователей и данные для начала работы.",
];

const painItems = [
  {
    title: "Статусы живут в чатах",
    text: "Руководитель узнает реальное состояние объекта через звонки, пересланные фото и ручной свод к планерке.",
  },
  {
    title: "Снабжение отрывается от графика",
    text: "Заявки, остатки, закупки и платежи не связаны с этапами работ, поэтому дефицит материалов всплывает слишком поздно.",
  },
  {
    title: "Деньги не привязаны к объекту",
    text: "Платежи, договоры, акты и лимиты собираются в разных таблицах, а отклонения становятся видны уже после факта.",
  },
  {
    title: "ПИР, качество и приемка идут отдельно",
    text: "Проектные версии, дефекты, перечень замечаний при приёмке (punch-list) и исполнительная документация живут рядом с проектом только в ручных отчётах.",
  },
  {
    title: "Ресурсы и безопасность видны поздно",
    text: "Техника, выработка, персонал, инструктажи и инциденты фиксируются отдельно от сроков, бюджета и ежедневного контроля.",
  },
];

const teamRoleItems = [
  {
    role: "Руководитель",
    text: "Видит портфель объектов, деньги, риски и задержки без ручной консолидации отчетов.",
  },
  {
    role: "Прораб",
    text: "Ставит статусы, отправляет заявки и фиксирует работы с телефона прямо на площадке.",
  },
  {
    role: "Снабженец",
    text: "Понимает потребность по объектам, контролирует закупки, поставки и остатки материалов.",
  },
  {
    role: "Финансист",
    text: "Связывает платежи, документы, лимиты и обязательства с конкретными проектами.",
  },
  {
    role: "Проектная команда",
    text: "Ведёт проектную и рабочую документацию, формат IFC для информационных моделей, замечания, нормоконтроль и выпуск комплектов.",
  },
  {
    role: "Стройконтроль и ОТ",
    text: "Фиксирует дефекты, повторные проверки, инструктажи, нарушения, инциденты и предписания.",
  },
  {
    role: "Механик и бригады",
    text: "Видит технику, смены, простои, ГСМ, наряды, выработку и трудозатраты по объектам.",
  },
];

const productScreenshots = [
  {
    title: "График",
    description: "Задачи, зависимости и план-факт по срокам.",
    image: ganttScreenshot,
    alt: "Диаграмма Ганта с задачами и сроками в МОСТ",
  },
  {
    title: "Склад",
    description: "Остатки, резервы и складские операции.",
    image: warehouseScreenshot,
    alt: "Рабочий экран склада в МОСТ",
  },
  {
    title: "Платежи",
    description: "Реестр документов с суммами, сроками и сигналами.",
    image: paymentsScreenshot,
    alt: "Реестр платежных документов в МОСТ",
  },
  {
    title: "Заявки",
    description: "Запросы с объекта, статусы и связь с платежами.",
    image: siteRequestsScreenshot,
    alt: "Реестр заявок с объекта в МОСТ",
  },
];

const HomePage = () => {
  useSEO({
    ...marketingSeo.home,
    type: "website",
  });
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("marketing_home");
  }, [trackPageView]);

  const featuredCapabilities = featuredCapabilityIds
    .map((id) =>
      marketingCapabilityMatrix.find((capability) => capability.id === id),
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="marketing-page-shell overflow-hidden">
      <PageHero
        title="Объекты, задачи, документы, снабжение и финансы — в МОСТ."
        description="МОСТ — система для ежедневной работы строительной компании. Данные с объекта доступны офису, а руководитель видит сроки, ответственных, материалы и деньги без ручного свода."
        actions={[
          { label: "Запросить демонстрацию", href: "#contact", primary: true },
          { label: "Посмотреть возможности", href: marketingPaths.features },
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
                Рабочий экран МОСТ
              </div>
              <div className="mt-2 text-lg font-bold text-steel-950">
                {productScreenshots[0].title}
              </div>
              <p className="mt-2 text-sm leading-7 text-steel-600">
                {productScreenshots[0].description}
              </p>
            </div>
          </div>
        }
      />

      <section className="border-b border-steel-100 bg-white py-8">
        <div className="container-custom">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-3">
              {marketingHeroFacts.map((fact) => (
                <article
                  key={fact.label}
                  className="rounded-[1.25rem] bg-concrete-50 px-4 py-4"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-steel-500">
                    {fact.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-steel-950">
                    {fact.value}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-steel-600">
                    {fact.detail}
                  </p>
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
            eyebrow="Зачем нужна система"
            title="Рабочие данные по объекту не должны зависеть от чатов и ручных отчётов."
            description="МОСТ связывает задачи, документы, заявки на материалы, платежи и ответственных. Каждая запись относится к конкретному объекту и этапу работ."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {painItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="text-xl font-bold text-steel-950">
                  {item.title}
                </div>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-steel-950 p-6 text-white lg:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Что меняется
            </div>
            <div className="mt-3 max-w-4xl text-2xl font-bold leading-tight">
              Объект становится общей точкой для задач, документов, снабжения,
              качества, ресурсов и финансов.
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
              Сотрудники работают со своими разделами, а руководитель получает
              сводную картину из тех же данных.
            </p>
          </div>
        </div>
      </section>

      <AdminProductDemo />

      <section id="audiences" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Для кого"
            title="Подрядчикам, генподрядчикам, девелоперам и техническим заказчикам."
            description="Выберите тип компании, затем посмотрите задачи конкретных ролей: руководителя, ПТО, снабжения, финансовой службы или площадки."
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
                    <h3 className="mt-2 text-2xl font-bold text-steel-950">
                      {segment.title}
                    </h3>
                  </div>
                  <Link
                    to={marketingPaths.solutions}
                    className="text-sm font-medium text-steel-500 transition hover:text-construction-700"
                  >
                    О решении
                  </Link>
                </div>
                <p className="mt-5 text-sm leading-7 text-steel-600">
                  <span className="font-medium text-steel-950">Проблема:</span>{" "}
                  {segment.challenge}
                </p>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  <span className="font-medium text-steel-950">
                    Что меняется:
                  </span>{" "}
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
            title="Функции для объекта, документов, снабжения, финансов и производства."
            description="Возможности сгруппированы по рабочим направлениям. Можно изучить отдельный блок или перейти к полному обзору продукта."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {featuredCapabilities.map((capability) => (
              <CapabilityCard key={capability.id} capability={capability} />
            ))}
          </div>

          <div className="mt-8">
            <PageSectionNav
              items={[
                {
                  label: "Смотреть все возможности",
                  href: marketingPaths.features,
                },
                { label: "Решения по ролям", href: marketingPaths.solutions },
                {
                  label: "Безопасность и доступ",
                  href: marketingPaths.security,
                },
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
            eyebrow="Страницы по задачам"
            title="Отдельные страницы под роли, задачи и основные процессы стройки."
            description="Перейдите к странице своей роли, типа компании или рабочего процесса."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketingCommercialLandingLinks.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300"
              >
                <div className="text-lg font-bold text-steel-950">
                  {item.label}
                </div>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <PageSectionNav
              items={[
                {
                  label: "CRM для строительной компании",
                  href: marketingPaths.constructionCrm,
                },
                {
                  label: "Управление ресурсами строительства",
                  href: marketingPaths.constructionErp,
                },
                {
                  label: "ПИР и проектная документация",
                  href: marketingPaths.pirProjectDocumentation,
                },
                {
                  label: "Охрана труда",
                  href: marketingPaths.constructionSafety,
                },
                {
                  label: "Учет материалов",
                  href: marketingPaths.materialAccounting,
                },
                {
                  label: "Исполнительная документация",
                  href: marketingPaths.constructionDocuments,
                },
                {
                  label: "Запросы информации и изменения",
                  href: marketingPaths.changeControl,
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section id="team" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Один сервис для команды"
            title="Каждая роль работает со своими данными, руководитель видит общую картину."
            description="Права и рабочие разделы зависят от обязанностей сотрудника. Объекты и связанные записи остаются общей основой для всех участников."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {teamRoleItems.map((item) => (
              <article
                key={item.role}
                className="rounded-[1.6rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                  {item.role}
                </div>
                <p className="mt-4 text-sm leading-7 text-steel-700">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-center">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                  Работа на объекте
                </div>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-steel-950">
                  Прораб работает на площадке, а офис сразу видит изменения.
                </h2>
              </div>
              <p className="text-sm leading-7 text-steel-600">
                Площадка передаёт заявки, статусы, фотографии и замечания в
                систему. Офис видит эти данные без отдельного отчёта из
                мессенджера.
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
            title="Подключайте пакеты по направлениям работы."
            description="Выберите один или несколько пакетов либо полный комплект. Состав и цены подробно указаны на странице пакетов."
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
              title="Что нужно согласовать перед началом работы."
              description="Тип компании, роли, первый процесс, правила доступа и данные для переноса."
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
                    <div className="text-base font-semibold text-steel-950">
                      {step.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-steel-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CtaBand
            eyebrow="Подключение"
            title="Начните с бесплатной базы и добавьте нужные процессы."
            description="Десять бизнес-пакетов подключаются независимо. Полный комплект выбирается отдельно и не включается автоматически."
            actions={[
              {
                label: "Создать бесплатную базу",
                href: "/register",
                primary: true,
              },
              {
                label: "Собрать набор пакетов",
                href: `${marketingPaths.pricing}#constructor`,
              },
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
              title="Частые вопросы о подключении, ролях и функциях."
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
              title="Запросите демонстрацию МОСТ."
              description="Расскажите о компании и задаче. На демонстрации покажем выбранные разделы МОСТ."
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
