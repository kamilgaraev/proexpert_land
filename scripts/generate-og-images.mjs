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

const renderImage = (item) => {
  const theme = themes[item.theme];
  const titleLines = splitText(item.title, 28);
  const subtitleLines = splitText(item.subtitle, 46);

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
    <style>
      .brand { font: 600 18px 'Segoe UI', 'Arial', sans-serif; letter-spacing: 0.14em; }
      .brand-secondary { font: 500 14px 'Segoe UI', 'Arial', sans-serif; letter-spacing: 0.24em; fill: #CBD5E1; }
      .title { font: 700 40px 'Segoe UI', 'Arial', sans-serif; fill: #F8FAFC; }
      .subtitle { font: 500 18px 'Segoe UI', 'Arial', sans-serif; fill: #E5E7EB; }
      .meta { font: 500 16px 'Segoe UI', 'Arial', sans-serif; fill: #CBD5E1; letter-spacing: 0.02em; }
      .preview { font: 600 18px 'Segoe UI', 'Arial', sans-serif; fill: #E5E7EB; letter-spacing: 0.1em; }
      .preview-meta { font: 500 18px 'Segoe UI', 'Arial', sans-serif; fill: #CBD5E1; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg-${item.key})" />
  <circle cx="1015" cy="102" r="236" fill="url(#glow-${item.key})" />
  <circle cx="1030" cy="468" r="155" fill="${theme.accent}" fill-opacity="0.08" />
  <rect x="70" y="72" width="650" height="486" rx="34" fill="${theme.panel}" fill-opacity="0.94" stroke="${theme.accentSoft}" stroke-opacity="0.35" stroke-width="1.5" />
  <rect x="110" y="112" width="184" height="46" rx="23" fill="${theme.accent}" />
  <text x="130" y="142" class="brand" fill="#F8FAFC">${escapeXml(item.badge.toUpperCase())}</text>
  <text x="320" y="141" class="brand-secondary">PROHELPER.PRO</text>
  ${renderTextLines({ lines: titleLines, x: 110, y: 240, lineHeight: 56, className: 'title' })}
  ${renderTextLines({
    lines: subtitleLines,
    x: 110,
    y: 240 + titleLines.length * 56 + 30,
    lineHeight: 30,
    className: 'subtitle',
  })}
  <rect x="110" y="486" width="220" height="6" rx="3" fill="${theme.accent}" />
  <text x="110" y="522" class="meta">Единый маркетинговый SEO-контур</text>
  <rect x="790" y="94" width="320" height="442" rx="32" fill="#0B1220" fill-opacity="0.82" stroke="${theme.accentSoft}" stroke-opacity="0.35" stroke-width="1.5" />
  <g>
    <rect x="830" y="132" width="240" height="86" rx="24" fill="#111C2F" fill-opacity="0.92" stroke="${theme.accentSoft}" stroke-opacity="0.26" />
    <rect x="856" y="154" width="110" height="8" rx="4" fill="${theme.accent}" />
    <rect x="856" y="174" width="180" height="6" rx="3" fill="${theme.accentSoft}" fill-opacity="0.8" />
    <rect x="856" y="190" width="144" height="5" rx="2.5" fill="#94A3B8" fill-opacity="0.72" />
  </g>
  <g>
    <rect x="830" y="248" width="240" height="86" rx="24" fill="#111C2F" fill-opacity="0.92" stroke="${theme.accentSoft}" stroke-opacity="0.26" />
    <rect x="856" y="270" width="144" height="8" rx="4" fill="${theme.accent}" />
    <rect x="856" y="290" width="162" height="6" rx="3" fill="${theme.accentSoft}" fill-opacity="0.8" />
    <rect x="856" y="306" width="154" height="5" rx="2.5" fill="#94A3B8" fill-opacity="0.72" />
  </g>
  <g>
    <rect x="830" y="364" width="240" height="86" rx="24" fill="#111C2F" fill-opacity="0.92" stroke="${theme.accentSoft}" stroke-opacity="0.26" />
    <rect x="856" y="386" width="178" height="8" rx="4" fill="${theme.accent}" />
    <rect x="856" y="406" width="146" height="6" rx="3" fill="${theme.accentSoft}" fill-opacity="0.8" />
    <rect x="856" y="422" width="164" height="5" rx="2.5" fill="#94A3B8" fill-opacity="0.72" />
  </g>
  <text x="830" y="478" class="preview">OG PREVIEW</text>
  <text x="830" y="507" class="preview-meta">1200 × 630</text>
</svg>
`;
};

await fs.mkdir(outputDir, { recursive: true });

for (const item of items) {
  const svg = renderImage(item);
  await fs.writeFile(path.join(outputDir, `${item.key}.svg`), svg, 'utf-8');
}
