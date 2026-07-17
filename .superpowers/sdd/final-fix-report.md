# Финальные исправления по итоговому review

Дата: 2026-07-17
База исправлений: `305a5592`

## Источник точных заголовков

Точные пары `slug → title` получены из production public API МОСТ по read-only SSH. Для каждого из пяти опубликованных slug выполнен `GET /api/v1/blog/articles/{slug}?track_view=0`; параметр отключает учёт просмотра. Ответы дополнительно сверены с локальным источником наполнения `prohelper/app/Console/Commands/Blog/RefreshMarketingSeoArticlesCommand.php`.

Зафиксированные production-заголовки вынесены в независимую fixture `src/data/marketing/fixtures/publishedBlogTitles.json`. Тест строит отображение из реестра отдельно и сравнивает его с fixture целиком.

## Исправления

- Добавлены централизованные нормализаторы публичных полей `BlogCategory` и имени `BlogTag`.
- Нормализация применяется к отдельным спискам категорий и тегов, вложенным `article.category`/`article.tags`, клиентскому API и SSR-данным блога.
- Технические `id` и `slug` сохраняются без изменений.
- Реестр пяти статей синхронизирован с точными production-заголовками, поэтому перелинковка показывает фактические названия.

## TDD и проверки

RED:

```text
Test Files  5 failed (5)
Tests       6 failed | 43 passed (49)
```

Падения воспроизводили оба finding: старый бренд в category/tag данных client/SSR и четыре сокращённых заголовка реестра.

GREEN, целевые blog/SSR/registry тесты:

```text
Test Files  5 passed (5)
Tests       49 passed (49)
```

Полный SEO-набор с исключением ровно известного исходного deploy/nginx-теста:

```text
Test Files  12 passed (12)
Tests       150 passed | 1 skipped (151)
```

До новых двух регрессий этот набор содержал 148 зелёных тестов. Пропущенный тест по-прежнему относится к отсутствующему ещё в базовом коммите `deploy/apply-marketing-nginx.sh`; deploy-контур не изменялся.

Дополнительно:

- итоговый объединённый прогон с `src/utils/blogPublicApi.test.ts`: 156 passed, 1 baseline skipped;
- `npx tsc --noEmit`: exit code 0;
- ESLint девяти изменённых TS/TSX-файлов: exit code 0;
- Prettier: новые и ранее приведённые к стандарту файлы проходят; полная проверка пяти затронутых legacy-файлов повторяет уже задокументированный baseline форматирования без новых ESLint-ошибок;
- `git diff --check`: exit code 0;
- сборка и dev-server не запускались по правилам проекта.
