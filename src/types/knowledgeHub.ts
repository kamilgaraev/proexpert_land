export type KnowledgeArticleKind = 'article' | 'guide' | 'best_practice' | 'tip' | 'changelog';

export type KnowledgeArticleStatus = 'draft' | 'published' | 'archived';

export type KnowledgeSurface = 'lk' | 'admin' | 'mobile' | 'superadmin';

export type KnowledgeFeedbackReaction = 'helpful' | 'not_helpful';

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
  parent_id: number | null;
  depth: number;
  audiences: string[];
  surfaces: KnowledgeSurface[];
  module_slugs: string[];
  context_keys: string[];
  category: KnowledgeCategory | null;
  parent?: Pick<KnowledgeArticleSummary, 'id' | 'title' | 'slug'> | null;
  tags: string[];
  release_version: string | null;
  release_date: string | null;
  published_at: string | null;
  reading_time: number;
  is_featured: boolean;
  is_pinned: boolean;
}

export interface KnowledgeSearchResult extends KnowledgeArticleSummary {
  search_rank: number | null;
  snippet: string | null;
}

export interface KnowledgeArticleTreeNode extends KnowledgeArticleSummary {
  children: KnowledgeArticleTreeNode[];
}

export interface KnowledgeArticleTocItem {
  level: 2 | 3;
  title: string;
  anchor: string;
}

export interface KnowledgeArticleDetail extends KnowledgeArticleSummary {
  content: string | null;
  plain_text?: string | null;
  table_of_contents: KnowledgeArticleTocItem[];
  children: KnowledgeArticleSummary[];
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
  surface?: KnowledgeSurface;
  module?: string;
  module_slug?: string;
  permission_key?: string;
  context_key?: string;
  clicked_article_id?: number;
  limit?: number;
  page?: number;
  per_page?: number;
}

export interface KnowledgeContextHelp {
  primary: KnowledgeArticleSummary | null;
  suggested: KnowledgeArticleSummary[];
  context: {
    surface: KnowledgeSurface;
    module_slug: string | null;
    permission_key: string | null;
    context_key: string | null;
  };
}

export interface KnowledgeFeedbackPayload {
  article_id: number;
  reaction: KnowledgeFeedbackReaction;
  comment?: string;
  context_key?: string;
  module_slug?: string;
  permission_key?: string;
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
