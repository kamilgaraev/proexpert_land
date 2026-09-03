# Независимое ревью frontend exact tag — 03.09.2026

## Вердикт

**APPROVE.** В блоке exact tag не найдено P1/P2-дефектов. Проверенное рабочее дерево сайта заявлено для `HEAD 125a80bc`; настоящий обзор читает исходники и целевые тесты, не заменяя их проверкой опубликованного frontend.

## Проверенный контракт

| Область | Реальное доказательство | Вывод |
|---|---|---|
| Маршрут и передача SSR-данных | `src/App.tsx::App` сопоставляет `/blog/tag/:slug` с `BlogTagPage`; `src/pages/catch-all.page.tsx` передаёт `initialBlogTagData`. В `src/pages/catch-all.page.server.ts::onBeforeRender` путь выделяется раньше общего `/blog/:slug` и вызывает `fetchBlogTagForSsr`. | Тема не попадает в обработчик статьи; данные SSR доходят до нужного компонента. |
| Точный серверный запрос | `src/pages/blogIndexSsr.ts::fetchBlogTagForSsr` отправляет только `/api/v1/blog/articles` с `tag_slug`, `page`, `per_page=12` и, при наличии, `search`. `src/utils/blogTagListing.ts::normalizeBlogTagQuery` исключает `category`. | Нет старой подмены поиском с увеличенным лимитом и локальной фильтрации. Внешний `category` не меняет выдачу темы. |
| Клиентский запрос и переходы | `src/components/blog/public/BlogTagPage.tsx` вызывает `blogPublicApi.getArticles({ tag_slug, page, per_page: 12, search })`; ключ компонента включает slug и нормализованный query key. Эффект отменяет завершившийся запрос прежней страницы/темы через `cancelled`. | При смене темы, страницы или поиска старый результат не перезаписывает новое состояние. Успешные SSR-данные не вызывают повторную загрузку. |
| Runtime-проверка ответа | `src/utils/blogTagListing.ts::applyBlogTagArticles` требует safe-integer meta, `per_page === 12`, согласованные `last_page/total`, ожидаемое число статей, текущую запрошенную страницу и exact slug в tags каждой статьи. `src/pages/blogIndexSsr.ts` дополнительно проверяет envelope и типы статей. | Неполный, противоречивый или отфильтрованный старым backend ответ становится временной недоступностью, а не ложной пустой выдачей. |
| 404, 503 и out-of-range | `fetchBlogTagForSsr` считает только HTTP 404 отсутствующей темой; сеть, 5xx и неверный body выставляют `unavailable`. `applyBlogTagArticles` допускает Laravel out-of-range только при `data: []`, ставит `pageNotFound`; `getBlogTagSeo` передаёт эти состояния в `getBlogListingSeo`. | Неизвестная тема и страница за пределами выдачи имеют SSR 404; сбой API — SSR 503 с noindex. Корректная известная пустая тема остаётся 200. |
| Canonical, robots и JSON-LD | `getBlogTagSeo` строит canonical по `/blog/tag/{slug}` и нормализованным `search/page`; `buildBlogPageUrl` удаляет посторонние параметры и не добавляет `page=1`. `noIndex: true` задан для всех тем по явному требованию спецификации. `useSEO` сохраняет явно переданный canonical без query-stripping, обновляет robots и передаёт noindex в `buildStructuredDataGraph`. | Для темы canonical соответствует точному URL страницы; теги остаются noindex, поэтому в JSON-LD не появляется индексируемая сущность листинга. |
| Клиентский API-контракт | `src/utils/blogPublicApi.ts::getArticles` передаёт `tag_slug` без преобразования в search; при tag-запросе отвергает envelope с `success !== true`. | 404 Axios передаёт компоненту как 404, а не превращает его в пустой результат; некорректный успешный ответ затем отвергается валидатором. |

## Тестовое покрытие, прочитанное в исходниках

`src/components/blog/public/BlogTagPage.test.tsx` через MSW проверяет прямой SSR второй страницы, canonical и noindex, отсутствие повторного вызова при StrictMode-гидратации, смену страницы и темы, сохранение search, 404 неизвестной темы, 200 пустой темы, 404 out-of-range, локальное отклонение некорректных `page` без сети, 503 при сети и четырёх видах нарушенного ответа. Отдельно проверяется сериализация `tag_slug`, `category_id`, `search`, `page`, `per_page` в общем API-клиенте.

Это соответствует переданным исполнителем результатам: 20 целевых тестов и ESLint для девяти файлов прошли. Полный прогон не повторялся. В спецификации отмечено старое предупреждение Prettier для части общих файлов; оно не влияет на рассмотренный runtime-контракт.

## Границы

По данным координатора backend уже опубликован в `73a3701b`, workflow `33732472191` успешен, а production endpoint подтверждён для exact tag (включая 404/422/out-of-range). Этот обзор не выполнял повторный HTTP-запрос и не подтверждает, что frontend с данным `HEAD` опубликован. Перед выпуском сайта остаётся обычная проверка опубликованной SSR-страницы `/blog/tag/<точная-тема>?page=2` и её canonical/robots в ответе.
