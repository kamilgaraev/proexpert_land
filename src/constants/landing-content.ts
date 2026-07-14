import { 
  BuildingOffice2Icon, 
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
  description: "Подключайте возможности под задачи вашей компании. От сметы до сдачи объекта с AI-помощником.",
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
    recommendedModules: ['Группа компаний', 'Кабинет подрядчика', 'Сметы и бюджеты', 'Управленческая аналитика']
  },
  {
    id: 'subcontracting' as SolutionId,
    title: "Субподрядные работы",
    icon: WrenchScrewdriverIcon,
    problem: "Кассовые разрывы, долгое подписание КС-2, потери материалов.",
    solution: "Генерация актов в 1 клик. Заказ материалов с телефона прораба. Точный учет рабочего времени бригад.",
    recommendedModules: ['Акты выполненных работ', 'Склад и материалы', 'Учет времени', 'График работ']
  },
  {
    id: 'design_supervision' as SolutionId,
    title: "Проектирование и Стройконтроль",
    icon: ClipboardDocumentCheckIcon,
    problem: "Потеря версий чертежей, долгие согласования изменений.",
    solution: "Единое хранилище документации с версионностью. Маршруты согласования для технадзора.",
    recommendedModules: ['Рабочие процессы', 'Файлы объекта', 'Объекты', 'Шаблоны отчетов']
  },
  {
    id: 'supply_rental' as SolutionId,
    title: "Поставка и Аренда",
    icon: TruckIcon,
    problem: "Непонятно, где находится техника, пересорт материалов.",
    solution: "QR-учет материалов. Трекинг перемещения техники. Управление каталогом номенклатуры и интеграция с 1С.",
    recommendedModules: ['Склад и материалы', 'Справочники', 'Договоры', 'Интеграции']
  }
];

export const AI_BLOCK = {
  title: "МОСТ AI: Ваш цифровой инженер ПТО",
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

export const FEATURES_CONTENT = {
  title: "Система возможностей",
  subtitle: "Все необходимые инструменты в одной платформе",
  groups: [
    {
      title: "Управление и Процессы",
      icon: ChartBarIcon,
      items: [
        "Управление проектами и задачами",
        "Рабочие процессы",
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
        "AI-помощник",
        "Предиктивная аналитика",
        "Дашборды руководителя",
        "Консолидированные отчеты"
      ]
    }
  ]
};
