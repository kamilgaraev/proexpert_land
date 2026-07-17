import axios from 'axios';
import type {
  BlogApiResponse,
  BlogArticle,
  BlogArticleFilters,
  BlogCategory,
  BlogPaginatedResponse,
  BlogTag,
} from '../types/blog';
import {
  normalizeMarketingBlogArticle,
  normalizeMarketingBlogCategory,
  normalizeMarketingBlogTag,
} from './marketingBlogNormalizer';

const API_BASE_DOMAIN = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'https://api.1мост.рф';
const BLOG_PUBLIC_API_URL = `${API_BASE_DOMAIN}/api/v1/blog`;

const api = axios.create({
  baseURL: BLOG_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type BlogPaginationMeta = BlogPaginatedResponse<BlogArticle>['meta'];
type BlogPaginationLinks = BlogPaginatedResponse<BlogArticle>['links'];
type LandingEnvelope<T> = BlogApiResponse<T>;
type WrappedCollectionPayload<T> = { data: T[]; meta?: BlogPaginationMeta; links?: BlogPaginationLinks };
type WrappedItemPayload<T> = { data: T };
type ResourceCollectionPayload<T> = T[] | { data?: T[] };
type ApiResult<T> = { data: T };

const unwrapCollectionPayload = <T>(response: { data: LandingEnvelope<WrappedCollectionPayload<T>> }): ApiResult<WrappedCollectionPayload<T>> => ({
  data: response.data.data,
});

const wrapItemPayload = <T>(response: { data: LandingEnvelope<T> }): ApiResult<WrappedItemPayload<T>> => ({
  data: { data: response.data.data },
});

const toCollection = <T>(payload: ResourceCollectionPayload<T>): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.data) ? payload.data : [];
};

const wrapResourceCollectionPayload = <T>(
  response: { data: LandingEnvelope<ResourceCollectionPayload<T>> },
): ApiResult<WrappedItemPayload<T[]>> => ({
  data: { data: toCollection(response.data.data) },
});

const normalizeArticleCollectionPayload = (
  result: ApiResult<WrappedCollectionPayload<BlogArticle>>,
): ApiResult<WrappedCollectionPayload<BlogArticle>> => ({
  data: {
    ...result.data,
    data: result.data.data.map(normalizeMarketingBlogArticle),
  },
});

const normalizeWrappedArticle = (
  result: ApiResult<WrappedItemPayload<BlogArticle>>,
): ApiResult<WrappedItemPayload<BlogArticle>> => ({
  data: { data: normalizeMarketingBlogArticle(result.data.data) },
});

const normalizeWrappedArticleCollection = (
  result: ApiResult<WrappedItemPayload<BlogArticle[]>>,
): ApiResult<WrappedItemPayload<BlogArticle[]>> => ({
  data: { data: result.data.data.map(normalizeMarketingBlogArticle) },
});

export const blogPublicApi = {
  getArticles: async (filters?: BlogArticleFilters): Promise<ApiResult<WrappedCollectionPayload<BlogArticle>>> => {
    const params = new URLSearchParams();
    params.append('status', 'published');
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await api.get(`/articles?${params.toString()}`);

    return normalizeArticleCollectionPayload(
      unwrapCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<WrappedCollectionPayload<BlogArticle>> }),
    );
  },

  getArticle: async (slug: string): Promise<ApiResult<WrappedItemPayload<BlogArticle>>> => {
    const response = await api.get(`/articles/${slug}`);

    return normalizeWrappedArticle(
      wrapItemPayload<BlogArticle>(response as { data: LandingEnvelope<BlogArticle> }),
    );
  },

  getPreviewArticle: async (
    articleId: number | string,
    params: URLSearchParams | Record<string, string>,
  ): Promise<ApiResult<WrappedItemPayload<BlogArticle>>> => {
    const query = params instanceof URLSearchParams ? params.toString() : new URLSearchParams(params).toString();
    const response = await api.get(`/preview/${articleId}${query ? `?${query}` : ''}`);

    return normalizeWrappedArticle(
      wrapItemPayload<BlogArticle>(response as { data: LandingEnvelope<BlogArticle> }),
    );
  },

  getCategories: async (): Promise<ApiResult<WrappedItemPayload<BlogCategory[]>>> => {
    const response = await api.get('/categories');

    const result = wrapResourceCollectionPayload<BlogCategory>(
      response as { data: LandingEnvelope<{ data: BlogCategory[] }> },
    );

    return {
      data: { data: result.data.data.map(normalizeMarketingBlogCategory) },
    };
  },

  getTags: async (limit = 20): Promise<ApiResult<WrappedItemPayload<BlogTag[]>>> => {
    const response = await api.get(`/tags?limit=${limit}`);

    const result = wrapResourceCollectionPayload<BlogTag>(
      response as { data: LandingEnvelope<{ data: BlogTag[] }> },
    );

    return {
      data: { data: result.data.data.map(normalizeMarketingBlogTag) },
    };
  },

  getPopularArticles: async (limit = 5): Promise<ApiResult<WrappedItemPayload<BlogArticle[]>>> => {
    const response = await api.get(`/articles/popular?limit=${limit}`);

    return normalizeWrappedArticleCollection(
      wrapResourceCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<{ data: BlogArticle[] }> }),
    );
  },

  getRelatedArticles: async (articleId: number, limit = 3): Promise<ApiResult<WrappedItemPayload<BlogArticle[]>>> => {
    const response = await api.get(`/articles/${articleId}/related?limit=${limit}`);

    return normalizeWrappedArticleCollection(
      wrapResourceCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<{ data: BlogArticle[] }> }),
    );
  },

  searchArticles: async (query: string, limit = 10): Promise<ApiResult<WrappedItemPayload<BlogArticle[]>>> => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);

    return normalizeWrappedArticleCollection(
      wrapResourceCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<{ data: BlogArticle[] }> }),
    );
  },
};
