import axios from 'axios';
import type {
  BlogApiResponse,
  BlogArticle,
  BlogArticleFilters,
  BlogCategory,
  BlogPaginatedResponse,
  BlogTag,
} from '../types/blog';

const API_BASE_DOMAIN = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'https://api.prohelper.pro';
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
type ApiResult<T> = { data: T };

const unwrapCollectionPayload = <T>(response: { data: LandingEnvelope<WrappedCollectionPayload<T>> }): ApiResult<WrappedCollectionPayload<T>> => ({
  data: response.data.data,
});

const wrapItemPayload = <T>(response: { data: LandingEnvelope<T> }): ApiResult<WrappedItemPayload<T>> => ({
  data: { data: response.data.data },
});

const wrapResourceCollectionPayload = <T>(
  response: { data: LandingEnvelope<{ data: T[] }> },
): ApiResult<WrappedItemPayload<T[]>> => ({
  data: { data: response.data.data.data },
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

    return unwrapCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<WrappedCollectionPayload<BlogArticle>> });
  },

  getArticle: async (slug: string): Promise<ApiResult<WrappedItemPayload<BlogArticle>>> => {
    const response = await api.get(`/articles/${slug}`);

    return wrapItemPayload<BlogArticle>(response as { data: LandingEnvelope<BlogArticle> });
  },

  getPreviewArticle: async (
    articleId: number | string,
    params: URLSearchParams | Record<string, string>,
  ): Promise<ApiResult<WrappedItemPayload<BlogArticle>>> => {
    const query = params instanceof URLSearchParams ? params.toString() : new URLSearchParams(params).toString();
    const response = await api.get(`/preview/${articleId}${query ? `?${query}` : ''}`);

    return wrapItemPayload<BlogArticle>(response as { data: LandingEnvelope<BlogArticle> });
  },

  getCategories: async (): Promise<ApiResult<WrappedItemPayload<BlogCategory[]>>> => {
    const response = await api.get('/categories');

    return wrapResourceCollectionPayload<BlogCategory>(response as { data: LandingEnvelope<{ data: BlogCategory[] }> });
  },

  getTags: async (): Promise<ApiResult<WrappedItemPayload<BlogTag[]>>> => {
    const response = await api.get('/tags');

    return wrapResourceCollectionPayload<BlogTag>(response as { data: LandingEnvelope<{ data: BlogTag[] }> });
  },

  getPopularArticles: async (limit = 5): Promise<ApiResult<WrappedItemPayload<BlogArticle[]>>> => {
    const response = await api.get(`/articles/popular?limit=${limit}`);

    return wrapResourceCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<{ data: BlogArticle[] }> });
  },

  getRelatedArticles: async (articleId: number, limit = 3): Promise<ApiResult<WrappedItemPayload<BlogArticle[]>>> => {
    const response = await api.get(`/articles/${articleId}/related?limit=${limit}`);

    return wrapResourceCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<{ data: BlogArticle[] }> });
  },

  searchArticles: async (query: string, limit = 10): Promise<ApiResult<WrappedItemPayload<BlogArticle[]>>> => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);

    return wrapResourceCollectionPayload<BlogArticle>(response as { data: LandingEnvelope<{ data: BlogArticle[] }> });
  },
};
