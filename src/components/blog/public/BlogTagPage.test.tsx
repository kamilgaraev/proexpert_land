import { StrictMode } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { BlogArticle, BlogTagInitialData } from '@/types/blog';
import { onBeforeRender } from '@/pages/catch-all.page.server';
import { fetchBlogTagForSsr } from '@/pages/blogIndexSsr';
import { blogPublicApi } from '@/utils/blogPublicApi';
import BlogTagPage from './BlogTagPage';

const apiUrl = (path: string) => new URL(path, 'https://api.1мост.рф').href;
const article: BlogArticle = {
  id: 1, title: 'Как управлять стройкой', slug: 'manage-construction', excerpt: 'Практический разбор', content: '<p>Материал</p>',
  status: 'published', published_at: '2026-07-01T10:00:00Z', views_count: 10, likes_count: 0, comments_count: 0, reading_time: 2, estimated_reading_time: 2,
  is_featured: false, allow_comments: true, is_published_in_rss: true, noindex: false, sort_order: 1, url: '/blog/manage-construction', is_published: true,
  category: { id: 7, name: 'Управление', slug: 'management', color: '#111111', sort_order: 1, is_active: true, created_at: null, updated_at: null },
  author: { id: 3, name: 'Редакция', email: null }, tags: [{ id: 5, name: 'Бюджет', slug: 'budget' }], created_at: null, updated_at: null,
};
const requests: URL[] = [];
const pagePayload = (page = 1, total = 13, slug = 'budget') => ({
  success: true,
  data: {
    data: Array.from({ length: Math.max(0, Math.min(12, total - (page - 1) * 12)) }, (_, index) => ({
      ...article, id: (page - 1) * 12 + index + 1, slug: `article-${page}-${index}`, title: `Статья ${slug}: ${page}-${index}`, tags: [{ id: 5, name: 'Бюджет', slug }],
    })),
    meta: { current_page: page, last_page: Math.max(1, Math.ceil(total / 12)), per_page: 12, total },
  },
});
const server = setupServer(
  http.get(apiUrl('/api/v1/blog/articles'), ({ request }) => {
    const url = new URL(request.url);
    requests.push(url);
    const slug = url.searchParams.get('tag_slug') || '';
    if (slug === 'unknown') return HttpResponse.json({ success: false, data: null }, { status: 404 });
    return HttpResponse.json(pagePayload(Number(url.searchParams.get('page') || '1'), slug === 'empty' ? 0 : 13, slug));
  }),
  http.get(apiUrl('/api/v1/blog/categories'), () => HttpResponse.json({ success: true, data: [] })),
  http.get(apiUrl('/api/v1/blog/articles/popular'), () => HttpResponse.json({ success: true, data: [] })),
  http.get(apiUrl('/api/v1/blog/tags'), () => HttpResponse.json({ success: true, data: [] })),
);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => { server.resetHandlers(); requests.length = 0; });
const tree = (data?: BlogTagInitialData, entry = '/blog/tag/budget') => (
  <MemoryRouter initialEntries={[entry]}>
    <Link to="/blog/tag/other">Другая тема</Link>
    <Routes><Route path="/blog/tag/:slug" element={<BlogTagPage initialData={data} />} /></Routes>
  </MemoryRouter>
);
const ssr = async (entry: string) => {
  const result = await onBeforeRender({ urlPathname: entry.split('?')[0], urlOriginal: entry });
  const context = result.pageContext;
  if (!('pageProps' in context) || !context.pageProps || !('initialBlogTagData' in context.pageProps)) throw new Error('Missing tag SSR props');
  return { context, data: context.pageProps.initialBlogTagData };
};

describe('Blog tag exact SSR and client pagination', () => {
  it('renders direct SSR page 2 and hydrates without repeating the article request', async () => {
    const { data, context } = await ssr('/blog/tag/budget?search=cost&page=2&utm_source=test');
    expect(context.routeStatusCode).toBe(200);
    expect(context.documentProps).toMatchObject({ canonicalUrl: 'https://1мост.рф/blog/tag/budget?search=cost&page=2', noIndex: true });
    const html = renderToString(tree(data, '/blog/tag/budget?search=cost&page=2'));
    expect(html).toContain('Статья budget: 2-0');
    expect(html).not.toContain('animate-pulse');
    render(<StrictMode>{tree(data, '/blog/tag/budget?search=cost&page=2')}</StrictMode>);
    await act(async () => { await Promise.resolve(); });
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get('tag_slug')).toBe('budget');
    expect(requests[0].searchParams.get('page')).toBe('2');
    expect(requests[0].searchParams.get('per_page')).toBe('12');
    expect(requests[0].searchParams.get('search')).toBe('cost');
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', context.documentProps?.canonicalUrl);
  });

  it('replaces the previous page on a client transition and keeps search', async () => {
    const data = await fetchBlogTagForSsr('budget', { query: { search: 'cost' } });
    render(tree(data, '/blog/tag/budget?search=cost'));
    expect(screen.getByRole('link', { name: 'Следующая' })).toHaveAttribute('href', '/blog/tag/budget?search=cost&page=2');
    fireEvent.click(screen.getByRole('link', { name: 'Следующая' }));
    await screen.findByRole('heading', { name: 'Статья budget: 2-0' });
    expect(screen.queryByRole('heading', { name: 'Статья budget: 1-0' })).not.toBeInTheDocument();
    expect(requests.map((url) => url.searchParams.get('page'))).toEqual(['1', '2']);
    expect(requests[1].searchParams.get('search')).toBe('cost');
  });

  it('fetches a new slug instead of reusing SSR data', async () => {
    const data = await fetchBlogTagForSsr('budget');
    render(tree(data));
    fireEvent.click(screen.getByRole('link', { name: 'Другая тема' }));
    await screen.findByRole('heading', { name: 'Статья other: 1-0' });
    expect(screen.queryByRole('heading', { name: 'Статья budget: 1-0' })).not.toBeInTheDocument();
    expect(requests[1].searchParams.get('tag_slug')).toBe('other');
  });

  it.each([
    ['/blog/tag/unknown', 404, 'Тема не найдена'],
    ['/blog/tag/empty', 200, 'По этой теме пока нет материалов'],
    ['/blog/tag/budget?page=9', 404, 'Страница не найдена'],
  ])('distinguishes missing, empty, and out-of-range SSR: %s', async (entry, status, text) => {
    const { context, data } = await ssr(entry);
    expect(context.routeStatusCode).toBe(status);
    const html = renderToString(tree(data, entry));
    expect(html).toContain(text);
    render(tree(data, entry));
    await act(async () => { await Promise.resolve(); });
    expect(requests).toHaveLength(1);
  });

  it.each(['0', '-1', 'abc', '1.5', '2147483648', '2&page=3'])('rejects malformed page %s before API access', async (page) => {
    const entry = `/blog/tag/budget?page=${page}`;
    const { context, data } = await ssr(entry);
    expect(context.routeStatusCode).toBe(404);
    render(tree(data, entry));
    expect(screen.getByRole('heading', { level: 1, name: 'Страница не найдена' })).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it.each(['unknown', 'empty'])('matches client handling of %s', async (slug) => {
    render(tree(undefined, `/blog/tag/${slug}`));
    await screen.findByRole('heading', { name: slug === 'unknown' ? 'Тема не найдена' : 'По этой теме пока нет материалов' });
  });

  it('keeps network failure distinct from empty and missing topics', async () => {
    server.use(http.get(apiUrl('/api/v1/blog/articles'), () => HttpResponse.error()));
    const { context, data } = await ssr('/blog/tag/budget');
    expect(context.routeStatusCode).toBe(503);
    expect(renderToString(tree(data))).toContain('Материалы временно недоступны');
    render(tree(data));
    await screen.findByRole('alert');
    expect(screen.queryByText('По этой теме пока нет материалов')).not.toBeInTheDocument();
    expect(screen.queryByText('Тема не найдена')).not.toBeInTheDocument();
  });

  it.each(['wrong-tag', 'wrong-page', 'missing-meta', 'false-success'])('rejects an invalid API contract: %s', async (mode) => {
    server.use(http.get(apiUrl('/api/v1/blog/articles'), () => {
      const payload = pagePayload(mode === 'wrong-page' ? 2 : 1, 13, mode === 'wrong-tag' ? 'other' : 'budget');
      return HttpResponse.json(mode === 'missing-meta' ? { ...payload, data: { data: payload.data.data } } : mode === 'false-success' ? { ...payload, success: false } : payload);
    }));
    const { context } = await ssr('/blog/tag/budget');
    expect(context.routeStatusCode).toBe(503);
    render(tree());
    await screen.findByRole('alert');
  });

  it('serializes exact tag, category and search together in the API client', async () => {
    await blogPublicApi.getArticles({ tag_slug: 'budget', category_id: 7, search: 'cost', page: 2, per_page: 12 });
    expect(Object.fromEntries(requests[0].searchParams)).toMatchObject({ tag_slug: 'budget', category_id: '7', search: 'cost', page: '2', per_page: '12' });
  });
});
