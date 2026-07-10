import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlogArticle, BlogCategory } from '@/types/blog';
import { fetchBlogIndexForSsr } from './blogIndexSsr';

const category: BlogCategory = {
  id: 7,
  name: 'Управление',
  slug: 'management',
  color: '#0f172a',
  sort_order: 1,
  is_active: true,
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-01T10:00:00Z',
};

const article: BlogArticle = {
  id: 42,
  title: 'Как управлять стройкой',
  slug: 'manage-construction',
  excerpt: 'Практический разбор',
  content: '<p>Материал</p>',
  status: 'published',
  published_at: '2026-07-01T10:00:00Z',
  views_count: 10,
  likes_count: 0,
  comments_count: 0,
  reading_time: 2,
  estimated_reading_time: 2,
  is_featured: false,
  allow_comments: true,
  is_published_in_rss: true,
  noindex: false,
  sort_order: 1,
  url: '/blog/manage-construction',
  is_published: true,
  category,
  author: { id: 3, name: 'Редакция', email: 'editor@example.test' },
  tags: [],
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-01T10:00:00Z',
};

afterEach(() => {
  vi.useRealTimers();
});

describe('blog index SSR transport', () => {
  it('returns a partial result when one upstream request reaches the deadline', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn((input: string | URL | Request, init?: RequestInit) => {
      if (String(input).includes('/articles?')) {
        return Promise.resolve(new Response(JSON.stringify({
          success: true,
          data: {
            data: [article],
            meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
          },
        }), { status: 200 }));
      }

      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')));
      });
    });

    const resultPromise = fetchBlogIndexForSsr({
      apiBaseDomain: 'https://api.example.test',
      fetchImpl: fetchImpl as typeof fetch,
      timeoutMs: 25,
    });

    await vi.advanceTimersByTimeAsync(25);

    await expect(resultPromise).resolves.toMatchObject({
      articles: [article],
      categories: [],
      articlesLoaded: true,
      categoriesLoaded: false,
      queryKey: 'category=&search=&page=1',
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('keeps the deadline active while the response body is being read', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn((_input: string | URL | Request, init?: RequestInit) => Promise.resolve({
      ok: true,
      status: 200,
      json: () => new Promise<unknown>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')));
      }),
    } as Response));

    const resultPromise = fetchBlogIndexForSsr({
      apiBaseDomain: 'https://api.example.test',
      fetchImpl: fetchImpl as typeof fetch,
      timeoutMs: 25,
    });

    await vi.advanceTimersByTimeAsync(25);

    await expect(resultPromise).resolves.toMatchObject({
      articles: [],
      categories: [],
      articlesLoaded: false,
      categoriesLoaded: false,
    });
  });
});
