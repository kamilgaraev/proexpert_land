import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogArticlePage from './BlogArticlePage';
import { useSEO } from '@/hooks/useSEO';
import type { BlogArticle } from '@/types/blog';

const blogApiMocks = vi.hoisted(() => ({
  getArticle: vi.fn(),
  getPreviewArticle: vi.fn(),
  getRelatedArticles: vi.fn(),
}));

vi.mock('@/utils/blogPublicApi', () => ({
  blogPublicApi: blogApiMocks,
}));

vi.mock('./BlogPublicLayout', () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));

vi.mock('./BlogSidebar', () => ({ default: () => <aside /> }));
vi.mock('./BlogArticleCard', () => ({ default: () => <article /> }));

const BlogIndex = () => {
  useSEO({
    title: 'Блог МОСТ',
    description: 'Материалы МОСТ.',
  });

  return <Link to="/blog/missing-article">Открыть отсутствующую статью</Link>;
};

const renderRoutes = (articleElement: ReactNode, initialEntry = '/blog/missing-article') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={articleElement} />
      </Routes>
    </MemoryRouter>,
  );

const createArticle = (slug: string): BlogArticle => ({
  id: 1,
  title: 'Старая статья',
  slug,
  excerpt: 'Описание старой статьи.',
  content: '<p>Материал</p>',
  status: 'published',
  published_at: '2026-01-01T00:00:00Z',
  views_count: 10,
  likes_count: 0,
  comments_count: 0,
  reading_time: 1,
  estimated_reading_time: 1,
  is_featured: false,
  allow_comments: true,
  is_published_in_rss: true,
  noindex: false,
  sort_order: 1,
  url: `/blog/${slug}`,
  is_published: true,
  category: {
    id: 1,
    name: 'Управление',
    slug: 'management',
    color: '#000000',
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  author: {
    id: 1,
    name: 'МОСТ',
    email: null,
  },
  tags: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

describe('BlogArticlePage SEO for unavailable articles', () => {
  beforeEach(() => {
    blogApiMocks.getArticle.mockReset();
    blogApiMocks.getPreviewArticle.mockReset();
    blogApiMocks.getRelatedArticles.mockReset();
    document.head.innerHTML = [
      '<script id="ld-json" type="application/ld+json">{"@context":"https://schema.org","@graph":[]}</script>',
      '<meta name="robots" content="index, follow">',
      '<meta name="googlebot" content="index, follow">',
    ].join('');
  });

  it('preserves the server 404 SEO state during hydration', async () => {
    renderRoutes(
      <BlogArticlePage
        initialArticleNotFound
        initialArticleNotFoundSlug="missing-article"
      />,
    );

    await screen.findByText('Статья не найдена');

    expect(blogApiMocks.getArticle).not.toHaveBeenCalled();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow, noarchive',
    );
    expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
    expect(document.querySelector('#ld-json')).toBeNull();
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://1мост.рф/blog',
    );
  });

  it('switches from the blog graph to noindex after a client 404', async () => {
    blogApiMocks.getArticle.mockRejectedValue({ response: { status: 404 } });
    renderRoutes(<BlogArticlePage />, '/blog');

    await waitFor(() => {
      expect(document.querySelector('#ld-json')).not.toBeNull();
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('index, follow');
    });

    fireEvent.click(screen.getByRole('link', { name: 'Открыть отсутствующую статью' }));
    await screen.findByText('Статья не найдена');

    expect(blogApiMocks.getArticle).toHaveBeenCalledWith('missing-article');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow, noarchive',
    );
    expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
    expect(document.querySelector('#ld-json')).toBeNull();
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://1мост.рф/blog',
    );
  });

  it('does not retain previous article SEO while the next slug is loading', async () => {
    const nextArticleRequest = new Promise(() => {});
    blogApiMocks.getArticle.mockImplementation((slug: string) => (
      slug === 'old-article'
        ? Promise.resolve({ data: { data: createArticle(slug) } })
        : nextArticleRequest
    ));
    blogApiMocks.getRelatedArticles.mockResolvedValue({ data: { data: [] } });

    renderRoutes(
      <>
        <Link to="/blog/new-article">Открыть новую статью</Link>
        <BlogArticlePage />
      </>,
      '/blog/old-article',
    );

    await waitFor(() => {
      expect(document.title).toBe('Старая статья | МОСТ');
    });

    fireEvent.click(screen.getByRole('link', { name: 'Открыть новую статью' }));

    await waitFor(() => {
      expect(document.title).toBe('Блог МОСТ');
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://1мост.рф/blog/new-article',
      );
      expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      );
    });

    expect(document.title).not.toContain('Старая статья');
  });
});
