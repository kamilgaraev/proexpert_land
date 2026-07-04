#!/bin/bash

echo "🔒 Настройка SSL для ЛК сервера (1мост.рф + lk.1мост.рф + *.1мост.рф)"

# Проверка что скрипт запущен с sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Пожалуйста, запустите скрипт с sudo"
    exit 1
fi

# Установка Certbot
echo "📦 Установка Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Функция для получения сертификата
get_certificate() {
    local domains="$1"
    local cert_name="$2"
    
    echo "🌟 Получение SSL сертификата для: $domains"
echo "⚠️ ВНИМАНИЕ: Вам потребуется добавить TXT записи в DNS панели reg.ru!"
    echo "📋 Certbot покажет вам TXT записи для каждого домена"
echo ""
echo "Нажмите Enter когда будете готовы продолжить..."
read -p ""

certbot certonly \
    --manual \
    --preferred-challenges dns \
    --email kamilgaraev11@gmail.com \
    --agree-tos \
    --no-eff-email \
        --cert-name "$cert_name" \
        $domains
}

# Остановка Nginx
echo "⏸️ Остановка Nginx..."
systemctl stop nginx

# Получение основного SSL сертификата
get_certificate "-d lk.1мост.рф -d 1мост.рф" "lk.1мост.рф"

# Проверяем что основной сертификат был получен
if [ ! -f "/etc/letsencrypt/live/lk.1мост.рф/fullchain.pem" ]; then
    echo "❌ Основной сертификат не был получен. Проверьте DNS записи и попробуйте снова."
    systemctl start nginx
    exit 1
fi

echo "✅ Основной SSL сертификат успешно получен!"

# Получение wildcard сертификата для поддоменов холдингов
echo ""
echo "🔄 Теперь получаем wildcard сертификат для поддоменов холдингов..."
get_certificate "-d *.1мост.рф" "wildcard.1мост.рф"

# Проверяем что wildcard сертификат был получен
if [ ! -f "/etc/letsencrypt/live/wildcard.1мост.рф/fullchain.pem" ]; then
    echo "⚠️ Wildcard сертификат не был получен, но основной сертификат есть."
    echo "🔄 Продолжаем настройку с основным сертификатом..."
    WILDCARD_AVAILABLE=false
else
    echo "✅ Wildcard SSL сертификат успешно получен!"
    WILDCARD_AVAILABLE=true
fi

# Настройка автообновления
echo "🔄 Настройка автообновления сертификатов..."
cat > /etc/systemd/system/certbot-renew-lk.service << 'EOF'
[Unit]
Description=Certbot Renewal for LK and Holdings
After=syslog.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --no-self-upgrade --post-hook "systemctl reload nginx"
EOF

cat > /etc/systemd/system/certbot-renew-lk.timer << 'EOF'
[Unit]
Description=Timer for Certbot Renewal LK and Holdings

[Timer]
OnBootSec=300
OnUnitActiveSec=1d

[Install]
WantedBy=multi-user.target
EOF

systemctl enable certbot-renew-lk.timer
systemctl start certbot-renew-lk.timer

# Создание обновленной nginx конфигурации
echo "⚙️ Создание обновленной конфигурации Nginx..."
cat > /etc/nginx/sites-available/prohelper-lk << 'EOF'
# HTTP -> HTTPS редирект для всех доменов
server {
    listen 80;
    server_name 1мост.рф lk.1мост.рф *.1мост.рф;
    return 301 https://$server_name$request_uri;
}

# Основной сайт 1мост.рф
server {
    listen 443 ssl http2;
    server_name 1мост.рф;
    
    ssl_certificate /etc/letsencrypt/live/lk.1мост.рф/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lk.1мост.рф/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/prohelper_land/dist;
    index index.html;
    
    # Основные страницы
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Логи
    access_log /var/log/nginx/prohelper_access.log;
    error_log /var/log/nginx/prohelper_error.log;
}

# ЛК сайт lk.1мост.рф
server {
    listen 443 ssl http2;
    server_name lk.1мост.рф;
    
    ssl_certificate /etc/letsencrypt/live/lk.1мост.рф/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lk.1мост.рф/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/prohelper_land/dist;
    index index.html;
    
    # ЛК страницы
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
    
    # API проксирование
    location /api/ {
        proxy_pass https://api.1мост.рф;
        proxy_set_header Host api.1мост.рф;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Логи
    access_log /var/log/nginx/lk_access.log;
    error_log /var/log/nginx/lk_error.log;
}

EOF

# Добавляем конфигурацию для поддоменов холдингов
if [ "$WILDCARD_AVAILABLE" = true ]; then
    echo "📝 Добавляем конфигурацию для поддоменов холдингов с wildcard сертификатом..."
    cat >> /etc/nginx/sites-available/prohelper-lk << 'EOF'
# Поддомены холдингов (например: proverocka.1мост.рф)
server {
    listen 443 ssl http2;
    server_name ~^(?<holding_slug>[^.]+)\.prohelper\.pro$;
    
    ssl_certificate /etc/letsencrypt/live/wildcard.1мост.рф/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wildcard.1мост.рф/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/prohelper_land/dist;
    index index.html;
    
    # Все маршруты отдаем React приложение
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
    
    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Логи для поддоменов
    access_log /var/log/nginx/holding_access.log;
    error_log /var/log/nginx/holding_error.log;
}
EOF
else
    echo "⚠️ Wildcard сертификат недоступен. Поддомены холдингов будут работать без SSL."
    echo "💡 Повторите получение wildcard сертификата позже командой:"
    echo "   sudo certbot certonly --manual --preferred-challenges dns -d '*.1мост.рф' --cert-name wildcard.1мост.рф"
fi

# Активация конфигурации
echo "🔗 Активация конфигурации..."
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/prohelper-lk /etc/nginx/sites-enabled/

# Создание директории для логов
mkdir -p /var/log/nginx

# Тестируем конфигурацию nginx
echo "🧪 Тестирование конфигурации Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Конфигурация Nginx корректна"
    echo "🚀 Запуск Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    echo ""
    echo "🎉 SSL успешно настроен!"
    echo "📋 Доступные адреса:"
    echo "   • Основной сайт: https://1мост.рф"
    echo "   • ЛК: https://lk.1мост.рф"
    if [ "$WILDCARD_AVAILABLE" = true ]; then
        echo "   • Поддомены холдингов: https://proverocka.1мост.рф"
    fi
    echo ""
    echo "🔄 Автообновление настроено"
    echo "📊 Проверить статус: systemctl status certbot-renew-lk.timer"
    echo ""
    echo "🔍 Полезные команды для проверки:"
    echo "   • Статус сертификатов: sudo certbot certificates"
    echo "   • Логи поддоменов: sudo tail -f /var/log/nginx/holding_access.log"
    echo "   • Проверка SSL: curl -I https://proverocka.1мост.рф"
else
    echo "❌ Ошибка в конфигурации Nginx"
    echo "🔍 Проверьте конфигурацию: nginx -t"
    echo "📝 Лог ошибок: tail -f /var/log/nginx/error.log"
    exit 1
fi
