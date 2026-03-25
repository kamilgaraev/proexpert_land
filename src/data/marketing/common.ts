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
  about: '/about',
  contact: '/contact',
  security: '/security',
  privacy: '/privacy',
  offer: '/offer',
  cookies: '/cookies',
} as const;

export const marketingSeo: Record<string, MarketingSeoMeta> = {
  home: {
    title: 'ProHelper - платформа управления строительством',
    description:
      'ProHelper помогает строительным компаниям держать под контролем объект, снабжение, финансы, документы и отчетность в одной системе.',
    keywords:
      'ProHelper, управление строительством, строительная платформа, объект, снабжение, финансы, документы, аналитика',
  },
  solutions: {
    title: 'Решения ProHelper для подрядчика, генподрядчика и девелопера',
    description:
      'Показываем ProHelper через реальные сценарии: работа по объектам, снабжение, контроль платежей, документы и управление группой компаний.',
    keywords:
      'решения ProHelper, подрядчик, генподрядчик, девелопер, холдинг, ПТО, строительные процессы',
  },
  features: {
    title: 'Возможности ProHelper по ключевым строительным процессам',
    description:
      'Проекты, снабжение, финансы, документы, аналитика и контур группы компаний в одном продукте.',
    keywords:
      'возможности ProHelper, проекты, снабжение, финансы, документы, аналитика, строительный софт',
  },
  pricing: {
    title: 'Пакеты ProHelper и модель запуска',
    description:
      'Выбирайте пакет ProHelper по рабочему сценарию: старт с одного контура, развитие по мере роста и корпоративное расширение.',
    keywords:
      'пакеты ProHelper, внедрение ProHelper, стоимость ProHelper, строительная платформа',
  },
  about: {
    title: 'О продукте ProHelper',
    description:
      'ProHelper помогает строительным командам выстроить единый цифровой процесс между офисом, объектом, снабжением и финансовым блоком.',
    keywords:
      'о ProHelper, продукт для строительных компаний, цифровизация стройки, внедрение ProHelper',
  },
  contact: {
    title: 'Контакты ProHelper',
    description:
      'Оставьте заявку на демонстрацию ProHelper, обсудите внедрение, пакет, безопасность и юридические вопросы.',
    keywords:
      'контакты ProHelper, демонстрация ProHelper, внедрение ProHelper, консультация ProHelper',
  },
  security: {
    title: 'Безопасность ProHelper',
    description:
      'Разграничение доступа, централизованная работа с документами, контроль действий и поддержка запуска в ProHelper.',
    keywords:
      'безопасность ProHelper, доступ по ролям, хранение документов, аудит действий',
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
    title: 'Политика файлов cookie ProHelper',
    description:
      'Информация об обязательных файлах cookie, аналитике и управлении согласием на публичном сайте ProHelper.',
    noIndex: true,
  },
};

export const marketingNavigation: MarketingRouteLink[] = [
  { label: 'Решения', href: marketingPaths.solutions },
  { label: 'Возможности', href: marketingPaths.features },
  { label: 'Пакеты', href: marketingPaths.pricing },
  { label: 'О продукте', href: marketingPaths.about },
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
  email: 'info@prohelper.ru',
  emailHref: 'mailto:info@prohelper.ru',
  location: 'Онлайн-демонстрация, рабочие сессии и запуск по согласованному сценарию.',
  responseTime: 'Отвечаем в течение рабочего дня',
  hours: 'Пн-Пт, 09:00-18:00 МСК',
  legalStatusNote:
    'Реквизиты, договорные документы и дополнительные материалы по безопасности предоставляем по запросу после первичного контакта.',
};
