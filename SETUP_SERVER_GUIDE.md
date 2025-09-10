# Настройка сервера ProHelper с нуля

## 1. Подготовка сервера

### Обновление системы
```bash
apt update && apt upgrade -y
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
```

### Создание пользователя для деплоя (опционально)
```bash
adduser deploy
usermod -aG sudo deploy
# Переключиться на пользователя deploy или продолжить от root
```

## 2. Установка Node.js 20

```bash
# Добавляем официальный репозиторий NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Проверяем версии
node --version  # должно быть v20.x.x
npm --version
```

## 3. Установка PM2

```bash
npm install -g pm2
pm2 startup systemd  # настройка автозапуска
# Выполнить команду которую покажет PM2
```

## 4. Установка и настройка Nginx

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

## 5. Настройка SSL сертификатов

### Установка Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Получение сертификатов
```bash
# Основной домен
certbot certonly --nginx -d prohelper.pro

# Личный кабинет  
certbot certonly --nginx -d lk.prohelper.pro

# Wildcard для поддоменов (требует DNS validation)
certbot certonly --manual --preferred-challenges dns -d "*.prohelper.pro"
```

**Важно:** Для wildcard сертификата нужно добавить TXT запись в DNS как покажет certbot.

### Автопродление сертификатов
```bash
crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Создание рабочих директорий

```bash
mkdir -p /var/www/prohelper_marketing
mkdir -p /var/www/prohelper_lk
chown -R www-data:www-data /var/www/
chmod -R 755 /var/www/
```

## 7. Настройка Nginx

```bash
# Удаляем дефолтную конфигурацию
rm /etc/nginx/sites-enabled/default

# Копируем нашу конфигурацию
cp deploy/nginx/prohelper.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/prohelper.conf /etc/nginx/sites-enabled/

# Проверяем конфигурацию
nginx -t

# Перезапускаем
systemctl reload nginx
```

## 8. Настройка GitHub Actions (SSH ключи)

### На сервере:
```bash
# Генерируем SSH ключ для GitHub Actions
ssh-keygen -t rsa -b 4096 -f /root/.ssh/github_actions_key -N ""

# Добавляем публичный ключ в authorized_keys
cat /root/.ssh/github_actions_key.pub >> /root/.ssh/authorized_keys

# Показываем приватный ключ для добавления в GitHub Secrets
cat /root/.ssh/github_actions_key
```

### В GitHub репозитории:
1. Идем в `Settings` → `Secrets and variables` → `Actions`
2. Добавляем секреты:
   - `HOST`: IP адрес вашего сервера
   - `SSH_KEY`: содержимое приватного ключа из `/root/.ssh/github_actions_key`

## 9. Первоначальный деплой

### Вариант 1: Автоматический через GitHub Actions
Сделайте коммит в main ветку - деплой запустится автоматически.

### Вариант 2: Ручной деплой для тестирования

```bash
# На сервере клонируем репозиторий
cd /tmp
git clone https://github.com/ваш-username/prohelper_land.git
cd prohelper_land

# Собираем маркетинг
rm -rf node_modules package-lock.json || true
npm install --include=dev --no-audit --no-fund
npm run build:marketing

# Копируем файлы маркетинга
cp package.json dist/
cp package-lock.json dist/ || true
tar -czf marketing.tgz -C dist client server assets.json package.json package-lock.json || true
tar -xzf marketing.tgz -C /var/www/prohelper_marketing
cd /var/www/prohelper_marketing
npm install --omit=dev --no-audit --no-fund

# Запускаем SSR сервер
pm2 delete prohelper-ssr || true
PORT=3001 pm2 start server/index.cjs --name prohelper-ssr --time
pm2 save

# Собираем личный кабинет
cd /tmp/prohelper_land
npm run build:lk
cp -r dist-lk/* /var/www/prohelper_lk/

# Очистка
rm -rf /tmp/prohelper_land
```

## 10. Проверка работы

```bash
# Проверяем статус PM2
pm2 status

# Проверяем логи
pm2 logs prohelper-ssr

# Проверяем Nginx
systemctl status nginx

# Проверяем SSL
curl -I https://prohelper.pro
curl -I https://lk.prohelper.pro

# Проверяем доступность страниц
curl https://prohelper.pro
curl https://lk.prohelper.pro
```

## 11. Мониторинг и логи

```bash
# Логи Nginx
tail -f /var/log/nginx/prohelper_access.log
tail -f /var/log/nginx/prohelper_error.log
tail -f /var/log/nginx/lk_access.log

# Логи PM2
pm2 logs prohelper-ssr --lines 100

# Автоматическое восстановление PM2 процессов
pm2 install pm2-auto-pull  # для автообновления из git (опционально)
```

## 12. Резервное копирование

```bash
# Создаем скрипт бэкапа
cat > /root/backup_prohelper.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/prohelper_${DATE}.tar.gz \
  /var/www/prohelper_marketing \
  /var/www/prohelper_lk \
  /etc/nginx/sites-available/prohelper.conf \
  /etc/letsencrypt/live/
EOF

chmod +x /root/backup_prohelper.sh

# Добавляем в cron (ежедневно в 3:00)
echo "0 3 * * * /root/backup_prohelper.sh" | crontab -
```

## Финальная проверка

После завершения настройки должны работать:
- https://prohelper.pro (маркетинговый сайт с SSR)
- https://lk.prohelper.pro (личный кабинет SPA)
- https://любой-поддомен.prohelper.pro (холдинги)

GitHub Actions автоматически будут деплоить изменения при пуше в main ветку.
