import type {
  MarketingMaturityMeta,
  MarketingRouteLink,
  MarketingSeoMeta,
  MarketingSurfaceMeta,
} from '@/types/marketing';

export const marketingPaths = {
  home: '/',
  solutions: '/solutions',
  features: '/features',
  pricing: '/pricing',
  integrations: '/integrations',
  contractors: '/contractors',
  developers: '/developers',
  enterprise: '/enterprise',
  about: '/about',
  contact: '/contact',
  security: '/security',
  blog: '/blog',
  foremanSoftware: '/foreman-software',
  constructionCrm: '/construction-crm',
  constructionErp: '/construction-erp',
  materialAccounting: '/material-accounting',
  ptoSoftware: '/pto-software',
  contractorControl: '/contractor-control',
  constructionDocuments: '/construction-documents',
  constructionBudgetControl: '/construction-budget-control',
  mobileApp: '/mobile-app',
  aiEstimates: '/ai-estimates',
  privacy: '/privacy',
  offer: '/offer',
  cookies: '/cookies',
} as const;

export const marketingSeo: Record<string, MarketingSeoMeta> = {
  home: {
    title: '????????? ??? ???????????? ???????? | ProHelper',
    description:
      'ProHelper ???????? ??????????, ????????????? ? ?????????? ????????? ?????????, ??????????, ??????????? ? ????????? ? ????? ???????.',
    keywords:
      'программа для строительной компании, система управления строительством, crm для строительства, erp для строительства, ProHelper',
  },
  solutions: {
    title: '??????? ??? ??????????, ????????????? ? ?????????? | ProHelper',
    description:
      '???????? ProHelper ??? ??????????, ?????????????, ??????????, ??? ? ?????????? ??????. ????????? ?????? ??????? ??? ???? ? ????????.',
    keywords:
      'решения для строительной компании, для подрядчика, для генподрядчика, для девелопера, система для пто',
  },
  features: {
    title: '??????????? ProHelper ??? ??????? | ProHelper',
    description:
      '???????? ???????, ???? ??????????, ?????????, ??????????, ??????? ? ?????????????? ????????? ? ????? ???????????? ???????.',
    keywords:
      'возможности prohelper, учет материалов в строительстве, контроль подрядчиков, документы в строительстве, финансы стройки',
  },
  pricing: {
    title: 'Стоимость и пакеты ProHelper для строительной компании',
    description:
      'Пакеты ProHelper для строительной компании: старт с нужного контура, поэтапный запуск и масштабирование решения под рост команды и объектов.',
    keywords:
      'стоимость prohelper, пакеты prohelper, внедрение системы для стройки, программа для строительной компании цена',
  },
  integrations: {
    title: '?????????? ? 1?, ERP ? BI | ProHelper',
    description:
      '?????????? ProHelper ? 1?, ERP, BI ? ?????????????? ????????? ??? ??????? ??????? ???????, ??????????, ???????? ? ??????????.',
    keywords:
      'интеграция 1с строительство, erp для строительства, api для стройки, интеграция строительной системы',
  },
  contractors: {
    title: '????????? ??? ?????????? | ProHelper',
    description:
      'ProHelper ???????? ?????????? ????????? ????????, ????????, ??????????, ??????????? ? ??????? ????? ? ????? ???????.',
    keywords:
      'программа для подрядчика, управление строительными работами, система для подрядчика, программа для стройки',
  },
  developers: {
    title: '??????? ??? ?????????? | ProHelper',
    description:
      'ProHelper ??? ??????????: ???????? ???????????, ??????, ???????, ?????????? ? ?????????????? ?????????? ?? ????????.',
    keywords:
      'система для девелопера, контроль строительных проектов, контроль подрядчиков, цифровизация девелопера',
  },
  enterprise: {
    title: 'Enterprise-????????? ??? ????????????? ???????? | ProHelper',
    description:
      'Enterprise-??????? ProHelper ??? ???????????? ????????? ? ??????? ????????: ?????? ?????????, ????, ????????? ? ?????????????? ??????.',
    keywords:
      'enterprise для строительства, система для строительного холдинга, цифровой контур холдинга, prohelper enterprise',
  },
  about: {
    title: 'О продукте ProHelper для управления строительством',
    description:
      'ProHelper — продукт для цифровизации строительной компании: единый контур между офисом, объектом, снабжением и финансовым блоком.',
    keywords:
      'о prohelper, продукт для управления строительством, цифровизация стройки, система для строительной компании',
  },
  contact: {
    title: 'Запросить демонстрацию ProHelper для строительной компании',
    description:
      'Оставьте заявку на демонстрацию ProHelper. Обсудим запуск, роль команды, пакет решения, безопасность и формат внедрения для стройки.',
    keywords:
      'демонстрация prohelper, контакты prohelper, внедрение prohelper, запросить демонстрацию строительной системы',
  },
  security: {
    title: 'Безопасность, роли и доступы в ProHelper',
    description:
      'Безопасность ProHelper: ролевой доступ, работа с документами, контроль действий и практики запуска для строительных компаний.',
    keywords:
      'безопасность prohelper, роли и доступы, хранение документов, аудит действий, безопасность строительной системы',
  },
  blog: {
    title: '???? ? ???????????? ????????????? | ProHelper',
    description:
      '???? ProHelper ? ???????? ?????, ????? ??????????, ???????????, ??????????, ??????? ??????? ? ??????? ????????? ???????.',
    keywords:
      'блог о строительстве, цифровизация строительства, учет материалов, контроль подрядчиков, статьи prohelper',
  },
  'foreman-software': {
    title: 'Программа для прораба в строительстве | ProHelper',
    description:
      'Программа для прораба: задачи, замечания, график работ, фотофиксация и контроль объекта в одной системе ProHelper.',
    keywords:
      'программа для прораба, приложение для прораба, учет работ на объекте, контроль графика работ',
  },
  'construction-crm': {
    title: 'CRM для строительной компании | ProHelper',
    description:
      'CRM для строительной компании: объекты, задачи, статусы, договорной контур и управление исполнением в одной системе ProHelper.',
    keywords:
      'crm для строительной компании, crm для стройки, система для строительной компании, альтернатива excel для стройки',
  },
  'construction-erp': {
    title: 'ERP для строительства с объектами и финансами | ProHelper',
    description:
      'ERP для строительства: объект, снабжение, документы, подрядчики, платежи и управленческая аналитика в одном контуре ProHelper.',
    keywords:
      'erp для строительства, система управления строительством, программа для строительной компании, erp стройка',
  },
  'material-accounting': {
    title: 'Учет материалов в строительстве и контроль поставок',
    description:
      'Учет материалов в строительстве: заявки, поставки, остатки, склад и контроль снабжения по объектам в ProHelper.',
    keywords:
      'учет материалов в строительстве, строительный склад, заявки на материалы, контроль поставок',
  },
  'pto-software': {
    title: 'Система для ПТО и исполнительной документации | ProHelper',
    description:
      'Система для ПТО: замечания, акты, исполнительная документация, комплектность и согласования по объекту в ProHelper.',
    keywords:
      'система для пто, исполнительная документация, акты кс-2 кс-3, контроль замечаний',
  },
  'contractor-control': {
    title: 'Контроль подрядчиков в строительстве | ProHelper',
    description:
      'Контроль подрядчиков в строительстве: сроки, объемы, замечания, акты и прозрачность исполнения по объектам в ProHelper.',
    keywords:
      'контроль подрядчиков, контроль субподрядчиков, система для генподрядчика, сроки и объемы работ',
  },
  'construction-documents': {
    title: 'Исполнительная документация в строительстве | ProHelper',
    description:
      'Исполнительная документация в строительстве: замечания, акты, комплектность и статусы согласования в одном контуре ProHelper.',
    keywords:
      'исполнительная документация в строительстве, акты кс-2 кс-3, строительные документы, комплектность документов',
  },
  'construction-budget-control': {
    title: 'Контроль бюджета стройки и затрат по объекту | ProHelper',
    description:
      'Контроль бюджета стройки: лимиты, платежи, затраты, обязательства и отклонения по объектам в системе ProHelper.',
    keywords:
      'контроль бюджета стройки, контроль затрат по объекту, платежи в строительстве, лимиты стройка',
  },
  'mobile-app': {
    title: 'Мобильное приложение для строительной компании | ProHelper',
    description:
      'Мобильное приложение для строительной компании: задачи, замечания, фотофиксация и материалы на объекте в ProHelper.',
    keywords:
      'мобильное приложение для строительной компании, приложение для стройки, мобильное приложение для прораба',
  },
  'ai-estimates': {
    title: 'AI смета по чертежу и оценка объемов | ProHelper',
    description:
      'AI смета по чертежу помогает быстрее оценить объемы, подготовить стартовый сметный сценарий и сократить ручную первичную обработку.',
    keywords:
      'ai смета по чертежу, смета по чертежу, ai для строительства, оценка объемов стройка',
  },
  privacy: {
    title: 'Политика конфиденциальности ProHelper',
    description:
      'Как ProHelper обрабатывает персональные данные, полученные через публичный сайт и форму обратной связи.',
    noIndex: true,
  },
  offer: {
    title: 'Публичная оферта ProHelper',
    description:
      'Условия использования публичного сайта ProHelper, формы обратной связи и базовые правила коммуникации.',
    noIndex: true,
  },
  cookies: {
    title: 'Политика cookie ProHelper',
    description:
      'Информация об обязательных cookie, аналитике и управлении согласием на публичном сайте ProHelper.',
    noIndex: true,
  },
};

export const marketingNavigation: MarketingRouteLink[] = [
  { label: 'Главная', href: marketingPaths.home, exact: true },
  { label: 'Решения', href: marketingPaths.solutions },
  { label: 'Возможности', href: marketingPaths.features },
  { label: 'Пакеты', href: marketingPaths.pricing },
  { label: 'Безопасность', href: marketingPaths.security },
  { label: 'Контакты', href: marketingPaths.contact },
];

export const marketingMaturityMeta: Record<string, MarketingMaturityMeta> = {
  stable: {
    label: 'Готово',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    description: 'Функция используется в рабочих сценариях продукта.',
  },
  beta: {
    label: 'Пилот',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    description: 'Функция доступна для пилотного запуска и требует проектной настройки.',
  },
  alpha: {
    label: 'Тест',
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    description: 'Экспериментальный режим для ограниченного сценария.',
  },
  coming_soon: {
    label: 'Скоро',
    tone: 'border-slate-200 bg-slate-100 text-slate-700',
    description: 'Функция запланирована и пока не предлагается как готовый контур.',
  },
  early_access: {
    label: 'По запросу',
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    description: 'Функция подключается по согласованному сценарию.',
  },
};

export const marketingSurfaceMeta: Record<string, MarketingSurfaceMeta> = {
  admin: { label: 'Офис', tone: 'bg-slate-100 text-slate-700' },
  mobile: { label: 'Объект', tone: 'bg-orange-100 text-orange-700' },
  lk: { label: 'Кабинет', tone: 'bg-blue-100 text-blue-700' },
  holding: { label: 'Группа компаний', tone: 'bg-indigo-100 text-indigo-700' },
};

export const marketingCompany = {
  brand: 'ProHelper',
  tagline: 'Платформа управления строительством',
  phone: '',
  phoneHref: '',
  email: 'info@prohelper.pro',
  emailHref: 'mailto:info@prohelper.pro',
  location: 'Онлайн-демонстрация, рабочие сессии и запуск по согласованному сценарию.',
  responseTime: 'Отвечаем в течение рабочего дня',
  hours: 'Пн-Пт, 09:00-18:00 МСК',
  legalStatusNote:
    'Реквизиты, договорные документы и дополнительные материалы по безопасности предоставляем по запросу после первичного контакта.',
};
