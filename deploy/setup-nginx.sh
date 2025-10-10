#!/bin/bash

set -e

echo "=== Установка конфигураций Nginx для ProHelper ==="

NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

if [ "$EUID" -ne 0 ]; then 
    echo "Пожалуйста, запустите скрипт с sudo"
    exit 1
fi

if [ ! -f "/tmp/prohelper.pro.conf" ] || [ ! -f "/tmp/lk.prohelper.pro.conf" ]; then
    echo "Ошибка: Конфигурационные файлы не найдены в /tmp/"
    echo "Сначала загрузите файлы на сервер:"
    echo "  scp deploy/nginx/prohelper.pro.conf user@server:/tmp/"
    echo "  scp deploy/nginx/lk.prohelper.pro.conf user@server:/tmp/"
    exit 1
fi

echo "1. Копирование конфигураций..."
cp "/tmp/prohelper.pro.conf" "$NGINX_AVAILABLE/"
cp "/tmp/lk.prohelper.pro.conf" "$NGINX_AVAILABLE/"

echo "2. Создание симлинков..."
ln -sf "$NGINX_AVAILABLE/prohelper.pro.conf" "$NGINX_ENABLED/"
ln -sf "$NGINX_AVAILABLE/lk.prohelper.pro.conf" "$NGINX_ENABLED/"

echo "3. Удаление старых конфигураций..."
rm -f "$NGINX_ENABLED/default"

echo "4. Проверка конфигурации Nginx..."
nginx -t

echo "5. Перезагрузка Nginx..."
systemctl reload nginx

echo ""
echo "✅ Конфигурация успешно установлена!"
echo ""
echo "Проверьте редиректы:"
echo "  curl -I https://prohelper.pro/dashboard"
echo "  curl -I https://prohelper.pro/login"
echo ""
echo "Для установки/обновления SSL сертификатов:"
echo "  sudo certbot --nginx -d prohelper.pro -d www.prohelper.pro"
echo "  sudo certbot --nginx -d lk.prohelper.pro"

