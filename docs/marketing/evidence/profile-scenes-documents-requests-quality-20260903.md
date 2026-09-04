# МОСТ — документы, заявки, качество

Дата: 3 сентября 2026. Статус: опубликовано и проверено. Commit `4add618b`, marketing workflow `33749377400` SUCCESS, 1 мин 30 с.

## Изменения

Три профильных страницы получили самостоятельные редакционные сцены вместо повторов каркаса/готового здания. Все созданы встроенным image_gen, с оригинальным бело-оранжевым знаком МОСТ из `logo-white.svg` в качестве референса. Размер 1536×1024; WebP quality 86, effort 6; композиция при экспорте не менялась.

| Страница | Изображение в public/images/marketing | Размер |
|---|---|---:|
| /construction-documents | most-document-versions-branded-v1.webp | 143154 Б |
| /site-requests | most-site-request-branded-v2.webp | 145196 Б |
| /construction-quality-control | most-quality-defect-branded-v1.webp | 153926 Б |

PNG сохранены в `output/imagegen/most-scenes-20260903/` под теми же именами. Исходные результаты: `exec-7ffa7b38-96f1-470d-a8d3-b9a6b1b20274.png`, `exec-518fe878-7b19-4c7e-a365-254a64dd071e.png`, `exec-18cbdc8b-60f1-41ab-a8fd-0dd03898ff9d.png` в каталоге генераций текущей задачи Codex.

## Брифы генерации и отбор

Общий промпт: photorealistic-natural, premium architectural editorial photograph, landscape 1536×1024, pale concrete/offwhite/graphite, soft natural daylight, restrained functional orange accents. Original logo reference only, preserve thick geometric M and orange support. No invented UI, readable fictitious labels, floating objects, decorative glow or watermarks.

Документы: close oblique overhead view of a project coordinator's oak desk, two architectural drawing versions fully supported flat and held by graphite clips; closed graphite binder with authentic logo printed in cover perspective; realistic hand compares a detail with pencil, other hand rests on desk. Logo and drawings remain within frame. Результат принят: бумага лежит на поверхности, не парит, знак узнаваем.

Заявка: forewoman in white hard hat and graphite jacket with authentic sleeve logo checks remaining plumbing materials on a site storage rack while holding a rugged tablet. Первый результат `exec-e23feaa9-42af-4b97-854e-4a521ef8e937.png` отклонён: планшет выглядел как пустой выключенный экран. Исправляющий промпт: rotate ONLY tablet and immediate hand grip so opaque graphite back with central hand strap and rear camera faces viewer, screen faces woman; preserve person, logo, materials, light and composition. V2 принят, тыльная сторона устройства однозначна; экран МОСТ не имитируется.

Качество: engineer crouches beside a small chipped edge of a concrete stair tread, points to the chip beside short orange tape pressed flat, tablet supported on thigh; authentic logo on jacket breast. No structural collapse, floating tape, impossible fingers or fictitious UI. Принят: показано конкретное замечание, отдельный ракурс и действие.

## Тексты

Переписаны только H1 и вводные абзацы этих трёх страниц. У заявки удалено техническое `| МОСТ` в видимом заголовке. У документов описание сосредоточено на версиях, согласовании и архиве; условия юридической значимости сохранены в FAQ, электронная подпись расшифрована. У качества перечисление «вести дефекты, ответственных...» заменено действиями: зафиксировать замечание, назначить ответственного, повторно проверить. Новые возможности и обещания не добавлялись; отдельные SEO title/description в common.ts не менялись.

## Проверки

Основной агент самостоятельно проверил три страницы в Codex IAB на 1440×960 и 390×844. Все сцены отображаются в пропорции 3:2, без обрезания ключевых деталей и горизонтального переполнения; broken images 0. Мобильная ширина изображения 335 px с полями 20 px при viewport 390. Проверены обновлённые тексты; условия юридической значимости остались в DOM FAQ.

ESLint трёх изменённых исходных файлов PASS. Prettier SeoClusterPage PASS. Два больших файла контента уже не соответствовали форматированию до изменений: это подтверждено отдельной проверкой их версий HEAD; весь каталог ради строковой правки не переформатировался. Автотесты не запускались: изменены только статические изображения/тексты, поведение не менялось. Проверка синтаксиса — ESLint, отображения — реальный браузер. Gortex impact низкий, guards не настроены; итоговый review и production-проверка фиксируются после выпуска.

Gortex detect_changes и review завершились после обновления индекса: 0 rule findings; MEDIUM по широким реестрам разобран по фактическому diff, изменения только статические. Production: три страницы и три WebP — HTTP 200, image/webp, байтовые размеры совпадают. HTML каждой страницы содержит свой новый файл. В Codex IAB основной агент проверил документы на 1440×960, заявки и качество на 390×844: нет broken images и горизонтального переполнения, логотипы и действия видны целиком. Canonical документов соответствует URL. Viewport сброшен. Проверочная вкладка выпуска — скрытая IAB tab9, так как прежняя tab8 закрыта.

Личная вкладка пользователя не использовалась. Предыдущая проверочная tab7 была закрыта; создана отдельная скрытая Codex IAB tab8. Общая цель ACTIVE, остальные повторяющиеся профильные сцены и общий аудит остаются открытыми.
