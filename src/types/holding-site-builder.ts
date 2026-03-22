export type BuilderBlockType =
  | 'hero'
  | 'stats'
  | 'about'
  | 'services'
  | 'projects'
  | 'team'
  | 'testimonials'
  | 'gallery'
  | 'faq'
  | 'lead_form'
  | 'contacts'
  | 'custom_html';

export type SitePageType =
  | 'home'
  | 'about'
  | 'services'
  | 'projects'
  | 'blog_index'
  | 'blog_post'
  | 'contacts'
  | 'custom';

export type BindingMode = 'manual' | 'auto' | 'hybrid';
export type CollaboratorRole = 'owner' | 'editor' | 'publisher' | 'viewer';

export interface BlockBindingConfig {
  mode: BindingMode;
  source?: string;
  override?: unknown;
  fallback?: unknown;
}

export type BlockBindings = Record<string, BlockBindingConfig>;

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
  surface_style?: string;
  container_width?: string;
  section_spacing?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical?: string | null;
  noindex?: boolean;
}

export interface PublicationState {
  status: 'draft' | 'published' | 'maintenance';
  is_published: boolean;
  published_at?: string | null;
  preview_url: string;
  public_url: string;
  has_snapshot: boolean;
}

export interface BuilderSummary {
  blocks_count: number;
  active_blocks_count: number;
  assets_count: number;
  leads_count: number;
  pages_count?: number;
  collaborators_count?: number;
  blog_articles_count?: number;
  last_published_at?: string | null;
}

export interface SectionPreset {
  id: string;
  name: string;
  description: string;
  blocks: BuilderBlockType[];
}

export interface PageTemplatePreset {
  id: string;
  name: string;
  description: string;
  pages: Array<{
    page_type: SitePageType;
    slug: string;
    title: string;
  }>;
}

export interface EditorSite {
  id: number;
  organization_group_id: number;
  domain: string;
  default_locale: string;
  enabled_locales: string[];
  title: string;
  description: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  theme_config: ThemeConfig;
  seo_meta: SeoMeta;
  analytics_config: Record<string, unknown>;
  status: 'draft' | 'published' | 'maintenance';
  is_active: boolean;
  is_published: boolean;
  published_at?: string | null;
  url: string;
  preview_url: string;
  lead_endpoint: string;
  current_locale?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetUploader {
  id?: number | null;
  name?: string | null;
}

export interface AssetUsageItem {
  type: string;
  field?: string;
  field_path?: string;
  block_id?: number;
  block_key?: string;
  block_type?: string;
}

export interface EditorAsset {
  id: number;
  filename: string;
  public_url: string;
  optimized_url: Record<string, string>;
  mime_type: string;
  file_size: number;
  human_size: string;
  asset_type: string;
  usage_context: string | null;
  metadata: Record<string, unknown>;
  is_optimized: boolean;
  uploaded_at: string;
  uploader: AssetUploader;
  usage_map?: AssetUsageItem[];
  safe_delete?: boolean;
}

export interface BlockFieldSchema {
  type: 'string' | 'text' | 'html' | 'image' | 'url' | 'email' | 'number' | 'array';
  required?: boolean;
}

export interface EditorElement {
  id: string;
  type: 'text' | 'rich_text' | 'image' | 'button' | 'badge' | 'metric' | 'card' | 'repeater' | 'form' | 'divider' | 'spacer' | 'embed';
  label: string;
  path: string;
  props: Record<string, unknown>;
  bindings: BlockBindingConfig;
  style: Record<string, unknown>;
  responsive: Record<string, unknown>;
  animation: Record<string, unknown>;
}

export interface EditorSection {
  id: number;
  page_id?: number | null;
  type: string;
  source_type: string;
  key: string;
  title: string;
  content: Record<string, unknown>;
  resolved_content: Record<string, unknown>;
  settings: Record<string, unknown>;
  bindings: BlockBindings;
  locale_content?: Record<string, Record<string, unknown>>;
  style_config?: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  status: 'draft' | 'published';
  published_at?: string | null;
  schema: Record<string, BlockFieldSchema>;
  default_content: Record<string, unknown>;
  can_delete: boolean;
  is_renderable: boolean;
  assets: EditorAsset[];
  elements: EditorElement[];
}

export interface EditorPage {
  id: number | string;
  page_type: SitePageType | string;
  slug: string;
  navigation_label?: string | null;
  title: string;
  description?: string | null;
  seo_meta: Partial<SeoMeta>;
  layout_config: Record<string, unknown>;
  locale_content: Record<string, Record<string, unknown>>;
  visibility: string;
  sort_order: number;
  is_home: boolean;
  is_active: boolean;
  sections: EditorSection[];
}

export interface EditorCollaborator {
  id: number;
  role: CollaboratorRole;
  user: {
    id?: number | null;
    name?: string | null;
    email?: string | null;
  };
  invited_by?: {
    id?: number | null;
    name?: string | null;
    email?: string | null;
  };
  created_at?: string | null;
}

export interface SiteRevision {
  id: number;
  kind: string;
  label?: string | null;
  created_at?: string | null;
  creator?: {
    id?: number | null;
    name?: string | null;
    email?: string | null;
  };
}

export interface SiteBlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[];
  status: string;
  published_at?: string | null;
  reading_time?: number | null;
  is_featured?: boolean;
  category?: {
    id?: number | null;
    name?: string | null;
    slug?: string | null;
  };
  author?: {
    id?: number | null;
    name?: string | null;
  };
}

export interface BuilderWorkspaceData {
  site: EditorSite;
  pages: EditorPage[];
  blocks: EditorSection[];
  assets: EditorAsset[];
  templates: SectionPreset[];
  page_templates?: PageTemplatePreset[];
  section_presets?: SectionPreset[];
  collaborators?: EditorCollaborator[];
  revisions?: SiteRevision[];
  blog?: {
    articles: SiteBlogArticle[];
    default_category?: {
      id?: number | null;
      name?: string | null;
    };
  };
  summary: BuilderSummary;
  publication: PublicationState;
}

export interface LeadSummary {
  total: number;
  new: number;
  spam: number;
  today: number;
  week: number;
  latest?: string | null;
}

export interface LeadEntry {
  id: number;
  page_id?: number | null;
  block_key?: string | null;
  section_key?: string | null;
  locale_code?: string | null;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  form_payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  utm_params: Record<string, unknown>;
  source_page?: string | null;
  source_url?: string | null;
  status: string;
  submitted_at?: string | null;
}

export interface PublicOrganizationPayload {
  holding: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
  };
  organization: {
    id?: number | null;
    name?: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
  };
}

export interface PublicNavigationItem {
  id: number | string;
  slug: string;
  label: string;
  page_type: string;
  is_home: boolean;
}

export interface PublicRuntimePayload {
  mode: string;
  lead_endpoint: string;
  generated_at: string;
  path?: string;
  locale?: string;
}

export interface PublicSitePayload {
  site: EditorSite;
  navigation?: PublicNavigationItem[];
  pages?: EditorPage[];
  page?: EditorPage | null;
  current_page?: EditorPage | null;
  blocks: EditorSection[];
  organization: PublicOrganizationPayload;
  blog?: {
    articles?: SiteBlogArticle[];
    current_article?: SiteBlogArticle | null;
  };
  runtime: PublicRuntimePayload;
}

export interface LeadSubmissionPayload {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  holding_site_page_id?: number;
  block_key?: string;
  section_key?: string;
  locale_code?: string;
  source_page?: string;
  source_url?: string;
  website?: string;
  metadata?: Record<string, unknown>;
  form_payload?: Record<string, unknown>;
}

export interface BuilderCanvasFocusTarget {
  blockId: number;
  pageId?: number | string;
  fieldPath?: string;
  intent?: 'block' | 'text' | 'image' | 'button' | 'collection' | 'page';
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
  errors?: unknown;
}

export type EditorBlock = EditorSection;
export type SiteTemplatePreset = SectionPreset;
