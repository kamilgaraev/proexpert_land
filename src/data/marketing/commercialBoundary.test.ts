import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { marketingPackages } from "./packages";
import { marketingSeoLandingPages } from "./seoPages";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("граница новой коммерческой модели", () => {
  it("сохраняет предметный язык и честные ограничения ручных SEO-кластеров", () => {
    const contracts = {
      "foreman-software": {
        terms: ["смен", "задач", "фото", "журнал", "отклонен"],
        limitation: /данные зависят от дисциплины фиксации/iu,
      },
      "construction-crm": {
        terms: ["клиент", "договор", "объект", "этап", "обязательств"],
        limitation: /не заменяет отраслевую бухгалтерию/iu,
      },
      "construction-erp": {
        terms: ["ресурс", "бюджет", "объект", "управленческ", "учёт"],
        limitation:
          /глубина erp-процесса зависит от настроенных справочников и интеграций/iu,
      },
      "material-accounting": {
        terms: ["заявк", "приход", "перемещен", "списан", "остаток"],
        limitation:
          /фактический остаток требует своевременного ввода операций/iu,
      },
      "pto-software": {
        terms: ["исполнительн", "документац", "комплект", "статус", "замечан"],
        limitation: /документы готовят и проверяют ответственные специалисты/iu,
      },
      "contractor-control": {
        terms: ["подрядчик", "договор", "объём", "срок", "замечан"],
        limitation:
          /показывает зафиксированные данные, а не оценивает подрядчика сама/iu,
      },
      "construction-documents": {
        terms: ["верси", "согласован", "доступ", "архив"],
        limitation:
          /юридическая значимость зависит от принятого регламента и электронной подписи \(эп\)/iu,
      },
      "construction-budget-control": {
        terms: ["бюджет", "лимит", "обязательств", "факт", "отклонен"],
        limitation: /точность зависит от полноты заявок, договоров и оплат/iu,
      },
    } as const;

    for (const [pageKey, contract] of Object.entries(contracts)) {
      const pageText = JSON.stringify(
        marketingSeoLandingPages[pageKey],
      ).toLocaleLowerCase("ru-RU");

      for (const term of contract.terms) {
        expect(pageText, `${pageKey}: ${term}`).toContain(term);
      }
      expect(pageText, `${pageKey}: limitation`).toMatch(contract.limitation);
    }
  });

  it("публикует уникальные метаданные ручных SEO-кластеров", () => {
    const pages = [
      "foreman-software",
      "construction-crm",
      "construction-erp",
      "material-accounting",
      "pto-software",
      "contractor-control",
      "construction-documents",
      "construction-budget-control",
    ].map((pageKey) => marketingSeoLandingPages[pageKey]);

    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(
      pages.length,
    );

    for (const page of pages) {
      expect(page.title.length, `${page.path}: title`).toBeLessThanOrEqual(60);
      expect(
        page.description.length,
        `${page.path}: description`,
      ).toBeGreaterThanOrEqual(70);
      expect(
        page.description.length,
        `${page.path}: description`,
      ).toBeLessThanOrEqual(160);
    }
  });

  it("представляет каждый публичный пакет одной коммерческой позицией без тарифных уровней", () => {
    expect(marketingPackages).toHaveLength(10);

    for (const item of marketingPackages) {
      expect(item).toEqual(
        expect.objectContaining({
          price: expect.any(Number),
          moduleSlugs: expect.any(Array),
          highlights: expect.any(Array),
        }),
      );
      expect(item).not.toHaveProperty("tiers");
      expect(item).not.toHaveProperty("plan");
    }
  });

  it("не возвращает старую семантику подписок и модулей в активные UI-контракты", () => {
    const activeSources = [
      "src/types/marketing.ts",
      "src/hooks/useUserManagement.ts",
      "src/components/dashboard/organization/CapabilitiesSelector.tsx",
      "src/components/dashboard/organization/RecommendedPackagesCard.tsx",
      "src/components/dashboard/onboarding/OnboardingWizard.tsx",
      "src/components/dashboard/organization/OrganizationProfileModal.tsx",
      "src/pages/dashboard/organization/OrganizationSettingsPage.tsx",
    ]
      .map(read)
      .join("\n");

    expect(activeSources).not.toMatch(
      /MarketingPackageTier|export interface SubscriptionLimits|RecommendedModulesCard|const \[limits/,
    );
    expect(activeSources).not.toContain("Рекомендуемые модули");
  });
});
