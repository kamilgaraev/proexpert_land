import { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSEO } from './useSEO';

type SeoProps = Parameters<typeof useSEO>[0];

const SeoHarness = ({ path, seo }: { path: string; seo?: SeoProps }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(path);
  }, [navigate, path]);

  useSEO(seo);

  return null;
};

const renderSeo = (path: string, seo?: SeoProps) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <SeoHarness path={path} seo={seo} />
    </MemoryRouter>,
  );

const graphTypes = () => {
  const script = document.querySelector<HTMLScriptElement>('#ld-json');
  const graph = JSON.parse(script?.textContent ?? '{}') as { '@graph'?: Array<Record<string, unknown>> };

  return graph['@graph']?.map((node) => node['@type']) ?? [];
};

describe('useSEO structured data policy', () => {
  beforeEach(() => {
    document.head.innerHTML = [
      '<script id="ld-json" type="application/ld+json">{"@graph":[]}</script>',
      '<script id="webpage-schema" type="application/ld+json">{}</script>',
      '<script id="software-schema" type="application/ld+json">{}</script>',
      '<script id="organization-schema" type="application/ld+json">{}</script>',
      '<script id="custom-structured-data" type="application/ld+json">{}</script>',
      '<script id="breadcrumb-schema" type="application/ld+json">{}</script>',
      '<script id="faq-schema" type="application/ld+json">{}</script>',
      '<script id="product-schema" type="application/ld+json">{}</script>',
      '<script id="dynamic-seo" type="application/ld+json">{}</script>',
      '<script data-seo="auto" data-schema-id="schema-0" type="application/ld+json">{}</script>',
    ].join('');
  });

  it('updates the single SSR script on navigation and removes legacy schema scripts', async () => {
    const view = renderSeo('/?utm_source=test');

    await waitFor(() => {
      expect(graphTypes()).toEqual([
        'Organization',
        'WebSite',
        'SoftwareApplication',
        'WebPage',
        'FAQPage',
      ]);
    });

    expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://1мост.рф/');

    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <SeoHarness path="/features?utm_source=test" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(graphTypes()).toEqual(['Organization', 'BreadcrumbList', 'WebPage']);
    });

    expect(document.querySelectorAll('#ld-json')).toHaveLength(1);
    expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://1мост.рф/features',
    );
  });

  it('removes article timestamps and structured data after leaving an article', async () => {
    const view = renderSeo('/blog/test-article', {
      title: 'Тестовая статья | МОСТ',
      description: 'Описание статьи.',
      type: 'article',
      publishedTime: '2026-01-01T00:00:00Z',
      modifiedTime: '2026-01-02T00:00:00Z',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Тестовая статья',
      },
    });

    await waitFor(() => {
      expect(graphTypes()).toContain('BlogPosting');
    });
    expect(document.querySelector('meta[property="article:published_time"]')).not.toBeNull();
    expect(document.querySelector('meta[property="article:modified_time"]')).not.toBeNull();

    view.rerender(
      <MemoryRouter initialEntries={['/blog/test-article']}>
        <SeoHarness path="/features" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(graphTypes()).toEqual(['Organization', 'BreadcrumbList', 'WebPage']);
    });
    expect(document.querySelector('meta[property="article:published_time"]')).toBeNull();
    expect(document.querySelector('meta[property="article:modified_time"]')).toBeNull();
  });

  it('removes the graph for noindex pages', async () => {
    renderSeo('/login');

    await waitFor(() => {
      expect(document.querySelector('#ld-json')).toBeNull();
    });
    expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
  });
});
