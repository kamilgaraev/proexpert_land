# Yandex Metrika Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести публичный маркетинговый сайт МОСТ на счётчик `110599591`, исключить личный кабинет и гарантировать один просмотр для каждой SPA-страницы.

**Architecture:** Единый идентификатор экспортируется модулем аналитики и используется компонентом, целями и событиями. Доменная и маршрутная фильтрация остаётся в чистых функциях, а React-компонент различает первичную инициализацию и последующие изменения полного URL, отправляя ручной `hit` только для SPA-переходов.

**Tech Stack:** React 19, React Router 6, TypeScript 5.8, Vitest 4, Testing Library.

## Global Constraints

- Счётчик: `110599591`.
- Разрешённые хосты: `1мост.рф` и `www.1мост.рф`.
- `lk.1мост.рф`, другие поддомены, локальные хосты и внутренние маршруты не отслеживаются.
- Аналитика запускается только после согласия на аналитические cookie.
- Параметры инициализации: `ssr`, `webvisor`, `clickmap`, `ecommerce: "dataLayer"`, `accurateTrackBounce`, `trackLinks`.
- Сборка проекта не запускается.

---

### Task 1: Доменная фильтрация и единый идентификатор

**Files:**
- Modify: `src/utils/publicSite.ts`
- Create: `src/components/analytics/YandexMetrika.test.tsx`
- Modify: `src/components/analytics/YandexMetrika.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `YANDEX_METRIKA_COUNTER_ID: number`.
- Produces: `isPrimaryMarketingHost(hostname: string): boolean` с поддержкой `1мост.рф` и `www.1мост.рф`.

- [ ] **Step 1: Написать падающие тесты хостов и идентификатора**

Добавить проверки разрешённых основных хостов, запрета `lk.1мост.рф` и использования `110599591` в вызовах целей.

- [ ] **Step 2: Подтвердить RED**

Run: `npx vitest run src/components/analytics/YandexMetrika.test.tsx`

Expected: FAIL, потому что текущий ID равен `102888970`, а `www.1мост.рф` не разрешён.

- [ ] **Step 3: Реализовать минимальные изменения**

Экспортировать `YANDEX_METRIKA_COUNTER_ID = 110599591`, использовать его в `App`, `trackYandexGoal`, `trackYandexEvent`; обновить точное сравнение разрешённых хостов.

- [ ] **Step 4: Подтвердить GREEN**

Run: `npx vitest run src/components/analytics/YandexMetrika.test.tsx`

Expected: PASS.

### Task 2: Инициализация и SPA-просмотры без дублей

**Files:**
- Modify: `src/components/analytics/YandexMetrika.test.tsx`
- Modify: `src/components/analytics/YandexMetrika.tsx`

**Interfaces:**
- Consumes: `YANDEX_METRIKA_COUNTER_ID` и текущий React Router location.
- Produces: один автоматический первичный просмотр и один ручной `hit` на каждый новый полный SPA URL.

- [ ] **Step 1: Написать падающие тесты инициализации и навигации**

Проверить наличие `ssr:true`, `ecommerce:"dataLayer"`, отсутствие `trackHash`, отсутствие ручного `hit` после первичной инициализации, один `hit` после перехода и отсутствие дубля для того же URL.

- [ ] **Step 2: Подтвердить RED**

Run: `npx vitest run src/components/analytics/YandexMetrika.test.tsx`

Expected: FAIL на параметрах нового счётчика и первичном дублирующем `hit`.

- [ ] **Step 3: Реализовать минимальную SPA-логику**

Добавить параметры нового счётчика, убрать `trackHash`, хранить предыдущий полный URL в `useRef`, пропускать ручной `hit` при первой инициализации и одинаковом URL, передавать предыдущий SPA URL как `referer`.

- [ ] **Step 4: Подтвердить GREEN и качество**

Run: `npx vitest run src/components/analytics/YandexMetrika.test.tsx`

Run: `npx tsc --noEmit`

Run: `npx eslint src/components/analytics/YandexMetrika.tsx src/components/analytics/YandexMetrika.test.tsx src/utils/publicSite.ts src/App.tsx`

Expected: все команды завершаются успешно без ошибок.
