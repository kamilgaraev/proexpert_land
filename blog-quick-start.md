# Блог-модуль: Полная UI документация

## 📱 Общая структура интерфейса

### Навигация и макет

**Главное меню:**
```
└─ Блог
   ├─ 📊 Дашборд
   ├─ 📝 Статьи
   ├─ 📂 Категории  
   ├─ 💬 Комментарии
   ├─ 🔍 SEO
   └─ ⚙️ Настройки
```

**Хлебные крошки:**
- Админка → Блог → [Текущий раздел]
- Всегда показывать путь для удобной навигации
- Кликабельные элементы для быстрого перехода

### Цветовая схема и иконки

**Статусы статей:**
- **Черновик** - серый (#6c757d) - иконка 📝
- **Опубликовано** - зеленый (#28a745) - иконка ✅
- **Запланировано** - синий (#007bff) - иконка ⏰ 
- **Архивировано** - оранжевый (#fd7e14) - иконка 📦

**Статусы комментариев:**
- **Ожидает модерации** - желтый (#ffc107) - иконка ⏳
- **Одобрено** - зеленый (#28a745) - иконка ✅
- **Отклонено** - красный (#dc3545) - иконка ❌
- **Спам** - темно-красный (#721c24) - иконка 🚫

## 🏠 Дашборд блога

### Основной экран обзора

**Верхние карточки статистики (4 колонки):**

1. **Всего статей**
   - Крупное число (например: 45)
   - Подпись "Статей в блоге"
   - Мини-график роста за неделю
   - Иконка 📄

2. **Опубликовано**
   - Крупное число (например: 32)
   - Процент от общего (71%)
   - Зеленый цвет фона
   - Иконка ✅

3. **Ожидают модерации**
   - Число комментариев (например: 12)
   - **Красный badge** если больше 5
   - Кнопка "Проверить" → переход к комментариям
   - Иконка 💬

4. **Просмотры за сегодня**
   - Число просмотров (например: 1,247)
   - Сравнение с вчера (+12%)
   - Иконка 👁️

### Центральная область (2 колонки)

**Левая колонка - "Популярные статьи":**
- Таблица топ-5 статей
- Колонки: Заголовок, Просмотры, Лайки
- Возможность сортировки по любому параметру
- Ссылки на редактирование статей

**Правая колонка - "Последние действия":**
- Лента активности (10 последних)
- Типы событий: новая статья, новый комментарий, публикация
- Время в относительном формате ("2 часа назад")
- Иконки для каждого типа события

### Нижняя область

**График активности (полная ширина):**
- Линейный график просмотров за 30 дней
- Переключатели периода: 7 дней, 30 дней, 3 месяца
- Возможность выбора метрики: просмотры, статьи, комментарии
- Интерактивные точки с всплывающими подсказками

## 📝 Управление статьями

### Список статей

**Заголовок страницы:**
- "Статьи блога" с счетчиком (например: "Статьи блога (45)")
- Кнопка "+ Создать статью" справа (зеленая, prominent)

**Панель фильтров (горизонтальная):**
- **Статус:** Dropdown с множественным выбором + счетчики
- **Категория:** Dropdown с цветными индикаторами  
- **Автор:** Поиск по имени с автодополнением
- **Период:** Date range picker для даты публикации
- **Поиск:** Текстовое поле с иконкой лупы
- Кнопка "Сбросить фильтры" справа

**Основная таблица:**

| Колонка | Ширина | Описание |
|---------|--------|----------|
| □ | 40px | Checkbox для массовых операций |
| 📷 | 60px | Превью изображения (thumbnail) |
| **Заголовок** | 40% | Заголовок + краткое описание под ним |
| **Категория** | 15% | Цветной badge с названием |
| **Автор** | 15% | Имя + аватар |
| **Статус** | 10% | Цветной badge + дата |
| **Метрики** | 10% | 👁️ просмотры, 💬 комментарии |
| **⚙️** | 10% | Dropdown меню действий |

**Панель массовых действий (появляется при выборе):**
- Появляется сверху таблицы с анимацией
- "Выбрано: X статей"
- Кнопки: Опубликовать, Архивировать, Удалить
- Кнопка "Отменить выбор"

**Пагинация:**
- Снизу по центру
- Показывать: "Показано 1-15 из 45 статей"
- Выбор количества на странице: 15, 30, 50, 100

### Создание и редактирование статьи

**Макет страницы:**
- **Левая колонка (70%)** - основная форма
- **Правая колонка (30%)** - превью и настройки

**Заголовок страницы:**
- "Создать статью" или "Редактировать: [Название статьи]"
- Кнопки действий справа:
  - "👁️ Предпросмотр" (открывает в новой вкладке)
  - "💾 Сохранить черновик"
  - "🚀 Опубликовать"

#### Левая колонка - Основное содержимое

**1. Основные поля:**
- **Заголовок:** Крупное поле с счетчиком символов (0/255)
- **Slug:** Автогенерация, возможность ручного редактирования
- **Категория:** Dropdown с созданием новой категории inline
- **Краткое описание:** Textarea с счетчиком (0/500)

**2. Редактор контента:**
- Rich Text Editor во всю ширину
- Панель инструментов: форматирование, изображения, ссылки
- Кнопка "📷 Добавить изображение" - загрузка с preview
- Автосохранение каждые 30 секунд с индикатором

**3. Изображения (expandable секция):**
- **Главное изображение:** Drag&drop зона или кнопка выбора
- **Галерея:** Множественная загрузка с preview grid
- Возможность crop и resize для главного изображения

**4. SEO настройки (expandable секция):**
- **Meta title:** Поле с live preview в поисковой выдаче
- **Meta description:** Textarea с live preview
- **Ключевые слова:** Tags input с подсказками
- **Open Graph:** Отдельные поля для соцсетей
- **Предпросмотр:** Как статья будет выглядеть в Google/Facebook

#### Правая колонка - Настройки и превью

**1. Статус публикации:**
- Radio buttons или красивые карточки
- Для "Запланировано" - datetime picker
- Индикаторы текущего статуса

**2. Настройки статьи:**
- **🌟 Рекомендуемая статья** - toggle switch
- **💬 Разрешить комментарии** - toggle switch  
- **📡 Включить в RSS** - toggle switch
- **🚫 Запретить индексацию** - toggle switch

**3. Теги:**
- Tags input с автодополнением
- Показывать популярные теги как кнопки
- Создание новых тегов inline

**4. Превью статьи:**
- Миниатюра как статья будет выглядеть
- Обновляется в реальном времени
- Кнопка "Полный предпросмотр"

## 📂 Управление категориями

### Список категорий

**Заголовок:**
- "Категории блога" с кнопкой "+ Добавить категорию"

**Карточечный вид (Grid 3 колонки):**
- Каждая категория - карточка с:
  - Цветная полоска сверху (цвет категории)
  - Название категории
  - Описание (первые 100 символов)
  - Статистика: "12 статей"
  - Кнопки: "✏️ Редактировать", "🗑️ Удалить"

**Возможность drag & drop для изменения порядка:**
- Handle для перетаскивания на каждой карточке
- Визуальная обратная связь при перетаскивании
- Автосохранение нового порядка

### Создание/редактирование категории

**Модальное окно:**
- Не новая страница, а overlay
- Форма в центре экрана

**Поля формы:**
- **Название:** Обязательное поле
- **Slug:** Автогенерация с возможностью редактирования
- **Описание:** Textarea для подробного описания
- **Цвет:** Color picker с предустановленными цветами
- **Изображение:** Upload с preview
- **Сортировка:** Number input (порядок отображения)
- **Активность:** Toggle switch "Показывать на сайте"

**Кнопки:**
- "Сохранить" и "Отмена" снизу модального окна

## 💬 Модерация комментариев

### Главная страница комментариев

**Tabs для фильтрации:**
- **Все (156)** - все комментарии
- **Ожидают (12)** - требуют модерации (с красным badge)
- **Одобренные (130)** - опубликованные комментарии
- **Отклоненные (8)** - отклоненные модератором
- **Спам (6)** - помеченные как спам

**Массовые действия (панель сверху):**
- Появляется при выборе комментариев
- Кнопки: "✅ Одобрить все", "❌ Отклонить все", "🚫 Отметить как спам"
- Checkbox "Выбрать все на странице"

### Таблица комментариев

**Дизайн строки:**
```
[□] [👤 Аватар] [Имя автора + email]     [Статус Badge]    [⚙️]
                [Первые 150 символов...]
                [📄 Статья: "Название"]    [🕒 2 часа назад]
```

**Interaction states:**
- Hover effect для каждой строки
- Выделение выбранных строк
- Анимация при изменении статуса

**Действия для каждого комментария:**
- **✅ Одобрить** - зеленая кнопка
- **❌ Отклонить** - красная кнопка  
- **🚫 Спам** - темно-красная кнопка
- **👁️ Подробнее** - открывает модальное окно
- **🗑️ Удалить** - с подтверждением

### Модальное окно комментария

**Полная информация:**
- Фото автора (если есть) или инициалы
- Полное имя, email, сайт автора
- Полный текст комментария
- Информация о статье с превью
- IP адрес и User Agent (для борьбы со спамом)
- История изменений статуса

**Форма ответа модератора:**
- Возможность ответить на комментарий от лица админа
- Rich text для форматирования ответа

## 🔍 SEO управление

### Главная страница SEO

**Секции на одной странице:**

**1. Основные настройки (карточка):**
- Название сайта блога
- Описание по умолчанию
- Ключевые слова по умолчанию
- Изображение по умолчанию для соцсетей

**2. Автоматизация (карточка):**
- Переключатели для автофункций:
  - ✅ Автогенерация meta описаний
  - ✅ Включить структурированные данные
  - ✅ Генерировать sitemap автоматически
  - ✅ Обновлять RSS ленту

**3. Файлы (карточка):**
- **Sitemap.xml:** Статус генерации + кнопка "👁️ Предпросмотр"
- **RSS лента:** Статус + кнопка "👁️ Предпросмотр" 
- **Robots.txt:** Кнопка "✏️ Редактировать"

**4. Аналитика (карточка):**
- Поля для Google Analytics, Yandex Metrica
- Коды верификации для Search Console
- Тестирование подключения с индикаторами статуса

**5. Социальные сети (карточка):**
- Ссылки на профили в соцсетях
- Предпросмотр как статьи выглядят при репосте

### Редактор Robots.txt

**Отдельная страница или модальное окно:**
- Code editor с подсветкой синтаксиса
- Шаблоны robots.txt для быстрой вставки
- Валидация правил в реальном времени
- Предпросмотр: как роботы видят ваш сайт

## 🎨 UI/UX принципы и рекомендации

### Общие принципы дизайна

**Адаптивность:**
- Desktop first подход
- Breakpoints: 1200px (desktop), 768px (tablet), 480px (mobile)
- На мобильных: скрытие второстепенных колонок в таблицах
- Collapse меню и панели на малых экранах

**Типографика:**
- Заголовки: четкая иерархия H1-H6
- Основной текст: легко читаемый размер (14-16px)
- Цветовой контраст: минимум 4.5:1 для доступности

**Интерактивность:**
- Hover states для всех кликабельных элементов
- Loading состояния для всех асинхронных операций
- Анимации: плавные transitions (0.2-0.3s)
- Debounce для поисковых полей (300ms)

### Уведомления и фидбек

**Toast уведомления:**
- Позиция: верхний правый угол
- Автоскрытие через 4 секунды
- Типы: success (зеленый), error (красный), warning (желтый), info (синий)
- Возможность закрыть вручную

**Подтверждения критических действий:**
- Удаление статьи/категории: модальное окно с описанием последствий
- Массовые операции: показать количество затронутых элементов
- Необратимые действия: требовать дополнительного подтверждения

**Состояния загрузки:**
- Skeleton loading для таблиц и карточек
- Spinner для кнопок (заменяет текст)
- Progress bar для загрузки файлов
- Disable интерфейса во время критических операций

### Формы и валидация

**Принципы валидации:**
- Inline валидация: проверка при потере фокуса
- Real-time валидация для критических полей (email, slug)
- Показ ошибок сразу под полем ввода
- Счетчики символов для ограниченных полей

**Автосохранение:**
- Черновики статей: каждые 30 секунд
- Индикатор состояния: "Сохранено", "Сохранение...", "Ошибка сохранения"
- Восстановление при перезагрузке страницы

### Доступность (a11y)

**Клавиатурная навигация:**
- Tab order логичен и последователен
- Focus indicators видимы и контрастны
- Escape закрывает модальные окна
- Enter/Space активируют кнопки

**Screen readers:**
- Все изображения с alt текстами
- Aria-labels для интерактивных элементов
- Семантическая HTML разметка
- Анонсирование изменений состояния

**Цветовая доступность:**
- Информация не передается только цветом
- Высокий контраст для текста
- Паттерны или иконки дублируют цветовые индикаторы

### Производительность

**Оптимизация загрузки:**
- Lazy loading для изображений
- Виртуальная прокрутка для больших таблиц
- Debounce/throttle для частых операций
- Кэширование повторяющихся запросов

**Отзывчивость интерфейса:**
- Максимум 100ms для мгновенного отклика
- 300ms для операций "быстро"
- 1s максимум для операций "нормально"
- Показ прогресса для операций >1s

Эта документация охватывает все аспекты пользовательского интерфейса блог-модуля, предоставляя четкие рекомендации для создания интуитивного и функционального административного интерфейса.

---

# 🔗 API Документация

**Base URL:** `/api/v1/landing/blog`  
**Авторизация:** Bearer Token (landing_admin guard)

## 📊 Dashboard API

### GET /blog/dashboard/overview
Получение обзора блога с основной статистикой.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "articles": {
      "total": 45,
      "published": 32,
      "drafts": 8,
      "scheduled": 5
    },
    "categories": {
      "total": 6,
      "active": 5
    },
    "tags": {
      "total": 24,
      "active": 20
    },
    "comments": {
      "total": 156,
      "pending": 12,
      "approved": 130,
      "rejected": 8,
      "spam": 6
    },
    "popular_articles": [
      {
        "id": 1,
        "title": "Как создать SEO-оптимизированный блог",
        "views_count": 1250,
        "likes_count": 45,
        "comments_count": 12,
        "category": {
          "id": 1,
          "name": "SEO и Маркетинг"
        }
      }
    ],
    "recent_articles": [
      {
        "id": 5,
        "title": "Новые тренды в веб-разработке 2025",
        "status": "published",
        "created_at": "2025-01-19T15:30:00.000000Z",
        "author": {
          "id": 1,
          "name": "Иван Петров"
        }
      }
    ],
    "recent_comments": [
      {
        "id": 25,
        "author_name": "Мария Иванова",
        "content": "Отличная статья, спасибо за информацию!",
        "status": "pending",
        "created_at": "2025-01-19T16:15:00.000000Z",
        "article": {
          "id": 3,
          "title": "Основы контент-маркетинга"
        }
      }
    ]
  }
}
```

### GET /blog/dashboard/analytics
Получение детальной аналитики с графиками.

**Параметры:**
- `period` - период (week, month, quarter, year)
- `start_date` - начальная дата (YYYY-MM-DD)
- `end_date` - конечная дата (YYYY-MM-DD)

**Пример запроса:**
```
GET /blog/dashboard/analytics?period=month&start_date=2025-01-01&end_date=2025-01-31
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "articles_by_date": [
      {
        "date": "2025-01-19",
        "count": 3
      }
    ],
    "comments_by_date": [
      {
        "date": "2025-01-19",
        "count": 15
      }
    ],
    "views_by_date": [
      {
        "date": "2025-01-19",
        "total_views": 2450
      }
    ],
    "categories_stats": [
      {
        "id": 1,
        "name": "SEO и Маркетинг",
        "published_articles_count": 12
      }
    ],
    "top_articles": [
      {
        "id": 1,
        "title": "Как создать SEO-оптимизированный блог",
        "views_count": 1250,
        "likes_count": 45,
        "comments_count": 12,
        "category": "SEO и Маркетинг",
        "author": "Иван Петров",
        "published_at": "2025-01-15T10:00:00.000000Z"
      }
    ]
  }
}
```

### GET /blog/dashboard/quick-stats
Получение быстрой статистики для сравнения периодов.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "today_vs_yesterday": {
      "articles": {
        "today": 2,
        "yesterday": 1,
        "change_percent": 100
      },
      "views": {
        "today": 1247,
        "yesterday": 1089,
        "change_percent": 14.5
      },
      "comments": {
        "today": 8,
        "yesterday": 12,
        "change_percent": -33.3
      }
    },
    "this_month_vs_last": {
      "articles": {
        "this_month": 15,
        "last_month": 12,
        "change_percent": 25
      },
      "views": {
        "this_month": 45000,
        "last_month": 38000,
        "change_percent": 18.4
      }
    }
  }
}
```

## 📝 Articles API

### GET /blog/articles
Получение списка статей с фильтрацией и пагинацией.

**Параметры:**
- `status` - статус статьи (draft, published, scheduled, archived)
- `category_id` - ID категории
- `author_id` - ID автора
- `search` - поисковый запрос
- `per_page` - количество на странице (по умолчанию 15)
- `page` - номер страницы

**Пример запроса:**
```
GET /blog/articles?status=published&category_id=1&search=SEO&per_page=20&page=1
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Как создать SEO-оптимизированный блог",
      "slug": "kak-sozdat-seo-optimizirovannyj-blog",
      "excerpt": "Краткое описание статьи для превью",
      "content": "<p>Полное содержимое статьи в HTML формате</p>",
      "featured_image": "/storage/blog/images/article-1.jpg",
      "status": "published",
      "published_at": "2025-01-19T15:30:00.000000Z",
      "views_count": 1250,
      "likes_count": 45,
      "comments_count": 12,
      "is_featured": true,
      "allow_comments": true,
      "url": "/blog/kak-sozdat-seo-optimizirovannyj-blog",
      "category": {
        "id": 1,
        "name": "SEO и Маркетинг",
        "color": "#007bff"
      },
      "author": {
        "id": 1,
        "name": "Иван Петров",
        "email": "ivan@example.com"
      },
      "tags": [
        {
          "id": 1,
          "name": "SEO",
          "slug": "seo"
        }
      ],
      "created_at": "2025-01-19T12:00:00.000000Z",
      "updated_at": "2025-01-19T15:30:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 45
  },
  "links": {
    "first": "/api/v1/landing/blog/articles?page=1",
    "last": "/api/v1/landing/blog/articles?page=3",
    "prev": null,
    "next": "/api/v1/landing/blog/articles?page=2"
  }
}
```

### POST /blog/articles
Создание новой статьи.

**Тело запроса:**
```json
{
  "title": "Как создать SEO-оптимизированный блог",
  "slug": "kak-sozdat-seo-optimizirovannyj-blog",
  "category_id": 1,
  "excerpt": "Краткое описание статьи",
  "content": "<p>Полное содержимое статьи в HTML</p>",
  "featured_image": "/storage/blog/images/article-1.jpg",
  "gallery_images": [
    "/storage/blog/images/gallery-1.jpg",
    "/storage/blog/images/gallery-2.jpg"
  ],
  "meta_title": "Как создать SEO-оптимизированный блог | ProHelper",
  "meta_description": "Подробное руководство по созданию блога с учетом SEO",
  "meta_keywords": ["seo", "блог", "оптимизация"],
  "og_title": "Как создать SEO-оптимизированный блог",
  "og_description": "Узнайте, как создать блог, который будет привлекать трафик",
  "og_image": "/storage/blog/images/og-article-1.jpg",
  "status": "draft",
  "published_at": "2025-01-19T15:30:00.000000Z",
  "scheduled_at": null,
  "is_featured": false,
  "allow_comments": true,
  "is_published_in_rss": true,
  "noindex": false,
  "sort_order": 0,
  "tags": ["seo", "блог", "контент-маркетинг"]
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Статья успешно создана",
  "data": {
    "id": 15,
    "title": "Как создать SEO-оптимизированный блог",
    "slug": "kak-sozdat-seo-optimizirovannyj-blog",
    "status": "draft",
    "url": "/blog/kak-sozdat-seo-optimizirovannyj-blog",
    "category": {
      "id": 1,
      "name": "SEO и Маркетинг"
    },
    "author": {
      "id": 1,
      "name": "Иван Петров"
    },
    "tags": [
      { "id": 1, "name": "seo" },
      { "id": 25, "name": "блог" },
      { "id": 8, "name": "контент-маркетинг" }
    ],
    "created_at": "2025-01-19T16:00:00.000000Z"
  }
}
```

### GET /blog/articles/{id}
Получение конкретной статьи.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Как создать SEO-оптимизированный блог",
    "slug": "kak-sozdat-seo-optimizirovannyj-blog",
    "excerpt": "Краткое описание статьи для превью",
    "content": "<p>Полное содержимое статьи в HTML формате</p>",
    "featured_image": "/storage/blog/images/article-1.jpg",
    "gallery_images": [
      "/storage/blog/images/gallery-1.jpg",
      "/storage/blog/images/gallery-2.jpg"
    ],
    "meta_title": "Как создать SEO-оптимизированный блог | ProHelper",
    "meta_description": "Подробное руководство по созданию блога с учетом SEO требований. Пошаговая инструкция для начинающих.",
    "meta_keywords": ["seo", "блог", "оптимизация", "контент-маркетинг"],
    "og_title": "Как создать SEO-оптимизированный блог",
    "og_description": "Узнайте, как создать блог, который будет привлекать трафик из поисковых систем",
    "og_image": "/storage/blog/images/og-article-1.jpg",
    "structured_data": {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Как создать SEO-оптимизированный блог"
    },
    "status": "published",
    "published_at": "2025-01-19T15:30:00.000000Z",
    "scheduled_at": null,
    "views_count": 1250,
    "likes_count": 45,
    "comments_count": 12,
    "reading_time": 5,
    "estimated_reading_time": 5,
    "is_featured": true,
    "allow_comments": true,
    "is_published_in_rss": true,
    "noindex": false,
    "sort_order": 0,
    "url": "/blog/kak-sozdat-seo-optimizirovannyj-blog",
    "is_published": true,
    "readable_published_at": "19.01.2025 15:30",
    "category": {
      "id": 1,
      "name": "SEO и Маркетинг",
      "slug": "seo-i-marketing",
      "color": "#007bff"
    },
    "author": {
      "id": 1,
      "name": "Иван Петров",
      "email": "ivan@example.com"
    },
    "tags": [
      {
        "id": 1,
        "name": "SEO",
        "slug": "seo"
      }
    ],
    "comments": [
      {
        "id": 1,
        "author_name": "Мария Иванова",
        "content": "Отличная статья! Много полезной информации.",
        "status": "approved",
        "created_at": "2025-01-19T15:45:00.000000Z"
      }
    ],
    "created_at": "2025-01-19T12:00:00.000000Z",
    "updated_at": "2025-01-19T15:30:00.000000Z"
  }
}
```

### PUT /blog/articles/{id}
Обновление статьи.

**Тело запроса:** (аналогично POST, но все поля опциональны)
```json
{
  "title": "Как создать SEO-оптимизированный блог (обновлено)",
  "category_id": 2,
  "status": "published"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Статья успешно обновлена",
  "data": {
    // полные данные статьи аналогично GET
  }
}
```

### DELETE /blog/articles/{id}
Удаление статьи.

**Ответ:**
```json
{
  "success": true,
  "message": "Статья успешно удалена"
}
```

### POST /blog/articles/{id}/publish
Публикация статьи.

**Тело запроса (опционально):**
```json
{
  "publish_at": "2025-01-20T10:00:00.000000Z"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Статья опубликована",
  "data": {
    "id": 1,
    "status": "published",
    "published_at": "2025-01-19T16:00:00.000000Z"
  }
}
```

### POST /blog/articles/{id}/schedule
Планирование публикации статьи.

**Тело запроса:**
```json
{
  "scheduled_at": "2025-01-20T10:00:00.000000Z"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Статья запланирована к публикации на 20.01.2025 10:00",
  "data": {
    "id": 1,
    "status": "scheduled",
    "scheduled_at": "2025-01-20T10:00:00.000000Z"
  }
}
```

### POST /blog/articles/{id}/archive
Архивирование статьи.

**Ответ:**
```json
{
  "success": true,
  "message": "Статья архивирована",
  "data": {
    "id": 1,
    "status": "archived"
  }
}
```

### POST /blog/articles/{id}/duplicate
Дублирование статьи.

**Ответ:**
```json
{
  "success": true,
  "message": "Статья дублирована",
  "data": {
    "id": 16,
    "title": "Как создать SEO-оптимизированный блог (копия)",
    "status": "draft",
    "original_article_id": 1
  }
}
```

### GET /blog/articles/{id}/seo-data
Автогенерация SEO данных для статьи.

**Ответ:**
```json
{
  "success": true,
  "message": "SEO данные сгенерированы",
  "data": {
    "meta_title": "Как создать SEO-оптимизированный блог | ProHelper",
    "meta_description": "Подробное руководство по созданию блога с учетом SEO требований",
    "meta_keywords": ["seo", "блог", "оптимизация"],
    "structured_data": {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Как создать SEO-оптимизированный блог"
    }
  }
}
```

### GET /blog/articles-scheduled
Получение запланированных статей.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "Будущая статья",
      "scheduled_at": "2025-01-25T10:00:00.000000Z",
      "author": {
        "id": 1,
        "name": "Иван Петров"
      }
    }
  ]
}
```

### GET /blog/articles-drafts
Получение черновиков текущего автора.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "title": "Черновик статьи",
      "status": "draft",
      "updated_at": "2025-01-19T14:30:00.000000Z"
    }
  ]
}
```

## 📂 Categories API

### GET /blog/categories
Получение списка категорий.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SEO и Маркетинг",
      "slug": "seo-i-marketing",
      "description": "Статьи о поисковой оптимизации и маркетинге",
      "meta_title": "SEO и Маркетинг | ProHelper Blog",
      "meta_description": "Советы по SEO-оптимизации и маркетинговые стратегии для бизнеса",
      "color": "#007bff",
      "image": "/storage/blog/categories/seo-marketing.jpg",
      "sort_order": 0,
      "is_active": true,
      "articles_count": 15,
      "published_articles_count": 12,
      "created_at": "2025-01-15T10:00:00.000000Z",
      "updated_at": "2025-01-19T14:30:00.000000Z"
    }
  ]
}
```

### POST /blog/categories
Создание новой категории.

**Тело запроса:**
```json
{
  "name": "SEO и Маркетинг",
  "slug": "seo-i-marketing",
  "description": "Статьи о поисковой оптимизации и маркетинге",
  "meta_title": "SEO и Маркетинг | ProHelper Blog",
  "meta_description": "Советы по SEO-оптимизации и маркетинговые стратегии для бизнеса",
  "color": "#007bff",
  "image": "/storage/blog/categories/seo-marketing.jpg",
  "sort_order": 0,
  "is_active": true
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Категория успешно создана",
  "data": {
    "id": 7,
    "name": "SEO и Маркетинг",
    "slug": "seo-i-marketing",
    "color": "#007bff",
    "created_at": "2025-01-19T16:00:00.000000Z"
  }
}
```

### GET /blog/categories/{id}
Получение конкретной категории.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "SEO и Маркетинг",
    "slug": "seo-i-marketing",
    "description": "Статьи о поисковой оптимизации и маркетинге",
    "meta_title": "SEO и Маркетинг | ProHelper Blog",
    "meta_description": "Советы по SEO-оптимизации и маркетинговые стратегии для бизнеса",
    "color": "#007bff",
    "image": "/storage/blog/categories/seo-marketing.jpg",
    "sort_order": 0,
    "is_active": true,
    "articles_count": 15,
    "published_articles_count": 12,
    "created_at": "2025-01-15T10:00:00.000000Z",
    "updated_at": "2025-01-19T14:30:00.000000Z"
  }
}
```

### PUT /blog/categories/{id}
Обновление категории.

**Тело запроса:** (аналогично POST, но все поля опциональны)
```json
{
  "name": "SEO и Маркетинг (обновлено)",
  "color": "#28a745"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Категория успешно обновлена",
  "data": {
    // полные данные категории
  }
}
```

### DELETE /blog/categories/{id}
Удаление категории.

**Ответ:**
```json
{
  "success": true,
  "message": "Категория успешно удалена"
}
```

### POST /blog/categories/reorder
Изменение порядка категорий.

**Тело запроса:**
```json
{
  "category_ids": [3, 1, 5, 2, 4]
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Порядок категорий изменен"
}
```

## 💬 Comments API

### GET /blog/comments
Получение списка комментариев.

**Параметры:**
- `status` - статус комментария (pending, approved, rejected, spam)
- `article_id` - ID статьи
- `per_page` - количество на странице (по умолчанию 20)
- `page` - номер страницы

**Пример запроса:**
```
GET /blog/comments?status=pending&per_page=20
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "article_id": 5,
      "parent_id": null,
      "author_name": "Иван Петров",
      "author_email": "ivan@example.com",
      "author_website": "https://example.com",
      "content": "Отличная статья! Много полезной информации.",
      "status": "approved",
      "approved_at": "2025-01-19T16:00:00.000000Z",
      "likes_count": 3,
      "is_approved": true,
      "is_root": true,
      "article": {
        "id": 5,
        "title": "Как создать SEO-оптимизированный блог",
        "slug": "kak-sozdat-seo-optimizirovannyj-blog"
      },
      "approved_by": {
        "id": 1,
        "name": "Администратор"
      },
      "created_at": "2025-01-19T15:45:00.000000Z",
      "updated_at": "2025-01-19T16:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 95
  }
}
```

### GET /blog/comments/{id}
Получение конкретного комментария.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "article_id": 5,
    "parent_id": null,
    "author_name": "Иван Петров",
    "author_email": "ivan@example.com",
    "author_website": "https://example.com",
    "content": "Отличная статья! Много полезной информации.",
    "status": "approved",
    "approved_at": "2025-01-19T16:00:00.000000Z",
    "likes_count": 3,
    "is_approved": true,
    "is_root": true,
    "article": {
      "id": 5,
      "title": "Как создать SEO-оптимизированный блог",
      "slug": "kak-sozdat-seo-optimizirovannyj-blog"
    },
    "replies": [
      {
        "id": 2,
        "author_name": "Мария Сидорова",
        "content": "Согласна, очень полезно!",
        "created_at": "2025-01-19T16:15:00.000000Z"
      }
    ],
    "approved_by": {
      "id": 1,
      "name": "Администратор"
    },
    "created_at": "2025-01-19T15:45:00.000000Z",
    "updated_at": "2025-01-19T16:00:00.000000Z"
  }
}
```

### PUT /blog/comments/{id}/status
Изменение статуса комментария.

**Тело запроса:**
```json
{
  "status": "approved"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Статус комментария изменен на 'одобрено'",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_at": "2025-01-19T16:00:00.000000Z"
  }
}
```

### DELETE /blog/comments/{id}
Удаление комментария.

**Ответ:**
```json
{
  "success": true,
  "message": "Комментарий удален"
}
```

### POST /blog/comments/bulk-status
Массовое изменение статуса комментариев.

**Тело запроса:**
```json
{
  "status": "approved",
  "comment_ids": [1, 2, 3, 4]
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Обновлено комментариев: 4",
  "data": {
    "updated_count": 4,
    "new_status": "approved"
  }
}
```

### GET /blog/comments-pending
Получение комментариев ожидающих модерации.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "author_name": "Новый пользователь",
      "content": "Интересная статья",
      "status": "pending",
      "created_at": "2025-01-19T17:00:00.000000Z",
      "article": {
        "id": 3,
        "title": "Основы контент-маркетинга"
      }
    }
  ]
}
```

### GET /blog/comments-recent
Получение последних комментариев.

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "author_name": "Последний комментатор",
      "content": "Только что оставленный комментарий",
      "status": "approved",
      "created_at": "2025-01-19T17:30:00.000000Z",
      "article": {
        "id": 1,
        "title": "Заголовок статьи"
      }
    }
  ]
}
```

### GET /blog/comments/stats
Получение статистики комментариев.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "pending": 12,
    "approved": 130,
    "rejected": 8,
    "spam": 6,
    "today": 8,
    "this_week": 45,
    "this_month": 156
  }
}
```

## 🔍 SEO API

### GET /blog/seo/settings
Получение SEO настроек.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "site_name": "ProHelper Blog",
    "site_description": "Блог о технологиях и бизнесе",
    "site_keywords": ["технологии", "бизнес", "seo"],
    "default_og_image": "/storage/blog/default-og.jpg",
    "auto_generate_meta_description": true,
    "meta_description_length": 160,
    "enable_breadcrumbs": true,
    "enable_structured_data": true,
    "enable_sitemap": true,
    "enable_rss": true,
    "robots_txt": "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/blog/sitemap.xml",
    "social_media_links": {
      "facebook": "https://facebook.com/prohelper",
      "twitter": "https://twitter.com/prohelper",
      "linkedin": "https://linkedin.com/company/prohelper"
    },
    "google_analytics_id": "GA-XXXXXXXX-X",
    "yandex_metrica_id": "12345678",
    "google_search_console_verification": "verification_code_here",
    "yandex_webmaster_verification": "verification_code_here",
    "created_at": "2025-01-15T10:00:00.000000Z",
    "updated_at": "2025-01-19T14:30:00.000000Z"
  }
}
```

### PUT /blog/seo/settings
Обновление SEO настроек.

**Тело запроса:**
```json
{
  "site_name": "ProHelper Blog",
  "site_description": "Обновленное описание блога",
  "auto_generate_meta_description": true,
  "enable_sitemap": true,
  "robots_txt": "User-agent: *\nAllow: /",
  "google_analytics_id": "GA-XXXXXXXX-X"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "SEO настройки обновлены",
  "data": {
    // полные данные настроек
  }
}
```

### GET /blog/seo/sitemap
Генерация XML sitemap.

**Ответ:** (Content-Type: application/xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/blog/kak-sozdat-seo-optimizirovannyj-blog</loc>
    <lastmod>2025-01-19T15:30:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### GET /blog/seo/rss
Генерация RSS ленты.

**Ответ:** (Content-Type: application/rss+xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ProHelper Blog</title>
    <description>Блог о технологиях и бизнесе</description>
    <link>https://example.com/blog</link>
    <item>
      <title>Как создать SEO-оптимизированный блог</title>
      <description>Краткое описание статьи</description>
      <link>https://example.com/blog/kak-sozdat-seo-optimizirovannyj-blog</link>
      <pubDate>Sun, 19 Jan 2025 15:30:00 +0000</pubDate>
    </item>
  </channel>
</rss>
```

### GET /blog/seo/robots
Генерация robots.txt.

**Ответ:** (Content-Type: text/plain)
```
User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://example.com/blog/sitemap.xml
```

### GET /blog/seo/preview/sitemap
Предпросмотр sitemap в JSON формате.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "urls": [
      {
        "loc": "https://example.com/blog/kak-sozdat-seo-optimizirovannyj-blog",
        "lastmod": "2025-01-19T15:30:00+00:00",
        "changefreq": "weekly",
        "priority": "0.8"
      }
    ],
    "total_urls": 32
  }
}
```

### GET /blog/seo/preview/rss
Предпросмотр RSS в JSON формате.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "channel": {
      "title": "ProHelper Blog",
      "description": "Блог о технологиях и бизнесе",
      "link": "https://example.com/blog"
    },
    "items": [
      {
        "title": "Как создать SEO-оптимизированный блог",
        "description": "Краткое описание статьи",
        "link": "https://example.com/blog/kak-sozdat-seo-optimizirovannyj-blog",
        "pubDate": "Sun, 19 Jan 2025 15:30:00 +0000"
      }
    ],
    "total_items": 15
  }
}
```

### GET /blog/seo/preview/robots
Предпросмотр robots.txt.

**Ответ:**
```json
{
  "success": true,
  "data": {
    "content": "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/blog/sitemap.xml",
    "rules": [
      {
        "directive": "User-agent",
        "value": "*"
      },
      {
        "directive": "Allow",
        "value": "/"
      },
      {
        "directive": "Disallow",
        "value": "/admin/"
      },
      {
        "directive": "Sitemap",
        "value": "https://example.com/blog/sitemap.xml"
      }
    ]
  }
}
```

## ❌ Обработка ошибок

### Стандартные коды ошибок
- `400` - Неверные данные запроса
- `401` - Не авторизован
- `403` - Доступ запрещен  
- `404` - Ресурс не найден
- `422` - Ошибка валидации
- `500` - Внутренняя ошибка сервера

### Пример ошибки валидации (422)
```json
{
  "success": false,
  "message": "Ошибка валидации",
  "errors": {
    "title": ["Заголовок статьи обязателен"],
    "category_id": ["Выбранная категория не существует"],
    "meta_title": ["Meta заголовок не должен превышать 60 символов"]
  }
}
```

### Пример ошибки авторизации (401)
```json
{
  "success": false,
  "message": "Не авторизован",
  "error": "Unauthenticated"
}
```

### Пример ошибки доступа (403)
```json
{
  "success": false,
  "message": "Доступ запрещен",
  "error": "У вас нет прав для выполнения этого действия"
}
```

### Пример ошибки "Не найдено" (404)
```json
{
  "success": false,
  "message": "Ресурс не найден",
  "error": "Статья с ID 999 не найдена"
}
``` 