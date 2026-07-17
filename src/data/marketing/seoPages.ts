import { marketingPaths } from './common';
import { getMarketingBlogLink } from './blogArticles';
import type { MarketingBlogArticleKey } from './blogArticles';
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

const allBlogArticlesLink: MarketingContentLink = {
  label: 'Все статьи',
  href: marketingPaths.blog,
  description: 'Практические материалы команды МОСТ.',
};

const getMarketingBlogLinks = (
  ...keys: MarketingBlogArticleKey[]
): MarketingContentLink[] => keys.map((key) => getMarketingBlogLink(key));

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
    label: 'CRM для строительной компании',
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
    "foreman-software": {
      path: marketingPaths.foremanSoftware,
      eyebrow: "Работа прораба",
      title: "Программа для прораба: смены, задачи и журнал работ",
      description:
        "МОСТ связывает смену, задачу, фото, запись в журнале работ и отклонение по объекту. Данные зависят от дисциплины фиксации на площадке.",
      supportingQueries: [
        "программа для прораба",
        "журнал работ на объекте",
        "фотофиксация строительства",
        "контроль смены прораба",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От сменного задания к записи о выполнении",
        description:
          "Прораб фиксирует задачу и результат там же, где руководитель проверяет отклонения.",
        signals: [
          "Задание на смену передают устно.",
          "Фото не связано с конкретной работой.",
          "Отклонение попадает в журнал после планёрки.",
        ],
        beforeState: [
          "Прораб уточняет приоритеты в переписке.",
          "Факт смены собирают из сообщений и фотографий.",
          "Причина отклонения остаётся без ответственного.",
        ],
        afterState: [
          "Задача содержит участок, срок и исполнителя.",
          "Фото и запись журнала прикреплены к выполненной работе.",
          "Отклонение получает статус и следующее действие.",
        ],
        metrics: [
          {
            label: "Смена",
            value: "Карточка смены",
            detail: "Прораб видит назначенные работы по участкам.",
          },
          {
            label: "Факт",
            value: "Запись с фото",
            detail: "Подтверждение хранится у задачи.",
          },
          {
            label: "Отклонение",
            value: "Статус отклонения",
            detail: "Причина и ответственный доступны руководителю.",
          },
        ],
      }),
      audienceTitle: "Кому нужна программа",
      audienceDescription:
        "Прорабам и руководителям участков, которые управляют ежедневными работами на площадке.",
      audiences: [
        "Прорабу, который распределяет задания на смену.",
        "Начальнику участка, который проверяет факт и отклонения.",
        "ПТО, которому нужны записи журнала и фото по работам.",
      ],
      problemTitle: "Где теряется фактическая картина",
      problemDescription:
        "Устные поручения, отдельные фотографии и поздние записи не дают проверить ход смены.",
      problems: [
        "Задача не содержит участка и ожидаемого результата.",
        "Фото приходит без даты, работы или исполнителя.",
        "Отклонение от графика не связано с причиной и действием.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Система хранит задание, подтверждение и решение по отклонению в карточке объекта.",
      automations: [
        "Назначение задач по смене и участку.",
        "Фотофиксацию результата с комментарием.",
        "Записи журнала работ и статусы отклонений.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "Каждая роль получает данные, необходимые для своей проверки.",
      roleViews: [
        {
          role: "Прораб",
          description: "Задачи смены, сроки, участки и открытые замечания.",
        },
        {
          role: "Начальник участка",
          description: "Выполненные работы, фото и причины отклонений.",
        },
        {
          role: "ПТО",
          description: "Записи журнала и подтверждения по выбранному этапу.",
        },
      ],
      workflow: {
        title: "Как проходит смена",
        description: "Работа движется от задания до проверенного факта.",
        stages: [
          {
            label: "План смены",
            description: "Прораб получает перечень работ по участкам.",
          },
          {
            label: "Назначение",
            description: "У задачи появляются исполнитель и срок.",
          },
          {
            label: "Фиксация",
            description: "Команда добавляет фото и запись о выполнении.",
          },
          {
            label: "Проверка",
            description: "Руководитель принимает факт или отмечает отклонение.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить работу прораба",
          href: marketingPaths.contact,
          description:
            "Свяжите задачи смены с вашим порядком контроля площадки.",
        },
        {
          label: "Мобильное приложение",
          href: marketingPaths.mobileApp,
          description: "Фиксируйте задачи и фото непосредственно на объекте.",
        },
        {
          label: "Система для ПТО",
          href: marketingPaths.ptoSoftware,
          description:
            "Передавайте подтверждённый факт в работу инженерной команды.",
        },
      ],
      blogLinks: getMarketingBlogLinks("foremanOrder", "managerMorning"),
      contactHighlights: [
        "Покажем карточку сменного задания и фотофакт.",
        "Покажем журнал работ и обработку отклонения.",
        "Сопоставим роли прораба и начальника участка с вашим регламентом.",
      ],
      faq: [
        {
          question: "Можно ли вести журнал работ с телефона?",
          answer:
            "Да. Запись и фотографии можно добавить на площадке и связать с задачей объекта.",
        },
        {
          question: "Данные о смене появляются сами?",
          answer:
            "Нет. Их полнота зависит от того, насколько регулярно прораб и исполнители фиксируют задания и результат.",
        },
        {
          question: "Что происходит при отклонении?",
          answer:
            "Ответственный отмечает причину, новый статус и действие, которое должен проверить руководитель.",
        },
      ],
    },
    "construction-crm": {
      path: marketingPaths.constructionCrm,
      eyebrow: "Клиенты и договоры",
      title: "CRM для строительной компании: от клиента к объекту",
      description:
        "CRM МОСТ связывает клиента, договор, объект, этап и обязательство команды. Она поддерживает коммерческую работу, но не заменяет отраслевую бухгалтерию.",
      supportingQueries: [
        "crm для строительной компании",
        "учёт договоров в строительстве",
        "карточка клиента и объекта",
        "этапы строительного договора",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От обращения клиента к договорному обязательству",
        description:
          "Команда видит, какой объект обсуждается, на каком этапе договор и кто выполняет следующий шаг.",
        signals: [
          "История клиента остаётся в личной почте менеджера.",
          "Версии условий договора расходятся.",
          "После подписания обязательства не передаются проектной команде.",
        ],
        beforeState: [
          "Менеджер ведёт клиента отдельно от объекта.",
          "Юристы и производство используют разные статусы этапа.",
          "Руководитель уточняет обязательства на совещании.",
        ],
        afterState: [
          "Карточка клиента связана с объектом и договором.",
          "Этап содержит владельца и ожидаемый документ.",
          "Принятое обязательство доступно ответственному подразделению.",
        ],
        metrics: [
          {
            label: "Клиент",
            value: "Карточка клиента",
            detail: "Контакты и договорённости собраны в карточке.",
          },
          {
            label: "Договор",
            value: "Статус этапа",
            detail: "У согласования есть текущий статус.",
          },
          {
            label: "Обязательство",
            value: "Ответственная роль",
            detail: "Исполнение передано конкретной роли.",
          },
        ],
      }),
      audienceTitle: "Кому нужна строительная CRM",
      audienceDescription:
        "Коммерческим и проектным командам, которым важно не потерять договорённости после продажи.",
      audiences: [
        "Менеджеру по работе с клиентами и договорами.",
        "Руководителю проекта, принимающему объект в работу.",
        "Директору, который проверяет портфель договоров и обязательств.",
      ],
      problemTitle: "Где расходятся договорённости",
      problemDescription:
        "Обычная воронка заканчивается сделкой, а строительной компании нужно передать условия в исполнение.",
      problems: [
        "Карточка клиента не связана с будущим объектом.",
        "Статус договора приходится уточнять у нескольких отделов.",
        "Обязательство перед заказчиком не имеет владельца после подписания.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "CRM хранит деловую историю до передачи объекта в производство.",
      automations: [
        "Контакты и договорённости по клиенту.",
        "Этапы подготовки и согласования договора.",
        "Передачу обязательств ответственным по объекту.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "Коммерческие условия и операционные задачи разделены правами, но связаны объектом.",
      roleViews: [
        {
          role: "Менеджер",
          description: "Контакты клиента, договорённости и следующий этап.",
        },
        {
          role: "Юрист",
          description: "Версию договора, замечания и статус согласования.",
        },
        {
          role: "Руководитель проекта",
          description:
            "Подтверждённые обязательства, которые влияют на объект.",
        },
      ],
      workflow: {
        title: "Как клиент становится действующим объектом",
        description:
          "Договорённости проходят проверяемую передачу между коммерческой и проектной командой.",
        stages: [
          {
            label: "Клиент",
            description: "Менеджер фиксирует контакт и предмет обращения.",
          },
          {
            label: "Объект",
            description: "Потребность связывают с площадкой или проектом.",
          },
          {
            label: "Договор",
            description: "Условия проходят подготовку и согласование.",
          },
          {
            label: "Передача обязательств",
            description:
              "Проектная команда принимает согласованные условия в работу.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить CRM",
          href: marketingPaths.contact,
          description:
            "Сопоставьте карточки клиента и договора с вашим процессом.",
        },
        {
          label: "ERP для строительства",
          href: marketingPaths.constructionErp,
          description:
            "Продолжите работу с ресурсами и бюджетом действующего объекта.",
        },
        {
          label: "Контроль подрядчиков",
          href: marketingPaths.contractorControl,
          description: "Ведите исполнение договоров с внешними организациями.",
        },
      ],
      blogLinks: getMarketingBlogLinks("managerMorning", "contractorControl"),
      contactHighlights: [
        "Покажем связь клиента, договора и объекта.",
        "Покажем передачу обязательства проектной команде.",
        "Уточним границу между CRM и бухгалтерской системой.",
      ],
      faq: [
        {
          question: "Чем строительная CRM отличается от CRM продаж?",
          answer:
            "Она связывает клиента и договор с объектом, этапом передачи и обязательствами перед заказчиком.",
        },
        {
          question: "МОСТ заменяет бухгалтерскую систему?",
          answer:
            "Нет. Регламентированный и отраслевой бухгалтерский учёт остаётся в профильной системе.",
        },
        {
          question: "Можно ли ограничить доступ к условиям договора?",
          answer:
            "Да. Права определяют, кто видит коммерческие сведения, а проектная команда получает нужные ей обязательства.",
        },
      ],
    },
    "construction-erp": {
      path: marketingPaths.constructionErp,
      eyebrow: "Управленческий учёт",
      title: "ERP для строительства: ресурсы и бюджет объектов",
      description:
        "ERP МОСТ связывает ресурсы, бюджет и объект для управленческого учёта. Глубина ERP-процесса зависит от настроенных справочников и интеграций.",
      supportingQueries: [
        "erp для строительства",
        "управленческий учёт стройки",
        "ресурсы строительных объектов",
        "бюджет объектов в erp",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От локальных операций к управленческому учёту",
        description:
          "Операции подразделений получают общие справочники и сохраняют связь с объектом.",
        signals: [
          "Подразделения называют один ресурс по-разному.",
          "Бюджет не сопоставлен с заявками и договорами.",
          "Сводка по объектам требует ручной сверки источников.",
        ],
        beforeState: [
          "Справочники ведутся в нескольких файлах.",
          "Операционный факт не совпадает с периодом финансового учёта.",
          "Руководитель получает несопоставимые отчёты.",
        ],
        afterState: [
          "Ресурс определяется согласованным справочником.",
          "Бюджетная запись связана с объектом и основанием.",
          "Управленческий отчёт использует проверенные статусы операций.",
        ],
        metrics: [
          {
            label: "Ресурсы",
            value: "Записи справочника",
            detail: "Материалы и контрагенты сопоставлены.",
          },
          {
            label: "Бюджет",
            value: "Связь с основанием",
            detail: "План и факт связаны с документами.",
          },
          {
            label: "Учёт",
            value: "Отчёт по объектам",
            detail: "Показатели доступны в единой структуре.",
          },
        ],
      }),
      audienceTitle: "Кому нужен ERP-подход",
      audienceDescription:
        "Компаниям с несколькими объектами, общими ресурсами и регулярной управленческой отчётностью.",
      audiences: [
        "Операционному директору, который согласует процессы подразделений.",
        "Финансовому руководителю, который ведёт бюджет объектов.",
        "ИТ-команде, отвечающей за справочники и интеграции.",
      ],
      problemTitle: "Что мешает получить сопоставимые данные",
      problemDescription:
        "ERP начинается не с панели, а с единых правил учёта ресурсов и операций.",
      problems: [
        "Номенклатура и контрагенты расходятся между источниками.",
        "Заявки, договоры и платежи по-разному привязаны к бюджету.",
        "Портфель объектов нельзя сравнить по одной методике.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Система поддерживает управленческие операции в границах настроенной модели данных.",
      automations: [
        "Справочники ресурсов и привязку к объектам.",
        "Бюджетные основания и фактические операции.",
        "Статусы обмена с корпоративными системами.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "Роли работают с разными срезами одной учётной структуры.",
      roleViews: [
        {
          role: "Операционный директор",
          description: "Ресурсы, этапы и отклонения по портфелю объектов.",
        },
        {
          role: "Финансы",
          description: "Бюджет, обязательства и фактические операции.",
        },
        {
          role: "ИТ и аналитика",
          description: "Справочники, источники и состояние интеграций.",
        },
      ],
      workflow: {
        title: "Как формируется управленческий учёт",
        description:
          "Согласованные данные проходят от справочника до отчёта по объекту.",
        stages: [
          {
            label: "Справочники",
            description:
              "Команда согласует ресурсы, организации и контрагентов.",
          },
          {
            label: "Операция",
            description:
              "Заявка или документ получает объект и учётное основание.",
          },
          {
            label: "Проверка",
            description:
              "Ответственный подтверждает статус и корректность связи.",
          },
          {
            label: "Отчёт",
            description:
              "Руководитель анализирует бюджет и ресурсы по объектам.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить ERP",
          href: marketingPaths.contact,
          description:
            "Оцените готовность справочников и процессов вашей компании.",
        },
        {
          label: "Интеграции",
          href: marketingPaths.integrations,
          description: "Опишите источники данных и правила обмена.",
        },
        {
          label: "Контроль бюджета",
          href: marketingPaths.constructionBudgetControl,
          description: "Проверьте обязательства и факт по объекту.",
        },
      ],
      blogLinks: getMarketingBlogLinks("managerMorning", "procurementChats"),
      contactHighlights: [
        "Покажем структуру ресурсов и объектов.",
        "Покажем путь операции в управленческий отчёт.",
        "Обсудим готовность справочников и интеграций.",
      ],
      faq: [
        {
          question: "Можно ли запустить ERP сразу для всей компании?",
          answer:
            "Состав запуска зависит от качества справочников, правил учёта и готовых интеграций. Обычно процессы подключают по согласованной очередности.",
        },
        {
          question: "МОСТ заменяет все корпоративные системы?",
          answer:
            "Нет. Границы определяются архитектурой компании, а обмен с учётными системами настраивается отдельно.",
        },
        {
          question: "Что нужно подготовить до запуска?",
          answer:
            "Перечень объектов, организаций, ресурсов, владельцев справочников и правила отражения операций.",
        },
      ],
    },
    "material-accounting": {
      path: marketingPaths.materialAccounting,
      eyebrow: "Движение материалов",
      title: "Учёт материалов: приход, перемещение и списание",
      description:
        "МОСТ ведёт заявку, приход, перемещение, списание и остаток материалов по объекту. Фактический остаток требует своевременного ввода операций.",
      supportingQueries: [
        "учёт материалов в строительстве",
        "приход материалов на объект",
        "перемещение между складами",
        "списание строительных материалов",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От потребности до остатка",
        description:
          "Каждая складская операция меняет количество материала в выбранном месте хранения.",
        signals: [
          "Поставка принята без записи о приходе.",
          "Материал перевезли на другой объект только по звонку.",
          "Списание вносят после инвентаризации.",
        ],
        beforeState: [
          "Заявка не сопоставлена с поступлением.",
          "Перемещения известны только участникам перевозки.",
          "Табличный остаток не объясняет фактическую разницу.",
        ],
        afterState: [
          "Приход связан с заявкой и местом хранения.",
          "Перемещение содержит отправителя и получателя.",
          "Списание указывает основание и ответственного.",
        ],
        metrics: [
          {
            label: "Поступление",
            value: "Запись прихода",
            detail: "Количество добавлено в выбранное место.",
          },
          {
            label: "Движение",
            value: "Маршрут материала",
            detail: "Материал передан между объектами или складами.",
          },
          {
            label: "Использование",
            value: "Запись списания",
            detail: "Операция уменьшает расчётный остаток.",
          },
        ],
      }),
      audienceTitle: "Кому нужен учёт материалов",
      audienceDescription:
        "Складам, снабжению и площадкам, которые отвечают за движение материальных ценностей.",
      audiences: [
        "Кладовщику, который оформляет приход и выдачу.",
        "Снабженцу, который сопоставляет заявку с поставкой.",
        "Руководителю объекта, который проверяет доступный остаток.",
      ],
      problemTitle: "Почему расчётный остаток расходится с фактом",
      problemDescription:
        "Пропущенный приход, перенос или списание искажает доступное количество.",
      problems: [
        "Материал поступил, но не оприходован на объект.",
        "Перемещение не подтверждено принимающей стороной.",
        "Списание не содержит работы или другого основания.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Карточка материала хранит последовательность операций и их основания.",
      automations: [
        "Приход по поставке и заявке.",
        "Перемещение между местами хранения.",
        "Списание на работу с расчётом остатка.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "Каждая роль видит количество и операции в пределах своих полномочий.",
      roleViews: [
        {
          role: "Кладовщик",
          description: "Ожидаемые поступления и операции по месту хранения.",
        },
        {
          role: "Снабжение",
          description: "Связь заявки, поставки и принятого количества.",
        },
        {
          role: "Руководитель объекта",
          description: "Расчётный остаток и неподтверждённые движения.",
        },
      ],
      workflow: {
        title: "Как меняется остаток",
        description: "Операции последовательно отражают движение материала.",
        stages: [
          {
            label: "Заявка",
            description: "Объект указывает материал и требуемое количество.",
          },
          {
            label: "Приход",
            description:
              "Получатель подтверждает фактически принятое количество.",
          },
          {
            label: "Перемещение",
            description: "Материал передают другому складу или объекту.",
          },
          {
            label: "Списание",
            description: "Использование фиксируют с основанием.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить учёт",
          href: marketingPaths.contact,
          description:
            "Сопоставьте операции МОСТ с вашим складским регламентом.",
        },
        {
          label: "Строительные закупки",
          href: marketingPaths.constructionProcurement,
          description: "Управляйте потребностью до приёмки материала.",
        },
        {
          label: "Мобильное приложение",
          href: marketingPaths.mobileApp,
          description: "Подтверждайте операции на площадке.",
        },
      ],
      blogLinks: getMarketingBlogLinks("procurementChats", "foremanOrder"),
      contactHighlights: [
        "Покажем оформление прихода и перемещения.",
        "Покажем историю списаний по материалу.",
        "Сверим роли склада, снабжения и площадки.",
      ],
      faq: [
        {
          question: "Остаток в системе всегда равен фактическому?",
          answer:
            "Только если приход, перемещение и списание внесены своевременно и в правильном количестве.",
        },
        {
          question: "Можно ли учитывать несколько складов и объектов?",
          answer:
            "Да. Каждая операция указывает место отправления или получения материала.",
        },
        {
          question: "Закупка и складской учёт отличаются?",
          answer:
            "Да. Закупка ведёт потребность до поставки, а складской учёт отражает приход и последующее движение.",
        },
      ],
    },
    "pto-software": {
      path: marketingPaths.ptoSoftware,
      eyebrow: "Рабочее место ПТО",
      title: "Система для ПТО: комплекты и замечания",
      description:
        "МОСТ помогает ПТО вести исполнительную документацию: комплект, статус и замечание по объекту. Документы готовят и проверяют ответственные специалисты.",
      supportingQueries: [
        "система для пто",
        "комплект исполнительной документации",
        "статус документов пто",
        "контроль замечаний пто",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От перечня документов к готовому комплекту",
        description:
          "Инженер ведёт состав комплекта, устраняет замечания и передаёт материалы на проверку.",
        signals: [
          "Неясно, каких документов не хватает для этапа.",
          "Замечание приходит без ссылки на версию.",
          "Готовность комплекта оценивают по переписке.",
        ],
        beforeState: [
          "Состав пакета хранится в личной таблице инженера.",
          "Исправления пересылают файлами с похожими названиями.",
          "Руководитель уточняет статус у каждого исполнителя.",
        ],
        afterState: [
          "Перечень показывает наличие документов.",
          "Замечание связано с проверяемым материалом.",
          "Статус отражает подготовку, проверку или возврат.",
        ],
        metrics: [
          {
            label: "Комплект",
            value: "Документы комплекта",
            detail: "ПТО видит обязательные и полученные документы.",
          },
          {
            label: "Проверка",
            value: "Записи замечаний",
            detail: "Исправления связаны с конкретным материалом.",
          },
          {
            label: "Готовность",
            value: "Статус комплекта",
            detail: "Руководитель видит этап подготовки.",
          },
        ],
      }),
      audienceTitle: "Кому нужна система ПТО",
      audienceDescription:
        "Инженерам, которые собирают и проверяют комплекты по этапам строительства.",
      audiences: [
        "Инженеру ПТО, ведущему состав исполнительной документации.",
        "Руководителю ПТО, распределяющему проверку.",
        "Подрядчику, который устраняет замечания по своему комплекту.",
      ],
      problemTitle: "Что мешает собрать комплект",
      problemDescription:
        "Файлы сами по себе не показывают полноту, результат проверки и владельца исправления.",
      problems: [
        "В перечне нет актуального статуса каждого документа.",
        "Замечание не связано с исполнителем и сроком ответа.",
        "После исправления непонятно, какая версия ушла на повторную проверку.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Система организует работу специалистов, но не создаёт и не проверяет документы вместо них.",
      automations: [
        "Состав комплекта и наличие материалов.",
        "Статусы подготовки, проверки и возврата.",
        "Замечания, ответственных и результат повторной проверки.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "ПТО и подрядчик работают с одним перечнем, сохраняя разделение ответственности.",
      roleViews: [
        {
          role: "Инженер ПТО",
          description: "Состав комплекта, замечания и очередь проверки.",
        },
        {
          role: "Руководитель ПТО",
          description: "Готовность этапов и нагрузку ответственных.",
        },
        {
          role: "Подрядчик",
          description: "Только свои материалы и замечания к исправлению.",
        },
      ],
      workflow: {
        title: "Как ПТО собирает комплект",
        description:
          "Подготовка и проверка остаются действиями назначенных специалистов.",
        stages: [
          {
            label: "Перечень",
            description: "Инженер задаёт состав документации для этапа.",
          },
          {
            label: "Подготовка",
            description: "Исполнитель прикладывает материал и меняет статус.",
          },
          {
            label: "Проверка",
            description:
              "Ответственный принимает документ или создаёт замечание.",
          },
          {
            label: "Комплект",
            description: "ПТО подтверждает состав после устранения замечаний.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить работу ПТО",
          href: marketingPaths.contact,
          description: "Сопоставьте состав комплектов и роли проверки.",
        },
        {
          label: "Строительные документы",
          href: marketingPaths.constructionDocuments,
          description: "Организуйте версии, доступ и архив после подготовки.",
        },
        {
          label: "Программа для прораба",
          href: marketingPaths.foremanSoftware,
          description: "Получайте фактические подтверждения с площадки.",
        },
      ],
      blogLinks: getMarketingBlogLinks("ptoWorkspace", "foremanOrder"),
      contactHighlights: [
        "Покажем перечень исполнительной документации.",
        "Покажем цикл замечания и повторной проверки.",
        "Сопоставим статусы комплекта с вашим регламентом ПТО.",
      ],
      faq: [
        {
          question: "МОСТ сам готовит исполнительную документацию?",
          answer:
            "Нет. Документы создают и проверяют ответственные специалисты, а система хранит состав, статус и замечания.",
        },
        {
          question: "Можно ли разделить комплекты по этапам?",
          answer:
            "Да. Перечни и статусы можно вести по объекту, этапу и ответственному исполнителю.",
        },
        {
          question: "Что видит подрядчик?",
          answer:
            "Ему можно открыть материалы и замечания только по его зоне ответственности.",
        },
      ],
    },
    "contractor-control": {
      path: marketingPaths.contractorControl,
      eyebrow: "Исполнение договора",
      title: "Контроль подрядчиков: договор, объём и срок",
      description:
        "МОСТ связывает подрядчика, договор, объём, срок и замечание по объекту. Система показывает зафиксированные данные, а не оценивает подрядчика сама.",
      supportingQueries: [
        "контроль подрядчиков",
        "исполнение договора подрядчика",
        "объёмы работ подрядчика",
        "замечания субподрядчикам",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От договорного объёма к принятой работе",
        description:
          "Руководитель сопоставляет обязательство подрядчика с фактом и замечаниями.",
        signals: [
          "Договорной объём хранится отдельно от плана работ.",
          "Выполненный объём сообщают без подтверждения.",
          "Замечания не влияют на статус приёмки этапа.",
        ],
        beforeState: [
          "Подрядчик присылает отчёт в свободной форме.",
          "Сроки уточняют на совещаниях.",
          "Акт готовят без единого перечня незакрытых замечаний.",
        ],
        afterState: [
          "Этап связан с договором и объёмом.",
          "Факт подтверждается ответственным на объекте.",
          "Замечание учитывается до принятия работы.",
        ],
        metrics: [
          {
            label: "Договор",
            value: "Запись обязательства",
            detail: "Работа и срок связаны с подрядчиком.",
          },
          {
            label: "Исполнение",
            value: "Запись объёма",
            detail: "Факт хранится с подтверждением.",
          },
          {
            label: "Приёмка",
            value: "Статус замечаний",
            detail: "Открытые вопросы видны до закрытия этапа.",
          },
        ],
      }),
      audienceTitle: "Кому нужен контроль подрядчиков",
      audienceDescription:
        "Генподрядчикам и заказчикам, которые проверяют исполнение нескольких договоров.",
      audiences: [
        "Руководителю проекта, контролирующему сроки подрядчиков.",
        "Производителю работ, подтверждающему фактический объём.",
        "Договорному отделу, который сверяет обязательства и документы.",
      ],
      problemTitle: "Почему отчёт подрядчика недостаточен",
      problemDescription:
        "Для решения нужен проверенный факт, а не итоговая оценка без оснований.",
      problems: [
        "Этап договора не сопоставлен с календарным сроком.",
        "Заявленный объём не имеет подтверждения площадки.",
        "Замечание остаётся в переписке и не влияет на приёмку.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Система хранит наблюдаемые сведения, а вывод о работе подрядчика делает ответственное лицо.",
      automations: [
        "Этапы договора и плановые сроки.",
        "Заявленные и подтверждённые объёмы.",
        "Замечания и решения по приёмке.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "У каждой роли есть данные для проверки исполнения.",
      roleViews: [
        {
          role: "Руководитель проекта",
          description: "Сроки, объёмы и открытые замечания по договорам.",
        },
        {
          role: "Площадка",
          description: "Работы, которые нужно подтвердить или вернуть.",
        },
        {
          role: "Договорной отдел",
          description: "Обязательства и основания для следующего документа.",
        },
      ],
      workflow: {
        title: "Как проверяется исполнение подрядчика",
        description:
          "Решение строится на договоре, подтверждённом объёме и результате приёмки.",
        stages: [
          {
            label: "Договор",
            description: "Команда фиксирует этап, объём и срок.",
          },
          {
            label: "Выполнение",
            description: "Подрядчик сообщает фактический результат.",
          },
          {
            label: "Проверка",
            description:
              "Ответственный подтверждает объём или создаёт замечание.",
          },
          {
            label: "Приёмка",
            description: "Руководитель принимает решение по этапу.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить контроль",
          href: marketingPaths.contact,
          description: "Сопоставьте договорные этапы с проверкой факта.",
        },
        {
          label: "Контроль бюджета",
          href: marketingPaths.constructionBudgetControl,
          description: "Свяжите обязательства подрядчика с финансовым планом.",
        },
        {
          label: "Исполнительная документация",
          href: marketingPaths.constructionDocuments,
          description: "Проверьте документы перед закрытием работ.",
        },
      ],
      blogLinks: getMarketingBlogLinks("contractorControl", "managerMorning"),
      contactHighlights: [
        "Покажем карточку договора и этапов.",
        "Покажем подтверждение объёма и замечания.",
        "Обсудим данные, на которых ваша команда оценивает исполнение.",
      ],
      faq: [
        {
          question: "Система рассчитывает рейтинг подрядчика?",
          answer:
            "Нет. МОСТ показывает зафиксированные сроки, объёмы и замечания, а решение принимает ответственная команда.",
        },
        {
          question: "Можно ли связать работу с договором?",
          answer:
            "Да. Этап содержит подрядчика, договорное обязательство, плановый срок и подтверждённый факт.",
        },
        {
          question: "Как учитываются замечания?",
          answer:
            "Замечание получает ответственного и статус, после чего проверяющий решает, можно ли принять этап.",
        },
      ],
    },
    "construction-documents": {
      path: marketingPaths.constructionDocuments,
      eyebrow: "Версии и согласование",
      title: "Строительные документы: версии, доступ и архив",
      description:
        "МОСТ организует версию, согласование, доступ и архив строительных документов. Юридическая значимость зависит от принятого регламента и электронной подписи (ЭП).",
      supportingQueries: [
        "управление строительными документами",
        "версии проектных документов",
        "согласование документов на стройке",
        "архив документации объекта",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От рабочей версии к архивной записи",
        description:
          "Документ проходит проверку, получает решение и сохраняется с историей доступа.",
        signals: [
          "Участники открывают разные версии файла.",
          "Согласование подтверждено только письмом.",
          "После завершения объекта трудно восстановить историю документа.",
        ],
        beforeState: [
          "Файл переименовывают при каждом исправлении.",
          "Право просмотра зависит от общей папки.",
          "Архив не хранит последовательность решений.",
        ],
        afterState: [
          "Актуальная версия отмечена в карточке.",
          "Согласование содержит автора, дату и статус.",
          "Архив сохраняет файл и историю действий.",
        ],
        metrics: [
          {
            label: "Документ",
            value: "Запись версии",
            detail: "Пользователь видит актуальный материал.",
          },
          {
            label: "Решение",
            value: "Статус согласования",
            detail: "Статус и автор записаны в истории.",
          },
          {
            label: "Хранение",
            value: "Архивная запись",
            detail: "Доступ определяется ролью.",
          },
        ],
      }),
      audienceTitle: "Кому нужна работа с документами",
      audienceDescription:
        "Проектным офисам и службам документооборота с несколькими участниками согласования.",
      audiences: [
        "Координатору, который отвечает за актуальные версии.",
        "Согласующему специалисту, принимающему решение.",
        "Архивариусу или администратору, управляющему доступом.",
      ],
      problemTitle: "Что происходит без истории версий",
      problemDescription:
        "Общая папка хранит файлы, но не объясняет, какой из них действующий и кем согласован.",
      problems: [
        "Исполнитель работает по устаревшей версии.",
        "Решение невозможно связать с конкретным файлом.",
        "После смены команды теряются права и основания доступа.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Карточка документа хранит версии, решения и права без заявления об их юридической силе.",
      automations: [
        "Загрузку новой версии с сохранением предыдущей.",
        "Маршрут согласования и результат проверки.",
        "Ролевой доступ и передачу завершённого документа в архив.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "Пользователь получает документ и историю в пределах выданных прав.",
      roleViews: [
        {
          role: "Координатор",
          description:
            "Версии, участников согласования и незавершённые действия.",
        },
        {
          role: "Согласующий",
          description: "Материал для проверки и историю предыдущих решений.",
        },
        {
          role: "Администратор",
          description: "Права доступа, структуру архива и журнал действий.",
        },
      ],
      workflow: {
        title: "Как документ попадает в архив",
        description: "Каждый переход оставляет версию и ответственное решение.",
        stages: [
          {
            label: "Рабочая версия",
            description: "Автор загружает файл и указывает объект.",
          },
          {
            label: "Согласование",
            description: "Назначенные роли проверяют материал.",
          },
          {
            label: "Публикация",
            description: "Координатор отмечает действующую версию.",
          },
          {
            label: "Архив",
            description: "Завершённый документ сохраняется с историей доступа.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить документы",
          href: marketingPaths.contact,
          description: "Сопоставьте версии и согласование с вашим регламентом.",
        },
        {
          label: "Система для ПТО",
          href: marketingPaths.ptoSoftware,
          description: "Организуйте подготовку комплектов до публикации.",
        },
        {
          label: "ПИР и проектная документация",
          href: marketingPaths.pirProjectDocumentation,
          description: "Управляйте выпуском проектных материалов.",
        },
      ],
      blogLinks: getMarketingBlogLinks("ptoWorkspace", "managerMorning"),
      contactHighlights: [
        "Покажем историю версий документа.",
        "Покажем согласование и ролевой доступ.",
        "Обсудим архив, регламент и применение ЭП.",
      ],
      faq: [
        {
          question: "Документ в МОСТ автоматически имеет юридическую силу?",
          answer:
            "Нет. Юридическая значимость зависит от регламента компании, полномочий участников и используемой ЭП.",
        },
        {
          question: "Можно ли восстановить предыдущую версию?",
          answer:
            "История сохраняет загруженные версии и позволяет определить, какая из них была действующей на нужном этапе.",
        },
        {
          question: "Кто получает доступ к архиву?",
          answer:
            "Доступ назначается по ролям и объектам согласно правилам организации.",
        },
      ],
    },
    "construction-budget-control": {
      path: marketingPaths.constructionBudgetControl,
      eyebrow: "План и факт",
      title: "Контроль бюджета стройки: лимиты и обязательства",
      description:
        "МОСТ сопоставляет бюджет, лимит, обязательство, факт и отклонение по объекту. Точность зависит от полноты заявок, договоров и оплат.",
      supportingQueries: [
        "контроль бюджета стройки",
        "лимиты строительного объекта",
        "обязательства по договорам",
        "план факт затрат в строительстве",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "От лимита к подтверждённому факту",
        description:
          "Руководитель проверяет будущие обязательства до сопоставления с оплатами и бюджетом.",
        signals: [
          "Заявка не резервирует ожидаемую сумму.",
          "Договор появляется после обновления бюджета.",
          "Факт оплаты сверяют в конце периода.",
        ],
        beforeState: [
          "Лимиты хранятся в отдельной таблице.",
          "Обязательства считают по неполному перечню договоров.",
          "Отклонение объясняют после закрытия месяца.",
        ],
        afterState: [
          "Заявка проверяется относительно лимита.",
          "Договор формирует видимое обязательство.",
          "Оплата отражается в факте объекта.",
        ],
        metrics: [
          {
            label: "План",
            value: "Записи бюджета",
            detail: "Статьи и лимиты заданы по объекту.",
          },
          {
            label: "Будущие расходы",
            value: "Связь обязательств",
            detail: "Заявки и договоры учтены до оплаты.",
          },
          {
            label: "Исполнение",
            value: "Запись факта",
            detail: "Оплаты сопоставлены с основаниями.",
          },
        ],
      }),
      audienceTitle: "Кому нужен контроль бюджета",
      audienceDescription:
        "Руководителям, которые принимают решения по лимитам и обязательствам строительных объектов.",
      audiences: [
        "Финансовому руководителю, ведущему бюджет и факт.",
        "Руководителю проекта, создающему заявки и договорные обязательства.",
        "Директору, который проверяет отклонения по портфелю.",
      ],
      problemTitle: "Почему отклонение обнаруживают поздно",
      problemDescription:
        "Бюджет не отражает ожидаемые расходы, если заявки и договоры не включены в расчёт.",
      problems: [
        "Заявка согласована без проверки доступного лимита.",
        "Договорное обязательство не учтено до платежа.",
        "Факт оплаты невозможно сопоставить с исходным основанием.",
      ],
      automationTitle: "Что фиксирует МОСТ",
      automationDescription:
        "Система показывает план, принятые обязательства и внесённый факт без подмены бухгалтерского учёта.",
      automations: [
        "Бюджетные статьи и лимиты объекта.",
        "Заявки и договоры как будущие обязательства.",
        "Оплаты и отклонения относительно плана.",
      ],
      visibilityTitle: "Что видят участники",
      visibilityDescription:
        "Роли получают финансовые данные, необходимые для согласования и анализа.",
      roleViews: [
        {
          role: "Финансы",
          description: "Бюджет, лимиты, обязательства и подтверждённый факт.",
        },
        {
          role: "Руководитель проекта",
          description: "Доступный лимит и статус своих заявок.",
        },
        {
          role: "Директор",
          description: "Отклонения и их основания по объектам.",
        },
      ],
      workflow: {
        title: "Как расход проходит бюджетный контроль",
        description:
          "Будущий платёж учитывается до того, как становится фактом.",
        stages: [
          {
            label: "Заявка",
            description: "Инициатор указывает объект, статью и сумму.",
          },
          {
            label: "Лимит",
            description: "Ответственный проверяет доступный бюджет.",
          },
          {
            label: "Обязательство",
            description: "Согласованный договор учитывается в прогнозе.",
          },
          {
            label: "Факт",
            description: "Оплата сопоставляется с заявкой и договором.",
          },
        ],
      },
      relatedLinks: [
        {
          label: "Обсудить бюджет",
          href: marketingPaths.contact,
          description:
            "Сопоставьте статьи и основания с вашим управленческим учётом.",
        },
        {
          label: "Платежи в строительстве",
          href: marketingPaths.constructionPayments,
          description: "Ведите согласованный счёт до факта оплаты.",
        },
        {
          label: "ERP для строительства",
          href: marketingPaths.constructionErp,
          description:
            "Используйте бюджет в общей структуре объектов и ресурсов.",
        },
      ],
      blogLinks: getMarketingBlogLinks("managerMorning", "procurementChats"),
      contactHighlights: [
        "Покажем проверку заявки по лимиту.",
        "Покажем связь договора, обязательства и оплаты.",
        "Сопоставим отчёт об отклонениях с вашими статьями бюджета.",
      ],
      faq: [
        {
          question: "Когда возникает обязательство?",
          answer:
            "Правило задаёт компания; в МОСТ его можно связать с согласованной заявкой или договором до оплаты.",
        },
        {
          question: "Почему план-факт может быть неточным?",
          answer:
            "Точность зависит от того, внесены ли все заявки, договоры и оплаты и правильно ли они связаны со статьями.",
        },
        {
          question: "Это замена бухгалтерскому учёту?",
          answer:
            "Нет. Страница описывает управленческий контроль бюджета объекта, а регламентированный учёт остаётся в профильной системе.",
        },
      ],
    },
    "mobile-app": {
      path: marketingPaths.mobileApp,
      eyebrow: "Полевой контур",
      title:
        "Мобильное приложение для строительной компании и работы на объекте",
      description:
        "Мобильное приложение МОСТ помогает вести задачи, замечания, фотофиксацию, статусы работ и материалы прямо на строительной площадке.",
      supportingQueries: [
        "мобильное приложение для строительной компании",
        "приложение для стройки",
        "мобильное приложение для прораба",
        "полевой контур стройки",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "Порядок работы площадки и офиса",
        description:
          "События, фото, замечания и ответственные сохраняют связь с объектом.",
        signals: [
          "Фото, замечания и статусы работ фиксируются с задержкой или не доходят до офиса.",
          "Площадка и офис живут в разных темпах и постоянно уточняют факт вручную.",
          "Снабжение и приемка материалов зависят от звонков и переписок.",
        ],
        beforeLabel: "До запуска",
        beforeState: [
          "Команда фиксирует факт на телефоне, но потом вручную переносит его в таблицы и чаты.",
          "Руководитель получает неполную картину по объекту и реагирует поздно.",
          "Полевые данные не становятся частью единого процесса вовремя.",
        ],
        afterLabel: "После запуска",
        afterState: [
          "Задачи, фото, замечания и подтверждения по объекту сразу попадают в рабочий контур.",
          "Офис и площадка смотрят на один статус без задержек и дублирования.",
          "Мобильная команда влияет на скорость решений, а не просто поставляет сырой факт.",
        ],
        metrics: [
          {
            label: "Рабочий контекст",
            value: "Связь с объектом",
            detail: "Фото и замечания сохраняют связь с объектом.",
          },
          {
            label: "Контроль этапа",
            value: "Видимый статус",
            detail: "Площадка и офис видят текущий статус задачи.",
          },
          {
            label: "Следующее действие",
            value: "Назначенный ответственный",
            detail: "Для замечания указана ответственная роль.",
          },
        ],
      }),
      audienceTitle: "Кому подходит",
      audienceDescription:
        "Для команд, где ключевая информация возникает на площадке, но теряется на пути в офис.",
      audiences: [
        "Прорабам и руководителям участка, которым нужно работать с задачами на ходу.",
        "Снабженцам и инженерам, которым важно подтверждать факт прямо на объекте.",
        "Строительным компаниям, где мобильный контур должен быть частью общей системы.",
      ],
      problemTitle: "Какие задачи решает",
      problemDescription:
        "Основной риск без мобильного контура — запаздывание факта и потеря деталей по объекту.",
      problems: [
        "Позволяет фиксировать задачи, замечания и фотофакт прямо на площадке.",
        "Сокращает разрыв между событием на объекте и управленческим решением в офисе.",
        "Поддерживает работу команды без постоянного возврата к таблицам и перепискам.",
      ],
      automationTitle: "Что автоматизирует",
      automationDescription:
        "Мобильный контур нужен не сам по себе, а как часть единого процесса стройки.",
      automations: [
        "Передачу задач, комментариев и статусов между офисом и площадкой.",
        "Фотофиксацию, подтверждение работ и работу с замечаниями.",
        "Полевые сценарии по материалам, приемке и оперативной отчетности.",
      ],
      visibilityTitle: "Что видит команда",
      visibilityDescription:
        "Мобильный слой делает площадку полноценным участником цифрового процесса.",
      roleViews: [
        {
          role: "Прораб",
          description:
            "Задачи, статусы, замечания и фото по объекту в одном интерфейсе.",
        },
        {
          role: "Снабженец",
          description:
            "Подтверждения поставок, приемки и комментарии с объекта.",
        },
        {
          role: "Офис / руководитель",
          description:
            "Оперативный факт с площадки без задержки и потерь в коммуникации.",
        },
      ],
      relatedLinks: [
        { ...contactLink },
        {
          label: "Программа для прораба",
          href: marketingPaths.foremanSoftware,
          description:
            "Как связать работу прораба на площадке с офисом, снабжением и ПТО.",
        },
        {
          label: "Учет материалов в строительстве",
          href: marketingPaths.materialAccounting,
          description:
            "Если мобильный контур нужен прежде всего для снабжения и приемки.",
        },
      ],
      blogLinks: getMarketingBlogLinks("foremanOrder", "procurementChats"),
      contactHighlights: [
        "Покажем, как мобильный контур связывает площадку и офис без двойного ввода.",
        "Разберем, какие сценарии команда должна закрывать на телефоне, а какие — в офисе.",
        "Подскажем, как запускать мобильную работу без сопротивления пользователей.",
      ],
      faq: [
        {
          question: "Можно ли работать с МОСТ на объекте с телефона?",
          answer:
            "Да, мобильный контур предусмотрен для задач, замечаний, фотофиксации и статусов по объекту.",
        },
        {
          question:
            "Подходит ли приложение для снабжения и приемки материалов?",
          answer:
            "Да, мобильный сценарий можно использовать для подтверждения поставок и фиксации факта на площадке.",
        },
        {
          question: "Нужен ли отдельный продукт для мобильной команды?",
          answer:
            "Нет, мобильный контур является частью общей системы МОСТ и работает в связке с офисным слоем.",
        },
      ],
    },
    "ai-estimates": {
      path: marketingPaths.aiEstimates,
      eyebrow: "AI и сметы",
      title:
        "AI смета по чертежу для быстрого старта оценки объемов и сценариев",
      description:
        "AI-смета по чертежу в МОСТ помогает быстро оценить объемы, подготовить стартовый сценарий сметного расчета и сократить ручную первичную обработку.",
      supportingQueries: [
        "ai смета по чертежу",
        "смета по чертежу",
        "ai для строительства",
        "предварительная оценка объемов",
      ],
      processComparison: createProcessComparisonFromSource({
        title: "Порядок разбора чертежей с AI",
        description:
          "Исходный документ, статус разбора и экспертная проверка остаются в одном маршруте.",
        signals: [
          "Первичная оценка чертежей и объемов занимает слишком много ручного времени.",
          "Команда долго выходит на стартовую оценку проекта и обсуждение сценария.",
          "Сметный процесс перегружен повторяющейся первичной обработкой входных данных.",
        ],
        beforeLabel: "До запуска",
        beforeState: [
          "Первичный разбор чертежей и входных материалов делается полностью вручную.",
          "На стартовую оценку уходит много времени, а обсуждение сдвигается.",
          "Команда тратит ресурс на однотипную первичную обработку вместо экспертной проверки.",
        ],
        afterLabel: "После запуска",
        afterState: [
          "AI помогает быстрее собрать стартовый сценарий оценки и перейти к проверке.",
          "Руководитель и сметчик раньше понимают масштаб проекта и трудоемкость расчета.",
          "Экспертное время смещается в сторону верификации и принятия решений, а не рутинного старта.",
        ],
        metrics: [
          {
            label: "Рабочий контекст",
            value: "Связь с документом",
            detail: "Разбор сохраняет связь с исходным чертежом.",
          },
          {
            label: "Контроль этапа",
            value: "Видимый статус",
            detail: "Материал имеет статус разбора и проверки.",
          },
          {
            label: "Следующее действие",
            value: "Назначенный ответственный",
            detail: "Эксперт остаётся ответственным за проверку.",
          },
        ],
      }),
      audienceTitle: "Кому подходит",
      audienceDescription:
        "Для команд, которые хотят ускорить первичную оценку и старт сметного сценария.",
      audiences: [
        "Сметчикам и техническим специалистам, которым нужно быстрее переходить от чертежа к рабочей оценке.",
        "Руководителям продаж и пресейла, которым важна оперативная предварительная оценка проекта.",
        "Строительным компаниям, тестирующим AI-подходы в инженерных и расчетных процессах.",
      ],
      problemTitle: "Какие задачи решает",
      problemDescription:
        "Это не замена эксперту, а ускоритель первого шага в сметном процессе.",
      problems: [
        "Сокращает время на первичный разбор чертежей и входных данных.",
        "Помогает быстрее перейти к оценке объемов и обсуждению сценария проекта.",
        "Создает основу для дальнейшей ручной верификации и детализации сметы.",
      ],
      automationTitle: "Что автоматизирует",
      automationDescription:
        "Основная ценность — ускорение стартового этапа и снижение ручной нагрузки.",
      automations: [
        "Первичную интерпретацию входных материалов и подготовку основы для сметного расчета.",
        "Формирование стартового сценария обсуждения объемов и структуры расчета.",
        "Передачу предварительной оценки в общий рабочий контур продукта.",
      ],
      visibilityTitle: "Что видит команда",
      visibilityDescription:
        "AI-контур нужен для скорости, а не для черного ящика без объяснимости.",
      roleViews: [
        {
          role: "Сметчик",
          description:
            "Исходную AI-оценку как стартовую базу для проверки и детализации.",
        },
        {
          role: "Руководитель направления",
          description:
            "Быстрый сценарий оценки проекта и понимание трудоемкости.",
        },
        {
          role: "Команда внедрения",
          description: "Как AI-контур встраивается в общий процесс МОСТ.",
        },
      ],
      relatedLinks: [
        { ...contactLink },
        {
          label: "ERP для строительства",
          href: marketingPaths.constructionErp,
          description:
            "Если AI-сценарий должен стать частью общей системы управления стройкой.",
        },
        {
          label: "Возможности МОСТ",
          href: marketingPaths.features,
          description:
            "Смотреть, как AI-контур стыкуется с объектом, документами и аналитикой.",
        },
      ],
      blogLinks: [{ ...allBlogArticlesLink }],
      contactHighlights: [
        "Покажем, где AI реально ускоряет сметный процесс, а где все еще нужна ручная экспертиза.",
        "Разберем, как использовать AI-сценарий без отрыва от общего контура продукта.",
        "Сразу обсудим зрелость ваших входных данных и практический формат пилота.",
      ],
      faq: [
        {
          question: "Заменяет ли AI-смета сметчика полностью?",
          answer:
            "Нет, AI здесь используется как ускоритель первичной оценки и подготовки стартового сценария, а не как полная замена экспертной проверки.",
        },
        {
          question: "Можно ли использовать AI-смету как часть пилота МОСТ?",
          answer:
            "Да, такой сценарий обсуждается отдельно и обычно включается после оценки данных, чертежей и зрелости процесса.",
        },
        {
          question: "Подходит ли это только для крупных компаний?",
          answer:
            "Нет, AI-сценарий может быть полезен и командам, которым важно быстро считать предварительные оценки и уменьшать ручную нагрузку.",
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
    blogLinks: getMarketingBlogLinks('ptoWorkspace', 'managerMorning'),
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
    blogLinks: getMarketingBlogLinks('foremanOrder', 'managerMorning'),
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
    blogLinks: getMarketingBlogLinks('foremanOrder', 'managerMorning'),
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
    blogLinks: getMarketingBlogLinks('foremanOrder', 'managerMorning'),
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
    blogLinks: getMarketingBlogLinks('managerMorning'),
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
    blogLinks: getMarketingBlogLinks('ptoWorkspace', 'managerMorning'),
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
