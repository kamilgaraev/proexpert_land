// Типы для модуля управления сайтами холдингов

export interface HoldingSite {
  id: number;
  holding_id: number;
  domain: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'disabled';
  template_id: number;
  theme_config: ThemeConfig;
  seo_meta?: SeoMeta;
  analytics_config?: AnalyticsConfig;
  url: string;
  preview_url: string;
  is_published: boolean;
  last_updated: string;
  created_at: string;
  blocks_count: number;
  assets_count: number;
  logo?: SiteAsset;
}

export interface SiteContentBlock {
  id: number;
  site_id: number;
  block_type: BlockType;
  key: string;
  title: string;
  content: BlockContent;
  settings: BlockSettings;
  sort_order: number;
  is_active: boolean;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  schema: BlockSchema;
  can_delete: boolean;
}

export type BlockType = 
  | 'hero' 
  | 'about' 
  | 'contacts' 
  | 'projects' 
  | 'services' 
  | 'team' 
  | 'gallery' 
  | 'news' 
  | 'custom';

export interface BlockContent {
  [key: string]: any;
}

// Схемы для различных типов блоков
export interface HeroBlockContent {
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  background_image?: SiteAsset;
}

export interface AboutBlockContent {
  title?: string;
  description: string; // HTML content
  image?: SiteAsset;
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
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

export interface ProjectsBlockContent {
  title?: string;
  description?: string;
  show_count?: number;
  projects?: Array<{
    id: number;
    title: string;
    description: string;
    image?: SiteAsset;
    url?: string;
  }>;
}

export interface ServicesBlockContent {
  title?: string;
  description?: string;
  services?: Array<{
    title: string;
    description: string;
    price?: string;
    icon?: string;
    image?: SiteAsset;
  }>;
}

export interface TeamBlockContent {
  title?: string;
  description?: string;
  members?: Array<{
    name: string;
    position: string;
    description?: string;
    image?: SiteAsset;
    social_links?: {
      email?: string;
      phone?: string;
      linkedin?: string;
      telegram?: string;
    };
  }>;
}

export interface GalleryBlockContent {
  title?: string;
  description?: string;
  images?: SiteAsset[];
}

export interface NewsBlockContent {
  title?: string;
  description?: string;
  articles?: Array<{
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    image?: SiteAsset;
    published_at: string;
    url?: string;
  }>;
}

export interface CustomBlockContent {
  [key: string]: any;
}

export interface BlockSettings {
  background_color?: string;
  text_color?: string;
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  margin?: {
    top?: number;
    bottom?: number;
  };
  animation?: {
    type?: string;
    duration?: number;
    delay?: number;
  };
  responsive?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
  css_classes?: string[];
  custom_css?: string;
}

export interface BlockSchema {
  type: BlockType;
  required_fields: string[];
  optional_fields: string[];
  field_types: {
    [key: string]: 'string' | 'text' | 'html' | 'number' | 'boolean' | 'image' | 'url' | 'email' | 'array' | 'object';
  };
  validation_rules?: {
    [key: string]: any;
  };
}

export interface SiteAsset {
  id: number;
  site_id: number;
  filename: string;
  original_filename: string;
  public_url: string;
  optimized_url?: string;
  mime_type: string;
  file_size: number;
  human_size: string;
  asset_type: 'image' | 'document' | 'video' | 'other';
  usage_context?: string;
  metadata: AssetMetadata;
  is_optimized: boolean;
  uploaded_at: string;
  uploader: {
    id: number;
    name: string;
  };
  optimized_versions?: OptimizedVersion[];
}

export interface AssetMetadata {
  alt_text?: string;
  caption?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface OptimizedVersion {
  size: 'thumbnail' | 'small' | 'medium' | 'large';
  url: string;
  width: number;
  height: number;
  file_size: number;
}

export interface SiteTemplate {
  id: number;
  template_key: string;
  name: string;
  description: string;
  preview_image: string;
  is_premium: boolean;
  default_blocks: BlockType[];
  theme_config: ThemeConfig;
  features: string[];
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  header_style: 'default' | 'transparent' | 'fixed';
  footer_style: 'default' | 'minimal' | 'extended';
  button_style: 'default' | 'rounded' | 'square';
  layout_width: 'full' | 'boxed';
  custom_css?: string;
}

export interface SeoMeta {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
}

export interface AnalyticsConfig {
  google_analytics_id?: string;
  yandex_metrika_id?: string;
  facebook_pixel_id?: string;
  custom_scripts?: Array<{
    name: string;
    script: string;
    position: 'head' | 'body_start' | 'body_end';
  }>;
}

// API Request/Response типы
export interface CreateSiteRequest {
  title: string;
  description?: string;
  template_id: number;
  theme_config?: Partial<ThemeConfig>;
  domain: string;
  logo?: File;
}

export interface UpdateSiteRequest {
  title?: string;
  description?: string;
  theme_config?: Partial<ThemeConfig>;
  seo_meta?: Partial<SeoMeta>;
  analytics_config?: Partial<AnalyticsConfig>;
}

export interface CreateBlockRequest {
  block_type: BlockType;
  title: string;
  content: BlockContent;
  settings?: Partial<BlockSettings>;
  sort_order?: number;
}

export interface UpdateBlockRequest {
  title?: string;
  content?: BlockContent;
  settings?: Partial<BlockSettings>;
  sort_order?: number;
  is_active?: boolean;
}

export interface ReorderBlocksRequest {
  block_order: number[];
}

export interface UploadAssetRequest {
  file: File;
  usage_context?: string;
}

export interface UpdateAssetRequest {
  metadata: Partial<AssetMetadata>;
}

// Ответы API
export interface SiteListResponse {
  success: boolean;
  data: HoldingSite[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface SiteDetailResponse {
  success: boolean;
  data: HoldingSite & {
    blocks: SiteContentBlock[];
    assets: SiteAsset[];
    template: SiteTemplate;
  };
}

export interface BlockListResponse {
  success: boolean;
  data: SiteContentBlock[];
}

export interface AssetListResponse {
  success: boolean;
  data: SiteAsset[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface TemplateListResponse {
  success: boolean;
  data: SiteTemplate[];
}

export interface PublicSiteResponse {
  success: boolean;
  data: {
    site: HoldingSite;
    blocks: Array<SiteContentBlock & { published_content: BlockContent }>;
    assets: SiteAsset[];
  };
}

export interface PublishResponse {
  success: boolean;
  message: string;
  errors?: string[];
  published_url?: string;
}

// Типы для валидации
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResponse {
  success: boolean;
  errors: ValidationError[];
}

// Типы для фильтров и поиска
export interface SiteFilters {
  status?: 'draft' | 'published' | 'disabled';
  template_id?: number;
  search?: string;
}

export interface AssetFilters {
  asset_type?: 'image' | 'document' | 'video' | 'other';
  usage_context?: string;
  search?: string;
}

export interface BlockFilters {
  block_type?: BlockType;
  status?: 'draft' | 'published';
  is_active?: boolean;
}
