#!/bin/bash

# Скрипт для автоматического деплоя ProExpert
# Улучшенная версия с логированием и обработкой ошибок

set -e  # Остановка при ошибках

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Логирование
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ОШИБКА] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[ПРЕДУПРЕЖДЕНИЕ] $1${NC}"
}

# Проверка на наличие правильной директории
PROJECT_DIR="/var/www/proexpert_land"
if [ ! -d "$PROJECT_DIR" ]; then
    error "Директория проекта $PROJECT_DIR не найдена"
    exit 1
fi

log "Начинаем деплой проекта ProExpert..."

# Переход в директорию проекта
cd "$PROJECT_DIR"

# Проверка статуса Git
log "Проверка статуса Git репозитория..."
if ! git status &>/dev/null; then
    error "Это не Git репозиторий или Git не доступен"
    exit 1
fi

# Вывод информации о текущей ветке
log "Текущая ветка Git: $(git branch --show-current)"

# Создание бэкапа текущей сборки
if [ -d "dist" ]; then
    log "Создание бэкапа текущей сборки..."
    cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)
fi

# Получение последних изменений
log "Получение последних изменений из репозитория..."
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
git pull origin $(git branch --show-current)
NEW_COMMIT=$(git rev-parse HEAD)

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    log "Новых изменений нет. Проверяем актуальность сборки..."
else
    log "Получены новые изменения. Коммит: $NEW_COMMIT"
fi

# Установка зависимостей
log "Установка зависимостей..."
npm ci --production=false

# Сборка проекта
log "Сборка проекта..."
npm run build

# Проверка успешности сборки
if [ ! -d "dist" ]; then
    error "Сборка не удалась, директория dist не создана"
    # Восстановление бэкапа если есть
    if [ -d "dist.backup.$(date +%Y%m%d_%H%M%S)" ]; then
        warning "Восстанавливаем предыдущую сборку..."
        mv dist.backup.$(date +%Y%m%d_%H%M%S) dist
    fi
    exit 1
fi

log "Сборка успешно завершена"

# Проверка прав доступа на файлы
log "Настройка прав доступа..."
sudo chown -R www-data:www-data dist

# Проверка и перезапуск Nginx если нужно
log "Проверка конфигурации Nginx..."
if sudo nginx -t; then
    log "Конфигурация Nginx корректна. Перезапускаем..."
    sudo systemctl reload nginx
    log "Nginx успешно перезапущен"
else
    error "Ошибка в конфигурации Nginx"
    exit 1
fi

# Очистка старых бэкапов (оставляем только последние 5)
log "Очистка старых бэкапов..."
find . -name "dist.backup.*" -type d | sort -r | tail -n +6 | xargs rm -rf

log "✅ Деплой успешно завершен!"
log "🌐 Сайт должен быть доступен в браузере"
log "📝 Коммит: $NEW_COMMIT"
log "⏰ Время завершения: $(date)" 