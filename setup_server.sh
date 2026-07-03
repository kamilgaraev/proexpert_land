#!/bin/bash

# Скрипт автоматической настройки сервера МОСТ
# Запуск: bash setup_server.sh

set -e

echo "🚀 Настройка сервера МОСТ..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка что запущено от root
if [ "$EUID" -ne 0 ]; then
    print_error "Запустите скрипт от root: sudo bash setup_server.sh"
    exit 1
fi

print_status "Обновление системы..."
apt update && apt upgrade -y
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

print_success "Система обновлена"

print_status "Установка Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

NODE_VERSION=$(node --version)
print_success "Node.js установлен: $NODE_VERSION"

print_status "Установка PM2..."
npm install -g pm2
pm2 startup systemd
print_warning "После завершения скрипта выполните команду которую показал PM2 выше!"

print_status "Установка Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_success "Nginx установлен и запущен"

print_status "Установка Certbot для SSL..."
apt install -y certbot python3-certbot-nginx
print_success "Certbot установлен"

print_status "Создание рабочих директорий..."
mkdir -p /var/www/prohelper_marketing
mkdir -p /var/www/prohelper_lk
mkdir -p /backup
chown -R www-data:www-data /var/www/
chmod -R 755 /var/www/
print_success "Директории созданы"

print_status "Генерация SSH ключей для GitHub Actions..."
ssh-keygen -t rsa -b 4096 -f /root/.ssh/github_actions_key -N "" -q
cat /root/.ssh/github_actions_key.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

print_success "SSH ключи созданы"

print_status "Настройка Nginx конфигурации..."
if [ -f "deploy/nginx/prohelper.conf" ]; then
    rm -f /etc/nginx/sites-enabled/default
    cp deploy/nginx/prohelper.conf /etc/nginx/sites-available/
    ln -sf /etc/nginx/sites-available/prohelper.conf /etc/nginx/sites-enabled/
    
    # Временно комментируем SSL строки до получения сертификатов
    sed -i 's/listen 443 ssl http2;/listen 443 ssl http2; #TEMP_DISABLED/g' /etc/nginx/sites-available/prohelper.conf
    sed -i 's/ssl_certificate/#ssl_certificate/g' /etc/nginx/sites-available/prohelper.conf
    sed -i 's/include.*ssl-dhparams/#include/g' /etc/nginx/sites-available/prohelper.conf
    
    nginx -t && systemctl reload nginx
    print_success "Nginx настроен (SSL временно отключен)"
else
    print_warning "Файл deploy/nginx/prohelper.conf не найден. Настройте Nginx вручную."
fi

print_status "Создание скрипта резервного копирования..."
cat > /root/backup_prohelper.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /backup
tar -czf /backup/prohelper_${DATE}.tar.gz \
  /var/www/prohelper_marketing \
  /var/www/prohelper_lk \
  /etc/nginx/sites-available/prohelper.conf \
  /etc/letsencrypt/live/ 2>/dev/null || true
# Удаляем бэкапы старше 7 дней
find /backup -name "prohelper_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup_prohelper.sh

# Добавляем в cron
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup_prohelper.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

print_success "Скрипт резервного копирования создан"

echo ""
echo "🎉 Базовая настройка сервера завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Выполните команду PM2 startup которую показали выше"
echo "2. Настройте DNS записи для ваших доменов на IP этого сервера"
echo "3. Получите SSL сертификаты:"
echo "   certbot certonly --nginx -d prohelper.pro"
echo "   certbot certonly --nginx -d lk.prohelper.pro"
echo "   certbot certonly --manual --preferred-challenges dns -d '*.prohelper.pro'"
echo "4. Раскомментируйте SSL настройки в nginx: nano /etc/nginx/sites-available/prohelper.conf"
echo "5. Перезапустите nginx: systemctl reload nginx"
echo "6. Добавьте SSH ключ в GitHub Secrets:"
echo ""
print_warning "SSH PRIVATE KEY для GitHub Secrets:"
echo "=============================================="
cat /root/.ssh/github_actions_key
echo "=============================================="
echo ""
echo "7. Сделайте push в main ветку для автоматического деплоя"
echo ""
print_success "Сервер готов к работе!"
