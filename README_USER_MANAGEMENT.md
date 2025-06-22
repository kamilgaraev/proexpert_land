# Система Управления Пользователями - Интеграция

## Обзор

Интегрирована современная система управления пользователями с API на основе документации `api_user_management_system.md`.

## Реализованные компоненты

### 1. Хук useUserManagement (`src/hooks/useUserManagement.ts`)
- Интеграция с API системы управления пользователями
- Управление состоянием: пользователи, роли, приглашения, лимиты
- Функции: создание ролей, отправка приглашений, обновление ролей пользователей

### 2. API сервис (`src/utils/api.ts`)
- Добавлен `userManagementService` с полной поддержкой API
- Методы для работы с ролями, приглашениями, пользователями и лимитами

### 3. Компоненты интерфейса

#### UserManagementPage (`src/pages/dashboard/UserManagementPage.tsx`)
- Главная страница управления пользователями
- Табы: Пользователи, Приглашения, Роли
- Отображение лимитов подписки
- Уведомления о предупреждениях

#### UsersList (`src/components/dashboard/users/UsersList.tsx`)
- Список пользователей организации
- Отображение ролей и статусов
- Функционал редактирования (готов к подключению)

#### InvitationsList (`src/components/dashboard/users/InvitationsList.tsx`)
- Список отправленных приглашений
- Статусы приглашений (ожидает, принято, просрочено)
- Функции повторной отправки и отмены

#### RolesList (`src/components/dashboard/users/RolesList.tsx`)
- Отображение ролей в виде карточек
- Системные и пользовательские роли
- Показ разрешений и количества пользователей

#### Модальные окна
- `UserEditModal` - редактирование ролей пользователя
- `InviteUserModal` - приглашение новых пользователей

## Особенности реализации

### Современный UI/UX
- Адаптивный дизайн
- Анимации загрузки
- Цветовое кодирование статусов
- Интуитивные индикаторы прогресса

### Безопасность и права доступа
- Проверка лимитов подписки
- Валидация форм
- Обработка ошибок API

### Архитектура
- Разделение логики и представления
- Переиспользуемые компоненты
- Типизация TypeScript

## Использование

```typescript
// Подключение страницы в роутинге
import UserManagementPage from './pages/dashboard/UserManagementPage';

// Использование хука в компонентах
const { users, roles, sendInvitation } = useUserManagement();

// Отправка приглашения
await sendInvitation({
  email: 'user@example.com',
  name: 'Иван Петров',
  role_slugs: ['organization_admin'],
  metadata: { welcome_message: 'Добро пожаловать!' }
});
```

## API интеграция

Система полностью интегрирована с API эндпоинтами:
- `/api/v1/landing/user-management/roles`
- `/api/v1/landing/user-management/invitations`
- `/api/v1/landing/user-management/organization-users`
- `/api/v1/landing/user-management/user-limits`

## Следующие шаги

1. Добавление маршрутов в основное приложение
2. Подключение уведомлений (Toast/Snackbar)
3. Тестирование интеграции с бэкендом
4. Добавление конструктора ролей
5. Реализация аудита действий пользователей

## Файлы для добавления в роутинг

Добавить в основной роутинг приложения:
```typescript
{
  path: '/dashboard/users',
  component: UserManagementPage,
  meta: { requiresAuth: true, permissions: ['users.view'] }
}
``` 