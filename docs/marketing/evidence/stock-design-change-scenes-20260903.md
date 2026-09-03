# Материалы, проектная документация и изменения — 3 сентября 2026

## Изменение

Три отдельные рабочие сцены вместо повторов готового здания. Единая фотографическая палитра: бетон, графитовая одежда, естественный свет, знак МОСТ на рабочем предмете или одежде. Изображения обозначают конкретное действие и не изображают интерфейс продукта.

| Страница | Сюжет | WebP 1536 / 720, байт |
| --- | --- | --- |
| /material-accounting | Кладовщик сверяет блоки на стеллаже, держит планшет | 186922 / 56472 |
| /pir-project-documentation | Проектировщик делает отметки на лежащем чертеже, рядом папка со знаком | 107938 / 27820 |
| /change-control | Инженеры сверяют проём с чертежом на объекте | 112308 / 32130 |

Файлы: most-stock-count-branded-v1, most-design-review-branded-v1, most-change-discussion-branded-v1; обычный и -720.webp. Исходные PNG сохранены в output/imagegen/most-scenes-20260903. Генерация встроенным imagegen, без отдельного видео. Бумага имеет опору, инструмент удерживается; визуальная проверка не выявила пересечений людей с мебелью. Знак воспроизведён по референсу, это не гарантия пиксельного совпадения с SVG.

## Тексты и границы обещаний

Материалы: приход, перемещение, списание, расчётный остаток по внесённым операциям. ПИР: разделы, версии, замечания, выпуск комплекта; убраны неподтверждённые обещания IFC, инженерную проверку и нормоконтроль выполняют специалисты. Изменения: команда оценивает сроки и деньги, уполномоченные участники принимают решение; новая FAQ отделяет запись в сервисе от изменения договорных обязательств. Основание ограничений: evidence/estimates-20260903.md и product-truth-matrix.md.

Маршруты, API, формы и метаданные не менялись. Полная редактура всех внутренних страниц и общий SEO-аудит остаются отдельной незавершённой частью цели.

## Проверка до выпуска

- Gortex transaction most-stock-design-change-20260903: disk committed, graph fresh.
- detect_changes LOW; для двух статических реестров test targets отсутствуют, guard rules не заданы.
- ESLint двух изменённых TS/TSX и Prettier TSX: PASS. Новые тесты не добавлены: меняются текст и адреса изображений. Локальная сборка не запускалась.
- Gortex deterministic review: APPROVE, замечаний нет. Это не полноценное дизайнерское ревью.
- Собственная скрытая вкладка Codex IAB 18: три первых экрана осмотрены при 1440×960 и 390×844. На мобильном три изображения загружены, выбран -720.webp, горизонтального переполнения нет. Проверен раскрытый ответ о сроках и стоимости. Viewport сброшен.

## Выпуск

Опубликован bead66e1, workflow 33765062337 SUCCESS за 1 минуту 16 секунд. Проверка production в собственной скрытой Codex IAB tab18: материалы и изменения 390×844, ПИР 1440×960. Три H1, canonical и изображения соответствуют выпуску, изображения complete/naturalWidth>0, переполнения нет. Три экрана осмотрены, viewport сброшен.

## Дополнительная сверка — ещё не выпущена

Поиск IFC выявил старые обещания в common.ts, карточках seoPages.ts/solutions.ts, generate-og-images.mjs и OG SVG/PNG. Эти места исправлены локально (transaction most-pir-public-contract-20260903). Добавлена regression-проверка отсутствия неподтверждённых BIM/IFC в публичных данных и OG: PASS. ESLint изменённых файлов PASS. PNG пересобран из SVG через имеющийся sharp; визуальная проверка OG и финальная проверка Gortex ещё нужны.

Полный marketingContent.test.ts: 30 PASS, 6 FAIL. Не скрывать и не объявлять весь модуль зелёным. Падения: maps each route only to registry entries selected by its page (enterprise multi-org), assigns one commercial search intent to each priority landing page, keeps mobile and AI process comparisons fully declarative, uses plain Russian and rejects promises across all commercial cluster pages (старые first-use contracts), publishes complete and distinct content for the 15 rewritten routes (mobile-app требует точное «роль», текст содержит «роли»), expands the first public use of the electronic signature abbreviation (в новом hero документов нет ЭП). Нужен отдельный разбор контрактов по фактическому UI, без подгонки текстов под устаревшие строки.

Gortex index_health health100/stale0/failures0/status refreshing, но detect_changes пока отказывает по pending mutation-76/78/81, get_symbol_source дважды истёк. Изменения на диске подтверждены, не повторять mutation. Следующим шагом проверить тот же transaction/очередь, затем разобрать тесты и завершить выпуск дополнительной сверки.
