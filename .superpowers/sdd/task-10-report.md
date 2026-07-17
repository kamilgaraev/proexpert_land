# Task 10 — финальная целевая проверка

Дата: 2026-07-17  
База сравнения: `1d05b73c`  
Проверенный HEAD до форматирующего коммита: `d54523b81dac7120a0678058054060dc480a98be`

## Результаты

### Vitest

Точный набор из brief, дополненный `src/data/marketing/publicSourceContent.test.ts`:

```text
Test Files  1 failed | 11 passed (12)
Tests       1 failed | 148 passed (149)
```

Единственное падение — `src/utils/seo.test.ts > sitemap sync > deploys the versioned nginx config through guarded validation and rollback`. Тест требует строки `deploy/nginx/prohelper.pro.conf` и запуска `deploy/apply-marketing-nginx.sh` в `.github/workflows/deploy.yml`, однако скрипта нет уже в базовом коммите `1d05b73c`, а workflow и каталог `deploy` в SEO-ветке не изменялись. Это подтверждённый исходный дефект вне Task 10; нерелевантный deploy-контур не менялся.

Тот же набор с исключением ровно этого исходного deploy/nginx-теста:

```text
Test Files  12 passed (12)
Tests       148 passed | 1 skipped (149)
```

Дополнительная проверка неизменности коммерческой модели:

```text
src/data/marketing/packages.test.ts
src/data/marketing/publicCommercialModel.contract.test.ts
Test Files  2 passed (2)
Tests       6 passed (6)
```

### TypeScript и ESLint

- `npx tsc --noEmit` — exit code 0.
- `npx eslint <50 изменённых TS/TSX-файлов>` — exit code 0.

### Prettier

Проверка всех 53 изменённых `.ts`, `.tsx`, `.md`, `.txt` обнаружила исходное форматирование в старых файлах и отсутствие parser для `public/llms.txt`. Автоматически отформатированы только четыре новых файла этой SEO-ветки:

- `src/data/marketing/blogArticles.test.ts`
- `src/data/marketing/blogArticles.ts`
- `src/utils/marketingBlogNormalizer.test.ts`
- `src/utils/marketingBlogNormalizer.ts`

Focused-проверка всех шести новых TS/TSX-файлов ветки завершилась с exit code 0.

### Статический SEO-аудит

- Поиск старого бренда и запрещённых гибридов не обнаружил их в пользовательском production-тексте.
- Совпадения `prohelper*` относятся только к техническим путям `sourceOfTruth`, именам asset-файлов и тестовым denylist/fixtures.
- Оставшиеся употребления слова «сценарий» предметные: интеграция, пилот, рабочий процесс. Запрещённые гибриды отсутствуют.
- `git diff --check` — exit code 0.

### Маршруты и тарифы

- `git diff 1d05b73c..HEAD -- src/data/marketing/sitemapRoutes.json server/sitemap.cjs` — пусто.
- Порядок и значения `slug`, `price`, `separatePrice`, `savings`, `savingsPercent`, `billingPeriodDays`, `graceDays` в `packages.ts` побайтно совпадают с базой по извлечённым контрактным значениям.
- Контрактные тесты пакетов и публичной коммерческой модели проходят: 6/6.

## Ограничения

- `npm run build`, `npm run build:marketing` и dev-server не запускались по правилам проекта.
- Публичный crawl выполняется только после деплоя и в эту локальную проверку не входит.
