# URL-пагинация блога — 3 сентября 2026

Спецификация: ../blog-pagination-spec-20260903.md.

## Реализовано

Лента /blog и /blog/category/:slug показывают одну страницу из 12 публикаций. Предыдущая/следующая — реальные ссылки с page и текущими фильтрами. Основной query key включает page/category/search. SSR получает параметры из urlOriginal; гидратация использует только совпадающие initial data. Смена URL заменяет список вместо накопления. Назад/вперёд восстанавливают нужную страницу. Запросы старого URL не перезаписывают новый результат (generation + current key в ленте; keyed content + cancellation в категории).

Отсутствующий page означает 1. Ноль, отрицательные/дробные/нечисловые значения, небезопасные целые и повторный page отклоняются. Известный номер за last_page и ответ API с подменённой current_page не показывают первую страницу: SSR возвращает 404, клиент показывает отсутствие страницы. Нормализатор допускает целочисленный current_page > last_page, который Laravel использует для пустой страницы, чтобы определить 404 после валидации конверта. Сбой API/каталога не считается отсутствием категории и не выдаёт общий список вместо фильтра. Ошибка каталога на клиенте больше не оставляет вечную загрузку.

Чистые page=N имеют self-canonical; поиск и category-фильтр общей ленты — noindex. В категории page=N индексируем, search — noindex. Из явного canonical удаляется только hash; автоматический canonical по-прежнему очищается от query. Это исправлено в useSEO и serverSeo. CollectionPage/WebPage граф блога согласован с canonical page=N; поведение графа остальных страниц сохранено. Проверены существующие production-места явного canonical: статьи/предпросмотр и новые blog helpers; произвольные query из location не стали автоматически canonical.

На странице тега ошибка и пустая подборка теперь взаимоисключающие. До получения реального названия тега H1 — «Статьи по теме», без технического slug.

## Мобильная лента

Убрана избыточная навигация по трём секциям перед поиском. Поиск видим, темы доступны через native details с актуальным выбранным названием. На 390×844 первый материал переместился с y988 (независимое ревью) на y550,7; обложка помещается в первый экран. Горизонтальное переполнение 0. Снимок: output/playwright/blog-editorial/pagination-blog-390.png — визуально просмотрен.

## Проверки

122 уникальных теста прошли в 8 файлах, без полного повторного прогона после чистого форматирования:

- BlogPublicPage.test.tsx — 14: SSR/hydration, точный page/search, следующая/предыдущая, back/forward, stale responses, сбой каталога, invalid page.
- BlogCategoryPage.test.tsx — 13: initial data, смена slug, поздний ответ, API-сбои, page2/ссылки/канонический URL.
- catch-all.page.server.test.ts — 34: page2, filters, invalid/duplicate/unsafe page, unknown filter, out-of-range/API-clamping, категории и прежние SSR-сценарии.
- BlogTagPage.test.tsx — 1: ошибка без сырого slug и ложной пустой подборки.
- useSEO.test.tsx + serverSeo.test.ts — 21: явный paginated canonical, hash, автоматические URL, граф и прежние SEO-контракты.
- blogIndexSsr.test.ts + utils/seo.test.ts — 39: таймауты/частичный SSR, нормализаторы и общий SEO-граф.

Первый прогон 59 тестов нашёл три реальные регрессии: два общих участка срезали canonical query; SSR-normalizer отвергал out-of-range meta слишком рано. После исправлений повторены именно эти три кейса, все прошли. Остальные тесты запускались только для новых/изменённых рисков.

ESLint изменённых исполняемых файлов и тестов — успешно. Prettier успешно для blogIndexQuery, blogCategorySeo, BlogPublicPage, BlogCategoryPage, BlogTagPage, BlogPagination и нового BlogTagPage.test. Общий Prettier-check также был выполнен и обнаружил смешанный старый стиль/окончания строк в SSR, общих SEO-файлах и существующих тестах; полный форматный diff этих файлов по согласованию с root не расширялся. Этот общий форматный gate не заявляется зелёным.

Gortex: реальные тела, editing context и impact прочитаны; mutations только Gortex. Detect changes, test targets и guards выполнены. Guard rules не настроены. Verify change ошибочно считает прежние destructured/default signatures нуль-аргументными; реальные вызовы проверены исходниками и целевыми тестами, новые параметры необязательные. Детерминированное review: 0 конкретных замечаний, verdict BLOCK из-за CRITICAL blast-radius useSEO (21 зависимость, тестами покрыт); это сигнал для независимого review, а не обнаруженная ошибка. До правки impact для hook/server/graph был LOW. Независимое контрактное ревью назначено root агенту estimate_truth.

## Браузер и фактический контент

Существующий dev 127.0.0.1:5173, отдельная сессия most-blog-editorial. Сценарий output/playwright/blog-editorial/pagination-check.js:

- /blog: 200, 10 реальных статей, canonical /blog, index.
- /blog?page=2: 404, пустой список, canonical с page=2, noindex — реальных публикаций пока меньше 12, поэтому второй страницы действительно нет.
- /blog?page=0: 404, пустой список, noindex.
- /blog/category/pto-i-dokumenty?page=2: 404, пустой список, canonical page=2.
- /blog?search=график&page=1: 200, 9 соответствующих поиску публикаций вместо 10, noindex; canonical содержит только search без избыточного page=1.

Все пять случаев: overflow 0. Проверено состояние после гидратации. Наполненная page2 проверена тестовыми данными, а не выдумана в реальном каталоге. Локальные дополнительные запросы sidebar по-прежнему ограничены API 403/CORS; production Origin root ранее подтвердил read-only HTTP. API/права/сервер не менялись; формы не отправлялись.

## Теги: честная граница завершения

Полная URL-пагинация тегов НЕ реализована и не объявляется готовой. Backend PublicBlogController::articles (app/Http/Controllers/Api/V1/Blog/PublicBlogController.php, метод articles) принимает category_id/search/per_page. BlogPublicService::getArticles (app/Services/Blog/BlogPublicService.php) имеет только category_id/search и paginate; точного tag_id/slug фильтра нет. Прежний TagPage использует searchArticles(term, limit=N*12) и затем filterBlogArticlesByTagSlug. По указанию root этот механизм не расширялся и не заменялся обходом. Следующий самостоятельный блок — точный backend-фильтр тегов с контрактом и тестами, после него SSR/URL-пагинация тега. Существующие ограничения tag search остаются.

## Файлы этого блока

- src/utils/blogIndexQuery.ts
- src/utils/blogCategorySeo.ts
- src/pages/blogIndexSsr.ts
- src/pages/catch-all.page.server.ts
- src/types/blog.ts (только optional query/status поля initial data)
- src/components/blog/public/BlogPublicPage.tsx
- src/components/blog/public/BlogCategoryPage.tsx
- src/components/blog/public/BlogTagPage.tsx
- src/components/blog/public/BlogPagination.tsx (новый)
- src/components/blog/public/BlogPublicPage.test.tsx
- src/components/blog/public/BlogCategoryPage.test.tsx
- src/components/blog/public/BlogTagPage.test.tsx (новый)
- src/pages/catch-all.page.server.test.ts
- src/hooks/useSEO.ts
- src/hooks/useSEO.test.tsx
- src/renderer/serverSeo.ts
- src/renderer/serverSeo.test.ts
- src/utils/seo.ts (только canonical графа для блога/категорий)
- docs/marketing/blog-pagination-spec-20260903.md
- этот evidence-файл.

## Исправления независимого ревью

estimate_truth нашёл P1: сбой API оставлял пустую индексируемую HTTP 200. Исправлено явным unavailable в initial data ленты/категории: отсутствие успешного каталога или статей даёт 503 + noindex в documentProps. Клиент сохраняет noindex при повторном сбое и снимает после успешного восстановления; доказанное отсутствие страницы/категории имеет приоритет 404. В отличие от первой реализации частичная лента с неудавшимся каталогом тоже помечена временно недоступной, сохраняя уже полученные статьи.

По P2 сохранён легальный Laravel-конверт current_page > last_page с пустым data: он нужен для честного 404. Непустой data при таких метаданных теперь отвергается как неисправный ответ → 503/noindex. Это различие проверено и в SSR, и защитным условием на клиенте.

Добавлены 7 регрессий (итого 129 уникальных тестов за блок); узкий повторный прогон 20 тестов после P1/P2 успешен, остальные 48 в этих трёх файлах намеренно пропущены в повторе. Проверены матрица index/category × сбой articles/categories, пустой/непустой out-of-range, invalid page, сохранение noindex во время гидратации, успешное восстановление и категории. ESLint повторно успешен только для изменённого исправлением подмножества. Повторное независимое ревью estimate_truth только по P1/P2 завершено APPROVE: различие 503/noindex, пустого Laravel out-of-range 404 и противоречивого непустого конверта 503 подтверждено реальными телами. Первоначальная формулировка P2 исправлена в независимом отчёте blog-query-pagination-contract-review-20260903.md.

Без build, коммита, деплоя и изменения backend. Общие CSS/MarketingShell не менялись.
