import {
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import CtaBand from "@/components/marketing/blocks/CtaBand";
import {
  MarketingLink,
  PageHero,
  SectionHeader,
} from "@/components/marketing/MarketingPrimitives";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";

const focusAreas = [
  {
    title: "Объект и этапы",
    description:
      "Работы, сроки и ответственные относятся к конкретному объекту и этапу.",
    icon: ClockIcon,
  },
  {
    title: "Бригады и роли",
    description:
      "Задачи и фактический объём распределяются по бригадам и ответственным.",
    icon: UsersIcon,
  },
  {
    title: "Документы и оплата",
    description:
      "Выполненный объём, подтверждающие документы и подготовка к оплате рассматриваются вместе.",
    icon: DocumentTextIcon,
  },
  {
    title: "Замечания и приёмка",
    description:
      "Замечания, проверки и корректирующие действия остаются привязанными к реальному этапу работ.",
    icon: ShieldCheckIcon,
  },
];

const workflowTracks = [
  {
    title: "Планирование работ",
    bullets: [
      "Этапы и зоны ответственности задаются по объекту.",
      "Задачи распределяются по бригадам и ответственным.",
      "Плановый и фактический объём фиксируются по работам.",
    ],
  },
  {
    title: "Работа с площадкой",
    bullets: [
      "Площадка фиксирует статус, объём и замечания по ходу работ.",
      "Документы и вложения прикрепляются к конкретному этапу.",
      "Офис работает с теми же данными, которые передала площадка.",
    ],
  },
  {
    title: "Материалы и снабжение",
    bullets: [
      "Заявки, поставки и приёмка материалов относятся к объекту.",
      "Ответственный видит статус потребности и поставки.",
      "Документы по материалам хранятся рядом с заявкой.",
    ],
  },
  {
    title: "Закрытие и оплата",
    bullets: [
      "Замечания и исправления относятся к выполненной работе.",
      "Подтверждённый объём дополняется закрывающими документами.",
      "После проверки документы используются при подготовке оплаты.",
    ],
  },
];

const resultOutcomes = [
  "Объём работ связан с объектом, этапом и бригадой.",
  "Замечания остаются рядом с работой и ответственным.",
  "Документы подтверждают выполнение и готовность к оплате.",
  "Офис и площадка используют одни и те же статусы.",
];

const relatedSolutions = [
  {
    label: "Программа для прораба",
    href: marketingPaths.foremanSoftware,
    description:
      "Если ключевая точка управления находится на площадке и нужна полная картина по задачам и факту.",
  },
  {
    label: "Контроль подрядчиков",
    href: marketingPaths.contractorControl,
    description:
      "Когда нужно отдельно разобрать сроки, объемы, ответственность и исполнительскую дисциплину.",
  },
  {
    label: "Учет материалов",
    href: marketingPaths.materialAccounting,
    description:
      "Если подрядный процесс упирается в заявки, поставки, приемку и остатки материалов.",
  },
  {
    label: "Исполнительная документация",
    href: marketingPaths.constructionDocuments,
    description:
      "Подходит, если узкое место сейчас в актах, замечаниях и комплектности документов.",
  },
];

const ContractorsPage = () => {
  useSEO({
    ...marketingSeo.contractors,
    type: "website",
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Подрядная организация"
        title="От объекта и бригады — к документам и оплате."
        description="МОСТ связывает задачу, фактический объём, исполнителя, замечания и закрывающие документы. Руководитель видит, что выполнено и что мешает закрыть этап."
        actions={[
          {
            label: "Запросить демонстрацию",
            href: marketingPaths.contact,
            primary: true,
          },
          { label: "Открыть все решения", href: marketingPaths.solutions },
        ]}
        nav={[
          { label: "Фокус", href: "#focus" },
          { label: "Порядок работы", href: "#workflow" },
          { label: "Результат", href: "#result" },
          { label: "Смежные страницы", href: "#related" },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно подрядной команде
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Видеть работу по объекту, этапу и бригаде.",
                "Сопоставлять плановый и фактический объём.",
                "Подтверждать выполнение документами перед оплатой.",
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

      <section id="focus" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Фокус"
            title="Какие данные нужны подрядной организации каждый день."
            description="Объект и этап, бригада, объём работ, замечания, документы и статус подготовки к оплате."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {focusAreas.map((item) => {
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

      <section id="workflow" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Порядок работы"
            title="Как проходит работа от задания до закрытия этапа."
            description="Последовательность связывает план, факт на площадке, проверку и документы для оплаты."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {workflowTracks.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-steel-950 text-construction-200">
                    <WrenchScrewdriverIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-steel-950">
                    {item.title}
                  </h2>
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
        </div>
      </section>

      <section id="result" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div>
            <SectionHeader
              eyebrow="Результат"
              title="Какие связи сохраняются в системе."
              description="По каждой работе можно проверить объект, бригаду, объём, замечания и подтверждающие документы."
            />
            <div className="mt-8 grid gap-3">
              {resultOutcomes.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-steel-900 bg-steel-950 p-6 text-white lg:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
              Что показываем на встрече
            </div>
            <div className="mt-5 grid gap-3">
              {[
                "Как подрядная команда видит план, факт, замечания и документы без лишних переключений.",
                "Как связать площадку, снабжение и приемку в одной логике исполнения.",
                "Какой набор возможностей нужен именно вашему объекту и роли команды.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/76"
                >
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
            eyebrow="Смежные страницы"
            title="Подробнее о работе прораба, материалах и документах."
            description="Выберите профильную страницу, если основной вопрос относится к конкретной роли или процессу."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {relatedSolutions.map((item) => (
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
            title="Посмотрите работу подрядной организации в МОСТ."
            description="На встрече разберём структуру объекта и покажем путь от задачи и объёма до документа и подготовки к оплате."
            actions={[
              {
                label: "Связаться с нами",
                href: marketingPaths.contact,
                primary: true,
              },
              {
                label: "Контроль подрядчиков",
                href: marketingPaths.contractorControl,
              },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default ContractorsPage;
