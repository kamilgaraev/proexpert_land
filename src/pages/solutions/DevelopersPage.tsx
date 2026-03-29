import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { marketingPaths, marketingSeo } from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const capabilityCards = [
  {
    title: 'Управленческая картина по портфелю',
    description:
      'Руководство видит стадии проектов, проблемные зоны и приоритеты по объектам без отдельной ручной сводки.',
    icon: ChartBarIcon,
  },
  {
    title: 'Бюджет и финансовый контур',
    description:
      'Бюджеты, обязательства и платежная дисциплина обсуждаются в контексте объекта, а не в отрыве от хода работ.',
    icon: BanknotesIcon,
  },
  {
    title: 'Подрядчики и исполнительская дисциплина',
    description:
      'Контроль сроков, статусов и договорных обязательств по внешним исполнителям собирается в одном рабочем сценарии.',
    icon: UsersIcon,
  },
  {
    title: 'Готовность объекта',
    description:
      'Документы, замечания и фактический прогресс привязываются к этапу реализации и подготовке к следующему шагу.',
    icon: BuildingStorefrontIcon,
  },
  {
    title: 'Проектные расширения',
    description:
      'Дополнительные интеграции и корпоративные сценарии подключаются только после согласования базового контура.',
    icon: CogIcon,
  },
  {
    title: 'Корпоративные правила доступа',
    description:
      'Роли, зоны ответственности и управленческий уровень контроля не смешиваются в один неуправляемый слой.',
    icon: ShieldCheckIcon,
  },
];

const operatingModel = [
  {
    title: 'Сначала приоритетный сценарий',
    bullets: [
      'На старте определяем, какой блок сейчас критичнее: объект, подрядчики, документы или бюджет.',
      'Не перегружаем запуск всем каталогом возможностей сразу.',
      'Доводим базовый контур до рабочего состояния, а затем масштабируем.',
    ],
  },
  {
    title: 'Разделяем проектный и управленческий слой',
    bullets: [
      'Офис, объект и руководство видят одну систему, но в разных управляемых разрезах.',
      'Руководитель получает прозрачность без необходимости вручную собирать статусы.',
      'Проектная команда работает с операционным контуром без лишнего визуального шума.',
    ],
  },
];

const trustList = [
  'Портфель проектов, документы и подрядчики обсуждаются в одном управленческом сценарии.',
  'Финансовый и проектный контуры увязываются с реальным ходом работ.',
  'Интеграции и дополнительные расширения не обещаются вслепую, а проектируются под ваш ландшафт.',
];

const relatedScenarios = [
  {
    label: 'ERP для строительства',
    href: marketingPaths.constructionErp,
    description: 'Если нужен сквозной сценарий по объектам, документам, снабжению и финансовому управлению.',
  },
  {
    label: 'Контроль бюджета стройки',
    href: marketingPaths.constructionBudgetControl,
    description: 'Подходит, когда главный вопрос сейчас в лимитах, платежах и отклонениях по бюджету.',
  },
  {
    label: 'Контроль подрядчиков',
    href: marketingPaths.contractorControl,
    description: 'Когда узкое место сосредоточено в сроках, дисциплине исполнения и договорных обязательствах.',
  },
  {
    label: 'Интеграции и расширения',
    href: marketingPaths.integrations,
    description: 'Если сразу важно обсудить обмен данными с корпоративным ландшафтом и проектные расширения.',
  },
];

const DevelopersPage = () => {
  useSEO({
    ...marketingSeo.developers,
    type: 'website',
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Контур девелопера"
        title="ProHelper для девелопера: объекты, подрядчики, документы и бюджет под единым контролем."
        description="Маршрут для девелоперской команды, которой нужна управляемая картина по проектам, срокам, бюджету и исполнителям без разрыва между офисом и объектом."
        actions={[
          { label: 'Обсудить сценарий', href: marketingPaths.contact, primary: true },
          { label: 'Корпоративный контур', href: marketingPaths.enterprise },
        ]}
        nav={[
          { label: 'Контуры', href: '#capabilities' },
          { label: 'Модель запуска', href: '#model' },
          { label: 'Доверительный слой', href: '#trust' },
          { label: 'Смежные маршруты', href: '#related' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно девелоперу
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Держать сроки, подрядчиков и документы в одном управленческом контуре.',
                'Понимать фактическую картину по портфелю, а не собирать ее вручную.',
                'Запускать систему поэтапно, не ломая текущую структуру работы команды.',
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
            eyebrow="Контуры"
            title="Какие блоки чаще всего нужны девелоперской команде."
            description="Здесь собраны не абстрактные функции, а рабочие участки, через которые девелопер обычно выстраивает контроль по объектам."
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
                  <h2 className="mt-5 text-xl font-bold text-steel-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
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
              title="Как обсуждаем запуск с девелопером без витринных обещаний."
              description="На встрече разбираем структуру команды, уровень управленческого контроля и приоритетный сценарий запуска, а не просто перечисляем функции."
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
            title="Если хотите сразу перейти в более узкий сценарий."
            description="Из девелоперского контура можно быстро перейти туда, где сейчас находится основная операционная боль."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {relatedScenarios.map((item) => (
              <MarketingLink
                key={item.href}
                href={item.href}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm transition hover:border-construction-300 hover:bg-construction-50/40"
              >
                <div className="text-xl font-bold text-steel-950">{item.label}</div>
                <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
              </MarketingLink>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 pt-16 lg:pb-20 lg:pt-20">
        <div className="container-custom">
          <CtaBand
            eyebrow="Следующий шаг"
            title="Если нужен управляемый запуск для девелоперской команды, соберем релевантный контур под ваш портфель и структуру."
            description="Покажем, с какого блока лучше стартовать, как разделить управленческий и проектный слой и какие расширения действительно стоит обсуждать отдельно."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'ERP для строительства', href: marketingPaths.constructionErp },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default DevelopersPage;
