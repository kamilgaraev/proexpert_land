import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import CtaBand from "@/components/marketing/blocks/CtaBand";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

const capabilityCards = [
  {
    title: "Портфель объектов",
    description:
      "Руководитель сравнивает стадии, сроки и открытые вопросы по объектам портфеля.",
    icon: ChartBarIcon,
  },
  {
    title: "Сроки и бюджет",
    description:
      "Плановые сроки, обязательства и платежи рассматриваются по конкретному объекту и этапу.",
    icon: BanknotesIcon,
  },
  {
    title: "Подрядчики и замечания",
    description:
      "Сроки, статусы, замечания и ответственность внешних исполнителей доступны проектной команде.",
    icon: UsersIcon,
  },
  {
    title: "Документы и готовность",
    description:
      "Документы, замечания и фактический прогресс относятся к этапу реализации объекта.",
    icon: BuildingStorefrontIcon,
  },
  {
    title: "Отчётность",
    description:
      "Сводные данные формируются из статусов объектов, сроков, замечаний и финансовых записей.",
    icon: CogIcon,
  },
  {
    title: "Права доступа",
    description:
      "Команда объекта и руководители получают разные права в зависимости от своих обязанностей.",
    icon: ShieldCheckIcon,
  },
];

const operatingModel = [
  {
    title: "Сначала данные по портфелю",
    bullets: [
      "Определяется состав объектов и ответственные со стороны заказчика.",
      "Для объектов согласуется единый набор статусов и сроков.",
      "Отдельно фиксируются правила работы с замечаниями и отчётностью.",
    ],
  },
  {
    title: "Разделяем работу объекта и портфеля",
    bullets: [
      "Команда объекта ведёт сроки, задачи, замечания и документы.",
      "Руководитель сравнивает объекты по согласованным показателям.",
      "Права пользователей ограничивают доступ к организациям и объектам.",
    ],
  },
];

const trustList = [
  "Состав портфеля, объектов и ответственных фиксируется до настройки.",
  "Сроки и замечания ведутся по единым правилам для выбранных объектов.",
  "Состав сводной отчётности определяется из доступных в МОСТ данных.",
];

const relatedScenarios = [
  {
    label: "Управление ресурсами строительства",
    href: marketingPaths.constructionErp,
    description:
      "Если нужно связать объекты, документы, снабжение и финансовое управление.",
  },
  {
    label: "Контроль бюджета стройки",
    href: marketingPaths.constructionBudgetControl,
    description:
      "Подходит, когда главный вопрос сейчас в лимитах, платежах и отклонениях по бюджету.",
  },
  {
    label: "Контроль подрядчиков",
    href: marketingPaths.contractorControl,
    description:
      "Когда узкое место сосредоточено в сроках, дисциплине исполнения и договорных обязательствах.",
  },
  {
    label: "Интеграции и расширения",
    href: marketingPaths.integrations,
    description:
      "Если нужно обсудить обмен данными с другими системами и дополнительные функции.",
  },
];

const DevelopersPage = () => {
  useSEO({
    ...marketingSeo.developers,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Девелопер и технический заказчик"
        title="Портфель объектов, сроки, замечания и отчётность."
        description="МОСТ собирает сведения по объектам в портфель: стадии, сроки, открытые замечания, документы и доступные финансовые данные. Команда объекта ведёт работу, руководство сравнивает проекты."
        actions={[
          {
            label: "Связаться с командой",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "Группа компаний", href: marketingPaths.enterprise },
        ]}
        nav={[
          { label: "Данные по объектам", href: "#capabilities" },
          { label: "Модель запуска", href: "#model" },
          { label: "Доверительный слой", href: "#trust" },
          { label: "Смежные маршруты", href: "#related" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно девелоперу
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Сравнивать стадии и сроки объектов портфеля.",
                "Видеть открытые замечания и ответственных.",
                "Получать отчётность из данных проектных команд.",
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

      <section id="capabilities" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Данные по объектам"
            title="Что видит девелопер и технический заказчик."
            description="Карточки показывают данные для управления портфелем и работы команды каждого объекта."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilityCards.map((item) => {
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

      <section id="model" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-5 xl:grid-cols-2">
          {operatingModel.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                {item.title}
              </div>
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

      <section id="trust" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <SectionHeader
              eyebrow="Доверительный слой"
              title="Что нужно согласовать до демонстрации."
              description="Состав портфеля, роли проектных команд, единые статусы, правила замечаний и ожидаемую отчётность."
            />
          </div>

          <div className="rounded-[1.9rem] border border-steel-900 bg-steel-950 p-6 text-white lg:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Что важно на первом разговоре
            </div>
            <div className="mt-5 grid gap-3">
              {trustList.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/76"
                >
                  <CheckCircleIcon className="mr-2 inline h-4 w-4 text-construction-200" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="related" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Смежные маршруты"
            title="Подробнее о бюджете, подрядчиках и интеграциях."
            description="Выберите профильную страницу, если основной вопрос относится к одному процессу."
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
            eyebrow="Демонстрация"
            title="Посмотрите, как данные объектов собираются на уровне портфеля."
            description="На встрече покажем сроки, замечания и отчётность с учётом ролей проектной и управляющей команды."
            actions={[
              {
                label: "Связаться с нами",
                href: marketingPaths.contact,
                primary: true,
              },
              {
                label: "Управление ресурсами строительства",
                href: marketingPaths.constructionErp,
              },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default DevelopersPage;
