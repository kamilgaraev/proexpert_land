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
import "@/styles/marketing-product-story.css";

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
          "Чертежи, акты и другие файлы можно прикрепить к объекту или рабочей записи. Команда найдёт их рядом с нужной задачей.",
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
          "Расскажите, где хранится ваш архив и какие документы нужно передавать. Возможность подключения, состав работ и стоимость оценим отдельно.",
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
          "Для вашей системы отдельно оценим обмен через API: какие данные передавать, как часто и кто проверяет результат. Подключение требует предварительного согласования.",
        status: "По запросу",
      },
      {
        name: "Почта, мессенджеры и боты",
        description:
          "Обсудим, кому и о каких событиях нужно сообщать. Возможность отправки во внешние каналы и стоимость настройки оценим отдельно.",
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
    label: "Для группы компаний",
    href: marketingPaths.enterprise,
    description:
      "Доступ сотрудников и обмен данными между несколькими организациями.",
  },
  {
    label: "Связаться с нами",
    href: marketingPaths.contact,
    description:
      "Обсудим ваши системы, нужные документы и порядок подключения.",
  },
];

const IntegrationsPage = () => {
  useSEO({
    ...marketingSeo.integrations,
    type: "website",
  });

  return (
    <div className="marketing-page-shell most-integrations">
      <PageHero
        eyebrow="Обмен данными"
        title="Как МОСТ обменивается данными с внешними системами."
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
          { label: "Связанные задачи", href: "#related" },
        ]}
      />

      <section id="principles" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Принципы"
            title="Что нужно определить до технической настройки."
            description="Интеграция не исправляет исходные справочники сама. Нужны согласованные правила, владельцы данных и контрольный набор для проверки."
          />

          <div className="most-integration-path">
            {principles.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="most-integration-step">
                  <div className="text-construction-700">
                    <Icon className="most-icon" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-steel-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-steel-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="categories" className="most-content-tint py-16 lg:py-20">
        <div className="container-custom space-y-6">
          {integrationCategories.map((category) => {
            const Icon = category.icon;

            return (
              <section
                key={category.category}
                className="most-integration-group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-construction-700">
                    <Icon className="most-icon" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-steel-950">
                    {category.category}
                  </h2>
                </div>

                <div className="most-integration-items">
                  {category.items.map((item) => (
                    <article
                      key={`${category.category}-${item.name}`}
                      className="most-integration-item"
                    >
                      <div className="most-integration-item-heading">
                        <h3 className="text-lg font-bold text-steel-950">
                          {item.name}
                        </h3>
                        <span className="most-integration-status">
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
                className="most-integration-related"
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
              { label: "Для группы компаний", href: marketingPaths.enterprise },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default IntegrationsPage;
