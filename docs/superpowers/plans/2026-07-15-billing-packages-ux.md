# Billing Packages UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Разделить уже подключённые пакеты и доступный каталог, добавить подробности модулей и сделать расчёт изменений однозначным.

**Architecture:** Laravel расширяет существующий каталог пакетов структурированными сведениями о модулях из `PackageCatalogService`. React хранит один целевой состав пакетов, но отображает действующие и доступные пакеты разными компонентами; подробности открываются в адаптивной боковой панели, а расчёт показывает только разницу с текущим составом.

**Tech Stack:** Laravel 11 / PHP 8.2, React / TypeScript / Vite, Tailwind CSS, Radix Sheet, PHPUnit, Vitest, Testing Library, MSW.

## Global Constraints

- Пользовательское название продукта — только МОСТ.
- В интерфейсе запрещены технические идентификаторы и служебные формулировки.
- Серверный каталог является единственным источником названий и описаний модулей.
- Оплаченный пакет остаётся доступным до конца периода после запланированного отключения.
- Ненужный старый UI удаляется в рамках той же задачи; совместимость со старым форматом `modules: string[]` не сохраняется.
- Frontend build локально не запускается; используются Vitest, TypeScript и ESLint.
- Миграции и команды с подключением к базе данных не запускаются.

---

### Task 1: Структурированные модули в каталоге пакетов

**Files:**
- Modify: `prohelper/app/Services/Landing/PackageService.php`
- Test: `prohelper/tests/Feature/Api/V1/Landing/OrganizationPackageControllerTest.php`

**Interfaces:**
- Consumes: `PackageCatalogService::moduleDefinitions(): array<string, array>`.
- Produces: `modules: list<{slug: string, name: string, description: string}>` в `GET /api/v1/landing/packages`.

- [ ] **Step 1: Write the failing API contract test**

Добавить в `test_get_packages_returns_new_catalog_and_active_account_state` проверки:

```php
$module = collect($active['modules'])->firstWhere('slug', 'estimates');
$this->assertIsArray($module);
$this->assertSame('Сметы', $module['name']);
$this->assertNotSame('', trim($module['description']));
$this->assertArrayNotHasKey('billing_model', $module);
```

- [ ] **Step 2: Run the contract test and verify RED**

Run: `php artisan test tests/Feature/Api/V1/Landing/OrganizationPackageControllerTest.php --filter=get_packages_returns_new_catalog`

Expected: FAIL, потому что `modules` содержит строки.

- [ ] **Step 3: Map module definitions in PackageService**

Добавить закрытый метод:

```php
private function moduleSummaries(array $slugs): array
{
    $definitions = $this->packageCatalog->moduleDefinitions();

    return collect($slugs)->map(static function (string $slug) use ($definitions): array {
        $definition = $definitions[$slug] ?? [];

        return [
            'slug' => $slug,
            'name' => trim((string) ($definition['name'] ?? 'Возможность МОСТ')),
            'description' => trim((string) ($definition['description'] ?? 'Возможность входит в состав пакета МОСТ.')),
        ];
    })->values()->all();
}
```

В `getAllPackages()` заменить выдачу массива slug на `$this->moduleSummaries(...)`.

- [ ] **Step 4: Verify backend GREEN and static quality**

Run:

```text
php artisan test tests/Feature/Api/V1/Landing/OrganizationPackageControllerTest.php
php -l app/Services/Landing/PackageService.php
php -d memory_limit=1G vendor/bin/phpstan analyse app/Services/Landing/PackageService.php --no-progress
```

Expected: тесты PASS, синтаксис и PHPStan без ошибок.

- [ ] **Step 5: Commit backend contract**

```text
git add app/Services/Landing/PackageService.php tests/Feature/Api/V1/Landing/OrganizationPackageControllerTest.php
git commit -m "feat[lk]: добавлены подробности модулей пакетов"
```

### Task 2: Типизированная нормализация каталога

**Files:**
- Modify: `prohelper_land/src/types/commercialBilling.ts`
- Modify: `prohelper_land/src/services/commercialBillingService.ts`
- Test: `prohelper_land/src/services/commercialBillingService.test.ts`

**Interfaces:**
- Consumes: новый `modules` API из Task 1.
- Produces: `CommercialPackageModule` и `CommercialPackage.modules: CommercialPackageModule[]`.

- [ ] **Step 1: Write failing normalization test**

Обновить MSW payload и проверить:

```ts
expect(result[0].modules[0]).toEqual({
  slug: 'projects',
  name: 'Проекты',
  description: 'Управление объектами и их основными данными.',
});
```

- [ ] **Step 2: Run service test and verify RED**

Run: `npm test -- --run src/services/commercialBillingService.test.ts`

Expected: FAIL из-за отсутствия типизированной нормализации.

- [ ] **Step 3: Implement exact client types**

Добавить:

```ts
export interface CommercialPackageModule {
  slug: string;
  name: string;
  description: string;
}
```

Изменить `CommercialPackage.modules` и нормализовать каждый объект с полями `slug`, `name`, `description`. Строковый старый формат не поддерживать.

- [ ] **Step 4: Verify normalization GREEN**

Run: `npm test -- --run src/services/commercialBillingService.test.ts`

Expected: все тесты файла PASS.

- [ ] **Step 5: Commit client contract**

```text
git add src/types/commercialBilling.ts src/services/commercialBillingService.ts src/services/commercialBillingService.test.ts
git commit -m "feat[lk]: типизирован состав пакетов"
```

### Task 3: Компоненты карточек и подробностей

**Files:**
- Create: `prohelper_land/src/components/billing/CommercialPackageCard.tsx`
- Create: `prohelper_land/src/components/billing/CommercialPackageDetailsSheet.tsx`
- Test: `prohelper_land/src/components/billing/CommercialPackageCard.test.tsx`

**Interfaces:**
- Consumes: `CommercialPackage`, `CommercialPackageModule`.
- Produces: `CommercialPackageCard` с вариантами `connected | available` и `CommercialPackageDetailsSheet`.

- [ ] **Step 1: Write failing component tests**

Проверить три поведения:

```tsx
expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Подробнее' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Отключить со следующего периода' })).toBeInTheDocument();
```

Для доступного пакета проверить «Добавить», для панели — названия и описания всех модулей.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- --run src/components/billing/CommercialPackageCard.test.tsx`

Expected: FAIL, компоненты отсутствуют.

- [ ] **Step 3: Implement accessible package card**

Карточка получает:

```ts
type CommercialPackageCardProps = {
  packageItem: CommercialPackage;
  variant: 'connected' | 'available';
  pendingAction?: 'add' | 'remove' | null;
  disabled?: boolean;
  onPrimaryAction: () => void;
  onDetails: () => void;
};
```

Не использовать checkbox. Подключённый вариант показывает спокойный зелёный статус, доступный — оранжевое действие. Pending remove отображает точную дату, переданную страницей.

- [ ] **Step 4: Implement responsive details sheet**

Использовать существующие `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`. Панель содержит бизнес-описание, цену, результаты и список модулей в формате «название + краткое описание».

- [ ] **Step 5: Verify components GREEN**

Run: `npm test -- --run src/components/billing/CommercialPackageCard.test.tsx`

Expected: все тесты PASS.

- [ ] **Step 6: Commit UI components**

```text
git add src/components/billing/CommercialPackageCard.tsx src/components/billing/CommercialPackageDetailsSheet.tsx src/components/billing/CommercialPackageCard.test.tsx
git commit -m "feat[lk]: добавлены карточки и подробности пакетов"
```

### Task 4: Разделение подключённых пакетов и каталога

**Files:**
- Modify: `prohelper_land/src/pages/dashboard/BillingPage.tsx`
- Test: `prohelper_land/src/pages/dashboard/BillingPage.commercial.test.tsx`

**Interfaces:**
- Consumes: компоненты Task 3 и существующие `CommercialQuote`, `CommercialRenewalState`.
- Produces: отдельные разделы, целевой состав `targetPackageSlugs` и выбранный пакет для панели подробностей.

- [ ] **Step 1: Write failing page behavior tests**

Проверить:

```tsx
expect(screen.getByRole('heading', { name: 'Подключённые пакеты' })).toBeInTheDocument();
expect(screen.getByRole('heading', { name: 'Добавить возможности' })).toBeInTheDocument();
expect(within(connectedSection).queryByRole('checkbox')).not.toBeInTheDocument();
expect(within(availableSection).queryByText('Пакет 1')).not.toBeInTheDocument();
expect(screen.getByText('Изменений нет')).toBeInTheDocument();
```

Отдельно проверить добавление доступного пакета, проект отключения действующего и открытие подробностей.

- [ ] **Step 2: Run BillingPage tests and verify RED**

Run: `npm test -- --run src/pages/dashboard/BillingPage.commercial.test.tsx`

Expected: FAIL на отсутствующих разделах и старых checkbox.

- [ ] **Step 3: Introduce derived package groups**

Добавить вычисления:

```ts
const connectedPackages = packages.filter((item) => item.isActive);
const availablePackages = packages.filter((item) => !item.isActive);
const hasChanges = quote
  ? quote.addedPackageSlugs.length > 0 || quote.removedPackageSlugs.length > 0
  : false;
```

Состояние целевого состава изначально равно действующим slug плюс marketing intent. Действие доступной карточки добавляет slug, действие подключённой удаляет slug только из целевого состава.

- [ ] **Step 4: Replace the old checkbox grid**

Удалить старую общую сетку и вывести:

1. отдельную карточку полного комплекта;
2. `Подключённые пакеты`;
3. `Добавить возможности`;
4. одну `CommercialPackageDetailsSheet` для выбранного пакета.

При запланированном сокращении использовать `renewal.scheduledChange` для состояния «Отключится <дата>».

- [ ] **Step 5: Correct summary semantics**

Заменить «Выбрано N из 10» на блок изменений:

- «Сейчас подключено» — сумма цен `connectedPackages`;
- «Добавляется» — `quote.addedPackageSlugs`;
- «Отключится» — `quote.removedPackageSlugs`;
- «Следующий период» — `quote.monthlyTotalMinor`;
- «К оплате сейчас» — `quote.amountDueNowMinor`.

При `hasChanges === false` показать «Изменений нет» и не выводить активную CTA. Для существующего настроенного автоплатежа не показывать повторное согласие; для первой покупки оставить обязательное согласие.

- [ ] **Step 6: Verify BillingPage GREEN**

Run: `npm test -- --run src/pages/dashboard/BillingPage.commercial.test.tsx`

Expected: все тесты PASS.

- [ ] **Step 7: Commit page integration**

```text
git add src/pages/dashboard/BillingPage.tsx src/pages/dashboard/BillingPage.commercial.test.tsx
git commit -m "feat[lk]: разделены подключённые и доступные пакеты"
```

### Task 5: Полная проверка и выпуск

**Files:**
- Modify only if verification exposes a scoped defect.

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: проверенный release в удалённом `main` и production.

- [ ] **Step 1: Run backend verification**

```text
php artisan test tests/Feature/Api/V1/Landing/OrganizationPackageControllerTest.php tests/Feature/Billing/PackageConfigurationIntegrityTest.php
php -l app/Services/Landing/PackageService.php
php -d memory_limit=1G vendor/bin/phpstan analyse app/Services/Landing/PackageService.php --no-progress
```

- [ ] **Step 2: Run frontend verification**

```text
npm test -- --run src/services/commercialBillingService.test.ts src/components/billing/CommercialPackageCard.test.tsx src/pages/dashboard/BillingPage.commercial.test.tsx
npx tsc --noEmit
npx eslint src/types/commercialBilling.ts src/services/commercialBillingService.ts src/components/billing/CommercialPackageCard.tsx src/components/billing/CommercialPackageDetailsSheet.tsx src/pages/dashboard/BillingPage.tsx
```

- [ ] **Step 3: Review exact release diff**

Run `git diff --check`, inspect committed diff against `origin/main`, and confirm unrelated access/package work is absent from this release.

- [ ] **Step 4: Push PRs and merge remote main**

Создать отдельные backend и frontend PR, слить их в удалённый `main` и не включать незавершённые изменения доступов.

- [ ] **Step 5: Monitor production deploys**

Дождаться успешных GitHub Actions backend и frontend. При ошибке CI исправить только подтверждённую причину отдельным коммитом.

- [ ] **Step 6: Live smoke-check**

Проверить HTTP 200 страницы оплаты, наличие заголовков «Подключённые пакеты» и «Добавить возможности», открытие подробностей, отсутствие checkbox у оплаченных пакетов и мобильную компоновку.

- [ ] **Step 7: Update YouTrack article**

Обновить статью `180-53` фактическими PR, commit SHA, результатами тестов и деплоя.
