#!/bin/bash

set -e

echo "=== Установка конфигураций Nginx для ProHelper ==="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

if [ "$EUID" -ne 0 ]; then 
    echo "Пожалуйста, запустите скрипт с sudo"
    exit 1
fi

echo "1. Копирование конфигураций..."
cp "$SCRIPT_DIR/nginx/prohelper.pro.conf" "$NGINX_AVAILABLE/"
cp "$SCRIPT_DIR/nginx/lk.prohelper.pro.conf" "$NGINX_AVAILABLE/"

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

