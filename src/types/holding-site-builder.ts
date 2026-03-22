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

export type BindingMode = 'manual' | 'auto' | 'hybrid';

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
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
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
  last_published_at?: string | null;
}

export interface SiteTemplatePreset {
  id: string;
  name: string;
  description: string;
  blocks: BuilderBlockType[];
}

export interface EditorSite {
  id: number;
  organization_group_id: number;
  domain: string;
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

export interface EditorBlock {
  id: number;
  type: string;
  source_type: string;
  key: string;
  title: string;
  content: Record<string, unknown>;
  resolved_content: Record<string, unknown>;
  settings: Record<string, unknown>;
  bindings: BlockBindings;
  sort_order: number;
  is_active: boolean;
  status: 'draft' | 'published';
  published_at?: string | null;
  schema: Record<string, BlockFieldSchema>;
  default_content: Record<string, unknown>;
  can_delete: boolean;
  is_renderable: boolean;
  assets: EditorAsset[];
}

export interface BuilderCanvasFocusTarget {
  blockId: number;
  fieldPath?: string;
  intent?: 'block' | 'text' | 'image' | 'button' | 'collection';
}

export interface BuilderWorkspaceData {
  site: EditorSite;
  blocks: EditorBlock[];
  assets: EditorAsset[];
  templates: SiteTemplatePreset[];
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
  block_key?: string | null;
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

export interface PublicRuntimePayload {
  mode: string;
  lead_endpoint: string;
  generated_at: string;
}

export interface PublicSitePayload {
  site: EditorSite;
  blocks: Array<{
    id: number;
    type: string;
    key: string;
    title: string;
    content: Record<string, unknown>;
    settings: Record<string, unknown>;
    sort_order: number;
    assets: EditorAsset[];
  }>;
  organization: PublicOrganizationPayload;
  runtime: PublicRuntimePayload;
}

export interface LeadSubmissionPayload {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  block_key?: string;
  source_page?: string;
  source_url?: string;
  website?: string;
  metadata?: Record<string, unknown>;
  form_payload?: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
  errors?: unknown;
}
