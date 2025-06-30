# Продуманная система создания пользователей для дочерних организаций

## Обзор нововведений

Новая система создания пользователей для дочерних организаций включает:

- ✅ **Автоматическое создание персональных ролей** вместо выбора из существующих
- ✅ **Шаблоны ролей** для быстрого создания стандартных позиций
- ✅ **Гибкая настройка прав доступа** для каждого пользователя
- ✅ **Массовое создание пользователей** с разными ролями
- ✅ **Визуальная настройка ролей** с цветовым кодированием
- ✅ **Автоматическая отправка приглашений** новым пользователям

---

## Получение шаблонов ролей

### Доступные шаблоны ролей

```http
GET /api/v1/landing/multi-organization/role-templates
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "templates": {
      "administrator": {
        "name": "Администратор организации",
        "description": "Полные права в рамках организации",
        "permissions": [
          "users.view", "users.create", "users.edit", "users.delete",
          "roles.view", "roles.create", "roles.edit", "roles.delete",
          "projects.view", "projects.create", "projects.edit", "projects.delete",
          "contracts.view", "contracts.create", "contracts.edit", "contracts.delete",
          "materials.view", "materials.create", "materials.edit", "materials.delete",
          "reports.view", "reports.create", "reports.export",
          "finance.view", "finance.edit"
        ],
        "color": "#DC2626"
      },
      "project_manager": {
        "name": "Менеджер проектов",
        "description": "Управление проектами и командой",
        "permissions": [
          "users.view", "users.create", "users.edit",
          "projects.view", "projects.create", "projects.edit",
          "contracts.view", "contracts.create", "contracts.edit",
          "materials.view", "materials.create", "materials.edit",
          "reports.view", "reports.create"
        ],
        "color": "#2563EB"
      },
      "foreman": {
        "name": "Прораб",
        "description": "Управление строительными работами",
        "permissions": [
          "projects.view", "projects.edit",
          "materials.view", "materials.create", "materials.edit",
          "work_types.view", "work_types.create", "work_types.edit",
          "completed_work.view", "completed_work.create", "completed_work.edit",
          "reports.view"
        ],
        "color": "#059669"
      },
      "accountant": {
        "name": "Бухгалтер",
        "description": "Финансовый учет и отчетность",
        "permissions": [
          "contracts.view", "contracts.edit",
          "finance.view", "finance.edit",
          "reports.view", "reports.create", "reports.export",
          "materials.view", "projects.view"
        ],
        "color": "#7C3AED"
      },
      "sales_manager": {
        "name": "Менеджер продаж",
        "description": "Работа с клиентами и сделками",
        "permissions": [
          "projects.view", "projects.create", "projects.edit",
          "contracts.view", "contracts.create", "contracts.edit",
          "clients.view", "clients.create", "clients.edit",
          "reports.view"
        ],
        "color": "#EA580C"
      },
      "worker": {
        "name": "Рабочий",
        "description": "Выполнение работ и заполнение отчетов",
        "permissions": [
          "projects.view",
          "materials.view",
          "work_types.view",
          "completed_work.view", "completed_work.create",
          "time_tracking.create", "time_tracking.edit"
        ],
        "color": "#6B7280"
      },
      "observer": {
        "name": "Наблюдатель",
        "description": "Только просмотр данных",
        "permissions": [
          "projects.view", "contracts.view",
          "materials.view", "reports.view"
        ],
        "color": "#9CA3AF"
      }
    },
    "permissions_groups": {
      "Пользователи": {
        "users.view": "Просмотр пользователей",
        "users.create": "Создание пользователей",
        "users.edit": "Редактирование пользователей",
        "users.delete": "Удаление пользователей"
      },
      "Проекты": {
        "projects.view": "Просмотр проектов",
        "projects.create": "Создание проектов",
        "projects.edit": "Редактирование проектов",
        "projects.delete": "Удаление проектов"
      }
    }
  }
}
```

---

## Создание пользователя с персональной ролью

### 1. Создание пользователя на основе шаблона роли

```http
POST /api/v1/landing/multi-organization/child-organizations/{childOrgId}/users
```

**Тело запроса (с шаблоном):**
```json
{
  "name": "Иван Петров",
  "email": "ivan.petrov@stroitel.ru",
  "password": "securePassword123",
  "auto_verify": true,
  "send_invitation": true,
  "role_data": {
    "template": "project_manager",
    "name": "Старший менеджер проектов",
    "description": "Руководитель отдела проектного управления",
    "color": "#1E40AF"
  }
}
```

**Валидация:**
- `name` - required|string|max:255
- `email` - required|email|max:255
- `password` - sometimes|string|min:8 (если не указан, генерируется автоматически)
- `auto_verify` - sometimes|boolean (автоматически верифицировать email)
- `send_invitation` - sometimes|boolean (отправить приглашение на email)
- `role_data.template` - sometimes|string|in:administrator,project_manager,foreman,accountant,sales_manager,worker,observer
- `role_data.name` - required_without:role_data.template|string|max:255
- `role_data.description` - sometimes|string|max:1000
- `role_data.permissions` - required_without:role_data.template|array
- `role_data.color` - sometimes|string|regex:/^#[0-9A-Fa-f]{6}$/

**Ответ:**
```json
{
  "success": true,
  "message": "Пользователь добавлен в дочернюю организацию с персональной ролью",
  "data": {
    "user": {
      "id": 25,
      "name": "Иван Петров",
      "email": "ivan.petrov@stroitel.ru",
      "role_id": 15,
      "role_name": "Старший менеджер проектов",
      "role_color": "#1E40AF",
      "permissions": [
        "users.view", "users.create", "users.edit",
        "projects.view", "projects.create", "projects.edit",
        "contracts.view", "contracts.create", "contracts.edit",
        "materials.view", "materials.create", "materials.edit",
        "reports.view", "reports.create"
      ],
      "is_active": true,
      "created_at": "2024-01-20T15:30:00Z"
    },
    "role": {
      "id": 15,
      "name": "Старший менеджер проектов",
      "slug": "starshiy-menedzher-proektov",
      "description": "Руководитель отдела проектного управления",
      "color": "#1E40AF",
      "permissions": [
        "users.view", "users.create", "users.edit",
        "projects.view", "projects.create", "projects.edit",
        "contracts.view", "contracts.create", "contracts.edit",
        "materials.view", "materials.create", "materials.edit",
        "reports.view", "reports.create"
      ],
      "permissions_count": 12,
      "is_system": false,
      "created_at": "2024-01-20T15:30:00Z"
    }
  }
}
```

### 2. Создание пользователя с кастомной ролью

```http
POST /api/v1/landing/multi-organization/child-organizations/{childOrgId}/users
```

**Тело запроса (кастомная роль):**
```json
{
  "name": "Анна Смирнова",
  "email": "anna.smirnova@stroitel.ru",
  "auto_verify": true,
  "send_invitation": true,
  "role_data": {
    "name": "Специалист по снабжению",
    "description": "Закупка материалов и работа с поставщиками",
    "color": "#F59E0B",
    "permissions": [
      "materials.view",
      "materials.create",
      "materials.edit",
      "contracts.view",
      "contracts.create",
      "projects.view",
      "reports.view"
    ]
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Пользователь добавлен в дочернюю организацию с персональной ролью",
  "data": {
    "user": {
      "id": 26,
      "name": "Анна Смирнова",
      "email": "anna.smirnova@stroitel.ru",
      "role_id": 16,
      "role_name": "Специалист по снабжению",
      "role_color": "#F59E0B",
      "permissions": [
        "materials.view", "materials.create", "materials.edit",
        "contracts.view", "contracts.create",
        "projects.view", "reports.view"
      ],
      "is_active": true,
      "created_at": "2024-01-20T15:35:00Z"
    },
    "role": {
      "id": 16,
      "name": "Специалист по снабжению",
      "slug": "specialist-po-snabzheniyu",
      "description": "Закупка материалов и работа с поставщиками",
      "color": "#F59E0B",
      "permissions": [
        "materials.view", "materials.create", "materials.edit",
        "contracts.view", "contracts.create",
        "projects.view", "reports.view"
      ],
      "permissions_count": 7,
      "is_system": false,
      "created_at": "2024-01-20T15:35:00Z"
    }
  }
}
```

---

## Массовое создание пользователей

### Создание нескольких пользователей одновременно

```http
POST /api/v1/landing/multi-organization/child-organizations/{childOrgId}/users/bulk
```

**Тело запроса:**
```json
{
  "users": [
    {
      "name": "Сергей Иванов",
      "email": "sergey.ivanov@stroitel.ru",
      "auto_verify": true,
      "send_invitation": true,
      "role_data": {
        "template": "foreman",
        "name": "Прораб участка №1"
      }
    },
    {
      "name": "Мария Кузнецова",
      "email": "maria.kuznetsova@stroitel.ru",
      "auto_verify": true,
      "send_invitation": true,
      "role_data": {
        "template": "accountant"
      }
    },
    {
      "name": "Алексей Волков",
      "email": "alexey.volkov@stroitel.ru",
      "auto_verify": true,
      "send_invitation": true,
      "role_data": {
        "name": "Инженер-техник",
        "description": "Техническое сопровождение проектов",
        "color": "#10B981",
        "permissions": [
          "projects.view", "projects.edit",
          "materials.view",
          "work_types.view", "work_types.edit",
          "completed_work.view", "completed_work.create",
          "reports.view"
        ]
      }
    }
  ]
}
```

**Валидация:**
- `users` - required|array|min:1|max:20
- `users.*.name` - required|string|max:255
- `users.*.email` - required|email|max:255
- `users.*.password` - sometimes|string|min:8
- `users.*.auto_verify` - sometimes|boolean
- `users.*.send_invitation` - sometimes|boolean
- `users.*.role_data` - required|array
- `users.*.role_data.template` - sometimes|string|in:administrator,project_manager,foreman,accountant,sales_manager,worker,observer
- `users.*.role_data.name` - required_without:users.*.role_data.template|string|max:255
- `users.*.role_data.permissions` - required_without:users.*.role_data.template|array

**Ответ:**
```json
{
  "success": true,
  "message": "Обработано пользователей: 3, успешно: 3, ошибок: 0",
  "data": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "success": true,
        "user": {
          "id": 27,
          "name": "Сергей Иванов",
          "email": "sergey.ivanov@stroitel.ru",
          "role_id": 17,
          "role_name": "Прораб участка №1",
          "role_color": "#059669",
          "permissions": ["projects.view", "projects.edit", "materials.view", "materials.create", "materials.edit", "work_types.view", "work_types.create", "work_types.edit", "completed_work.view", "completed_work.create", "completed_work.edit", "reports.view"],
          "is_active": true,
          "created_at": "2024-01-20T15:40:00Z"
        },
        "role": {
          "id": 17,
          "name": "Прораб участка №1",
          "slug": "prorab-uchastka-1",
          "description": "Управление строительными работами",
          "color": "#059669",
          "permissions": ["projects.view", "projects.edit", "materials.view", "materials.create", "materials.edit", "work_types.view", "work_types.create", "work_types.edit", "completed_work.view", "completed_work.create", "completed_work.edit", "reports.view"],
          "permissions_count": 12,
          "is_system": false,
          "created_at": "2024-01-20T15:40:00Z"
        }
      },
      {
        "success": true,
        "user": {
          "id": 28,
          "name": "Мария Кузнецова",
          "email": "maria.kuznetsova@stroitel.ru",
          "role_id": 18,
          "role_name": "Бухгалтер",
          "role_color": "#7C3AED",
          "permissions": ["contracts.view", "contracts.edit", "finance.view", "finance.edit", "reports.view", "reports.create", "reports.export", "materials.view", "projects.view"],
          "is_active": true,
          "created_at": "2024-01-20T15:40:00Z"
        },
        "role": {
          "id": 18,
          "name": "Бухгалтер",
          "slug": "buhgalter",
          "description": "Финансовый учет и отчетность",
          "color": "#7C3AED",
          "permissions": ["contracts.view", "contracts.edit", "finance.view", "finance.edit", "reports.view", "reports.create", "reports.export", "materials.view", "projects.view"],
          "permissions_count": 9,
          "is_system": false,
          "created_at": "2024-01-20T15:40:00Z"
        }
      },
      {
        "success": true,
        "user": {
          "id": 29,
          "name": "Алексей Волков",
          "email": "alexey.volkov@stroitel.ru",
          "role_id": 19,
          "role_name": "Инженер-техник",
          "role_color": "#10B981",
          "permissions": ["projects.view", "projects.edit", "materials.view", "work_types.view", "work_types.edit", "completed_work.view", "completed_work.create", "reports.view"],
          "is_active": true,
          "created_at": "2024-01-20T15:40:00Z"
        },
        "role": {
          "id": 19,
          "name": "Инженер-техник",
          "slug": "inzhener-tehnik",
          "description": "Техническое сопровождение проектов",
          "color": "#10B981",
          "permissions": ["projects.view", "projects.edit", "materials.view", "work_types.view", "work_types.edit", "completed_work.view", "completed_work.create", "reports.view"],
          "permissions_count": 8,
          "is_system": false,
          "created_at": "2024-01-20T15:40:00Z"
        }
      }
    ]
  }
}
```

---

## Просмотр ролей дочерней организации

### Список всех ролей в дочерней организации

```http
GET /api/v1/landing/multi-organization/child-organizations/{childOrgId}/roles
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "Старший менеджер проектов",
      "slug": "starshiy-menedzher-proektov",
      "description": "Руководитель отдела проектного управления",
      "color": "#1E40AF",
      "permissions": [
        "users.view", "users.create", "users.edit",
        "projects.view", "projects.create", "projects.edit",
        "contracts.view", "contracts.create", "contracts.edit",
        "materials.view", "materials.create", "materials.edit",
        "reports.view", "reports.create"
      ],
      "permissions_count": 12,
      "users_count": 1,
      "is_system": false,
      "is_active": true,
      "created_at": "2024-01-20T15:30:00Z"
    },
    {
      "id": 16,
      "name": "Специалист по снабжению",
      "slug": "specialist-po-snabzheniyu",
      "description": "Закупка материалов и работа с поставщиками",
      "color": "#F59E0B",
      "permissions": [
        "materials.view", "materials.create", "materials.edit",
        "contracts.view", "contracts.create",
        "projects.view", "reports.view"
      ],
      "permissions_count": 7,
      "users_count": 1,
      "is_system": false,
      "is_active": true,
      "created_at": "2024-01-20T15:35:00Z"
    }
  ]
}
```

---

## Преимущества новой системы

### ✅ Для администраторов:
- **Полный контроль** над правами каждого пользователя
- **Готовые шаблоны** для быстрого создания стандартных ролей
- **Визуальная идентификация** ролей через цветовое кодирование
- **Массовые операции** для создания команд

### ✅ Для пользователей:
- **Персональные роли** точно соответствуют обязанностям
- **Понятные названия** ролей и разрешений
- **Автоматические приглашения** с инструкциями

### ✅ Для системы:
- **Масштабируемость** - каждая организация имеет свои роли
- **Безопасность** - точечное назначение прав
- **Аудит** - полная история создания и изменения ролей

---

## Примеры использования

### Создание команды для нового проекта:

```javascript
const createProjectTeam = async (childOrgId) => {
  const teamMembers = [
    {
      name: "Петр Сидоров",
      email: "petr.sidorov@stroitel.ru",
      role_data: { template: "project_manager", name: "Руководитель проекта" }
    },
    {
      name: "Елена Волкова", 
      email: "elena.volkova@stroitel.ru",
      role_data: { template: "foreman", name: "Прораб стройплощадки" }
    },
    {
      name: "Дмитрий Козлов",
      email: "dmitriy.kozlov@stroitel.ru", 
      role_data: { template: "accountant", name: "Финансист проекта" }
    }
  ];

  const response = await fetch(
    `/api/v1/landing/multi-organization/child-organizations/${childOrgId}/users/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: teamMembers })
    }
  );

  return response.json();
};
```

### Создание специализированной роли:

```javascript
const createSpecializedRole = async (childOrgId) => {
  const userData = {
    name: "Игорь Тестов",
    email: "igor.testov@stroitel.ru",
    auto_verify: true,
    send_invitation: true,
    role_data: {
      name: "QA Инженер",
      description: "Контроль качества строительных работ",
      color: "#8B5CF6",
      permissions: [
        "projects.view",
        "completed_work.view",
        "completed_work.edit", 
        "materials.view",
        "reports.view",
        "reports.create"
      ]
    }
  };

  const response = await fetch(
    `/api/v1/landing/multi-organization/child-organizations/${childOrgId}/users`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }
  );

  return response.json();
};
```

Теперь создание пользователей для дочерних организаций стало гораздо более продуманным и гибким! 