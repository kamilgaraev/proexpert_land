# Система приглашений подрядчиков - Личный кабинет

## 🎯 Обзор

Полноценная реализация системы приглашений подрядчиков для личного кабинета. Включает все компоненты для работы с входящими приглашениями, их обработки и статистики.

## 📁 Структура файлов

```
src/
├── types/contractor-invitations.ts              # TypeScript типы
├── utils/contractorInvitationsApi.ts           # API утилиты
├── hooks/useContractorInvitations.ts           # React хуки
├── components/dashboard/contractor-invitations/
│   ├── ContractorInvitationsList.tsx           # Список приглашений
│   ├── ContractorInvitationDetails.tsx         # Детали приглашения
│   ├── ContractorInvitationsStats.tsx          # Статистика
│   ├── ContractorInvitationNotifications.tsx   # Уведомления
│   └── index.ts                                # Экспорты
└── pages/dashboard/contractor-invitations/
    ├── ContractorInvitationsPage.tsx           # Главная страница
    ├── ContractorInvitationTokenPage.tsx       # Страница по токену
    ├── index.ts                                # Экспорты
    └── README.md                               # Документация
```

## 🚀 Интеграция с роутингом

### 1. Добавьте роуты в ваш роутер:

```tsx
import { 
  ContractorInvitationsPage, 
  ContractorInvitationTokenPage 
} from '@pages/dashboard/contractor-invitations';

// В ваш роутер добавьте:
{
  path: '/dashboard/contractor-invitations',
  element: <ContractorInvitationsPage />
},
{
  path: '/dashboard/contractor-invitations/invitation/:token',
  element: <ContractorInvitationTokenPage />
}
```

### 2. Добавьте в навигацию личного кабинета:

```tsx
import { ContractorInvitationNotifications } from '@components/dashboard/contractor-invitations';

// В DashboardLayout или навигационную панель:
<nav>
  {/* ... другие элементы навигации ... */}
  
  <NavLink 
    to="/dashboard/contractor-invitations"
    className="nav-link"
  >
    <EnvelopeIcon className="w-5 h-5" />
    Приглашения
  </NavLink>
  
  {/* Компонент уведомлений в шапке */}
  <ContractorInvitationNotifications />
</nav>
```

## 🔧 API Endpoints

Система ожидает следующие API endpoints:

### Базовый URL: `https://api.1мост.рф/api/v1/landing`

- `GET /contractor-invitations` - Список входящих приглашений
- `GET /contractor-invitations/{token}` - Детали по токену
- `POST /contractor-invitations/{token}/accept` - Принять приглашение  
- `POST /contractor-invitations/{token}/decline` - Отклонить приглашение
- `GET /contractor-invitations/stats` - Статистика приглашений

## 📋 Используемые компоненты

### Основные компоненты:
- `ContractorInvitationsList` - Список с фильтрами и пагинацией
- `ContractorInvitationDetails` - Детальный просмотр и действия
- `ContractorInvitationsStats` - Статистика и аналитика
- `ContractorInvitationNotifications` - Уведомления в шапке

### Зависимости:
- `PageLoading` - компонент загрузки
- `ConfirmActionModal` - модалы подтверждения
- `NotificationService` - система уведомлений (опционально)

## 🎨 Стилизация

Компоненты используют существующую дизайн-систему:
- Цветовая палитра: `construction`, `safety`, `steel`, `concrete`
- Анимации: `framer-motion`
- Иконки: `@heroicons/react/24/outline`
- Утилиты: `Tailwind CSS`

## 🔒 Авторизация

Все API запросы автоматически включают JWT токен из localStorage/sessionStorage:
```tsx
Authorization: Bearer {token}
```

При ошибке 401 происходит автоматический редирект на `/login`.

## 📱 Мобильная адаптивность

Все компоненты полностью адаптивны:
- Сетки: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Отступы: `p-4 sm:p-6 lg:p-8`
- Размеры текста: `text-sm sm:text-base lg:text-lg`
- Кнопки: полная ширина на мобильных

## 🔔 Уведомления

### Встроенные уведомления:
- Бейдж с количеством новых приглашений
- Выделение срочных (истекающих) приглашений
- Дропдаун с превью приглашений

### Интеграция с NotificationService:
```tsx
import NotificationService from '@components/shared/NotificationService';

// Успешные действия
NotificationService.success('Приглашение принято!');

// Ошибки
NotificationService.error('Ошибка обработки приглашения');
```

## 📊 Метрики и аналитика

### Отслеживаемые события:
- Просмотр списка приглашений
- Переход к деталям приглашения
- Принятие/отклонение приглашений
- Использование фильтров

### Интеграция с аналитикой:
```tsx
// SEO tracking встроен в компоненты
data-seo-track="invitation_action"
data-seo-keyword="подрядчик сотрудничество"
```

## 🧪 Тестирование

### Unit тесты (рекомендуемые):
```bash
# Хуки
useContractorInvitations.test.ts
useInvitationActions.test.ts

# API утилиты  
contractorInvitationsApi.test.ts

# Компоненты
ContractorInvitationsList.test.tsx
ContractorInvitationDetails.test.tsx
```

### E2E сценарии:
1. Просмотр списка приглашений
2. Фильтрация по статусу
3. Переход к деталям приглашения
4. Принятие приглашения
5. Отклонение с причиной
6. Работа уведомлений

## 🔄 Обновления и синхронизация

### Автообновление данных:
- Список обновляется при смене фильтров
- Статистика кэшируется на 15 минут
- Уведомления проверяются каждые 30 секунд

### Optimistic updates:
- Принятие/отклонение отображается сразу
- При ошибке состояние откатывается
- Показываются лоадеры для всех действий

## 🐛 Обработка ошибок

### Типы ошибок:
- 404 - Приглашение не найдено
- 410 - Приглашение истекло  
- 403 - Уже обработано
- 401 - Требуется авторизация
- 500 - Серверная ошибка

### UI для ошибок:
- Красивые страницы ошибок
- Кнопки повторного запроса
- Информативные сообщения
- Альтернативные действия

## 📝 Требования к бэкенду

### Формат ответов:
```json
{
  "success": true,
  "data": { /* данные */ },
  "message": "Опциональное сообщение"
}
```

### Пагинация:
```json
{
  "data": [ /* элементы */ ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 67,
    "has_more_pages": true
  }
}
```

### Фильтрация:
- URL параметры: `?status=pending&date_from=2024-01-01`
- Сортировка: `?sort_by=created_at&order=desc`
- Поиск: `?search=название_компании`

---

## 🎉 Готово к использованию!

Система полностью реализована и готова к интеграции. Все компоненты следуют лучшим практикам React/TypeScript и включают:

✅ Полная типизация TypeScript  
✅ Мобильная адаптивность  
✅ Обработка ошибок  
✅ Анимации и переходы  
✅ SEO оптимизация  
✅ Accessibility поддержка  
✅ Производительность и кэширование  

Для вопросов и поддержки обращайтесь к документации API или команде разработки.