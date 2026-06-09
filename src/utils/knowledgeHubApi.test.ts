import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { clearAuthToken, saveAuthToken } from './authTokenStorage';
import { knowledgeHubApi } from './knowledgeHubApi';

const categoryFixture = {
  id: 1,
  title: 'Руководства',
  slug: 'guides',
  description: 'Пошаговые инструкции',
  icon: 'book-open',
  color: '#2563eb',
  articles_count: 2,
};

const articleFixture = {
  id: 10,
  kind: 'guide',
  kind_label: 'Руководство',
  status: 'published',
  title: 'Как пригласить администратора',
  slug: 'invite-admin',
  excerpt: 'Настройка доступа команды',
  category: categoryFixture,
  tags: ['доступы'],
  release_version: null,
  release_date: null,
  published_at: '2026-06-09T10:00:00+03:00',
  reading_time: 3,
  is_featured: true,
};

const server = setupServer(
  http.get('https://api.prohelper.pro/api/v1/landing/knowledge-hub/overview', () =>
    HttpResponse.json({
      success: true,
      data: {
        categories: [categoryFixture],
        featured_articles: [articleFixture],
        latest_changelog: [],
        summary: {
          categories_count: 1,
          articles_count: 1,
          changelog_count: 0,
        },
      },
    }),
  ),
  http.get('https://api.prohelper.pro/api/v1/landing/knowledge-hub/articles', ({ request }) => {
    const url = new URL(request.url);

    return HttpResponse.json({
      success: true,
      data: [articleFixture],
      meta: {
        current_page: Number(url.searchParams.get('page')),
        per_page: Number(url.searchParams.get('per_page')),
        last_page: 1,
        total: 1,
      },
    });
  }),
  http.get('https://api.prohelper.pro/api/v1/landing/knowledge-hub/articles/invite-admin', ({ request }) =>
    HttpResponse.json({
      success: true,
      data: {
        ...articleFixture,
        content: '<h2>Приглашение</h2><p>Откройте раздел команды.</p>',
        table_of_contents: [{ level: 2, title: 'Приглашение', anchor: 'priglashenie' }],
        related: [],
        auth_header: request.headers.get('authorization'),
      },
    }),
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  clearAuthToken();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('knowledgeHubApi', () => {
  it('loads overview from LandingResponse envelope', async () => {
    const overview = await knowledgeHubApi.getOverview();

    expect(overview.categories[0]?.slug).toBe('guides');
    expect(overview.featured_articles[0]?.slug).toBe('invite-admin');
    expect(overview.summary.articles_count).toBe(1);
  });

  it('passes filters to articles endpoint and unwraps pagination meta', async () => {
    const response = await knowledgeHubApi.getArticles({
      q: 'доступ',
      category: 'guides',
      page: 2,
      per_page: 6,
    });

    expect(response.data[0]?.slug).toBe('invite-admin');
    expect(response.meta.current_page).toBe(2);
    expect(response.meta.per_page).toBe(6);
  });

  it('adds the current bearer token to detail requests', async () => {
    saveAuthToken('lk-token', 'memory');

    const article = await knowledgeHubApi.getArticle('invite-admin');

    expect(article.slug).toBe('invite-admin');
    expect((article as typeof article & { auth_header?: string }).auth_header).toBe('Bearer lk-token');
  });
});
