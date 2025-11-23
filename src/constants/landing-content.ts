import { 
  BuildingOffice2Icon, 
  UserGroupIcon, 
  ClipboardDocumentCheckIcon, 
  TruckIcon, 
  WrenchScrewdriverIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CubeIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ClockIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export const NAV_LINKS = [
  { name: 'Главная', path: '/' },
  { name: 'Решения', path: '/solutions' },
  { name: 'Продукты', path: '/features' },
  { name: 'Цены', path: '/pricing' },
];

export const HERO_CONTENT = {
  title: {
    main: "Стройте системно.",
    highlight: "Управляйте гибко.",
    sub: "ERP-конструктор для строительного бизнеса"
  },
  description: "Подключайте модули под задачи вашей компании. От сметы до сдачи объекта с AI-ядром.",
  cta: {
    primary: "Собрать конфигурацию",
    secondary: "Попробовать бесплатно"
  }
};

export type SolutionId = 'general_contracting' | 'subcontracting' | 'design_supervision' | 'supply_rental';

export const SOLUTIONS = [
  {
    id: 'general_contracting' as SolutionId,
    title: "Генеральный подряд",
    icon: BuildingOffice2Icon,
    problem: "Сложно контролировать десятки субподрядчиков и сводить бюджет холдинга.",
    solution: "Единая среда для всех филиалов. Портал для субподрядчиков, где они сами сдают отчеты. Консолидированная финансовая аналитика.",
    recommendedModules: ['MultiOrganization', 'ContractorPortal', 'BudgetEstimates', 'AdvancedDashboard']
  },
  {
    id: 'subcontracting' as SolutionId,
    title: "Субподрядные работы",
    icon: WrenchScrewdriverIcon,
    problem: "Кассовые разрывы, долгое подписание КС-2, потери материалов.",
    solution: "Генерация актов в 1 клик. Заказ материалов с телефона прораба. Точный учет рабочего времени бригад.",
    recommendedModules: ['ActReporting', 'BasicWarehouse', 'TimeTracking', 'ScheduleManagement']
  },
  {
    id: 'design_supervision' as SolutionId,
    title: "Проектирование и Стройконтроль",
    icon: ClipboardDocumentCheckIcon,
    problem: "Потеря версий чертежей, долгие согласования изменений.",
    solution: "Единое хранилище документации с версионностью. Маршруты согласования (Workflow) для технадзора.",
    recommendedModules: ['WorkflowManagement', 'FileManagement', 'ProjectManagement', 'ReportTemplates']
  },
  {
    id: 'supply_rental' as SolutionId,
    title: "Поставка и Аренда",
    icon: TruckIcon,
    problem: "Непонятно, где находится техника, пересорт материалов.",
    solution: "QR-учет материалов. Трекинг перемещения техники. Управление каталогом номенклатуры и интеграция с 1С.",
    recommendedModules: ['AdvancedWarehouse', 'CatalogManagement', 'ContractManagement', 'Integrations']
  }
];

export const AI_BLOCK = {
  title: "ProHelper AI: Ваш цифровой инженер ПТО",
  price: "3 990 ₽/мес",
  status: "Early Access",
  features: [
    { title: "Чат с проектом", description: "\"Сколько бетона залили на прошлой неделе?\" — мгновенный ответ." },
    { title: "Анализ рисков", description: "Предиктивное обнаружение срывов сроков." },
    { title: "Генерация", description: "Создание суточных отчетов и писем из тезисов." },
    { title: "Поиск знаний", description: "Мгновенный поиск по базе знаний и документации." }
  ]
};

export const TRUST_BLOCK = [
  {
    title: "Real-time",
    description: "Мгновенные обновления статусов",
    icon: ClockIcon
  },
  {
    title: "S3 Storage",
    description: "Безопасное облачное хранение терабайтов чертежей",
    icon: CloudArrowUpIcon
  },
  {
    title: "Безопасность",
    description: "Разграничение прав доступа, логирование действий",
    icon: ShieldCheckIcon
  }
];

export type ModuleType = 'core' | 'feature' | 'addon' | 'service';

export interface PricingModule {
  id: string;
  name: string;
  price: number;
  period?: 'mes' | 'one_time';
  type: ModuleType;
  status?: 'Beta' | 'Dev' | 'Alpha' | 'Скоро';
  description?: string; // Optional description if needed later
}

export const PRICING_MODULES: PricingModule[] = [
  // CORE
  { id: 'Organizations', name: 'Управление организациями', price: 0, type: 'core' },
  { id: 'Users', name: 'Управление пользователями', price: 0, type: 'core' },
  { id: 'Payments', name: 'Платежи и взаиморасчеты', price: 0, type: 'core' },
  { id: 'ProjectManagement', name: 'Управление проектами', price: 0, type: 'core' },
  { id: 'ContractManagement', name: 'Управление контрактами', price: 0, type: 'core' },
  { id: 'CatalogManagement', name: 'Справочники', price: 0, type: 'core' },
  { id: 'BasicReports', name: 'Базовые отчеты', price: 0, type: 'core' },
  { id: 'BasicWarehouse', name: 'Базовый склад', price: 0, type: 'core' },
  { id: 'DashboardWidgets', name: 'Виджеты', price: 0, type: 'core' },
  { id: 'DataFilters', name: 'Фильтры', price: 0, type: 'core' },

  // FEATURE
  { id: 'MultiOrganization', name: 'Мультиорганизация', price: 5900, type: 'feature' },
  { id: 'BudgetEstimates', name: 'Сметное дело', price: 5000, type: 'feature', status: 'Beta' },
  { id: 'AdvancedWarehouse', name: 'Продвинутый склад', price: 3990, type: 'feature', status: 'Dev' },
  { id: 'ScheduleManagement', name: 'Расписание', price: 1990, type: 'feature', status: 'Beta' },
  { id: 'WorkflowManagement', name: 'Рабочие процессы', price: 1990, type: 'feature' },
  { id: 'AdvancedReports', name: 'Продвинутые отчеты', price: 2900, type: 'feature' },
  { id: 'TimeTracking', name: 'Учет времени', price: 1490, type: 'feature', status: 'Alpha' },
  { id: 'AdvancedDashboard', name: 'Продвинутый дашборд', price: 4990, type: 'feature', status: 'Скоро' },

  // ADDONS
  { id: 'AIAssistant', name: 'AI Ассистент', price: 3990, type: 'addon', status: 'Dev' },
  { id: 'ContractorPortal', name: 'Портал подрядчиков', price: 3490, type: 'addon', status: 'Dev' },
  { id: 'MaterialAnalytics', name: 'Аналитика материалов', price: 2990, type: 'addon' },
  { id: 'Integrations', name: 'Интеграции 1С/CRM', price: 2900, type: 'addon', status: 'Скоро' },
  { id: 'AdvanceAccounting', name: 'Подотчетные средства', price: 2490, type: 'addon', status: 'Dev' },
  { id: 'RateManagement', name: 'Расценки', price: 2490, type: 'addon', status: 'Dev' },
  { id: 'SystemLogs', name: 'Системные логи', price: 1990, type: 'addon', status: 'Скоро' },
  { id: 'ActReporting', name: 'Управление актами', price: 1990, type: 'addon' },
  { id: 'FileManagement', name: 'Файлы', price: 990, type: 'addon' },

  // SERVICES
  { id: 'ReportTemplates', name: 'Шаблоны отчетов', price: 5900, type: 'service', period: 'one_time', status: 'Alpha' },
  { id: 'DataExport', name: 'Экспорт данных безлимит', price: 500, type: 'service', period: 'one_time' },
];

export const FEATURES_CONTENT = {
  title: "Модульная система",
  subtitle: "Все необходимые инструменты в одной платформе",
  groups: [
    {
      title: "Управление и Процессы",
      icon: ChartBarIcon,
      items: [
        "Управление проектами и задачами",
        "Рабочие процессы (Workflow)",
        "Сетевой график и расписание",
        "Учет рабочего времени"
      ]
    },
    {
      title: "Снабжение и Склад",
      icon: CubeIcon,
      items: [
        "Базовый и продвинутый склад",
        "Заявки на материалы",
        "Каталог номенклатуры",
        "QR-инвентаризация"
      ]
    },
    {
      title: "Финансы и Документы",
      icon: DocumentTextIcon,
      items: [
        "Сметы и бюджеты",
        "Акты выполненных работ (КС-2/КС-3)",
        "Финансовые отчеты",
        "Электронный документооборот"
      ]
    },
    {
      title: "AI и Аналитика",
      icon: CpuChipIcon,
      items: [
        "AI Ассистент",
        "Предиктивная аналитика",
        "Дашборды руководителя",
        "Консолидированные отчеты"
      ]
    }
  ]
};

