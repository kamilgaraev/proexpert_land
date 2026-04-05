import fs from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve(process.cwd(), 'public', 'og');

const themes = {
  core: {
    bgTop: '#0F172A',
    bgBottom: '#111827',
    accent: '#F97316',
    accentSoft: '#FED7AA',
    panel: '#1E293B',
  },
  operations: {
    bgTop: '#102A43',
    bgBottom: '#0B1F33',
    accent: '#0EA5E9',
    accentSoft: '#BAE6FD',
    panel: '#17314F',
  },
  finance: {
    bgTop: '#10261B',
    bgBottom: '#0B1A14',
    accent: '#10B981',
    accentSoft: '#A7F3D0',
    panel: '#163126',
  },
  engineering: {
    bgTop: '#311B3F',
    bgBottom: '#1F1230',
    accent: '#A855F7',
    accentSoft: '#E9D5FF',
    panel: '#38234F',
  },
  mobile: {
    bgTop: '#0B2431',
    bgBottom: '#0A1720',
    accent: '#14B8A6',
    accentSoft: '#99F6E4',
    panel: '#143648',
  },
  neutral: {
    bgTop: '#1F2937',
    bgBottom: '#111827',
    accent: '#F59E0B',
    accentSoft: '#FDE68A',
    panel: '#273244',
  },
};

const items = [
  {
    key: 'default',
    theme: 'core',
    badge: 'ProHelper',
    title: 'Платформа управления строительством',
    subtitle: 'Маркетинговые страницы и решения для строительных компаний',
  },
  {
    key: '404',
    theme: 'neutral',
    badge: '404',
    title: 'Страница не найдена',
    subtitle: 'Перейдите к решениям ProHelper для объектов, снабжения и финансов',
  },
  {
    key: 'home',
    theme: 'core',
    badge: 'Платформа',
    title: 'Программа для строительной компании',
    subtitle: 'Объекты, снабжение, документы и финансы в одной системе',
  },
  {
    key: 'solutions',
    theme: 'core',
    badge: 'Решения',
    title: 'Сценарии для подрядчика, генподрядчика и девелопера',
    subtitle: 'Контур запуска под роли, процессы и структуру компании',
  },
  {
    key: 'features',
    theme: 'operations',
    badge: 'Возможности',
    title: 'Контроль стройки, материалов и документов',
    subtitle: 'Процессы объекта, подрядчики, финансы и аналитика',
  },
  {
    key: 'pricing',
    theme: 'finance',
    badge: 'Пакеты',
    title: 'Пакеты ProHelper под ваш этап запуска',
    subtitle: 'От стартового контура до масштабирования на несколько объектов',
  },
  {
    key: 'integrations',
    theme: 'operations',
    badge: 'Интеграции',
    title: 'Связка с 1С, ERP и BI',
    subtitle: 'Единый контур для стройки, отчетности и корпоративных систем',
  },
  {
    key: 'contractors',
    theme: 'operations',
    badge: 'Подрядчик',
    title: 'Программа для подрядчика',
    subtitle: 'Объект, задачи, снабжение и сроки в одной системе',
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
    title: 'Как ProHelper собирает стройку в один контур',
    subtitle: 'О продукте, подходе к запуску и роли цифрового процесса',
  },
  {
    key: 'contact',
    theme: 'core',
    badge: 'Демонстрация',
    title: 'Запросите релевантную демонстрацию',
    subtitle: 'Покажем сценарий под вашу команду, роли и текущие задачи',
  },
  {
    key: 'security',
    theme: 'engineering',
    badge: 'Безопасность',
    title: 'Роли, доступы и контроль действий',
    subtitle: 'Практики безопасности и разграничение доступа в ProHelper',
  },
  {
    key: 'blog',
    theme: 'neutral',
    badge: 'Блог',
    title: 'Материалы о цифровизации строительства',
    subtitle: 'Графики работ, снабжение, документы, бюджет и запуск системы',
  },
  {
    key: 'foreman-software',
    theme: 'operations',
    badge: 'Прораб',
    title: 'Программа для прораба',
    subtitle: 'Задачи, замечания, график работ и мобильный контур объекта',
  },
  {
    key: 'construction-crm',
    theme: 'operations',
    badge: 'CRM',
    title: 'CRM для строительной компании',
    subtitle: 'Объекты, статусы, договорной контур и исполнение без Excel',
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
    badge: 'Снабжение',
    title: 'Учет материалов в строительстве',
    subtitle: 'Заявки, поставки, остатки и склад по объектам',
  },
  {
    key: 'pto-software',
    theme: 'engineering',
    badge: 'ПТО',
    title: 'Система для ПТО',
    subtitle: 'Замечания, акты, исполнительная документация и комплектность',
  },
  {
    key: 'contractor-control',
    theme: 'operations',
    badge: 'Подрядчики',
    title: 'Контроль подрядчиков',
    subtitle: 'Сроки, объемы, акты и прозрачность исполнения по объектам',
  },
  {
    key: 'construction-documents',
    theme: 'engineering',
    badge: 'Документы',
    title: 'Исполнительная документация',
    subtitle: 'Акты, реестры, статусы и комплектность в одном контуре',
  },
  {
    key: 'construction-budget-control',
    theme: 'finance',
    badge: 'Бюджет',
    title: 'Контроль бюджета стройки',
    subtitle: 'Лимиты, платежи, затраты и отклонения по объекту',
  },
  {
    key: 'mobile-app',
    theme: 'mobile',
    badge: 'Мобильный контур',
    title: 'Приложение для строительной команды',
    subtitle: 'Работа прораба, снабжения и инженеров прямо на площадке',
  },
  {
    key: 'ai-estimates',
    theme: 'engineering',
    badge: 'AI',
    title: 'AI-смета по чертежу',
    subtitle: 'Быстрый старт оценки объемов и сметного сценария',
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

const getMarkConfig = (badge) => {
  const text = badge.trim().toUpperCase();

  if (text.length <= 4) {
    return { text, fontSize: 168, letterSpacing: '0.02em' };
  }

  if (text.length <= 8) {
    return { text, fontSize: 126, letterSpacing: '0.04em' };
  }

  return { text, fontSize: 92, letterSpacing: '0.08em' };
};

const renderImage = (item) => {
  const theme = themes[item.theme];
  const titleLines = splitText(item.title, 28);
  const subtitleLines = splitText(item.subtitle, 46);
  const mark = getMarkConfig(item.badge);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${item.key}" x1="600" y1="0" x2="600" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="${theme.bgTop}" />
      <stop offset="1" stop-color="${theme.bgBottom}" />
    </linearGradient>
    <radialGradient id="glow-${item.key}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1015 102) rotate(123.5) scale(472 472)">
      <stop stop-color="${theme.accent}" stop-opacity="0.35" />
      <stop offset="1" stop-color="${theme.accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="line-${item.key}" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="${theme.accent}" />
      <stop offset="1" stop-color="${theme.accentSoft}" />
    </linearGradient>
    <style>
      .eyebrow { font: 700 18px 'Segoe UI', 'Arial', sans-serif; letter-spacing: 0.16em; fill: #F8FAFC; }
      .brand-secondary { font: 600 14px 'Segoe UI', 'Arial', sans-serif; letter-spacing: 0.24em; fill: #CBD5E1; }
      .title { font: 700 54px 'Segoe UI', 'Arial', sans-serif; fill: #F8FAFC; }
      .subtitle { font: 500 24px 'Segoe UI', 'Arial', sans-serif; fill: #E5E7EB; }
      .meta { font: 600 18px 'Segoe UI', 'Arial', sans-serif; fill: #CBD5E1; letter-spacing: 0.03em; }
      .mark { font-family: 'Segoe UI', 'Arial', sans-serif; font-weight: 800; fill: ${theme.accentSoft}; opacity: 0.14; }
      .mark-caption { font: 700 16px 'Segoe UI', 'Arial', sans-serif; fill: #E2E8F0; letter-spacing: 0.18em; }
      .mark-support { font: 500 18px 'Segoe UI', 'Arial', sans-serif; fill: #CBD5E1; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg-${item.key})" />
  <circle cx="1015" cy="102" r="236" fill="url(#glow-${item.key})" />
  <circle cx="1038" cy="484" r="172" fill="${theme.accent}" fill-opacity="0.07" />
  <rect x="76" y="74" width="676" height="482" rx="36" fill="${theme.panel}" fill-opacity="0.9" stroke="${theme.accentSoft}" stroke-opacity="0.24" stroke-width="1.5" />
  <rect x="108" y="116" width="208" height="48" rx="24" fill="${theme.accent}" />
  <text x="132" y="147" class="eyebrow">${escapeXml(item.badge.toUpperCase())}</text>
  <text x="340" y="147" class="brand-secondary">PROHELPER.PRO</text>
  ${renderTextLines({ lines: titleLines, x: 108, y: 250, lineHeight: 68, className: 'title' })}
  ${renderTextLines({
    lines: subtitleLines,
    x: 108,
    y: 250 + titleLines.length * 68 + 34,
    lineHeight: 36,
    className: 'subtitle',
  })}
  <rect x="108" y="494" width="248" height="6" rx="3" fill="url(#line-${item.key})" />
  <text x="108" y="536" class="meta">Единая система для стройки, документов и финансов</text>
  <text x="808" y="222" class="mark" font-size="${mark.fontSize}" letter-spacing="${mark.letterSpacing}">${escapeXml(mark.text)}</text>
  <rect x="808" y="258" width="212" height="2" rx="1" fill="${theme.accentSoft}" fill-opacity="0.36" />
  <text x="808" y="306" class="mark-caption">СТРОИТЕЛЬНЫЙ СОФТ</text>
  <text x="808" y="346" class="mark-support">Контроль объектов, процессов и команды</text>
  <text x="808" y="382" class="mark-support">prohelper.pro</text>
</svg>
`;
};

await fs.mkdir(outputDir, { recursive: true });

for (const item of items) {
  const svg = renderImage(item);
  await fs.writeFile(path.join(outputDir, `${item.key}.svg`), svg, 'utf-8');
}
