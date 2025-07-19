# Модуль блога ProHelper

Полнофункциональная система управления блогом с административной панелью и публичным интерфейсом.

## Структура

### Административная панель (`/admin/blog`)
- **Dashboard** - Аналитика и обзор блога
- **Статьи** - Управление статьями (создание, редактирование, удаление)
- **Категории** - Управление категориями с drag & drop сортировкой
- **Комментарии** - Модерация комментариев
- **SEO** - Настройки SEO, robots.txt, sitemap

### Публичная часть (`/blog`)
- **Главная блога** - Список статей с фильтрацией и поиском
- **Страница статьи** - Полное отображение статьи с комментариями
- **Страница категории** - Статьи определенной категории
- **Страница тега** - Статьи по тегу
- **Sidebar** - Поиск, категории, популярные статьи, подписка

## Компоненты

### Административные компоненты
```
src/components/blog/
├── BlogDashboard.tsx          # Дашборд с аналитикой
├── articles/
│   ├── BlogArticlesList.tsx   # Список статей
│   └── BlogArticleEditor.tsx  # Редактор статей
├── categories/
│   └── BlogCategoriesManager.tsx  # Управление категориями
├── comments/
│   └── BlogCommentsModeration.tsx # Модерация комментариев
└── seo/
    └── BlogSEOSettings.tsx    # SEO настройки
```

### Публичные компоненты
```
src/components/blog/public/
├── BlogPublicLayout.tsx       # Layout для публичной части
├── BlogPublicPage.tsx         # Главная страница блога
├── BlogArticlePage.tsx        # Страница статьи
├── BlogCategoryPage.tsx       # Страница категории
├── BlogTagPage.tsx            # Страница тега
├── BlogArticleCard.tsx        # Карточка статьи
└── BlogSidebar.tsx           # Sidebar блога
```

## API

### Административный API (`src/utils/blogApi.ts`)
- Управление статьями, категориями, комментариями
- Аналитика и статистика
- SEO настройки

### Публичный API (`src/utils/blogPublicApi.ts`)
- Получение опубликованных статей
- Поиск и фильтрация
- Популярные и связанные статьи

## Типы данных

```typescript
// Основные типы в src/types/blog.ts
interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  category: BlogCategory;
  tags?: BlogTag[];
  author: BlogAuthor;
  // ... другие поля
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  sort_order: number;
  // ... другие поля
}
```

## Маршруты

### Публичные маршруты
- `/blog` - Главная блога
- `/blog/:slug` - Страница статьи
- `/blog/category/:slug` - Страница категории
- `/blog/tag/:slug` - Страница тега

### Административные маршруты
- `/admin/blog` - Дашборд
- `/admin/blog/articles` - Список статей
- `/admin/blog/articles/create` - Создание статьи
- `/admin/blog/articles/:id/edit` - Редактирование статьи
- `/admin/blog/categories` - Управление категориями
- `/admin/blog/comments` - Модерация комментариев
- `/admin/blog/seo` - SEO настройки

## Особенности

### Административная панель
- **Rich Text Editor** - Для создания и редактирования статей
- **Drag & Drop** - Сортировка категорий
- **Bulk Actions** - Массовые операции со статьями
- **SEO оптимизация** - Управление meta-тегами, sitemap, robots.txt
- **Аналитика** - Статистика просмотров, популярные статьи

### Публичная часть
- **Responsive дизайн** - Адаптивная верстка
- **Поиск и фильтрация** - По категориям, тегам, ключевым словам
- **Infinite scroll** - Подгрузка статей
- **SEO friendly** - Breadcrumbs, meta-теги, структурированные данные
- **Социальные функции** - Лайки, поделиться, комментарии

## Стилизация

Блог использует Tailwind CSS с кастомными классами для контента:

```css
.blog-content {
  /* Стили для отображения HTML контента статей */
}

.line-clamp-2, .line-clamp-3 {
  /* Обрезка текста */
}
```

## Интеграция

Блог интегрирован в основное приложение через:
- **Роуты** в `src/App.tsx`
- **Навигация** в `src/layouts/AdminLayout.tsx`
- **API сервисы** для взаимодействия с бэкендом

## Расширение

Для добавления новых функций:
1. Обновите типы в `src/types/blog.ts`
2. Добавьте API методы в `blogApi.ts` или `blogPublicApi.ts`
3. Создайте компоненты в соответствующих папках
4. Обновите роуты в `App.tsx` 