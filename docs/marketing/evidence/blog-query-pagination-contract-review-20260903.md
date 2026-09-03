# Независимое ревью query-пагинации блога

Дата: 3 сентября 2026 года. Проверены текущие тела query-пагинации в маркетинговом сайте МОСТ. Это независимое read-only ревью перед commit/deploy; результат worker-тестов не использован как замена анализа контрактов.

## Повторный вердикт: **APPROVE для узких P1/P2-ветвей**

P1 исправлен в текущих телах. Первоначальная формулировка P2 была неточной: Laravel может корректно вернуть пустой out-of-range конверт с `current_page > last_page`; он должен вести к 404, а не к ошибке API.

| Приоритет | Наблюдение | Доказательство | Последствие и требуемое исправление |
|---|---|---|---|
| **Закрыт P1** | Недоступность API теперь представлена явно. `fetchBlogIndexForSsr` выставляет `unavailable`, когда не доказаны ни валидная страница, ни 404; SSR передаёт флаг в SEO-контракт. `getBlogListingSeo` для него возвращает `503` и `noindex`. Клиент сохраняет unavailable при неудачной гидратации и снимает только после успешного ответа. | `src/pages/blogIndexSsr.ts:291-345`; `src/pages/catch-all.page.server.ts:164-196`; `src/utils/blogIndexQuery.ts:47-66`; `src/components/blog/public/BlogPublicPage.tsx:35-285`. | Soft-200 устранён для index и category: API-недоступность не подменяется 404. |
| **Закрыт P2 (уточнение контракта)** | `current_page > last_page` с пустым `data[]` допустим как Laravel out-of-range и дальше превращается в 404 условием `page > last_page || page !== current_page`. Непустой `data[]` при таком meta признан повреждённым конвертом: normalizer возвращает `null`, затем включается unavailable → 503/noindex. Клиент применяет такое же правило. | `src/pages/blogIndexSsr.ts:176-231,330-345`; `src/components/blog/public/BlogPublicPage.tsx:205-246`. | Вернуть безусловный запрет `current_page > last_page` было бы ошибкой: он сломал бы корректный 404 Laravel. Проверенный контракт теперь различает out-of-range и повреждённый ответ. |

## Проверено без существенного дефекта

| Сценарий | Результат |
|---|---|
| `page=2` для `/blog` | Query читается в `catch-all.page.server.ts` из `urlOriginal`; SSR передаёт страницу в `fetchBlogIndexForSsr`, а `BlogPublicPage` включает page в query key, запрос и `BlogPagination`. Это закрывает прежнее невосстанавливаемое load-more состояние. |
| Back/forward и конкурентные запросы | `BlogPublicPage` строит ключ из category/search/page, инкрементирует generation и игнорирует устаревшие ответы при несовпадении текущего ключа или generation. Возврат к ранее посещённой странице создаёт новый запрос, если ключ не совпадает с кэшированной единственной записью. |
| Некорректный `page` | `parseBlogPage` допускает только один положительный safe integer. Повторный, нулевой, отрицательный, дробный или переполненный параметр становится `0`; SSR и клиент дают 404/noindex. |
| Out-of-range `page` | При API-ответе, где запрошенная страница больше `last_page` или `current_page` отличается от запроса, initial data получает `notFound`; SSR формирует 404/noindex, клиент не показывает карточки. |
| Search и category на корне блога | Query включён в SSR-запрос, query key, canonical и клиентское состояние. Для search/category выдаётся `noindex`; canonical сохраняет явный query, как и требуют обновлённые `getBlogListingSeo` и server SEO. |
| Категорийная страница | `catch-all` очищает `category` из query и подставляет slug path в `fetchBlogCategoryForSsr`; это исключает конфликт `/blog/category/X?category=Y`. `getBlogCategorySeo` строит SEO от path slug и query page/search. |
| Canonical/OG/JSON-LD | `buildServerSeoPayload` сохраняет явно переданный canonical query, удаляя только fragment; `getBlogListingSeo` управляет noindex и статусом. Для list-страниц не добавляется Article JSON-LD. |

## Граница tag

`BlogTagPage` использует клиентскую фильтрацию/поиск по статьям и не входит в новый server-side query-контракт. Backend tag-filter не реализован, поэтому tag не следует считать доказанной SEO-пагинацией и не нужно переносить на него выводы о корректности `/blog` и category.

## Узкая повторная приёмка

1. Тела подтверждают `503 + noindex` при отказе API статей или категорий; доказанный invalid/out-of-range сохраняет приоритет 404.
2. Пустой Laravel out-of-range с `current_page > last_page` остаётся 404; непустой противоречивый конверт — 503/noindex.
3. По сообщению worker узкий набор из 20 тестов, включая эту матрицу, прошёл; в этом независимом read-only ревью прогон не повторялся.
4. Общий query/canonical/JSON-LD контракт из исходного ревью не менялся и не пересматривался повторно.
