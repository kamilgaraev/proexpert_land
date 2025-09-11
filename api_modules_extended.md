# API Модулей Организации - Расширенная версия

## Обзор

Система модулей позволяет организациям подключать дополнительные функции платформы на платной основе. Данная документация описывает расширенный набор API эндпоинтов для управления модулями.

**Базовый URL:** `/api/v1/landing/modules/`

**Авторизация:** Bearer Token (JWT)

---

## 1. Получить все доступные модули

```http
GET /api/v1/landing/modules/available
```

**Описание:** Получает каталог всех доступных модулей без привязки к организации.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "analytics": [
      {
        "id": 1,
        "name": "Базовые отчеты",
        "slug": "basic_reports",
        "description": "Стандартные отчеты по проектам и материалам",
        "price": 0,
        "currency": "RUB",
        "features": ["Отчет по материалам", "Отчет по проектам", "Экспорт в PDF"],
        "permissions": ["reports.basic", "reports.export_pdf"],
        "category": "analytics",
        "icon": "document-text",
        "is_premium": false
      }
    ],
    "integrations": [...],
    "automation": [...]
  }
}
```

---

## 2. Получить активированные модули организации

```http
GET /api/v1/landing/modules
```

**Описание:** Получает все активированные модули текущей организации с информацией о статусе и сроках действия.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "organization_id": 1,
      "module": {
        "id": 1,
        "name": "Базовые отчеты",
        "slug": "basic_reports",
        "price": 0,
        "features": ["Отчет по материалам", "Отчет по проектам"]
      },
      "activated_at": "2025-01-01T10:00:00Z",
      "expires_at": null,
      "status": "active",
      "paid_amount": 0,
      "payment_method": "free"
    }
  ]
}
```

---

## 3. Проверить доступ к конкретному модулю

```http
POST /api/v1/landing/modules/check-access
```

**Описание:** Проверяет, имеет ли организация доступ к указанному модулю.

**Тело запроса:**
```json
{
  "module_slug": "advanced_reports"
}
```

**Ответ:**
```json
{
  "success": true,
  "has_access": false
}
```

---

## 4. Активировать/купить модуль

```http
POST /api/v1/landing/modules/activate
```

**Описание:** Активирует модуль для организации с указанным способом оплаты.

**Тело запроса:**
```json
{
  "module_id": 2,
  "payment_method": "balance",
  "settings": {}
}
```

**Ответ успех:**
```json
{
  "success": true,
  "message": "Модуль успешно активирован",
  "data": {
    "id": 16,
    "organization_id": 1,
    "organization_module_id": 2,
    "activated_at": "2025-01-12T15:30:00Z",
    "expires_at": "2025-02-12T15:30:00Z",
    "status": "active",
    "paid_amount": 2900,
    "payment_method": "balance"
  }
}
```

**Ответ ошибка:**
```json
{
  "success": false,
  "message": "Недостаточно средств на балансе",
  "error_code": "INSUFFICIENT_BALANCE"
}
```

---

## 5. Предварительный просмотр отмены модуля

```http
GET /api/v1/landing/modules/{moduleSlug}/cancel-preview
```

**Описание:** Получает информацию о том, сколько средств будет возвращено при отмене модуля.

**Параметры:**
- `moduleSlug` - slug модуля (например, `advanced_reports`)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "can_cancel": true,
    "refund_amount": 1933.33,
    "days_used": 10,
    "days_remaining": 20,
    "daily_cost": 96.67,
    "message": "При отмене будет возвращено 1933.33 ₽ за 20 неиспользованных дней"
  }
}
```

---

## 6. Отменить модуль с возвратом денег

```http
POST /api/v1/landing/modules/{moduleSlug}/cancel
```

**Описание:** Отменяет модуль и возвращает средства за неиспользованные дни.

**Параметры:**
- `moduleSlug` - slug модуля (например, `advanced_reports`)

**Тело запроса:**
```json
{
  "confirm": true,
  "reason": "Не нужен больше"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Модуль отключен. Возвращено 1933.33 ₽ на баланс",
  "data": {
    "refund_amount": 1933.33,
    "days_used": 10,
    "days_remaining": 20
  }
}
```

---

## Типы данных

### OrganizationModule
```typescript
interface OrganizationModule {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  category: string;
  icon: string;
  is_premium: boolean;
}
```

### ActivatedModule
```typescript
interface ActivatedModule {
  id: number;
  organization_id: number;
  module: OrganizationModule;
  activated_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'pending';
  paid_amount: number;
  payment_method: 'balance' | 'card' | 'invoice' | 'free';
}
```

### CancelPreviewResponse
```typescript
interface CancelPreviewResponse {
  can_cancel: boolean;
  refund_amount: number;
  days_used: number;
  days_remaining: number;
  daily_cost: number;
  message: string;
}
```

### CancelModuleRequest
```typescript
interface CancelModuleRequest {
  confirm: boolean;
  reason?: string;
}
```

### CancelModuleResponse
```typescript
interface CancelModuleResponse {
  refund_amount: number;
  days_used: number;
  days_remaining: number;
}
```

---

## Коды ошибок

- `INSUFFICIENT_BALANCE` - Недостаточно средств на балансе
- `MODULE_NOT_FOUND` - Модуль не найден
- `MODULE_ALREADY_ACTIVE` - Модуль уже активирован
- `MODULE_NOT_ACTIVE` - Модуль не активирован
- `CANCEL_NOT_ALLOWED` - Отмена модуля не разрешена
- `INVALID_PAYMENT_METHOD` - Неверный способ оплаты

---

## Примеры использования

### Активация модуля
```javascript
const response = await fetch('/api/v1/landing/modules/activate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    module_id: 2,
    payment_method: 'balance'
  })
});
```

### Проверка доступа к модулю
```javascript
const response = await fetch('/api/v1/landing/modules/check-access', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    module_slug: 'advanced_reports'
  })
});
```

### Отмена модуля
```javascript
// Сначала получаем предварительный просмотр
const preview = await fetch('/api/v1/landing/modules/advanced_reports/cancel-preview', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// Затем отменяем модуль
const response = await fetch('/api/v1/landing/modules/advanced_reports/cancel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    confirm: true,
    reason: 'Модуль больше не нужен'
  })
});
```
