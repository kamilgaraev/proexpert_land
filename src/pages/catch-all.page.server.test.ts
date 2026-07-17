import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlogArticle, BlogCategory } from '@/types/blog';
import { onBeforeRender } from './catch-all.page.server';

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

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const blogIndexFetch = (articlePayload: unknown, categoriesPayload: unknown) =>
  vi.fn((input: string | URL | Request) => Promise.resolve(
    String(input).includes('/articles?')
      ? jsonResponse({
          success: true,
          data: {
            data: [articlePayload],
            meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
          },
        })
      : jsonResponse({ success: true, data: categoriesPayload }),
  ));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('catch-all blog SSR', () => {
  it('loads the first article page and categories in parallel for the blog index', async () => {
    const fetchMock = vi.fn((input: string | URL | Request) => {
      const url = String(input);

      if (url.includes('/articles?')) {
        return Promise.resolve(jsonResponse({
          success: true,
          data: {
            data: [article],
            meta: { current_page: 1, last_page: 3, per_page: 12, total: 25 },
          },
        }));
      }

      return Promise.resolve(jsonResponse({ success: true, data: { data: [category] } }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await onBeforeRender({ urlPathname: '/blog/' });
    const initialData = result.pageContext.pageProps?.initialBlogIndexData;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual(expect.arrayContaining([
      expect.stringContaining('/api/v1/blog/articles?status=published&page=1&per_page=12'),
      expect.stringContaining('/api/v1/blog/categories'),
    ]));
    expect(initialData).toEqual({
      articles: [article],
      categories: [category],
      pagination: { current_page: 1, last_page: 3, per_page: 12, total: 25 },
      articlesLoaded: true,
      categoriesLoaded: true,
      queryKey: 'category=&search=&page=1',
    });
  });

  it('keeps SSR articles when categories fail', async () => {
    vi.stubGlobal('fetch', vi.fn((input: string | URL | Request) => {
      const url = String(input);

      return Promise.resolve(url.includes('/articles?')
        ? jsonResponse({
            success: true,
            data: {
              data: [article],
              meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
            },
          })
        : jsonResponse({ success: false, data: null }, 503));
    }));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [article],
      categories: [],
      articlesLoaded: true,
      categoriesLoaded: false,
    });
  });

  it('accepts the flat production categories envelope', async () => {
    vi.stubGlobal('fetch', blogIndexFetch(article, [category]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      categories: [category],
      categoriesLoaded: true,
    });
  });

  it('accepts nullable fields returned by the production blog resources', async () => {
    const nullableCategory = {
      ...category,
      description: null,
      meta_title: null,
      meta_description: null,
      image: null,
    };
    const nullableArticle = {
      ...article,
      excerpt: null,
      featured_image: null,
      gallery_images: null,
      meta_title: null,
      meta_description: null,
      meta_keywords: null,
      og_title: null,
      og_description: null,
      og_image: null,
      published_at: null,
      scheduled_at: null,
      readable_published_at: null,
      category: nullableCategory,
    };
    vi.stubGlobal('fetch', blogIndexFetch(nullableArticle, [nullableCategory]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [nullableArticle],
      categories: [nullableCategory],
      articlesLoaded: true,
      categoriesLoaded: true,
    });
  });

  it('accepts the public orphan article fallback DTO', async () => {
    const orphanArticle = {
      ...article,
      category: {
        ...category,
        id: null,
        created_at: null,
        updated_at: null,
      },
      author: {
        id: null,
        name: 'Редакция МОСТ',
        email: null,
      },
      created_at: null,
      updated_at: null,
    };
    vi.stubGlobal('fetch', blogIndexFetch(orphanArticle, [category]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [orphanArticle],
      articlesLoaded: true,
      categoriesLoaded: true,
    });
  });

  it('rejects an article missing a required field so the client can retry', async () => {
    const { views_count: _viewsCount, ...articleWithoutViews } = article;
    vi.stubGlobal('fetch', blogIndexFetch(articleWithoutViews, [category]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [],
      articlesLoaded: false,
      categoriesLoaded: true,
    });
  });

  it.each([
    { ...category, is_active: 'true' },
    { ...category, sort_order: '1' },
  ])('rejects a category with invalid boolean or number fields', async (invalidCategory) => {
    vi.stubGlobal('fetch', blogIndexFetch(article, [invalidCategory]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articlesLoaded: true,
      categories: [],
      categoriesLoaded: false,
    });
  });

  it.each([
    { ...article, author: { name: 'Редакция' } },
    { ...article, tags: [{ id: 1, name: 'Процессы', slug: 12 }] },
  ])('rejects invalid nested article authors and tags', async (invalidArticle) => {
    vi.stubGlobal('fetch', blogIndexFetch(invalidArticle, [category]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [],
      articlesLoaded: false,
      categoriesLoaded: true,
    });
  });

  it('rejects invalid optional article arrays', async () => {
    vi.stubGlobal('fetch', blogIndexFetch({ ...article, meta_keywords: ['стройка', 42] }, [category]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [],
      articlesLoaded: false,
      categoriesLoaded: true,
    });
  });

  it('rejects a wrong non-null type for a nullable article field', async () => {
    vi.stubGlobal('fetch', blogIndexFetch({ ...article, featured_image: 42 }, [category]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articles: [],
      articlesLoaded: false,
      categoriesLoaded: true,
    });
  });

  it('rejects invalid optional category fields', async () => {
    vi.stubGlobal('fetch', blogIndexFetch(article, [{ ...category, articles_count: '12' }]));

    const result = await onBeforeRender({ urlPathname: '/blog' });

    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({
      articlesLoaded: true,
      categories: [],
      categoriesLoaded: false,
    });
  });

  it('does not throw when both blog index requests fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('API unavailable')));

    await expect(onBeforeRender({ urlPathname: '/blog' })).resolves.toMatchObject({
      pageContext: {
        routeStatusCode: 200,
        pageProps: {
          initialBlogIndexData: {
            articles: [],
            categories: [],
            articlesLoaded: false,
            categoriesLoaded: false,
          },
        },
      },
    });
  });

  it('preserves the existing article SSR flow', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: article }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await onBeforeRender({ urlPathname: '/blog/manage-construction' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/articles/manage-construction?track_view=0');
    expect(result.pageContext).toMatchObject({
      routeStatusCode: 200,
      pageProps: { initialBlogArticle: article },
    });
  });

  it('нормализует старый бренд до формирования HTML-данных и JSON-LD статьи', async () => {
    const legacyArticle: BlogArticle = {
      ...article,
      title: 'ProHelper помогает вести объект',
      excerpt: 'Команда ProHelper',
      content: '<p>Читайте https://prohelper.pro/blog/a</p>',
      meta_title: 'ProHelper — управление стройкой',
      meta_description: 'Команда ProHelper',
      og_title: 'ProHelper для команды',
      og_description: 'Сайт https://prohelper.pro/blog/a',
      author: { ...article.author, name: 'Команда ProHelper' },
      category: {
        ...article.category,
        name: 'Блог ProHelper',
        description: 'Материалы команды ProHelper',
        meta_title: 'Блог ProHelper о стройке',
        meta_description: 'Читайте ProHelper на https://prohelper.pro/blog',
      },
      tags: [{ id: 5, name: 'ProHelper', slug: 'prohelper' }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ success: true, data: legacyArticle })));

    const result = await onBeforeRender({ urlPathname: '/blog/manage-construction' });
    const serializedPageProps = JSON.stringify(result.pageContext.pageProps);
    const serializedDocumentProps = JSON.stringify(result.pageContext.documentProps);

    expect(result.pageContext.pageProps?.initialBlogArticle).toMatchObject({
      title: 'МОСТ помогает вести объект',
      excerpt: 'Команда МОСТ',
      content: '<p>Читайте https://1мост.рф/blog/a</p>',
      author: { name: 'Команда МОСТ' },
      category: { id: 7, slug: 'management', name: 'Блог МОСТ' },
      tags: [{ id: 5, slug: 'prohelper', name: 'МОСТ' }],
    });
    expect(result.pageContext.documentProps).toMatchObject({
      title: 'МОСТ — управление стройкой | МОСТ',
      description: 'Команда МОСТ',
    });
    expect(serializedPageProps).not.toContain('ProHelper');
    expect(serializedDocumentProps).not.toContain('ProHelper');
    expect(serializedDocumentProps).toContain('Команда МОСТ');
    expect(serializedDocumentProps).toContain('https://1мост.рф');
  });
});
