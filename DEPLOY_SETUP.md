# Настройка автоматического деплоя

## Требования

- Ubuntu/Debian сервер с установленными:
  - Node.js 18+
  - Git
  - Nginx
  - SSH доступ

## Шаги настройки

### 1. Настройка сервера

1. **Создайте директорию проекта на сервере:**
   ```bash
   sudo mkdir -p /var/www/proexpert_land
   sudo chown $USER:$USER /var/www/proexpert_land
   ```

2. **Клонируйте репозиторий:**
   ```bash
   cd /var/www/proexpert_land
   git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> .
   ```

3. **Настройте Nginx:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/proexpert_land
   sudo ln -s /etc/nginx/sites-available/proexpert_land /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Сделайте скрипт деплоя исполняемым:**
   ```bash
   chmod +x deploy.sh
   ```

### 2. Настройка GitHub Actions

1. **В настройках репозитория GitHub перейдите в Settings → Secrets and Variables → Actions**

2. **Добавьте следующие секреты:**
   - `HOST` - IP адрес или домен вашего сервера
   - `USERNAME` - имя пользователя для SSH подключения
   - `PRIVATE_KEY` - приватный SSH ключ для подключения к серверу
   - `PORT` - порт SSH (обычно 22)

### 3. Генерация SSH ключа (если нужно)

На вашем компьютере:
```bash
ssh-keygen -t rsa -b 4096 -C "deploy@proexpert_land"
```

Скопируйте публичный ключ на сервер:
```bash
ssh-copy-id user@your-server.com
```

Приватный ключ добавьте в GitHub Secrets как `PRIVATE_KEY`.

### 4. Настройка прав sudo (для перезапуска Nginx)

На сервере добавьте в sudoers:
```bash
sudo visudo
```

Добавьте строку:
```
ваш_пользователь ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx, /usr/bin/nginx -t, /bin/chown
```

## Использование

### Автоматический деплой
Просто сделайте push в ветку `main` или `master` - GitHub Actions автоматически развернет проект.

### Ручной деплой
Запустите на сервере:
```bash
cd /var/www/proexpert_land
./deploy.sh
```

## Мониторинг

### Проверка логов GitHub Actions
Перейдите в раздел Actions вашего репозитория на GitHub.

### Проверка логов Nginx
```bash
sudo tail -f /var/log/nginx/proexpert-access.log
sudo tail -f /var/log/nginx/proexpert-error.log
```

### Проверка статуса проекта
```bash
systemctl status nginx
curl -I http://ваш-домен
```

## Устранение проблем

### Если деплой не проходит
1. Проверьте права доступа к директории
2. Убедитесь, что пользователь может выполнять sudo команды
3. Проверьте SSH подключение
4. Посмотрите логи в GitHub Actions

### Восстановление после неудачного деплоя
Скрипт автоматически создает бэкапы. Если что-то пошло не так:
```bash
cd /var/www/proexpert_land
ls -la dist.backup.*
# Восстановите нужный бэкап
mv dist.backup.YYYYMMDD_HHMMSS dist
```

## Безопасность

- Используйте SSH ключи вместо паролей
- Ограничьте sudo права только необходимыми командами
- Регулярно обновляйте сервер и зависимости
- Используйте HTTPS для вашего домена

## Дополнительные возможности

### Настройка домена с SSL
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.com
```

### Настройка мониторинга
Можете добавить уведомления в Telegram/Slack при успешном/неудачном деплое. 