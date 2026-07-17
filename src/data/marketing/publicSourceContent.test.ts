import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { marketingSitemapRoutes } from "./siteIndex";

const productionDirectoryPaths = [
  "src/data/marketing",
  "src/pages/landing",
  "src/pages/resources",
  "src/components/marketing",
  "src/components/blog/public",
  "src/components/landing",
];

const publicRouteFilePaths = [
  "src/pages/company/AboutPage.tsx",
  "src/pages/company/ContactPage.tsx",
  "src/pages/company/SecurityPage.tsx",
  "src/pages/legal/PrivacyPage.tsx",
  "src/pages/legal/OfferPage.tsx",
  "src/pages/legal/CookiesPage.tsx",
  "src/pages/solutions/ContractorsPage.tsx",
  "src/pages/solutions/DevelopersPage.tsx",
  "src/pages/solutions/EnterprisePage.tsx",
  "src/pages/product/IntegrationsPage.tsx",
];

const requiredManifestPaths = [
  "src/components/marketing/blocks/AdminProductDemo.tsx",
  "src/components/blog/public/BlogCategoryPage.tsx",
  "src/components/landing/Footer.tsx",
  ...publicRouteFilePaths,
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
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return values.join("\n");
};

const productionFiles = [
  ...productionDirectoryPaths.flatMap((directory) =>
    collectProductionFiles(path.resolve(process.cwd(), directory)),
  ),
  ...publicRouteFilePaths.map((filePath) =>
    path.resolve(process.cwd(), filePath),
  ),
];

describe("public marketing source content", () => {
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

  it("covers rendered public sources and rejects legacy or hybrid wording", () => {
    const relativePaths = productionFiles.map((filePath) =>
      path.relative(process.cwd(), filePath).replace(/\\/gu, "/"),
    );

    expect(relativePaths).toEqual(
      expect.arrayContaining(requiredManifestPaths),
    );

    for (const filePath of productionFiles) {
      expect(
        readUserFacingText(filePath),
        path.relative(process.cwd(), filePath),
      ).not.toMatch(forbiddenPublicWording);
    }
  });
});
