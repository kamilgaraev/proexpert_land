# Современный конструктор сайта холдинга

## Цель

Перевести текущий builder из one-page набора блоков в рабочий multi-page конструктор для владельцев мультиорганизации:

- сайт строится как `Site -> Pages -> Sections -> Elements`;
- редактор работает с единым `LandingResponse` и единым workspace payload;
- черновик, preview, published snapshot и rollback разделены;
- публичный runtime рендерит production-layout без editor-chrome;
- блог, SEO, локали, лиды, медиатека и роли редакторов встроены в один модуль.

## Итоговая модель

### Site

`holding_sites` остаётся корневой сущностью и хранит:

- домен, title, description;
- `theme_config`, `seo_meta`, `analytics_config`;
- `default_locale`, `enabled_locales`;
- `published_payload`, `preview_token`, publication state.

### Pages

Новая таблица `holding_site_pages` хранит:

- `holding_site_id`;
- `page_type`;
- `slug`;
- `navigation_label`;
- `title`, `description`;
- `seo_meta`, `layout_config`, `locale_content`;
- `visibility`, `sort_order`, `is_home`, `is_active`.

Поддерживаемые типы страниц:

- `home`
- `about`
- `services`
- `projects`
- `blog_index`
- `blog_post`
- `contacts`
- `custom`

### Sections

`site_content_blocks` расширен до page-scoped sections:

- `holding_site_page_id`;
- `block_type` трактуется как `section_type`;
- `content` хранит контент секции;
- `content.elements[]` хранит вложенные элементы;
- `locale_content`, `style_config`, `bindings` работают на уровне секции и поля.

Поддерживаемые типы секций:

- `hero`
- `stats`
- `about`
- `services`
- `projects`
- `team`
- `testimonials`
- `gallery`
- `faq`
- `lead_form`
- `contacts`
- `custom_html`

### Elements

Элементы хранятся внутри `site_content_blocks.content.elements[]`:

- `text`
- `rich_text`
- `image`
- `button`
- `badge`
- `metric`
- `card`
- `repeater`
- `form`
- `divider`
- `spacer`
- `embed`

### Revisions

`holding_site_revisions` хранит историю публикаций:

- `holding_site_id`
- `kind`
- `label`
- `payload`
- `created_by_user_id`
- `created_at`

### Collaborators

`holding_site_collaborators` хранит site-level роли:

- `owner`
- `editor`
- `publisher`
- `viewer`

### Leads

`holding_site_leads` расширен page-aware полями:

- `holding_site_page_id`
- `section_key`
- `locale_code`

### Blog

Существующий blog module используется как site blog холдинга.

Расширения:

- `blog_articles.organization_group_id`
- `blog_categories.organization_group_id`
- `blog_tags.organization_group_id`

## Миграция совместимости

- Для каждого существующего сайта создаётся `home` page.
- Все текущие `site_content_blocks` привязываются к этой домашней странице.
- Старые `/site/blocks` endpoints сохраняются как legacy-алиас для секций `home` page.
- Существующий владелец сайта автоматически получает collaborator role `owner`.

## Workspace contract

`GET /api/v1/landing/holding/site`

```ts
interface BuilderWorkspaceData {
  site: EditorSite;
  pages: EditorPage[];
  blocks: EditorSection[];
  assets: EditorAsset[];
  templates: SectionPreset[];
  page_templates: PageTemplatePreset[];
  section_presets: SectionPreset[];
  collaborators: EditorCollaborator[];
  revisions: SiteRevision[];
  blog: {
    articles: SiteBlogArticle[];
    default_category?: { id?: number | null; name?: string | null };
  };
  summary: BuilderSummary;
  publication: PublicationState;
}
```

`blocks` остаётся для совместимости и всегда соответствует секциям домашней страницы.

## Editor UX

Редактор на `/landing/editor` строится как три зоны:

- слева: страницы, структура, шаблоны страниц, библиотека секций;
- по центру: visual canvas с inline selection;
- справа: inspector tabs `Контент`, `Страница`, `Сайт`, `Блог`, `Ревизии`.

Ключевые сценарии:

- создание и удаление страниц;
- reorder страниц и секций;
- добавление секций из curated library;
- inline click-to-edit по canvas;
- schema-driven inspector вместо JSON textarea;
- autosave для site/page/section;
- publish и rollback;
- blog CRUD;
- site-level locales и SEO;
- collaborator overview;
- device-aware preview canvas.

## Public runtime

Публичный runtime рендерит full-width production-layout:

- без общего editor-container;
- без preview chrome на боевом домене;
- с современными theme tokens;
- с page-aware navigation;
- с поддержкой `blog_index` и `blog_post`.

`SiteBuilderRenderer` используется и в editor preview, и в public runtime, но в разных `mode`.

## Publication model

### Draft

- Draft собирается из site, pages, sections, assets, blog и bindings.
- Editor canvas и preview используют live draft payload.
- Autosave работает отдельно для site, page и section.

### Publish

- Publish выполняется только на уровне сайта.
- Backend собирает `published_payload` через publication snapshot builder.
- Одновременно создаётся запись в `holding_site_revisions`.
- Public runtime читает только published snapshot.

### Rollback

- Rollback берёт payload из выбранной revision.
- `holding_sites.published_payload` и publication state обновляются атомарно.

### Preview

- Preview работает по `?preview=true&token=...`.
- Preview всегда читает live draft.
- Public mode не показывает preview badge, если режим не preview.

## Data bindings

Binding работает на уровне поля/элемента:

```ts
interface BlockBindingConfig {
  mode: 'manual' | 'auto' | 'hybrid';
  source?: string;
  override?: unknown;
  fallback?: unknown;
}
```

Источники:

- `holding.*`
- `organization.*`
- `contacts.*`
- `metrics.*`
- `projects.*`
- `team.*`
- `services.*`

Режимы:

- `manual`: публикуется ручное значение;
- `auto`: приоритет `override -> source -> current value`;
- `hybrid`: приоритет `current value -> override -> source`;
- `fallback`: используется, если финальное значение пустое.

## Authenticated API

### Site

- `GET /api/v1/landing/holding/site`
- `PUT /api/v1/landing/holding/site`
- `POST /api/v1/landing/holding/site/publish`

### Pages

- `GET /api/v1/landing/holding/site/pages`
- `POST /api/v1/landing/holding/site/pages`
- `PUT /api/v1/landing/holding/site/pages/{pageId}`
- `DELETE /api/v1/landing/holding/site/pages/{pageId}`
- `PUT /api/v1/landing/holding/site/pages/reorder`

### Sections

- `GET /api/v1/landing/holding/site/pages/{pageId}/sections`
- `POST /api/v1/landing/holding/site/pages/{pageId}/sections`
- `PUT /api/v1/landing/holding/site/pages/{pageId}/sections/{sectionId}`
- `DELETE /api/v1/landing/holding/site/pages/{pageId}/sections/{sectionId}`
- `PUT /api/v1/landing/holding/site/pages/{pageId}/sections/reorder`
- `POST /api/v1/landing/holding/site/sections/{sectionId}/duplicate`

### Revisions

- `GET /api/v1/landing/holding/site/revisions`
- `POST /api/v1/landing/holding/site/rollback/{revisionId}`

### Collaborators

- `GET /api/v1/landing/holding/site/collaborators`
- `POST /api/v1/landing/holding/site/collaborators`
- `PUT /api/v1/landing/holding/site/collaborators/{collaboratorId}`
- `DELETE /api/v1/landing/holding/site/collaborators/{collaboratorId}`

### Blog

- `GET /api/v1/landing/holding/site/blog/articles`
- `POST /api/v1/landing/holding/site/blog/articles`
- `PUT /api/v1/landing/holding/site/blog/articles/{articleId}`
- `DELETE /api/v1/landing/holding/site/blog/articles/{articleId}`

### Assets

- `GET /api/v1/landing/holding/site/assets`
- `POST /api/v1/landing/holding/site/assets`
- `PUT /api/v1/landing/holding/site/assets/{assetId}`
- `DELETE /api/v1/landing/holding/site/assets/{assetId}`

### Leads

- `GET /api/v1/landing/holding/site/leads`
- `GET /api/v1/landing/holding/site/leads/summary`

## Public runtime API

- `GET /api/v1/landing/holding/public/site-data?path=/services`
- `GET /api/v1/landing/holding/public/site-data?preview=true&token=...&path=/services`
- `POST /api/v1/landing/holding/public/site-leads`

`site-data` возвращает:

- site meta;
- navigation;
- current page;
- sections tree;
- page-aware SEO payload;
- organization context;
- blog context;
- runtime metadata.

## Права

Входной permission contour:

- `multi-organization.website.view`
- `multi-organization.website.edit`
- `multi-organization.website.publish`
- `multi-organization.website.assets.upload`
- `multi-organization.website.assets.manage`
- `multi-organization.website.templates.access`

Site collaborator role применяется поверх coarse permissions:

- owner bypass для управления сайтом;
- editor может менять draft, но не publish;
- publisher может publish и rollback;
- viewer видит сайт, лиды и ревизии без редактирования.

## Проверки

### Frontend

- `npx tsc --noEmit`
- `npx vitest run`

### Backend

- `php -l` по изменённым PHP-файлам
- `vendor/bin/phpstan analyse ... --memory-limit=1G` по изменённым файлам builder-модуля

## Критерии готовности

- сайт стал multi-page builder, а не набором flat blocks;
- editor работает через единый workspace store;
- publish создаёт revision и published snapshot;
- public runtime page-aware и full-width;
- blog встроен в site runtime;
- локали и SEO управляются на уровне сайта и страницы;
- lead submissions сохраняют page/section context;
- collaborator model используется как site-level workflow layer;
- legacy `/site/blocks` контракт продолжает работать для домашней страницы.
