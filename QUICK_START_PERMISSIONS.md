# 🚀 Система авторизации МОСТ - Руководство для фронтенда

## 🏗️ Обзор новой системы авторизации

### **Что изменилось?**
Мы полностью переписали систему авторизации с нуля, заменив старую модель ролей на современную **гибридную RBAC + ABAC систему** с поддержкой:

- ✅ **JSON-роли** - системные роли хранятся в файлах (как модули)
- ✅ **Кастомные роли** - владельцы организаций могут создавать свои роли
- ✅ **Контекстная авторизация** - права работают в контексте (организация → проект)  
- ✅ **Модульные права** - права активны только если модуль включен
- ✅ **Мультиинтерфейсность** - разные права для ЛК, Админки, Мобилки
- ✅ **Условная авторизация** - права с условиями (время, бюджет, и т.д.)

### **Архитектура системы:**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ПОЛЬЗОВАТЕЛЬ  │────│  НАЗНАЧЕНИЕ РОЛИ │────│     КОНТЕКСТ    │
│                 │    │                  │    │                 │
│ • ID            │    │ • user_id        │    │ • Организация   │
│ • Профиль       │    │ • role_slug      │    │ • Проект        │
│ • Токен         │    │ • context_id     │    │ • Система       │
└─────────────────┘    │ • is_active      │    └─────────────────┘
                       │ • expires_at     │              │
                       └──────────────────┘              │
                                │                        │
                                ▼                        │
                       ┌──────────────────┐              │
                       │      РОЛЬ        │◄─────────────┘
                       │                  │
                       │ JSON роли:       │    ┌─────────────────┐
                       │ • Системные      │────│     ПРАВА       │
                       │ • Предустановлен.│    │                 │
                       │                  │    │ • Системные     │
                       │ DB роли:         │    │ • Модульные     │
                       │ • Кастомные      │    │ • Условные      │
                       │ • Организационн. │    └─────────────────┘
                       └──────────────────┘              │
                                                         ▼
                                                ┌─────────────────┐
                                                │     МОДУЛИ      │
                                                │                 │
                                                │ • Активные      │
                                                │ • Отключенные   │
                                                │ • Права модуля  │
                                                └─────────────────┘
```

---

## 🎭 Система ролей и контекстов

### **Типы ролей:**

#### **1. Системные роли (JSON файлы в `config/RoleDefinitions/`)**
```json
{
  "slug": "organization_owner",
  "context": "organization", 
  "interface": "lk",
  "system_permissions": ["billing.manage", "users.manage"],
  "module_permissions": {
    "projects": ["projects.*"],
    "materials": ["materials.view", "materials.edit"]
  }
}
```

#### **2. Кастомные роли (база данных)**
- Создаются владельцами организаций через UI
- Хранятся в таблице `organization_custom_roles`
- Наследуют ограничения от системных ролей

### **Контексты авторизации:**
- 🏢 **Система** - глобальные права (super_admin)
- 🏢 **Организация** - права в рамках организации  
- 📋 **Проект** - права в рамках конкретного проекта

### **Интерфейсы доступа:**
- 💼 **LK (Landing)** - личный кабинет владельцев/админов
- ⚙️ **Admin** - админ панель для работников  
- 📱 **Mobile** - мобильное приложение для прорабов

---

## 🔐 Как работают права

### **Алгоритм проверки прав:**

1. **Получить пользователя** и его активные назначения ролей
2. **Определить контекст** (автоматически из middleware или явно)
3. **Собрать все роли** пользователя в этом контексте
4. **Загрузить определения ролей** (JSON + кастомные)
5. **Собрать системные права** из всех ролей
6. **Проверить модульные права** (только для активных модулей)
7. **Применить условия** (время, бюджет, и т.д.)
8. **Вернуть результат** ✅/❌

### **Пример проверки права `projects.edit`:**

```php
// 1. Пользователь: ID=12, organization_id=5
// 2. Роли: ["organization_owner"] в контексте организации #5
// 3. JSON роль organization_owner содержит: "projects": ["projects.*"]
// 4. Модуль "projects" активен в организации #5 ✅
// 5. Условий нет ✅
// 6. Результат: РАЗРЕШЕНО ✅
```

---

## 📊 Основные роли системы

### **🏢 Организационные роли:**

| Роль | Slug | Интерфейс | Основные права |
|------|------|-----------|----------------|
| **Владелец организации** | `organization_owner` | LK + Admin | Все права + биллинг + управление пользователями |
| **Администратор** | `organization_admin` | LK + Admin | Управление без биллинга |
| **Бухгалтер** | `accountant` | LK | Финансы + отчеты |
| **Наблюдатель** | `viewer` | LK | Только просмотр |

### **📋 Проектные роли:**

| Роль | Slug | Интерфейс | Основные права |
|------|------|-----------|----------------|
| **Менеджер проекта** | `project_manager` | Admin | Управление проектом |
| **Прораб** | `foreman` | Mobile + Admin | Исполнение работ |
| **Работник** | `worker` | Mobile | Выполнение задач |
| **Подрядчик** | `contractor` | Portal | Работа по договору |

### **⚙️ Системные роли:**

| Роль | Slug | Интерфейс | Основные права |
|------|------|-----------|----------------|
| **Супер админ** | `super_admin` | Все | Все системные права |
| **Системный админ** | `system_admin` | Admin | Техническое управление |
| **Поддержка** | `support` | Admin | Помощь пользователям |

---

## 🎯 Права системы

### **🔧 Системные права:**
```javascript
'billing.manage'           // Управление подписками и платежами
'billing.view'            // Просмотр биллинга
'users.manage'            // Управление обычными пользователями  
'users.manage_admin'      // Управление администраторами
'users.invite'            // Приглашение пользователей
'organization.manage'     // Управление настройками организации
'organization.view'       // Просмотр организации
'modules.manage'          // Включение/отключение модулей
'modules.billing'         // Просмотр статистики модулей
'multi_organization.manage' // Управление дочерними организациями
'roles.create_custom'     // Создание кастомных ролей
'roles.manage_custom'     // Управление кастомными ролями
'admin.access'           // Доступ к админ панели
'profile.view'           // Просмотр своего профиля
'profile.edit'           // Редактирование профиля
```

### **📦 Модульные права:**
```javascript
// Проекты
'projects.view'           // Просмотр проектов
'projects.create'         // Создание проектов  
'projects.edit'           // Редактирование проектов
'projects.delete'         // Удаление проектов
'projects.*'             // Все права по проектам

// Материалы  
'materials.view'          // Просмотр материалов
'materials.create'        // Создание материалов
'materials.edit'          // Редактирование материалов
'materials.manage_costs'  // Управление стоимостью

// Отчеты
'reports.view'           // Просмотр отчетов
'reports.create'         // Создание отчетов
'reports.export'         // Экспорт отчетов

// Финансы
'finance.view'           // Просмотр финансов
'finance.manage'         // Управление финансами
'finance.approve_payments' // Подтверждение платежей

// Персонал
'personnel.view'         // Просмотр сотрудников  
'personnel.manage'       // Управление персоналом
'personnel.assign_tasks' // Назначение задач
```

---

## ⚡ Быстрый старт для фронтенда

## 1️⃣ Получить права пользователя

### **Запрос:**
```javascript
// Для ЛК/Landing
GET /api/landing/v1/permissions

// Для Admin Panel  
GET /api/admin/v1/permissions

// Для Mobile App
GET /api/mobile/v1/permissions

// Headers:
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

### **Ответ:**
```json
{
  "success": true,
  "data": {
    "user_id": 12,
    "organization_id": 5,
    
    "permissions_flat": [
      "billing.manage",
      "modules.manage", 
      "users.manage",
      "projects.view",
      "projects.edit"
    ],
    
    "roles": ["organization_owner"],
    "interfaces": ["lk", "admin"],
    "active_modules": ["projects", "materials"]
  }
}
```

---

## 2️⃣ JavaScript функции для проверки

```javascript
class PermissionsManager {
  constructor() {
    this.permissions = []
    this.roles = []
    this.interfaces = []
    this.activeModules = []
  }

  // Загрузить права с сервера
  async load() {
    try {
      const response = await fetch('/api/landing/v1/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.permissions = data.data.permissions_flat || []
        this.roles = data.data.roles || []
        this.interfaces = data.data.interfaces || []
        this.activeModules = data.data.active_modules || []
        
        console.log('✅ Права загружены:', this.permissions)
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки прав:', error)
    }
  }

  // Проверить право
  can(permission) {
    return this.permissions.includes(permission)
  }

  // Проверить роль
  hasRole(role) {
    return this.roles.includes(role)
  }

  // Проверить модуль
  hasModule(module) {
    return this.activeModules.includes(module)
  }

  // Проверить интерфейс
  canAccessInterface(interfaceName) {
    return this.interfaces.includes(interfaceName)
  }

  // Комплексная проверка
  canAccess(options = {}) {
    const { permission, role, module, interface: interfaceName } = options
    
    if (permission && !this.can(permission)) return false
    if (role && !this.hasRole(role)) return false
    if (module && !this.hasModule(module)) return false
    if (interfaceName && !this.canAccessInterface(interfaceName)) return false
    
    return true
  }
}

// Глобальный экземпляр
const permissions = new PermissionsManager()

// Загрузить при старте
permissions.load()
```

---

## 3️⃣ Скрытие элементов DOM

```html
<!-- 1. Простая проверка права -->
<button id="billing-btn" style="display:none">
  Управление биллингом
</button>

<!-- 2. Кнопка для владельцев -->
<div id="admin-panel" style="display:none">
  Админ панель
</div>

<!-- 3. Модульные функции -->
<section id="projects-section" style="display:none">
  Управление проектами
</section>

<script>
// Показать элементы после загрузки прав
async function showAllowedElements() {
  await permissions.load()
  
  // Показать кнопку биллинга
  if (permissions.can('billing.manage')) {
    document.getElementById('billing-btn').style.display = 'block'
  }
  
  // Показать админ панель
  if (permissions.hasRole('organization_owner')) {
    document.getElementById('admin-panel').style.display = 'block'
  }
  
  // Показать раздел проектов
  if (permissions.hasModule('projects') && permissions.can('projects.view')) {
    document.getElementById('projects-section').style.display = 'block'
  }
}

// Вызвать при загрузке страницы
document.addEventListener('DOMContentLoaded', showAllowedElements)
</script>
```

---

## 4️⃣ Универсальная функция показа

```javascript
// Универсальная функция показа элементов по правам
function showIfAllowed(selector, options) {
  const element = document.querySelector(selector)
  if (!element) return
  
  const allowed = permissions.canAccess(options)
  element.style.display = allowed ? 'block' : 'none'
  
  // Опционально: добавить класс для стилизации
  if (allowed) {
    element.classList.add('permissions-allowed')
    element.classList.remove('permissions-denied')
  } else {
    element.classList.add('permissions-denied')  
    element.classList.remove('permissions-allowed')
  }
}

// Примеры использования:
showIfAllowed('#billing-section', { permission: 'billing.manage' })
showIfAllowed('#user-management', { role: 'organization_admin' })
showIfAllowed('#projects', { module: 'projects', permission: 'projects.view' })

// Массовое применение
const elementsToCheck = [
  { selector: '#billing-btn', options: { permission: 'billing.manage' } },
  { selector: '#users-btn', options: { permission: 'users.manage' } },
  { selector: '#projects-btn', options: { module: 'projects' } },
  { selector: '#admin-menu', options: { role: 'organization_owner' } }
]

elementsToCheck.forEach(({ selector, options }) => {
  showIfAllowed(selector, options)
})
```

---

## 5️⃣ CSS для состояний

```css
/* Скрытые элементы */
.permissions-denied {
  display: none !important;
}

/* Разрешенные элементы */
.permissions-allowed {
  display: block;
}

/* Заблокированные (полупрозрачные) */
.permissions-disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

/* Индикатор загрузки прав */
.permissions-loading::after {
  content: "🔄";
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 6️⃣ Проверка конкретного права

```javascript
// Проверить право через API (медленно, но актуально)
async function checkPermission(permission, context = null) {
  try {
    const response = await fetch('/api/landing/v1/permissions/check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permission,
        context,
        interface: 'lk'
      })
    })
    
    const data = await response.json()
    return data.success ? data.data.has_permission : false
  } catch (error) {
    console.error('Ошибка проверки права:', error)
    return false
  }
}

// Использование
const canManageBilling = await checkPermission('billing.manage')
const canEditProject = await checkPermission('projects.edit', { project_id: 123 })
```

---

## 7️⃣ Автообновление прав

```javascript
// Автообновление каждые 5 минут
setInterval(() => {
  permissions.load()
  console.log('🔄 Права обновлены')
}, 5 * 60 * 1000)

// Обновление при смене организации
function onOrganizationChanged() {
  permissions.load().then(() => {
    // Перепроверить все элементы
    showAllowedElements()
  })
}

// Обновление при входе/выходе
function onLogin() {
  permissions.load()
}

function onLogout() {
  permissions.permissions = []
  permissions.roles = []
  permissions.interfaces = []
  permissions.activeModules = []
  
  // Скрыть все защищенные элементы
  document.querySelectorAll('.permissions-allowed').forEach(el => {
    el.style.display = 'none'
  })
}
```

---

## 8️⃣ Отладка

```javascript
// Функции для отладки (только в dev режиме)
if (window.location.hostname === 'localhost') {
  window.DEBUG_PERMISSIONS = {
    // Показать все права
    show: () => console.table(permissions.permissions),
    
    // Проверить право
    can: (permission) => {
      const result = permissions.can(permission)
      console.log(`🔒 ${permission}: ${result ? '✅ РАЗРЕШЕНО' : '❌ ЗАПРЕЩЕНО'}`)
      return result
    },
    
    // Показать роли
    roles: () => {
      console.log('👤 Роли:', permissions.roles)
      return permissions.roles
    },
    
    // Показать модули
    modules: () => {
      console.log('📦 Модули:', permissions.activeModules)
      return permissions.activeModules
    },
    
    // Принудительно перезагрузить
    reload: () => permissions.load()
  }
  
  console.log('🔧 Отладка прав:', 'DEBUG_PERMISSIONS')
}
```

---

## ✅ Чеклист внедрения

- [ ] Загрузить права при входе в систему
- [ ] Проверить права перед показом элементов  
- [ ] Добавить автообновление прав
- [ ] Скрыть элементы для неавторизованных действий
- [ ] Добавить индикаторы загрузки
- [ ] Протестировать на разных ролях
- [ ] Добавить обработку ошибок
- [ ] Оптимизировать производительность

## 🎯 Основные права в системе

```javascript
// Системные права
'billing.manage'         // Управление биллингом
'users.manage'          // Управление пользователями  
'users.manage_admin'    // Управление админами
'organization.manage'   // Управление организацией
'modules.manage'        // Управление модулями
'modules.billing'       // Просмотр биллинга модулей

// Модульные права  
'projects.view'         // Просмотр проектов
'projects.edit'         // Редактирование проектов
'materials.view'        // Просмотр материалов
'materials.edit'        // Редактирование материалов
'reports.view'          // Просмотр отчетов
'finance.view'          // Просмотр финансов

// Роли
'organization_owner'    // Владелец организации
'organization_admin'    // Администратор организации  
'accountant'           // Бухгалтер
'foreman'             // Прораб
'worker'              // Работник

// Интерфейсы
'lk'                  // Личный кабинет
'admin'               // Админ панель
'mobile'              // Мобильное приложение
```

🎉 **Готово к использованию!**
