import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { BlogArticle, BlogCategory, BlogIndexInitialData } from '@/types/blog';
import BlogPublicPage from './BlogPublicPage';

const apiUrl = (path: string) => new URL(path, 'https://api.1мост.рф').href;
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

const renderPage = (initialData: BlogIndexInitialData) => render(
  <MemoryRouter initialEntries={['/blog']}>
    <BlogPublicPage initialData={initialData} />
  </MemoryRouter>,
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
    });

    expect(screen.getByRole('button', { name: category.name })).toBeVisible();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: article.title })).toBeVisible();
    });
    expect(requests.articles).toBe(1);
    expect(requests.categories).toBe(0);
  });
});
