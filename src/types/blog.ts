export interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  gallery_images?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  structured_data?: any;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at?: string;
  scheduled_at?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  reading_time: number;
  estimated_reading_time: number;
  is_featured: boolean;
  allow_comments: boolean;
  is_published_in_rss: boolean;
  noindex: boolean;
  sort_order: number;
  url: string;
  is_published: boolean;
  readable_published_at?: string;
  category: BlogCategory;
  author: BlogAuthor;
  tags: BlogTag[];
  comments?: BlogComment[];
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  color: string;
  image?: string;
  sort_order: number;
  is_active: boolean;
  articles_count?: number;
  published_articles_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogComment {
  id: number;
  article_id: number;
  parent_id?: number;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  approved_at?: string;
  likes_count: number;
  is_approved: boolean;
  is_root: boolean;
  article?: {
    id: number;
    title: string;
    slug: string;
  };
  replies?: BlogComment[];
  approved_by?: BlogAuthor;
  created_at: string;
  updated_at: string;
}

export interface BlogAuthor {
  id: number;
  name: string;
  email: string;
}

export interface BlogSEOSettings {
  id: number;
  site_name: string;
  site_description?: string;
  site_keywords?: string[];
  default_og_image?: string;
  auto_generate_meta_description: boolean;
  meta_description_length: number;
  enable_breadcrumbs: boolean;
  enable_structured_data: boolean;
  enable_sitemap: boolean;
  enable_rss: boolean;
  robots_txt?: string;
  social_media_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  google_analytics_id?: string;
  yandex_metrica_id?: string;
  google_search_console_verification?: string;
  yandex_webmaster_verification?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogDashboardOverview {
  articles: {
    total: number;
    published: number;
    drafts: number;
    scheduled: number;
  };
  categories: {
    total: number;
    active: number;
  };
  tags: {
    total: number;
    active: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
  };
  popular_articles: BlogArticle[];
  recent_articles: BlogArticle[];
  recent_comments: BlogComment[];
}

export interface BlogAnalytics {
  articles_by_date: Array<{ date: string; count: number }>;
  comments_by_date: Array<{ date: string; count: number }>;
  views_by_date: Array<{ date: string; total_views: number }>;
  categories_stats: Array<{
    id: number;
    name: string;
    published_articles_count: number;
  }>;
  top_articles: BlogArticle[];
}

export interface BlogQuickStats {
  today_vs_yesterday: {
    articles: { today: number; yesterday: number; change_percent: number };
    views: { today: number; yesterday: number; change_percent: number };
    comments: { today: number; yesterday: number; change_percent: number };
  };
  this_month_vs_last: {
    articles: { this_month: number; last_month: number; change_percent: number };
    views: { this_month: number; last_month: number; change_percent: number };
  };
}

export interface BlogCommentsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface BlogArticleCreateRequest {
  title: string;
  slug?: string;
  category_id: number;
  excerpt?: string;
  content: string;
  featured_image?: string;
  gallery_images?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at?: string;
  scheduled_at?: string;
  is_featured?: boolean;
  allow_comments?: boolean;
  is_published_in_rss?: boolean;
  noindex?: boolean;
  sort_order?: number;
  tags?: string[];
}

export interface BlogCategoryCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  color: string;
  image?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface BlogApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BlogPaginatedResponse<T> extends BlogApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface BlogArticleFilters {
  status?: string;
  category_id?: number;
  author_id?: number;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface BlogCommentFilters {
  status?: string;
  article_id?: number;
  per_page?: number;
  page?: number;
}

export type BlogAnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface BlogAnalyticsFilters {
  period?: BlogAnalyticsPeriod;
  start_date?: string;
  end_date?: string;
} 