# Construction SEO Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two indexable marketing SEO landing pages for MOST: `/construction-orders` and `/construction-tenders`.

**Architecture:** Reuse the existing marketing SEO registry and `SeoClusterPage` renderer. The new pages are data-driven entries in the same registry as `/contractor-marketplace`, `/construction-procurement`, and `/site-requests`, then exposed through React routes and sitemap routes.

**Tech Stack:** React 19, React Router 6, TypeScript, Vite, vite-plugin-ssr, Vitest.

## Global Constraints

- Work only inside `prohelper_land`.
- Product brand in user-facing Russian copy is `МОСТ`.
- Do not run `npm run build` for `prohelper_land`.
- Do not start a dev server unless a later debugging step explicitly requires it.
- Keep changes scoped to marketing SEO route/content registration and tests.
- New routes must be indexable through the existing SSR SEO pipeline and included in `src/data/marketing/sitemapRoutes.json`.
- Use the existing `SeoClusterPage` layout; do not create a new page renderer unless the existing data model cannot represent the content.
- Keep the two search intents separate: `/construction-orders` targets contractors looking for orders, `/construction-tenders` targets customers and B2B tender selection.

---

### Task 1: Register Marketing Paths And Metadata

**Files:**
- Modify: `src/data/marketing/common.ts`
- Modify: `src/App.tsx`
- Modify: `src/data/marketing/sitemapRoutes.json`

**Interfaces:**
- Consumes: existing `marketingPaths`, `marketingSeo`, and `SeoClusterPage`.
- Produces: `marketingPaths.constructionOrders`, `marketingPaths.constructionTenders`, `marketingSeo["construction-orders"]`, `marketingSeo["construction-tenders"]`, and two public React routes.

- [ ] **Step 1: Add path constants**

In `src/data/marketing/common.ts`, add:

```ts
constructionOrders: "/construction-orders",
constructionTenders: "/construction-tenders",
```

Place them near `contractorMarketplace` and other commercial SEO paths.

- [ ] **Step 2: Add SEO metadata**

In `src/data/marketing/common.ts`, add `marketingSeo` entries:

```ts
"construction-orders": {
  title: "Строительные заказы и подряды для подрядчиков | МОСТ",
  description:
    "МОСТ помогает подрядчикам и строительным бригадам получать релевантные заказы, отвечать на приглашения и связывать будущую работу с объектами, договорами и контролем исполнения.",
  keywords:
    "строительные заказы, заказы на строительные работы, заказы на строительство, строительные подряды, заказы для строителей, МОСТ",
},
"construction-tenders": {
  title: "Строительные тендеры и подбор подрядчиков | МОСТ",
  description:
    "МОСТ связывает строительный тендер с объектом, шорт-листом подрядчиков, предложениями, выбором исполнителя и дальнейшим контролем работ в одной системе.",
  keywords:
    "строительные тендеры, тендеры на строительство, тендеры на строительные работы, частные тендеры на строительство, подбор подрядчиков, МОСТ",
},
```

- [ ] **Step 3: Add React routes**

In `src/App.tsx`, add routes inside the public `LandingLayout` route group:

```tsx
<Route path="/construction-orders" element={<SeoClusterPage pageKey="construction-orders" />} />
<Route path="/construction-tenders" element={<SeoClusterPage pageKey="construction-tenders" />} />
```

- [ ] **Step 4: Add sitemap routes**

In `src/data/marketing/sitemapRoutes.json`, add entries after `/contractor-marketplace`:

```json
{ "path": "/construction-orders", "pageKey": "construction-orders", "priority": 0.86, "changefreq": "weekly" },
{ "path": "/construction-tenders", "pageKey": "construction-tenders", "priority": 0.86, "changefreq": "weekly" }
```

- [ ] **Step 5: Run focused route/registry checks**

Run:

```bash
npx vitest run src/data/marketing/siteIndex.test.ts src/renderer/serverSeo.test.ts
```

Expected: tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/data/marketing/common.ts src/App.tsx src/data/marketing/sitemapRoutes.json
git commit -m "feat[marketing]: добавлены seo-маршруты строительных заказов"
```

---

### Task 2: Add Page Content For Orders And Tenders

**Files:**
- Modify: `src/data/marketing/seoProductPages.ts`
- Modify: `src/data/marketing/seoPages.ts` only if the aggregate export requires explicit wiring.

**Interfaces:**
- Consumes: `marketingPaths.constructionOrders`, `marketingPaths.constructionTenders`, `createProductSeoPage`, `MarketingSeoLandingPage`.
- Produces: `marketingSeoLandingPages["construction-orders"]` and `marketingSeoLandingPages["construction-tenders"]` with complete data for `SeoClusterPage`.

- [ ] **Step 1: Add `/construction-orders` landing page data**

Add a `createProductSeoPage` entry with:

```ts
path: marketingPaths.constructionOrders,
eyebrow: "Строительные заказы",
title: "Строительные заказы и подряды для подрядчиков",
description:
  "МОСТ помогает подрядчикам и строительным бригадам получать релевантные заказы, показывать профиль, отвечать на приглашения и не терять связь будущей работы с объектом, договором и контролем исполнения.",
supportingQueries: [
  "строительные заказы",
  "заказы на строительные работы",
  "заказы на строительство",
  "строительные заказы без посредников",
  "заказы для строителей",
],
```

Required positioning:

- The page is for contractors, бригады, subcontractors, and small construction companies.
- Explain that MOST is not a generic bulletin board; it connects contractor profile, invitation, object context, offer, contract, tasks, and acceptance control.
- Mention relevant work types: construction, repair and finishing, engineering, installation, благоустройство, object-based subcontracting.
- Related links must include `/contractor-marketplace`, `/contractor-control`, `/site-requests`, `/construction-tenders`.

- [ ] **Step 2: Add `/construction-tenders` landing page data**

Add a `createProductSeoPage` entry with:

```ts
path: marketingPaths.constructionTenders,
eyebrow: "Строительные тендеры",
title: "Строительные тендеры и подбор подрядчиков",
description:
  "МОСТ помогает заказчику связать строительный тендер с объектом, собрать предложения, сравнить подрядчиков, выбрать исполнителя и продолжить контроль работ без разрыва между закупкой и исполнением.",
supportingQueries: [
  "строительные тендеры",
  "тендеры на строительство",
  "тендеры на строительные работы",
  "частные тендеры на строительство",
  "тендеры на строительство и ремонт",
],
```

Required positioning:

- The page is for заказчики, девелоперы, генподрядчики, procurement/project managers, and contractors invited to tender.
- Explain the difference from tender aggregators: not just a list of закупки; the selection is tied to object context, shortlist, offers, contract, tasks, and execution control.
- Include both sides: заказчик creates and compares tender offers; contractor receives invitations and responds with profile-backed proposal.
- Related links must include `/construction-orders`, `/contractor-marketplace`, `/construction-procurement`, `/contractor-control`.

- [ ] **Step 3: Populate all required page sections**

For both entries, provide non-empty:

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

Use existing nearby pages as structure examples, especially `contractor-marketplace`, `construction-procurement`, and `site-requests`.

- [ ] **Step 4: Keep claims production-safe**

Do not promise automatic matching, guaranteed orders, public tender publication, payment guarantees, or legal verification unless the existing product copy already makes that same promise. Use wording like "помогает связать", "показывает", "сохраняет контекст", "позволяет сравнить", "по согласованному сценарию".

- [ ] **Step 5: Run focused content tests**

Run:

```bash
npx vitest run src/data/marketing/marketingContent.test.ts src/pages/landing/SeoClusterPage.test.tsx
```

Expected: tests pass. If tests encode the expected list of SEO pages, update assertions to include `construction-orders` and `construction-tenders`.

- [ ] **Step 6: Commit**

```bash
git add src/data/marketing/seoProductPages.ts src/data/marketing/seoPages.ts src/data/marketing/marketingContent.test.ts src/pages/landing/SeoClusterPage.test.tsx
git commit -m "feat[marketing]: добавлены посадочные строительных заказов и тендеров"
```

---

### Task 3: Validate SEO Contracts And Internal Linking

**Files:**
- Modify: `src/data/marketing/marketingContent.test.ts`
- Modify: `src/data/marketing/siteIndex.test.ts`
- Modify: any touched marketing registry file only if tests reveal a real contract gap.

**Interfaces:**
- Consumes: page keys from Tasks 1 and 2.
- Produces: regression coverage that the two pages are routable, indexable, included in sitemap, have SEO metadata, and cross-link to the marketplace cluster.

- [ ] **Step 1: Add or extend tests for new page keys**

Ensure tests cover:

```ts
const newPages = [
  ["construction-orders", "/construction-orders"],
  ["construction-tenders", "/construction-tenders"],
] as const;
```

Assertions:

- `marketingSeo[pageKey]` exists.
- `marketingSeoLandingPages[pageKey]` exists.
- `marketingSeoLandingPages[pageKey].path` equals the expected path.
- `findMarketingSitemapRoute(path)` returns a route.
- `marketingSeo[pageKey].noIndex` is not `true`.
- `getPageSEOData(path).canonicalUrl` ends with the expected path.
- each page has `relatedLinks` that include `/contractor-marketplace`.

- [ ] **Step 2: Run focused SEO contract tests**

Run:

```bash
npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/renderer/serverSeo.test.ts
```

Expected: tests pass.

- [ ] **Step 3: Run TypeScript check**

Run:

```bash
npx tsc --noEmit
```

Expected: typecheck passes.

- [ ] **Step 4: Commit**

```bash
git add src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/data/marketing/seoProductPages.ts src/data/marketing/common.ts src/data/marketing/sitemapRoutes.json src/App.tsx
git commit -m "test[marketing]: покрыты seo-страницы строительных заказов"
```

---

## Self-Review

- Spec coverage: Tasks 1-3 cover paths, metadata, route exposure, sitemap, content, internal linking, tests, and typecheck.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: all new keys use `construction-orders` and `construction-tenders`; path constants use `constructionOrders` and `constructionTenders`.
