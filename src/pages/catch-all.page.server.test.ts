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

describe('blog URL pagination', () => {
  const installPaginationApi = (lastPage = 3) => {
    const mock = vi.fn((input: string | URL | Request) => {
      const url = new URL(String(input));
      const page = Number(url.searchParams.get('page') || 1);
      return Promise.resolve(url.pathname.endsWith('/categories')
        ? jsonResponse({ success: true, data: [category] })
        : jsonResponse({ success: true, data: { data: page > lastPage ? [] : [{ ...article, id: page, title: `Страница ${page}` }], meta: { current_page: page, last_page: lastPage, per_page: 12, total: 30 } } }));
    });
    vi.stubGlobal('fetch', mock);
    return mock;
  };

  it.each([
    ['/blog?page=2', '/articles?'],
    ['/blog?page=2', '/categories'],
    ['/blog/category/management?page=2', '/articles?'],
    ['/blog/category/management?page=2', '/categories'],
  ])('marks API failure as 503/noindex for %s when %s fails', async (urlOriginal, failedResource) => {
    vi.stubGlobal('fetch', vi.fn((input) => Promise.resolve(String(input).includes(failedResource)
      ? new Response('Unavailable', { status: 503 })
      : String(input).includes('/categories')
        ? jsonResponse({ success: true, data: [category] })
        : jsonResponse({ success: true, data: { data: [article], meta: { current_page: 2, last_page: 3, per_page: 12, total: 30 } } }))));
    const result = await onBeforeRender({ urlPathname: urlOriginal.split('?')[0], urlOriginal });
    expect(result.pageContext.routeStatusCode).toBe(503);
    expect(result.pageContext.documentProps).toMatchObject({ noIndex: true, statusCode: 503 });
    const data = result.pageContext.pageProps?.initialBlogIndexData ?? result.pageContext.pageProps?.initialBlogCategoryData;
    expect(data).toMatchObject({ unavailable: true, notFound: false });
  });

  it('distinguishes an empty Laravel out-of-range result from nonempty invalid metadata', async () => {
    const respond = (items: BlogArticle[]) => vi.fn((input) => Promise.resolve(String(input).includes('/categories')
      ? jsonResponse({ success: true, data: [category] })
      : jsonResponse({ success: true, data: { data: items, meta: { current_page: 2, last_page: 1, per_page: 12, total: 1 } } })));
    vi.stubGlobal('fetch', respond([article]));
    const invalid = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?page=2' });
    expect(invalid.pageContext.routeStatusCode).toBe(503);
    expect(invalid.pageContext.pageProps?.initialBlogIndexData).toMatchObject({ unavailable: true, notFound: false, articles: [] });
    vi.stubGlobal('fetch', respond([]));
    const absent = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?page=2' });
    expect(absent.pageContext.routeStatusCode).toBe(404);
    expect(absent.pageContext.pageProps?.initialBlogIndexData).toMatchObject({ unavailable: false, notFound: true, articles: [] });
  });

  it('SSR fetches page 2 once and makes its clean URL canonical', async () => {
    const mock = installPaginationApi();
    const result = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?page=2' });
    expect(mock).toHaveBeenCalledTimes(2);
    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({ queryKey: 'category=&search=&page=2', articles: [{ title: 'Страница 2' }], notFound: false });
    expect(result.pageContext.documentProps).toMatchObject({ canonicalUrl: 'https://1мост.рф/blog?page=2', noIndex: false, statusCode: 200 });
  });

  it('SSR sends category and search filters with the exact page', async () => {
    const mock = installPaginationApi();
    const result = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?category=management&search=budget&page=2' });
    const articleUrl = new URL(String(mock.mock.calls.find(([url]) => String(url).includes('/articles?'))?.[0]));
    expect(Object.fromEntries(articleUrl.searchParams)).toMatchObject({ page: '2', category_id: '7', search: 'budget', per_page: '12' });
    expect(result.pageContext.documentProps?.noIndex).toBe(true);
    expect(result.pageContext.pageProps?.initialBlogIndexData?.queryKey).toBe('category=management&search=budget&page=2');
  });

  it.each(['0', '-1', '1.5', 'no', '9007199254740992', '2&page=3', ''])('rejects invalid page=%s without requesting articles', async (value) => {
    const mock = installPaginationApi();
    const result = await onBeforeRender({ urlPathname: '/blog', urlOriginal: `/blog?page=${value}` });
    expect(result.pageContext.routeStatusCode).toBe(404);
    expect(result.pageContext.pageProps?.initialBlogIndexData).toMatchObject({ articles: [], articlesLoaded: true, notFound: true });
    expect(mock.mock.calls.some(([url]) => String(url).includes('/articles?'))).toBe(false);
  });

  it('does not turn an unknown category filter into the unfiltered list', async () => {
    const mock = installPaginationApi();
    const result = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?category=missing' });
    expect(result.pageContext.routeStatusCode).toBe(404);
    expect(result.pageContext.pageProps?.initialBlogIndexData?.articles).toEqual([]);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('rejects out of range pages and suppresses an API first-page substitute', async () => {
    installPaginationApi(1);
    const result = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?page=2' });
    expect(result.pageContext.routeStatusCode).toBe(404);
    expect(result.pageContext.pageProps?.initialBlogIndexData?.articles).toEqual([]);
    vi.stubGlobal('fetch', blogIndexFetch(article, [category]));
    const clamped = await onBeforeRender({ urlPathname: '/blog', urlOriginal: '/blog?page=2' });
    expect(clamped.pageContext.routeStatusCode).toBe(404);
    expect(clamped.pageContext.pageProps?.initialBlogIndexData?.articles).toEqual([]);
  });

  it('restores category page 2, and search inside a category remains noindex', async () => {
    installPaginationApi();
    const result = await onBeforeRender({ urlPathname: '/blog/category/management', urlOriginal: '/blog/category/management?page=2' });
    expect(result.pageContext.pageProps?.initialBlogCategoryData).toMatchObject({ articles: [{ title: 'Страница 2' }], queryKey: 'category=management&search=&page=2', notFound: false, pageNotFound: false });
    expect(result.pageContext.documentProps).toMatchObject({ canonicalUrl: 'https://1мост.рф/blog/category/management?page=2', noIndex: false });
    const filtered = await onBeforeRender({ urlPathname: '/blog/category/management', urlOriginal: '/blog/category/management?search=budget&page=2' });
    expect(filtered.pageContext.documentProps?.noIndex).toBe(true);
  });
});

describe('catch-all blog category SSR', () => {
  it('loads category articles and returns category-specific document metadata', async () => {
    const fetchMock = blogIndexFetch(article, [category]);
    vi.stubGlobal('fetch', fetchMock);
    const result = await onBeforeRender({ urlPathname: '/blog/category/management/' });
    expect(result.pageContext.routeStatusCode).toBe(200);
    expect(result.pageContext.documentProps).toMatchObject({
      title: 'Управление — блог МОСТ',
      description: 'Подборка материалов МОСТ по теме «Управление».',
      canonicalUrl: 'https://1мост.рф/blog/category/management',
      noIndex: false,
    });
    expect(result.pageContext.pageProps?.initialBlogCategoryData).toMatchObject({
      category, articles: [article], categoriesLoaded: true, articlesLoaded: true, notFound: false,
    });
    expect(String(fetchMock.mock.calls[1][0])).toContain('category_id=7');
  });

  it('returns a real 404 only when a valid category catalogue lacks the slug', async () => {
    const fetchMock = blogIndexFetch(article, [category]);
    vi.stubGlobal('fetch', fetchMock);
    const result = await onBeforeRender({ urlPathname: '/blog/category/missing' });
    expect(result.pageContext.routeStatusCode).toBe(404);
    expect(result.pageContext.documentProps).toMatchObject({ noIndex: true, statusCode: 404 });
    expect(result.pageContext.pageProps?.initialBlogCategoryData?.notFound).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([new Response('Unavailable', { status: 503 }), jsonResponse({ success: true, data: { invalid: true } })])('does not turn a failed catalogue into a missing category', async (response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    const result = await onBeforeRender({ urlPathname: '/blog/category/management' });
    expect(result.pageContext.routeStatusCode).toBe(503);
    expect(result.pageContext.documentProps?.noIndex).toBe(true);
    expect(result.pageContext.pageProps?.initialBlogCategoryData).toMatchObject({ categoriesLoaded: false, notFound: false, unavailable: true });
  });

  it('keeps known category metadata when article loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn((input) => Promise.resolve(String(input).includes('/categories')
      ? jsonResponse({ success: true, data: [category] })
      : new Response('Unavailable', { status: 503 }))));
    const result = await onBeforeRender({ urlPathname: '/blog/category/management' });
    expect(result.pageContext.pageProps?.initialBlogCategoryData).toMatchObject({ category, categoriesLoaded: true, articlesLoaded: false, notFound: false });
    expect(result.pageContext.documentProps?.title).toBe('Управление — блог МОСТ');
  });
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
      unavailable: false,
      notFound: false,
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

  it('не прерывает SSR, если API вернул SEO-ключи строкой', async () => {
    const articleWithStringKeywords = {
      ...article,
      meta_keywords: 'срыв сроков, перерасход бюджета, контроль стройки',
    } as unknown as BlogArticle;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      data: articleWithStringKeywords,
    })));

    const result = await onBeforeRender({ urlPathname: '/blog/manage-construction' });

    expect(result.pageContext).toMatchObject({
      routeStatusCode: 200,
      documentProps: {
        keywords: 'срыв сроков, перерасход бюджета, контроль стройки',
      },
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
