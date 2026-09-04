# Точная тема блога — production API

3 сентября 2026. Backend PR https://github.com/kamilgaraev/proexpert/pull/619 слит; merge commit 73a3701bffba99cc617d1936300dcc9c59edda6b. Штатный Deploy Backend to Production run33732472191 завершился success. Пользователь явно уточнил: запрет миграций относится к локальному запуску, штатные production-миграции в разрешённом деплое допускаются. Уточнение внесено в корневой AGENTS.md и .agent/rules/core.md, laravel.md.

Исходный task commit bb0ee39e1c2b44914b418673c216dfc3a6613fc6 перебазирован на c7396965e без конфликтов: 14 новых commits касались юридического архива, исполняемый код фильтра не изменился. До выпуска: 22 целевых PostgreSQL-сценария подтверждены, Pint/PHPStan PASS, независимое ревью APPROVE. Повтор неизменённых тестов не выполнялся.

Публичные GET после успешного деплоя к api.1мост.рф/api/v1/blog/articles:

| Запрос | HTTP | Наблюдение |
| --- | --- | --- |
| tag_slug=pto&per_page=1&page=1 | 200 | статья19; total3, current_page1, last_page3; у статьи есть точный tag pto |
| tag_slug=pto&per_page=1&page=2 | 200 | статья17; total3, current_page2, last_page3; у статьи есть точный tag pto |
| tag_slug=most-audit-unknown-20260903 | 404 | success=false |
| tag_slug=pto&page=0 | 422 | success=false |
| tag_slug=pto&page=99999 | 200 | пустой массив; current_page99999, last_page1, per_page12, total3 |

Production-данные не создавались и не менялись проверками. Пустая известная тема и пересечение category/search покрыты изолированными тестами; отдельные production-фикстуры для них не создавались. Frontend точной темы пока локален и требует завершения форматирования, независимого ревью и отдельного marketing-выпуска.

Ответы сохранены в C:/Users/kamilgaraev/.codex/audits/most-2026-09-03/blog-api-{exact,page2,unknown,invalid,out-of-range}.json; публичный список тем — blog-tags-production.json.
