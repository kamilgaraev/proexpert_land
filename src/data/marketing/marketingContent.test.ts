import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import type { MarketingSeoLandingPage } from "@/types/marketing";
import { marketingBlogArticles } from "./blogArticles";
import { marketingCapabilityMatrix } from "./capabilities";
import {
  marketingFaqs,
  marketingHeroFacts,
  marketingLaunchSteps,
} from "./home";
import {
  commercialPackages,
  commercialTerms,
  freeFoundationOffer,
  fullSuiteOffer,
  marketingAdvancedOffers,
} from "./packages";
import { marketingSolutionSegments } from "./solutions";
import {
  marketingAboutSections,
  marketingSecurityCapabilities,
  marketingSecuritySections,
  marketingTrustFacts,
} from "./trust";
import {
  marketingCommercialLandingLinks,
  marketingCompany,
  marketingModuleLandingLinks,
  marketingPackages,
  marketingPaths,
  marketingRoleLandingLinks,
  marketingSeo,
  marketingSeoLandingPages,
  marketingSitemapRoutes,
} from "./index";

type SemanticSectionName =
  | "hero"
  | "audience"
  | "problem"
  | "automation"
  | "workflow"
  | "roleViews"
  | "processComparison"
  | "limitations"
  | "relatedLinks"
  | "faq";

type SemanticSectionSources = Partial<Record<SemanticSectionName, unknown>>;

const semanticSectionNames: SemanticSectionName[] = [
  "hero",
  "audience",
  "problem",
  "automation",
  "workflow",
  "roleViews",
  "processComparison",
  "limitations",
  "relatedLinks",
  "faq",
];

const MIN_EXACT_CONTIGUOUS_WORDS = 14;
const MIN_WORDS_FOR_SHINGLE_SIMILARITY = 10;

const collectSectionStrings = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectSectionStrings);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectSectionStrings);
  }
  return [];
};

const normalizeSectionWords = (value: unknown): string[] =>
  collectSectionStrings(value)
    .join(" ")
    .toLocaleLowerCase("ru-RU")
    .match(/[а-яёa-z0-9]+/gu) ?? [];

const createWordShingles = (words: string[], size = 3): Set<string> => {
  if (words.length < size) {
    return new Set(words.length > 0 ? [words.join(" ")] : []);
  }

  return new Set(
    Array.from({ length: words.length - size + 1 }, (_, index) =>
      words.slice(index, index + size).join(" "),
    ),
  );
};

const longestCommonContiguousWordSequence = (
  left: string[],
  right: string[],
): number => {
  const previous = new Array<number>(right.length + 1).fill(0);
  let longest = 0;

  for (const leftWord of left) {
    const current = new Array<number>(right.length + 1).fill(0);
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      if (leftWord === right[rightIndex - 1]) {
        current[rightIndex] = previous[rightIndex - 1] + 1;
        longest = Math.max(longest, current[rightIndex]);
      }
    }
    previous.splice(0, previous.length, ...current);
  }

  return longest;
};

const findSemanticSectionDuplicates = (
  sectionsByRoute: Record<string, SemanticSectionSources>,
): string[] => {
  const sections = Object.entries(sectionsByRoute).flatMap(
    ([route, routeSections]) =>
      semanticSectionNames.flatMap((sectionName) => {
        const source = routeSections[sectionName];
        return source === undefined
          ? []
          : [{ route, sectionName, words: normalizeSectionWords(source) }];
      }),
  );
  const duplicates: string[] = [];

  for (let leftIndex = 0; leftIndex < sections.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < sections.length;
      rightIndex += 1
    ) {
      const left = sections[leftIndex];
      const right = sections[rightIndex];
      if (left.route === right.route) {
        continue;
      }

      const leftWords = left.words;
      const rightWords = right.words;
      const shorterWordCount = Math.min(leftWords.length, rightWords.length);
      const longestSequence = longestCommonContiguousWordSequence(
        leftWords,
        rightWords,
      );
      const hasExactContiguousDuplicate =
        longestSequence >= MIN_EXACT_CONTIGUOUS_WORDS;
      let shingleSimilarity = 0;

      if (shorterWordCount >= MIN_WORDS_FOR_SHINGLE_SIMILARITY) {
        const leftShingles = createWordShingles(leftWords);
        const rightShingles = createWordShingles(rightWords);
        const smallerShingleCount = Math.min(
          leftShingles.size,
          rightShingles.size,
        );
        const sharedShingleCount = [...leftShingles].filter((shingle) =>
          rightShingles.has(shingle),
        ).length;
        shingleSimilarity =
          smallerShingleCount === 0
            ? 0
            : sharedShingleCount / smallerShingleCount;
      }

      if (shingleSimilarity >= 0.65 || hasExactContiguousDuplicate) {
        duplicates.push(
          `${left.route}/${left.sectionName} <-> ${right.route}/${right.sectionName} ` +
            `(shingles=${shingleSimilarity.toFixed(2)}, contiguousWords=${longestSequence})`,
        );
      }
    }
  }

  return duplicates;
};

const collectSemanticSections = (
  page: MarketingSeoLandingPage,
): SemanticSectionSources => ({
  hero: [page.eyebrow, page.title, page.description, page.supportingQueries],
  audience: [page.audienceTitle, page.audienceDescription, page.audiences],
  problem: [page.problemTitle, page.problemDescription, page.problems],
  automation: [
    page.automationTitle,
    page.automationDescription,
    page.automations,
  ],
  workflow: page.workflow,
  roleViews: [page.visibilityTitle, page.visibilityDescription, page.roleViews],
  processComparison: page.processComparison,
  limitations: [
    page.description.split(/(?<=[.!?])\s+/u).slice(1),
    page.faq.filter(({ answer }) =>
      /^(?:нет\.|точность|полнота|юридическая)/iu.test(answer),
    ),
  ],
  relatedLinks: page.relatedLinks.map(({ description }) => description),
  faq: page.faq,
});

const commercialClusterPageKeys = [
  "foreman-software",
  "construction-crm",
  "construction-erp",
  "material-accounting",
  "pto-software",
  "contractor-control",
  "construction-documents",
  "construction-budget-control",
  "mobile-app",
  "ai-estimates",
  "pir-project-documentation",
  "construction-safety",
  "construction-quality-control",
  "handover-acceptance",
  "machinery-and-labor",
  "change-control",
  "construction-procurement",
  "site-requests",
  "workforce-management",
  "construction-payments",
  "1c-integration",
  "contractor-marketplace",
  "project-pulse",
] as const;

const rewrittenClusterContracts = {
  "pir-project-documentation": [
    "проектн",
    "рабоч",
    "замечан",
    "комплект",
    "инженерн",
  ],
  "construction-safety": [
    "охран",
    "труд",
    "промышлен",
    "эколог",
    "инструктаж",
    "нарушен",
  ],
  "construction-quality-control": [
    "дефект",
    "провер",
    "устран",
    "ответственн",
    "специалист",
  ],
  "handover-acceptance": ["приём", "зон", "перечень", "замечан"],
  "machinery-and-labor": ["техник", "смен", "выработ", "телематик", "табел"],
  "change-control": [
    "запрос",
    "информац",
    "изменен",
    "дополнительн",
    "уполномочен",
  ],
  "mobile-app": ["телефон", "роль", "связ"],
  "ai-estimates": [
    "предварительн",
    "чертеж",
    "экспертн",
    "не является готовой сметой",
  ],
  "construction-procurement": [
    "потребност",
    "предложен",
    "поставщик",
    "сотрудник",
  ],
  "site-requests": ["заявк", "поставк", "приём", "маршрут", "согласован"],
  "workforce-management": [
    "бригад",
    "смен",
    "допуск",
    "рабоч",
    "кадров",
    "зарплат",
  ],
  "construction-payments": [
    "заявк",
    "оплат",
    "лимит",
    "согласован",
    "внешн",
    "финансов",
  ],
  "1c-integration": ["1с", "справочник", "документ", "проект", "интеграц"],
  "contractor-marketplace": [
    "поиск",
    "приглашен",
    "подрядчик",
    "не является гарантией",
  ],
  "project-pulse": ["сигнал", "ежедневн", "исходн", "управленческ", "решен"],
} as const;

const workspaceSourceExists = (source: string): boolean =>
  [
    path.resolve(process.cwd(), "..", source),
    path.resolve(process.cwd(), "..", "..", "..", source),
  ].some((candidate) => fs.existsSync(candidate));

type CoreMarketingSeoKey =
  | "home"
  | "solutions"
  | "features"
  | "pricing"
  | "integrations"
  | "contractors"
  | "developers"
  | "enterprise"
  | "about"
  | "security"
  | "contact"
  | "blog";

interface CoreMarketingRouteContract {
  route: string;
  seoKey: CoreMarketingSeoKey;
  componentName: string;
  componentPath: string;
  routeElement: string;
  requiredTerms: string[];
}

const coreMarketingRouteContract: CoreMarketingRouteContract[] = [
  {
    route: "/",
    seoKey: "home",
    componentName: "HomePage",
    componentPath: "src/pages/landing/HomePage.tsx",
    routeElement: '<Route path="/" element={<HomePage />} />',
    requiredTerms: ["объект", "задач", "документ", "снабжен", "финанс"],
  },
  {
    route: "/solutions",
    seoKey: "solutions",
    componentName: "SolutionsPage",
    componentPath: "src/pages/landing/SolutionsPage.tsx",
    routeElement: '<Route path="/solutions" element={<SolutionsPage />} />',
    requiredTerms: ["тип компании", "роль"],
  },
  {
    route: "/features",
    seoKey: "features",
    componentName: "FeaturesPage",
    componentPath: "src/pages/landing/FeaturesPage.tsx",
    routeElement: '<Route path="/features" element={<FeaturesPage />} />',
    requiredTerms: ["возможност", "функци"],
  },
  {
    route: "/pricing",
    seoKey: "pricing",
    componentName: "PricingPage",
    componentPath: "src/pages/landing/PricingPage.tsx",
    routeElement: '<Route path="/pricing" element={<PricingPage />} />',
    requiredTerms: ["пакет", "пробн", "подключ"],
  },
  {
    route: "/integrations",
    seoKey: "integrations",
    componentName: "IntegrationsPage",
    componentPath: "src/pages/product/IntegrationsPage.tsx",
    routeElement:
      '<Route path="/integrations" element={<IntegrationsPage />} />',
    requiredTerms: ["1С", "справочник", "документ", "настройк"],
  },
  {
    route: "/contractors",
    seoKey: "contractors",
    componentName: "ContractorsPage",
    componentPath: "src/pages/solutions/ContractorsPage.tsx",
    routeElement: '<Route path="/contractors" element={<ContractorsPage />} />',
    requiredTerms: ["объект", "бригад", "объём", "документ", "оплат"],
  },
  {
    route: "/developers",
    seoKey: "developers",
    componentName: "DevelopersPage",
    componentPath: "src/pages/solutions/DevelopersPage.tsx",
    routeElement: '<Route path="/developers" element={<DevelopersPage />} />',
    requiredTerms: ["портфел", "срок", "замечан", "отчётност"],
  },
  {
    route: "/enterprise",
    seoKey: "enterprise",
    componentName: "EnterprisePage",
    componentPath: "src/pages/solutions/EnterprisePage.tsx",
    routeElement: '<Route path="/enterprise" element={<EnterprisePage />} />',
    requiredTerms: ["организац", "объект", "прав", "сводн"],
  },
  {
    route: "/about",
    seoKey: "about",
    componentName: "AboutPage",
    componentPath: "src/pages/company/AboutPage.tsx",
    routeElement: '<Route path="/about" element={<AboutPage />} />',
    requiredTerms: ["создан", "принцип"],
  },
  {
    route: "/security",
    seoKey: "security",
    componentName: "SecurityPage",
    componentPath: "src/pages/company/SecurityPage.tsx",
    routeElement: '<Route path="/security" element={<SecurityPage />} />',
    requiredTerms: ["рол", "доступ", "файл", "истори"],
  },
  {
    route: "/contact",
    seoKey: "contact",
    componentName: "ContactPage",
    componentPath: "src/pages/company/ContactPage.tsx",
    routeElement: '<Route path="/contact" element={<ContactPage />} />',
    requiredTerms: ["заявк", "следующ"],
  },
  {
    route: "/blog",
    seoKey: "blog",
    componentName: "BlogPublicPage",
    componentPath: "src/components/blog/public/BlogPublicPage.tsx",
    routeElement:
      '<Route path="/blog" element={<BlogPublicPage initialData={initialBlogIndexData} />} />',
    requiredTerms: ["стать", "управлен", "строй"],
  },
];

const flattenText = (values: unknown[]): string =>
  values
    .flat(Infinity)
    .filter((value): value is string => typeof value === "string")
    .join("\n");

const solutionText = flattenText(
  marketingSolutionSegments.map((item) => [
    item.title,
    item.audience,
    item.challenge,
    item.transformation,
    item.workflows,
    item.cta,
  ]),
);
const trustText = flattenText(
  marketingTrustFacts.map((item) => [item.title, item.text]),
);
const resultPhrasePattern =
  /(?:\b(?:меньше|больше|быстрее|легче|удобнее|лучше|эффективнее)\b|без(?:\s+\S+){0,2}\s+ручн\w*|не\s+(?:теря\w*|распада\w*|оста[её]\w*)|синхрониз\w*|станов\w+\s+управляем\w*|масштабир\w*|сокращ\w*|ускор\w*|оптимиз\w*|довод\w*\s+до\s+результат\w*)/iu;
const manualWorkPromisePattern =
  /без(?:\s+\S+){0,2}\s+ручн\w*\s+(?:свод\w*|сбор\w*|консолид\w*)/iu;

interface RouteRegistrySelection {
  capabilityIds: string[];
  packageSlugs: string[];
}

const solutionCapabilityIds = [
  ...new Set(
    marketingSolutionSegments.flatMap((segment) => segment.capabilityIds),
  ),
];
const solutionPackageSlugs = [
  ...new Set(
    marketingSolutionSegments.flatMap(
      (segment) => segment.recommendedPackageSlugs,
    ),
  ),
];

const routeRegistrySelections: Record<
  CoreMarketingSeoKey,
  RouteRegistrySelection
> = {
  home: {
    capabilityIds: [
      "project-control",
      "supply-chain",
      "finance-control",
      "pir-project-documentation",
      "quality-handover",
      "construction-safety",
      "machinery-labor",
      "change-control",
      "multi-org",
    ],
    packageSlugs: [
      "projects-processes",
      "planning-schedules",
      "estimates-norms",
      "quality-safety",
      "pto-handover",
      "supply-warehouse",
    ],
  },
  solutions: {
    capabilityIds: solutionCapabilityIds,
    packageSlugs: solutionPackageSlugs,
  },
  features: {
    capabilityIds: marketingCapabilityMatrix.map((item) => item.id),
    packageSlugs: [],
  },
  pricing: {
    capabilityIds: [],
    packageSlugs: commercialPackages.map((item) => item.slug),
  },
  integrations: { capabilityIds: [], packageSlugs: [] },
  contractors: { capabilityIds: [], packageSlugs: [] },
  developers: { capabilityIds: [], packageSlugs: [] },
  enterprise: {
    capabilityIds: ["multi-org", "finance-control", "project-control"],
    packageSlugs: [],
  },
  about: { capabilityIds: [], packageSlugs: [] },
  security: {
    capabilityIds: [],
    packageSlugs: [],
  },
  contact: { capabilityIds: [], packageSlugs: [] },
  blog: { capabilityIds: [], packageSlugs: [] },
};

const capabilityRecordsText = (
  capabilities: typeof marketingCapabilityMatrix,
): string =>
  flattenText(
    capabilities.map((item) => [
      item.title,
      item.businessContour,
      item.summary,
      item.publicClaim,
      item.audiences,
      item.outcomes,
      item.cta,
    ]),
  );

const selectedCapabilityText = (ids: string[]): string =>
  capabilityRecordsText(
    ids
      .map((id) =>
        marketingCapabilityMatrix.find((capability) => capability.id === id),
      )
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  );

const selectedPackageText = (slugs: string[]): string => {
  return flattenText(
    slugs.map((slug) => {
      const item = commercialPackages.find(
        (candidate) => candidate.slug === slug,
      );

      return item
        ? [
            item.name,
            item.description,
            item.bestFor,
            item.highlights,
            item.businessOutcomes,
          ]
        : [];
    }),
  );
};

const selectedRegistryText = (seoKey: CoreMarketingSeoKey): string => {
  const selection = routeRegistrySelections[seoKey];

  return flattenText([
    selectedCapabilityText(selection.capabilityIds),
    selectedPackageText(selection.packageSlugs),
  ]);
};

const routeOwnedDataText: Record<CoreMarketingSeoKey, string> = {
  home: flattenText([
    marketingHeroFacts.map((item) => [item.value, item.label, item.detail]),
    marketingLaunchSteps.map((item) => [item.title, item.description]),
    marketingFaqs.map((item) => [item.question, item.answer]),
    solutionText,
    selectedRegistryText("home"),
    trustText,
  ]),
  solutions: flattenText([solutionText, selectedRegistryText("solutions")]),
  features: flattenText([
    selectedRegistryText("features"),
    marketingAdvancedOffers.map((item) => [item.title, item.summary, item.cta]),
    marketingSecuritySections.map((item) => [
      item.title,
      item.description,
      item.bullets,
    ]),
    trustText,
  ]),
  pricing: flattenText([
    selectedRegistryText("pricing"),
    freeFoundationOffer.name,
    freeFoundationOffer.description,
    freeFoundationOffer.includes,
    fullSuiteOffer.name,
    `${commercialTerms.trialHours} часов`,
    `${commercialTerms.graceDays} дней`,
  ]),
  integrations: "",
  contractors: "",
  developers: "",
  enterprise: flattenText([selectedRegistryText("enterprise"), trustText]),
  about: flattenText([
    marketingAboutSections.map((item) => [
      item.title,
      item.description,
      item.bullets,
    ]),
    trustText,
    marketingCompany.location,
    marketingCompany.responseTime,
    marketingCompany.hours,
  ]),
  security: flattenText([
    capabilityRecordsText(marketingSecurityCapabilities),
    marketingSecuritySections.map((item) => [
      item.title,
      item.description,
      item.bullets,
    ]),
    trustText,
  ]),
  contact: flattenText([
    marketingCompany.email,
    marketingCompany.location,
    marketingCompany.responseTime,
    marketingCompany.hours,
  ]),
  blog: flattenText(
    Object.values(marketingBlogArticles).map((item) => [
      item.title,
      item.purpose,
    ]),
  ),
};

const readComponentUserFacingText = (componentPath: string): string => {
  const absolutePath = path.resolve(process.cwd(), componentPath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const sourceFile = ts.createSourceFile(
    absolutePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const values: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      return;
    }

    if (ts.isStringLiteralLike(node)) {
      const parent = node.parent;
      const jsxAttributeName =
        ts.isJsxAttribute(parent) && parent.name.getText(sourceFile);
      const ignoredJsxAttributes = new Set([
        "className",
        "id",
        "href",
        "to",
        "src",
        "key",
      ]);

      if (!jsxAttributeName || !ignoredJsxAttributes.has(jsxAttributeName)) {
        values.push(node.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return values.join("\n");
};

const collectProductionMarketingFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectProductionMarketingFiles(entryPath);
    if (!/\.tsx?$/u.test(entry.name) || /\.test\.tsx?$/u.test(entry.name) || entry.name === "marketingBlogNormalizer.ts") return [];
    return [entryPath];
  });

const readProductionMarketingUserFacingText = (filePath: string): string => {
  const source = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const values: string[] = [];
  const belongsToTechnicalSource = (node: ts.Node): boolean => {
    let current: ts.Node | undefined = node.parent;
    while (current && current !== sourceFile) {
      if (ts.isPropertyAssignment(current) && current.name.getText(sourceFile) === "sourceOfTruth") return true;
      current = current.parent;
    }
    return false;
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isStringLiteralLike(node) && !belongsToTechnicalSource(node)) values.push(node.text);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return values.join("\n");
};

describe("marketing content consistency", () => {
  it("publishes llms.txt as compact Markdown with links to known canonical routes", () => {
    const llms = fs.readFileSync(path.resolve(process.cwd(), "public/llms.txt"), "utf8");
    const requiredPaths = ["/", "/solutions", "/features", "/pricing", "/integrations", "/security", "/contact", "/blog"];
    const canonicalPaths = new Set(marketingSitemapRoutes.map(({ path: routePath }) => routePath));
    const linkedPaths = [...llms.matchAll(/\[[^\]]+\]\(https:\/\/1мост\.рф(\/[^)]*)\)/gu)].map(([, routePath]) => routePath);
    const proseLines = llms.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && !line.startsWith("-"));

    expect(llms).toMatch(/^# МОСТ$/m);
    expect(llms).toContain("## Основные страницы");
    expect(llms).toContain("## Решения");
    expect(llms).toContain("## Материалы");
    expect(proseLines).toHaveLength(2);
    expect(linkedPaths.length).toBeGreaterThanOrEqual(requiredPaths.length);
    expect(llms).not.toMatch(/ProHelper|prohelper\.pro/i);
    for (const requiredPath of requiredPaths) expect(linkedPaths, requiredPath).toContain(requiredPath);
    for (const linkedPath of linkedPaths) expect(canonicalPaths.has(linkedPath), linkedPath).toBe(true);
  });

  it("keeps forbidden legacy and hybrid wording out of production marketing text", () => {
    const productionDirectories = ["src/data/marketing", "src/pages/landing", "src/pages/resources"].map((directory) => path.resolve(process.cwd(), directory));
    const forbiddenPattern = /(?:ProHelper|prohelper\.pro|customer-(?:сценарий|контур)|AI-контур|ERP-контурe|Офисная триажировка|change orders?|change order строительство|Основной сценарий|Соседние сценарии и решения|смежный контур|релевантный сценарий|соседние контуры|офисный контур|Закупочный контур|Единый контур|Управленческий контур|складской контур|Мобильный контур|полевой контур|контур продукта|контур ПИР|контур охраны труда|контур изменений|пилотный контур|ответственный контур|Исполнение по контуру|общий контур|Контур персонала|производственный и расчетный контур|Бюджетный контур|рабочий контур|готовый контур|едином контуре|рабочем контуре|контур закупки|нужный контур|офисным контуром|Этот контур|Контур формирует|операционным контуром|любого контура|замена контуру|финансового контура|общего контура продукта|исполнительный контур|одном контуре|контур поддерживает|Контур (?:закрывает|связывает|устраняет|рассчитан|собирает|доступен|выделяет|помогает)|(?:^|[^\p{L}\p{N}_])ИД(?:$|[^\p{L}\p{N}_]))/iu;
    for (const filePath of productionDirectories.flatMap(collectProductionMarketingFiles)) {
      expect(readProductionMarketingUserFacingText(filePath), path.relative(process.cwd(), filePath)).not.toMatch(forbiddenPattern);
    }
  });

  it("owns the security capability selection in the marketing data layer", () => {
    const trustSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/data/marketing/trust.ts"),
      "utf8",
    );
    const securityPageSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/pages/company/SecurityPage.tsx"),
      "utf8",
    );

    expect(trustSource).toContain("export const marketingSecurityCapabilities");
    expect(securityPageSource).toContain("marketingSecurityCapabilities.map");
    expect(securityPageSource).not.toContain(
      "marketingCapabilityMatrix.slice(0, 5)",
    );
  });

  it("maps each route only to registry entries selected by its page", () => {
    const homeSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/pages/landing/HomePage.tsx"),
      "utf8",
    );
    const enterpriseSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/pages/solutions/EnterprisePage.tsx"),
      "utf8",
    );

    expect(routeRegistrySelections.home.packageSlugs).toEqual(
      marketingPackages.slice(0, 6).map((item) => item.slug),
    );
    expect(routeRegistrySelections.solutions).toEqual({
      capabilityIds: solutionCapabilityIds,
      packageSlugs: solutionPackageSlugs,
    });
    expect(routeRegistrySelections.features.capabilityIds).toEqual(
      marketingCapabilityMatrix.map((item) => item.id),
    );
    expect(routeRegistrySelections.pricing.packageSlugs).toEqual(
      commercialPackages.map((item) => item.slug),
    );
    expect(marketingSecurityCapabilities).toHaveLength(5);
    expect(marketingSecurityCapabilities.map((item) => item.id)).toEqual([
      "project-control",
      "site-requests",
      "supply-chain",
      "finance-control",
      "pir-project-documentation",
    ]);

    for (const id of routeRegistrySelections.home.capabilityIds) {
      expect(homeSource, `/: ${id}`).toContain(`"${id}"`);
    }
    for (const id of routeRegistrySelections.enterprise.capabilityIds) {
      expect(enterpriseSource, `/enterprise: ${id}`).toContain(`"${id}"`);
    }

    for (const seoKey of [
      "integrations",
      "contractors",
      "developers",
      "about",
      "security",
      "contact",
      "blog",
    ] as const) {
      expect(routeRegistrySelections[seoKey]).toEqual({
        capabilityIds: [],
        packageSlugs: [],
      });
    }
  });

  it("describes every capability claim and outcome through observable mechanisms or available data", () => {
    const observableDataPattern =
      /(?:карточк|статус|реестр|роль|команд|руководител|истори|сводк|панел|показател|отч[её]т|данн|документ|задач|заявк|плат[её]ж|акт|потребност|склад|материал|верси|замечан|комплект|дефект|инспекц|нарушен|предписан|допуск|техник|смен|наряд|выработк|сотрудник|бригад|запрос|изменен|претензи|организац|объект|прав|доступ|сопоставлен|сверк|профил|кандидат|приглашен|сигнал).*(?:содерж|показыва|связыва|связан|видит|хран|собира|фиксиру|доступ|привязан|получа|формиру|использ|относ|определя|переда|назнач|вед|отображ|группиру)/iu;

    for (const capability of marketingCapabilityMatrix) {
      const resultFields = [
        ["summary", capability.summary],
        ["publicClaim", capability.publicClaim],
        ...capability.outcomes.map((outcome, index) => [
          `outcomes[${index}]`,
          outcome,
        ]),
      ] as const;
      const fields = [
        ["publicClaim", capability.publicClaim],
        ...capability.outcomes.map((outcome, index) => [
          `outcomes[${index}]`,
          outcome,
        ]),
      ] as const;

      for (const [field, text] of resultFields) {
        expect(
          text,
          `${capability.id}: ${field} broad result denylist`,
        ).not.toMatch(resultPhrasePattern);
      }

      for (const [field, text] of fields) {
        expect(
          text,
          `${capability.id}: ${field} observable mechanism or data`,
        ).toMatch(observableDataPattern);
      }
    }
  });

  it("maps the 12 core routes to exact page owners with distinct concrete content", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const appSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/App.tsx"),
      "utf8",
    );

    expect(coreMarketingRouteContract.map(({ route }) => route)).toHaveLength(
      12,
    );

    for (const contract of coreMarketingRouteContract) {
      const {
        componentName,
        componentPath,
        requiredTerms,
        route,
        routeElement,
        seoKey,
      } = contract;
      const meta = marketingSeo[seoKey];
      const routeText = [
        meta.title,
        meta.description,
        meta.keywords ?? "",
        routeOwnedDataText[seoKey],
        readComponentUserFacingText(componentPath),
      ].join("\n");

      expect(appSource, `${route}: ${componentName}`).toContain(routeElement);
      expect(meta.title.length, `${route}: title`).toBeLessThanOrEqual(60);
      expect(
        meta.description.length,
        `${route}: description`,
      ).toBeGreaterThanOrEqual(70);
      expect(
        meta.description.length,
        `${route}: description`,
      ).toBeLessThanOrEqual(160);
      expect(titles.has(meta.title), `${route}: duplicate title`).toBe(false);
      expect(
        descriptions.has(meta.description),
        `${route}: duplicate description`,
      ).toBe(false);

      for (const term of requiredTerms) {
        expect(
          routeText.toLocaleLowerCase("ru-RU"),
          `${route}: ${term}`,
        ).toContain(term.toLocaleLowerCase("ru-RU"));
      }

      titles.add(meta.title);
      descriptions.add(meta.description);
    }
  });

  it("rejects guarantees, unsupported deadlines, old brand, hybrids, and unexplained jargon on core routes", () => {
    const guaranteedEffectPattern =
      /(?:не\s+теря(?:ется|ются)|сокращается\s+время|быстрее\s+(?:увидеть|оценить|получить)|отч[её]тность\s+переста[её]т\s+зависеть|ускор(?:яет|яется|ить)|гарантир(?:ует|ован))/iu;
    const percentagePattern =
      /(?:\d+(?:[.,]\d+)?\s*%|\bпроцент(?:а|ов|ы)?\b)/iu;
    const numericDeadlinePattern =
      /\b\d+\s*(?:минут(?:а|ы)?|час(?:а|ов)?|д(?:ень|ня|ней)|недел(?:я|и|ь)|месяц(?:а|ев)?)\b/iu;
    const oldBrandOrHybridPattern =
      /(?:prohelper|про\s*хелпер|про-хелпер|мост\s+(?:prohelper|про\s*хелпер)|(?:prohelper|про\s*хелпер)\s+мост)/iu;
    const unexplainedJargonPattern =
      /(?:\bИД\b|\bchange orders?\b|Доверительный слой|cookie-consent|(?<!формат )\bIFC\b|(?<!перечень замечаний при при[её]мке \()punch-list)/iu;

    for (const { componentPath, route, seoKey } of coreMarketingRouteContract) {
      const meta = marketingSeo[seoKey];
      const routeText = [
        meta.title,
        meta.description,
        meta.keywords ?? "",
        routeOwnedDataText[seoKey],
        readComponentUserFacingText(componentPath),
      ].join("\n");

      expect(routeText, `${route}: guaranteed effect`).not.toMatch(
        guaranteedEffectPattern,
      );
      expect(routeText, `${route}: manual-work result promise`).not.toMatch(
        manualWorkPromisePattern,
      );
      expect(routeText, `${route}: percentage`).not.toMatch(percentagePattern);
      expect(routeText, `${route}: old brand or hybrid`).not.toMatch(
        oldBrandOrHybridPattern,
      );
      expect(
        routeText,
        `${route}: unexplained jargon ${routeText.match(unexplainedJargonPattern)?.[0] ?? ""}`,
      ).not.toMatch(unexplainedJargonPattern);

      if (route !== "/pricing") {
        expect(routeText, `${route}: numeric deadline`).not.toMatch(
          numericDeadlinePattern,
        );
      }
    }
  });

  it("marks document exchange agreement as integration setup, not a ready product capability", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/pages/product/IntegrationsPage.tsx"),
      "utf8",
    );
    const documentExchangeCard = source.match(
      /name:\s*"Документы для обмена"[\s\S]*?status:\s*"([^"]+)"/u,
    );

    expect(documentExchangeCard?.[1]).toBe("Этап настройки");
    expect(documentExchangeCard?.[1]).not.toBe("В продукте");
  });

  it("keeps construction CRM page focused on CRM semantics", () => {
    expect(marketingSeo["construction-crm"].title.toLowerCase()).toContain(
      "crm",
    );
    expect(
      marketingSeoLandingPages["construction-crm"].title.toLowerCase(),
    ).toContain("crm");
    expect(
      marketingSeoLandingPages["construction-crm"].title.toLowerCase(),
    ).not.toContain("erp");
  });

  it("keeps construction ERP page focused on ERP semantics", () => {
    expect(marketingSeo["construction-erp"].title.toLowerCase()).toContain(
      "erp",
    );
    expect(
      marketingSeoLandingPages["construction-erp"].title.toLowerCase(),
    ).toContain("erp");
  });

  it("detects a duplicated section even when the same text is split into short strings", () => {
    const duplicates = findSemanticSectionDuplicates({
      "/route-a": {
        hero: [
          "Заявка на материал проходит проверку потребности.",
          "Снабженец выбирает поставщика, а кладовщик фиксирует приход на объект.",
        ],
      },
      "/route-b": {
        hero: [
          "Заявка на материал проходит",
          "проверку потребности. Снабженец выбирает поставщика,",
          "а кладовщик фиксирует приход на объект.",
        ],
      },
    });

    expect(duplicates).toEqual([
      expect.stringContaining("/route-a/hero <-> /route-b/hero"),
    ]);
  });

  it("detects a fixed common fragment moved between diluted section types", () => {
    const sharedFragment =
      "команда фиксирует запрос по объекту назначает ответственного сохраняет дату решение и подтверждение чтобы руководитель видел статус без поиска в переписке";
    const duplicates = findSemanticSectionDuplicates({
      "/route-a": {
        problem: [
          "Материалы поступают на несколько участков, поэтому кладовщик сначала сверяет поставку, количество, единицы измерения и место хранения по заявке.",
          sharedFragment,
          "После этого снабженец отдельно проверяет расхождения и передаёт документы в финансовую службу для дальнейшей обработки и сверки.",
        ],
      },
      "/route-b": {
        faq: [
          "Как инженерная служба отслеживает согласование документа, если над выпуском одновременно работают проектировщик, заказчик и технический специалист?",
          sharedFragment,
          "История версии остаётся доступной в архиве, а участники получают только те материалы, которые разрешены их ролью на выбранном объекте.",
        ],
      },
    });

    expect(duplicates).toEqual([
      expect.stringContaining("/route-a/problem <-> /route-b/faq"),
    ]);
  });

  it("does not treat generic navigation labels alone as semantic content", () => {
    const duplicates = findSemanticSectionDuplicates({
      "/route-a": {
        relatedLinks: [{ label: "Подробнее", href: "/route-a" }],
      },
      "/route-b": {
        relatedLinks: [{ label: "Подробнее", href: "/route-b" }],
      },
    });

    expect(duplicates).toEqual([]);
  });

  it("does not flag subject-specific sections as semantic duplicates", () => {
    const duplicates = findSemanticSectionDuplicates({
      "/materials": {
        workflow: [
          "Кладовщик принимает поставку, сверяет количество и фиксирует приход.",
          "После выдачи в работу система показывает остаток материала на объекте.",
        ],
      },
      "/documents": {
        workflow: [
          "Инженер загружает новую версию документа и направляет её на согласование.",
          "После проверки утверждённая версия попадает в архив с историей доступа.",
        ],
      },
    });

    expect(duplicates).toEqual([]);
  });

  it("does not repeat semantic sections between all commercial cluster pages", () => {
    const pageKeys = commercialClusterPageKeys;
    const sectionsByRoute = Object.fromEntries(
      pageKeys.map((pageKey) => [
        `/${pageKey}`,
        collectSemanticSections(marketingSeoLandingPages[pageKey]),
      ]),
    );
    const duplicates = findSemanticSectionDuplicates(sectionsByRoute);

    expect(duplicates, duplicates.join("\n")).toEqual([]);
  });

  it("keeps SEO factories structural and free from route-specific prose", () => {
    const factoryFiles = [
      "src/data/marketing/seoPages.ts",
      "src/data/marketing/seoProductPages.ts",
    ];

    for (const factoryFile of factoryFiles) {
      const sourceFile = ts.createSourceFile(
        factoryFile,
        fs.readFileSync(path.resolve(process.cwd(), factoryFile), "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      const factories = sourceFile.statements.filter(
        (statement): statement is ts.VariableStatement =>
          ts.isVariableStatement(statement) &&
          statement.declarationList.declarations.some(
            ({ name }) =>
              ts.isIdentifier(name) &&
              ["createOperationalSeoPage", "createProductSeoPage"].includes(
                name.text,
              ),
          ),
      );

      expect(factories, factoryFile).toHaveLength(1);
      const factoryText = factories[0].getText(sourceFile);
      expect(factoryText, `${factoryFile}: user-facing prose`).not.toMatch(
        /[А-Яа-яЁё]/u,
      );
      expect(factoryText, `${factoryFile}: route branch`).not.toMatch(
        /config\.path\s*===|productBlogArticlesByPath/u,
      );
      expect(factoryText, `${factoryFile}: generated semantics`).not.toMatch(
        /\.map\(|\.slice\(|\.toLowerCase\(|createProcessComparisonFromSource/u,
      );
    }

    const seoPagesSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/data/marketing/seoPages.ts"),
      "utf8",
    );
    expect(seoPagesSource).not.toContain("createProcessComparisonFromSource");
  });

  it("keeps mobile and AI process comparisons fully declarative", () => {
    expect(marketingSeoLandingPages["mobile-app"].processComparison).toEqual({
      eyebrow: "Работа с телефона",
      title: "Полевое действие сохраняет связь с объектом",
      description:
        "Сотрудник фиксирует событие на телефоне, а офис получает автора, время, объект и назначенное действие.",
      metrics: [
        {
          value: "Карточка объекта",
          label: "Полевой факт",
          description: "Фото, замечание и статус относятся к выбранной задаче.",
        },
        {
          value: "Ответственная роль",
          label: "Следующий шаг",
          description:
            "Запись передаётся участнику с доступом к этому процессу.",
        },
      ],
      note: "Доступность функций зависит от роли пользователя и качества связи.",
    });
    expect(marketingSeoLandingPages["ai-estimates"].processComparison).toEqual({
      eyebrow: "Разбор чертежа",
      title: "Предварительный результат передаётся сметчику",
      description:
        "Система выделяет доступные элементы чертежа и формирует рабочую структуру для экспертной проверки.",
      metrics: [
        {
          value: "Исходный документ",
          label: "Основание",
          description: "Результат сохраняет связь с загруженным чертежом.",
        },
        {
          value: "Экспертная проверка",
          label: "Обязательный этап",
          description: "Сметчик сверяет позиции, объёмы и единицы измерения.",
        },
      ],
      note: "Предварительный разбор не является готовой сметой.",
    });
  });

  it("keeps related links unique on every commercial cluster page", () => {
    for (const pageKey of commercialClusterPageKeys) {
      const links = marketingSeoLandingPages[pageKey].relatedLinks;
      expect(new Set(links.map(({ href }) => href)).size, pageKey).toBe(
        links.length,
      );
    }
  });

  it("uses plain Russian and rejects promises across all commercial cluster pages", () => {
    const forbiddenPattern =
      /(?:Офисная триажировка|change orders?|change order строительство|customer-|AI-контур|ERP-контур|\bИД\b|ускор(?:яет|ить|ение)|сокращ(?:ает|ение)|гарантир(?:ует|ован)|\d+(?:[.,]\d+)?\s*%)/iu;

    for (const pageKey of commercialClusterPageKeys) {
      const pageText = collectSectionStrings(
        marketingSeoLandingPages[pageKey],
      ).join(" ");
      expect(pageText, pageKey).not.toMatch(forbiddenPattern);
    }

    const firstUseContracts = [
      [
        "construction-safety",
        "охрана труда, промышленная и экологическая безопасность",
        "HSE",
      ],
      ["change-control", "запрос информации (RFI)", "RFI"],
      ["pir-project-documentation", "формата отраслевой модели (IFC)", "IFC"],
      [
        "handover-acceptance",
        "перечень замечаний при приёмке (punch-list)",
        "punch-list",
      ],
      ["construction-documents", "электронной подписи (ЭП)", "ЭП"],
    ] as const;

    for (const [pageKey, expansion, abbreviation] of firstUseContracts) {
      const pageText = collectSectionStrings(marketingSeoLandingPages[pageKey])
        .join(" ")
        .toLocaleLowerCase("ru-RU");
      const normalizedExpansion = expansion.toLocaleLowerCase("ru-RU");
      const normalizedAbbreviation = abbreviation.toLocaleLowerCase("ru-RU");
      expect(pageText, `${pageKey}: expansion`).toContain(normalizedExpansion);
      expect(
        pageText.indexOf(normalizedExpansion),
        `${pageKey}: first use`,
      ).toBeLessThanOrEqual(pageText.indexOf(normalizedAbbreviation));
    }
    expect(
      collectSectionStrings(marketingSeoLandingPages["1c-integration"]).join(
        " ",
      ),
    ).toContain("1С");
  });

  it("publishes complete and distinct content for the 15 rewritten routes", () => {
    for (const [pageKey, requiredTerms] of Object.entries(
      rewrittenClusterContracts,
    )) {
      const page = marketingSeoLandingPages[pageKey];
      const pageText = collectSectionStrings(collectSemanticSections(page))
        .join(" ")
        .toLocaleLowerCase("ru-RU");

      expect(page, pageKey).toBeDefined();
      expect(
        page.processComparison.metrics.length,
        `${pageKey}: process comparison`,
      ).toBeGreaterThan(0);
      expect(
        page.workflow?.stages.length,
        `${pageKey}: workflow`,
      ).toBeGreaterThanOrEqual(4);
      expect(
        page.roleViews.length,
        `${pageKey}: role views`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        page.relatedLinks.length,
        `${pageKey}: related links`,
      ).toBeGreaterThanOrEqual(3);
      expect(page.blogLinks.length, `${pageKey}: blog links`).toBeGreaterThan(
        0,
      );
      expect(page.faq.length, `${pageKey}: faq`).toBeGreaterThanOrEqual(3);
      expect(
        page.contactHighlights.length,
        `${pageKey}: next step`,
      ).toBeGreaterThanOrEqual(2);

      for (const term of requiredTerms) {
        expect(pageText, `${pageKey}: ${term}`).toContain(term);
      }
    }
  });

  it("keeps all sitemap metadata unique and within search snippet limits", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    expect(marketingSitemapRoutes).toHaveLength(35);

    for (const { pageKey, path: route } of marketingSitemapRoutes) {
      const meta = marketingSeo[pageKey];

      expect(meta, `${route}: metadata`).toBeDefined();
      expect(meta.title.length, `${route}: title`).toBeLessThanOrEqual(60);
      expect(
        meta.description.length,
        `${route}: description`,
      ).toBeGreaterThanOrEqual(70);
      expect(
        meta.description.length,
        `${route}: description`,
      ).toBeLessThanOrEqual(160);
      expect(titles.has(meta.title), `${route}: duplicate title`).toBe(false);
      expect(
        descriptions.has(meta.description),
        `${route}: duplicate description`,
      ).toBe(false);
      titles.add(meta.title);
      descriptions.add(meta.description);
    }
  });

  it("keeps CRM and ERP anchors on their respective routes", () => {
    expect(marketingCommercialLandingLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "CRM для строительной компании",
          href: "/construction-crm",
        }),
        expect.objectContaining({
          label: "ERP для строительства",
          href: "/construction-erp",
        }),
      ]),
    );
  });

  it("states that procurement and warehouse accounting are different processes", () => {
    const faq = marketingSeoLandingPages["material-accounting"].faq.find(
      ({ question }) => question === "Закупка и складской учёт отличаются?",
    );

    expect(faq?.answer).toBe(
      "Да. Закупка ведёт потребность до поставки, а складской учёт отражает приход и последующее движение.",
    );
  });

  it("expands the first public use of the electronic signature abbreviation", () => {
    const page = marketingSeoLandingPages["construction-documents"];

    expect(page.description).toContain("электронной подписи (ЭП)");
    expect(page.contactHighlights.join(" ")).toContain("ЭП");
    expect(page.faq.map(({ answer }) => answer).join(" ")).toContain("ЭП");
  });

  it("has a clear public contact channel", () => {
    expect(marketingCompany.email).toMatch(/@1мост\.рф$/);
    expect(marketingCompany.responseTime.length).toBeGreaterThan(0);
  });

  it("publishes new module capabilities without retired internal module slugs", () => {
    const capabilityIds = marketingCapabilityMatrix.map((item) => item.id);
    expect(capabilityIds).toEqual(
      expect.arrayContaining([
        "pir-project-documentation",
        "quality-handover",
        "construction-safety",
        "machinery-labor",
        "workforce-control",
        "change-control",
      ]),
    );

    const invalidModuleSlugs = [
      "acts",
      "advance-requests",
      "estimates",
      "engineering-documents",
      "analytics",
      "reporting",
      "holding-dashboard",
    ];
    const publishedModuleSlugs = [
      ...marketingCapabilityMatrix.flatMap((item) => item.moduleSlugs),
      ...marketingPackages.flatMap((item) => item.moduleSlugs),
    ];

    for (const invalidSlug of invalidModuleSlugs) {
      expect(publishedModuleSlugs).not.toContain(invalidSlug);
    }
  });

  it("keeps new SEO module pages connected to meta, sitemap, and landing content", () => {
    const expectedPageKeys = [
      "pir-project-documentation",
      "construction-safety",
      "construction-quality-control",
      "handover-acceptance",
      "machinery-and-labor",
      "change-control",
    ];
    const sitemapPageKeys = new Set(
      marketingSitemapRoutes.map((route) => route.pageKey),
    );

    for (const pageKey of expectedPageKeys) {
      const page = marketingSeoLandingPages[pageKey];

      expect(marketingSeo[pageKey]).toBeDefined();
      expect(marketingSeo[pageKey].noIndex).not.toBe(true);
      expect(sitemapPageKeys.has(pageKey)).toBe(true);
      expect(page.path).toBe(
        marketingSitemapRoutes.find((route) => route.pageKey === pageKey)?.path,
      );
      expect(page.title.length).toBeGreaterThan(20);
      expect(page.supportingQueries.length).toBeGreaterThanOrEqual(4);
      expect(page.relatedLinks.length).toBeGreaterThanOrEqual(3);
      expect(page.faq.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("publishes product workflow pages with complete SEO and internal-link contracts", () => {
    const expectedPages = [
      [
        "construction-procurement",
        "/construction-procurement",
        "Заявка на закупку",
      ],
      ["site-requests", "/site-requests", "Проверка заявки офисом"],
      ["workforce-management", "/workforce-management", "Смены и время"],
      [
        "construction-payments",
        "/construction-payments",
        "Платежный календарь",
      ],
      ["1c-integration", "/1c-integration", "Сопоставление данных"],
      [
        "contractor-marketplace",
        "/contractor-marketplace",
        "Поиск подрядчиков",
      ],
      ["project-pulse", "/project-pulse", "Сигналы риска"],
    ] as const;
    const sitemapPageKeys = new Set(
      marketingSitemapRoutes.map((route) => route.pageKey),
    );

    for (const [pageKey, path, workflowAnchor] of expectedPages) {
      const page = marketingSeoLandingPages[pageKey];

      expect(marketingSeo[pageKey]).toBeDefined();
      expect(marketingSeo[pageKey].noIndex).not.toBe(true);
      expect(page.path).toBe(path);
      expect(sitemapPageKeys).toContain(pageKey);
      expect(page.supportingQueries.length).toBeGreaterThanOrEqual(4);
      expect(page.roleViews.length).toBeGreaterThanOrEqual(3);
      expect(page.relatedLinks.length).toBeGreaterThanOrEqual(3);
      expect(page.faq.length).toBeGreaterThanOrEqual(3);
      expect(page.workflow?.stages.length).toBeGreaterThanOrEqual(4);
      expect(page.workflow?.stages.map((stage) => stage.label)).toContain(
        workflowAnchor,
      );
    }
  });

  it("keeps published 1C, marketplace, and Project Pulse claims tied to verified product contours", () => {
    const capabilities = new Map(
      marketingCapabilityMatrix.map((capability) => [
        capability.id,
        capability,
      ]),
    );
    const finance = capabilities.get("finance-control");
    const integration = capabilities.get("1c-integration");
    const marketplace = capabilities.get("contractor-marketplace");
    const pulse = capabilities.get("project-pulse");

    expect(finance?.sourceOfTruth).toContain(
      "prohelper/app/BusinessModules/Core/Payments",
    );
    expect(integration?.maturity).toBe("early_access");
    expect(integration?.sourceOfTruth).toEqual(
      expect.arrayContaining([
        "prohelper/app/BusinessModules/Addons/Integrations",
        "prohelper/app/Models/OneCIntegrationProfile.php",
        "prohelper/app/Services/AccountingIntegrationService.php",
      ]),
    );
    for (const source of integration?.sourceOfTruth ?? []) {
      expect(workspaceSourceExists(source)).toBe(true);
    }
    expect(
      marketplace?.sourceOfTruth.some((source) =>
        source.includes("ContractorMarketplace"),
      ),
    ).toBe(true);
    expect(pulse?.maturity).toBe("early_access");
    expect(pulse?.sourceOfTruth).toContain(
      "prohelper/app/BusinessModules/Features/AIAssistant",
    );
  });

  it("keeps solution segment references resolvable", () => {
    const capabilityIds = new Set(
      marketingCapabilityMatrix.map((item) => item.id),
    );
    const packageSlugs = new Set(marketingPackages.map((item) => item.slug));

    for (const segment of marketingSolutionSegments) {
      expect(segment.capabilityIds.length).toBeGreaterThan(0);
      expect(segment.recommendedPackageSlugs.length).toBeGreaterThan(0);

      for (const capabilityId of segment.capabilityIds) {
        expect(capabilityIds.has(capabilityId)).toBe(true);
      }

      for (const packageSlug of segment.recommendedPackageSlugs) {
        expect(packageSlugs.has(packageSlug)).toBe(true);
      }
    }
  });

  it("keeps landing link collections pointed at published SEO pages", () => {
    const landingPagePaths = new Set(
      Object.values(marketingSeoLandingPages).map((page) => page.path),
    );
    const linkCollections = [
      marketingCommercialLandingLinks,
      marketingRoleLandingLinks,
      marketingModuleLandingLinks,
    ];

    for (const collection of linkCollections) {
      for (const link of collection) {
        expect(landingPagePaths.has(link.href)).toBe(true);
      }
    }
  });

  it("keeps procurement intent separate from material accounting anchors", () => {
    const materialAccountingLinks = [
      ...marketingCommercialLandingLinks,
      ...marketingModuleLandingLinks,
    ].filter((link) => link.href === "/material-accounting");
    const procurementLinks = [
      ...marketingCommercialLandingLinks,
      ...marketingModuleLandingLinks,
    ].filter((link) => link.label === "Строительные закупки");

    expect(materialAccountingLinks.map((link) => link.label)).toContain(
      "Учет материалов",
    );
    expect(materialAccountingLinks.map((link) => link.label)).not.toContain(
      "Строительные закупки",
    );
    expect(procurementLinks).toEqual([
      expect.objectContaining({ href: "/construction-procurement" }),
    ]);
  });

  it("resolves article-title links only through the published blog registry", () => {
    const publishedTitleByHref = new Map<string, string>(
      Object.values(marketingBlogArticles).map((article) => [
        article.href,
        article.title,
      ]),
    );
    const blogLinks = Object.values(marketingSeoLandingPages).flatMap(
      (page) => page.blogLinks,
    );

    for (const link of blogLinks) {
      if (link.href === marketingPaths.blog) {
        expect(["Все статьи", "Блог МОСТ"]).toContain(link.label);
        continue;
      }

      expect(publishedTitleByHref.get(link.href)).toBe(link.label);
    }
  });
});
