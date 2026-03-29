import {
  BuildingOfficeIcon,
  CloudIcon,
  CogIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import { MarketingLink, PageHero, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { marketingPaths, marketingSeo } from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';

type IntegrationStatus = 'Базовый контур' | 'Базовый этап' | 'По запросу';

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
    title: 'Честный контур',
    description:
      'Публично показываем только те сценарии интеграции и расширений, которые действительно обсуждаем в проектной работе.',
    icon: CogIcon,
  },
  {
    title: 'Проектная проработка',
    description:
      'Сначала проверяем реальный бизнес-сценарий, и только потом определяем формат обмена данными, пилота или расширения.',
    icon: CloudIcon,
  },
  {
    title: 'Запуск без лишнего шума',
    description:
      'Не тащим в стартовый контур все внешние системы сразу. Оставляем только то, что поддерживает рабочий процесс.',
    icon: DevicePhoneMobileIcon,
  },
];

const integrationCategories: IntegrationCategory[] = [
  {
    category: 'Обмен данными',
    icon: BuildingOfficeIcon,
    items: [
      {
        name: 'API и webhooks',
        description: 'Проектируем обмен событиями и данными по согласованному сценарию работы команды.',
        status: 'По запросу',
      },
      {
        name: 'Выгрузки и загрузки',
        description: 'Используем CSV, Excel и другие форматы там, где они реально закрывают операционный обмен.',
        status: 'По запросу',
      },
      {
        name: 'Контур под текущий ландшафт',
        description: 'Подбираем формат обмена под вашу структуру процессов и состав систем.',
        status: 'По запросу',
      },
    ],
  },
  {
    category: 'Документы и файлы',
    icon: CogIcon,
    items: [
      {
        name: 'Чертежи и вложения',
        description: 'Работаем с файлами в контексте проекта, а не через разрозненные переписки и папки.',
        status: 'Базовый контур',
      },
      {
        name: 'Версионирование',
        description: 'Фиксируем актуальность документов и маршрут согласования внутри рабочего процесса.',
        status: 'Базовый контур',
      },
      {
        name: 'Внешние источники',
        description: 'Если нужен обмен со сторонним архивом или хранилищем, проектируем его как отдельный этап.',
        status: 'По запросу',
      },
    ],
  },
  {
    category: 'Уведомления и внешние сценарии',
    icon: CloudIcon,
    items: [
      {
        name: 'Почта и уведомления',
        description: 'Настраиваем служебные уведомления в составе целевого рабочего сценария.',
        status: 'По запросу',
      },
      {
        name: 'Мессенджеры и боты',
        description: 'Отдельно оцениваем, нужен ли внешний канал уведомлений или лучше оставить сценарий внутри продукта.',
        status: 'По запросу',
      },
      {
        name: 'Проектные автоматизации',
        description: 'Нет публичного каталога «магических коннекторов»: расширения делаем под согласованный запрос.',
        status: 'По запросу',
      },
    ],
  },
  {
    category: 'Проектное внедрение',
    icon: DevicePhoneMobileIcon,
    items: [
      {
        name: 'Оценка текущего процесса',
        description: 'На старте определяем, где нужен реальный обмен данными, а где достаточно внутреннего контура ProHelper.',
        status: 'Базовый этап',
      },
      {
        name: 'Пилот для расширений',
        description: 'Если нужен нетиповой сценарий, выносим его в отдельный пилот, а не смешиваем с базовым запуском.',
        status: 'По запросу',
      },
      {
        name: 'Корпоративный сценарий',
        description: 'Для сложной схемы обмена согласуем объем, границы и ответственный маршрут внедрения.',
        status: 'По запросу',
      },
    ],
  },
];

const relatedScenarios = [
  {
    label: 'ERP для строительства',
    href: marketingPaths.constructionErp,
    description: 'Когда интеграции обсуждаются как часть общего управленческого контура по объектам, документам и финансам.',
  },
  {
    label: 'CRM для строительной компании',
    href: marketingPaths.constructionCrm,
    description: 'Если сначала нужно собрать единый рабочий процесс, а уже затем подключать внешние связи.',
  },
  {
    label: 'Enterprise',
    href: marketingPaths.enterprise,
    description: 'Подходит, если важно заранее обсудить корпоративные правила доступа, пилоты и архитектуру запуска.',
  },
  {
    label: 'Связаться с нами',
    href: marketingPaths.contact,
    description: 'Если хотите быстро сверить, что можно запускать уже сейчас, а что лучше вынести в отдельный этап.',
  },
];

const getStatusTone = (status: IntegrationStatus) => {
  switch (status) {
    case 'Базовый контур':
      return 'bg-emerald-100 text-emerald-800';
    case 'Базовый этап':
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
};

const IntegrationsPage = () => {
  useSEO({
    ...marketingSeo.integrations,
    type: 'website',
  });

  return (
    <div className="marketing-page-shell">
      <PageHero
        eyebrow="Интеграции и расширения"
        title="Интеграции ProHelper: только те внешние связи, которые поддерживают реальный процесс."
        description="Страница для команд, которым важно понять, как ProHelper стыкуется с текущим ландшафтом, документным контуром и проектными расширениями без избыточных обещаний."
        actions={[
          { label: 'Обсудить сценарий', href: marketingPaths.contact, primary: true },
          { label: 'Страница безопасности', href: marketingPaths.security },
        ]}
        nav={[
          { label: 'Принципы', href: '#principles' },
          { label: 'Категории', href: '#categories' },
          { label: 'Куда идти дальше', href: '#related' },
        ]}
        aside={
          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
              Что обсуждаем на старте
            </div>
            <div className="mt-4 grid gap-3">
              {[
                'Где действительно нужен внешний обмен данными, а где достаточно внутреннего контура.',
                'Какие расширения можно считать базовым этапом, а какие требуют отдельного проекта.',
                'Как не перегрузить запуск лишними интеграциями на первом шаге.',
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
            title="Как мы подходим к интеграциям и проектным расширениям."
            description="Сначала определяем рабочий сценарий, затем формат обмена и только после этого обсуждаем архитектуру расширения."
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
                  <h2 className="mt-5 text-xl font-bold text-steel-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-steel-600">{item.description}</p>
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
                  <h2 className="text-2xl font-bold text-steel-950">{category.category}</h2>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-3">
                  {category.items.map((item) => (
                    <article
                      key={`${category.category}-${item.name}`}
                      className="rounded-[1.5rem] border border-steel-200 bg-concrete-50 px-5 py-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-lg font-bold text-steel-950">{item.name}</h3>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusTone(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-steel-600">{item.description}</p>
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
            title="Если вопрос интеграций связан с более широким сценарием запуска."
            description="Из этой страницы удобно перейти в связанный маршрут по ERP, корпоративному контуру или первичному контакту."
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
            title="Если нужен нетиповой сценарий, разберем текущий ландшафт и честно скажем, что стоит запускать сейчас."
            description="На встрече отделим базовый контур от проектных расширений, оценим приоритеты и соберем реалистичный маршрут запуска без лишнего архитектурного шума."
            actions={[
              { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
              { label: 'Enterprise', href: marketingPaths.enterprise },
            ]}
            tone="dark"
          />
        </div>
      </section>
    </div>
  );
};

export default IntegrationsPage;
