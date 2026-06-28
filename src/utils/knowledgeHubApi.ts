import axios from 'axios';
import { API_URL } from './api';
import { attachAuthorizationHeader } from './authTokenStorage';
import type {
  KnowledgeArticleDetail,
  KnowledgeArticleSummary,
  KnowledgeArticleTreeNode,
  KnowledgeContextHelp,
  KnowledgeFeedbackPayload,
  KnowledgeHubApiEnvelope,
  KnowledgeHubFilters,
  KnowledgeHubOverview,
  KnowledgeHubPaginatedResponse,
  KnowledgeSearchResult,
} from '@/types/knowledgeHub';

const api = axios.create({
  baseURL: `${API_URL}/knowledge-hub`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(attachAuthorizationHeader);

const buildParams = (filters?: KnowledgeHubFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (!filters) {
    return params;
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    params.append(key, String(value));
  });

  return params;
};

const pathWithParams = (path: string, filters?: KnowledgeHubFilters): string => {
  const params = buildParams(filters);
  const query = params.toString();

  return query ? `${path}?${query}` : path;
};

const unwrap = <T>(response: { data: KnowledgeHubApiEnvelope<T> }): T => response.data.data;

const unwrapPaginated = <T>(response: {
  data: KnowledgeHubApiEnvelope<T[]>;
}): KnowledgeHubPaginatedResponse<T> => ({
  data: Array.isArray(response.data.data) ? response.data.data : [],
  meta: response.data.meta ?? {
    current_page: 1,
    per_page: Array.isArray(response.data.data) ? response.data.data.length : 0,
    last_page: 1,
    total: Array.isArray(response.data.data) ? response.data.data.length : 0,
  },
});

export const knowledgeHubApi = {
  getOverview: async (): Promise<KnowledgeHubOverview> => {
    const response = await api.get('/overview');

    return unwrap<KnowledgeHubOverview>(response as { data: KnowledgeHubApiEnvelope<KnowledgeHubOverview> });
  },

  getArticles: async (
    filters?: KnowledgeHubFilters,
  ): Promise<KnowledgeHubPaginatedResponse<KnowledgeArticleSummary>> => {
    const response = await api.get(pathWithParams('/articles', filters));

    return unwrapPaginated<KnowledgeArticleSummary>(
      response as { data: KnowledgeHubApiEnvelope<KnowledgeArticleSummary[]> },
    );
  },

  searchArticles: async (
    filters: KnowledgeHubFilters & { q: string },
  ): Promise<KnowledgeHubPaginatedResponse<KnowledgeSearchResult>> => {
    const response = await api.get(pathWithParams('/search', filters));

    return unwrapPaginated<KnowledgeSearchResult>(
      response as { data: KnowledgeHubApiEnvelope<KnowledgeSearchResult[]> },
    );
  },

  getTree: async (filters?: KnowledgeHubFilters): Promise<KnowledgeArticleTreeNode[]> => {
    const response = await api.get(pathWithParams('/tree', filters));

    return unwrap<KnowledgeArticleTreeNode[]>(
      response as { data: KnowledgeHubApiEnvelope<KnowledgeArticleTreeNode[]> },
    );
  },

  getContextHelp: async (filters?: KnowledgeHubFilters): Promise<KnowledgeContextHelp> => {
    const response = await api.get(pathWithParams('/context', filters));

    return unwrap<KnowledgeContextHelp>(response as { data: KnowledgeHubApiEnvelope<KnowledgeContextHelp> });
  },

  sendFeedback: async (payload: KnowledgeFeedbackPayload): Promise<{ id: number }> => {
    const response = await api.post('/feedback', payload);

    return unwrap<{ id: number }>(response as { data: KnowledgeHubApiEnvelope<{ id: number }> });
  },

  getArticle: async (slug: string): Promise<KnowledgeArticleDetail> => {
    const response = await api.get(`/articles/${encodeURIComponent(slug)}`);

    return unwrap<KnowledgeArticleDetail>(response as { data: KnowledgeHubApiEnvelope<KnowledgeArticleDetail> });
  },

  getChangelog: async (
    filters?: Omit<KnowledgeHubFilters, 'kind' | 'category'>,
  ): Promise<KnowledgeHubPaginatedResponse<KnowledgeArticleSummary>> => {
    const response = await api.get(pathWithParams('/changelog', filters));

    return unwrapPaginated<KnowledgeArticleSummary>(
      response as { data: KnowledgeHubApiEnvelope<KnowledgeArticleSummary[]> },
    );
  },

  getChangelogEntry: async (slug: string): Promise<KnowledgeArticleDetail> => {
    const response = await api.get(`/changelog/${encodeURIComponent(slug)}`);

    return unwrap<KnowledgeArticleDetail>(response as { data: KnowledgeHubApiEnvelope<KnowledgeArticleDetail> });
  },
};
