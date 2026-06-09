export type KnowledgeArticleKind = 'article' | 'guide' | 'best_practice' | 'tip' | 'changelog';

export type KnowledgeArticleStatus = 'draft' | 'published' | 'archived';

export interface KnowledgeCategory {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  articles_count: number;
}

export interface KnowledgeArticleSummary {
  id: number;
  kind: KnowledgeArticleKind;
  kind_label: string;
  status: KnowledgeArticleStatus;
  title: string;
  slug: string;
  excerpt: string | null;
  category: KnowledgeCategory | null;
  tags: string[];
  release_version: string | null;
  release_date: string | null;
  published_at: string | null;
  reading_time: number;
  is_featured: boolean;
}

export interface KnowledgeArticleTocItem {
  level: 2 | 3;
  title: string;
  anchor: string;
}

export interface KnowledgeArticleDetail extends KnowledgeArticleSummary {
  content: string | null;
  table_of_contents: KnowledgeArticleTocItem[];
  related: KnowledgeArticleSummary[];
}

export interface KnowledgeHubSummary {
  categories_count: number;
  articles_count: number;
  changelog_count: number;
}

export interface KnowledgeHubOverview {
  categories: KnowledgeCategory[];
  featured_articles: KnowledgeArticleSummary[];
  latest_changelog: KnowledgeArticleSummary[];
  summary: KnowledgeHubSummary;
}

export interface KnowledgeHubFilters {
  q?: string;
  category?: string;
  tag?: string;
  kind?: KnowledgeArticleKind;
  page?: number;
  per_page?: number;
}

export interface KnowledgeHubPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

export interface KnowledgeHubPaginatedResponse<T> {
  data: T[];
  meta: KnowledgeHubPaginationMeta;
}

export interface KnowledgeHubApiEnvelope<T> {
  success: boolean;
  message?: string | null;
  data: T;
  meta?: KnowledgeHubPaginationMeta;
}
