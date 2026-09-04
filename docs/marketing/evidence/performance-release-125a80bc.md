# Производительность выпуска 125a80bc — 3 сентября 2026

Production: 125a80bcc825d61ac529c408cb9e82d6d3a9462c. Marketing workflow 33729486216 завершился success; кабинет пропущен.

Повторены по одному mobile и desktop замеру Lighthouse 13.4.1 с теми же профилями, что в performance-20260903.md: only-categories=performance, headless Chrome, simulated throttling, отдельные navigation-запуски. Ошибок и предупреждений нет. Это лабораторные единичные наблюдения, не доказательство полевого INP или статистической значимости разницы.

| Профиль | Было / стало Performance | FCP, с | LCP, с | TBT, мс | CLS |
| --- | --- | --- | --- | --- | --- |
| Mobile | 56 / 57 | 8,440 / 5,775 | 8,724 / 7,800 | 121 / 234 | 0 / 0 |
| Desktop | 83 / 93 | 1,720 / 1,055 | 1,894 / 1,475 | 17,5 / 0 | 0,00292 / 0 |

Google Fonts больше не запрашиваются; файлы шрифтов загружаются с домена сайта. Опубликованы ленивые приватные провайдеры и исправленный жизненный цикл client root. Независимое production UI-ревью трёх страниц решений на 390/1440/2215 и с текстом 200%: APPROVE, см. segments-delivery-production-20260903.md.

## Выявленное ограничение выпуска

SSR автоматически добавляет preload ко всем 21 WOFF2. HTML и Lighthouse network подтверждают isLinkPreload=true, High priority и 320097 байт суммарной передачи шрифтов. Локальная dev-проверка трёх реально используемых subset не покрывала production asset injection; считать font-оптимизацию полностью завершённой нельзя.

Причина проверена по установленному vite-plugin-ssr 0.4.142: getHtmlTags назначает font/style HTML_BEGIN; renderer не передаёт injectFilter. API подтверждён Context7. Следующая правка: оставить ранний preload Sans latin/cyrillic по импортированным Vite URL; для остальных font/non-entry отключить inject. Не менять CSS/JS/image entries и не удалять @font-face/unicode-range. Два выбранных Sans — 75730 байт, остальные 19 — 244367 байт; это размер исключаемой принудительной предзагрузки, а не обещание итоговой экономии/LCP.

CSS/JS по-прежнему передаются без сжатия; общий CSS 186684 байта, Home CSS 43513. Серверное сжатие и кеширование изображений остаются отдельной незакрытой задачей. Доступ к фактической Nginx-конфигурации marketing-хоста пока не подтверждён.

## Артефакты

- output/performance/home-mobile-125a80bc.report.json и .report.html, trace/devtoolslog.
- output/performance/home-desktop-125a80bc.report.json и .report.html, trace/devtoolslog.
- output/performance/font-preload-diagnosis-125a80bc.json.
- output/performance/home-125a80bc-preload-diagnosis.html.
- output/playwright/delivery-prod-home-390.png, -1440.png, -2215.png. Root визуально проверил 2215: hero до краёв, согласованный фон; наличие системного gutter не принято как исправленное.

Новые требования пользователя: настоящий бегунок поверх контента без подложки и резервируемой полосы; липкая шапка с корректными якорями и мобильным меню. Пока не реализованы и не опубликованы.
