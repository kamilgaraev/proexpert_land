# Настройка CI/CD для ProHelper

## Что создано

Создано 2 варианта автоматического деплоя:

1. **`.github/workflows/deploy.yml`** - деплой через FTP
2. **`.github/workflows/deploy-ssh.yml`** - деплой через SSH

## Выберите нужный вариант и удалите ненужный

### Вариант 1: FTP деплой (проще для shared hosting)

1. Оставьте файл `.github/workflows/deploy.yml`
2. Удалите `.github/workflows/deploy-ssh.yml`
3. В настройках GitHub репозитория добавьте секреты:
   - `FTP_SERVER` - адрес FTP сервера (например: `ftp.example.com`)
   - `FTP_USERNAME` - логин FTP
   - `FTP_PASSWORD` - пароль FTP

### Вариант 2: SSH деплой (для VPS/выделенных серверов)

1. Оставьте файл `.github/workflows/deploy-ssh.yml`  
2. Удалите `.github/workflows/deploy.yml`
3. В настройках GitHub репозитория добавьте секреты:
   - `HOST` - IP адрес сервера
   - `USERNAME` - имя пользователя SSH
   - `SSH_KEY` - приватный SSH ключ

## Как добавить секреты в GitHub

1. Идите в Settings вашего репозитория
2. Выберите "Secrets and variables" → "Actions"
3. Нажмите "New repository secret"
4. Добавьте нужные секреты

## Настройка папок

В workflow файлах настройте правильные пути:

### Для FTP:
```yaml
server-dir: /public_html/  # Измените на вашу папку
```

### Для SSH:
```yaml
target: "/var/www/html/"   # Измените на вашу папку
```

## Как работает

1. Вы делаете `git push` в ветку `main`
2. GitHub Actions автоматически:
   - Устанавливает зависимости (`npm ci`)
   - Собирает проект (`npm run build`)
   - Загружает файлы на сервер
3. Сайт обновляется автоматически

## Тестирование

Чтобы протестировать без деплоя, сначала сделайте push в другую ветку или временно отключите деплой, добавив `if: false` к шагу Deploy. 