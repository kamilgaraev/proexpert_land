import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
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

describe("marketing content consistency", () => {
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
      ["site-requests", "/site-requests", "Офисная триажировка"],
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
