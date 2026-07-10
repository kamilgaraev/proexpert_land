# Marketing SEO 10/10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Исправить технические SEO-дефекты `prohelper_land` и опубликовать семь коммерческих продуктовых кластеров, подтвержденных текущим продуктом.

**Architecture:** Статический индекс URL получает единый JSON-источник для браузерного registry и Node SSR. SSR блога передает начальные коллекции через `pageProps`. Schema формируется по типу страницы. Новые кластеры вынесены из существующего крупного файла в отдельный typed registry и объединяются публичным экспортом.

**Tech Stack:** React 19, TypeScript 5.8, Vite SSR (`vite-plugin-ssr`), Vitest 4, Node CJS sitemap renderer.

---

### Task 1: Единый sitemap и удаление устаревших SEO-артефактов

**Files:**
- Create: `src/data/marketing/sitemapRoutes.json`
- Modify: `src/data/marketing/siteIndex.ts`
- Modify: `server/sitemap.cjs`
- Modify: `package.json`
- Modify: `src/utils/seo.test.ts`
- Modify: `src/data/marketing/marketingContent.test.ts`
- Delete: `public/sitemap.xml`
- Delete: `public/index.html`

- [ ] **Step 1: Зафиксировать падающие проверки единого источника**

Добавить проверки, что runtime sitemap и `marketingSitemapRoutes` имеют одинаковые URL, статические URL не содержат `lastmod`, файлы `public/sitemap.xml` и `public/index.html` отсутствуют, а контактный email использует актуальный домен `1мост.рф`.

```ts
expect(fs.existsSync(path.resolve('public/sitemap.xml'))).toBe(false);
expect(fs.existsSync(path.resolve('public/index.html'))).toBe(false);
expect(staticUrls).toEqual(marketingSitemapRoutes.map(({ path }) => path));
expect(renderSitemapXml()).not.toContain('<lastmod>');
expect(marketingCompany.email).toMatch(/@1мост\.рф$/u);
```

- [ ] **Step 2: Запустить RED**

Run: `npm run test:run -- src/utils/seo.test.ts src/data/marketing/siteIndex.test.ts src/data/marketing/marketingContent.test.ts`

Expected: FAIL из-за двух существующих public-файлов, расхождения источников и старого ожидания email.

- [ ] **Step 3: Ввести JSON source of truth**

Создать JSON-массив объектов `{ path, pageKey, priority, changefreq }` для всех indexable marketing URL. Импортировать его в `siteIndex.ts` с проверкой через `satisfies MarketingSitemapRoute[]`. В `server/sitemap.cjs` читать этот JSON и рендерить статические URL без `lastmod`. В `build:marketing` копировать JSON в итоговый `server/` рядом с `sitemap.cjs`.

- [ ] **Step 4: Удалить статические дубликаты и старый fallback**

Удалить `public/sitemap.xml` и `public/index.html`. Не переносить из них цены, рейтинг или просроченные Offer-поля.

- [ ] **Step 5: Запустить GREEN и commit**

Run: `npm run test:run -- src/utils/seo.test.ts src/data/marketing/siteIndex.test.ts src/data/marketing/marketingContent.test.ts`

Expected: PASS.

Commit: `fix[marketing]: синхронизирован источник sitemap`

### Task 2: SSR ленты блога и единый бренд статей

**Files:**
- Modify: `src/types/blog.ts`
- Modify: `src/pages/catch-all.page.server.ts`
- Modify: `src/pages/catch-all.page.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/blog/public/BlogPublicPage.tsx`
- Create: `src/pages/catch-all.page.server.test.ts`
- Create: `src/components/blog/public/BlogPublicPage.test.tsx`
- Modify: `src/utils/seo.test.ts`

- [ ] **Step 1: Написать RED для SSR**

Проверить, что `onBeforeRender({ urlPathname: '/blog' })` при успешных ответах `/articles` и `/categories` возвращает `initialBlogList` с коллекциями и meta, а `BlogPublicPage` сразу рендерит заголовки статей без состояния skeleton. Проверить нормализацию `| ProHelper` и заголовка без suffix в `| МОСТ`.

```ts
expect(result.pageContext.pageProps.initialBlogList.articles).toHaveLength(2);
expect(screen.getByRole('heading', { name: article.title })).toBeInTheDocument();
expect(buildArticleDocumentProps(article).title).toBe(`${article.title} | МОСТ`);
```

- [ ] **Step 2: Запустить RED**

Run: `npm run test:run -- src/pages/catch-all.page.server.test.ts src/components/blog/public/BlogPublicPage.test.tsx src/utils/seo.test.ts`

Expected: FAIL, потому что SSR списка и нормализации бренда еще нет.

- [ ] **Step 3: Реализовать typed initial state**

Добавить `BlogListInitialData` с `articles`, `categories`, `meta`. Для `/blog` сервер параллельно получает `/api/v1/blog/articles?status=published&per_page=12&page=1` и `/api/v1/blog/categories`. Валидировать envelopes, при частичном/полном сбое не выбрасывать исключение. Передать initial state через `CatchAllPageProps` и `AppProps` в `<BlogPublicPage initialData={...} />`.

- [ ] **Step 4: Гидратировать клиент без пустого SSR**

Инициализировать state `BlogPublicPage` из props, вычислить `loading` и `hasMore` из initial meta. Не выполнять повторный запрос первой страницы при первом эффекте, если URL без фильтра/поиска соответствует initial state. Любое изменение фильтра, поиска или страницы использует текущий `blogPublicApi`.

- [ ] **Step 5: Нормализовать бренд title**

Функция должна удалить suffix `| ProHelper` или `| МОСТ` без учета регистра и вернуть ровно `<base title> | МОСТ`.

- [ ] **Step 6: Запустить GREEN и commit**

Run: `npm run test:run -- src/pages/catch-all.page.server.test.ts src/components/blog/public/BlogPublicPage.test.tsx src/utils/seo.test.ts`

Expected: PASS.

Commit: `fix[marketing]: добавлен SSR ленты блога`

### Task 3: Schema graph по типу страницы

**Files:**
- Modify: `src/renderer/serverSeo.ts`
- Modify: `src/renderer/serverSeo.test.ts`
- Modify: `src/utils/seo.ts`
- Modify: `src/utils/seo.test.ts`

- [ ] **Step 1: Написать RED для состава graph**

Распарсить JSON-LD и проверить: главная и `/pricing` содержат один `SoftwareApplication`; `/features` и `/construction-crm` не содержат `SoftwareApplication`; кластер сохраняет `Service`, `HowTo`, `FAQPage`; статья сохраняет `BlogPosting`; нигде нет `AggregateRating`.

```ts
const graph = JSON.parse(extractJsonLd(payload.structuredDataTag))['@graph'];
expect(graph.filter((item: { '@type': string }) => item['@type'] === 'SoftwareApplication')).toHaveLength(0);
expect(payload.structuredDataTag).not.toContain('AggregateRating');
```

- [ ] **Step 2: Запустить RED**

Run: `npm run test:run -- src/renderer/serverSeo.test.ts src/utils/seo.test.ts`

Expected: FAIL на обычной marketing page из-за глобального `SoftwareApplication`.

- [ ] **Step 3: Сформировать базовый и page-specific graph**

Всегда включать `Organization` и `WebPage`; `BreadcrumbList` включать для URL кроме `/`; `SoftwareApplication` включать только для `/` и `/pricing`; затем добавлять route-specific structured data с дедупликацией по `@type` и идентичному JSON.

- [ ] **Step 4: Запустить GREEN и commit**

Run: `npm run test:run -- src/renderer/serverSeo.test.ts src/utils/seo.test.ts`

Expected: PASS.

Commit: `fix[marketing]: уточнена schema разметка страниц`

### Task 4: Семь продуктовых SEO-кластеров

**Files:**
- Create: `src/data/marketing/seoProductPages.ts`
- Modify: `src/data/marketing/common.ts`
- Modify: `src/data/marketing/capabilities.ts`
- Modify: `src/data/marketing/seoPages.ts`
- Modify: `src/data/marketing/index.ts`
- Modify: `src/data/marketing/sitemapRoutes.json`
- Modify: `src/App.tsx`
- Modify: `public/llms.txt`
- Create: `public/og/construction-procurement.png`
- Create: `public/og/site-requests.png`
- Create: `public/og/workforce-management.png`
- Create: `public/og/construction-payments.png`
- Create: `public/og/1c-integration.png`
- Create: `public/og/contractor-marketplace.png`
- Create: `public/og/project-pulse.png`
- Modify: `src/data/marketing/siteIndex.test.ts`
- Modify: `src/data/marketing/marketingContent.test.ts`
- Modify: `src/utils/seo.test.ts`

- [ ] **Step 1: Написать RED для полного контракта страниц**

Для ключей `construction-procurement`, `site-requests`, `workforce-management`, `construction-payments`, `1c-integration`, `contractor-marketplace`, `project-pulse` проверить наличие meta, indexable sitemap route, landing content, четырех supporting queries, трех role views, трех внутренних ссылок и трех FAQ. Проверить, что URL отдает SEO status `200`, canonical на себя и page-specific `Service` schema. Для каждого URL проверить наличие PNG OG-image.

- [ ] **Step 2: Запустить RED**

Run: `npm run test:run -- src/data/marketing/siteIndex.test.ts src/data/marketing/marketingContent.test.ts src/utils/seo.test.ts`

Expected: FAIL, потому что новые keys отсутствуют.

- [ ] **Step 3: Добавить URL и meta**

Добавить typed paths и meta с уникальными title/description/keywords. Title должны описывать буквальный коммерческий intent, заканчиваться брендом `| МОСТ` там, где он помогает читаемости, и не обещать отсутствующие интеграции или автоматические решения. Для 1С использовать путь `/1c-integration`, для AI-сводки — `/project-pulse`.

- [ ] **Step 4: Добавить уникальный operational content**

В `seoProductPages.ts` создать семь `MarketingSeoLandingPage` через локальную typed factory. Для каждой страницы задать самостоятельные сигналы, before/after, метрики без выдуманных чисел, аудитории, проблемы, автоматизации, role views, related links, blog links, contact highlights и FAQ. Добавить уникальный proof-workflow: цепочка закупки; типы заявок с объекта; очередь платежных действий; расчетный период персонала; карта обмена и сопоставлений 1С/MDM; профиль и оффер подрядчику; источники Project Pulse. Тексты основывать на продуктовых контурах из дизайн-спецификации.

- [ ] **Step 5: Подключить маршруты и перелинковку**

Добавить семь `<Route>` с `SeoClusterPage`, включить URL в sitemap JSON и добавить ссылки в коммерческую/модульную коллекцию так, чтобы каждый новый кластер имел минимум две входящие контекстные ссылки из registry. Обновить `public/llms.txt`. Добавить capability для 1С/MDM и marketplace, исправить `sourceOfTruth` платежей на `Core/Payments`, а Project Pulse на `Features/AIAssistant`. Усилить существующую `/change-control` связью RFI с бюджетом, сроками и платежами без создания конкурирующих URL.

- [ ] **Step 6: Сгенерировать OG images**

Run: `npm run generate:og`

Expected: PNG 1200x630 существует для каждого нового slug; команда не запускает Vite build.

- [ ] **Step 7: Запустить GREEN и commit**

Run: `npm run test:run -- src/data/marketing/siteIndex.test.ts src/data/marketing/marketingContent.test.ts src/utils/seo.test.ts`

Expected: PASS.

Commit: `feat[marketing]: добавлены продуктовые SEO страницы`

### Task 5: Финальная проверка и hardening

**Files:**
- Modify only when a failing verification identifies an in-scope defect.

- [ ] **Step 1: Запустить полный Vitest**

Run: `npm run test:run`

Expected: все test files PASS, 0 failed.

- [ ] **Step 2: Проверить TypeScript**

Run: `npx tsc --noEmit`

Expected: exit 0.

- [ ] **Step 3: Проверить ESLint затронутых файлов**

Run: `npx eslint src/App.tsx src/components/blog/public/BlogPublicPage.tsx src/pages/catch-all.page.server.ts src/pages/catch-all.page.tsx src/renderer/serverSeo.ts src/utils/seo.ts src/data/marketing/*.ts`

Expected: 0 errors.

- [ ] **Step 4: Проверить артефакты и diff**

Run: `git diff --check`

Run: `rg -n "AggregateRating|2025-12-31|49 900|\\| ProHelper" public src/renderer src/pages src/data/marketing server`

Expected: `git diff --check` exit 0; поиск не находит устаревшие SEO-сигналы, кроме явно допустимых исторических/непубличных текстов.

- [ ] **Step 5: Повторить SEO source audit**

Run: `python ../plugins/seo-optimization/scripts/seo_full_audit.py --path . --format markdown`

Expected: отчет сохранен только в выводе; SSR-aware ручные проверки имеют приоритет над ложными срабатываниями анализа `.tsx`.

- [ ] **Step 6: Финальный review и commit исправлений проверки**

Провести независимый review соответствия всей спецификации и отдельный code-quality review. Исправить подтвержденные проблемы, повторить Step 1-4. Если появились исправления, commit: `fix[marketing]: завершена SEO верификация сайта`.
