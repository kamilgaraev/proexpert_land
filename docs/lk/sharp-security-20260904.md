# Обновление sharp для обработки изображений

Причина: audit подтвердил GHSA-f88m-g3jw-g9cj в sharp <0.35.0. Обновлён sharp 0.34.5 → 0.35.4 и его платформенные optional dependencies в lockfile. React, Vite и Router этим блоком не изменялись.

Совместимость проверена по Context7 /lovell/sharp: 0.35 требует Node>=20.9, старый install script удалён, нужны optional packages. `npm view sharp@0.35.4 engines` подтверждает >=20.9. Локально Node22.22.2, workflow deploy использует22. Известное применение: scripts/generate-og-images.mjs.

Воспроизводимая проверка без изменения изображений сайта: создан PNG1200x630 в памяти, sharp.resize(600,315).webp({quality:82}), повторно прочитаны метаданные. PASS: sharp0.35.4, libvips8.18.6, WebP600x315,410байт. Публичные изображения не перегенерировались. Сборка локально не запускалась. Gortex staged review APPROVE,0замечаний; индекс не связывает package.json с UI, это не доказательство отсутствия влияния.

Повторный npm audit завершён: sharp отсутствует в уязвимостях, осталось5 пакетов (4moderate/1high/0critical). Exec48335 завершён, не опрашивать. Новый CI33831283769 target=both запущен для a5f252ec, последняя проверка IN PROGRESS. Предыдущий выпуск формы8a2139db /33831028363 SUCCESS. Полная безопасность пока не закрыта: Vite/SSR/esbuild/Router остаются в реестре.
