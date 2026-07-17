import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { marketingBlogArticles } from "./blogArticles";
import {
  marketingCapabilityMatrix,
  marketingCommercialLandingLinks,
  marketingCompany,
  marketingModuleLandingLinks,
  marketingPackages,
  marketingPaths,
  marketingRoleLandingLinks,
  marketingSeo,
  marketingSeoLandingPages,
  marketingSitemapRoutes,
  marketingSolutionSegments,
} from "./index";

const workspaceSourceExists = (source: string): boolean =>
  [
    path.resolve(process.cwd(), "..", source),
    path.resolve(process.cwd(), "..", "..", "..", source),
  ].some((candidate) => fs.existsSync(candidate));

const coreMarketingRouteContract = [
  ["/", "home", ["объект", "задач", "документ", "снабжен", "финанс"]],
  ["/solutions", "solutions", ["тип компании", "роль"]],
  ["/features", "features", ["возможност", "функци"]],
  ["/pricing", "pricing", ["пакет", "пробн", "подключ"]],
  [
    "/integrations",
    "integrations",
    ["1С", "справочник", "документ", "настройк"],
  ],
  [
    "/contractors",
    "contractors",
    ["объект", "бригад", "объём", "документ", "оплат"],
  ],
  ["/developers", "developers", ["портфел", "срок", "замечан", "отчётност"]],
  ["/enterprise", "enterprise", ["организац", "объект", "прав", "сводн"]],
  ["/about", "about", ["создан", "принцип"]],
  ["/security", "security", ["рол", "доступ", "файл", "истори"]],
  ["/contact", "contact", ["заявк", "следующ"]],
  ["/blog", "blog", ["стать", "управлен", "строй"]],
] as const;

const coreMarketingRouteSources: Record<
  (typeof coreMarketingRouteContract)[number][1],
  string[]
> = {
  home: ["src/pages/landing/HomePage.tsx", "src/data/marketing/home.ts"],
  solutions: [
    "src/pages/landing/SolutionsPage.tsx",
    "src/data/marketing/solutions.ts",
  ],
  features: [
    "src/pages/landing/FeaturesPage.tsx",
    "src/data/marketing/capabilities.ts",
  ],
  pricing: ["src/pages/landing/PricingPage.tsx"],
  integrations: ["src/pages/product/IntegrationsPage.tsx"],
  contractors: ["src/pages/solutions/ContractorsPage.tsx"],
  developers: ["src/pages/solutions/DevelopersPage.tsx"],
  enterprise: ["src/pages/solutions/EnterprisePage.tsx"],
  about: ["src/pages/company/AboutPage.tsx", "src/data/marketing/trust.ts"],
  security: [
    "src/pages/company/SecurityPage.tsx",
    "src/data/marketing/trust.ts",
  ],
  contact: ["src/pages/company/ContactPage.tsx"],
  blog: ["src/components/blog/public/BlogPublicPage.tsx"],
};

describe("marketing content consistency", () => {
  it("keeps the 12 core routes distinct, concrete, and free from the retired brand", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    expect(coreMarketingRouteContract.map(([route]) => route)).toHaveLength(12);

    for (const [, seoKey, requiredTerms] of coreMarketingRouteContract) {
      const meta = marketingSeo[seoKey];
      const source = coreMarketingRouteSources[seoKey]
        .map((file) =>
          fs.readFileSync(path.resolve(process.cwd(), file), "utf8"),
        )
        .join("\n");

      expect(meta.title.length, `${seoKey}: title`).toBeLessThanOrEqual(60);
      expect(
        meta.description.length,
        `${seoKey}: description`,
      ).toBeGreaterThanOrEqual(70);
      expect(
        meta.description.length,
        `${seoKey}: description`,
      ).toBeLessThanOrEqual(160);
      expect(titles.has(meta.title), `${seoKey}: duplicate title`).toBe(false);
      expect(
        descriptions.has(meta.description),
        `${seoKey}: duplicate description`,
      ).toBe(false);
      expect(
        `${meta.title}\n${meta.description}\n${meta.keywords ?? ""}`,
      ).not.toMatch(/prohelper/i);

      for (const term of requiredTerms) {
        expect(
          source.toLocaleLowerCase("ru-RU"),
          `${seoKey}: ${term}`,
        ).toContain(term.toLocaleLowerCase("ru-RU"));
      }

      titles.add(meta.title);
      descriptions.add(meta.description);
    }
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
