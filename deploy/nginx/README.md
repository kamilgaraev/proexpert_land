# Конфигурация Nginx для МОСТ

## Структура

- `1мост.рф.conf` - конфигурация для основного домена (лендинг)
- `lk.1мост.рф.conf` - конфигурация для личного кабинета

## Установка

### 1. Копирование конфигураций

```bash
sudo cp deploy/nginx/1мост.рф.conf /etc/nginx/sites-available/
sudo cp deploy/nginx/lk.1мост.рф.conf /etc/nginx/sites-available/
```

### 2. Создание симлинков

```bash
sudo ln -sf /etc/nginx/sites-available/1мост.рф.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/lk.1мост.рф.conf /etc/nginx/sites-enabled/
```

### 3. Удаление старых конфигураций (если есть)

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/prohelper
```

### 4. Проверка конфигурации

```bash
sudo nginx -t
```

### 5. Перезагрузка Nginx

```bash
sudo systemctl reload nginx
```

## SSL сертификаты

Если сертификаты еще не установлены:

```bash
sudo certbot --nginx -d 1мост.рф -d www.1мост.рф
sudo certbot --nginx -d lk.1мост.рф
```

## Автоматические редиректы

### 1мост.рф → lk.1мост.рф

Следующие маршруты автоматически редиректятся на поддомен:
- `/dashboard` и `/dashboard/*`
- `/login`
- `/register`
- `/forgot-password`

### HTTP → HTTPS

Все HTTP-запросы автоматически редиректятся на HTTPS (301).

## Кэширование

- **Статические файлы** (js, css, изображения): 1 год
- **HTML файлы**: без кэша (для правильной работы SPA)
- **robots.txt, sitemap.xml**: 1 час

## Логи

- Основной домен: `/var/log/nginx/prohelper-*.log`
- Личный кабинет: `/var/log/nginx/lk-prohelper-*.log`

## Проверка работы редиректов

```bash
curl -I https://1мост.рф/dashboard
curl -I https://1мост.рф/login
curl -I https://1мост.рф/register
```

Ожидаемый результат: `HTTP/1.1 301 Moved Permanently` с заголовком `Location: https://lk.1мост.рф/...`

