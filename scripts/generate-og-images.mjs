import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDir = path.resolve(process.cwd(), "public", "og");
const fontDir = path.resolve(process.cwd(), "scripts/assets/og-fonts");
const fontFiles = ["ibm-plex-sans-cyrillic.ttf", "ibm-plex-sans-latin.ttf"];
const palette = {
  paper: "#F6F2F1",
  ink: "#252721",
  muted: "#60645D",
  orange: "#F16A28",
};

const items = [
  {
    key: "default",
    title: "Между офисом\nи стройкой — МОСТ.",
    subtitle: "Система управления строительством",
  },
  {
    key: "404",
    title: "Страница не найдена",
    subtitle: "Вернитесь на главную и выберите нужный раздел.",
  },
  {
    key: "home",
    title: "Между офисом\nи стройкой — МОСТ.",
    subtitle: "Задачи, материалы, документы и деньги — по каждому объекту.",
  },
  {
    key: "solutions",
    title: "Своя задача.\nОбщий объект.",
    subtitle: "Решения для подрядчика, девелопера и строительной команды.",
  },
  {
    key: "features",
    title: "От задания на площадке\nдо решения в офисе",
    subtitle: "Работы, материалы, документы и финансы в одной системе.",
  },
  {
    key: "pricing",
    title: "Выберите функции\nдля своей команды",
    subtitle: "Бесплатная основа, бизнес-пакеты и полный комплект МОСТ.",
  },
  {
    key: "integrations",
    title: "Связать данные\nмежду системами",
    subtitle: "Обмен документами и справочниками по согласованным правилам.",
  },
  {
    key: "contractors",
    title: "От задания\nдо закрытия этапа",
    subtitle: "Работы, бригады, документы и подготовка к оплате на объекте.",
  },
  {
    key: "developers",
    title: "Видеть каждый объект.\nУправлять всем портфелем.",
    subtitle: "Сроки, замечания и отчётность для девелопера и заказчика.",
  },
  {
    key: "enterprise",
    title: "Несколько компаний.\nОбщая картина.",
    subtitle: "Организации, объекты и доступы — с данными для руководителя.",
  },
  {
    key: "about",
    title: "МОСТ связывает\nофис и площадку",
    subtitle: "Ежедневная работа на объекте становится основой решений.",
  },
  {
    key: "contact",
    title: "Покажем МОСТ\nна вашей задаче",
    subtitle: "Расскажите о своей команде и о том, что хотите изменить.",
  },
  {
    key: "security",
    title: "Каждому — доступ\nдля своей работы",
    subtitle: "Роли, права и история действий в системе МОСТ.",
  },
  {
    key: "blog",
    title: "О ежедневной работе\nв строительстве",
    subtitle: "Графики, снабжение, подрядчики, документы и бюджет.",
  },
  {
    key: "foreman-software",
    title: "Задание, работа,\nрезультат смены",
    subtitle: "Задачи, фотографии и замечания с площадки — для всей команды.",
  },
  {
    key: "construction-crm",
    title: "CRM для строительной\nкомпании",
    subtitle: "Объекты, задачи, договоры и статусы исполнения.",
  },
  {
    key: "construction-erp",
    title: "ERP для строительства",
    subtitle: "Объекты, снабжение, документы и финансы в одной системе.",
  },
  {
    key: "material-accounting",
    title: "От заявки\nдо остатка на складе",
    subtitle: "Учёт материалов и поставок по строительным объектам.",
  },
  {
    key: "pto-software",
    title: "Комплекты и замечания\nпод контролем ПТО",
    subtitle: "Документы по объекту, ответственные и статусы проверки.",
  },
  {
    key: "contractor-control",
    title: "Договорились о работе.\nВидим исполнение.",
    subtitle: "Сроки, объёмы, замечания и акты подрядчиков по объектам.",
  },
  {
    key: "construction-documents",
    title: "Работы завершены.\nДокументы под рукой.",
    subtitle: "Акты, замечания и комплектность документов по объекту.",
  },
  {
    key: "construction-budget-control",
    title: "Бюджет и факт —\nпо каждому объекту",
    subtitle: "Лимиты, затраты, обязательства и отклонения.",
  },
  {
    key: "mobile-app",
    title: "Снимок на площадке —\nзапись для офиса",
    subtitle: "Мобильное приложение для задач и фотографий с объекта.",
  },
  {
    key: "ai-estimates",
    title: "От чертежа\nк проверке объёмов",
    subtitle: "Предварительная оценка для дальнейшей работы сметчика.",
  },
  {
    key: "pir-project-documentation",
    title: "От рабочего чертежа\nдо выпуска комплекта",
    subtitle: "Версии документации, замечания и инженерная проверка.",
  },
  {
    key: "construction-safety",
    title: "Заметить нарушение.\nПроверить устранение.",
    subtitle: "Инструктажи, допуски и охрана труда по объектам.",
  },
  {
    key: "construction-quality-control",
    title: "От замечания\nдо повторной проверки",
    subtitle: "Осмотры, фотографии, ответственные и контроль качества работ.",
  },
  {
    key: "handover-acceptance",
    title: "Подготовить объект\nк передаче заказчику",
    subtitle: "Замечания, готовность зон и результаты проверок.",
  },
  {
    key: "machinery-and-labor",
    title: "Кто работал.\nКакая техника была в смене.",
    subtitle: "Учёт ресурсов и выработки на строительной площадке.",
  },
  {
    key: "change-control",
    title: "Изменение на объекте —\nс решением и основанием",
    subtitle: "Дополнительные работы, вопросы и история согласований.",
  },
  {
    key: "construction-procurement",
    title: "Объекту нужен материал.\nСнабжение видит заявку.",
    subtitle: "Потребность, поставщик, заказ и поступление на объект.",
  },
  {
    key: "site-requests",
    title: "Заявка с площадки\nдоходит до офиса",
    subtitle: "Материалы, техника и люди — с понятным статусом запроса.",
  },
  {
    key: "workforce-management",
    title: "Бригада на объекте.\nСмена в учёте.",
    subtitle: "Сотрудники, рабочее время и данные для дальнейшего расчёта.",
  },
  {
    key: "construction-payments",
    title: "Согласовать платёж.\nЗафиксировать оплату.",
    subtitle: "Внутренние платёжные документы и календарь по объектам.",
  },
  {
    key: "1c-integration",
    title: "Обмен данными с 1С",
    subtitle: "Справочники, сопоставление и проверка результатов обмена.",
  },
  {
    key: "contractor-marketplace",
    title: "Найти исполнителя\nдля строительной задачи",
    subtitle: "Поиск подрядчиков, приглашения и сравнение предложений.",
  },
  {
    key: "project-pulse",
    title: "Что требует внимания\nна объектах сегодня",
    subtitle: "Сводка для проверки руководителем и дальнейших решений.",
  },
];

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const measureLine = async (text, font) => {
  const { info } = await sharp({
    text: { text: escapeXml(text), font, rgba: true, dpi: 72 },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return info.width;
};

const renderTextLines = (lines, y, lineHeight, className) =>
  lines
    .map(
      (line, index) =>
        `<text x="64" y="${y + index * lineHeight}" class="${className}">${escapeXml(line)}</text>`,
    )
    .join("\n");

const bridgeDrawing = `<g stroke="#60645D" stroke-width="2" fill="none" stroke-linejoin="round">
  <path d="M64 527V471H286V527M64 497H286M64 521H286M96 471V527M154 471V527M220 471V527M272 471V527" />
  <path d="M96 471V456M154 471V456M220 471V456M272 471V456" />
  <path d="M140 469V420H290L176 400V469M140 420L176 400M176 420L206 410M206 420L232 414M257 420L232 414M140 443L176 420M140 443L176 464M279 420V450M274 450H284" />
  <path d="M880 527V443H1136V527M880 469H1136M880 495H1136M880 521H1136M910 443V527M944 443V527M978 443V527M1012 443V527M1046 443V527M1080 443V527M1114 443V527" />
  <path d="M880 443L914 425H1136M914 425V443" />
</g>
<path d="M450 536V613M450 536L600 613L750 536V613" stroke="#252721" stroke-width="9" fill="none" stroke-linejoin="miter" />
<path d="M64 531H1136" stroke="#F16A28" stroke-width="5" />
<path d="M441 614H459M741 614H759" stroke="#F16A28" stroke-width="5" />`;

const renderImageSvg = async (item, logo) => {
  const titleLines = item.title.split("\n");
  if (titleLines.length > 2)
    throw new Error(`Too many title lines: ${item.key}`);
  for (const line of titleLines) {
    if ((await measureLine(line, "IBM Plex Sans Bold 58")) > 1072)
      throw new Error(`Title overflows: ${item.key}`);
  }
  if ((await measureLine(item.subtitle, "IBM Plex Sans 27")) > 1072)
    throw new Error(`Subtitle overflows: ${item.key}`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="preview-title">
<title id="preview-title">${escapeXml(item.title.replaceAll("\n", " "))} — МОСТ</title>
<rect width="1200" height="630" fill="${palette.paper}" />
<style>
text { font-family: 'IBM Plex Sans', sans-serif; fill: ${palette.ink}; }
.brand { font-size: 36px; font-weight: 700; }
.domain { font-size: 23px; fill: ${palette.muted}; }
.title { font-size: 58px; font-weight: 700; }
.subtitle { font-size: 27px; fill: ${palette.muted}; }
</style>
${logo.replace("<svg ", '<svg x="64" y="42" width="60" height="48" ')}
<text x="138" y="80" class="brand">МОСТ</text>
<text x="1136" y="77" class="domain" text-anchor="end">1мост.рф</text>
${renderTextLines(titleLines, 196, 70, "title")}
${renderTextLines([item.subtitle], titleLines.length === 1 ? 254 : 328, 38, "subtitle")}
${bridgeDrawing}
</svg>\n`;
};

for (const fontFile of fontFiles) {
  await sharp({
    text: {
      text: "МОСТ",
      font: "IBM Plex Sans",
      fontfile: path.join(fontDir, fontFile),
      rgba: true,
    },
  })
    .png()
    .toBuffer();
}
const logo = await fs.readFile(
  path.resolve(process.cwd(), "public/logo.svg"),
  "utf8",
);
const rendered = await Promise.all(
  items.map(async (item) => ({
    key: item.key,
    svg: await renderImageSvg(item, logo),
  })),
);
await fs.mkdir(outputDir, { recursive: true });
for (const { key, svg } of rendered) {
  await fs.writeFile(path.join(outputDir, `${key}.svg`), svg, "utf8");
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(outputDir, `${key}.png`));
}
console.log(`Generated ${rendered.length} МОСТ previews at 1200×630.`);
