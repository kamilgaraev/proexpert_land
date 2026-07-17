# Task 5 — structured data и единый SEO-контракт

## Статус

`DONE_WITH_CONCERNS`

SEO-контракт реализован: `HowTo` удалён из `getPageSEOData(...).structuredData`, не создаётся для кластерных страниц и дополнительно отбрасывается из итогового `@graph`, если передан извне. Базовый граф индексируемой страницы сохраняет `Organization` и `WebSite`; маршрутные ветки сохраняют `WebPage`, `BreadcrumbList`, `Service`, `Product` с вложенными `Offer`, `FAQPage`, `CollectionPage` и `BlogPosting` по назначению.

## RED evidence

```text
npx vitest run src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts src/pages/catch-all.page.server.test.ts
exit 1
```

Ожидаемые падения до production-правки:

- `getPageSEOData('/construction-crm').structuredData` содержал `HowTo`;
- общий тест 35 sitemap routes обнаружил `HowTo` на `/foreman-software` и других кластерных страницах;
- SSR граф `/construction-crm` содержал `HowTo`;
- обычные графы не содержали отдельный узел `WebSite`.

Отдельный защитный RED-цикл:

```text
npx vitest run src/utils/seo.test.ts -t "rejects injected HowTo"
exit 1
Tests: 1 failed, 33 skipped
```

## GREEN evidence

Защитный тест после фильтрации внешнего structured data:

```text
npx vitest run src/utils/seo.test.ts -t "rejects injected HowTo"
exit 0
Tests: 1 passed, 33 skipped
```

Точный набор файлов из brief:

```text
npx vitest run src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts src/pages/catch-all.page.server.test.ts
exit 1
Test Files: 3 passed, 1 failed
Tests: 65 passed, 1 failed
```

Единственное падение не относится к Task 5: старый тест `deploys the versioned nginx config through guarded validation and rollback` ожидает отсутствующий в текущей ветке `deploy/apply-marketing-nginx.sh` и строки deploy-конфига в `.github/workflows/deploy.yml`.

Тот же набор с исключением только подтверждённого baseline-теста deploy:

```text
npx vitest run src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts src/pages/catch-all.page.server.test.ts -t "^(?!.*deploys the versioned nginx config).*"
exit 0
Test Files: 4 passed
Tests: 65 passed, 1 skipped
```

```text
npx eslint src/utils/seo.ts src/utils/seo.test.ts src/hooks/useSEO.test.tsx src/renderer/serverSeo.test.ts
exit 0
```

```text
npx tsc --noEmit --pretty false
exit 0
```

Первый запуск hook-теста выявил неполный tracked `node_modules`: у `react-router` отсутствовала точка входа. После `npm ci --ignore-scripts --no-audit --no-fund` зависимости восстановлены, tracked-изменения `node_modules` отменены, hook-тесты и полный `tsc` проходят. Ранее зафиксированный `TS7006` в `BlogPublicPage.tsx` после восстановления зависимостей не воспроизвёлся; сам файл не изменялся.

## Изменения

- `src/utils/seo.ts`: удалены `generateHowToSchema` и его использование; `WebSite` включён в базовый индексируемый граф; внешние `HowTo` отбрасываются политикой финального графа.
- `src/utils/seo.test.ts`: добавлена проверка обоих уровней SEO-контракта по всем 35 sitemap routes, self-canonical МОСТ и защитный тест внешнего `HowTo`.
- `src/hooks/useSEO.test.tsx`: клиентский граф кластера проверяется на `Service`, видимый `FAQPage`, базовый `WebSite` и отсутствие `HowTo`.
- `src/renderer/serverSeo.test.ts`: SSR ожидания обновлены; статья проверяет publisher `МОСТ` и canonical `mainEntityOfPage` через `generateArticleSchema`.

## Self-review

- Нормализация статьи из Task 3 не дублировалась в production-коде.
- FAQ формируется из `clusterPage.faq`, который используется в видимом содержании той же маркетинговой страницы; скрытые вопросы и ответы не добавлялись.
- Rating/review, скрытые результаты и неподтверждённые утверждения не добавлялись.
- `Offer` остаётся только вложенным в `Product` на `/pricing`; существующая политика удаления offers с остальных страниц сохранена.
- Все 35 canonical URL проверены как self-referencing на `https://1мост.рф`.
- `git diff --check` не выявил ошибок; предупреждения относятся только к настроенному преобразованию LF/CRLF.

## Concerns

- Полный exact Vitest остаётся красным из-за одного существующего deploy/nginx теста вне scope Task 5. SEO, hook, SSR и catch-all проверки проходят при исключении только этого теста.
- Исторический baseline `TS7006` в linked worktree зависел от неполного `node_modules`; после безопасного восстановления зависимостей текущий точный `tsc` завершился с `exit 0` без правок `BlogPublicPage.tsx`.
