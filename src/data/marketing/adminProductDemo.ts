export type AdminProductDemoModuleId =
  | 'projects'
  | 'schedule'
  | 'siteRequests'
  | 'procurement'
  | 'warehouse'
  | 'estimates'
  | 'payments'
  | 'acts'
  | 'contractors'
  | 'documentsAnalytics';

export type AdminProductDemoTone = 'neutral' | 'success' | 'warning' | 'danger';

export type AdminProductDemoModule = {
  id: AdminProductDemoModuleId;
  title: string;
  shortTitle: string;
  contour: string;
  adminRoute: string;
  adminSource: string;
  businessOutcome: string;
  activeTab: string;
  notification: string;
  stats: Array<{ label: string; value: string; tone: AdminProductDemoTone }>;
  rows: Array<{
    title: string;
    meta: string;
    status: string;
    progress?: number;
    linkedTo: AdminProductDemoModuleId[];
  }>;
};

export type AdminProductDemoFlow = {
  id: string;
  title: string;
  description: string;
  modules: AdminProductDemoModuleId[];
};

export const adminProductDemoDisclaimer =
  'На сайте показан сокращенный пример рабочего экрана. В личном кабинете ProHelper больше деталей: реальные объекты, роли команды, документы, настройки процессов и данные вашей компании.';

export const adminProductDemoModules: AdminProductDemoModule[] = [
  {
    id: 'projects',
    title: 'Объекты',
    shortTitle: 'Объекты',
    contour: 'Портфель',
    adminRoute: '/projects',
    adminSource: 'prohelper_admin/src/pages/Projects',
    businessOutcome: 'Руководитель видит портфель объектов, ответственных, прогресс и зоны риска без ручного свода.',
    activeTab: 'Активные объекты',
    notification: 'На объекте ЖК "Северный" обновлен риск по срокам.',
    stats: [
      { label: 'Активных', value: '18', tone: 'neutral' },
      { label: 'В риске', value: '4', tone: 'warning' },
      { label: 'В срок', value: '78%', tone: 'success' },
    ],
    rows: [
      { title: 'ЖК "Северный", корпус 2', meta: 'Москва, монолит, прораб назначен', status: 'Риск по срокам', progress: 64, linkedTo: ['schedule', 'siteRequests', 'payments'] },
      { title: 'БЦ "Меридиан"', meta: 'Инженерные сети, этап ПНР', status: 'Идет приемка', progress: 82, linkedTo: ['acts', 'documentsAnalytics'] },
      { title: 'Реконструкция склада', meta: 'Поставка материалов и подрядчики', status: 'В работе', progress: 51, linkedTo: ['warehouse', 'contractors'] },
    ],
  },
  {
    id: 'schedule',
    title: 'График и задачи',
    shortTitle: 'График',
    contour: 'Исполнение',
    adminRoute: '/schedules',
    adminSource: 'prohelper_admin/src/pages/Schedules',
    businessOutcome: 'Команда связывает сроки, зависимости, исполнителей и фактический прогресс по каждому этапу работ.',
    activeTab: 'План-факт',
    notification: 'Задача "Монтаж стояков" получила новую зависимость от поставки.',
    stats: [
      { label: 'Задач', value: '246', tone: 'neutral' },
      { label: 'Просрочено', value: '11', tone: 'danger' },
      { label: 'Закрыто', value: '69%', tone: 'success' },
    ],
    rows: [
      { title: 'Монтаж стояков ВК', meta: 'Корпус 2, секции 4-6', status: 'Ждет материалы', progress: 38, linkedTo: ['warehouse', 'procurement'] },
      { title: 'Устройство стяжки', meta: 'Этажи 8-10, бригада Смирнова', status: 'В графике', progress: 74, linkedTo: ['contractors', 'acts'] },
      { title: 'Проверка исполнительной схемы', meta: 'ПТО, комплект ИД-24', status: 'На согласовании', progress: 56, linkedTo: ['documentsAnalytics'] },
    ],
  },
  {
    id: 'siteRequests',
    title: 'Заявки с объекта',
    shortTitle: 'Заявки',
    contour: 'Поле',
    adminRoute: '/site-requests',
    adminSource: 'prohelper_admin/src/components/siteRequests',
    businessOutcome: 'Прораб передает потребности с площадки в офисный контур, а снабжение и финансы видят источник запроса.',
    activeTab: 'Новые и в работе',
    notification: 'Заявка на арматуру передана в закупку.',
    stats: [
      { label: 'Новых', value: '12', tone: 'warning' },
      { label: 'В работе', value: '31', tone: 'neutral' },
      { label: 'Закрыто', value: '143', tone: 'success' },
    ],
    rows: [
      { title: 'Арматура A500C, 12 мм', meta: 'ЖК "Северный", нужно до 18.05', status: 'В закупке', progress: 45, linkedTo: ['procurement', 'warehouse'] },
      { title: 'Заявка на автовышку', meta: 'БЦ "Меридиан", фасадные работы', status: 'Назначен исполнитель', progress: 60, linkedTo: ['schedule', 'contractors'] },
      { title: 'Оплата доставки бетона', meta: 'Реконструкция склада, поставщик БетонСнаб', status: 'Ждет согласования', progress: 34, linkedTo: ['payments'] },
    ],
  },
  {
    id: 'procurement',
    title: 'Снабжение',
    shortTitle: 'Снабжение',
    contour: 'Закупки',
    adminRoute: '/procurement/dashboard',
    adminSource: 'prohelper_admin/src/pages/Procurement',
    businessOutcome: 'Потребность превращается в закупочную заявку, запрос поставщикам, сравнение предложений и заказ.',
    activeTab: 'Закупочный контур',
    notification: 'По заявке на арматуру выбран поставщик с поставкой за 2 дня.',
    stats: [
      { label: 'Заявок', value: '27', tone: 'neutral' },
      { label: 'КП', value: '8', tone: 'warning' },
      { label: 'Заказов', value: '14', tone: 'success' },
    ],
    rows: [
      { title: 'Закупка арматуры A500C', meta: 'Источник: заявка с объекта', status: 'Сравнение КП', progress: 58, linkedTo: ['siteRequests', 'warehouse', 'payments'] },
      { title: 'Поставка кабельной продукции', meta: 'БЦ "Меридиан", лимит согласован', status: 'Заказ поставщику', progress: 72, linkedTo: ['warehouse', 'payments'] },
      { title: 'Аренда опалубки', meta: 'Подрядчик и график привязаны', status: 'Договор поставки', progress: 49, linkedTo: ['contractors', 'schedule'] },
    ],
  },
  {
    id: 'warehouse',
    title: 'Склад и материалы',
    shortTitle: 'Склад',
    contour: 'Материалы',
    adminRoute: '/warehouse',
    adminSource: 'prohelper_admin/src/pages/Warehouse/WarehousePage.tsx',
    businessOutcome: 'Остатки, резервы, приемка и движение материалов остаются связанными с объектами и заявками.',
    activeTab: 'Остатки и операции',
    notification: 'Поставка арматуры принята и зарезервирована под корпус 2.',
    stats: [
      { label: 'Позиций', value: '1 284', tone: 'neutral' },
      { label: 'Ниже минимума', value: '16', tone: 'danger' },
      { label: 'Резервов', value: '43', tone: 'success' },
    ],
    rows: [
      { title: 'Арматура A500C, 12 мм', meta: 'Склад Север, резерв под ЖК "Северный"', status: 'Принято', progress: 100, linkedTo: ['procurement', 'schedule'] },
      { title: 'Сухие смеси М150', meta: 'Остаток ниже минимума', status: 'Автозаказ', progress: 24, linkedTo: ['procurement'] },
      { title: 'Кабель ВВГнг-LS', meta: 'Перемещение на БЦ "Меридиан"', status: 'В пути', progress: 67, linkedTo: ['siteRequests', 'documentsAnalytics'] },
    ],
  },
  {
    id: 'estimates',
    title: 'Сметы и версии',
    shortTitle: 'Сметы',
    contour: 'ПТО',
    adminRoute: '/projects/:projectId/estimates',
    adminSource: 'prohelper_admin/src/pages/Estimates',
    businessOutcome: 'Сметные версии, позиции и аудит помогают связать плановую стоимость с графиком, работами и актами.',
    activeTab: 'Версии сметы',
    notification: 'Версия сметы В-04 передана в расчет выполненных работ.',
    stats: [
      { label: 'Версий', value: '9', tone: 'neutral' },
      { label: 'Отклонений', value: '6', tone: 'warning' },
      { label: 'Проверено', value: '84%', tone: 'success' },
    ],
    rows: [
      { title: 'Смета ВК, версия В-04', meta: 'Позиции материалов связаны со складом', status: 'На проверке', progress: 84, linkedTo: ['warehouse', 'acts'] },
      { title: 'Допработы по фасаду', meta: 'Подрядчик: ФасадСтрой', status: 'Согласование', progress: 52, linkedTo: ['contractors', 'payments'] },
      { title: 'Аудит расценок', meta: 'Сравнение с базой проекта', status: 'Найдены отличия', progress: 68, linkedTo: ['documentsAnalytics'] },
    ],
  },
  {
    id: 'payments',
    title: 'Платежи и финансы',
    shortTitle: 'Платежи',
    contour: 'Финансы',
    adminRoute: '/payments/dashboard',
    adminSource: 'prohelper_admin/src/components/payments',
    businessOutcome: 'Финансы видят платежи, согласования, лимиты и обязательства в связке с объектами и документами.',
    activeTab: 'Документы и контроль',
    notification: 'Платеж поставщику готов к согласованию после приемки на склад.',
    stats: [
      { label: 'К оплате', value: '18,4 млн', tone: 'neutral' },
      { label: 'На согласовании', value: '7', tone: 'warning' },
      { label: 'В лимите', value: '92%', tone: 'success' },
    ],
    rows: [
      { title: 'Оплата поставки арматуры', meta: 'Связано: заявка, заказ, приемка', status: 'Согласование', progress: 63, linkedTo: ['procurement', 'warehouse'] },
      { title: 'Аванс подрядчику ФасадСтрой', meta: 'БЦ "Меридиан", договор ФС-18', status: 'В календаре', progress: 71, linkedTo: ['contractors', 'acts'] },
      { title: 'Закрытие акта КС-2', meta: 'Реконструкция склада', status: 'Готово к оплате', progress: 88, linkedTo: ['acts', 'documentsAnalytics'] },
    ],
  },
  {
    id: 'acts',
    title: 'Акты и выполненные работы',
    shortTitle: 'Акты',
    contour: 'Закрытие',
    adminRoute: '/acts',
    adminSource: 'prohelper_admin/src/components/acts',
    businessOutcome: 'Выполненные объемы превращаются в акты и платежные основания без разрыва со сметой и графиком.',
    activeTab: 'Акты и объемы',
    notification: 'Акт по фасадным работам связан с платежным документом.',
    stats: [
      { label: 'Актов', value: '36', tone: 'neutral' },
      { label: 'На подписи', value: '5', tone: 'warning' },
      { label: 'Закрыто', value: '74%', tone: 'success' },
    ],
    rows: [
      { title: 'Акт КС-2 по фасаду', meta: 'БЦ "Меридиан", ФасадСтрой', status: 'На подписи', progress: 77, linkedTo: ['contractors', 'payments'] },
      { title: 'Выполненные работы по ВК', meta: 'Позиции взяты из сметы В-04', status: 'Проверка ПТО', progress: 69, linkedTo: ['estimates', 'schedule'] },
      { title: 'Закрытие этапа "Стяжка"', meta: 'Корпус 2, этажи 8-10', status: 'Готово', progress: 100, linkedTo: ['schedule', 'documentsAnalytics'] },
    ],
  },
  {
    id: 'contractors',
    title: 'Подрядчики и бригады',
    shortTitle: 'Подрядчики',
    contour: 'Исполнители',
    adminRoute: '/contractors',
    adminSource: 'prohelper_admin/src/pages/Contractors',
    businessOutcome: 'Исполнители, бригады и договоренности видны в контексте объекта, графика, актов и оплат.',
    activeTab: 'Исполнители',
    notification: 'Бригада назначена на этап, график и акт обновлены.',
    stats: [
      { label: 'Подрядчиков', value: '64', tone: 'neutral' },
      { label: 'Бригад', value: '21', tone: 'success' },
      { label: 'Заявок', value: '9', tone: 'warning' },
    ],
    rows: [
      { title: 'ФасадСтрой', meta: 'Фасадные работы, БЦ "Меридиан"', status: 'Активен', progress: 81, linkedTo: ['schedule', 'acts'] },
      { title: 'Бригада Смирнова', meta: 'Стяжка, корпус 2', status: 'На объекте', progress: 74, linkedTo: ['projects', 'schedule'] },
      { title: 'МонолитГрупп', meta: 'Договор и лимиты проверяются', status: 'Согласование', progress: 48, linkedTo: ['payments', 'documentsAnalytics'] },
    ],
  },
  {
    id: 'documentsAnalytics',
    title: 'Документы и аналитика',
    shortTitle: 'Аналитика',
    contour: 'Контроль',
    adminRoute: '/reports',
    adminSource: 'prohelper_admin/src/pages/Reports',
    businessOutcome: 'Документы, исполнительная, отчеты и проектный пульс собирают управленческую картину по объектам.',
    activeTab: 'Отчеты и документы',
    notification: 'Проектный пульс обновил сводку по рискам и документам.',
    stats: [
      { label: 'Отчетов', value: '28', tone: 'neutral' },
      { label: 'Комплектов ИД', value: '17', tone: 'success' },
      { label: 'Рисков', value: '6', tone: 'warning' },
    ],
    rows: [
      { title: 'Сводка по срокам проектов', meta: 'План-факт, риски, ответственные', status: 'Обновлено', progress: 100, linkedTo: ['projects', 'schedule'] },
      { title: 'Исполнительная документация', meta: 'Комплект ИД-24, БЦ "Меридиан"', status: 'На согласовании', progress: 62, linkedTo: ['acts', 'estimates'] },
      { title: 'Отчет по материалам', meta: 'Остатки, движения, критичные позиции', status: 'Есть отклонения', progress: 73, linkedTo: ['warehouse', 'procurement'] },
    ],
  },
];

export const adminProductDemoFlows: AdminProductDemoFlow[] = [
  { id: 'field-to-payment', title: 'От заявки до оплаты', description: 'Потребность с объекта проходит закупку, приемку на склад и финансовое согласование.', modules: ['siteRequests', 'procurement', 'warehouse', 'payments'] },
  { id: 'estimate-to-act', title: 'От сметы до акта', description: 'Сметная позиция попадает в график, закрывается выполненными работами и становится основанием для акта.', modules: ['estimates', 'schedule', 'acts', 'payments'] },
  { id: 'contractor-execution', title: 'Исполнитель в контексте объекта', description: 'Подрядчик или бригада привязаны к объекту, задачам, объемам и закрывающим документам.', modules: ['contractors', 'projects', 'schedule', 'acts'] },
  { id: 'management-control', title: 'Контроль руководителя', description: 'Данные по объектам, материалам, деньгам и документам собираются в управленческие отчеты.', modules: ['projects', 'warehouse', 'payments', 'documentsAnalytics'] },
];
