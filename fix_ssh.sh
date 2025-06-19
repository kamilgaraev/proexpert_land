#!/bin/bash

# Скрипт для настройки SSH на сервере
# Запустите этот скрипт на сервере

echo "🔧 Настройка SSH для деплоя"
echo "============================="

# Создание SSH директории
echo "📁 Создание SSH директории..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "✅ Директория ~/.ssh создана с правами 700"

# Создание файла authorized_keys
echo ""
echo "🔑 Настройка файла authorized_keys..."
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo "✅ Файл authorized_keys создан с правами 600"

echo ""
echo "📋 Текущее содержимое authorized_keys:"
if [ -s ~/.ssh/authorized_keys ]; then
    echo "Файл содержит $(wc -l < ~/.ssh/authorized_keys) строк(и)"
    echo "Первые 50 символов каждого ключа:"
    cut -c1-50 ~/.ssh/authorized_keys
else
    echo "Файл пустой - нужно добавить публичный ключ"
fi

echo ""
echo "⚠️  ВАЖНО: Теперь добавьте ваш публичный ключ в authorized_keys"
echo ""
echo "Выполните одну из команд:"
echo "1. Если у вас есть публичный ключ в файле:"
echo "   cat ваш_публичный_ключ.pub >> ~/.ssh/authorized_keys"
echo ""
echo "2. Или добавьте ключ вручную:"
echo "   nano ~/.ssh/authorized_keys"
echo "   # Вставьте строку вида: ssh-rsa AAAAB3NzaC... deploy@proexpert_land"
echo ""
echo "3. Или используйте команду echo:"
echo "   echo 'ваш_публичный_ключ' >> ~/.ssh/authorized_keys"

# Проверка и создание директории проекта
echo ""
echo "📂 Настройка директории проекта..."
if [ ! -d "/var/www/proexpert_land" ]; then
    echo "Создание директории /var/www/proexpert_land..."
    sudo mkdir -p /var/www/proexpert_land
    sudo chown $USER:$USER /var/www/proexpert_land
    echo "✅ Директория создана и права назначены пользователю $USER"
else
    echo "✅ Директория /var/www/proexpert_land уже существует"
    echo "Владелец: $(stat -c '%U:%G' /var/www/proexpert_land)"
fi

# Настройка sudo прав
echo ""
echo "🔐 Настройка sudo прав..."
echo "Добавьте в sudoers следующую строку:"
echo ""
echo "$USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx, /usr/bin/nginx -t, /bin/chown -R www-data:www-data *"
echo ""
echo "Для этого выполните:"
echo "sudo visudo"
echo ""
echo "И добавьте строку выше в конец файла"

echo ""
echo "✨ Настройка завершена!"
echo ""
echo "🧪 Для проверки используйте скрипт check_ssh.sh" 