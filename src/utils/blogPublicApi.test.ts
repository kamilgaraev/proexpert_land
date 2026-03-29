import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { blogPublicApi } from './blogPublicApi';

const articleFixture = {
  id: 42,
  title: 'Черновик статьи',
  slug: 'draft-article',
  excerpt: 'Короткое описание',
  content: '<p>Контент статьи</p>',
  featured_image: 'https://cdn.example.test/cover.jpg',
  gallery_images: [],
  meta_title: 'Черновик статьи',
  meta_description: 'Описание черновика',
  meta_keywords: ['prohelper'],
  og_title: 'Черновик статьи',
  og_description: 'Описание черновика',
  og_image: 'https://cdn.example.test/cover.jpg',
  structured_data: { '@type': 'BlogPosting' },
  status: 'draft',
  published_at: null,
  scheduled_at: null,
  views_count: 0,
  likes_count: 0,
  comments_count: 0,
  reading_time: 1,
  estimated_reading_time: 1,
  is_featured: false,
  allow_comments: true,
  is_published_in_rss: false,
  noindex: true,
  sort_order: 0,
  url: '/blog/draft-article',
  is_published: false,
  readable_published_at: '',
  category: {
    id: 7,
    name: 'Операции',
    slug: 'operations',
    color: '#0f172a',
    sort_order: 1,
    is_active: true,
    created_at: '2026-03-29T10:00:00.000000Z',
    updated_at: '2026-03-29T10:00:00.000000Z',
  },
  author: {
    id: 3,
    name: 'Content Manager',
    email: 'content@example.test',
  },
  tags: [
    {
      id: 5,
      name: 'cms',
      slug: 'cms',
    },
  ],
  created_at: '2026-03-29T10:00:00.000000Z',
  updated_at: '2026-03-29T11:00:00.000000Z',
};

const server = setupServer(
  http.get('https://api.prohelper.pro/api/v1/blog/articles', () =>
    HttpResponse.json({
      success: true,
      data: {
        data: [articleFixture],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 12,
          total: 1,
        },
        links: {
          first: 'https://api.prohelper.pro/api/v1/blog/articles?page=1',
          last: 'https://api.prohelper.pro/api/v1/blog/articles?page=1',
          prev: null,
          next: null,
        },
      },
    }),
  ),
  http.get('https://api.prohelper.pro/api/v1/blog/preview/42', () =>
    HttpResponse.json({
      success: true,
      data: articleFixture,
    }),
  ),
  http.get('https://api.prohelper.pro/api/v1/blog/categories', () =>
    HttpResponse.json({
      success: true,
      data: {
        data: [articleFixture.category],
      },
    }),
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('blogPublicApi', () => {
  it('unwraps paginated article lists from LandingResponse envelope', async () => {
    const response = await blogPublicApi.getArticles({ page: 1, per_page: 12 });

    expect(response.data.data).toHaveLength(1);
    expect(response.data.data[0]?.slug).toBe('draft-article');
    expect(response.data.meta?.current_page).toBe(1);
    expect(response.data.links?.next).toBeNull();
  });

  it('wraps preview article payload into the shape expected by public pages', async () => {
    const response = await blogPublicApi.getPreviewArticle(42, new URLSearchParams({ signature: 'signed' }));

    expect(response.data.data.id).toBe(42);
    expect(response.data.data.status).toBe('draft');
    expect(response.data.data.category.slug).toBe('operations');
  });

  it('unwraps resource collections for categories without adding an extra data level', async () => {
    const response = await blogPublicApi.getCategories();

    expect(response.data.data).toHaveLength(1);
    expect(response.data.data[0]?.slug).toBe('operations');
  });
});
