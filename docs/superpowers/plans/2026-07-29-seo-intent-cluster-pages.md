# SEO Intent Cluster Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four indexable SEO landing pages for МОСТ: `/subcontracting`, `/find-contractor`, `/construction-brigades`, and `/renovation-orders`.

**Architecture:** Reuse the existing marketing SEO registry, sitemap registry, public React route group, SSR SEO pipeline, and `SeoClusterPage`. The pages must stay data-driven in `marketingSeoLandingPages`; no new page renderer is needed.

**Tech Stack:** React 19, React Router 6, TypeScript, Vite, vite-plugin-ssr, Vitest.

## Global Constraints

- Work only inside `prohelper_land`.
- Product brand in user-facing Russian copy is `МОСТ`.
- Do not run `npm run build` for `prohelper_land`.
- Do not start a dev server unless a debugging step explicitly requires it.
- Keep changes scoped to marketing SEO route/content registration, analytics contract checks, and tests.
- New routes must be indexable through the existing SSR SEO pipeline and included in `src/data/marketing/sitemapRoutes.json`.
- New public routes must be eligible for the existing Yandex Metrika integration through `isMarketingPublicPath`; do not add per-page tracking code unless the global integration fails.
- Use the existing `SeoClusterPage` layout.
- Keep contractor-side and customer-side search intents separate.
- Contractor-side pages must not promise a public catalog of guaranteed orders. Use factual wording around profiles, address invitations, project context, roles, work packages, viewing, accepting, and declining.
- Customer-side pages must not promise automatic verification, guaranteed contractor quality, payment guarantees, legal checks, or automatic matching. Use factual wording around contractor profiles, categories, search, shortlist, invitations, and response status.
- Apply `humanizer`: avoid em dash, "не просто X, а Y", generic promotional claims, mechanical rule-of-three lists, and unsupported promises.

---

### Task 1: Register Routes, Metadata, Sitemap, OG Fallback, And Metrika Contract

**Files:**
- Modify: `src/data/marketing/common.ts`
- Modify: `src/App.tsx`
- Modify: `src/data/marketing/sitemapRoutes.json`
- Modify: `src/utils/seo.ts`
- Modify: `src/data/marketing/siteIndex.test.ts`
- Create or modify: `src/utils/publicSite.test.ts` if no focused public-site test exists.

**Interfaces:**
- Consumes: existing `marketingPaths`, `marketingSeo`, `SeoClusterPage`, `isMarketingPublicPath`, `getPageSEOData`.
- Produces: route keys and paths for `subcontracting`, `find-contractor`, `construction-brigades`, `renovation-orders`.

- [ ] **Step 1: Add path constants**

In `src/data/marketing/common.ts`, add near the marketplace/construction SEO paths:

```ts
subcontracting: "/subcontracting",
findContractor: "/find-contractor",
constructionBrigades: "/construction-brigades",
renovationOrders: "/renovation-orders",
```

- [ ] **Step 2: Add SEO metadata**

In `marketingSeo`, add four keys:

```ts
subcontracting: {
  title: "Субподряд в строительстве: заявки и приглашения | МОСТ",
  description:
    "МОСТ помогает вести субподряд через профиль подрядчика, адресное приглашение по проекту, роль, сроки, бюджет, пакеты работ и статус ответа.",
  keywords:
    "субподряд, заявки на субподряд, субподряд строительство, строительный субподряд, МОСТ",
},
"find-contractor": {
  title: "Найти подрядчика для строительного объекта | МОСТ",
  description:
    "МОСТ помогает заказчику искать подрядчиков по профилям и категориям работ, собрать шорт-лист и отправить адресное приглашение по проекту.",
  keywords:
    "найти подрядчика, поиск подрядчика, подрядчик на строительство, строительный подрядчик, МОСТ",
},
"construction-brigades": {
  title: "Найти строительную бригаду по видам работ | МОСТ",
  description:
    "МОСТ помогает заказчику работать с профилями бригад, категориями работ, приглашениями по объекту и статусами ответа.",
  keywords:
    "найти строительную бригаду, бригада строителей, строительные бригады, найти бригаду строителей, МОСТ",
},
"renovation-orders": {
  title: "Заказы на ремонт и отделочные работы | МОСТ",
  description:
    "МОСТ помогает вести ремонтные и отделочные работы через адресные приглашения, пакеты работ, сроки, бюджет и ответ подрядчика.",
  keywords:
    "заказы на ремонт, заказы на отделочные работы, ремонтные работы заказы, подряд на ремонт, МОСТ",
},
```

Keep titles under 60 characters and descriptions between 70 and 160 characters.

- [ ] **Step 3: Add React routes**

In the public `LandingLayout` route group in `src/App.tsx`, add:

```tsx
<Route path="/subcontracting" element={<SeoClusterPage pageKey="subcontracting" />} />
<Route path="/find-contractor" element={<SeoClusterPage pageKey="find-contractor" />} />
<Route path="/construction-brigades" element={<SeoClusterPage pageKey="construction-brigades" />} />
<Route path="/renovation-orders" element={<SeoClusterPage pageKey="renovation-orders" />} />
```

- [ ] **Step 4: Add sitemap routes**

In `src/data/marketing/sitemapRoutes.json`, add:

```json
{ "path": "/subcontracting", "pageKey": "subcontracting", "priority": 0.85, "changefreq": "weekly" },
{ "path": "/find-contractor", "pageKey": "find-contractor", "priority": 0.86, "changefreq": "weekly" },
{ "path": "/construction-brigades", "pageKey": "construction-brigades", "priority": 0.84, "changefreq": "weekly" },
{ "path": "/renovation-orders", "pageKey": "renovation-orders", "priority": 0.83, "changefreq": "weekly" }
```

- [ ] **Step 5: Add safe OG fallback**

In `src/utils/seo.ts`, make the new page keys return `default` from `resolveOgImageKey`, like the previous pages without dedicated PNG assets.

- [ ] **Step 6: Add route and Metrika eligibility tests**

Extend `src/data/marketing/siteIndex.test.ts` so the four routes are known, indexable sitemap routes. Add or extend `src/utils/publicSite.test.ts` with:

```ts
expect(isMarketingPublicPath("/subcontracting")).toBe(true);
expect(isMarketingPublicPath("/find-contractor")).toBe(true);
expect(isMarketingPublicPath("/construction-brigades")).toBe(true);
expect(isMarketingPublicPath("/renovation-orders")).toBe(true);
```

This verifies the global Yandex Metrika component can track these routes automatically after consent on the primary marketing host.

- [ ] **Step 7: Run focused checks**

Run:

```bash
npx vitest run src/data/marketing/siteIndex.test.ts src/utils/publicSite.test.ts src/renderer/serverSeo.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add src/data/marketing/common.ts src/App.tsx src/data/marketing/sitemapRoutes.json src/utils/seo.ts src/data/marketing/siteIndex.test.ts src/utils/publicSite.test.ts src/renderer/serverSeo.test.ts
git commit -m "feat[marketing]: добавлены seo-маршруты интентов подрядчиков"
```

---

### Task 2: Add Humanized Page Content For Four Intents

**Files:**
- Modify: `src/data/marketing/seoProductPages.ts`
- Modify: `src/data/marketing/seoPages.ts` only if aggregate wiring requires it.

**Interfaces:**
- Consumes: path constants from Task 1 and existing `createProductSeoPage`.
- Produces: complete `marketingSeoLandingPages` entries for `subcontracting`, `find-contractor`, `construction-brigades`, and `renovation-orders`.

- [ ] **Step 1: Add `/subcontracting` page data**

Positioning: contractor-side and gencontractor-side bridge, but factual. Describe address invitations for subcontracting by project, role, work packages, budget, dates, view/accept/decline status. Do not promise an open catalog of subcontracting jobs.

Required related links: `/construction-orders`, `/contractor-marketplace`, `/contractor-control`, `/find-contractor`.

- [ ] **Step 2: Add `/find-contractor` page data**

Positioning: customer-side intent. Describe searching contractor profiles by category, shortlist, invitation by project, work packages and response status. Do not promise verification, guarantees, or automatic matching.

Required related links: `/contractor-marketplace`, `/construction-brigades`, `/subcontracting`, `/contractor-control`.

- [ ] **Step 3: Add `/construction-brigades` page data**

Positioning: customer-side intent for crews. Describe profiles and categories for construction, repair, finishing, engineering, installation, and site work. Keep "бригада" separate from "подрядчик" by focusing on practical work packages and project invitation context.

Required related links: `/find-contractor`, `/contractor-marketplace`, `/renovation-orders`, `/workforce-management`.

- [ ] **Step 4: Add `/renovation-orders` page data**

Positioning: contractor-side intent for repair and finishing. Describe address invitations for repair, finishing, engineering and installation packages, with dates, budget, project context and response status. Do not promise a public order feed.

Required related links: `/construction-orders`, `/construction-brigades`, `/subcontracting`, `/site-requests`.

- [ ] **Step 5: Fill all required page sections**

Each page must have non-empty:

```ts
processComparison
audienceTitle
audienceDescription
audiences
problemTitle
problemDescription
problems
automationTitle
automationDescription
automations
visibilityTitle
visibilityDescription
roleViews
relatedLinks
blogLinks
contactHighlights
faq
workflow
```

- [ ] **Step 6: Humanizer pass**

For every new page text:

- use `МОСТ` only as the product name;
- avoid em dash;
- avoid "не просто X, а Y";
- avoid repeated three-item sales rhythms;
- remove vague "помогает быстрее/лучше/эффективнее" claims unless backed by a concrete product contour;
- do not promise guaranteed orders, verified contractors, legal checks, payment guarantees, or automatic selection.

- [ ] **Step 7: Run content tests**

Run:

```bash
npx vitest run src/data/marketing/marketingContent.test.ts src/pages/landing/SeoClusterPage.test.tsx
```

- [ ] **Step 8: Commit**

```bash
git add src/data/marketing/seoProductPages.ts src/data/marketing/seoPages.ts src/data/marketing/marketingContent.test.ts src/pages/landing/SeoClusterPage.test.tsx
git commit -m "feat[marketing]: добавлены seo-страницы поиска подрядчиков"
```

---

### Task 3: Validate SEO, Analytics, And Intent Separation Contracts

**Files:**
- Modify: `src/data/marketing/marketingContent.test.ts`
- Modify: `src/data/marketing/siteIndex.test.ts`
- Modify: `src/renderer/serverSeo.test.ts`
- Modify: `src/utils/publicSite.test.ts`
- Modify: touched registry files only if tests expose a real gap.

**Interfaces:**
- Consumes: page keys and paths from Tasks 1-2.
- Produces: regression coverage for route registration, sitemap, SSR metadata, OG fallback, Metrika eligibility, internal links, and intent separation.

- [ ] **Step 1: Add SEO cluster regression table**

Add a shared table:

```ts
const newIntentPages = [
  ["subcontracting", "/subcontracting"],
  ["find-contractor", "/find-contractor"],
  ["construction-brigades", "/construction-brigades"],
  ["renovation-orders", "/renovation-orders"],
] as const;
```

Assert for each:

- `marketingSeo[pageKey]` exists;
- `marketingSeoLandingPages[pageKey]` exists;
- `marketingSeoLandingPages[pageKey].path` equals the path;
- `findMarketingSitemapRoute(path)` exists;
- `marketingSeo[pageKey].noIndex` is not `true`;
- `getPageSEOData(path).canonicalUrl` ends with the path;
- `getPageSEOData(path).ogImage` is `https://1мост.рф/og/default.png`;
- `isMarketingPublicPath(path)` is `true`.

- [ ] **Step 2: Add intent separation assertions**

Assert that contractor-side pages (`subcontracting`, `renovation-orders`) include language around invitations/responses and do not include "гарантированные заказы" or "каталог заказов".

Assert that customer-side pages (`find-contractor`, `construction-brigades`) include profiles/categories/invitations and do not include "автоматический подбор", "гарантия качества", "юридическая проверка", or "проверенные исполнители" unless explicitly qualified as user-controlled profile data.

- [ ] **Step 3: Run final checks on feature branch**

Run:

```bash
npx vitest run src/data/marketing/marketingContent.test.ts src/pages/landing/SeoClusterPage.test.tsx src/data/marketing/siteIndex.test.ts src/renderer/serverSeo.test.ts src/utils/publicSite.test.ts
npx tsc --noEmit
git diff --check
```

- [ ] **Step 4: Commit**

```bash
git add src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/renderer/serverSeo.test.ts src/utils/publicSite.test.ts src/data/marketing/common.ts src/data/marketing/seoProductPages.ts src/data/marketing/sitemapRoutes.json src/App.tsx src/utils/seo.ts
git commit -m "test[marketing]: покрыты seo-интенты подрядчиков"
```

---

## Self-Review

- Spec coverage: the plan covers the four requested pages, intent separation, Yandex Metrika eligibility, sitemap, SSR, OG fallback, tests, typecheck, merge-ready verification.
- Placeholder scan: no TBD/TODO/fill-later steps remain.
- Type consistency: path constants use camelCase; page keys use route slugs; all slugs match requested URLs.
