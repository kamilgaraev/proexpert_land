import {
  BuildingOfficeIcon,
  CloudIcon,
  CogIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import CtaBand from "@/components/marketing/blocks/CtaBand";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

type IntegrationStatus = "В продукте" | "Этап настройки" | "По запросу";

interface IntegrationItem {
  name: string;
  description: string;
  status: IntegrationStatus;
}

interface IntegrationCategory {
  category: string;
  icon: typeof BuildingOfficeIcon;
  items: IntegrationItem[];
}

const principles = [
  {
    title: "Состав данных до настройки",
    description:
      "До начала работ стороны фиксируют системы, справочники, документы, направление обмена и правила сверки.",
    icon: CogIcon,
  },
  {
    title: "Владелец каждого справочника",
    description:
      "Для юридических лиц, контрагентов и номенклатуры определяется система-источник и сотрудник, который отвечает за качество данных.",
    icon: CloudIcon,
  },
  {
    title: "Проверка после обмена",
    description:
      "Результат сверяется по согласованным полям. Расхождения разбираются до расширения обмена на новые данные.",
    icon: DevicePhoneMobileIcon,
  },
];

const integrationCategories: IntegrationCategory[] = [
  {
    category: "1С и ключевые справочники",
    icon: BuildingOfficeIcon,
    items: [
      {
        name: "Профиль подключения к 1С",
        description:
          "Настройки подключения и направление обмена согласуются для конкретной базы и организации.",
        status: "По запросу",
      },
      {
        name: "Сопоставление справочников",
        description:
          "Юридические лица, контрагенты и номенклатура сопоставляются по правилам, которые утверждает владелец данных.",
        status: "По запросу",
      },
      {
        name: "Сверка и расхождения",
        description:
          "После обмена ответственные проверяют результат и разбирают записи, которые не удалось сопоставить автоматически.",
        status: "По запросу",
      },
    ],
  },
  {
    category: "Документы и файлы",
    icon: CogIcon,
    items: [
      {
        name: "Файлы в МОСТ",
        description:
          "Файлы прикрепляются к объектам и рабочим записям внутри системы. Это базовая функция, а не внешняя интеграция.",
        status: "В продукте",
      },
      {
        name: "Документы для обмена",
        description:
          "До настройки составляется перечень документов, полей и статусов, которые должны передаваться между системами.",
        status: "Этап настройки",
      },
      {
        name: "Внешнее хранилище",
        description:
          "Обмен со сторонним архивом или хранилищем оценивается отдельно: универсальное подключение не заявляется.",
        status: "По запросу",
      },
    ],
  },
  {
    category: "Файловый обмен и другие системы",
    icon: CloudIcon,
    items: [
      {
        name: "Выгрузка и загрузка файлов",
        description:
          "CSV и Excel используются, если согласованного файлового обмена достаточно для задачи.",
        status: "По запросу",
      },
      {
        name: "Программный интерфейс",
        description:
          "Программный интерфейс (API) обсуждается для конкретного набора данных и операций. Публичного каталога готовых подключений нет.",
        status: "По запросу",
      },
      {
        name: "Почта, мессенджеры и боты",
        description:
          "Внешние каналы уведомлений оцениваются отдельно после проверки, что их нельзя заменить настройками внутри МОСТ.",
        status: "По запросу",
      },
    ],
  },
  {
    category: "Ответственность за настройку",
    icon: DevicePhoneMobileIcon,
    items: [
      {
        name: "Заказчик",
        description:
          "Назначает владельцев данных, предоставляет доступ к тестовой среде и утверждает правила сопоставления и сверки.",
        status: "Этап настройки",
      },
      {
        name: "Команда МОСТ",
        description:
          "Фиксирует согласованный состав обмена, настраивает поддерживаемую часть и передает результат на проверку.",
        status: "По запросу",
      },
      {
        name: "Совместная приемка",
        description:
          "Стороны проверяют контрольный набор данных, фиксируют расхождения и только затем переходят к рабочему обмену.",
        status: "По запросу",
      },
    ],
  },
];

const relatedScenarios = [
  {
    label: "Управление ресурсами строительства",
    href: marketingPaths.constructionErp,
    description:
      "Когда обмен данными связан с объектами, документами и финансами.",
  },
  {
    label: "CRM для строительной компании",
    href: marketingPaths.constructionCrm,
    description:
      "Если сначала нужно упорядочить объекты и задачи, а затем подключать внешние связи.",
  },
  {
    label: "Enterprise",
    href: marketingPaths.enterprise,
    description:
      "Подходит, если важно заранее обсудить корпоративные правила доступа, пилоты и архитектуру запуска.",
  },
  {
    label: "Связаться с нами",
    href: marketingPaths.contact,
    description:
      "Если хотите быстро сверить, что можно запускать уже сейчас, а что лучше вынести в отдельный этап.",
  },
];

const getStatusTone = (status: IntegrationStatus) => {
  switch (status) {
    case "В продукте":
      return "bg-emerald-100 text-emerald-800";
    case "Этап настройки":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

const IntegrationsPage = () => {
  useSEO({
    ...marketingSeo.integrations,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Обмен данными"
        title="Как МОСТ обменивается данными с 1С и другими системами."
        description="Интеграция начинается с перечня справочников и документов. Для каждого набора данных стороны определяют источник, направление обмена, правила сопоставления и ответственного за проверку."
        actions={[
          {
            label: "Связаться с командой",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "Интеграция с 1С", href: marketingPaths.oneCIntegration },
        ]}
        nav={[
          { label: "Принципы", href: "#principles" },
          { label: "Категории", href: "#categories" },
          { label: "Куда идти дальше", href: "#related" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что обсуждаем на старте
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Какие справочники и документы нужно передавать.",
                "Какая система считается источником каждого поля.",
                "Кто на стороне заказчика проверяет результат обмена.",
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
        }
      />

      <section id="principles" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Принципы"
            title="Что нужно определить до технической настройки."
            description="Интеграция не исправляет исходные справочники сама. Нужны согласованные правила, владельцы данных и контрольный набор для проверки."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-construction-50 text-construction-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-steel-950">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-steel-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="categories" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom space-y-6">
          {integrationCategories.map((category) => {
            const Icon = category.icon;

            return (
              <section
                key={category.category}
                className="rounded-[1.9rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-steel-950 text-construction-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-steel-950">
                    {category.category}
                  </h2>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-3">
                  {category.items.map((item) => (
                    <article
                      key={`${category.category}-${item.name}`}
                      className="rounded-[1.5rem] border border-steel-200 bg-concrete-50 px-5 py-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-lg font-bold text-steel-950">
                          {item.name}
                        </h3>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusTone(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-steel-600">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section id="related" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Куда идти дальше"
            title="Подробнее о данных, группе компаний и доступе."
            description="Выберите профильную страницу, если обмен относится к управлению объектами, корпоративной структуре или безопасности."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {relatedScenarios.map((item) => (
              <MarketingLink
                key={item.href}
                href={item.href}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:border-construction-300 hover:bg-construction-50/40"
              >
                <div className="text-xl font-bold text-steel-950">
                  {item.label}
                </div>
                <p className="mt-3 text-sm leading-7 text-steel-600">
                  {item.description}
                </p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 pt-16 lg:pb-20 lg:pt-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Обсуждение интеграции"
            title="Подготовьте перечень систем, справочников и документов."
            description="На встрече разберём направление обмена, владельцев данных, контрольную сверку и границы ответственности сторон."
            actions={[
              {
                label: "Связаться с командой",
                href: marketingPaths.contact,
                primary: true,
              },
              { label: "Enterprise", href: marketingPaths.enterprise },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default IntegrationsPage;
