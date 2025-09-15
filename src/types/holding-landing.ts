/**
 * Типы данных для модуля лендингов холдингов
 */

// Основной лендинг холдинга
export interface HoldingLanding {
  id: number;
  holding_id: number;
  domain: string;
  title: string;
  description?: string;
  logo_url?: string;
  favicon_url?: string;
  theme_config: ThemeConfig;
  seo_meta: SeoMeta;
  analytics_config?: AnalyticsConfig;
  status: 'draft' | 'published';
  url: string;
  preview_url: string;
  is_published: boolean;
  blocks?: LandingBlock[];
  assets_count: number;
  created_at: string;
  updated_at: string;
}

// Блок контента лендинга
export interface LandingBlock {
  id: number;
  landing_id: number;
  type: BlockType;
  key: string;
  title: string;
  content: BlockContent;
  settings: BlockSettings;
  sort_order: number;
  is_active: boolean;
  status: 'draft' | 'published';
  published_at?: string;
  schema: BlockSchema;
  can_delete: boolean;
}

// Медиафайл лендинга
export interface LandingAsset {
  id: number;
  landing_id: number;
  filename: string;
  public_url: string;
  optimized_url: OptimizedUrls;
  mime_type: string;
  file_size: number;
  human_size: string;
  asset_type: 'image' | 'video' | 'document';
  usage_context: AssetUsageContext;
  metadata: AssetMetadata;
  is_optimized: boolean;
  uploaded_at: string;
  uploader: {
    id: number;
    name: string;
  };
}

// Типы блоков
export type BlockType = 
  | 'hero'
  | 'about'
  | 'services'
  | 'projects'
  | 'team'
  | 'contacts'
  | 'testimonials'
  | 'gallery'
  | 'news'
  | 'custom';

// Контексты использования медиафайлов
export type AssetUsageContext = 
  | 'hero'
  | 'logo'
  | 'gallery'
  | 'about'
  | 'team'
  | 'projects'
  | 'favicon'
  | 'general';

// Конфигурация темы
export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  font_size_base: string;
  border_radius: string;
  shadow_style: string;
}

// SEO метаданные
export interface SeoMeta {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

// Конфигурация аналитики
export interface AnalyticsConfig {
  google_analytics_id?: string;
  yandex_metrika_id?: string;
  facebook_pixel_id?: string;
}

// Оптимизированные URL изображений
export interface OptimizedUrls {
  thumbnail: string; // 150x150
  small: string;     // 300x300
  medium: string;    // 600x600
  large: string;     // 1200x1200
  original: string;
}

// Метаданные медиафайла
export interface AssetMetadata {
  alt_text?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  duration?: number; // для видео
}

// Контент блоков (union type для разных типов блоков)
export type BlockContent = 
  | HeroBlockContent
  | AboutBlockContent
  | ServicesBlockContent
  | ProjectsBlockContent
  | TeamBlockContent
  | ContactsBlockContent
  | TestimonialsBlockContent
  | GalleryBlockContent
  | NewsBlockContent
  | CustomBlockContent;

// Настройки блоков
export interface BlockSettings {
  background_color?: string;
  background_image?: string;
  padding?: string;
  margin?: string;
  text_align?: 'left' | 'center' | 'right';
  animation?: string;
  custom_css?: string;
}

// Схемы блоков
export interface BlockSchema {
  fields: SchemaField[];
  validation_rules: ValidationRule[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'text' | 'html' | 'image' | 'url' | 'email' | 'number' | 'array' | 'coordinates';
  required: boolean;
  default?: any;
  options?: string[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

// Схемы контента для каждого типа блока
export interface HeroBlockContent {
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  background_image?: string;
}

export interface AboutBlockContent {
  title?: string;
  description: string; // HTML
  image?: string;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface ServicesBlockContent {
  title?: string;
  description?: string;
  services?: Array<{
    title: string;
    description: string;
    icon?: string;
    price?: string;
    features?: string[];
  }>;
}

export interface ProjectsBlockContent {
  title?: string;
  description?: string;
  show_count?: number;
  projects?: Array<{
    title: string;
    description: string;
    image?: string;
    url?: string;
    tags?: string[];
    date?: string;
  }>;
}

export interface TeamBlockContent {
  title?: string;
  description?: string;
  members?: Array<{
    name: string;
    position: string;
    photo?: string;
    description?: string;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      email?: string;
    };
  }>;
}

export interface ContactsBlockContent {
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  working_hours?: string;
  map_coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TestimonialsBlockContent {
  title?: string;
  description?: string;
  testimonials?: Array<{
    name: string;
    position?: string;
    company?: string;
    text: string;
    photo?: string;
    rating?: number;
  }>;
}

export interface GalleryBlockContent {
  title?: string;
  description?: string;
  images?: Array<{
    url: string;
    alt?: string;
    caption?: string;
    title?: string;
  }>;
}

export interface NewsBlockContent {
  title?: string;
  description?: string;
  articles?: Array<{
    title: string;
    excerpt: string;
    content?: string;
    image?: string;
    date: string;
    author?: string;
    url?: string;
  }>;
}

export interface CustomBlockContent {
  [key: string]: any;
}

// Запросы для API
export interface UpdateLandingRequest {
  title?: string;
  description?: string;
  theme_config?: Partial<ThemeConfig>;
  seo_meta?: Partial<SeoMeta>;
  analytics_config?: Partial<AnalyticsConfig>;
}

export interface CreateBlockRequest {
  block_type: BlockType;
  title: string;
  content?: Partial<BlockContent>;
  settings?: Partial<BlockSettings>;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateBlockRequest {
  title?: string;
  content?: Partial<BlockContent>;
  settings?: Partial<BlockSettings>;
  sort_order?: number;
  is_active?: boolean;
}

export interface ReorderBlocksRequest {
  block_order: number[];
}

export interface UploadAssetRequest {
  file: File;
  usage_context?: AssetUsageContext;
  metadata?: Partial<AssetMetadata>;
}

export interface UpdateAssetRequest {
  metadata: Partial<AssetMetadata>;
}

// Фильтры
export interface LandingFilters {
  status?: 'draft' | 'published';
}

export interface BlockFilters {
  type?: BlockType;
  status?: 'draft' | 'published';
  is_active?: boolean;
}

export interface AssetFilters {
  asset_type?: 'image' | 'video' | 'document';
  usage_context?: AssetUsageContext;
}

// Ответы API
export interface LandingResponse {
  success: boolean;
  data: HoldingLanding;
  message?: string;
}

export interface BlockResponse {
  success: boolean;
  data: LandingBlock;
  message?: string;
}

export interface BlocksResponse {
  success: boolean;
  data: LandingBlock[];
  message?: string;
}

export interface AssetResponse {
  success: boolean;
  data: LandingAsset;
  message?: string;
}

export interface AssetsResponse {
  success: boolean;
  data: LandingAsset[];
  message?: string;
}

export interface PublishResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    published_at: string;
  };
}
