# Billing Customer Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Обновить тестовую ЮKassa для всех организаций и сделать страницы выбора пакетов в МОСТ понятными клиенту.

**Architecture:** Backend сохраняет единую политику допуска к платёжному провайдеру: пустой список разрешает все организации только в тестовом режиме, непустой остаётся allowlist. Личный кабинет и маркетинговый сайт используют существующие коммерческие API и данные, меняя только пользовательскую подачу, взаимодействие карточек и тексты без изменения расчётов.

**Tech Stack:** Laravel 11 / PHP 8.2 / PHPUnit / Larastan; React / TypeScript / Vite / Vitest / Testing Library / TailwindCSS.

## Global Constraints

- Продукт во всех пользовательских текстах называется «МОСТ».
- Не использовать «бесплатная база», «коммерческий контур», «расчёт сервера», «источник доступа», «текущий период», «узел», «система 01—10» и «72 часа».
- Пустой список организаций открывает оплату всем только при `yookassa_test`; непустой список ограничивает доступ.
- Цены и коммерческая логика не меняются.
- В режиме без пакетов платные разделы скрываются сразу и не открываются по прямой ссылке.
- Не запускать локальные миграции, dev-серверы и frontend build.
- Не изменять и не коммитить `node_modules`.

---

### Task 1: Политика тестового магазина

**Files:**
- Modify: `prohelper/tests/Unit/Billing/CommercialPaymentProviderPolicyTest.php`
- Modify: `prohelper/app/Services/Billing/CommercialPaymentProviderPolicy.php`
- Modify: `prohelper/.github/workflows/deploy-backend.yml`
- Modify: `prohelper/tests/Unit/Deployment/DockerComposeSecurityTest.php`

**Interfaces:**
- Consumes: `services.yookassa.mode`, `services.yookassa.test_organization_ids`.
- Produces: `CommercialPaymentProviderPolicy::assertCanCharge(int $organizationId): void` с разрешением всех организаций при пустом списке только в `yookassa_test`.

- [ ] **Step 1: Write the failing policy test**

Добавить тест, который устанавливает `yookassa_test` и пустой список, вызывает `assertCanCharge(42)` и ожидает отсутствие исключения. Сохранить существующий тест, подтверждающий отказ организации вне непустого списка.

- [ ] **Step 2: Run test to verify it fails**

Run: `php vendor/bin/phpunit tests/Unit/Billing/CommercialPaymentProviderPolicyTest.php`
Expected: FAIL в новом тесте с `PaymentGatewayConfigurationException`.

- [ ] **Step 3: Implement the minimal policy change**

В `assertCanCharge()` возвращаться без ошибки, если режим тестовый и список разрешённых ID пуст; для непустого списка сохранить строгую проверку `in_array(..., true)`.

- [ ] **Step 4: Cover deployment semantics**

Обновить deployment-тест и workflow так, чтобы отсутствующий `YOOKASSA_TEST_ORGANIZATION_IDS` передавался как пустая строка и не отключал настроенный тестовый магазин.

- [ ] **Step 5: Verify backend**

Run: `php vendor/bin/phpunit tests/Unit/Billing/CommercialPaymentProviderPolicyTest.php tests/Unit/Deployment/DockerComposeSecurityTest.php`
Expected: PASS, 0 failures.

Run: `php -l app/Services/Billing/CommercialPaymentProviderPolicy.php`
Expected: `No syntax errors detected`.

Run: `php vendor/bin/phpstan analyse app/Services/Billing/CommercialPaymentProviderPolicy.php --memory-limit=1G`
Expected: `[OK] No errors`.

- [ ] **Step 6: Commit**

```bash
git add app/Services/Billing/CommercialPaymentProviderPolicy.php tests/Unit/Billing/CommercialPaymentProviderPolicyTest.php .github/workflows/deploy-backend.yml tests/Unit/Deployment/DockerComposeSecurityTest.php
git commit -m "feat[lk]: тестовая оплата открыта всем организациям"
```

### Task 2: Понятный выбор пакетов в личном кабинете

**Files:**
- Modify: `prohelper_land/src/pages/dashboard/BillingPage.commercial.test.tsx`
- Modify: `prohelper_land/src/pages/dashboard/BillingPage.tsx`
- Modify: `prohelper_land/src/components/dashboard-layout/dashboard-search.ts`
- Modify: `prohelper_land/src/components/dashboard-layout/dashboard-search.test.ts`

**Interfaces:**
- Consumes: существующие `CommercialPackage`, `CommercialQuote`, `CommercialRenewalState` и методы `commercialBillingService` без изменения контрактов.
- Produces: кликабельные карточки пакетов, понятный блок «Ваш выбор» и клиентские тексты.

- [ ] **Step 1: Write failing UI tests**

Проверить заголовки «Пакеты для вашей команды», «Выберите нужные возможности», «Ваш выбор», подпись «3 дня бесплатно», отсутствие запрещённых терминов и переключение пакета нажатием на карточку. Проверить, что нажатие кнопки пробного доступа не переключает карточку.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run src/pages/dashboard/BillingPage.commercial.test.tsx src/components/dashboard-layout/dashboard-search.test.ts`
Expected: FAIL по новым текстам и взаимодействию карточки.

- [ ] **Step 3: Implement customer-facing page**

Обновить hero, компактный бесплатный статус, заголовки каталога, карточки и sticky summary. Карточке дать доступное имя, `aria-pressed`, клавиатурное управление и заметный выбранный стиль. Остановить всплытие события от кнопки пробного доступа.

- [ ] **Step 4: Verify focused frontend tests**

Run: `node node_modules/vitest/vitest.mjs run src/pages/dashboard/BillingPage.commercial.test.tsx src/components/dashboard-layout/dashboard-search.test.ts`
Expected: PASS, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/BillingPage.tsx src/pages/dashboard/BillingPage.commercial.test.tsx src/components/dashboard-layout/dashboard-search.ts src/components/dashboard-layout/dashboard-search.test.ts
git commit -m "feat[lk]: выбор пакетов изложен понятным языком"
```

### Task 3: Согласованный бесплатный доступ и навигация админки

**Files:**
- Modify: `prohelper/config/ModuleList/addons/contractor-portal.json`
- Modify: `prohelper/config/ModuleList/addons/one-c-basic-exchange.json`
- Modify: `prohelper/app/Services/Billing/CommercialWebhookService.php`
- Modify: `prohelper/app/Services/Billing/CommercialRenewalService.php`
- Modify: `prohelper/tests/Feature/Billing/OrganizationPackageEntitlementTest.php`
- Modify: `prohelper/tests/Feature/Billing/CommercialWebhookServiceTest.php`
- Modify: `prohelper/tests/Feature/Billing/CommercialRenewalServiceTest.php`
- Modify: `prohelper_admin/src/components/layout/SidebarMenu.tsx`
- Modify: `prohelper_admin/src/components/layout/SidebarMenu.test.tsx`
- Modify: `prohelper_admin/src/App.tsx`
- Modify: `prohelper_admin/src/App.dashboardRoutes.test.tsx`

**Interfaces:**
- Consumes: `OrganizationEntitlementService`, `AccessController::clearAccessCache(int)`, `PermissionGuard` и `MODULES.SCHEDULE_MANAGEMENT`.
- Produces: актуальный список `active_modules`, скрытый платный календарь без пакета и немедленное исчезновение отключённых разделов.

- [ ] **Step 1: Write failing entitlement and cache tests**

Проверить, что организация без активных пакетов не получает `contractor-portal`, `one-c-basic-exchange` и `schedule-management`. Положить устаревшее значение в кеш доступа, выполнить отключение/истечение пакета и ожидать удаления кеша.

- [ ] **Step 2: Run backend tests to verify they fail**

Run: `php vendor/bin/phpunit tests/Feature/Billing/OrganizationPackageEntitlementTest.php tests/Feature/Billing/CommercialWebhookServiceTest.php tests/Feature/Billing/CommercialRenewalServiceTest.php`
Expected: FAIL по лишним всегда включённым модулям и неочищенному кешу.

- [ ] **Step 3: Correct entitlement sources and invalidation**

Установить `auto_activate=false` и `can_deactivate=true` для `contractor-portal`; установить `auto_activate=false` для `one-c-basic-exchange`. После транзакционно успешного изменения строк `organization_package_subscriptions` очищать кеш `AccessController` для затронутой организации.

- [ ] **Step 4: Write failing admin navigation tests**

При активном только `project-management` ожидать отсутствие «Графики и планы». При активном `schedule-management` ожидать раздел и «Календарь событий». Проверить, что прямые маршруты `/projects/:projectId/calendar` и `/calendar` защищены `schedule-management.view` и модулем `schedule-management`.

- [ ] **Step 5: Run admin tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run src/components/layout/SidebarMenu.test.tsx src/App.dashboardRoutes.test.tsx`
Expected: FAIL по видимому календарю при бесплатном доступе и неверному route guard.

- [ ] **Step 6: Align menu and route guards**

У календаря событий заменить `projects.view`/`project-management` на `schedule-management.view`/`schedule-management` в меню и обоих маршрутах.

- [ ] **Step 7: Verify access behavior**

Run backend and admin focused tests again.
Expected: PASS, 0 failures.

Run: `node node_modules/typescript/bin/tsc --noEmit`
Expected: exit 0.

- [ ] **Step 8: Commit backend and admin changes**

```bash
git commit -m "fix[lk]: платные разделы скрываются после отключения"
```

### Task 4: Единая подача на маркетинговом сайте

**Files:**
- Modify: `prohelper_land/src/pages/landing/PricingPage.tsx`
- Modify: `prohelper_land/src/components/marketing/blocks/MarketingPricingSnapshot.tsx`
- Modify: `prohelper_land/src/components/marketing/blocks/MarketingPricingSnapshot.test.tsx`
- Modify: `prohelper_land/src/components/marketing/blocks/PackageFamilyCard.tsx`
- Modify: `prohelper_land/src/data/marketing/packages.ts`
- Modify: `prohelper_land/src/data/marketing/home.ts`
- Modify: `prohelper_land/src/data/marketing/common.ts`
- Modify: `prohelper_land/src/utils/seo.ts`
- Modify: `prohelper_land/src/utils/seo.test.ts`

**Interfaces:**
- Consumes: `commercialPackages`, `freeFoundationOffer`, `fullSuiteOffer`, `commercialTerms`.
- Produces: согласованные публичные тексты «Начните бесплатно», «МОСТ без оплаты», «3 дня бесплатно» и «Выберите нужные возможности».

- [ ] **Step 1: Write failing marketing copy tests**

Изменить ожидания snapshot/SEO и добавить проверку, что отображаемый документ не содержит «бесплатная база», «коммерческий контур», «72 часа», «конструктор» и «контур» в описании бесплатного старта.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node node_modules/vitest/vitest.mjs run src/components/marketing/blocks/MarketingPricingSnapshot.test.tsx src/utils/seo.test.ts`
Expected: FAIL по старым текстам.

- [ ] **Step 3: Replace public copy consistently**

Обновить страницу цен, блок главной, данные предложений, FAQ, SEO и CTA. Сохранить числа, цены, ссылки и структуру пакетов.

- [ ] **Step 4: Run marketing tests**

Run: `node node_modules/vitest/vitest.mjs run src/components/marketing/blocks/MarketingPricingSnapshot.test.tsx src/utils/seo.test.ts src/pages/dashboard/BillingPage.commercial.test.tsx`
Expected: PASS, 0 failures.

- [ ] **Step 5: Verify TypeScript and lint**

Run: `node node_modules/typescript/bin/tsc --noEmit`
Expected: exit 0.

Run: `node node_modules/eslint/bin/eslint.js src/pages/dashboard/BillingPage.tsx src/pages/landing/PricingPage.tsx src/components/marketing/blocks/MarketingPricingSnapshot.tsx src/components/marketing/blocks/PackageFamilyCard.tsx src/data/marketing/packages.ts src/data/marketing/home.ts src/data/marketing/common.ts src/utils/seo.ts`
Expected: exit 0, 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src docs/superpowers
git commit -m "feat[marketing]: тарифы описаны языком клиента"
```

### Task 5: Публикация и production-проверка

**Files:**
- No code files; GitHub branches, PRs, Actions and production pages.

**Interfaces:**
- Consumes: проверенные backend, landing и admin branches.
- Produces: merge commits в удалённом `main`, успешные deployment runs и проверенные страницы production.

- [ ] **Step 1: Rebase or merge current origin/main**

Run: `git fetch origin && git merge origin/main`
Expected: clean merge or resolved conflicts with tests repeated.

- [ ] **Step 2: Push branches and create PRs**

Push both branches, create ready PRs to `main`, verify changed-file scope excludes secrets and `node_modules`.

- [ ] **Step 3: Merge PRs**

Merge backend and landing PRs to remote `main`; verify remote `main` contains each merge commit.

- [ ] **Step 4: Configure test store securely**

Set repository secrets `YOOKASSA_SHOP_ID=1410408` and `YOOKASSA_SECRET_KEY` from standard input. Leave `YOOKASSA_TEST_ORGANIZATION_IDS` empty/absent so test mode applies to all organizations. Never print the secret value.

- [ ] **Step 5: Watch deployments**

Run `gh run watch` for both release runs.
Expected: `conclusion: success` for backend and landing/marketing jobs.

- [ ] **Step 6: Verify production**

Check backend health, public pricing page, authenticated package page when available, visible customer language and release SHA. Confirm test mode from safe read-only configuration evidence without outputting credentials.
