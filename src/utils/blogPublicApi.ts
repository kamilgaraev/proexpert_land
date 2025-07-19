import axios from 'axios';
import type { BlogArticleFilters } from '../types/blog';

const API_BASE_DOMAIN = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'https://api.prohelper.pro';
const BLOG_PUBLIC_API_URL = `${API_BASE_DOMAIN}/api/v1/blog`;

const api = axios.create({
  baseURL: BLOG_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const blogPublicApi = {
  getArticles: (filters?: BlogArticleFilters) => {
    const params = new URLSearchParams();
    params.append('status', 'published');
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/articles?${params.toString()}`);
  },

  getArticle: (slug: string) => api.get(`/articles/${slug}`),

  getCategories: () => api.get('/categories'),

  getTags: () => api.get('/tags'),

  getPopularArticles: (limit = 5) => 
    api.get(`/articles/popular?limit=${limit}`),

  getRelatedArticles: (articleId: number, limit = 3) =>
    api.get(`/articles/${articleId}/related?limit=${limit}`),

  searchArticles: (query: string, limit = 10) =>
    api.get(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),
}; 