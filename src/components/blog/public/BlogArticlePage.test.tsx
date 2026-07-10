import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BlogArticlePage from './BlogArticlePage';
import { useSEO } from '@/hooks/useSEO';

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
      'noindex, nofollow',
    );
    expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
    expect(document.querySelector('#ld-json')).toBeNull();
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
      'noindex, nofollow',
    );
    expect(document.querySelector('meta[name="googlebot"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
    expect(document.querySelector('#ld-json')).toBeNull();
  });
});
