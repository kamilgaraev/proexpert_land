import type {
  BlockBindings,
  BuilderBlockType,
  EditorBlock,
  EditorElement,
  SiteTemplatePreset,
} from '@/types/holding-site-builder';

export interface BlockLibraryItem {
  type: BuilderBlockType;
  label: string;
  description: string;
  accent: string;
}

export const BLOCK_LIBRARY: BlockLibraryItem[] = [
  { type: 'hero', label: 'Главный баннер', description: 'Первый экран с оффером и CTA', accent: 'bg-blue-600' },
  { type: 'stats', label: 'Показатели', description: 'Цифры доверия и proof-блок', accent: 'bg-slate-700' },
  { type: 'about', label: 'О холдинге', description: 'Позиционирование и описание компании', accent: 'bg-emerald-600' },
  { type: 'services', label: 'Услуги', description: 'Основные направления и сервисы', accent: 'bg-amber-500' },
  { type: 'projects', label: 'Проекты и кейсы', description: 'Портфолио завершенных объектов', accent: 'bg-orange-500' },
  { type: 'team', label: 'Команда', description: 'Ключевые сотрудники и роли', accent: 'bg-violet-600' },
  { type: 'testimonials', label: 'Отзывы', description: 'Социальное доказательство', accent: 'bg-pink-500' },
  { type: 'gallery', label: 'Галерея', description: 'Фото работ и медиа', accent: 'bg-cyan-600' },
  { type: 'faq', label: 'FAQ', description: 'Ответы на частые вопросы', accent: 'bg-lime-600' },
  { type: 'lead_form', label: 'Лид-форма', description: 'Форма заявки и CTA по сценарию страницы', accent: 'bg-rose-600' },
  { type: 'contacts', label: 'Контакты', description: 'Телефон, email, адрес и график', accent: 'bg-indigo-600' },
  { type: 'custom_html', label: 'Custom HTML', description: 'Встраиваемый кастомный блок', accent: 'bg-neutral-700' },
];

export const ARRAY_ITEM_TEMPLATES: Record<string, Record<string, unknown>> = {
  'stats.items': { label: 'Показатель', value: '0' },
  'services.services': { title: 'Услуга', description: 'Описание услуги', features: [] },
  'projects.projects': {
    title: 'Проект',
    description: 'Описание проекта',
    location: '',
    budget: '',
    completed_at: '',
  },
  'team.members': { name: 'Участник команды', position: 'Роль', email: '' },
  'testimonials.items': { quote: 'Отзыв клиента', author: 'Имя клиента', role: 'Компания / должность' },
  'gallery.images': { url: '', alt: '', caption: '' },
  'faq.items': { question: 'Вопрос', answer: 'Ответ' },
};

export const FIELD_LABELS: Record<string, string> = {
  title: 'Заголовок',
  subtitle: 'Подзаголовок',
  description: 'Описание',
  button_text: 'Текст кнопки',
  button_url: 'Ссылка кнопки',
  background_image: 'Фон',
  items: 'Элементы',
  image: 'Изображение',
  services: 'Услуги',
  projects: 'Проекты',
  members: 'Команда',
  submit_label: 'Текст кнопки формы',
  success_message: 'Сообщение после отправки',
  phone: 'Телефон',
  email: 'Email',
  address: 'Адрес',
  working_hours: 'Часы работы',
  html: 'HTML-код',
  images: 'Изображения',
};

export const FALLBACK_TEMPLATES: SiteTemplatePreset[] = [
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Корпоративный one-page с доказательствами, кейсами и заявкой.',
    blocks: ['hero', 'stats', 'about', 'services', 'projects', 'team', 'lead_form', 'contacts'],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Сценарий с акцентом на кейсы, галерею и отзывы.',
    blocks: ['hero', 'stats', 'projects', 'gallery', 'testimonials', 'lead_form', 'contacts'],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Упрощенный конверсионный сценарий для быстрого запуска.',
    blocks: ['hero', 'services', 'faq', 'lead_form', 'contacts'],
  },
];

export const createBlockPayloadFromTemplate = (type: BuilderBlockType) => {
  const block = createFallbackBlock(type, Date.now());

  return {
    block_type: type,
    title: block.title,
    content: block.content,
    settings: block.settings,
    bindings: block.bindings,
    is_active: true,
  };
};

export const createFallbackBlock = (type: BuilderBlockType, id: number): EditorBlock => {
  const label = BLOCK_LIBRARY.find((item) => item.type === type)?.label ?? type;
  const content = getDefaultContent(type);
  const elements = Object.keys(getDefaultSchema(type)).map<EditorElement>((field) => ({
    id: `${type}:${field}`,
    type: field.includes('image') ? 'image' : field.includes('button') || field.includes('url') ? 'button' : 'text',
    label: field,
    path: `content.${field}`,
    props: { value: content[field] },
    bindings: getDefaultBindings(type)[field] ?? { mode: 'manual' },
    style: {},
    responsive: {},
    animation: {},
  }));

  return {
    id,
    page_id: null,
    type,
    source_type: type,
    key: `${type}_${id}`,
    title: label,
    content,
    resolved_content: content,
    settings: getDefaultSettings(type),
    bindings: getDefaultBindings(type),
    locale_content: {},
    style_config: {},
    sort_order: id,
    is_active: true,
    status: 'draft',
    published_at: null,
    schema: getDefaultSchema(type),
    default_content: content,
    can_delete: true,
    is_renderable: true,
    assets: [],
    elements,
  };
};

export const getDefaultContent = (type: BuilderBlockType): Record<string, unknown> => {
  switch (type) {
    case 'hero':
      return {
        title: '',
        subtitle: '',
        description: '',
        button_text: 'Оставить заявку',
        button_url: '#lead-form',
        background_image: '',
      };
    case 'stats':
      return { title: 'Показатели', description: '', items: [] };
    case 'about':
      return { title: 'О холдинге', description: '', image: '' };
    case 'services':
      return { title: 'Услуги', description: '', services: [] };
    case 'projects':
      return { title: 'Проекты и кейсы', description: '', projects: [], show_count: 6 };
    case 'team':
      return { title: 'Команда', description: '', members: [] };
    case 'testimonials':
      return { title: 'Отзывы', description: '', items: [] };
    case 'gallery':
      return { title: 'Галерея', description: '', images: [] };
    case 'faq':
      return { title: 'FAQ', description: '', items: [] };
    case 'lead_form':
      return {
        title: 'Обсудить проект',
        description: 'Оставьте контакты, и мы свяжемся с вами.',
        submit_label: 'Отправить заявку',
        success_message: 'Заявка отправлена.',
      };
    case 'contacts':
      return {
        title: 'Контакты',
        description: '',
        phone: '',
        email: '',
        address: '',
        working_hours: '',
      };
    case 'custom_html':
      return { html: '' };
  }
};

export const getDefaultBindings = (type: BuilderBlockType): BlockBindings => {
  switch (type) {
    case 'hero':
      return {
        title: { mode: 'hybrid', source: 'organization.name' },
        subtitle: { mode: 'hybrid', source: 'holding.description' },
        description: { mode: 'hybrid', source: 'organization.description' },
      };
    case 'stats':
      return {
        items: { mode: 'auto', source: 'metrics.stats_items' },
      };
    case 'about':
      return {
        description: { mode: 'hybrid', source: 'organization.description' },
      };
    case 'services':
      return {
        services: { mode: 'auto', source: 'services.items' },
      };
    case 'projects':
      return {
        projects: { mode: 'auto', source: 'projects.items' },
      };
    case 'team':
      return {
        members: { mode: 'auto', source: 'team.members' },
      };
    case 'contacts':
      return {
        phone: { mode: 'hybrid', source: 'contacts.phone' },
        email: { mode: 'hybrid', source: 'contacts.email' },
        address: { mode: 'hybrid', source: 'contacts.address' },
      };
    default:
      return {};
  }
};

export const getDefaultSettings = (type: BuilderBlockType): Record<string, unknown> => {
  switch (type) {
    case 'hero':
      return { variant: 'split', theme: 'primary' };
    case 'stats':
      return { variant: 'cards' };
    case 'lead_form':
      return { variant: 'card', anchor_id: 'lead-form' };
    default:
      return { variant: 'default' };
  }
};

export const getDefaultSchema = (type: BuilderBlockType): EditorBlock['schema'] => {
  switch (type) {
    case 'hero':
      return {
        title: { type: 'string', required: true },
        subtitle: { type: 'string' },
        description: { type: 'text' },
        button_text: { type: 'string' },
        button_url: { type: 'url' },
        background_image: { type: 'image' },
      };
    case 'stats':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        items: { type: 'array' },
      };
    case 'about':
      return {
        title: { type: 'string' },
        description: { type: 'html', required: true },
        image: { type: 'image' },
      };
    case 'services':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        services: { type: 'array' },
      };
    case 'projects':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        projects: { type: 'array' },
      };
    case 'team':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        members: { type: 'array' },
      };
    case 'testimonials':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        items: { type: 'array' },
      };
    case 'gallery':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        images: { type: 'array' },
      };
    case 'faq':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        items: { type: 'array' },
      };
    case 'lead_form':
      return {
        title: { type: 'string', required: true },
        description: { type: 'text' },
        submit_label: { type: 'string' },
        success_message: { type: 'string' },
      };
    case 'contacts':
      return {
        title: { type: 'string' },
        description: { type: 'text' },
        phone: { type: 'string' },
        email: { type: 'email' },
        address: { type: 'text' },
        working_hours: { type: 'string' },
      };
    case 'custom_html':
      return {
        html: { type: 'html' },
      };
  }
};
