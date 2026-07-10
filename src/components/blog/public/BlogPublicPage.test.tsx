import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { BlogArticle, BlogCategory, BlogIndexInitialData } from '@/types/blog';
import BlogPublicPage from './BlogPublicPage';

const apiUrl = (path: string) => new URL(path, 'https://api.1мост.рф').href;
const BASE_QUERY_KEY = 'category=&search=&page=1';
const requests = { articles: 0, categories: 0 };

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

const server = setupServer(
  http.get(apiUrl('/api/v1/blog/articles'), () => {
    requests.articles += 1;
    return HttpResponse.json({
      success: true,
      data: {
        data: [article],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      },
    });
  }),
  http.get(apiUrl('/api/v1/blog/categories'), () => {
    requests.categories += 1;
    return HttpResponse.json({ success: true, data: { data: [category] } });
  }),
  http.get(apiUrl('/api/v1/blog/articles/popular'), () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
  http.get(apiUrl('/api/v1/blog/tags'), () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  requests.articles = 0;
  requests.categories = 0;
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const renderPage = (initialData: BlogIndexInitialData, initialEntry = '/blog') => render(
  <StrictMode>
    <MemoryRouter initialEntries={[initialEntry]}>
      <BlogPublicPage initialData={initialData} />
    </MemoryRouter>
  </StrictMode>,
);

describe('BlogPublicPage SSR hydration', () => {
  it('includes the initial article link in server-rendered HTML', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/blog']}>
        <BlogPublicPage
          initialData={{
            articles: [article],
            categories: [category],
            pagination: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
            articlesLoaded: true,
            categoriesLoaded: true,
            queryKey: BASE_QUERY_KEY,
          }}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('Как управлять стройкой');
    expect(html).toContain('href="/blog/manage-construction"');
    expect(html).not.toContain('animate-pulse');
  });

  it('renders initial articles immediately and does not duplicate successful requests', async () => {
    const initialData: BlogIndexInitialData = {
      articles: [article],
      categories: [category],
      pagination: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      articlesLoaded: true,
      categoriesLoaded: true,
      queryKey: BASE_QUERY_KEY,
    };

    const { container } = renderPage(initialData);
    const headline = screen.getByRole('heading', { name: article.title });

    expect(headline).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Как управлять стройкой|Читать статью/ })[0]).toHaveAttribute(
      'href',
      '/blog/manage-construction',
    );
    expect(container.querySelector('.animate-pulse')).toBeNull();

    await waitFor(() => {
      expect(requests.articles).toBe(0);
      expect(requests.categories).toBe(0);
    });
  });

  it('loads only the collection missing from partial SSR state', async () => {
    renderPage({
      articles: [article],
      categories: [],
      pagination: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      articlesLoaded: true,
      categoriesLoaded: false,
      queryKey: BASE_QUERY_KEY,
    });

    expect(screen.getByRole('heading', { name: article.title })).toBeVisible();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: category.name })).toBeVisible();
    });
    expect(requests.articles).toBe(0);
    expect(requests.categories).toBe(1);
  });

  it('loads articles without repeating successfully loaded categories', async () => {
    renderPage({
      articles: [],
      categories: [category],
      pagination: { current_page: 1, last_page: 1, per_page: 12, total: 0 },
      articlesLoaded: false,
      categoriesLoaded: true,
      queryKey: BASE_QUERY_KEY,
    });

    expect(screen.getByRole('button', { name: category.name })).toBeVisible();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: article.title })).toBeVisible();
    });
    expect(requests.articles).toBe(1);
    expect(requests.categories).toBe(0);
  });

  it('deduplicates both missing collections in StrictMode', async () => {
    renderPage({
      articles: [],
      categories: [],
      pagination: { current_page: 1, last_page: 1, per_page: 12, total: 0 },
      articlesLoaded: false,
      categoriesLoaded: false,
      queryKey: BASE_QUERY_KEY,
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: article.title })).toBeVisible();
      expect(screen.getByRole('button', { name: category.name })).toBeVisible();
    });
    expect(requests.articles).toBe(1);
    expect(requests.categories).toBe(1);
  });

  it('requests page 1 when the URL contains a search query and stale page number', async () => {
    const observedQueries: Array<{ page: string | null; search: string | null }> = [];

    server.use(
      http.get(apiUrl('/api/v1/blog/articles'), ({ request }) => {
        requests.articles += 1;
        const params = new URL(request.url).searchParams;
        observedQueries.push({
          page: params.get('page'),
          search: params.get('search'),
        });

        return HttpResponse.json({
          success: true,
          data: {
            data: [article],
            meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
          },
        });
      }),
    );

    renderPage({
      articles: [article],
      categories: [category],
      pagination: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      articlesLoaded: true,
      categoriesLoaded: true,
      queryKey: BASE_QUERY_KEY,
    }, '/blog?search=budget&page=4');

    await waitFor(() => expect(requests.articles).toBe(1));
    expect(observedQueries).toEqual([{ page: '1', search: 'budget' }]);
  });

  it('keeps the newest category response when an older request resolves last', async () => {
    const secondCategory: BlogCategory = {
      ...category,
      id: 8,
      name: 'Снабжение',
      slug: 'procurement',
    };
    const managementArticle = {
      ...article,
      id: 43,
      title: 'Управление без потерь',
      slug: 'management-guide',
    };
    const procurementArticle = {
      ...article,
      id: 44,
      title: 'Снабжение без задержек',
      slug: 'procurement-guide',
      category: secondCategory,
    };
    let releaseManagement!: () => void;
    const requestedPages: Array<string | null> = [];
    const managementGate = new Promise<void>((resolve) => {
      releaseManagement = resolve;
    });

    server.use(
      http.get(apiUrl('/api/v1/blog/articles'), async ({ request }) => {
        requests.articles += 1;
        const params = new URL(request.url).searchParams;
        const categoryId = params.get('category_id');
        requestedPages.push(params.get('page'));

        if (categoryId === '7') {
          await managementGate;
        }

        const responseArticle = categoryId === '8' ? procurementArticle : managementArticle;

        return HttpResponse.json({
          success: true,
          data: {
            data: [responseArticle],
            meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
          },
        });
      }),
    );

    renderPage({
      articles: [article],
      categories: [category, secondCategory],
      pagination: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      articlesLoaded: true,
      categoriesLoaded: true,
      queryKey: BASE_QUERY_KEY,
    });

    fireEvent.click(screen.getByRole('button', { name: category.name }));
    await waitFor(() => expect(requests.articles).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getByRole('button', { name: secondCategory.name }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: procurementArticle.title })).toBeVisible();
    });

    await act(async () => {
      releaseManagement();
      await new Promise((resolve) => window.setTimeout(resolve, 10));
    });

    expect(screen.getByRole('heading', { name: procurementArticle.title })).toBeVisible();
    expect(screen.queryByRole('heading', { name: managementArticle.title })).not.toBeInTheDocument();
    expect(requestedPages).toEqual(['1', '1']);
  });

  it('loads page 2 after reloading a URL that contains a stale page number', async () => {
    const requestedPages: string[] = [];
    const nextArticle = {
      ...article,
      id: 45,
      title: 'Вторая страница',
      slug: 'second-page',
    };

    server.use(
      http.get(apiUrl('/api/v1/blog/articles'), ({ request }) => {
        requests.articles += 1;
        const page = new URL(request.url).searchParams.get('page') ?? '';
        requestedPages.push(page);

        return HttpResponse.json({
          success: true,
          data: {
            data: [nextArticle],
            meta: { current_page: Number(page), last_page: 3, per_page: 12, total: 25 },
          },
        });
      }),
    );

    renderPage({
      articles: [article],
      categories: [category],
      pagination: { current_page: 1, last_page: 3, per_page: 12, total: 25 },
      articlesLoaded: true,
      categoriesLoaded: true,
      queryKey: BASE_QUERY_KEY,
    }, '/blog?page=4');

    fireEvent.click(screen.getByRole('button', { name: 'Показать еще' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: nextArticle.title })).toBeVisible();
    });
    expect(requestedPages).toEqual(['2']);
  });
});
