import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  marketingNoIndexExactPaths,
  marketingNoIndexPaths,
  marketingRedirectRoutes,
  marketingSitemapRoutes,
} from "./siteIndex";

const productionDirectoryPaths = [
  "src/data/marketing",
  "src/pages/landing",
  "src/pages/resources",
  "src/components/marketing",
  "src/components/blog/public",
  "src/components/landing",
];

const requiredRecursiveManifestPaths = [
  "src/components/marketing/blocks/AdminProductDemo.tsx",
  "src/components/blog/public/BlogCategoryPage.tsx",
  "src/components/landing/Footer.tsx",
  "src/pages/resources/DocsPage.tsx",
];

const publicBlogDynamicPaths = [
  "/blog/preview/:articleId",
  "/blog/category/:slug",
  "/blog/tag/:slug",
  "/blog/:slug",
];

const forbiddenPublicWording = new RegExp(
  [
    "ProHelper",
    "prohelper\\.pro",
    "customer-(?:сценарий|контур)",
    "AI-контур",
    "ERP-контурe",
    "Офисная триажировка",
    "change orders?",
    "change order строительство",
    "Основной сценарий",
    "Соседние сценарии и решения",
    "смежный контур",
    "релевантный сценарий",
    "соседние контуры",
    "офисный контур",
    "Закупочный контур",
    "Единый контур",
    "Управленческий контур",
    "складской контур",
    "Мобильный контур",
    "полевой контур",
    "цифров(?:ой|ом) контур",
    "контур продукта",
    "контур ПИР",
    "контур охраны труда",
    "контур изменений",
    "пилотный контур",
    "ответственный контур",
    "Исполнение по контуру",
    "общий контур",
    "Контур персонала",
    "производственный и расчетный контур",
    "Бюджетный контур",
    "рабочий контур",
    "готовый контур",
    "едином контуре",
    "рабочем контуре",
    "контур закупки",
    "нужный контур",
    "офисным контуром",
    "Этот контур",
    "Контур формирует",
    "операционным контуром",
    "любого контура",
    "замена контуру",
    "финансового контура",
    "общего контура продукта",
    "исполнительный контур",
    "одном контуре",
    "контур поддерживает",
    "Роли и сценарии",
    "Популярные сценарии",
    "ваш сценарий",
    "Контур (?:закрывает|связывает|устраняет|рассчитан|собирает|доступен|выделяет|помогает)",
    "(?:^|[^\\p{L}\\p{N}_])ИД(?:$|[^\\p{L}\\p{N}_])",
  ].join("|"),
  "iu",
);

const collectProductionFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectProductionFiles(entryPath);
    }

    if (
      !/\.tsx?$/u.test(entry.name) ||
      /\.test\.tsx?$/u.test(entry.name) ||
      /\.fixture\.tsx?$/u.test(entry.name) ||
      entry.name === "marketingBlogNormalizer.ts"
    ) {
      return [];
    }

    return [entryPath];
  });

const isTechnicalSourceLiteral = (
  node: ts.Node,
  sourceFile: ts.SourceFile,
): boolean => {
  let current: ts.Node | undefined = node.parent;

  while (current && current !== sourceFile) {
    if (
      ts.isPropertyAssignment(current) &&
      current.name.getText(sourceFile) === "sourceOfTruth"
    ) {
      return true;
    }
    current = current.parent;
  }

  return false;
};

const readUserFacingText = (filePath: string): string => {
  const source = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const values: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      return;
    }

    if (
      ts.isStringLiteralLike(node) &&
      !isTechnicalSourceLiteral(node, sourceFile)
    ) {
      values.push(node.text);
    } else if (
      ts.isTemplateLiteralToken(node) &&
      !isTechnicalSourceLiteral(node, sourceFile)
    ) {
      values.push(node.text);
    } else if (ts.isJsxText(node)) {
      const normalizedText = node.text.replace(/\s+/gu, " ").trim();

      if (normalizedText) {
        values.push(normalizedText);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return values.join("\n");
};

interface PublicRouteOwner {
  routePath: string;
  componentName: string;
  filePath: string | null;
}

const resolveImportedModulePath = (moduleSpecifier: string): string | null => {
  const aliases = [
    ["@pages/", "src/pages/"],
    ["@components/", "src/components/"],
    ["@/", "src/"],
  ] as const;
  const alias = aliases.find(([prefix]) => moduleSpecifier.startsWith(prefix));

  if (!alias) {
    return null;
  }

  const [prefix, replacement] = alias;
  const relativeModulePath = `${replacement}${moduleSpecifier.slice(prefix.length)}`;
  const candidates = [
    `${relativeModulePath}.tsx`,
    `${relativeModulePath}.ts`,
    `${relativeModulePath}/index.tsx`,
    `${relativeModulePath}/index.ts`,
  ];
  const resolvedPath = candidates.find((candidate) =>
    fs.existsSync(path.resolve(process.cwd(), candidate)),
  );

  return resolvedPath ?? null;
};

const readJsxComponentName = (
  expression: ts.Expression | undefined,
): string | null => {
  if (expression && ts.isJsxSelfClosingElement(expression)) {
    return ts.isIdentifier(expression.tagName) ? expression.tagName.text : null;
  }

  if (expression && ts.isJsxElement(expression)) {
    return ts.isIdentifier(expression.openingElement.tagName)
      ? expression.openingElement.tagName.text
      : null;
  }

  return null;
};

const deriveAllRouteOwners = (): PublicRouteOwner[] => {
  const appPath = path.resolve(process.cwd(), "src/App.tsx");
  const source = fs.readFileSync(appPath, "utf8");
  const sourceFile = ts.createSourceFile(
    appPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const importedModuleByComponent = new Map<string, string>();
  const owners: PublicRouteOwner[] = [];

  sourceFile.forEachChild((node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.importClause?.name
    ) {
      importedModuleByComponent.set(
        node.importClause.name.text,
        node.moduleSpecifier.text,
      );
    }

    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      for (const importedName of node.importClause.namedBindings.elements) {
        importedModuleByComponent.set(
          importedName.name.text,
          node.moduleSpecifier.text,
        );
      }
    }
  });

  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxSelfClosingElement(node) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === "Route"
    ) {
      const attributes = new Map(
        node.attributes.properties
          .filter(ts.isJsxAttribute)
          .flatMap((attribute) =>
            ts.isIdentifier(attribute.name)
              ? [[attribute.name.text, attribute] as const]
              : [],
          ),
      );
      const pathAttribute = attributes.get("path");
      const elementAttribute = attributes.get("element");
      const routePath =
        pathAttribute?.initializer &&
        ts.isStringLiteral(pathAttribute.initializer)
          ? pathAttribute.initializer.text
          : null;
      const componentName =
        elementAttribute?.initializer &&
        ts.isJsxExpression(elementAttribute.initializer)
          ? readJsxComponentName(elementAttribute.initializer.expression)
          : null;

      if (routePath && componentName) {
        const moduleSpecifier = importedModuleByComponent.get(componentName);
        const filePath = moduleSpecifier
          ? resolveImportedModulePath(moduleSpecifier)
          : null;

        owners.push({ routePath, componentName, filePath });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return owners;
};

const internalPublicRoutePrefixes = [
  "/dashboard",
  "/landing/multi-organization",
  "/invitations",
  "/supplier-requests",
];

const publicRedirectAliases = new Set(
  marketingRedirectRoutes.map(({ path: routePath }) => routePath),
);

const isEligiblePublicRoutePath = (routePath: string): boolean => {
  if (!routePath.startsWith("/") || routePath === "/*") {
    return false;
  }

  if (
    marketingNoIndexExactPaths.has(routePath) ||
    publicRedirectAliases.has(routePath)
  ) {
    return false;
  }

  return !internalPublicRoutePrefixes.some(
    (prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`),
  );
};

const expectedPublicRoutePaths = new Set([
  ...marketingSitemapRoutes.map(({ path: routePath }) => routePath),
  ...marketingNoIndexPaths,
  ...publicBlogDynamicPaths,
]);

const allRouteOwners = deriveAllRouteOwners();
const activePublicRouteOwners = allRouteOwners.filter(({ routePath }) =>
  isEligiblePublicRoutePath(routePath),
);

const recursiveProductionFiles = productionDirectoryPaths.flatMap((directory) =>
  collectProductionFiles(path.resolve(process.cwd(), directory)),
);

const productionFiles = [
  ...new Set([
    ...recursiveProductionFiles,
    ...activePublicRouteOwners.flatMap(({ filePath }) =>
      filePath ? [path.resolve(process.cwd(), filePath)] : [],
    ),
  ]),
];

describe("public marketing source content", () => {
  it("extracts App route owners before applying public eligibility", () => {
    const allRoutePaths = allRouteOwners.map(({ routePath }) => routePath);

    expect(allRoutePaths).toContain("/blog/:slug");
    expect(allRoutePaths).toContain("/login");
    expect(isEligiblePublicRoutePath("/blog/:slug")).toBe(true);
    expect(isEligiblePublicRoutePath("/login")).toBe(false);
    expect(isEligiblePublicRoutePath("/dashboard/projects")).toBe(false);
    expect(isEligiblePublicRoutePath("/landing/multi-organization")).toBe(
      false,
    );
  });

  it("classifies an unregistered public-like route independently", () => {
    const unregisteredRoute = "/new-public-feature";
    const syntheticActualPaths = new Set([
      ...expectedPublicRoutePaths,
      unregisteredRoute,
    ]);

    expect(isEligiblePublicRoutePath(unregisteredRoute)).toBe(true);
    expect(expectedPublicRoutePaths.has(unregisteredRoute)).toBe(false);
    expect(syntheticActualPaths).not.toEqual(expectedPublicRoutePaths);
  });

  it("collects normalized JSX text and ignores whitespace-only JSX", () => {
    const fixtureText = readUserFacingText(
      path.resolve(
        process.cwd(),
        "src/data/marketing/publicSourceContent.fixture.tsx",
      ),
    );

    expect(fixtureText).toBe("Рабочий контур");
    expect(fixtureText).toMatch(forbiddenPublicWording);
  });

  it("publishes llms.txt as compact Markdown with known canonical routes", () => {
    const llms = fs.readFileSync(
      path.resolve(process.cwd(), "public/llms.txt"),
      "utf8",
    );
    const requiredPaths = [
      "/",
      "/solutions",
      "/features",
      "/pricing",
      "/integrations",
      "/security",
      "/contact",
      "/blog",
    ];
    const canonicalPaths = new Set(
      marketingSitemapRoutes.map(({ path: routePath }) => routePath),
    );
    const linkedPaths = [
      ...llms.matchAll(/\[[^\]]+\]\(https:\/\/1мост\.рф(\/[^)]*)\)/gu),
    ].map(([, routePath]) => routePath);
    const proseLines = llms
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"));

    expect(llms).toMatch(/^# МОСТ$/m);
    expect(llms).toContain("## Основные страницы");
    expect(llms).toContain("## Решения");
    expect(llms).toContain("## Материалы");
    expect(proseLines).toHaveLength(2);
    expect(linkedPaths.length).toBeGreaterThanOrEqual(requiredPaths.length);
    expect(llms).not.toMatch(/ProHelper|prohelper\.pro/i);

    for (const requiredPath of requiredPaths) {
      expect(linkedPaths, requiredPath).toContain(requiredPath);
    }

    for (const linkedPath of linkedPaths) {
      expect(canonicalPaths.has(linkedPath), linkedPath).toBe(true);
    }
  });

  it("derives every active public route owner from App.tsx", () => {
    const ownerByRoute = new Map(
      activePublicRouteOwners.map((owner) => [owner.routePath, owner]),
    );

    expect(new Set(ownerByRoute.keys())).toEqual(expectedPublicRoutePaths);
    expect(ownerByRoute.get("/about")?.filePath).toBe(
      "src/pages/company/AboutPage.tsx",
    );
    expect(ownerByRoute.get("/integrations")?.filePath).toBe(
      "src/pages/product/IntegrationsPage.tsx",
    );
    expect(ownerByRoute.get("/contractors")?.filePath).toBe(
      "src/pages/solutions/ContractorsPage.tsx",
    );
    expect(ownerByRoute.get("/blog")?.filePath).toBe(
      "src/components/blog/public/BlogPublicPage.tsx",
    );
    expect(ownerByRoute.get("/blog/:slug")).toEqual({
      routePath: "/blog/:slug",
      componentName: "BlogArticlePage",
      filePath: "src/components/blog/public/BlogArticlePage.tsx",
    });

    for (const owner of activePublicRouteOwners) {
      expect(owner.filePath, owner.routePath).not.toBeNull();
      expect(owner.filePath ?? "").not.toMatch(
        /(?:pages\/dashboard|components\/multi-org)/u,
      );
      expect(productionFiles).toContain(
        path.resolve(process.cwd(), owner.filePath ?? ""),
      );
    }
  });

  it("covers rendered public sources and rejects legacy or hybrid wording", () => {
    const relativePaths = productionFiles.map((filePath) =>
      path.relative(process.cwd(), filePath).replace(/\\/gu, "/"),
    );

    expect(relativePaths).toEqual(
      expect.arrayContaining(requiredRecursiveManifestPaths),
    );

    for (const filePath of productionFiles) {
      expect(
        readUserFacingText(filePath),
        path.relative(process.cwd(), filePath),
      ).not.toMatch(forbiddenPublicWording);
    }
  });
});
