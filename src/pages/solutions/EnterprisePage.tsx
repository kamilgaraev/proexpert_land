import CtaBand from "@/components/marketing/blocks/CtaBand";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
  SurfaceBadges,
} from "@/components/marketing/MarketingPrimitives";
import {
  marketingCapabilityMatrix,
  marketingPaths,
  marketingSeo,
  marketingTrustFacts,
} from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

const enterpriseHighlights = [
  "Организации и объекты разделены внутри группы компаний.",
  "Права пользователей назначаются по роли и зоне ответственности.",
  "Управляющая команда работает со сводными данными доступных организаций.",
];

const enterpriseOperatingModel = [
  {
    title: "Структура группы компаний",
    description:
      "Организации, объекты, пользователи и документы сохраняют свои границы внутри общей структуры.",
    bullets: [
      "Определяется иерархия организаций и объектов.",
      "Для каждой роли задаётся доступ к нужным данным и действиям.",
      "Сводные показатели строятся из доступных руководителю данных.",
    ],
  },
  {
    title: "Подключение организаций",
    description:
      "Состав организаций, объектов и пользователей можно добавлять поэтапно, сохраняя принятые правила доступа.",
    bullets: [
      "Начало работы с выбранной организацией или группой объектов.",
      "Проверка ролей и доступов на реальных обязанностях сотрудников.",
      "Добавление следующих организаций и сводной отчётности.",
    ],
  },
];

const enterpriseTrustLayer = [
  "На демонстрации показываем разделение организаций, объектов и пользовательских прав.",
  "Разбираем роли, которым нужны операционные или сводные данные.",
  "Отдельно фиксируем требования к файлам, документам и интеграциям.",
];

const featuredCapabilities = marketingCapabilityMatrix.filter((capability) =>
  [
    "multi-org",
    "finance-control",
    "project-control",
    "document-control",
  ].includes(capability.id),
);

const enterpriseRelatedLinks = [
  {
    label: "Управление ресурсами строительства",
    href: marketingPaths.constructionErp,
    description:
      "Если нужно связать объекты, финансы и документы нескольких организаций.",
  },
  {
    label: "Интеграции и расширения",
    href: marketingPaths.integrations,
    description:
      "Подходит, когда группе компаний нужен внешний обмен согласованным набором данных.",
  },
  {
    label: "Контроль бюджета стройки",
    href: marketingPaths.constructionBudgetControl,
    description:
      "Для компаний, которым нужно отдельно вести лимиты, платежный календарь и финансовые показатели.",
  },
  {
    label: "Безопасность и доступ",
    href: marketingPaths.security,
    description:
      "Если в обсуждении на первом месте роли, разграничение доступа, журнал действий и требования корпоративной безопасности.",
  },
];

const EnterprisePage = () => {
  useSEO({
    ...marketingSeo.enterprise,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Группа компаний"
        title="Организации, объекты, права и сводные данные в МОСТ."
        description="Каждая организация сохраняет свои объекты и пользователей. Права ограничивают доступ к данным, а управляющая команда видит разрешённую сводную информацию по группе."
        actions={[
          {
            label: "Связаться с командой",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "Безопасность и доступ", href: marketingPaths.security },
        ]}
        nav={[
          { label: "Модель запуска", href: "#operating-model" },
          { label: "Корпоративные функции", href: "#enterprise-capabilities" },
          { label: "Следующий шаг", href: "#enterprise-cta" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно крупной команде
            </div>
            <div className="mt-4 grid gap-3">
              {enterpriseHighlights.map((item) => (
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

      <section id="operating-model" className="py-16 lg:py-20">
        <div className="container-custom grid gap-5 xl:grid-cols-2">
          {enterpriseOperatingModel.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                {item.title}
              </div>
              <p className="mt-4 text-sm leading-7 text-steel-600">
                {item.description}
              </p>
              <div className="mt-5 grid gap-3">
                {item.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="enterprise-capabilities"
        className="bg-concrete-50 py-16 lg:py-20"
      >
        <div className="container-custom">
          <SectionHeader
            eyebrow="Корпоративные функции"
            title="Разделение данных и управление на уровне группы."
            description="Ниже функции, связанные со структурой организаций, объектами, правами пользователей, финансами и сводной информацией."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {featuredCapabilities.map((capability) => (
              <article
                key={capability.id}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-steel-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                      {capability.businessContour}
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-steel-950">
                      {capability.title}
                    </h2>
                  </div>
                  <SurfaceBadges surfaces={capability.surfaces} />
                </div>
                <p className="mt-5 text-sm leading-7 text-steel-600">
                  {capability.publicClaim}
                </p>
                <div className="mt-5 grid gap-3">
                  {capability.outcomes.slice(0, 3).map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
          <div>
            <SectionHeader
              eyebrow="Как мы это обсуждаем"
              title="Для демонстрации нужна схема организаций и ролей."
              description="На встрече разбираем структуру группы, доступ пользователей к объектам и состав сводных данных для руководителей."
            />
            <div className="mt-8 grid gap-3">
              {enterpriseTrustLayer.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              На чём строится разделение данных
            </div>
            <div className="mt-5 grid gap-3">
              {marketingTrustFacts.slice(0, 4).map((fact) => (
                <article
                  key={fact.title}
                  className="rounded-[1.15rem] bg-concrete-50 px-4 py-4"
                >
                  <div className="text-base font-semibold text-steel-950">
                    {fact.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-steel-600">
                    {fact.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Связанные страницы"
            title="Подробнее о финансах, интеграциях и доступе."
            description="Выберите профильную страницу, если основной вопрос относится к одному процессу."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {enterpriseRelatedLinks.map((item) => (
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

      <section id="enterprise-cta" className="pb-16 pt-16 lg:pb-20 lg:pt-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Демонстрация"
            title="Посмотрите управление группой компаний в МОСТ."
            description="На встрече покажем разделение организаций, объектов и прав, затем разберём требования к сводным данным и документам."
            actions={[
              {
                label: "Связаться с нами",
                href: marketingPaths.contact,
                primary: true,
              },
              { label: "О продукте", href: marketingPaths.about },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;
