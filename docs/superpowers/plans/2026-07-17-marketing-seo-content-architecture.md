# Marketing SEO Content Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Глубоко переработать SEO и пользовательские тексты всех 35 индексируемых маркетинговых страниц МОСТ без выдуманных кейсов, доказательств и неподтверждённых обещаний.

**Architecture:** Сохраняем существующие маршруты, SSR на vite-plugin-ssr и визуальные компоненты, но разделяем структурные фабрики и смысловое наполнение страниц. Вводим чистый слой нормализации старого бренда в данных блога, типизированный реестр реальных статей и проверяемые контракты метаданных, перелинковки и языка.

**Tech Stack:** React 18, TypeScript, Vite, vite-plugin-ssr, Vitest, Testing Library, ESLint, Prettier.

## Global Constraints

- Публичное название продукта — только `МОСТ`; `prohelper*` допустимо только в технических путях, именах конфигурации и тестовых фикстурах миграции старых данных.
- Обрабатываются все 35 статических маршрутов из `src/data/marketing/sitemapRoutes.json`; URL не меняются и не удаляются.
- Не добавлять кейсы, отзывы, клиентские логотипы, цитаты, неподтверждённые проценты, сроки внедрения или гарантированный результат.
- Не менять цены, коммерческую модель, production-данные блога, базу данных, дизайн компонентов и визуальный стиль.
- Не создавать новые статьи блога: ссылки с названием статьи могут вести только на пять реально опубликованных slug из реестра.
- Общие фабрики отвечают только за форму данных; проблема, порядок работы, роли, ограничения, следующий шаг, связи и FAQ задаются отдельно для каждого маршрута.
- `MarketingProofBlock`, `MarketingProofMetric` и `proof` переименовать в `MarketingProcessComparison`, `MarketingProcessIndicator` и `processComparison`.
- `контур` использовать только как предметный термин; запретить пользовательские гибриды `customer-сценарий`, `customer-контур`, `AI-контур` и опечатку `ERP-контурe`.
- При первом упоминании расшифровывать `RFI`, `BIM/IFC`, `HSE` и `punch-list` по-русски.
- Каждый публичный title уникален и не длиннее 60 символов; каждый description уникален и имеет длину 70–160 символов.
- Canonical остаётся самоссылочным на `https://1мост.рф`; из коммерческих графов удалить `HowTo`, сохранив релевантные `WebPage`, `WebSite`, `Organization`, `BreadcrumbList`, `Product`, `Offer`, `Service`, `BlogPosting` и видимый `FAQPage`.
- `llms.txt` должен содержать H1 и Markdown-ссылки вида `[Название](https://1мост.рф/path)`.
- Локально не запускать `npm run build` и `npm run build:marketing`.

---

### Task 1: Зафиксировать SEO- и текстовые контракты тестами

**Files:**
- Modify: `src/data/marketing/marketingContent.test.ts:1-end`
- Modify: `src/data/marketing/siteIndex.test.ts:1-end`
- Modify: `src/utils/seo.test.ts:1-end`

**Interfaces:**
- Consumes: `marketingSeo`, `marketingSeoLandingPages`, `marketingCapabilityMatrix`, `marketingSolutionSegments`, `marketingCompany`, `marketingPaths`, `getPageSEOData`, `buildStructuredDataGraph`.
- Produces: регрессионные проверки `collectPublicMarketingText()` и `collectMarketingSeoEntries()` внутри тестового файла; production API не добавляется.

- [ ] **Step 1: Добавить обход всех публичных строк и проверки языка**

В `marketingContent.test.ts` добавить рекурсивный тестовый сборщик и проверки:

```ts
const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
};

it('не публикует старый бренд, технические гибриды и опечатки', () => {
  const publicText = collectStrings([
    marketingSeo,
    marketingSeoLandingPages,
    marketingCapabilityMatrix,
    marketingSolutionSegments,
    marketingCompany,
  ]).join('\n');

  expect(publicText).not.toMatch(/ProHelper|prohelper\.pro/i);
  expect(publicText).not.toMatch(/customer-(?:сценарий|контур)|AI-контур|ERP-контурe/iu);
});
```

- [ ] **Step 2: Добавить проверки уникальности и длины метаданных**

В `siteIndex.test.ts` получить SEO для каждого sitemap-маршрута и проверить контракт:

```ts
it('задаёт уникальные title и description допустимой длины', () => {
  const entries = marketingSitemapRoutes.map(({ path }) => ({
    route: path,
    seo: getPageSEOData(path),
  }));

  expect(new Set(entries.map(({ seo }) => seo.title)).size).toBe(entries.length);
  expect(new Set(entries.map(({ seo }) => seo.description)).size).toBe(entries.length);

  for (const { route, seo } of entries) {
    expect(seo.title.length, `${route}: title`).toBeLessThanOrEqual(60);
    expect(seo.description.length, `${route}: description`).toBeGreaterThanOrEqual(70);
    expect(seo.description.length, `${route}: description`).toBeLessThanOrEqual(160);
    expect(`${seo.title}\n${seo.description}`).not.toMatch(/ProHelper/i);
  }
});
```

- [ ] **Step 3: Зафиксировать отсутствие HowTo в итоговом графе**

В `seo.test.ts` добавить тест по всем коммерческим маршрутам:

```ts
it('не добавляет HowTo в structured-data graph коммерческих страниц', () => {
  for (const { path: pathname } of marketingSitemapRoutes.filter(({ path }) => path !== '/blog')) {
    const seo = getPageSEOData(pathname);
    const graph = buildStructuredDataGraph({
      pathname,
      title: seo.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
      noIndex: seo.noIndex,
      statusCode: 200,
      structuredData: seo.structuredData,
    });
    expect(JSON.stringify(graph), pathname).not.toContain('"@type":"HowTo"');
  }
});
```

- [ ] **Step 4: Запустить новые тесты и подтвердить красное состояние**

Run: `npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/utils/seo.test.ts`

Expected: FAIL на старом бренде, гибридных терминах, длине/повторах метаданных и наличии `HowTo`; существующие проверки canonical и sitemap продолжают выполняться.

- [ ] **Step 5: Зафиксировать тестовый контракт отдельным коммитом**

```bash
git add src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/utils/seo.test.ts
git commit -m "test[marketing]: зафиксированы SEO-контракты сайта"
```

### Task 2: Переименовать блок «доказательств» в честное сравнение процесса

**Files:**
- Modify: `src/types/marketing.ts:34-48,172`
- Modify: `src/data/marketing/seoPages.ts:15-55,474-2032`
- Modify: `src/data/marketing/seoProductPages.ts:25-86`
- Modify: `src/pages/landing/SeoClusterPage.tsx:184-248`
- Modify: `src/pages/landing/SeoClusterPage.test.tsx:1-end`

**Interfaces:**
- Consumes: существующая форма показателя `{ value, label, description }` и сравнения `{ eyebrow, title, description, metrics, note }`.
- Produces: `MarketingProcessIndicator`, `MarketingProcessComparison`, `MarketingSeoLandingPage.processComparison`.

- [ ] **Step 1: Добавить падающий компонентный тест новой терминологии**

В `SeoClusterPage.test.tsx` проверить, что fixture передаёт `processComparison`, а пользовательский заголовок описывает порядок работы:

```tsx
processComparison: {
  eyebrow: 'Как меняется работа',
  title: 'Заявка проходит один понятный маршрут',
  description: 'Сотрудники видят ответственного, статус и следующий шаг.',
  metrics: [
    { value: 'Одна карточка', label: 'Вместо переписки', description: 'История решения остаётся у заявки.' },
  ],
  note: 'Это описание процесса, а не обещание результата.',
},
```

Добавить `expect(screen.queryByText(/доказательств/i)).not.toBeInTheDocument()`.

- [ ] **Step 2: Запустить компонентный тест и подтвердить ошибку типов/рендера**

Run: `npx vitest run src/pages/landing/SeoClusterPage.test.tsx`

Expected: FAIL, потому что `MarketingSeoLandingPage` ещё требует `proof`.

- [ ] **Step 3: Переименовать production-типы без совместимого alias**

Заменить объявления в `marketing.ts`:

```ts
export interface MarketingProcessIndicator {
  value: string;
  label: string;
  description: string;
}

export interface MarketingProcessComparison {
  eyebrow: string;
  title: string;
  description: string;
  metrics: MarketingProcessIndicator[];
  note: string;
}
```

И поле страницы:

```ts
processComparison: MarketingProcessComparison;
```

- [ ] **Step 4: Механически перевести данные и компонент на новое имя**

В `seoPages.ts` переименовать `createProof` в:

```ts
const createProcessComparison = (
  comparison: MarketingSeoLandingPage['processComparison'],
) => comparison;
```

Во всех объектах заменить `proof:` на `processComparison:`, а в `SeoClusterPage.tsx` все чтения `page.proof` на `page.processComparison`. В заголовках блока использовать `Как меняется работа`, `Порядок работы в МОСТ` или предметный эквивалент; не использовать «доказательство», «результат клиента» и «эффект внедрения».

- [ ] **Step 5: Запустить типовой и компонентный контракт**

Run: `npx vitest run src/pages/landing/SeoClusterPage.test.tsx src/data/marketing/marketingContent.test.ts`

Expected: PASS для модели и компонента; контентные тесты Task 1 могут оставаться красными только по ещё не переписанным текстам.

- [ ] **Step 6: Зафиксировать архитектурное переименование**

```bash
git add src/types/marketing.ts src/data/marketing/seoPages.ts src/data/marketing/seoProductPages.ts src/pages/landing/SeoClusterPage.tsx src/pages/landing/SeoClusterPage.test.tsx
git commit -m "refactor[marketing]: переименовано сравнение рабочего процесса"
```

### Task 3: Нормализовать старый бренд в публичных данных блога

**Files:**
- Create: `src/utils/marketingBlogNormalizer.ts`
- Create: `src/utils/marketingBlogNormalizer.test.ts`
- Modify: `src/pages/blogIndexSsr.ts:1-end`
- Modify: `src/pages/catch-all.page.server.ts:1-130`
- Modify: `src/utils/blogPublicApi.ts:1-end`
- Modify: `src/pages/catch-all.page.server.test.ts:1-end`
- Modify: `src/pages/blogIndexSsr.test.ts:1-end`

**Interfaces:**
- Consumes: фактические типы статей и карточек из `blogPublicApi.ts`.
- Produces: `normalizeMarketingBlogText(value: string): string`, `normalizeMarketingBlogArticle<T extends BlogArticle>(article: T): T`.

- [ ] **Step 1: Написать unit-тесты чистой нормализации**

Создать `marketingBlogNormalizer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeMarketingBlogText } from './marketingBlogNormalizer';

describe('normalizeMarketingBlogText', () => {
  it.each([
    ['ProHelper помогает вести объект', 'МОСТ помогает вести объект'],
    ['Команда ProHelper', 'Команда МОСТ'],
    ['https://prohelper.pro/blog/a', 'https://1мост.рф/blog/a'],
    ['https://example.com/prohelper.pro', 'https://example.com/prohelper.pro'],
  ])('нормализует только старый бренд и его собственный домен', (source, expected) => {
    expect(normalizeMarketingBlogText(source)).toBe(expected);
  });
});
```

- [ ] **Step 2: Запустить unit-тест и подтвердить отсутствие модуля**

Run: `npx vitest run src/utils/marketingBlogNormalizer.test.ts`

Expected: FAIL с ошибкой импорта `marketingBlogNormalizer`.

- [ ] **Step 3: Реализовать чистую строковую нормализацию**

Создать `marketingBlogNormalizer.ts`:

```ts
const OLD_BRAND_PATTERN = /ProHelper/gi;
const OLD_SITE_PATTERN = /https?:\/\/(?:www\.)?prohelper\.pro(?=\/|["'\s<]|$)/gi;

export const normalizeMarketingBlogText = (value: string): string =>
  value.replace(OLD_SITE_PATTERN, 'https://1мост.рф').replace(OLD_BRAND_PATTERN, 'МОСТ');
```

Импортировать `BlogArticle` из `@/types/blog`. Добавить `normalizeMarketingBlogArticle<T extends BlogArticle>(article: T): T`, которая возвращает новый объект и нормализует только публичные строковые поля: `title`, `meta_title`, `meta_description`, `og_title`, `og_description`, `excerpt`, `content`, `author.name`; slug, даты, id и внешние URL не менять.

- [ ] **Step 4: Подключить один слой в SSR и клиентский поток**

В `blogIndexSsr.ts` нормализовать карточки сразу после валидации ответа API. В `catch-all.page.server.ts` нормализовать статью до вычисления SEO и `generateArticleSchema`. В каждом методе `blogPublicApi.ts`, возвращающем статью или коллекцию статей, применить ту же функцию после распаковки ответа, чтобы hydration получал те же строки, что SSR.

- [ ] **Step 5: Расширить SSR-тесты старой фикстурой**

Проверить в `catch-all.page.server.test.ts` и `blogIndexSsr.test.ts`, что исходные `ProHelper`, `Команда ProHelper` и `https://prohelper.pro` не попадают в `documentProps`, HTML-контент и JSON-LD, а вместо них присутствуют `МОСТ`, `Команда МОСТ` и `https://1мост.рф`.

- [ ] **Step 6: Запустить тесты нормализатора и SSR**

Run: `npx vitest run src/utils/marketingBlogNormalizer.test.ts src/pages/catch-all.page.server.test.ts src/pages/blogIndexSsr.test.ts src/renderer/serverSeo.test.ts`

Expected: PASS; SSR и клиент используют одну чистую нормализацию без изменения source-of-truth.

- [ ] **Step 7: Зафиксировать нормализацию**

```bash
git add src/utils/marketingBlogNormalizer.ts src/utils/marketingBlogNormalizer.test.ts src/pages/blogIndexSsr.ts src/pages/catch-all.page.server.ts src/utils/blogPublicApi.ts src/pages/catch-all.page.server.test.ts src/pages/blogIndexSsr.test.ts
git commit -m "fix[marketing]: нормализован бренд в публичном блоге"
```

### Task 4: Ввести реестр реальных статей и честную перелинковку

**Files:**
- Create: `src/data/marketing/blogArticles.ts`
- Create: `src/data/marketing/blogArticles.test.ts`
- Modify: `src/types/marketing.ts:180-190`
- Modify: `src/data/marketing/seoPages.ts:541-2032`
- Modify: `src/data/marketing/seoProductPages.ts:62-185`
- Modify: `src/data/marketing/marketingContent.test.ts:1-end`

**Interfaces:**
- Consumes: `MarketingContentLink`.
- Produces: `MarketingBlogArticleKey`, `MarketingBlogArticleReference`, `marketingBlogArticles`, `getMarketingBlogLink(key, description)`.

- [ ] **Step 1: Написать тест полного реестра**

Создать тест, который ожидает ровно пять canonical href и запрещает статьям общий `/blog`:

```ts
const expectedPaths = [
  '/blog/kak-prorabu-derzhat-obekt-bez-haosa',
  '/blog/chto-dolzhno-byt-u-pto-v-odnoy-sisteme',
  '/blog/chto-rukovoditel-stroitelstva-dolzhen-videt-kazhdoe-utro',
  '/blog/kak-snabzhentsu-perestat-sobirat-zayavki-iz-chatov',
  '/blog/kak-kontrolirovat-podryadchikov-na-obekte-bez-razborok',
];

expect(Object.values(marketingBlogArticles).map(({ href }) => href).sort()).toEqual(expectedPaths.sort());
expect(Object.values(marketingBlogArticles).every(({ title }) => title.length > 20)).toBe(true);
```

- [ ] **Step 2: Запустить тест и подтвердить отсутствие реестра**

Run: `npx vitest run src/data/marketing/blogArticles.test.ts`

Expected: FAIL с ошибкой импорта `blogArticles`.

- [ ] **Step 3: Создать неизменяемый типизированный реестр**

В `blogArticles.ts` объявить пять ключей с фактическими заголовками и назначением:

```ts
export const marketingBlogArticles = {
  foremanOrder: {
    title: 'Как прорабу держать объект без хаоса',
    href: '/blog/kak-prorabu-derzhat-obekt-bez-haosa',
    purpose: 'Организация ежедневных задач и фиксации факта на площадке.',
  },
  ptoWorkspace: {
    title: 'Что должно быть у ПТО в одной системе',
    href: '/blog/chto-dolzhno-byt-u-pto-v-odnoy-sisteme',
    purpose: 'Рабочее пространство ПТО для документов, статусов и замечаний.',
  },
  managerMorning: {
    title: 'Что руководитель строительства должен видеть каждое утро',
    href: '/blog/chto-rukovoditel-stroitelstva-dolzhen-videt-kazhdoe-utro',
    purpose: 'Набор данных для ежедневной управленческой проверки объектов.',
  },
  procurementChats: {
    title: 'Как снабженцу перестать собирать заявки из чатов',
    href: '/blog/kak-snabzhentsu-perestat-sobirat-zayavki-iz-chatov',
    purpose: 'Порядок обработки заявок на материалы вне разрозненной переписки.',
  },
  contractorControl: {
    title: 'Как контролировать подрядчиков на объекте без разборок',
    href: '/blog/kak-kontrolirovat-podryadchikov-na-obekte-bez-razborok',
    purpose: 'Фиксация объёмов, сроков и замечаний в работе подрядчиков.',
  },
} as const;

export type MarketingBlogArticleKey = keyof typeof marketingBlogArticles;
```

Хелпер должен возвращать существующий `MarketingContentLink`:

```ts
export const getMarketingBlogLink = (
  key: MarketingBlogArticleKey,
  description = marketingBlogArticles[key].purpose,
): MarketingContentLink => ({
  label: marketingBlogArticles[key].title,
  href: marketingBlogArticles[key].href,
  description,
});
```

- [ ] **Step 4: Заменить вымышленные статьи на релевантные реальные ссылки**

Распределить реальные материалы по смыслу:

| Страница/группа | Разрешённые статьи |
| --- | --- |
| прораб, площадка, качество, безопасность, приёмка | `foremanOrder`, `managerMorning` |
| ПТО, документы, ПИР, изменения | `ptoWorkspace`, `managerMorning` |
| снабжение, материалы, заявки, платежи, 1С | `procurementChats`, `managerMorning` |
| подрядчики, договоры, маркетплейс | `contractorControl`, `managerMorning` |
| ERP, руководство, пульс проекта | `managerMorning`, затем предметная статья из соседнего процесса |

Если странице не подходит конкретная статья, использовать `{ label: 'Все статьи', href: marketingPaths.blog, description: 'Практические материалы команды МОСТ.' }`; не маскировать `/blog` названием несуществующего материала.

- [ ] **Step 5: Добавить общий контракт ссылок в marketingContent.test.ts**

Собрать все `blogLinks`: если `href === '/blog'`, label разрешён только `Все статьи` или `Блог МОСТ`; любой другой href обязан совпадать с `marketingBlogArticles` и иметь тот же title.

- [ ] **Step 6: Запустить тесты контента и реестра**

Run: `npx vitest run src/data/marketing/blogArticles.test.ts src/data/marketing/marketingContent.test.ts`

Expected: PASS для перелинковки; языковые проверки Task 1 могут оставаться красными только по текстам следующих задач.

- [ ] **Step 7: Зафиксировать реестр и перелинковку**

```bash
git add src/data/marketing/blogArticles.ts src/data/marketing/blogArticles.test.ts src/data/marketing/seoPages.ts src/data/marketing/seoProductPages.ts src/data/marketing/marketingContent.test.ts
git commit -m "fix[marketing]: ссылки привязаны к реальным статьям"
```

### Task 5: Исправить structured data и единый SEO-контракт

**Files:**
- Modify: `src/utils/seo.ts:60-197,445-473,594-685`
- Modify: `src/utils/seo.test.ts:1-end`
- Modify: `src/hooks/useSEO.test.tsx:1-end`
- Modify: `src/renderer/serverSeo.test.ts:1-end`

**Interfaces:**
- Consumes: `getPageSEOData(pathname)`, `buildStructuredDataGraph({ pathname, article? })`.
- Produces: коммерческий JSON-LD без `HowTo`; статья с canonical МОСТ и нормализованным publisher.

- [ ] **Step 1: Удалить создание HowTo из коммерческого графа**

В `resolveClusterStructuredData()` убрать вызов `generateHowToSchema`. Если `generateHowToSchema` больше не импортируется и не тестируется как публичный utility, удалить функцию целиком. FAQ добавлять только когда тот же вопрос и ответ видимы в данных страницы.

- [ ] **Step 2: Сохранить релевантные узлы и canonical**

Для обычной страницы итоговый граф должен содержать `WebPage`, `WebSite`, `Organization`, `BreadcrumbList` и предметный `Service`/`Product`; для pricing также `Offer`; для статьи — `BlogPosting`. `@id`, `url`, `mainEntityOfPage` и publisher должны строиться через canonical origin МОСТ, а не из URL API.

- [ ] **Step 3: Обновить SEO-тесты точными ожиданиями**

Удалить ожидания `HowTo`, добавить проверки допустимых типов и видимого FAQ:

```ts
const types = graph['@graph'].map((node) => node['@type']);
expect(types).not.toContain('HowTo');
expect(types).toContain('WebPage');
expect(types).toContain('Organization');
```

В SSR-тесте статьи проверить `publisher.name === 'МОСТ'` и `mainEntityOfPage` на `https://1мост.рф/blog/<slug>`.

- [ ] **Step 4: Запустить SEO, hook и SSR-тесты**

Run: `npx vitest run src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts src/pages/catch-all.page.server.test.ts`

Expected: PASS, включая canonical, OG, sitemap-related SEO и отсутствие `HowTo`.

- [ ] **Step 5: Зафиксировать разметку**

```bash
git add src/utils/seo.ts src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts
git commit -m "fix[marketing]: актуализирована структурированная разметка"
```

### Task 6: Переписать общие и сегментные страницы

**Files:**
- Modify: `src/data/marketing/common.ts:1-end`
- Modify: `src/data/marketing/home.ts:1-end`
- Modify: `src/data/marketing/solutions.ts:1-end`
- Modify: `src/data/marketing/trust.ts:1-end`
- Modify: `src/data/marketing/capabilities.ts:1-end`
- Modify: `src/pages/landing/HomePage.tsx:150-260`
- Modify: `src/pages/landing/SolutionsPage.tsx:1-end`
- Modify: `src/pages/landing/FeaturesPage.tsx:1-end`
- Modify: `src/pages/landing/PricingPage.tsx:1-end`
- Modify: `src/pages/product/IntegrationsPage.tsx:1-end`
- Modify: `src/pages/solutions/ContractorsPage.tsx:1-end`
- Modify: `src/pages/solutions/DevelopersPage.tsx:1-end`
- Modify: `src/pages/solutions/EnterprisePage.tsx:1-end`
- Modify: `src/pages/company/AboutPage.tsx:1-end`
- Modify: `src/pages/company/SecurityPage.tsx:1-end`
- Modify: `src/pages/company/ContactPage.tsx:1-end`
- Modify: `src/pages/resources/BlogPage.tsx:1-end`

**Interfaces:**
- Consumes: существующие типы секций, CTA и `marketingPaths`.
- Produces: уникальные тексты 12 общих маршрутов без изменения layout и API.

- [ ] **Step 1: Переписать общие брендовые значения**

В `common.ts` удалить `ProHelper` из keywords и публичных строк. Общие CTA оставить навигационными: `Посмотреть возможности`, `Выбрать решение`, `Запросить демонстрацию`, `Связаться с командой`. Не использовать общий абзац про «единый контур» на разных страницах.

- [ ] **Step 2: Дать каждому общему маршруту отдельный смысл**

Переписать hero, основные секции, FAQ и CTA строго по матрице:

| Маршрут | Главный вопрос страницы | Обязательная конкретика |
| --- | --- | --- |
| `/` | Что такое МОСТ | объекты, задачи, документы, снабжение, финансы в одной системе |
| `/solutions` | Кому и для какой работы подходит | выбор по типу компании и роли |
| `/features` | Какие функции доступны | обзор возможностей без привязки к одному процессу |
| `/pricing` | Сколько стоит и что входит | пакеты, пробный период, правила подключения; цены не менять |
| `/integrations` | Как обмениваются данные | 1С, справочники, документы, ответственность за настройку |
| `/contractors` | Как работает подрядная организация | объект, бригада, объём, документ, оплата |
| `/developers` | Что видит девелопер/техзаказчик | портфель, сроки, замечания, отчётность |
| `/enterprise` | Как управлять группой компаний | разделение организаций, объектов, прав и сводных данных |
| `/about` | Зачем создан продукт | назначение и принципы команды без псевдоистории успеха |
| `/security` | Как защищены рабочие данные | роли, доступы, файлы, история действий; только подтверждённые механизмы |
| `/contact` | Что произойдёт после обращения | состав заявки и следующий шаг без гарантии срока |
| `/blog` | Какие материалы опубликованы | практические статьи по управлению стройкой |

- [ ] **Step 3: Сократить перегруженные метаданные общих страниц**

Для каждого маршрута задать отдельный title до 60 символов и description 70–160 символов. Title начинается с предметного запроса, бренд добавляется только если помещается естественно; description отвечает на главный вопрос маршрута и не повторяет соседнюю страницу.

- [ ] **Step 4: Проверить общие страницы тестами**

Run: `npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/data/marketing/packages.test.ts src/data/marketing/publicCommercialModel.contract.test.ts`

Expected: тесты страниц и метаданных общих маршрутов PASS; оставшиеся падения языкового контракта допускаются только в `seoPages.ts`/`seoProductPages.ts` до Tasks 7–8.

- [ ] **Step 5: Зафиксировать общие страницы**

```bash
git add src/data/marketing/common.ts src/data/marketing/home.ts src/data/marketing/solutions.ts src/data/marketing/trust.ts src/data/marketing/capabilities.ts src/pages/landing
git commit -m "refactor[marketing]: переписаны основные страницы сайта"
```

### Task 7: Переписать вручную описанные коммерческие кластеры

**Files:**
- Modify: `src/data/marketing/seoPages.ts:58-1534`
- Modify: `src/data/marketing/marketingContent.test.ts:1-end`
- Modify: `src/data/marketing/commercialBoundary.test.ts:1-end`

**Interfaces:**
- Consumes: `MarketingSeoLandingPage`, `getMarketingBlogLink`, `processComparison`.
- Produces: уникальный полный контент маршрутов `/foreman-software` — `/construction-budget-control`.

- [ ] **Step 1: Переписать первые девять кластеров по отдельным интентам**

Для каждого объекта отдельно задать hero, problem, workflow, roles, `processComparison`, limitations, related links, реальные blog links, FAQ и CTA:

| Маршрут | Предметный словарь | Ограничение, которое надо назвать честно |
| --- | --- | --- |
| `/foreman-software` | смена, задача, фото, журнал, отклонение | данные зависят от дисциплины фиксации на площадке |
| `/construction-crm` | клиент, договор, объект, этап, обязательство | МОСТ не заменяет отраслевую бухгалтерию |
| `/construction-erp` | ресурсы, бюджет, объект, управленческий учёт | глубина ERP-процесса зависит от настроенных справочников и интеграций |
| `/material-accounting` | заявка, приход, перемещение, списание, остаток | фактический остаток требует своевременного ввода операций |
| `/pto-software` | исполнительная документация, комплект, статус, замечание | документы готовят и проверяют ответственные специалисты |
| `/contractor-control` | подрядчик, договор, объём, срок, замечание | система показывает зафиксированные данные, а не оценивает подрядчика сама |
| `/construction-documents` | версия, согласование, доступ, архив | юридическая значимость зависит от принятого регламента и ЭП |
| `/construction-budget-control` | бюджет, лимит, обязательство, факт, отклонение | точность зависит от полноты заявок, договоров и оплат |
| `/pir-project-documentation` не входит в этот task | — | переносится в Task 8 вместе с фабричными страницами |

`RFI` при первом употреблении писать как «запрос информации (RFI)»; `BIM/IFC` — «информационная модель и формат IFC».

- [ ] **Step 2: Удалить массовые речевые шаблоны**

В этих объектах заменить абстрактные `контур`, `сценарий`, `покажем`, `разберём`, `определим` на конкретные действия. Допустимы одинаковые подписи кнопок и навигации, но не одинаковые problem/description/FAQ-ответы между маршрутами.

- [ ] **Step 3: Добавить тест смысловой неповторяемости**

В `marketingContent.test.ts` нормализовать пробелы и проверить, что длинные строки от 120 символов не повторяются на двух SEO-страницах. Исключить из проверки юридический текст и общие подписи CTA, которые короче порога.

- [ ] **Step 4: Запустить контентные и коммерческие boundary-тесты**

Run: `npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/commercialBoundary.test.ts src/pages/landing/SeoClusterPage.test.tsx`

Expected: обработанные маршруты проходят язык, честные ограничения и отсутствие повторов; фабричные страницы Task 8 могут оставаться единственным источником падений.

- [ ] **Step 5: Зафиксировать первую группу кластеров**

```bash
git add src/data/marketing/seoPages.ts src/data/marketing/marketingContent.test.ts src/data/marketing/commercialBoundary.test.ts
git commit -m "refactor[marketing]: уточнены ключевые SEO-кластеры"
```

### Task 8: Сделать фабрики структурными и переписать оставшиеся кластеры

**Files:**
- Modify: `src/data/marketing/seoPages.ts:15-55,1535-2032`
- Modify: `src/data/marketing/seoProductPages.ts:1-185`
- Modify: `src/data/marketing/marketingContent.test.ts:1-end`
- Modify: `src/data/marketing/siteIndex.test.ts:1-end`

**Interfaces:**
- Consumes: `MarketingSeoLandingPage`, `getMarketingBlogLink`, `createProcessComparison`.
- Produces: фабрики, которые принимают готовые уникальные блоки, и полный контент оставшихся 14 коммерческих маршрутов.

- [ ] **Step 1: Изменить контракты фабрик**

`OperationalSeoPageConfig` и `ProductSeoPageConfig` должны принимать готовые поля `problem`, `workflow`, `roles`, `processComparison`, `limitations`, `relatedLinks`, `blogLinks`, `faq`, `cta`. Фабрики возвращают только объединение `seo`, hero и переданных блоков; внутри фабрик не должно оставаться пользовательских предложений, универсальных метрик или сгенерированных FAQ.

```ts
const createProductSeoPage = (config: ProductSeoPageConfig): MarketingSeoLandingPage => ({
  seo: config.seo,
  hero: config.hero,
  problem: config.problem,
  workflow: config.workflow,
  roles: config.roles,
  processComparison: config.processComparison,
  limitations: config.limitations,
  relatedLinks: config.relatedLinks,
  blogLinks: config.blogLinks,
  faq: config.faq,
  cta: config.cta,
});
```

- [ ] **Step 2: Переписать операционные страницы**

Задать отдельные тексты и ограничения:

| Маршрут | Основной интент | Обязательное пояснение |
| --- | --- | --- |
| `/pir-project-documentation` | ПД, РД, замечания, выпуск комплектов | версия и статус не заменяют инженерную проверку |
| `/construction-safety` | охрана труда, инструктажи, нарушения | `HSE` раскрыть как охрану труда, промышленную и экологическую безопасность |
| `/construction-quality-control` | дефект, проверка, устранение | решение о качестве принимает ответственный специалист |
| `/handover-acceptance` | приёмка зон и перечень замечаний | `punch-list` раскрыть как перечень замечаний при приёмке |
| `/machinery-and-labor` | техника, смены, фактическая выработка | телематика и табели зависят от подключённых источников |
| `/change-control` | RFI, изменения, дополнительные работы | влияние на деньги и срок подтверждают уполномоченные участники |

- [ ] **Step 3: Переписать продуктовые страницы**

| Маршрут | Основной интент | Обязательное ограничение |
| --- | --- | --- |
| `/mobile-app` | действия площадки с телефона | доступность функций зависит от роли и связи |
| `/ai-estimates` | предварительный разбор чертежа | результат требует обязательной экспертной проверки и не является готовой сметой |
| `/construction-procurement` | потребность, предложения, выбор поставщика | решение о поставщике принимает сотрудник |
| `/site-requests` | заявка с объекта до поставки и приёмки | скорость зависит от маршрута согласования компании |
| `/workforce-management` | бригады, смены, допуски, рабочее время | данные не заменяют кадровый и зарплатный учёт |
| `/construction-payments` | заявка на оплату, лимит, согласование | платёж выполняется во внешней финансовой системе, если интеграция не настроена |
| `/1c-integration` | обмен справочниками и документами с 1С | состав обмена определяется проектом интеграции |
| `/contractor-marketplace` | поиск и приглашение подрядчика | наличие профиля не является гарантией качества или допуска к работам |
| `/project-pulse` | сигналы для ежедневной проверки руководителя | сигнал требует проверки исходных данных и управленческого решения |

- [ ] **Step 4: Проверить полный набор 35 маршрутов**

Run: `npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/data/marketing/commercialBoundary.test.ts src/pages/landing/SeoClusterPage.test.tsx`

Expected: PASS без исключений; все 35 маршрутов имеют уникальные метаданные, отдельный смысл, честные ограничения и разрешённые blog links.

- [ ] **Step 5: Зафиксировать фабрики и вторую группу кластеров**

```bash
git add src/data/marketing/seoPages.ts src/data/marketing/seoProductPages.ts src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts
git commit -m "refactor[marketing]: разделено содержание SEO-страниц"
```

### Task 9: Исправить llms.txt и провести статическую текстовую чистку

**Files:**
- Modify: `public/llms.txt:1-end`
- Modify: `src/data/marketing/common.ts:1-end`
- Modify: только найденные пользовательские строки в `src/data/marketing/*.ts`, `src/pages/landing/*.tsx`, `src/pages/resources/*.tsx`.
- Modify: `src/data/marketing/marketingContent.test.ts:1-end`

**Interfaces:**
- Consumes: canonical маршруты МОСТ.
- Produces: валидный Markdown-файл для агентного аудита и нулевой остаток запрещённых пользовательских формулировок.

- [ ] **Step 1: Добавить тест формата llms.txt**

В `marketingContent.test.ts` прочитать файл и проверить:

```ts
const llms = fs.readFileSync(path.resolve(process.cwd(), 'public/llms.txt'), 'utf8');
expect(llms).toMatch(/^# МОСТ/m);
expect(llms).toMatch(/\[[^\]]+\]\(https:\/\/1мост\.рф\/[^)]*\)/u);
expect(llms).not.toMatch(/ProHelper|prohelper\.pro/i);
```

- [ ] **Step 2: Переписать llms.txt в компактный Markdown**

Сохранить H1, два предложения о назначении МОСТ и разделы `Основные страницы`, `Решения`, `Материалы`. Каждая строка списка — Markdown-ссылка на существующий canonical; включить `/`, `/solutions`, `/features`, `/pricing`, `/integrations`, `/security`, `/contact`, `/blog` и ключевые коммерческие кластеры без несуществующих URL.

- [ ] **Step 3: Выполнить статический поиск остаточных проблем**

Run: `rg -n -i "ProHelper|prohelper\.pro|customer-(сценарий|контур)|AI-контур|ERP-контурe" src/data/marketing src/pages/landing src/pages/resources public/llms.txt`

Expected: нет совпадений, кроме явно разрешённых тестовых входов в `marketingBlogNormalizer.test.ts`, которые не входят в перечисленные production-каталоги.

- [ ] **Step 4: Проверить массовые слова и вручную оценить контекст**

Run: `rg -n -i "контур|сценар" src/data/marketing src/pages/landing src/pages/resources`

Expected: остаются только предметные употребления вроде «контур учёта» при необходимости или «сценарий внедрения»; универсальные маркетинговые заменители удалены.

- [ ] **Step 5: Запустить контентные тесты**

Run: `npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts`

Expected: PASS, включая H1, Markdown-ссылки и отсутствие старого бренда.

- [ ] **Step 6: Зафиксировать финальную текстовую чистку**

```bash
git add public/llms.txt src/data/marketing src/pages/landing src/pages/resources
git commit -m "fix[marketing]: завершена текстовая SEO-чистка"
```

### Task 10: Финальная проверка без локальной сборки

**Files:**
- Verify: все изменённые `.ts`, `.tsx`, `.md`, `.txt`.
- Verify: `src/data/marketing/sitemapRoutes.json`, `server/sitemap.cjs`, SSR/canonical тесты без изменения маршрутов.

**Interfaces:**
- Consumes: результат Tasks 1–9.
- Produces: подтверждённый зелёный набор целевых тестов, TypeScript и статических проверок.

- [ ] **Step 1: Запустить полный целевой набор Vitest**

Run:

```bash
npx vitest run src/data/marketing/marketingContent.test.ts src/data/marketing/siteIndex.test.ts src/data/marketing/commercialBoundary.test.ts src/data/marketing/blogArticles.test.ts src/utils/marketingBlogNormalizer.test.ts src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts src/pages/catch-all.page.server.test.ts src/pages/blogIndexSsr.test.ts src/pages/landing/SeoClusterPage.test.tsx
```

Expected: все тесты PASS, exit code 0.

- [ ] **Step 2: Запустить TypeScript-проверку**

Run: `npx tsc --noEmit`

Expected: exit code 0 без ошибок типов.

- [ ] **Step 3: Отформатировать и проверить только изменённые frontend-файлы**

Получить список через `git diff --name-only --diff-filter=ACMR`, выбрать изменённые `.ts`, `.tsx`, `.md`, `.txt`. Для `.ts/.tsx` запустить существующие package scripts ESLint/Prettier в режиме конкретных файлов; если scripts не принимают пути, использовать `npx eslint <files>` и `npx prettier --check <files>`.

Expected: ESLint и Prettier завершаются с exit code 0; formatter не затрагивает посторонние файлы.

- [ ] **Step 4: Выполнить локальный SEO-аудит исходников**

Run:

```bash
rg -n -i "ProHelper|prohelper\.pro|customer-(сценарий|контур)|AI-контур|ERP-контурe" src/data/marketing src/pages/landing src/pages/resources public/llms.txt
git diff --check
git status --short
```

Expected: первый поиск не возвращает production-совпадений; `git diff --check` не сообщает пробельных ошибок; status содержит только файлы этой задачи.

- [ ] **Step 5: Проверить отсутствие случайных изменений маршрутов и цен**

Run: `git diff -- src/data/marketing/sitemapRoutes.json server/sitemap.cjs`

Expected: пустой diff. Сравнить pricing diff вручную: числовые значения цен и состав пакетов не изменены, сокращены только title/description и пользовательские пояснения.

- [ ] **Step 6: Не запускать запрещённую сборку**

Не выполнять `npm run build` и `npm run build:marketing`. Достаточное локальное подтверждение: целевые Vitest, `npx tsc --noEmit`, lint/format изменённых файлов и SSR-тесты.

- [ ] **Step 7: Создать итоговый коммит только при наличии форматирующих правок**

```bash
git add src public/llms.txt
git commit -m "style[marketing]: выровнено форматирование SEO-изменений"
```

Если `git diff --cached --quiet` возвращает 0, отдельный style-коммит не создавать.

- [ ] **Step 8: После деплоя повторить публичный crawl**

Проверить все 35 canonical-страниц, sitemap, robots, SSR title/description, JSON-LD, внутренние ссылки и публичный HTML блога. Сравнить с локальными критериями; production не изменять через диагностический доступ.
