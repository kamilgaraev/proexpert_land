import axios from 'axios';
import { getAdminToken } from './adminApi';
import type {
  BlogArticle,
  BlogCategory,
  BlogComment,
  BlogSEOSettings,
  BlogDashboardOverview,
  BlogAnalytics,
  BlogQuickStats,
  BlogCommentsStats,
  BlogArticleCreateRequest,
  BlogCategoryCreateRequest,
  BlogApiResponse,
  BlogPaginatedResponse,
  BlogArticleFilters,
  BlogCommentFilters,
  BlogAnalyticsFilters
} from '../types/blog';

const ADMIN_API_BASE_DOMAIN = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? 'https://api.prohelper.pro';
const BLOG_API_URL = `${ADMIN_API_BASE_DOMAIN}/api/v1/landing/blog`;

const createBlogApiClient = () => {
  const client = axios.create({
    baseURL: BLOG_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const api = createBlogApiClient();

export const blogDashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),

  getAnalytics: (filters?: BlogAnalyticsFilters) => {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    return api.get(`/dashboard/analytics?${params.toString()}`);
  },

  getQuickStats: () => api.get('/dashboard/quick-stats'),
};

export const blogArticlesApi = {
  getArticles: (filters?: BlogArticleFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.author_id) params.append('author_id', filters.author_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/articles?${params.toString()}`);
  },

  getArticle: (id: number) => api.get(`/articles/${id}`),

  createArticle: (data: BlogArticleCreateRequest) => api.post('/articles', data),

  updateArticle: (id: number, data: Partial<BlogArticleCreateRequest>) => api.put(`/articles/${id}`, data),

  deleteArticle: (id: number) => api.delete(`/articles/${id}`),

  publishArticle: (id: number, publishAt?: string) => 
    api.post(`/articles/${id}/publish`, publishAt ? { publish_at: publishAt } : {}),

  scheduleArticle: (id: number, scheduledAt: string) => 
    api.post(`/articles/${id}/schedule`, { scheduled_at: scheduledAt }),

  archiveArticle: (id: number) => api.post(`/articles/${id}/archive`),

  duplicateArticle: (id: number) => api.post(`/articles/${id}/duplicate`),

  generateSEOData: (id: number) => api.get(`/articles/${id}/seo-data`),

  getScheduledArticles: () => api.get('/articles-scheduled'),

  getDraftArticles: () => api.get('/articles-drafts'),
};

export const blogCategoriesApi = {
  getCategories: () => api.get('/categories'),

  getCategory: (id: number) => api.get(`/categories/${id}`),

  createCategory: (data: BlogCategoryCreateRequest) => api.post('/categories', data),

  updateCategory: (id: number, data: Partial<BlogCategoryCreateRequest>) => api.put(`/categories/${id}`, data),

  deleteCategory: (id: number) => api.delete(`/categories/${id}`),

  reorderCategories: (categoryIds: number[]) => api.post('/categories/reorder', { category_ids: categoryIds }),
};

export const blogCommentsApi = {
  getComments: (filters?: BlogCommentFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.article_id) params.append('article_id', filters.article_id.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    return api.get(`/comments?${params.toString()}`);
  },

  getComment: (id: number) => api.get(`/comments/${id}`),

  updateCommentStatus: (id: number, status: 'approved' | 'rejected' | 'spam') => 
    api.put(`/comments/${id}/status`, { status }),

  deleteComment: (id: number) => api.delete(`/comments/${id}`),

  bulkUpdateStatus: (commentIds: number[], status: 'approved' | 'rejected' | 'spam') => 
    api.post('/comments/bulk-status', { status, comment_ids: commentIds }),

  getPendingComments: () => api.get('/comments-pending'),

  getRecentComments: () => api.get('/comments-recent'),

  getCommentsStats: () => api.get('/comments/stats'),
};

export const blogSEOApi = {
  getSettings: () => api.get('/seo/settings'),

  updateSettings: (data: Partial<BlogSEOSettings>) => api.put('/seo/settings', data),

  generateSitemap: () => api.get('/seo/sitemap', { headers: { Accept: 'application/xml' } }),

  generateRSS: () => api.get('/seo/rss', { headers: { Accept: 'application/rss+xml' } }),

  generateRobots: () => api.get('/seo/robots', { headers: { Accept: 'text/plain' } }),

  previewSitemap: () => api.get('/seo/preview/sitemap'),

  previewRSS: () => api.get('/seo/preview/rss'),

  previewRobots: () => api.get('/seo/preview/robots'),
};

export const blogApi = {
  dashboard: blogDashboardApi,
  articles: blogArticlesApi,
  categories: blogCategoriesApi,
  comments: blogCommentsApi,
  seo: blogSEOApi,
}; 