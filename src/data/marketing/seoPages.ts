import { marketingPaths } from './common';
import { marketingProductSeoLandingPages } from './seoProductPages';
import type {
  MarketingContentLink,
  MarketingEditorialSeries,
  MarketingSeoLandingPage,
} from '@/types/marketing';

const contactLink: MarketingContentLink = {
  label: 'Запросить демонстрацию',
  href: marketingPaths.contact,
  description: 'Покажем подходящий сценарий, роли и набор возможностей для вашей компании.',
};

type ProcessComparisonSource = {
  title: string;
  description: string;
  signals: string[];
  beforeLabel?: string;
  beforeState: string[];
  afterLabel?: string;
  afterState: string[];
  metrics: Array<{ value: string; label: string; detail: string }>;
};

const createProcessComparison = (
  comparison: MarketingSeoLandingPage['processComparison'],
) => comparison;

const createProcessComparisonFromSource = (
  comparison: ProcessComparisonSource,
): MarketingSeoLandingPage['processComparison'] => createProcessComparison({
  eyebrow: 'Как меняется работа',
  title: comparison.title,
  description: comparison.description,
  metrics: comparison.metrics.map(({ value, label, detail }) => ({
    value,
    label,
    description: detail,
  })),
  note: 'Это описание процесса, а не обещание результата.',
});

type OperationalSeoPageConfig = Omit<MarketingSeoLandingPage, 'processComparison'> & {
  processComparisonTitle: string;
  processComparisonDescription: string;
  signals: string[];
  beforeState: string[];
  afterState: string[];
  metrics: ProcessComparisonSource['metrics'];
};

const createOperationalSeoPage = (config: OperationalSeoPageConfig): MarketingSeoLandingPage => ({
  path: config.path,
  eyebrow: config.eyebrow,
  title: config.title,
  description: config.description,
  supportingQueries: config.supportingQueries,
  processComparison: createProcessComparisonFromSource({
    title: config.processComparisonTitle,
    description: config.processComparisonDescription,
    signals: config.signals,
    beforeLabel: 'До запуска',
    beforeState: config.beforeState,
    afterLabel: 'После запуска',
    afterState: config.afterState,
    metrics: config.metrics,
  }),
  audienceTitle: config.audienceTitle,
  audienceDescription: config.audienceDescription,
  audiences: config.audiences,
  problemTitle: config.problemTitle,
  problemDescription: config.problemDescription,
  problems: config.problems,
  automationTitle: config.automationTitle,
  automationDescription: config.automationDescription,
  automations: config.automations,
  visibilityTitle: config.visibilityTitle,
  visibilityDescription: config.visibilityDescription,
  roleViews: config.roleViews,
  relatedLinks: config.relatedLinks,
  blogLinks: config.blogLinks,
  contactHighlights: config.contactHighlights,
  faq: config.faq,
  workflow: config.workflow,
});

export const marketingCommercialLandingLinks: MarketingContentLink[] = [
  {
    label: 'Программа для прораба',
    href: marketingPaths.foremanSoftware,
    description: 'Контроль задач, работ, замечаний и отчетности на объекте.',
  },
  {
    label: 'ERP для строительной компании',
    href: marketingPaths.constructionCrm,
    description: 'Единый контур по клиентам, объектам, задачам и статусам исполнения.',
  },
  {
    label: 'ERP для строительства',
    href: marketingPaths.constructionErp,
    description: 'Связка объекта, снабжения, финансов, документов и управленческой аналитики.',
  },
  {
    label: 'Учет материалов',
    href: marketingPaths.materialAccounting,
    description: 'Заявки, поставки, остатки и движение материалов по объектам.',
  },
  {
    label: 'Система для ПТО',
    href: marketingPaths.ptoSoftware,
    description: 'Исполнительная документация, контроль замечаний и комплектности.',
  },
  {
    label: 'Контроль подрядчиков',
    href: marketingPaths.contractorControl,
    description: 'Сроки, объемы, ответственность и прозрачность исполнения по подрядчикам.',
  },
  {
    label: 'Исполнительная документация',
    href: marketingPaths.constructionDocuments,
    description: 'Структурированная работа с актами, реестрами и комплектами документов.',
  },
  {
    label: 'Контроль бюджета стройки',
    href: marketingPaths.constructionBudgetControl,
    description: 'Платежи, лимиты, фактические затраты и отклонения по объектам.',
  },
  {
    label: 'Мобильное приложение',
    href: marketingPaths.mobileApp,
    description: 'Работа прораба, снабженца и инженерной команды прямо на площадке.',
  },
  {
    label: 'AI сметы по чертежам',
    href: marketingPaths.aiEstimates,
    description: 'Быстрый старт оценки объемов и сметного сценария на базе AI.',
  },
  {
    label: 'ПИР и проектная документация',
    href: marketingPaths.pirProjectDocumentation,
    description: 'ПД, РД, IFC, замечания, нормоконтроль и выпуск комплектов.',
  },
  {
    label: 'Охрана труда на стройке',
    href: marketingPaths.constructionSafety,
    description: 'Инструктажи, допуски, инциденты, нарушения и предписания.',
  },
  {
    label: 'Контроль качества строительства',
    href: marketingPaths.constructionQualityControl,
    description: 'Инспекции, дефекты, ответственные, сроки и повторная проверка.',
  },
  {
    label: 'Приемка и punch-list',
    href: marketingPaths.handoverAcceptance,
    description: 'Передача зон заказчику, замечания и статус готовности к сдаче.',
  },
  {
    label: 'Техника и выработка',
    href: marketingPaths.machineryAndLabor,
    description: 'Техника, смены, простои, наряды, ГСМ и фактическая выработка.',
  },
  {
    label: 'RFI и изменения',
    href: marketingPaths.changeControl,
    description: 'Изменения, дополнительные работы, претензии и влияние на сроки.',
  },
  {
    label: 'Строительные закупки',
    href: marketingPaths.constructionProcurement,
    description: 'Потребность объекта, поставщики, заказ, оплата и приемка в одном маршруте.',
  },
  {
    label: 'Заявки с объекта',
    href: marketingPaths.siteRequests,
    description: 'Материалы, техника, люди и финансовые обращения из площадки в офис.',
  },
  {
    label: 'Управление персоналом',
    href: marketingPaths.workforceManagement,
    description: 'Бригады, смены, время и производственный факт по объектам.',
  },
  {
    label: 'Платежи в строительстве',
    href: marketingPaths.constructionPayments,
    description: 'Счета, согласование, календарь, оплата и сверка по объекту.',
  },
  {
    label: 'Интеграция с 1С',
    href: marketingPaths.oneCIntegration,
    description: 'Согласованный сценарий обмена, мастер-данные и сверка.',
  },
  {
    label: 'Маркетплейс подрядчиков',
    href: marketingPaths.contractorMarketplace,
    description: 'Поиск исполнителей, шорт-лист и контролируемое приглашение.',
  },
  {
    label: 'Project Pulse',
    href: marketingPaths.projectPulse,
    description: 'Пилотная ежедневная сводка и сигналы для управленческой проверки.',
  },
];

export const marketingRoleLandingLinks: MarketingContentLink[] = [
  marketingCommercialLandingLinks[0],
  marketingCommercialLandingLinks[4],
  {
    label: 'Для снабженца',
    href: marketingPaths.materialAccounting,
    description: 'Управление заявками, закупками, поставками и складом без Excel-хаоса.',
  },
  {
    label: 'Для руководителя строительства',
    href: marketingPaths.constructionBudgetControl,
    description: 'Сводная картина по срокам, бюджету, подрядчикам и критическим отклонениям.',
  },
  {
    label: 'Для генподрядчика',
    href: marketingPaths.contractorControl,
    description: 'Контроль субподрядчиков, графика, актов и исполнения договорных обязательств.',
  },
  {
    label: 'Для девелопера',
    href: marketingPaths.constructionErp,
    description: 'Управленческий контур по объектам, бюджетам, подрядчикам и пакетам отчетности.',
  },
  {
    label: 'Для проектной команды',
    href: marketingPaths.pirProjectDocumentation,
    description: 'ПИР, проектные версии, замечания и выпуск комплектов ПД/РД.',
  },
  {
    label: 'Для специалиста ОТ',
    href: marketingPaths.constructionSafety,
    description: 'Инструктажи, допуски, нарушения и устранение предписаний.',
  },
  {
    label: 'Для стройконтроля',
    href: marketingPaths.constructionQualityControl,
    description: 'Дефекты, инспекции, фотофиксация и повторная проверка качества.',
  },
];

export const marketingModuleLandingLinks: MarketingContentLink[] = [
  {
    label: 'Строительный склад',
    href: marketingPaths.materialAccounting,
    description: 'Остатки, движения, поставки и контроль материалов по объектам.',
  },
  {
    label: 'Учет материалов',
    href: marketingPaths.materialAccounting,
    description: 'Остатки, движения, поставки и складской контур по объектам.',
  },
  {
    label: 'Акты КС-2 и КС-3',
    href: marketingPaths.constructionDocuments,
    description: 'Подготовка пакетов документов и контроль комплектности по объекту.',
  },
  {
    label: 'Платежи и лимиты',
    href: marketingPaths.constructionBudgetControl,
    description: 'Контроль бюджета, платежного календаря и исполнения финансовых обязательств.',
  },
  {
    label: 'Мобильный контур',
    href: marketingPaths.mobileApp,
    description: 'Рабочие сценарии для площадки, фотофиксации и согласований в поле.',
  },
  {
    label: 'AI-сметы',
    href: marketingPaths.aiEstimates,
    description: 'Сценарий предварительной оценки объемов и смет по чертежам.',
  },
  {
    label: 'ПИР',
    href: marketingPaths.pirProjectDocumentation,
    description: 'ПД, РД, IFC, нормоконтроль, версии и выпуск комплектов.',
  },
  {
    label: 'Охрана труда',
    href: marketingPaths.constructionSafety,
    description: 'Инструктажи, допуски, инциденты и контроль устранения.',
  },
  {
    label: 'Качество и приемка',
    href: marketingPaths.constructionQualityControl,
    description: 'Дефекты, повторная проверка, punch-list и сдача результата.',
  },
  {
    label: 'Ресурсы и выработка',
    href: marketingPaths.machineryAndLabor,
    description: 'Техника, смены, простои, наряды и фактическая выработка.',
  },
  {
    label: 'Изменения и RFI',
    href: marketingPaths.changeControl,
    description: 'RFI, дополнительные работы, претензии и решения заказчика.',
  },
  {
    label: 'Закупочный контур',
    href: marketingPaths.constructionProcurement,
    description: 'Потребность, запрос поставщикам, выбор, заказ и приемка.',
  },
  {
    label: 'Заявки с площадки',
    href: marketingPaths.siteRequests,
    description: 'Маршрутизация обращений в снабжение, склад, финансы и кадровую команду.',
  },
  {
    label: 'Персонал и смены',
    href: marketingPaths.workforceManagement,
    description: 'Сотрудники, бригады, время и производственная основа для выгрузки.',
  },
  {
    label: 'Платежный календарь',
    href: marketingPaths.constructionPayments,
    description: 'Согласование счета, лимит, оплата и сверка по объекту.',
  },
  {
    label: 'Интеграция с 1С и MDM',
    href: marketingPaths.oneCIntegration,
    description: 'Сопоставление справочников и контролируемый обмен по согласованному сценарию.',
  },
  {
    label: 'Подбор подрядчиков',
    href: marketingPaths.contractorMarketplace,
    description: 'Категории, поиск, шорт-лист, приглашение и решение по кандидату.',
  },
  {
    label: 'Project Pulse для руководителя',
    href: marketingPaths.projectPulse,
    description: 'Сигналы риска, ежедневная сводка и дальнейшее действие руководителя.',
  },
];

export const marketingBlogEditorialSeries: MarketingEditorialSeries[] = [
  {
    id: 'roles',
    title: 'Серия по ролям',
    description: 'Материалы под рабочие сценарии ключевых участников строительной команды.',
    articles: [
      {
        title: 'Как прорабу вести объект без хаоса',
        cluster: 'программа для прораба',
        intent: 'informational',
        relatedPath: marketingPaths.foremanSoftware,
        summary: 'Разбираем, какие данные прорабу нужны каждый день и как собрать их в одной системе.',
      },
      {
        title: 'Что должно быть у ПТО в одной системе',
        cluster: 'система для ПТО',
        intent: 'informational',
        relatedPath: marketingPaths.ptoSoftware,
        summary: 'Показываем состав контура ПТО: замечания, акты, комплектность и согласования.',
      },
      {
        title: 'Как снабженцу контролировать материалы без Excel',
        cluster: 'учет материалов в строительстве',
        intent: 'informational',
        relatedPath: marketingPaths.materialAccounting,
        summary: 'Путь от заявки до поставки, остатков и сверки по объектам.',
      },
      {
        title: 'Что должен видеть руководитель строительства каждое утро',
        cluster: 'контроль бюджета стройки',
        intent: 'informational',
        relatedPath: marketingPaths.constructionBudgetControl,
        summary: 'Ключевые показатели по срокам, бюджету и рискам без ручной консолидации отчетов.',
      },
      {
        title: 'Как проектной команде управлять ПД и РД без потери версий',
        cluster: 'пир в строительстве',
        intent: 'informational',
        relatedPath: marketingPaths.pirProjectDocumentation,
        summary: 'Разбираем контур ПИР: версии, замечания, нормоконтроль и выпуск комплектов.',
      },
      {
        title: 'Что специалист ОТ должен видеть по объектам каждый день',
        cluster: 'охрана труда на стройке',
        intent: 'informational',
        relatedPath: marketingPaths.constructionSafety,
        summary: 'Какие события безопасности важно фиксировать в объектном контексте.',
      },
    ],
  },
  {
    id: 'pain-points',
    title: 'Серия по болям',
    description: 'Контент под запросы, где клиент ищет решение конкретной операционной проблемы.',
    articles: [
      {
        title: 'Как сократить перерасход на стройке',
        cluster: 'контроль бюджета стройки',
        intent: 'informational',
        relatedPath: marketingPaths.constructionBudgetControl,
        summary: 'Практика контроля лимитов, заявок, платежей и отклонений по объекту.',
      },
      {
        title: 'Почему срываются сроки поставок в строительстве',
        cluster: 'контроль поставок',
        intent: 'informational',
        relatedPath: marketingPaths.materialAccounting,
        summary: 'Разбираем узкие места цепочки снабжения и точки контроля для команды.',
      },
      {
        title: 'Как убрать Excel из стройки без стресса для команды',
        cluster: 'альтернатива Excel для стройки',
        intent: 'informational',
        relatedPath: marketingPaths.constructionCrm,
        summary: 'Как переводить объект, заявки и статусы в единую систему без большого Big Bang.',
      },
      {
        title: 'Как наладить контроль подрядчиков на объекте',
        cluster: 'контроль подрядчиков',
        intent: 'informational',
        relatedPath: marketingPaths.contractorControl,
        summary: 'Что фиксировать по подрядчику, чтобы вовремя видеть просадку по срокам и объемам.',
      },
      {
        title: 'Как дефекты доходят до повторной проверки и приемки',
        cluster: 'контроль качества строительства',
        intent: 'informational',
        relatedPath: marketingPaths.constructionQualityControl,
        summary: 'Путь замечания от фиксации на площадке до устранения и готовности к сдаче.',
      },
      {
        title: 'Почему RFI и изменения нельзя вести только в переписке',
        cluster: 'rfi в строительстве',
        intent: 'informational',
        relatedPath: marketingPaths.changeControl,
        summary: 'Как сохранить основания, влияние на сроки и решение заказчика по изменениям.',
      },
    ],
  },
  {
    id: 'documents-and-processes',
    title: 'Серия по документам и процессам',
    description: 'Материалы для запросов вокруг исполнительной документации, графиков и отчетности.',
    articles: [
      {
        title: 'Как вести исполнительную документацию без потерь',
        cluster: 'исполнительная документация в строительстве',
        intent: 'informational',
        relatedPath: marketingPaths.constructionDocuments,
        summary: 'Какие документы чаще всего теряются и как собрать их в управляемый комплект.',
      },
      {
        title: 'Как автоматизировать КС-2 и КС-3',
        cluster: 'акты КС-2 и КС-3',
        intent: 'informational',
        relatedPath: marketingPaths.constructionDocuments,
        summary: 'Связка актов, объемов, замечаний и финансового контура в одном процессе.',
      },
      {
        title: 'Как контролировать график производства работ',
        cluster: 'график работ',
        intent: 'informational',
        relatedPath: marketingPaths.foremanSoftware,
        summary: 'Как вести график, фактическое исполнение и отклонения без ручной пересборки данных.',
      },
      {
        title: 'Как подготовить стройку к ERP-контурe',
        cluster: 'erp для строительства',
        intent: 'informational',
        relatedPath: marketingPaths.constructionErp,
        summary: 'Когда компании нужен ERP-подход и какие процессы должны быть готовы к внедрению.',
      },
      {
        title: 'Как подготовить объект к передаче заказчику',
        cluster: 'приемка зон строительство',
        intent: 'informational',
        relatedPath: marketingPaths.handoverAcceptance,
        summary: 'Что должно быть видно по зонам, punch-list и комплекту сдачи до финальной приемки.',
      },
      {
        title: 'Как учитывать технику, смены и выработку без ручного свода',
        cluster: 'учет техники на стройке',
        intent: 'informational',
        relatedPath: marketingPaths.machineryAndLabor,
        summary: 'Контроль смен, простоев, ГСМ, нарядов и фактических объемов по объектам.',
      },
    ],
  },
];
export const marketingSeoLandingPages: Record<string, MarketingSeoLandingPage> = {
  'foreman-software': {
    path: marketingPaths.foremanSoftware,
    eyebrow: 'Роль и площадка',
    title: 'Программа для прораба в строительстве с задачами и контролем работ',
    description:
      'МОСТ помогает прорабу держать под контролем задачи, замечания, ход работ, фотофиксацию и отчетность по объекту в одном рабочем контуре.',
    supportingQueries: [
      'программа для прораба',
      'учет работ на объекте',
      'контроль графика работ',
      'мобильное приложение для прораба',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы прораба в общем контуре',
      description: 'Задачи, замечания, статусы и ответственные связаны с объектом.',
      signals: [
        'Статусы работ уточняются в чатах и звонках, а не в одной системе.',
        'Замечания теряются между прорабом, офисом и инженерной командой.',
        'Руководитель видит отклонения уже после срыва срока, а не заранее.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Прораб ведет задачи в голове, в мессенджерах и разрозненных таблицах.',
        'Факт по объекту приходит с задержкой и без нормальной фотофиксации.',
        'Руководитель вручную собирает картину по срокам и проблемным зонам.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'Задачи, сроки, замечания и фотофакт собираются в одном объектном контуре.',
        'Команда видит, что блокирует работу сегодня, а не в конце недели.',
        'Руководитель получает понятный обзор по отклонениям и исполнению без ручного свода.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Единая запись', detail: 'Задачи, замечания и фото связаны с объектом.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Команда видит текущий этап и следующий шаг.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для следующего шага указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для команд, которым нужно каждый день держать площадку, задачи и исполнителей под контролем.',
    audiences: [
      'Прорабам, которые координируют задачи, подрядчиков и замечания на объекте.',
      'Руководителям участка, которым нужна фактическая картина по срокам и дисциплине исполнения.',
      'Строительным компаниям, где объект до сих пор управляется в чатах, звонках и таблицах.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Основные боли связаны с потерей статусов, замечаний и факта по работам.',
    problems: [
      'Собирает задачи, замечания и статусы работ в одном потоке вместо разрозненных чатов.',
      'Показывает отклонения по срокам и критические узкие места по объекту.',
      'Дает руководителю прозрачный факт по выполнению и блокирующим вопросам.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на ежедневной работе объекта: задачи, сроки, замечания, фото и понятные статусы.',
    automations: [
      'Постановку задач по объекту и контроль сроков исполнения.',
      'Фотофиксацию, комментарии и передачу замечаний между офисом и площадкой.',
      'Подготовку оперативной отчетности по статусам работ и рискам на объекте.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Каждая роль получает свой полезный срез, а не перегруженный интерфейс.',
    roleViews: [
      { role: 'Прораб', description: 'Список задач, проблемные зоны, сроки, комментарии и факт по участкам.' },
      { role: 'Руководитель строительства', description: 'Картину по отклонениям, срывам сроков и дисциплине исполнения.' },
      { role: 'Офис / ПТО', description: 'Статусы, замечания и готовность документации по объекту.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Мобильное приложение для стройки',
        href: marketingPaths.mobileApp,
        description: 'Полевой контур для прораба, снабженца и инженерной команды.',
      },
      {
        label: 'Система для ПТО',
        href: marketingPaths.ptoSoftware,
        description: 'Если нужен связанный контур по замечаниям и исполнительной документации.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[0].articles
      .filter((article) => article.relatedPath === marketingPaths.foremanSoftware)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем сценарий работы прораба без перегруза всей платформой.',
      'Разберем, какие данные должен видеть руководитель строительства каждый день.',
      'Подскажем, как запускать объектовый контур без болезненного перехода команды.',
    ],
    faq: [
      {
        question: 'Чем программа для прораба отличается от обычного таск-менеджера?',
        answer: 'Здесь задачи связаны с объектом, сроками, замечаниями, фотофиксацией и строительным контекстом, а не просто со списком поручений.',
      },
      {
        question: 'Можно ли использовать МОСТ на площадке с телефона?',
        answer: 'Да, полевой сценарий предусмотрен: прораб и инженерная команда могут работать с задачами, фото и статусами прямо на объекте.',
      },
      {
        question: 'Подходит ли МОСТ для нескольких объектов одновременно?',
        answer: 'Да, система дает отдельную картину по каждому объекту и сводный контроль для руководителя строительства.',
      },
    ],
  },
  'construction-crm': {
    path: marketingPaths.constructionCrm,
    eyebrow: 'CRM-контур',
    title: 'CRM для строительной компании с объектами, задачами и статусами',
    description:
      'CRM для строительной компании помогает связать объекты, задачи, договоры, коммуникации и исполнение в одном рабочем контуре МОСТ.',
    supportingQueries: [
      'crm для строительной компании',
      'система для строительной компании',
      'замена excel для стройки',
      'управление объектами и задачами',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы с объектами в CRM-контуре',
      description: 'Объект, договорной процесс, статусы и ответственные остаются в одном рабочем контексте.',
      signals: [
        'Статусы по объектам живут в таблицах разных подразделений и не сходятся между собой.',
        'Руководитель не видит, где именно завис следующий шаг по проекту.',
        'Команда дублирует одни и те же данные в таблицах, чатах и почте.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'У каждого подразделения своя версия статуса по объекту.',
        'Следующие действия по клиенту и объекту теряются на стыке коммерческого и операционного контура.',
        'Картина по портфелю проектов собирается вручную перед встречами и планерками.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'Клиент, объект, задачи и исполнение связываются в один рабочий маршрут.',
        'Команда понимает следующий шаг и ответственного без переписки и поисков в таблицах.',
        'Руководитель видит портфель объектов и зависшие процессы в одном месте.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Связь с объектом', detail: 'Клиентские и договорные данные остаются в контексте объекта.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Участники видят текущий этап работы.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'У каждого следующего шага указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Фокус на компаниях, которым нужен единый рабочий контур поверх разрозненных таблиц и чатов.',
    audiences: [
      'Подрядчикам и генподрядчикам, где клиенты, объекты и исполнение живут в разных инструментах.',
      'Командам запуска, которым важно видеть воронку объекта и статус исполнения без ручного свода.',
      'Руководителям, которым нужна одна точка входа в процессы компании.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Основная цель — убрать разрыв между объектом, договорным контуром, исполнением и управленческим слоем стройки.',
    problems: [
      'Связывает компанию, объект, договорной процесс и рабочие задачи команды.',
      'Убирает ручную пересборку статусов по объектам из таблиц и мессенджеров.',
      'Дает прозрачный путь от запроса клиента до фактического исполнения работ.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'МОСТ связывает объект, договоры, статусы, исполнение и координацию команды в один рабочий процесс.',
    automations: [
      'Фиксацию этапов по объекту, договору и рабочему запуску.',
      'Маршрутизацию задач между офисом, объектом, снабжением и финансовым блоком.',
      'Подготовку управленческого статуса по объектам без ручного свода.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Важен единый контекст по компании, а не локальные таблицы каждого подразделения.',
    roleViews: [
      { role: 'Руководитель компании', description: 'Статус объектов, риски, ответственных и точки задержки.' },
      { role: 'Операционный менеджер', description: 'Следующий шаг по каждому объекту и зависшие процессы.' },
      { role: 'Команда проекта', description: 'Связанный контур задач, документов и статусов исполнения.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'ERP для строительства',
        href: marketingPaths.constructionErp,
        description: 'Если нужен расширенный контур с финансами, снабжением и аналитикой.',
      },
      {
        label: 'Контроль подрядчиков',
        href: marketingPaths.contractorControl,
        description: 'Если основной риск связан с внешними исполнителями и сроками.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[1].articles
      .filter((article) => article.relatedPath === marketingPaths.constructionCrm)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем, как собрать объекты, договорной контур и исполнение в одном CRM-контуре.',
      'Разложим, где у вас сейчас дублируются данные между таблицами и чатами.',
      'Подскажем, как перейти на единый контур без резкой перестройки процессов.',
    ],
    faq: [
      {
        question: 'Чем строительная CRM отличается от обычной CRM продаж?',
        answer: 'В строительстве CRM должна вести не только сделку или договор, но и объект, исполнение, документы, задачи команды и управленческий контур.',
      },
      {
        question: 'Можно ли начать только с объектового контура, а не со всей компании сразу?',
        answer: 'Да, МОСТ позволяет стартовать с одного процесса и расширять систему по мере роста зрелости команды.',
      },
      {
        question: 'Подойдет ли МОСТ как альтернатива Excel для стройки?',
        answer: 'Да, это один из типовых сценариев: убрать ручной свод по объектам, статусам и ответственным.',
      },
    ],
  },
  'construction-erp': {
    path: marketingPaths.constructionErp,
    eyebrow: 'Сквозной контур',
    title: 'ERP для строительства с контролем объектов, снабжения и финансов',
    description:
      'ERP для строительства в МОСТ объединяет объект, снабжение, документы, платежи и управленческую аналитику в одном цифровом контуре.',
    supportingQueries: [
      'erp для строительства',
      'система управления строительством',
      'программа для строительной компании',
      'интеграция с 1с и erp',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы в сквозном ERP-контуре',
      description: 'Объект, снабжение, документы и финансы связаны установленным маршрутом.',
      signals: [
        'Объект, снабжение, документы и платежи живут в разных системах и плохо синхронизируются.',
        'Управленческая картина появляется поздно и зависит от ручной сборки отчетов.',
        'Каждое подразделение видит только свой кусок процесса, но не общий риск по объекту.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Ручные стыковки между Excel, учетными системами и мессенджерами занимают время команды.',
        'Финансовый и операционный контур расходятся по срокам и статусам.',
        'Топ-менеджмент получает картину уже после возникновения проблемы.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'Объект, снабжение, документы и платежи работают в связанной логике.',
        'Руководители видят отклонения и точки блокировки в разрезе портфеля объектов.',
        'Подразделения работают в одном контуре, а не перекладывают ответственность друг на друга.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Установленный маршрут', detail: 'Заявка проходит связанные этапы до документа и платежа.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Статус каждого этапа доступен участникам процесса.' },
        { label: 'Основание решения', value: 'История решений', detail: 'Документы и решения сохраняются в связанном контексте.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для компаний, которые уже выросли из точечных решений и ищут сквозное управление стройкой.',
    audiences: [
      'Генподрядчикам и девелоперам с несколькими объектами и распределенной командой.',
      'Строительным компаниям, которым нужен единый цифровой контур вместо набора разрозненных систем.',
      'Руководителям, которым важны сроки, бюджет, документы и аналитика в одном окне.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'ERP-подход нужен там, где локальные инструменты уже не справляются с масштабом.',
    problems: [
      'Связывает объект, снабжение, платежи и документы в единую логику исполнения.',
      'Снижает количество ручных стыковок между Excel, мессенджерами и разными учетными системами.',
      'Дает управленческую картину по нескольким объектам и юридическим лицам.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Упор на сквозные сценарии, которые обычно ломаются на стыке подразделений.',
    automations: [
      'Маршруты согласования заявок, закупок, документов и платежей.',
      'Сводную отчетность по объектам, ролям и юридическим лицам.',
      'Передачу данных между объектом, офисом, снабжением и финансовым блоком.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Вместо фрагментов данных каждый блок видит свой слой в общей системе.',
    roleViews: [
      { role: 'Руководитель компании', description: 'Сводку по объектам, бюджету, срокам и критическим отклонениям.' },
      { role: 'Финансовый блок', description: 'Платежный контур, обязательства, лимиты и связь с фактом работ.' },
      { role: 'Операционный контур', description: 'Снабжение, документы, задачи и статус исполнения по объекту.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Интеграции с 1С и ERP',
        href: marketingPaths.integrations,
        description: 'Если важен сценарий обмена данными с текущим корпоративным ландшафтом.',
      },
      {
        label: 'Контроль бюджета стройки',
        href: marketingPaths.constructionBudgetControl,
        description: 'Как связать бюджет, платежи, лимиты и управленческий контроль по объектам.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[2].articles
      .filter((article) => article.relatedPath === marketingPaths.constructionErp)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем, с какого контура начинать ERP-сценарий без перегруза команды.',
      'Разложим, какие процессы уже готовы к сквозной автоматизации, а какие еще нет.',
      'Отдельно обсудим интеграции, роли и управленческую отчетность.',
    ],
    faq: [
      {
        question: 'Чем ERP для строительства отличается от набора точечных систем?',
        answer: 'ERP-контур строится вокруг сквозных процессов: объект, снабжение, документы, платежи и аналитика работают в одной логике.',
      },
      {
        question: 'Можно ли внедрять ERP-контур поэтапно?',
        answer: 'Да, МОСТ позволяет запускать систему по приоритетным контурам и не переводить всю компанию одномоментно.',
      },
      {
        question: 'Подходит ли МОСТ для группы компаний?',
        answer: 'Да, для multi-entity сценариев есть корпоративный контур с управлением доступами и аналитикой по нескольким организациям.',
      },
    ],
  },
  'material-accounting': {
    path: marketingPaths.materialAccounting,
    eyebrow: 'Снабжение и склад',
    title: 'Учет материалов в строительстве: заявки, поставки и остатки',
    description:
      'Система учета материалов в строительстве помогает контролировать заявки, закупки, поставки, остатки и движение материалов по объектам.',
    supportingQueries: [
      'учет материалов в строительстве',
      'строительный склад',
      'заявки на материалы',
      'контроль поставок',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы со снабжением',
      description: 'Заявки, поставки, статусы и ответственные связаны с объектом.',
      signals: [
        'Прораб не понимает, что реально заказано, в пути и принято на объект.',
        'Снабженец тратит время на ручное уточнение статусов по каждой заявке.',
        'Срыв поставки обнаруживается уже тогда, когда работа на объекте встает.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Заявки, поставки и остатки отслеживаются в разных таблицах и переписках.',
        'Команда не видит узкие места до того, как они ударят по графику.',
        'Руководитель получает неполную картину по материалам и рискам снабжения.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'У заявки появляется понятный путь: запрос, согласование, поставка, приемка, остаток.',
        'Прораб и снабженец видят один статус по материалам без двойной сверки.',
        'Руководитель заранее видит дефицит и задержки, которые влияют на объект.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Единая карточка', detail: 'Заявка, поставка и объект связаны в одной карточке.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Команда видит текущий этап поставки.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для обработки заявки указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для компаний, у которых потери и задержки чаще всего начинаются в снабжении.',
    audiences: [
      'Снабженцам и руководителям закупок, которым нужен прозрачный путь от заявки до поставки.',
      'Подрядчикам, где материалы теряются между объектом, складом и поставщиком.',
      'Руководителям объекта, которым важно видеть, что реально доехало и что задерживается.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Основной фокус — убрать потери на стыке заявки, поставки и фактического использования материалов.',
    problems: [
      'Дает единый статус по заявкам, закупкам и доставке материалов на объект.',
      'Показывает остатки и движение материалов без ручной сверки в таблицах.',
      'Снижает риск срывов работ из-за отсутствия прозрачности по снабжению.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Заявки, закупки, поставки и остатки идут по понятному маршруту от объекта до склада.',
    automations: [
      'Регистрацию заявок на материалы и маршруты их согласования.',
      'Контроль поставок, приемки и движения по складу или объекту.',
      'Подготовку отчетов по остаткам, задержкам и потреблению материалов.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Каждая роль видит свою часть процесса, но работает в общей картине.',
    roleViews: [
      { role: 'Снабженец', description: 'Очередь заявок, поставщиков, статусы поставок и просрочки.' },
      { role: 'Прораб', description: 'Что заказано, что в пути и что уже принято на объект.' },
      { role: 'Руководитель', description: 'Узкие места, дефицит материалов и влияние снабжения на график работ.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Мобильное приложение для стройки',
        href: marketingPaths.mobileApp,
        description: 'Если важно подтверждать поставки и работать с материалами прямо на площадке.',
      },
      {
        label: 'Контроль бюджета стройки',
        href: marketingPaths.constructionBudgetControl,
        description: 'Когда нужно увязать снабжение с лимитами и фактическими затратами.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[0].articles
      .concat(marketingBlogEditorialSeries[1].articles)
      .filter((article) => article.relatedPath === marketingPaths.materialAccounting)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем путь заявки на материалы от объекта до поставки.',
      'Разберем, где сейчас теряются статусы и контроль остатков.',
      'Поможем связать снабжение с графиком работ и бюджетом объекта.',
    ],
    faq: [
      {
        question: 'Можно ли учитывать материалы по нескольким объектам одновременно?',
        answer: 'Да, МОСТ поддерживает работу по нескольким объектам с раздельной картиной заявок, поставок и остатков.',
      },
      {
        question: 'Подходит ли решение для строительного склада?',
        answer: 'Да, контур охватывает остатки, движения, приемку и связь со строительными заявками.',
      },
      {
        question: 'Как система помогает сократить срывы поставок?',
        answer: 'Она дает прозрачные статусы по заявкам и поставкам, чтобы команда видела задержки раньше, чем они ударят по графику работ.',
      },
    ],
  },
  'pto-software': {
    path: marketingPaths.ptoSoftware,
    eyebrow: 'Инженерный контур',
    title: 'Система для ПТО: замечания, акты и исполнительная документация',
    description:
      'Система для ПТО в МОСТ помогает вести замечания, исполнительную документацию, акты, комплектность и статусы согласования по объекту.',
    supportingQueries: [
      'система для пто',
      'исполнительная документация',
      'акты кс-2 кс-3',
      'контроль замечаний',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы ПТО с документами',
      description: 'Документы, комплектность, замечания и ответственные проходят установленный маршрут.',
      signals: [
        'Замечания, акты и документы живут в отдельных папках, письмах и чатах.',
        'Статус готовности пакета документов приходится уточнять вручную.',
        'Закрытие этапов тормозится не из-за работ, а из-за отсутствия прозрачности по документам.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'ПТО тратит время на поиск версий, замечаний и ответственных.',
        'Руководитель проекта не понимает, какой именно документ блокирует закрытие этапа.',
        'Финансовый контур ждет акты и комплектность без ясного срока готовности.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'Замечания, акты и исполнительная документация собираются в одном инженерном контуре.',
        'У каждого пакета есть статус, ответственный и следующий шаг.',
        'Руководитель проекта видит не просто архив, а реальную готовность этапа к закрытию.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Связь с документом', detail: 'Замечания и действия остаются у документа.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Комплектность и согласование имеют текущий статус.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для подготовки и проверки указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для инженерных команд, где ПТО тонет в разрозненных файлах, замечаниях и согласованиях.',
    audiences: [
      'Инженерам ПТО, которым нужен контролируемый контур по замечаниям и документам.',
      'Руководителям проектов, которым важно видеть готовность исполнительной документации.',
      'Подрядчикам и генподрядчикам, где акты и комплектность документов влияют на деньги и сроки.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Инженерные документы становятся управляемыми: со статусами, сроками и ответственными.',
    problems: [
      'Убирает разрыв между замечаниями, фактами по объекту и комплектностью документации.',
      'Показывает готовность пакета документов по этапам и исполнителям.',
      'Снижает риск просрочки актов и согласований из-за ручного контроля.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на инженерных процессах, которые обычно срывают срок закрытия этапов.',
    automations: [
      'Фиксацию замечаний, сроков устранения и ответственных исполнителей.',
      'Подготовку и контроль исполнительной документации по объекту.',
      'Связку актов, комплектов документов и статусов согласования.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'ПТО получает контекст по документам, а руководитель — реальную готовность этапа.',
    roleViews: [
      { role: 'Инженер ПТО', description: 'Замечания, комплектность пакета, сроки согласования и узкие места.' },
      { role: 'Руководитель проекта', description: 'Готовность этапов и причины, по которым документы не закрываются вовремя.' },
      { role: 'Подрядчик / исполнитель', description: 'Список замечаний и требуемых документов по своей зоне ответственности.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Исполнительная документация',
        href: marketingPaths.constructionDocuments,
        description: 'Как вести исполнительную документацию, акты и комплекты документов без ручного хаоса.',
      },
      {
        label: 'Программа для прораба',
        href: marketingPaths.foremanSoftware,
        description: 'Если нужно связать контур ПТО с задачами и фактом на площадке.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[0].articles
      .concat(marketingBlogEditorialSeries[2].articles)
      .filter((article) => article.relatedPath === marketingPaths.ptoSoftware)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем, как связать замечания, акты и комплектность документов в одном процессе.',
      'Разберем, где ПТО сейчас теряет время на ручной контроль и дублирование файлов.',
      'Подскажем, как запускать контур поэтапно без перегруза инженерной команды.',
    ],
    faq: [
      {
        question: 'Подходит ли МОСТ для работы ПТО на нескольких объектах?',
        answer: 'Да, можно вести замечания и документацию раздельно по объектам и при этом иметь сводную управленческую картину.',
      },
      {
        question: 'Можно ли контролировать акты КС-2 и КС-3 в этом контуре?',
        answer: 'Да, контур ПТО связан с документами и позволяет вести статусы по актам и комплектам документов.',
      },
      {
        question: 'Чем это лучше папок и таблиц?',
        answer: 'Система дает статусы, ответственных и сроки, а не просто хранит файлы без управленческой логики.',
      },
    ],
  },
  'contractor-control': {
    path: marketingPaths.contractorControl,
    eyebrow: 'Исполнители и сроки',
    title: 'Контроль подрядчиков в строительстве по срокам, объемам и актам',
    description:
      'Система контроля подрядчиков помогает видеть статусы работ, объемы, сроки, замечания и исполнительскую дисциплину по каждому подрядчику.',
    supportingQueries: [
      'контроль подрядчиков',
      'контроль субподрядчиков',
      'система для генподрядчика',
      'контроль сроков и объемов',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы с подрядчиками',
      description: 'Объемы, замечания, статусы и ответственные связаны с подрядчиком и объектом.',
      signals: [
        'Срыв сроков подрядчика становится заметен слишком поздно.',
        'Замечания и объемы работ не связаны с общей картиной по объекту.',
        'Заказчик или руководство получают отчет уже после накопления проблемы.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Контроль подрядчиков строится на звонках, еженедельных отчетах и ручных напоминаниях.',
        'Статусы по объемам, замечаниям и актам расходятся между участниками процесса.',
        'Руководитель проекта вручную собирает картину по внешним исполнителям.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'По каждому подрядчику видны сроки, объемы, замечания и качество закрытия этапа.',
        'Руководитель заранее видит просадку по исполнителю и может вмешаться до срыва.',
        'Заказчик получает прозрачную картину по внешним исполнителям без ручной пересборки.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Связь с объектом', detail: 'Объемы и замечания связаны с подрядчиком и объектом.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Команда видит текущий этап работ подрядчика.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для замечания или согласования указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Подходит компаниям, где основные риски лежат в управлении внешними исполнителями.',
    audiences: [
      'Генподрядчикам, которым нужен единый контур контроля подрядчиков по объектам.',
      'Девелоперам, которым важно видеть статус исполнителей и риски по срокам.',
      'Подрядчикам, работающим с большим количеством субподрядчиков и этапов.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контроль подрядчика — это не просто список договоров, а ежедневное исполнение и фактический риск.',
    problems: [
      'Показывает реальный статус работ и отклонения по каждому подрядчику.',
      'Фиксирует замечания, просрочки и причины срыва сроков.',
      'Связывает подрядчика с объемами, актами и обязательствами по объекту.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на дисциплине исполнения и прозрачности ответственности.',
    automations: [
      'Фиксацию статусов, дедлайнов и замечаний по подрядчикам.',
      'Контроль выполнения обязательств по работам и этапам.',
      'Подготовку управленческой картины по подрядчикам для руководителя и заказчика.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Каждый участник процесса получает полезный управленческий срез.',
    roleViews: [
      { role: 'Генподрядчик', description: 'Срыв сроков, узкие места по подрядчикам и фактическую картину исполнения.' },
      { role: 'Руководитель проекта', description: 'Ответственных, замечания, объемы и риски по каждому подрядчику.' },
      { role: 'Заказчик / девелопер', description: 'Прозрачную отчетность по ходу исполнения и статусу внешних исполнителей.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Контроль бюджета стройки',
        href: marketingPaths.constructionBudgetControl,
        description: 'Когда важно увязать исполнение подрядчиков с оплатами и лимитами.',
      },
      {
        label: 'ERP для строительства',
        href: marketingPaths.constructionErp,
        description: 'Если подрядный контур должен быть частью общей системы управления стройкой.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[1].articles
      .filter((article) => article.relatedPath === marketingPaths.contractorControl)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем, как контролировать подрядчиков не по отчетам в конце недели, а по факту исполнения.',
      'Разберем, какие сигналы срыва сроков должны появляться раньше всего.',
      'Подскажем, как выстроить прозрачность по подрядчикам без лишней бюрократии.',
    ],
    faq: [
      {
        question: 'Можно ли контролировать подрядчиков по нескольким объектам одновременно?',
        answer: 'Да, в системе можно вести отдельный контур по каждому объекту и сводную картину по всем подрядчикам компании.',
      },
      {
        question: 'Как связать контроль подрядчиков с актами и замечаниями?',
        answer: 'Статусы подрядчика, замечания и документы работают в одной логике, поэтому руководитель видит не только факт выполнения, но и качество закрытия этапа.',
      },
      {
        question: 'Подходит ли решение для девелопера?',
        answer: 'Да, это один из целевых сценариев: девелопер получает прозрачный контур по внешним исполнителям и рискам объекта.',
      },
    ],
  },
  'construction-documents': {
    path: marketingPaths.constructionDocuments,
    eyebrow: 'Документы и акты',
    title: 'Исполнительная документация в строительстве под контролем сроков',
    description:
      'МОСТ помогает вести исполнительную документацию в строительстве: замечания, комплектность, акты, статусы согласования и готовность пакетов по объекту.',
    supportingQueries: [
      'исполнительная документация в строительстве',
      'акты кс-2 кс-3',
      'строительные документы',
      'комплектность документов',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы с исполнительными документами',
      description: 'Комплектность, согласования, акты и ответственные связаны с документом.',
      signals: [
        'Команда не понимает, какой документ мешает закрытию этапа прямо сейчас.',
        'Версии и замечания расходятся между подрядчиком, ПТО и руководителем проекта.',
        'Документы есть, но управленческой прозрачности по готовности нет.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Документы лежат в папках, письмах и мессенджерах без общего статуса.',
        'Замечания исправляются рывками, а комплектность проверяется вручную.',
        'Закрытие этапов и движение денег зависят от ручного контроля документов.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'По каждому пакету видны комплектность, замечания и следующий шаг.',
        'Команда понимает, что уже готово к согласованию, а что требует доработки.',
        'Документный контур становится частью рабочей системы, а не только архива.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Единая запись', detail: 'Состав пакета и замечания хранятся в одной записи.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Документ имеет статус подготовки или согласования.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для документа указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для тех команд, у кого документы влияют на закрытие этапов, оплату и репутацию перед заказчиком.',
    audiences: [
      'ПТО и инженерам, которые ведут исполнительную документацию по объекту.',
      'Генподрядчикам и подрядчикам, где акты и пакет документов критичны для движения денег.',
      'Руководителям проекта, которым нужна прозрачность по готовности документации.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Документный контур становится управляемым, когда у него появляются статусы и ответственность.',
    problems: [
      'Собирает замечания, документы и акты в один контролируемый поток.',
      'Показывает, где именно пакет документов не готов к закрытию.',
      'Снижает риск просрочек по актам и зависших согласований.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Исполнительная документация, акты и согласования двигаются как единый рабочий поток.',
    automations: [
      'Формирование и контроль комплектности пакетов документов.',
      'Маршруты согласования и фиксацию замечаний по документам.',
      'Контроль статусов по актам КС-2, КС-3 и сопутствующим пакетам.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Команда видит не просто архив, а реальную управленческую картину по документам.',
    roleViews: [
      { role: 'ПТО', description: 'Что готово, что в работе, что возвращено и где сейчас узкое место.' },
      { role: 'Руководитель проекта', description: 'Готовность закрытия этапов и причины задержек по документам.' },
      { role: 'Финансовый блок', description: 'Какие документы и акты готовы к движению в оплату.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Система для ПТО',
        href: marketingPaths.ptoSoftware,
        description: 'Если нужен широкий инженерный контур с замечаниями и согласованиями.',
      },
      {
        label: 'Контроль бюджета стройки',
        href: marketingPaths.constructionBudgetControl,
        description: 'Чтобы связать документы и акты с фактом затрат и платежей.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[2].articles
      .filter((article) => article.relatedPath === marketingPaths.constructionDocuments)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем, как собрать исполнительную документацию в один управляемый контур.',
      'Разберем, где сегодня теряются версии, замечания и сроки согласования.',
      'Подскажем, как связать акты, комплектность и движение денег без ручной пересборки.',
    ],
    faq: [
      {
        question: 'Подходит ли МОСТ для контроля КС-2 и КС-3?',
        answer: 'Да, система помогает связать акты с комплектами документов, замечаниями и статусами согласования.',
      },
      {
        question: 'Можно ли вести исполнительную документацию по нескольким объектам?',
        answer: 'Да, пакеты документов и статусы можно вести раздельно по объектам и при этом получать сводную управленческую картину.',
      },
      {
        question: 'Чем это отличается от обычного файлового хранилища?',
        answer: 'Хранилище хранит файлы, а МОСТ дает статусы, сроки, ответственных и точки блокировки по документному контуру.',
      },
    ],
  },
  'construction-budget-control': {
    path: marketingPaths.constructionBudgetControl,
    eyebrow: 'Финансовый контур',
    title: 'Контроль бюджета стройки: платежи, лимиты и фактические затраты',
    description:
      'МОСТ дает контроль бюджета стройки по объектам: лимиты, платежи, обязательства, фактические затраты и отклонения в одном рабочем контуре.',
    supportingQueries: [
      'контроль бюджета стройки',
      'финансы в строительстве',
      'контроль затрат по объекту',
      'платежи и лимиты в строительстве',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок финансового контроля по объекту',
      description: 'Бюджетные записи, документы, статусы и решения связаны с объектом.',
      signals: [
        'Отклонения бюджета обнаруживаются после факта, а не в момент накопления риска.',
        'Платежи, лимиты и обязательства живут в разных таблицах и письмах.',
        'Руководитель стройки не видит связи между сроками, подрядчиками и финансовым фактом.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Финансовая картина собирается вручную и быстро устаревает.',
        'Риск перерасхода становится заметен слишком поздно для спокойной корректировки.',
        'Команда спорит о данных вместо того, чтобы обсуждать решения.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'Лимиты, платежи, обязательства и затраты читаются по объекту в одном контуре.',
        'Отклонения видны раньше, чем превращаются в кассовую и операционную проблему.',
        'Руководство видит, где бюджет, сроки и подрядчики начинают влиять друг на друга.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Связь с объектом', detail: 'Бюджетные записи связаны с объектом и документами.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Согласование и оплата имеют текущий статус.' },
        { label: 'Основание решения', value: 'История решений', detail: 'Согласования и изменения сохраняются в истории.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для компаний, которым нужен не бухгалтерский учет сам по себе, а управляемость бюджета объекта.',
    audiences: [
      'Руководителям строительства и финансовым директорам, которым важны отклонения по объектам.',
      'Подрядчикам и генподрядчикам, где бюджеты живут в разрозненных таблицах и письмах.',
      'Девелоперам, которым нужна сводная картина по подрядчикам, платежам и лимитам.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Фокус на управлении бюджетом: видеть отклонения раньше, чем они становятся проблемой.',
    problems: [
      'Показывает отклонения бюджета раньше, чем они становятся кассовой проблемой.',
      'Связывает затраты, заявки, договоры, подрядчиков и документы в одной логике.',
      'Дает управленческую картину по объектам без ручной консолидации отчетов.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Финансовый контур строится вокруг объекта и управленческих решений.',
    automations: [
      'Контроль лимитов, платежных маршрутов и обязательств по объекту.',
      'Сводку по фактическим затратам и отклонениям от плана.',
      'Связку финансового решения с документами, снабжением и работами.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Все ключевые участники получают свои ответы на один и тот же вопрос: где риск и что с ним делать.',
    roleViews: [
      { role: 'Финансовый блок', description: 'Лимиты, платежный контур, обязательства и зависшие согласования.' },
      { role: 'Руководитель объекта', description: 'Влияние затрат и поставок на выполнение графика.' },
      { role: 'Топ-менеджмент', description: 'Сводную картину по бюджету, подрядчикам и критическим отклонениям.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'ERP для строительства',
        href: marketingPaths.constructionErp,
        description: 'Если финансовый контур должен быть частью сквозной ERP-логики.',
      },
      {
        label: 'Контроль подрядчиков',
        href: marketingPaths.contractorControl,
        description: 'Когда нужно видеть связь между сроками исполнения и оплатами подрядчиков.',
      },
    ],
    blogLinks: marketingBlogEditorialSeries[0].articles
      .concat(marketingBlogEditorialSeries[1].articles)
      .filter((article) => article.relatedPath === marketingPaths.constructionBudgetControl)
      .map((article) => ({
        label: article.title,
        href: marketingPaths.blog,
        description: article.summary,
      })),
    contactHighlights: [
      'Покажем, как выстроить контроль бюджета не в конце месяца, а по ходу объекта.',
      'Разберем, какие сигналы перерасхода важно видеть в одной панели ежедневно.',
      'Подскажем, как связать затраты, подрядчиков и документы в управленческий контур.',
    ],
    faq: [
      {
        question: 'Можно ли контролировать бюджет по нескольким объектам одновременно?',
        answer: 'Да, МОСТ поддерживает как отдельную картину по объекту, так и сводный управленческий слой по всему портфелю.',
      },
      {
        question: 'Подходит ли решение для девелопера?',
        answer: 'Да, особенно если важно видеть бюджет, статус подрядчиков и движение денег по нескольким объектам.',
      },
      {
        question: 'Чем это отличается от бухгалтерской системы?',
        answer: 'Фокус не на регламентированном учете, а на ежедневном управленческом контроле стройки и раннем выявлении отклонений.',
      },
    ],
  },
  'mobile-app': {
    path: marketingPaths.mobileApp,
    eyebrow: 'Полевой контур',
    title: 'Мобильное приложение для строительной компании и работы на объекте',
    description:
      'Мобильное приложение МОСТ помогает вести задачи, замечания, фотофиксацию, статусы работ и материалы прямо на строительной площадке.',
    supportingQueries: [
      'мобильное приложение для строительной компании',
      'приложение для стройки',
      'мобильное приложение для прораба',
      'полевой контур стройки',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок работы площадки и офиса',
      description: 'События, фото, замечания и ответственные сохраняют связь с объектом.',
      signals: [
        'Фото, замечания и статусы работ фиксируются с задержкой или не доходят до офиса.',
        'Площадка и офис живут в разных темпах и постоянно уточняют факт вручную.',
        'Снабжение и приемка материалов зависят от звонков и переписок.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Команда фиксирует факт на телефоне, но потом вручную переносит его в таблицы и чаты.',
        'Руководитель получает неполную картину по объекту и реагирует поздно.',
        'Полевые данные не становятся частью единого процесса вовремя.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'Задачи, фото, замечания и подтверждения по объекту сразу попадают в рабочий контур.',
        'Офис и площадка смотрят на один статус без задержек и дублирования.',
        'Мобильная команда влияет на скорость решений, а не просто поставляет сырой факт.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Связь с объектом', detail: 'Фото и замечания сохраняют связь с объектом.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Площадка и офис видят текущий статус задачи.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для замечания указана ответственная роль.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для команд, где ключевая информация возникает на площадке, но теряется на пути в офис.',
    audiences: [
      'Прорабам и руководителям участка, которым нужно работать с задачами на ходу.',
      'Снабженцам и инженерам, которым важно подтверждать факт прямо на объекте.',
      'Строительным компаниям, где мобильный контур должен быть частью общей системы.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Основной риск без мобильного контура — запаздывание факта и потеря деталей по объекту.',
    problems: [
      'Позволяет фиксировать задачи, замечания и фотофакт прямо на площадке.',
      'Сокращает разрыв между событием на объекте и управленческим решением в офисе.',
      'Поддерживает работу команды без постоянного возврата к таблицам и перепискам.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Мобильный контур нужен не сам по себе, а как часть единого процесса стройки.',
    automations: [
      'Передачу задач, комментариев и статусов между офисом и площадкой.',
      'Фотофиксацию, подтверждение работ и работу с замечаниями.',
      'Полевые сценарии по материалам, приемке и оперативной отчетности.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Мобильный слой делает площадку полноценным участником цифрового процесса.',
    roleViews: [
      { role: 'Прораб', description: 'Задачи, статусы, замечания и фото по объекту в одном интерфейсе.' },
      { role: 'Снабженец', description: 'Подтверждения поставок, приемки и комментарии с объекта.' },
      { role: 'Офис / руководитель', description: 'Оперативный факт с площадки без задержки и потерь в коммуникации.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'Программа для прораба',
        href: marketingPaths.foremanSoftware,
        description: 'Как связать работу прораба на площадке с офисом, снабжением и ПТО.',
      },
      {
        label: 'Учет материалов в строительстве',
        href: marketingPaths.materialAccounting,
        description: 'Если мобильный контур нужен прежде всего для снабжения и приемки.',
      },
    ],
    blogLinks: [
      {
        label: 'Как прорабу вести объект без хаоса',
        href: marketingPaths.blog,
        description: 'Материал о том, какие данные площадка должна фиксировать ежедневно.',
      },
      {
        label: 'Как снабженцу контролировать материалы без Excel',
        href: marketingPaths.blog,
        description: 'Разбор полевого контура по заявкам, поставкам и приемке материалов.',
      },
    ],
    contactHighlights: [
      'Покажем, как мобильный контур связывает площадку и офис без двойного ввода.',
      'Разберем, какие сценарии команда должна закрывать на телефоне, а какие — в офисе.',
      'Подскажем, как запускать мобильную работу без сопротивления пользователей.',
    ],
    faq: [
      {
        question: 'Можно ли работать с МОСТ на объекте с телефона?',
        answer: 'Да, мобильный контур предусмотрен для задач, замечаний, фотофиксации и статусов по объекту.',
      },
      {
        question: 'Подходит ли приложение для снабжения и приемки материалов?',
        answer: 'Да, мобильный сценарий можно использовать для подтверждения поставок и фиксации факта на площадке.',
      },
      {
        question: 'Нужен ли отдельный продукт для мобильной команды?',
        answer: 'Нет, мобильный контур является частью общей системы МОСТ и работает в связке с офисным слоем.',
      },
    ],
  },
  'ai-estimates': {
    path: marketingPaths.aiEstimates,
    eyebrow: 'AI и сметы',
    title: 'AI смета по чертежу для быстрого старта оценки объемов и сценариев',
    description:
      'AI-смета по чертежу в МОСТ помогает быстро оценить объемы, подготовить стартовый сценарий сметного расчета и сократить ручную первичную обработку.',
    supportingQueries: [
      'ai смета по чертежу',
      'смета по чертежу',
      'ai для строительства',
      'предварительная оценка объемов',
    ],
    processComparison: createProcessComparisonFromSource({
      title: 'Порядок разбора чертежей с AI',
      description: 'Исходный документ, статус разбора и экспертная проверка остаются в одном маршруте.',
      signals: [
        'Первичная оценка чертежей и объемов занимает слишком много ручного времени.',
        'Команда долго выходит на стартовую оценку проекта и обсуждение сценария.',
        'Сметный процесс перегружен повторяющейся первичной обработкой входных данных.',
      ],
      beforeLabel: 'До запуска',
      beforeState: [
        'Первичный разбор чертежей и входных материалов делается полностью вручную.',
        'На стартовую оценку уходит много времени, а обсуждение сдвигается.',
        'Команда тратит ресурс на однотипную первичную обработку вместо экспертной проверки.',
      ],
      afterLabel: 'После запуска',
      afterState: [
        'AI помогает быстрее собрать стартовый сценарий оценки и перейти к проверке.',
        'Руководитель и сметчик раньше понимают масштаб проекта и трудоемкость расчета.',
        'Экспертное время смещается в сторону верификации и принятия решений, а не рутинного старта.',
      ],
      metrics: [
        { label: 'Рабочий контекст', value: 'Связь с документом', detail: 'Разбор сохраняет связь с исходным чертежом.' },
        { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Материал имеет статус разбора и проверки.' },
        { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Эксперт остаётся ответственным за проверку.' },
      ],
    }),
    audienceTitle: 'Кому подходит',
    audienceDescription: 'Для команд, которые хотят ускорить первичную оценку и старт сметного сценария.',
    audiences: [
      'Сметчикам и техническим специалистам, которым нужно быстрее переходить от чертежа к рабочей оценке.',
      'Руководителям продаж и пресейла, которым важна оперативная предварительная оценка проекта.',
      'Строительным компаниям, тестирующим AI-подходы в инженерных и расчетных процессах.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Это не замена эксперту, а ускоритель первого шага в сметном процессе.',
    problems: [
      'Сокращает время на первичный разбор чертежей и входных данных.',
      'Помогает быстрее перейти к оценке объемов и обсуждению сценария проекта.',
      'Создает основу для дальнейшей ручной верификации и детализации сметы.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Основная ценность — ускорение стартового этапа и снижение ручной нагрузки.',
    automations: [
      'Первичную интерпретацию входных материалов и подготовку основы для сметного расчета.',
      'Формирование стартового сценария обсуждения объемов и структуры расчета.',
      'Передачу предварительной оценки в общий рабочий контур продукта.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'AI-контур нужен для скорости, а не для черного ящика без объяснимости.',
    roleViews: [
      { role: 'Сметчик', description: 'Исходную AI-оценку как стартовую базу для проверки и детализации.' },
      { role: 'Руководитель направления', description: 'Быстрый сценарий оценки проекта и понимание трудоемкости.' },
      { role: 'Команда внедрения', description: 'Как AI-контур встраивается в общий процесс МОСТ.' },
    ],
    relatedLinks: [
      { ...contactLink },
      {
        label: 'ERP для строительства',
        href: marketingPaths.constructionErp,
        description: 'Если AI-сценарий должен стать частью общей системы управления стройкой.',
      },
      {
        label: 'Возможности МОСТ',
        href: marketingPaths.features,
        description: 'Смотреть, как AI-контур стыкуется с объектом, документами и аналитикой.',
      },
    ],
    blogLinks: [
      {
        label: 'Как подготовить стройку к ERP-контурe',
        href: marketingPaths.blog,
        description: 'Материал о зрелости процессов и подготовке данных к более сложной автоматизации.',
      },
      {
        label: 'Как убрать Excel из стройки без стресса для команды',
        href: marketingPaths.blog,
        description: 'Полезно для понимания, как AI и системный контур дополняют друг друга.',
      },
    ],
    contactHighlights: [
      'Покажем, где AI реально ускоряет сметный процесс, а где все еще нужна ручная экспертиза.',
      'Разберем, как использовать AI-сценарий без отрыва от общего контура продукта.',
      'Сразу обсудим зрелость ваших входных данных и практический формат пилота.',
    ],
    faq: [
      {
        question: 'Заменяет ли AI-смета сметчика полностью?',
        answer: 'Нет, AI здесь используется как ускоритель первичной оценки и подготовки стартового сценария, а не как полная замена экспертной проверки.',
      },
      {
        question: 'Можно ли использовать AI-смету как часть пилота МОСТ?',
        answer: 'Да, такой сценарий обсуждается отдельно и обычно включается после оценки данных, чертежей и зрелости процесса.',
      },
      {
        question: 'Подходит ли это только для крупных компаний?',
        answer: 'Нет, AI-сценарий может быть полезен и командам, которым важно быстро считать предварительные оценки и уменьшать ручную нагрузку.',
      },
    ],
  },
  'pir-project-documentation': createOperationalSeoPage({
    path: marketingPaths.pirProjectDocumentation,
    eyebrow: 'ПИР',
    title: 'ПИР и проектная документация с ПД, РД, IFC, замечаниями и нормоконтролем',
    description:
      'МОСТ помогает вести ПИР, проектные версии, ПД, РД, BIM/IFC, замечания, нормоконтроль, статусы и выпуск комплектов в одном рабочем контуре.',
    supportingQueries: [
      'пир в строительстве',
      'проектная документация пд рд',
      'управление проектированием',
      'нормоконтроль проектной документации',
    ],
    processComparisonTitle: 'Порядок работы с проектной документацией',
    processComparisonDescription: 'Контур ПИР связывает проектные файлы, замечания, ответственных и выпуск комплектов с объектом.',
    signals: [
      'ПД и РД хранятся в разных папках, а актуальная версия уточняется вручную.',
      'Замечания по проекту живут в письмах и не имеют единого статуса.',
      'Нормоконтроль и выпуск комплектов сложно связать с управленческой картиной проекта.',
    ],
    beforeState: [
      'Проектная команда сверяет версии по переписке и локальным файлам.',
      'ПТО и руководитель не видят, какие замечания блокируют выпуск комплекта.',
      'История решений теряется между BIM/IFC, PDF, таблицами и письмами.',
    ],
    afterState: [
      'ПД, РД, IFC, замечания и комплекты связаны с объектом и разделами.',
      'У каждого замечания есть статус, ответственный и срок реакции.',
      'Выпуск комплектов опирается на прозрачную историю версий и нормоконтроля.',
    ],
    metrics: [
      { label: 'Рабочий контекст', value: 'Связь с документом', detail: 'Версии и замечания остаются у проектного документа.' },
      { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Раздел и комплект имеют текущий статус.' },
      { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для замечания указана ответственная роль.' },
    ],
    audienceTitle: 'Кому подходит контур ПИР',
    audienceDescription: 'Для команд, где проектирование, ПТО и заказчик регулярно работают с версиями, замечаниями и комплектами документации.',
    audiences: [
      'Проектным офисам, которым нужно управлять ПД, РД, IFC и версиями по объектам.',
      'ПТО и генподрядчикам, которые связывают проектные решения со сметами, ИД и приемкой.',
      'Девелоперам, которым важно видеть историю замечаний и готовность комплектов.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контур закрывает разрыв между проектными файлами, замечаниями и реальным управлением объектом.',
    problems: [
      'Собирает проектные материалы, версии, замечания и нормоконтроль в одном реестре.',
      'Помогает видеть, какие разделы и комплекты готовы к выпуску.',
      'Связывает ПИР со сметами, изменениями, ИД и сдачей результата.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на управляемом жизненном цикле проектной документации.',
    automations: [
      'Регистрацию ПД, РД, IFC и связанных файлов по объектам и разделам.',
      'Маршрут замечаний, нормоконтроля, ответственных и статусов реакции.',
      'Подготовку комплектов и передачу проектной базы в сметный и исполнительный контур.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Каждая роль получает свой срез проектной готовности без перегруза лишними файлами.',
    roleViews: [
      { role: 'Проектная команда', description: 'Версии, замечания, разделы, статусы и готовность комплектов.' },
      { role: 'ПТО', description: 'Связь проектной базы со сметами, ИД, изменениями и приемкой.' },
      { role: 'Руководитель проекта', description: 'Блокирующие замечания, сроки реакции и готовность выпуска документации.' },
    ],
    relatedLinks: [
      { ...contactLink },
      { label: 'Система для ПТО', href: marketingPaths.ptoSoftware, description: 'Сметы, документы, шаблоны отчетов и инженерная подготовка.' },
      { label: 'RFI и изменения', href: marketingPaths.changeControl, description: 'Изменения и решения заказчика, связанные с проектной базой.' },
    ],
    blogLinks: [
      { label: 'Как проектной команде управлять ПД и РД без потери версий', href: marketingPaths.blog, description: 'Разбор проектных версий, замечаний и нормоконтроля.' },
      { label: 'Как подготовить стройку к ERP-контурe', href: marketingPaths.blog, description: 'Когда проектная база становится частью управленческого контура.' },
    ],
    contactHighlights: [
      'Покажем управление ПД, РД, IFC и проектными версиями.',
      'Разберем маршрут замечаний, нормоконтроля и выпуска комплектов.',
      'Свяжем ПИР со сметами, ИД, изменениями и приемкой.',
    ],
    faq: [
      { question: 'Можно ли вести ПД и РД в одном контуре?', answer: 'Да, ПД, РД, IFC, файлы, замечания и комплекты можно связывать с объектом, разделами и статусами.' },
      { question: 'Поддерживаются ли замечания и нормоконтроль?', answer: 'Да, замечания получают статус, ответственного и срок реакции, а нормоконтроль становится частью маршрута документации.' },
      { question: 'ПИР связан со сметами и ИД?', answer: 'Да, проектная база может связываться со сметным, исполнительным и контуром изменений.' },
    ],
  }),
  'construction-safety': createOperationalSeoPage({
    path: marketingPaths.constructionSafety,
    eyebrow: 'Охрана труда',
    title: 'Охрана труда на стройке с инструктажами, допусками и инцидентами',
    description:
      'МОСТ помогает вести инструктажи, наряды-допуски, нарушения, инциденты, предписания и контроль устранения в проектном контексте.',
    supportingQueries: [
      'охрана труда на стройке',
      'безопасность в строительстве',
      'инструктажи и допуски',
      'инциденты на объекте',
    ],
    processComparisonTitle: 'Порядок работы с охраной труда',
    processComparisonDescription: 'События охраны труда получают статус, ответственных и связь с проектом.',
    signals: [
      'Инструктажи и допуски ведутся отдельно от объекта.',
      'Нарушения фиксируются в журналах без прозрачного статуса устранения.',
      'Инциденты не попадают в ежедневную управленческую картину.',
    ],
    beforeState: [
      'Специалист ОТ вручную собирает журналы и файлы.',
      'Прораб передает фото и объяснения в переписках.',
      'Руководитель видит проблему после отдельного отчета.',
    ],
    afterState: [
      'Инструктажи, допуски, нарушения и инциденты связаны с проектом.',
      'У каждого события есть статус, ответственный и срок реакции.',
      'Риски безопасности видны рядом с другими проектными рисками.',
    ],
    metrics: [
      { label: 'Рабочий контекст', value: 'Связь с объектом', detail: 'Инцидент и предписание связаны с площадкой.' },
      { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Нарушение имеет текущий статус обработки.' },
      { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для предписания указана ответственная роль.' },
    ],
    audienceTitle: 'Кому подходит контур охраны труда',
    audienceDescription: 'Для команд, которым нужно видеть безопасность как часть операционного контроля стройки.',
    audiences: [
      'Специалистам по охране труда, которые ведут инструктажи, допуски и инциденты.',
      'Генподрядчикам, которые отвечают за подрядчиков и безопасность на нескольких объектах.',
      'Руководителям проектов, которым нужна видимость рисков безопасности рядом со сроками и качеством.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контур закрывает разрыв между журналами охраны труда и реальным управлением объектом.',
    problems: [
      'Связывает инструктажи и допуски с участниками и объектом.',
      'Фиксирует нарушения, инциденты, предписания и контроль устранения.',
      'Показывает риски безопасности руководителю без ручной пересборки.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на статусах, ответственных и контроле устранения.',
    automations: [
      'Учет инструктажей, допусков, нарушений и инцидентов.',
      'Маршрут предписания от фиксации до устранения.',
      'Отчетность по открытым событиям безопасности.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Каждая роль получает свой срез безопасности без перегруза лишними данными.',
    roleViews: [
      { role: 'Специалист ОТ', description: 'Инструктажи, допуски, нарушения, инциденты и предписания.' },
      { role: 'Прораб', description: 'События на объекте, фотофиксация, сроки устранения и ответственные.' },
      { role: 'Руководитель проекта', description: 'Открытые риски безопасности и статус устранения по объектам.' },
    ],
    relatedLinks: [
      { ...contactLink },
      { label: 'Мобильное приложение', href: marketingPaths.mobileApp, description: 'Фиксация событий с площадки.' },
      { label: 'Контроль качества', href: marketingPaths.constructionQualityControl, description: 'Смежный контур дефектов и проверок.' },
    ],
    blogLinks: [
      { label: 'Что специалист ОТ должен видеть по объектам каждый день', href: marketingPaths.blog, description: 'Разбор ежедневных сигналов безопасности.' },
      { label: 'Как прорабу вести объект без хаоса', href: marketingPaths.blog, description: 'Как площадка фиксирует факт без потерь.' },
    ],
    contactHighlights: [
      'Покажем фиксацию нарушений и инцидентов.',
      'Разберем роли специалиста ОТ, прораба и руководителя.',
      'Обсудим отчеты и контроль устранения.',
    ],
    faq: [
      { question: 'Можно ли вести инструктажи?', answer: 'Да, контур рассчитан на инструктажи, допуски и связь с участниками работ.' },
      { question: 'Инциденты видны руководителю?', answer: 'Да, открытые инциденты и нарушения можно выводить в управленческий обзор.' },
      { question: 'Можно ли фиксировать фото?', answer: 'Да, события безопасности можно связывать с файлами и материалами проверки.' },
    ],
  }),
  'construction-quality-control': createOperationalSeoPage({
    path: marketingPaths.constructionQualityControl,
    eyebrow: 'Стройконтроль',
    title: 'Контроль качества строительства с дефектами, инспекциями и повторной проверкой',
    description:
      'МОСТ помогает вести инспекции, дефекты, ответственных, сроки устранения, фотофиксацию, повторную проверку и связь с приемкой.',
    supportingQueries: [
      'контроль качества строительства',
      'строительный контроль дефекты',
      'инспекции качества на объекте',
      'учет замечаний на стройке',
    ],
    processComparisonTitle: 'Порядок работы с дефектами до сдачи этапа',
    processComparisonDescription: 'Контур качества показывает путь от обнаружения дефекта до повторной проверки и готовности к приемке.',
    signals: [
      'Замечания фиксируются в чатах и фотоальбомах.',
      'Ответственный и срок устранения не всегда понятны.',
      'Повторная проверка зависит от ручного напоминания.',
    ],
    beforeState: [
      'Стройконтроль собирает дефекты в таблицах и переписках.',
      'ПТО не всегда видит связь замечаний с документами и зонами.',
      'Руководитель узнает о проблеме при сдаче этапа.',
    ],
    afterState: [
      'Дефект имеет объект, зону, ответственного, срок и статус.',
      'Фото, комментарии и повторная проверка связаны с карточкой.',
      'Приемка опирается на понятную готовность качества.',
    ],
    metrics: [
      { label: 'Рабочий контекст', value: 'Единая карточка', detail: 'Дефект, зона и материалы проверки собраны в карточке.' },
      { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Дефект имеет статус устранения и проверки.' },
      { label: 'Следующее действие', value: 'Назначенный ответственный', detail: 'Для устранения указана ответственная роль.' },
    ],
    audienceTitle: 'Кому подходит контроль качества',
    audienceDescription: 'Для стройконтроля, генподрядчика и ПТО, которым важно видеть качество закрытия этапа.',
    audiences: [
      'Стройконтролю, который фиксирует дефекты и повторные проверки.',
      'Генподрядчику, который отвечает за качество работы подрядчиков.',
      'ПТО и руководителю проекта, которым нужна связь качества, ИД и приемки.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контур устраняет разрыв между замечанием на площадке и управленческим решением.',
    problems: [
      'Собирает дефекты, инспекции и фотофиксацию в одном реестре.',
      'Назначает ответственных и сроки устранения.',
      'Связывает качество с приемкой зон и исполнительной документацией.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на жизненном цикле дефекта и повторной проверке.',
    automations: [
      'Создание дефекта с зоной, фото, ответственным и сроком.',
      'Статусы устранения, проверки и отклонения.',
      'Отчеты по критичным и просроченным замечаниям.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Качество становится видимым процессом для площадки, ПТО и руководителя.',
    roleViews: [
      { role: 'Стройконтроль', description: 'Дефекты, инспекции, повторные проверки и критичность.' },
      { role: 'Прораб', description: 'Назначенные замечания, сроки устранения и комментарии.' },
      { role: 'Руководитель проекта', description: 'Критичные дефекты, просрочки и готовность к приемке.' },
    ],
    relatedLinks: [
      { ...contactLink },
      { label: 'Приемка зон', href: marketingPaths.handoverAcceptance, description: 'Передача результата после устранения замечаний.' },
      { label: 'Исполнительная документация', href: marketingPaths.constructionDocuments, description: 'Документы, связанные с качеством и сдачей.' },
    ],
    blogLinks: [
      { label: 'Как дефекты доходят до повторной проверки и приемки', href: marketingPaths.blog, description: 'Путь замечания от фиксации до сдачи.' },
      { label: 'Как подготовить объект к передаче заказчику', href: marketingPaths.blog, description: 'Связь качества, punch-list и приемки.' },
    ],
    contactHighlights: [
      'Покажем путь дефекта от фиксации до проверки.',
      'Разберем роли стройконтроля, прораба и ПТО.',
      'Обсудим связь качества с приемкой и ИД.',
    ],
    faq: [
      { question: 'Можно ли назначать ответственных?', answer: 'Да, дефект получает ответственного, срок устранения и статус.' },
      { question: 'Есть повторная проверка?', answer: 'Да, контур поддерживает устранение, повторную проверку и отклонение.' },
      { question: 'Качество связано с приемкой?', answer: 'Да, замечания и дефекты можно связывать с зонами, punch-list и готовностью передачи результата.' },
    ],
  }),
  'handover-acceptance': createOperationalSeoPage({
    path: marketingPaths.handoverAcceptance,
    eyebrow: 'Сдача результата',
    title: 'Приемка зон и punch-list для передачи результата заказчику',
    description:
      'МОСТ помогает вести приемку зон, punch-list, замечания заказчика, готовность передачи, статусы устранения и комплект сдачи объекта.',
    supportingQueries: [
      'приемка зон строительство',
      'punch list стройка',
      'сдача объекта заказчику',
      'контроль замечаний при приемке',
    ],
    processComparisonTitle: 'Порядок работы при сдаче результата',
    processComparisonDescription: 'Приемка связывает зоны, замечания, готовность качества и комплект документов.',
    signals: [
      'Замечания заказчика собираются в письмах, таблицах и чатах.',
      'Готовность зон сложно связать с дефектами и исполнительной документацией.',
      'Руководитель видит риски сдачи слишком поздно.',
    ],
    beforeState: [
      'ПТО вручную сверяет зоны, замечания, фото и документы.',
      'Прораб не всегда понимает, что именно блокирует передачу результата.',
      'Заказчик получает неполную картину по готовности и срокам устранения.',
    ],
    afterState: [
      'Зона имеет статус, punch-list, ответственных и сроки устранения.',
      'Качество, ИД и замечания заказчика связаны с передачей результата.',
      'Команда видит готовность сдачи до финальной приемки.',
    ],
    metrics: [
      { label: 'Рабочий контекст', value: 'Единая запись', detail: 'Замечания заказчика связаны с зоной и объектом.' },
      { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Зона имеет текущий статус передачи.' },
      { label: 'Основание решения', value: 'История решений', detail: 'Решения по замечаниям сохраняются в истории.' },
    ],
    audienceTitle: 'Кому подходит приемка и punch-list',
    audienceDescription: 'Для команд, которые передают результат заказчику и хотят видеть готовность сдачи до финального этапа.',
    audiences: [
      'ПТО и стройконтролю, которые закрывают замечания и готовят комплект передачи.',
      'Генподрядчикам, которые отвечают за сдачу зон и работу подрядчиков.',
      'Девелоперам и заказчикам, которым нужна прозрачная история приемки.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контур связывает качество, замечания заказчика и комплект сдачи.',
    problems: [
      'Ведет зоны, punch-list, статусы устранения и повторные проверки.',
      'Показывает готовность передачи результата по объекту.',
      'Связывает замечания с ИД, качеством и решениями заказчика.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на управляемой передаче результата и контроле замечаний.',
    automations: [
      'Создание punch-list по зонам, объектам и участникам приемки.',
      'Маршрут устранения замечаний и повторной проверки.',
      'Подготовку прозрачной картины готовности к сдаче.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Приемка становится рабочим маршрутом для ПТО, площадки и заказчика.',
    roleViews: [
      { role: 'ПТО', description: 'Зоны, punch-list, статусы, ИД и готовность передачи.' },
      { role: 'Прораб', description: 'Назначенные замечания, сроки устранения и блокирующие зоны.' },
      { role: 'Заказчик', description: 'Статус приемки, открытые замечания и историю решений.' },
    ],
    relatedLinks: [
      { ...contactLink },
      { label: 'Контроль качества', href: marketingPaths.constructionQualityControl, description: 'Дефекты и повторные проверки до приемки.' },
      { label: 'RFI и изменения', href: marketingPaths.changeControl, description: 'Решения заказчика и изменения, влияющие на сдачу.' },
    ],
    blogLinks: [
      { label: 'Как подготовить объект к передаче заказчику', href: marketingPaths.blog, description: 'Что проверить по зонам, punch-list и комплекту сдачи.' },
      { label: 'Как вести исполнительную документацию без потерь', href: marketingPaths.blog, description: 'Документная база для передачи результата.' },
    ],
    contactHighlights: [
      'Покажем приемку зон и punch-list.',
      'Разберем связь замечаний, качества и ИД.',
      'Обсудим сценарий видимости для заказчика.',
    ],
    faq: [
      { question: 'Можно ли вести punch-list?', answer: 'Да, punch-list можно вести по зонам, объектам, ответственным и статусам устранения.' },
      { question: 'Приемка связана с дефектами?', answer: 'Да, дефекты и замечания качества можно доводить до повторной проверки и передачи результата.' },
      { question: 'Можно ли показать статус заказчику?', answer: 'Да, customer-сценарий обсуждается как часть контура сдачи и согласований.' },
    ],
  }),
  'machinery-and-labor': createOperationalSeoPage({
    path: marketingPaths.machineryAndLabor,
    eyebrow: 'Ресурсы',
    title: 'Учет техники, механизмов, нарядов и выработки на объекте',
    description:
      'МОСТ помогает вести технику, механизмы, смены, простои, ГСМ, наряды, бригады, фактическую выработку и подготовку начислений.',
    supportingQueries: [
      'учет техники на стройке',
      'учет механизмов',
      'наряды в строительстве',
      'выработка бригад',
    ],
    processComparisonTitle: 'Порядок учета ресурсов и себестоимости',
    processComparisonDescription: 'Техника, смены, простои и наряды становятся частью ежедневного производственного факта.',
    signals: [
      'Сменные рапорты и простои техники собираются после факта.',
      'ГСМ, техника и наряды не связаны с реальными объемами работ.',
      'Начисления готовятся на базе ручных таблиц и уточнений.',
    ],
    beforeState: [
      'Прораб и механик ведут ресурсный факт в отдельных файлах.',
      'Финансовый блок получает данные после ручной сверки.',
      'Руководитель не видит, где техника простаивает и где падает выработка.',
    ],
    afterState: [
      'Техника, смена, простой, ГСМ и наряд связаны с объектом.',
      'Фактическая выработка видна рядом с объемами и сроками.',
      'Начисления готовятся на проверяемой производственной базе.',
    ],
    metrics: [
      { label: 'Рабочий контекст', value: 'Связь с объектом', detail: 'Техника, смена и наряд связаны с объектом.' },
      { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Наряд имеет текущий статус обработки.' },
      { label: 'Основание решения', value: 'Единая запись', detail: 'Факт смены сохраняется в рабочей записи.' },
    ],
    audienceTitle: 'Кому подходит учет техники и выработки',
    audienceDescription: 'Для проектов, где техника, бригады и фактическая выработка влияют на сроки и себестоимость.',
    audiences: [
      'Руководителям проектов, которым нужно видеть ресурсные отклонения.',
      'Прорабам и механикам, которые фиксируют технику, смены и простои.',
      'Финансовому блоку, который сверяет выработку и начисления.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контур связывает ресурсный факт с объектом, объемами и закрытием периода.',
    problems: [
      'Ведет технику, назначения, сменные рапорты, простои и ГСМ.',
      'Фиксирует наряды, выработку и отклонения по бригадам.',
      'Готовит основу для начислений без ручной пересборки.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на ежедневном факте ресурсов и производственной проверке.',
    automations: [
      'Заявки и назначения техники на объект.',
      'Сменные рапорты, простои, ГСМ и статусы техники.',
      'Наряды, фактическую выработку и подготовку начислений.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Ресурсы становятся видимой частью исполнения, а не отдельным набором отчетов.',
    roleViews: [
      { role: 'Прораб', description: 'Наряды, выработка, смены и фактические объемы.' },
      { role: 'Механик', description: 'Техника, назначения, простои, сменные рапорты и ГСМ.' },
      { role: 'Руководитель проекта', description: 'Недовыработка, простои и ресурсные отклонения по объектам.' },
    ],
    relatedLinks: [
      { ...contactLink },
      { label: 'Контроль бюджета', href: marketingPaths.constructionBudgetControl, description: 'Финансовая связь ресурса и объекта.' },
      { label: 'Мобильное приложение', href: marketingPaths.mobileApp, description: 'Фиксация факта с площадки.' },
    ],
    blogLinks: [
      { label: 'Как учитывать технику, смены и выработку без ручного свода', href: marketingPaths.blog, description: 'Практика ресурсного учета по объектам.' },
      { label: 'Как контролировать график производства работ', href: marketingPaths.blog, description: 'Связь ресурса, факта и графика.' },
    ],
    contactHighlights: [
      'Покажем сменный рапорт и простой техники.',
      'Разберем наряды и фактическую выработку.',
      'Обсудим подготовку начислений по вашему процессу.',
    ],
    faq: [
      { question: 'Можно ли учитывать простои?', answer: 'Да, простой остается открытым до закрытия с фактическим временем и причиной.' },
      { question: 'Выработка связана с нарядами?', answer: 'Да, контур рассчитан на наряды, объемы, факт выработки и проверку.' },
      { question: 'Можно ли связать технику со сметами?', answer: 'Да, техника и механизмы могут связываться со сметными механизмами и выполненными работами.' },
    ],
  }),
  'change-control': createOperationalSeoPage({
    path: marketingPaths.changeControl,
    eyebrow: 'Изменения и претензии',
    title: 'RFI, изменения, дополнительные работы и претензии в строительстве',
    description:
      'МОСТ связывает запросы информации, change orders, влияние на сроки и бюджет, претензии, документы и решения заказчика.',
    supportingQueries: [
      'RFI в строительстве',
      'изменения объемов строительства',
      'change order строительство',
      'претензии подрядчика',
    ],
    processComparisonTitle: 'Порядок работы с изменениями',
    processComparisonDescription: 'Контур изменений показывает путь от вопроса или претензии до решения заказчика и влияния на проект.',
    signals: [
      'RFI и ответы уходят в письма и чаты.',
      'Дополнительные работы утверждаются без прозрачного влияния на бюджет.',
      'Претензии собирают доказательства вручную перед спором.',
    ],
    beforeState: [
      'Изменения фиксируются после факта и без единого статуса.',
      'ПТО, финансы и руководитель смотрят разные версии влияния.',
      'Решение заказчика сложно найти в истории переписки.',
    ],
    afterState: [
      'RFI, изменение или претензия имеют статус, основание и ответственного.',
      'Влияние на сроки и бюджет видно до утверждения.',
      'Решение заказчика сохраняется в customer-сценарии и истории проекта.',
    ],
    metrics: [
      { label: 'Рабочий контекст', value: 'Единая карточка', detail: 'Запрос и изменение собраны в одной карточке.' },
      { label: 'Контроль этапа', value: 'Видимый статус', detail: 'Запрос имеет текущий статус ответа.' },
      { label: 'Основание решения', value: 'История решений', detail: 'Основания и решения сохраняются в истории.' },
    ],
    audienceTitle: 'Кому подходит контур изменений',
    audienceDescription: 'Для проектов, где изменения, дополнительные работы и решения заказчика влияют на сроки и деньги.',
    audiences: [
      'Генподрядчикам, которым нужно контролировать RFI и изменения объемов.',
      'Девелоперам и заказчикам, которым важна прозрачная история решений.',
      'ПТО и финансовому блоку, которые оценивают влияние на документы, сроки и бюджет.',
    ],
    problemTitle: 'Какие задачи решает',
    problemDescription: 'Контур связывает коммерческие изменения с проектным фактом, документами и заказчиком.',
    problems: [
      'Ведет RFI, ответы, change orders, дополнительные работы и претензии.',
      'Показывает влияние изменения на сроки, бюджет и документы.',
      'Сохраняет решение заказчика и историю согласования.',
    ],
    automationTitle: 'Что автоматизирует',
    automationDescription: 'Фокус на маршруте решения, влиянии и доказательной базе.',
    automations: [
      'Создание RFI, ответа, изменения или претензии.',
      'Оценку влияния на сроки, смету и финансовую модель.',
      'Согласование с заказчиком и сохранение решения.',
    ],
    visibilityTitle: 'Что видит команда',
    visibilityDescription: 'Изменение становится общим объектом работы для ПТО, руководителя, финансов и заказчика.',
    roleViews: [
      { role: 'ПТО', description: 'RFI, документы, основания, замечания и влияние на комплект.' },
      { role: 'Финансовый блок', description: 'Сумму, бюджетное влияние и связь с платежами.' },
      { role: 'Заказчик', description: 'Запросы на согласовании, влияние по дням и сумму решения.' },
    ],
    relatedLinks: [
      { ...contactLink },
      { label: 'Контроль бюджета', href: marketingPaths.constructionBudgetControl, description: 'Финансовое влияние изменений.' },
      { label: 'ПИР и проектная документация', href: marketingPaths.pirProjectDocumentation, description: 'Проектная база и замечания.' },
      { label: 'Project Pulse', href: marketingPaths.projectPulse, description: 'Управленческие сигналы по изменениям, бюджету и срокам объекта.' },
    ],
    blogLinks: [
      { label: 'Почему RFI и изменения нельзя вести только в переписке', href: marketingPaths.blog, description: 'Основания, влияние и решение заказчика.' },
      { label: 'Как сократить перерасход на стройке', href: marketingPaths.blog, description: 'Как изменения влияют на деньги и сроки.' },
    ],
    contactHighlights: [
      'Покажем RFI и изменение с влиянием на сроки.',
      'Разберем связь изменения со сметой и платежами.',
      'Обсудим customer-согласование и историю решений.',
    ],
    faq: [
      { question: 'RFI и изменение — это разные сценарии?', answer: 'Да. RFI фиксирует запрос информации и ответ, а изменение может учитывать влияние на сроки, бюджет и документы.' },
      { question: 'Можно ли фиксировать претензии?', answer: 'Да, контур поддерживает претензии, основания, доказательства и решения.' },
      { question: 'Заказчик может согласовывать изменения?', answer: 'Да, если изменение требует решения заказчика, его можно вывести в customer-контур.' },
    ],
    workflow: {
      title: 'Как изменение проходит от RFI до закрытия',
      description: 'Контур связывает инженерное основание, решение заказчика и последствия для сроков, денег и документов.',
      stages: [
        { label: 'RFI', description: 'Команда фиксирует запрос, основание и срок ответа по объекту.' },
        { label: 'Решение и изменение', description: 'Ответ заказчика превращается в согласованное изменение или основание для претензии.' },
        { label: 'Влияние на проект', description: 'ПТО оценивает влияние на смету, график и бюджет.' },
        { label: 'Согласование и оплата', description: 'Решение связывается с платежом и необходимым комплектом документов.' },
        { label: 'Претензия или закрытие', description: 'История решения и доказательства остаются доступными для дальнейшего действия.' },
      ],
    },
  }),
  ...marketingProductSeoLandingPages,
};
