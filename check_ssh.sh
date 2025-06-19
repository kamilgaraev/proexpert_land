#!/bin/bash

# Скрипт для проверки SSH настроек на сервере
# Запустите этот скрипт на сервере под вашим пользователем

echo "🔍 Проверка SSH настроек для деплоя"
echo "======================================"

# Проверка пользователя
echo "👤 Текущий пользователь: $(whoami)"
echo "🏠 Домашняя директория: $HOME"

# Проверка SSH директории
echo ""
echo "📁 Проверка SSH директории:"
if [ -d "$HOME/.ssh" ]; then
    echo "✅ Директория ~/.ssh существует"
    ls -la $HOME/.ssh/
    echo ""
    echo "🔒 Права доступа:"
    stat -c "%a %n" $HOME/.ssh/
    if [ -f "$HOME/.ssh/authorized_keys" ]; then
        stat -c "%a %n" $HOME/.ssh/authorized_keys
        echo ""
        echo "🔑 Количество ключей в authorized_keys:"
        wc -l $HOME/.ssh/authorized_keys
        echo ""
        echo "📋 Первые 50 символов каждого ключа:"
        cut -c1-50 $HOME/.ssh/authorized_keys
    else
        echo "❌ Файл authorized_keys не найден"
    fi
else
    echo "❌ Директория ~/.ssh не существует"
fi

# Проверка директории проекта
echo ""
echo "📂 Проверка директории проекта:"
if [ -d "/var/www/proexpert_land" ]; then
    echo "✅ Директория /var/www/proexpert_land существует"
    ls -la /var/www/proexpert_land/
    echo ""
    echo "👥 Владелец директории:"
    stat -c "%U:%G %n" /var/www/proexpert_land/
else
    echo "❌ Директория /var/www/proexpert_land не существует"
fi

# Проверка sudo прав
echo ""
echo "🔐 Проверка sudo прав:"
echo "Команды которые должны работать без пароля:"
sudo -l | grep -E "(nginx|systemctl|chown)" || echo "❌ Нет настроенных sudo прав"

echo ""
echo "✨ Проверка завершена!"
echo ""
echo "📝 Что делать дальше:"
echo "1. Если директория ~/.ssh не существует - создайте её"
echo "2. Если нет authorized_keys - создайте файл и добавьте публичный ключ"
echo "3. Проверьте права: директория 700, файл 600"
echo "4. Убедитесь что публичный ключ добавлен правильно" 