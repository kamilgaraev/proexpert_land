# ProExpert - Платформа для управления строительными проектами

Веб-приложение для прорабов, соединяющее строительные процессы с финансовым учетом

## Технологии

- React 18+
- TypeScript
- Vite
- TailwindCSS
- React Router v7
- Framer Motion

## Требования к системе

- Node.js 20.x или выше
- npm 8.x или выше
- Git

## Установка и запуск (разработка)

1. Клонировать репозиторий:

```bash
git clone git@github.com:your-username/proexpert_land.git
cd proexpert_land
```

2. Установить зависимости:

```bash
npm install
```

3. Запустить в режиме разработки:

```bash
npm run dev
```

4. Приложение будет доступно по адресу [http://localhost:5173](http://localhost:5173)

## Сборка проекта для продакшена

```bash
npm run build
```

После сборки все файлы будут находиться в директории `dist`

## Деплой на сервер

### Требования к серверу

- Ubuntu 20.04/22.04 (рекомендуется)
- Node.js 20.x+
- Nginx
- Git

### Инструкция по деплою

1. Подготовка сервера:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Nginx
sudo apt install -y nginx

# Настройка файрвола
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```

2. Клонирование проекта:

```bash
sudo mkdir -p /var/www
cd /var/www
git clone git@github.com:your-username/proexpert_land.git
cd proexpert_land
```

3. Установка зависимостей и сборка:

```bash
npm install
npm run build
```

4. Настройка Nginx:

```bash
# Копирование конфигурационного файла
sudo cp nginx.conf /etc/nginx/sites-available/proexpert

# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/proexpert /etc/nginx/sites-enabled/

# Проверка синтаксиса
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

5. Настройка SSL (по желанию, но рекомендуется):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

6. Автоматический деплой:

Для настройки автоматического обновления используйте скрипт `deploy.sh`:

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Запуск скрипта деплоя
./deploy.sh
```

Вы также можете настроить запуск по cron или использовать webhook.

## Структура проекта

```
src/
  ├── components/      # Общие компоненты
  ├── contexts/        # React контексты (AuthContext)
  ├── hooks/           # Кастомные хуки
  ├── layouts/         # Макеты страниц
  ├── pages/           # Страницы
  │   ├── dashboard/   # Страницы дашборда
  │   └── landing/     # Страницы лендинга
  ├── utils/           # Утилиты и хелперы
  ├── assets/          # Статические ресурсы
  ├── App.tsx          # Основной компонент
  └── main.tsx         # Входная точка
```

## Дополнительная информация

- API находится по адресу: https://prohelper.pro/api/v1/landing/auth
- Документация API: (ссылка будет добавлена) 