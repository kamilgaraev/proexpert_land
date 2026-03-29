import {
  ClockIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { marketingPaths, marketingSeo } from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

const focusAreas = [
  {
    title: 'Сроки и этапы',
    description:
      'Видно, где работа идет по плану, а где подрядный контур начинает проседать по срокам и зависимостям.',
    icon: ClockIcon,
  },
  {
    title: 'Бригады и роли',
    description:
      'Руководитель видит распределение задач, ответственных и текущую загрузку без ручной сборки отчетов.',
    icon: UsersIcon,
  },
  {
    title: 'Акты и документы',
    description:
      'Исполнение, замечания и комплектность документов держатся в одном рабочем сценарии.',
    icon: DocumentTextIcon,
  },
  {
    title: 'Качество работ',
    description:
      'Замечания, проверки и корректирующие действия остаются привязанными к реальному этапу работ.',
    icon: ShieldCheckIcon,
  },
];

const workflowTracks = [
  {
    title: 'Планирование подрядного контура',
    bullets: [
      'Формируем этапы и зоны ответственности по объекту.',
      'Раздаем задачи по бригадам и подрядным ролям.',
      'Держим сроки и факт исполнения в одной логике.',
    ],
  },
  {
    title: 'Работа с площадкой',
    bullets: [
      'Фиксируем статусы и замечания прямо по ходу работ.',
      'Подтягиваем документы и вложения к конкретному этапу.',
      'Убираем разрыв между офисом, площадкой и руководителем.',
    ],
  },
  {
    title: 'Материалы и снабжение',
    bullets: [
      'Связываем заявки, поставки и приемку с фактическим ходом работ.',
      'Показываем, где снабжение тормозит подрядный сценарий.',
      'Убираем хаос из переписок и разрозненных таблиц.',
    ],
  },
  {
    title: 'Исполнение и приемка',
    bullets: [
      'Собираем замечания, исправления и документы по месту возникновения.',
      'Ускоряем переход от выполнения к закрытию этапа.',
      'Даем руководителю прозрачную картину по готовности подрядчика.',
    ],
  },
];

const resultOutcomes = [
  'Оперативный контроль по бригадам, срокам и замечаниям.',
  'Меньше ручных созвонов и сборки статусов из мессенджеров.',
  'Понятный путь от задачи до документа и приемки.',
  'Единый сценарий для объекта, подрядчика и офиса.',
];

const relatedSolutions = [
  {
    label: 'Программа для прораба',
    href: marketingPaths.foremanSoftware,
    description: 'Если ключевая точка управления находится на площадке и нужна полная картина по задачам и факту.',
  },
  {
    label: 'Контроль подрядчиков',
    href: marketingPaths.contractorControl,
    description: 'Когда нужно отдельно разобрать сроки, объемы, ответственность и исполнительскую дисциплину.',
  },
  {
    label: 'Учет материалов',
    href: marketingPaths.materialAccounting,
    description: 'Если подрядный процесс упирается в заявки, поставки, приемку и остатки материалов.',
  },
  {
    label: 'Исполнительная документация',
    href: marketingPaths.constructionDocuments,
    description: 'Подходит, если узкое место сейчас в актах, замечаниях и комплектности документов.',
  },
];

const ContractorsPage = () => {
  useSEO({
    ...marketingSeo.contractors,
    type: 'website',
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Подрядный контур"
        title="ProHelper для подрядчика: сроки, бригады, документы и качество в одном сценарии."
        description="Страница для подрядных команд, которым нужно связать объект, исполнителей, замечания, снабжение и закрывающие документы без ручной сборки статусов."
        actions={[
          { label: 'Запросить демонстрацию', href: marketingPaths.contact, primary: true },
          { label: 'Открыть все решения', href: marketingPaths.solutions },
        ]}
        nav={[
          { label: 'Фокус', href: '#focus' },
          { label: 'Сценарий работы', href: '#workflow' },
          { label: 'Результат', href: '#result' },
          { label: 'Смежные страницы', href: '#related' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что важно подрядной команде
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Понимать, где тормозит объект и кто отвечает за следующий шаг.',
                'Держать замечания, документы и статус работ в одном контуре.',
                'Показывать руководителю факт исполнения без ручной сводки.',
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
            title="Какие зоны подрядный контур держит под контролем."
            description="Не витрина возможностей, а те участки, где подрядная команда чаще всего теряет управляемость."
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
                  <h2 className="mt-5 text-xl font-bold text-steel-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Сценарий работы"
            title="Как подрядный маршрут собирается в один рабочий контур."
            description="На демонстрации показываем не абстрактные фичи, а реальный путь подрядной команды от планирования до закрытия этапа."
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
                  <h2 className="text-xl font-bold text-steel-950">{item.title}</h2>
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
              title="Что получает подрядчик после запуска рабочего контура."
              description="Главная ценность здесь не в отдельных экранах, а в том, что команда перестает жить между мессенджерами, файлами и разрозненными статусами."
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
                'Как подрядная команда видит план, факт, замечания и документы без лишних переключений.',
                'Как связать площадку, снабжение и приемку в одной логике исполнения.',
                'Какой минимальный стартовый контур нужен именно вашему объекту и роли команды.',
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
            title="Куда перейти, если задача выходит за рамки подрядного контура."
            description="Из этой страницы удобно перейти в профильный сценарий по роли, материалам или документам."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {relatedSolutions.map((item) => (
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
            title="Если хотите собрать подрядный контур без лишней ручной работы, покажем релевантный сценарий на вашем процессе."
            description="Разберем роль команды, структуру объекта и текущие узкие места, после чего покажем только тот маршрут запуска, который реально имеет смысл на старте."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'Контроль подрядчиков', href: marketingPaths.contractorControl },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default ContractorsPage;
