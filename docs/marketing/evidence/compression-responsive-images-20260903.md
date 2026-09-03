# МОСТ — сжатие и адаптивные изображения, 3 сентября 2026

## Серверное сжатие

Пользователь выполнил выданный проверяемый bash-блок на frontend/LK сервере 89.169.44.115. Backup: `/var/backups/most-nginx-6MlUeJd5/nginx-before.tar.gz`. Добавлен `/etc/nginx/conf.d/most-compression.conf`: gzip_vary on, comp_level 5, min_length 1024, CSS/JS/XML/SVG/plain MIME. gzip on уже был в http. Старый `sites-enabled/prohelper.pro.conf.bak.20260706180456`, создававший конфликт server_name, перенесён в backup. Итоговый nginx -t без конфликтов. Reload успешен.

Внешняя проверка GET через curl.exe с Accept-Encoding:gzip, без автоматической распаковки:

| Ресурс | Исходный размер, байт | Передано gzip, байт |
| --- | ---: | ---: |
| _default.page.server-BDWDmHxz.css | 186684 | 26045 |
| entries/entry-client-routing-BdnY2rOp.js | 39347 | 12492 |
| Главная HTML | 40776 | 9107 |

Все HTTP 200, Content-Encoding:gzip, Vary:Accept-Encoding. Статика сохранила Cache-Control public,immutable. Вход ЛК /login HTTP200 и X-Robots-Tag:noindex,nofollow. Размер HTML может меняться с содержимым. Это проверка фактического сжатия, не оценка Core Web Vitals. Новый PageSpeed score не получен: API вернул429.

## Мобильные изображения

Commit `93c8f5fc`: шесть WebP720×480, srcset720w/1536w в SeoClusterPage. Из исходных1536×1024 без обрезки, quality84. Изменений смысловых текстов, ссылок, бизнес-логики нет.

| Сцена | Исходный WebP | 720px WebP |
| --- | ---: | ---: |
| ПТО | 192182 | 42008 |
| Снабжение | 368038 | 74130 |
| Подрядчики | 111402 | 23168 |
| Документы | 143154 | 29500 |
| Заявки | 145196 | 45546 |
| Качество | 153926 | 36254 |

Все шесть страниц локально проверены в собственной скрытой Codex IAB tab11,390×844 DPR1: currentSrc720, complete=true, отображаемая ширина335, горизонтального переполнения нет. Документы и качество визуально осмотрены mobile. При1920×1080 для качества выбран оригинал1536; изображение осмотрено после загрузки. Viewport возвращён в исходное состояние. DPR2/3 не эмулировался: выбор на таких устройствах этим прогоном не доказан.

ESLint/Prettier изменённогоTSX PASS. Gortex detect/targets/guards/review выполнены: нет guard rules,0rule findings; MEDIUM из-за общего компонента, фактический diff только статическая карта и srcset. Новые unit-тесты не добавлялись: реальный браузер проверяет нужное поведение выбора ресурса. Локальная сборка не запускалась по правилам проекта; сборка выполняется в CI.

Workflow `33751900280` SUCCESS, deploy-marketing 1 мин 27 с. Production `93c8f5fc`. Все шесть страниц повторно проверены в Codex IAB390×844: currentSrc720, complete=true, naturalWidth>0, overflow=false, self-canonical правильный. Страница качества визуально осмотрена на production, viewport сброшен. Публикация этого блока подтверждена; общий редизайн остаётся незавершённым.
