# API Документация: Управление организациями

## Обзор

Полная документация по API для управления организациями, включая CRUD операции, верификацию через DaData и автокомплит для форм.

**Базовый URL:** `/api/v1/landing/`

**Авторизация:** Bearer Token (JWT)

---

## CRUD операции с организациями

### 1. Получение списка организаций пользователя

```http
GET /organizations
```

**Описание:** Получает список всех организаций, к которым принадлежит текущий пользователь.

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Ответ:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "ООО Строительная компания",
      "legal_name": "Общество с ограниченной ответственностью \"Строительная компания\"",
      "tax_number": "7707083893",
      "registration_number": "1027700132195",
      "phone": "+7(495)123-45-67",
      "email": "info@company.ru",
      "address": "г. Москва, ул. Тверская, д. 1",
      "city": "Москва",
      "postal_code": "125009",
      "country": "Россия",
      "description": "Строительные работы",
      "logo_path": null,
      "is_active": true,
      "subscription_expires_at": "2025-12-31T23:59:59.000000Z",
      "verification": {
        "is_verified": true,
        "verified_at": "2025-06-22T10:30:00.000000Z",
        "verification_status": "verified",
        "verification_status_text": "Верифицирована",
        "verification_score": 100,
        "verification_data": { /* данные верификации */ },
        "verification_notes": "Результат верификации: 100/100 баллов",
        "can_be_verified": true
      },
      "created_at": "2025-01-01T00:00:00.000000Z",
      "updated_at": "2025-06-22T10:30:00.000000Z"
    }
  ]
}
```

---

### 2. Создание новой организации

```http
POST /organizations
```

**Описание:** Создает новую организацию и назначает текущего пользователя её владельцем.

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "ООО Новая компания",
  "legal_name": "Общество с ограниченной ответственностью \"Новая компания\"",
  "tax_number": "1234567890",
  "registration_number": "1234567890123",
  "phone": "+7(495)123-45-67",
  "email": "info@newcompany.ru",
  "address": "г. Москва, ул. Новая, д. 1",
  "city": "Москва",
  "postal_code": "123456",
  "country": "Россия",
  "description": "Описание новой компании"
}
```

**Ответ (успех):**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    // Данные созданной организации
  }
}
```

---

### 3. Получение данных конкретной организации

```http
GET /organizations/{id}
```

**Описание:** Получает данные конкретной организации (только если пользователь к ней принадлежит).

**Параметры URL:**
- `id` - ID организации

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Ответ:**
```json
{
  "success": true,
  "message": "Organization data retrieved successfully",
  "data": {
    // Полные данные организации с верификацией
  }
}
```

**Ответ (нет доступа):**
```json
{
  "success": false,
  "message": "Access denied to this organization"
}
```

---

### 4. Обновление данных организации

```http
PUT /organizations/{id}
```

**Описание:** Обновляет данные организации (только для владельца).

**Параметры URL:**
- `id` - ID организации

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "ООО Обновленное название",
  "legal_name": "Общество с ограниченной ответственностью \"Обновленное название\"",
  "tax_number": "7707083893",
  "registration_number": "1027700132195",
  "phone": "+7(495)123-45-67",
  "email": "info@updated.ru",
  "address": "г. Москва, ул. Обновленная, д. 1",
  "city": "Москва",
  "postal_code": "123456",
  "country": "Россия",
  "description": "Обновленное описание"
}
```

**Правила валидации:**
- `name` - иногда обязательно, строка, 2-255 символов
- `legal_name` - опционально, строка, 2-255 символов
- `tax_number` - опционально, 10 или 12 цифр (ИНН), уникальный
- `registration_number` - опционально, 13 или 15 цифр (ОГРН/ОГРНИП), уникальный
- `phone` - опционально, российский формат
- `email` - опционально, валидный email, уникальный
- `address` - опционально, 10-500 символов
- `city` - опционально, 2-100 символов, только буквы
- `postal_code` - опционально, ровно 6 цифр
- `country` - опционально, 2-100 символов
- `description` - опционально, до 1000 символов

**Ответ (успех):**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    // Обновленные данные организации
  }
}
```

---

## Эндпоинты верификации

### 5. Получение данных текущей организации с верификацией

```http
GET /organization/verification
```

**Описание:** Получает данные текущей организации пользователя с подробной информацией о верификации.

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Ответ:**
```json
{
  "success": true,
  "message": "Данные организации получены",
  "data": {
    "organization": {
      // Полные данные организации включая детальную верификацию
      "verification": {
        "is_verified": true,
        "verified_at": "2025-06-22T10:30:00.000000Z",
        "verification_status": "verified",
        "verification_status_text": "Верифицирована",
        "verification_score": 100,
        "verification_data": {
          "score": 100,
          "inn_verification": {
            "success": true,
            "message": "Организация найдена",
            "data": {
              "inn": "7707083893",
              "ogrn": "1027700132195",
              "name": "ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ \"КОМПАНИЯ\"",
              "status": "ACTIVE",
              "address": "г Москва, ул Тверская, д 1",
              "management": "ИВАНОВ ИВАН ИВАНОВИЧ"
            }
          },
          "address_verification": {
            "success": true,
            "message": "Адрес обработан успешно"
          },
          "errors": [],
          "warnings": []
        },
        "verification_notes": "Результат верификации: 100/100 баллов",
        "can_be_verified": true
      }
    }
  }
}
```

---

### 6. Обновление данных с автоверификацией

```http
PATCH /organization/verification
```

**Описание:** Обновляет данные текущей организации. При наличии ИНН и адреса автоматически запускает верификацию.

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Тело запроса:** (такое же как в PUT /organizations/{id})

**Ответ:**
```json
{
  "success": true,
  "message": "Данные организации обновлены",
  "data": {
    "organization": {
      // Обновленные данные с результатами автоверификации
    }
  }
}
```

---

### 7. Запрос верификации

```http
POST /organization/verification/request
```

**Описание:** Запускает процесс верификации организации через DaData API.

**Заголовки:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Ответ (успех):**
```json
{
  "success": true,
  "message": "Верификация завершена",
  "data": {
    "verification_result": {
      "inn_verification": {
        "success": true,
        "message": "Организация найдена",
        "data": {
          "inn": "7707083893",
          "ogrn": "1027700132195",
          "name": "ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ \"КОМПАНИЯ\"",
          "short_name": "ООО \"КОМПАНИЯ\"",
          "legal_name": "ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ \"КОМПАНИЯ\"",
          "status": "ACTIVE",
          "address": "г Москва, ул Тверская, д 1",
          "management": "ИВАНОВ ИВАН ИВАНОВИЧ",
          "registration_date": "2002-07-12",
          "liquidation_date": null
        }
      },
      "address_verification": {
        "success": true,
        "message": "Адрес обработан успешно",
        "data": {
          "source": "г. Москва, ул. Тверская, д. 1",
          "result": "г Москва, ул Тверская, д 1",
          "postal_code": "125009",
          "country": "Россия",
          "region": "Москва",
          "city": "Москва",
          "street": "Тверская",
          "house": "1",
          "qc": 0
        }
      },
      "overall_status": "verified",
      "verification_score": 100,
      "errors": [],
      "warnings": []
    },
    "organization": {
      // Обновленные данные организации
    }
  }
}
```

---

## DaData автокомплит

### 8. Автокомплит организаций

```http
POST /dadata/suggest/organizations
```

**Описание:** Поиск организаций по названию или ИНН для автокомплита.

**Тело запроса:**
```json
{ "query": "Сбербанк" }
```

**Ответ:**
```json
{
  "success": true,
  "message": "Результаты поиска получены",
  "data": [
    {
      "value": "ПАО СБЕРБАНК",
      "unrestricted_value": "ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО \"СБЕРБАНК РОССИИ\"",
      "data": {
        "inn": "7707083893",
        "ogrn": "1027700132195",
        "name": {
          "full": "ПУБЛИЧНОЕ АКЦИОНЕРНОЕ ОБЩЕСТВО \"СБЕРБАНК РОССИИ\"",
          "short": "ПАО СБЕРБАНК"
        },
        "address": {
          "unrestricted_value": "г Москва, ул Вавилова, д 19"
        },
        "state": { "status": "ACTIVE" }
      }
    }
  ]
}
```

---

### 9. Автокомплит адресов

```http
POST /dadata/suggest/addresses
```

**Описание:** Поиск адресов для автокомплита форм.

**Тело запроса:**
```json
{ "query": "Москва Тверская" }
```

**Ответ:**
```json
{
  "success": true,
  "message": "Результаты поиска адресов получены",
  "data": [
    {
      "value": "г Москва, ул Тверская",
      "unrestricted_value": "125009, г Москва, ул Тверская",
      "data": {
        "postal_code": "125009",
        "country": "Россия",
        "region": "Москва",
        "city": "Москва",
        "street": "Тверская",
        "qc": 1
      }
    }
  ]
}
```

---

### 10. Стандартизация адреса

```http
POST /dadata/clean/address
```

**Описание:** Проверка и стандартизация введённого адреса.

**Тело запроса:**
```json
{ "address": "мск тверская 1" }
```

**Ответ:**
```json
{
  "success": true,
  "message": "Адрес обработан успешно",
  "data": {
    "source": "мск тверская 1",
    "result": "г Москва, ул Тверская, д 1",
    "postal_code": "125009",
    "country": "Россия",
    "region": "Москва",
    "city": "Москва",
    "street": "Тверская",
    "house": "1",
    "qc": 0
  }
}
```

---

## Статусы верификации

| Статус | Описание | Баллы | Цвет |
|--------|----------|-------|------|
| `verified` | Верифицирована | 90-100 | 🟢 Зеленый |
| `partially_verified` | Частично верифицирована | 70-89 | 🟡 Желтый |
| `needs_review` | Требует проверки | 50-69 | 🔴 Красный |
| `failed` | Верификация не пройдена | 0-49 | ⚫ Черный |
| `pending` | Ожидает верификации | 0 | ⚪ Серый |

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешно |
| 201 | Создано |
| 400 | Ошибка валидации |
| 401 | Не авторизован |
| 403 | Нет доступа к организации |
| 404 | Организация не найдена |
| 422 | Ошибки валидации данных |
| 500 | Внутренняя ошибка сервера |

---

## Примеры использования

### Создание и верификация организации:

```javascript
// 1. Создание организации
const createOrg = await fetch('/api/v1/landing/organizations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'ООО Моя компания',
    tax_number: '7707083893',
    address: 'г. Москва, ул. Тверская, д. 1'
  })
});

// 2. Запрос верификации
const verify = await fetch('/api/v1/landing/organization/verification/request', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Автокомплит в формах:

```javascript
// Дебаунс для автокомплита
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Автокомплит организаций
const searchOrganizations = debounce(async (query) => {
  if (query.length < 3) return [];
  
  const response = await fetch('/api/v1/landing/dadata/suggest/organizations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  
  const result = await response.json();
  return result.data || [];
}, 300);
```

---

## Текущие роуты

```php
// Основные CRUD операции
GET    /api/v1/landing/organizations           // Список организаций
POST   /api/v1/landing/organizations           // Создание организации
GET    /api/v1/landing/organizations/{id}      // Данные организации
PUT    /api/v1/landing/organizations/{id}      // Обновление организации

// Верификация
GET    /api/v1/landing/organization/verification        // Данные с верификацией
PATCH  /api/v1/landing/organization/verification        // Обновление с автоверификацией
POST   /api/v1/landing/organization/verification/request // Запрос верификации

// DaData автокомплит
POST   /api/v1/landing/dadata/suggest/organizations     // Поиск организаций
POST   /api/v1/landing/dadata/suggest/addresses         // Поиск адресов
POST   /api/v1/landing/dadata/clean/address             // Стандартизация адреса
```

---

## Рекомендации по интеграции

### Последовательность действий:
1. **Получить список организаций** пользователя
2. **Выбрать текущую** или **создать новую**
3. **Заполнить данные** с автокомплитом
4. **Запросить верификацию** для повышения доверия
5. **Отображать статус** верификации в интерфейсе

### UI/UX рекомендации:
- Использовать автокомплит для ИНН и адресов
- Показывать прогресс верификации (баллы)
- Выделять верифицированные организации
- Предлагать исправить данные при низких баллах
- Кешировать результаты автокомплита 