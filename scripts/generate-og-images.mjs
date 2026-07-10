import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve(process.cwd(), 'public', 'og');

const themes = {
  core: {
    surface: '#F8FAFC',
    surfaceAlt: '#EEF2F7',
    text: '#111827',
    muted: '#475569',
    accent: '#EA580C',
    accentSoft: '#FED7AA',
    panel: '#172033',
    panelText: '#F8FAFC',
  },
  operations: {
    surface: '#F8FAFC',
    surfaceAlt: '#EAF4FB',
    text: '#102A43',
    muted: '#486581',
    accent: '#0F766E',
    accentSoft: '#99F6E4',
    panel: '#123044',
    panelText: '#F8FAFC',
  },
  finance: {
    surface: '#F8FAFC',
    surfaceAlt: '#ECFDF5',
    text: '#10261B',
    muted: '#3F5F50',
    accent: '#047857',
    accentSoft: '#A7F3D0',
    panel: '#123226',
    panelText: '#F8FAFC',
  },
  engineering: {
    surface: '#F8FAFC',
    surfaceAlt: '#F5F3FF',
    text: '#261C3D',
    muted: '#5B516F',
    accent: '#6D28D9',
    accentSoft: '#DDD6FE',
    panel: '#251B3A',
    panelText: '#F8FAFC',
  },
  mobile: {
    surface: '#F8FAFC',
    surfaceAlt: '#ECFEFF',
    text: '#10313A',
    muted: '#47676F',
    accent: '#0891B2',
    accentSoft: '#A5F3FC',
    panel: '#123744',
    panelText: '#F8FAFC',
  },
  neutral: {
    surface: '#F8FAFC',
    surfaceAlt: '#F1F5F9',
    text: '#111827',
    muted: '#475569',
    accent: '#B45309',
    accentSoft: '#FDE68A',
    panel: '#1F2937',
    panelText: '#F8FAFC',
  },
};

const defaultCapabilities = ['Объекты', 'Снабжение', 'Документы', 'Финансы'];

const items = [
  {
    key: 'default',
    theme: 'core',
    badge: 'Платформа',
    title: 'Система управления строительной компанией',
    subtitle: 'Единый контур для объектов, команды, документов и финансов',
  },
  {
    key: '404',
    theme: 'neutral',
    badge: '404',
    title: 'Страница не найдена',
    subtitle: 'Перейдите к решениям МОСТ для управления строительными процессами',
    capabilities: ['Главная', 'Решения', 'Блог', 'Контакты'],
  },
  {
    key: 'home',
    theme: 'core',
    badge: 'Платформа',
    title: 'Система управления строительной компанией',
    subtitle: 'Объекты, снабжение, документы, подрядчики и финансы в едином контуре',
  },
  {
    key: 'solutions',
    theme: 'core',
    badge: 'Решения',
    title: 'Сценарии для подрядчика, генподрядчика и девелопера',
    subtitle: 'Запуск под роли, процессы и структуру строительной компании',
    titleMaxCharacters: 34,
  },
  {
    key: 'features',
    theme: 'operations',
    badge: 'Возможности',
    title: 'Контроль объектов, материалов и документов',
    subtitle: 'Рабочие процессы строительной команды в единой системе',
  },
  {
    key: 'pricing',
    theme: 'finance',
    badge: 'Пакеты',
    title: 'Пакеты МОСТ под этап запуска',
    subtitle: 'От первого управляемого контура до масштабирования компании',
    capabilities: ['Старт', 'Команда', 'Процессы', 'Масштаб'],
  },
  {
    key: 'integrations',
    theme: 'operations',
    badge: 'Интеграции',
    title: 'Интеграции с 1С, ERP и BI',
    subtitle: 'Связка строительных процессов с корпоративными системами',
    capabilities: ['API', '1С', 'ERP', 'BI'],
  },
  {
    key: 'contractors',
    theme: 'operations',
    badge: 'Подрядчик',
    title: 'Система для подрядчика',
    subtitle: 'Объект, задачи, снабжение и сроки работ в едином контуре',
  },
  {
    key: 'developers',
    theme: 'finance',
    badge: 'Девелопер',
    title: 'Контроль проектов, бюджета и подрядчиков',
    subtitle: 'Управленческий контур для девелопера и заказчика',
  },
  {
    key: 'enterprise',
    theme: 'neutral',
    badge: 'Enterprise',
    title: 'Платформа для строительного холдинга',
    subtitle: 'Единые роли, аналитика и масштабируемый запуск по группе компаний',
  },
  {
    key: 'about',
    theme: 'neutral',
    badge: 'О продукте',
    title: 'МОСТ собирает строительные процессы в один контур',
    subtitle: 'Подход к запуску, роли продукта и управляемая цифровизация',
    titleMaxCharacters: 34,
  },
  {
    key: 'contact',
    theme: 'core',
    badge: 'Демонстрация',
    title: 'Запросите релевантную демонстрацию',
    subtitle: 'Покажем сценарий под вашу команду, роли и текущие процессы',
  },
  {
    key: 'security',
    theme: 'engineering',
    badge: 'Безопасность',
    title: 'Роли, доступы и контроль действий',
    subtitle: 'Разграничение доступа и управляемая работа с данными',
    capabilities: ['Роли', 'Доступы', 'Данные', 'Аудит'],
  },
  {
    key: 'blog',
    theme: 'neutral',
    badge: 'Блог',
    title: 'Материалы о цифровизации строительства',
    subtitle: 'Процессы, документы, снабжение, бюджет и управление объектами',
  },
  {
    key: 'foreman-software',
    theme: 'operations',
    badge: 'Прораб',
    title: 'Программа для прораба',
    subtitle: 'Задачи, замечания, фотофиксация и график работ на объекте',
    capabilities: ['Задачи', 'Замечания', 'Фото', 'График'],
  },
  {
    key: 'construction-crm',
    theme: 'operations',
    badge: 'CRM',
    title: 'CRM для строительной компании',
    subtitle: 'Объекты, задачи, договоры и статусы исполнения в едином контуре',
    capabilities: ['Объекты', 'Задачи', 'Договоры', 'Статусы'],
  },
  {
    key: 'construction-erp',
    theme: 'finance',
    badge: 'ERP',
    title: 'ERP для строительства',
    subtitle: 'Объекты, снабжение, документы, платежи и аналитика',
  },
  {
    key: 'material-accounting',
    theme: 'operations',
    badge: 'Материалы',
    title: 'Учет материалов в строительстве',
    subtitle: 'Заявки, поставки, остатки и склад по объектам',
    capabilities: ['Заявки', 'Поставки', 'Остатки', 'Склад'],
  },
  {
    key: 'pto-software',
    theme: 'engineering',
    badge: 'ПТО',
    title: 'Система для ПТО',
    subtitle: 'Замечания, акты, исполнительная документация и комплектность',
    capabilities: ['ПТО', 'Акты', 'Замечания', 'Комплекты'],
  },
  {
    key: 'contractor-control',
    theme: 'operations',
    badge: 'Подрядчики',
    title: 'Контроль подрядчиков',
    subtitle: 'Сроки, объемы, акты и прозрачность исполнения по объектам',
    capabilities: ['Сроки', 'Объемы', 'Акты', 'Риски'],
  },
  {
    key: 'construction-documents',
    theme: 'engineering',
    badge: 'Документы',
    title: 'Исполнительная документация',
    subtitle: 'Акты, реестры, статусы и комплектность в одном контуре',
    capabilities: ['Акты', 'Реестры', 'Статусы', 'Комплект'],
  },
  {
    key: 'construction-budget-control',
    theme: 'finance',
    badge: 'Бюджет',
    title: 'Контроль бюджета строительства',
    subtitle: 'Лимиты, платежи, затраты и отклонения по объекту',
    capabilities: ['Лимиты', 'Платежи', 'Затраты', 'Отклонения'],
  },
  {
    key: 'mobile-app',
    theme: 'mobile',
    badge: 'Мобильный контур',
    title: 'Приложение для строительной команды',
    subtitle: 'Работа прораба, снабжения и инженеров прямо на площадке',
    capabilities: ['Поле', 'Фото', 'Заявки', 'Статусы'],
  },
  {
    key: 'ai-estimates',
    theme: 'engineering',
    badge: 'AI',
    title: 'AI-смета по чертежу',
    subtitle: 'Быстрый старт оценки объемов и сметного сценария',
    capabilities: ['Чертеж', 'Объемы', 'Оценка', 'Смета'],
  },
  {
    key: 'pir-project-documentation',
    theme: 'engineering',
    badge: 'ПИР',
    title: 'ПИР и проектная документация',
    subtitle: 'ПД, РД, IFC, замечания и выпуск комплектов в едином контуре',
    capabilities: ['ПД и РД', 'IFC', 'Замечания', 'Нормоконтроль'],
  },
  {
    key: 'construction-safety',
    theme: 'operations',
    badge: 'Охрана труда',
    title: 'Охрана труда на стройке',
    subtitle: 'Инструктажи, допуски, инциденты и контроль требований по объектам',
    capabilities: ['Инструктажи', 'Допуски', 'Инциденты', 'Проверки'],
  },
  {
    key: 'construction-quality-control',
    theme: 'engineering',
    badge: 'Качество',
    title: 'Контроль качества строительства',
    subtitle: 'Дефекты, инспекции, повторная проверка и приемка работ',
    capabilities: ['Дефекты', 'Инспекции', 'Фото', 'Проверки'],
  },
  {
    key: 'handover-acceptance',
    theme: 'operations',
    badge: 'Приемка',
    title: 'Приемка зон и punch-list',
    subtitle: 'Замечания, готовность зон и передача результата заказчику',
    capabilities: ['Зоны', 'Punch-list', 'Статусы', 'Передача'],
  },
  {
    key: 'machinery-and-labor',
    theme: 'mobile',
    badge: 'Ресурсы',
    title: 'Учет техники и выработки',
    subtitle: 'Механизмы, наряды, люди и смены на строительной площадке',
    capabilities: ['Техника', 'Наряды', 'Смены', 'Выработка'],
  },
  {
    key: 'change-control',
    theme: 'neutral',
    badge: 'Изменения',
    title: 'RFI, изменения и претензии',
    subtitle: 'Дополнительные работы, решения, основания и статус согласования',
    capabilities: ['RFI', 'Изменения', 'Претензии', 'Основания'],
  },
  {
    key: 'construction-procurement',
    theme: 'operations',
    badge: 'Закупки',
    title: 'Закупки в строительстве',
    subtitle: 'Потребность объекта, поставщики, заказ, оплата и приемка',
    capabilities: ['Потребность', 'Поставщики', 'Заказ', 'Приемка'],
  },
  {
    key: 'site-requests',
    theme: 'mobile',
    badge: 'Площадка',
    title: 'Заявки с объекта',
    subtitle: 'Материалы, техника, люди и платежи в офисном маршруте',
    capabilities: ['Материалы', 'Техника', 'Люди', 'Статусы'],
  },
  {
    key: 'workforce-management',
    theme: 'operations',
    badge: 'Персонал',
    title: 'Бригады, смены и время',
    subtitle: 'Производственный факт по людям на строительных объектах',
    capabilities: ['Сотрудники', 'Бригады', 'Смены', 'Время'],
  },
  {
    key: 'construction-payments',
    theme: 'finance',
    badge: 'Платежи',
    title: 'Платежи по объектам',
    subtitle: 'Счета, согласование, календарь, оплата и сверка',
    capabilities: ['Счета', 'Лимиты', 'Календарь', 'Сверка'],
  },
  {
    key: '1c-integration',
    theme: 'engineering',
    badge: '1С',
    title: 'Интеграция с 1С',
    subtitle: 'Согласованный обмен, справочники, сверка и мастер-данные',
    capabilities: ['Справочники', 'Обмен', 'Сверка', 'MDM'],
  },
  {
    key: 'contractor-marketplace',
    theme: 'neutral',
    badge: 'Подрядчики',
    title: 'Маркетплейс подрядчиков',
    subtitle: 'Поиск, шорт-лист, приглашения и выбор исполнителя',
    capabilities: ['Категории', 'Поиск', 'Приглашения', 'Выбор'],
  },
  {
    key: 'project-pulse',
    theme: 'engineering',
    badge: 'Project Pulse',
    title: 'Сигналы по строительным проектам',
    subtitle: 'Ежедневная сводка для управленческой проверки и действий',
    titleMaxCharacters: 21,
    capabilities: ['Риски', 'Сводка', 'Действия', 'Контроль'],
  },
];

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const splitText = (text, maxCharactersPerLine) => {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxCharactersPerLine || !currentLine) {
      currentLine = nextLine;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const renderTextLines = ({ lines, x, y, lineHeight, className }) =>
  lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" class="${className}">${escapeXml(line)}</text>`,
    )
    .join('\n');

const renderCapabilityRows = (capabilities, theme) =>
  capabilities
    .slice(0, 4)
    .map((capability, index) => {
      const y = 222 + index * 64;

      return `<g>
    <rect x="802" y="${y}" width="300" height="48" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="${theme.accentSoft}" stroke-opacity="0.18" />
    <circle cx="830" cy="${y + 24}" r="5" fill="${theme.accentSoft}" />
    <text x="850" y="${y + 31}" class="capability">${escapeXml(capability)}</text>
  </g>`;
    })
    .join('\n');

const renderImageSvg = (item) => {
  const theme = themes[item.theme];
  const titleLines = splitText(item.title, item.titleMaxCharacters ?? 24).slice(0, 3);
  const subtitleLines = splitText(item.subtitle, item.subtitleMaxCharacters ?? 50).slice(0, 3);
  const badge = item.badge.toUpperCase();
  const badgeWidth = Math.min(340, Math.max(170, badge.length * 18 + 48));
  const brandX = 82 + badgeWidth + 26;
  const subtitleY = 214 + titleLines.length * 64 + 28;
  const capabilities = item.capabilities ?? defaultCapabilities;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="panel-${item.key}" x1="760" y1="82" x2="1128" y2="548" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.panel}" />
      <stop offset="1" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="accent-${item.key}" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="${theme.accent}" />
      <stop offset="1" stop-color="${theme.accentSoft}" />
    </linearGradient>
    <style>
      .brand { font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 800; letter-spacing: 0.22em; fill: ${theme.text}; }
      .domain { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.24em; fill: ${theme.muted}; }
      .title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 52px; font-weight: 800; fill: ${theme.text}; }
      .subtitle { font-family: 'Segoe UI', Arial, sans-serif; font-size: 25px; font-weight: 600; fill: ${theme.muted}; }
      .footer { font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 700; fill: ${theme.text}; }
      .panel-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 800; letter-spacing: 0.14em; fill: ${theme.panelText}; }
      .panel-copy { font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 600; fill: #CBD5E1; }
      .capability { font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 700; fill: ${theme.panelText}; }
      .stamp { font-family: 'Segoe UI', Arial, sans-serif; font-size: 44px; font-weight: 900; letter-spacing: 0.04em; fill: ${theme.panelText}; opacity: 0.08; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="${theme.surface}" />
  <path d="M696 0H1200V630H620C724 496 751 334 696 0Z" fill="${theme.surfaceAlt}" />
  <path d="M82 514H602" stroke="#CBD5E1" stroke-width="1" stroke-opacity="0.6" />
  <path d="M82 548H528" stroke="#E2E8F0" stroke-width="1" />
  <circle cx="1046" cy="98" r="142" fill="${theme.accent}" fill-opacity="0.10" />
  <circle cx="1002" cy="520" r="186" fill="${theme.accentSoft}" fill-opacity="0.18" />
  <rect x="760" y="78" width="368" height="474" rx="34" fill="url(#panel-${item.key})" />
  <path d="M814 158H1080" stroke="${theme.accentSoft}" stroke-width="2" stroke-opacity="0.35" />
  <text x="802" y="144" class="panel-title">ЕДИНЫЙ КОНТУР</text>
  <text x="802" y="184" class="panel-copy">для строительных процессов</text>
  ${renderCapabilityRows(capabilities, theme)}
  <text x="798" y="520" class="stamp">МОСТ</text>
  <rect x="82" y="86" width="${badgeWidth}" height="48" rx="24" fill="${theme.accent}" />
  <text x="108" y="117" class="brand" fill="#FFFFFF">${escapeXml(badge)}</text>
  <text x="${brandX}" y="117" class="domain">МОСТ</text>
  ${renderTextLines({ lines: titleLines, x: 82, y: 214, lineHeight: 64, className: 'title' })}
  ${renderTextLines({ lines: subtitleLines, x: 82, y: subtitleY, lineHeight: 38, className: 'subtitle' })}
  <rect x="82" y="468" width="254" height="7" rx="3.5" fill="url(#accent-${item.key})" />
  <text x="82" y="536" class="footer">Объекты, документы, команда и финансы в одной системе</text>
  <text x="82" y="572" class="domain">МОСТ</text>
</svg>
`;
};

await fs.mkdir(outputDir, { recursive: true });

for (const item of items) {
  const svg = renderImageSvg(item);
  const svgPath = path.join(outputDir, `${item.key}.svg`);
  const pngPath = path.join(outputDir, `${item.key}.png`);

  await fs.writeFile(svgPath, svg, 'utf-8');
  await sharp(Buffer.from(svg))
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toFile(pngPath);
}
