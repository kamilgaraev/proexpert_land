# Спецификация: выравнивание публичных страниц под стиль главной

## Цель

Привести публичные SEO-страницы и блог к единому маркетинговому стилю главной страницы:
- единый hero через `PageHero`
- секции через `SectionHeader`
- CTA через `CtaBand`
- честные формулировки без фейковых обещаний
- одинаковая визуальная плотность, ритм и типографика

## Область работ

- `src/pages/solutions/EnterprisePage.tsx`
- `src/components/blog/public/BlogPublicLayout.tsx`
- `src/components/blog/public/BlogPublicPage.tsx`
- `src/components/blog/public/BlogArticlePage.tsx`
- `src/components/blog/public/BlogCategoryPage.tsx`
- `src/components/blog/public/BlogTagPage.tsx`
- `src/components/blog/public/BlogArticleCard.tsx`
- `src/components/blog/public/BlogSidebar.tsx`

## Подход

1. Убрать старый `PageLayout` и визуально устаревшие градиентные шаблоны.
2. Пересобрать `enterprise` на существующих маркетинговых примитивах.
3. Перевести блог на общий белый/light-контур лендинга с теми же отступами, бордерами и CTA.
4. Сохранить текущую бизнес-логику получения статей, категорий и SEO.
5. Не добавлять неподтвержденные обещания, интеграции, метрики и декоративные сущности без данных.

## Критерии готовности

- страницы визуально совпадают с `HomePage`
- нет `PageLayout` на активных публичных маршрутах из этой области
- типы и `vitest` проходят
