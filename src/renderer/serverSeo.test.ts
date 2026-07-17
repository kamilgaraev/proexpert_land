import { describe, expect, it } from 'vitest';
import { buildServerSeoPayload } from '@/renderer/serverSeo';
import { generateArticleSchema } from '@/utils/seo';

type StructuredDataNode = Record<string, unknown>;

const parseStructuredDataGraph = (structuredDataTag: string) => {
  const json = structuredDataTag.slice(
    structuredDataTag.indexOf('>') + 1,
    structuredDataTag.lastIndexOf('</script>'),
  );

  return JSON.parse(json) as { '@context': string; '@graph': StructuredDataNode[] };
};

const getGraphTypes = (structuredDataTag: string) =>
  parseStructuredDataGraph(structuredDataTag)['@graph'].map((node) => node['@type']);

describe('buildServerSeoPayload', () => {
  it('renders home SEO payload with faq schema and home og image', () => {
    const payload = buildServerSeoPayload('/');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://1мост.рф/og/home.png');
    expect(payload.allMeta).toContain('<meta property="og:image:type" content="image/png" />');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/');
    expect(payload.faviconTags).toContain('/site.webmanifest.json');
    expect(payload.faviconTags).toContain('/favicon-120x120.png');
    expect(payload.allMeta).toContain('<meta name="geo.region" content="RU-MOW" />');
    expect(payload.allMeta).toContain('<meta name="geo.placename" content="Москва" />');
    expect(getGraphTypes(payload.structuredDataTag)).toEqual([
      'Organization',
      'WebSite',
      'SoftwareApplication',
      'WebPage',
      'FAQPage',
    ]);
  });

  it('renders offers only on pricing', () => {
    const payloads = {
      home: buildServerSeoPayload('/'),
      pricing: buildServerSeoPayload('/pricing'),
      features: buildServerSeoPayload('/features'),
      cluster: buildServerSeoPayload('/construction-crm'),
      blog: buildServerSeoPayload('/blog'),
    };

    expect(getGraphTypes(payloads.pricing.structuredDataTag)).toEqual([
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'WebPage',
      'Product',
    ]);
    expect(JSON.stringify(parseStructuredDataGraph(payloads.pricing.structuredDataTag))).toContain('"offers"');

    for (const [page, payload] of Object.entries(payloads)) {
      const graph = parseStructuredDataGraph(payload.structuredDataTag);

      expect(JSON.stringify(graph), page).not.toContain('AggregateRating');
      if (page !== 'pricing') {
        expect(JSON.stringify(graph), page).not.toContain('"offers"');
      }
    }
  });

  it('renders cluster schema for commercial landing pages', () => {
    const payload = buildServerSeoPayload('/construction-crm');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://1мост.рф/og/construction-crm.png');
    expect(payload.structuredDataTag).toContain('"@type":"Service"');
    expect(payload.structuredDataTag).not.toContain('"@type":"HowTo"');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
    expect(getGraphTypes(payload.structuredDataTag)).toEqual([
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'WebPage',
      'Service',
      'ItemList',
      'FAQPage',
    ]);
  });

  it('returns indexable metadata for known marketing pages', () => {
    const payload = buildServerSeoPayload('/features');

    expect(payload.statusCode).toBe(200);
    expect(payload.title).toContain('Возможности МОСТ');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/features');
    expect(payload.allMeta).toContain('index, follow');
    expect(payload.structuredDataTag).toContain('application/ld+json');
    expect(getGraphTypes(payload.structuredDataTag)).toEqual([
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'WebPage',
    ]);
  });

  it('renders blog payload with blog og image', () => {
    const payload = buildServerSeoPayload('/blog');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://1мост.рф/og/blog.png');
    expect(payload.allMeta).toContain('<meta name="robots" content="index, follow');
    expect(getGraphTypes(payload.structuredDataTag)).toEqual([
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'CollectionPage',
    ]);
  });

  it('uses server-provided article metadata for dynamic blog article pages', () => {
    const payload = buildServerSeoPayload('/blog/test-article', {
      title: 'Тестовая статья | МОСТ',
      description: 'Описание тестовой статьи для поисковой выдачи.',
      canonicalUrl: 'https://1мост.рф/blog/test-article',
      ogImage: 'https://1мост.рф/og/contractor-control.svg',
      type: 'article',
      statusCode: 200,
      structuredData: [
        generateArticleSchema({
          title: 'Тестовая статья',
          description: 'Описание тестовой статьи для поисковой выдачи.',
          author: 'ProHelper',
          category: 'Управление строительством',
          url: 'https://1мост.рф/blog/test-article',
        }),
      ],
    });

    expect(payload.statusCode).toBe(200);
    expect(payload.title).toBe('Тестовая статья | МОСТ');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/blog/test-article');
    expect(payload.allMeta).toContain('<meta property="og:type" content="article" />');
    expect(payload.allMeta).toContain('https://1мост.рф/og/contractor-control.png');
    expect(payload.allMeta).not.toContain('https://1мост.рф/og/contractor-control.svg');
    expect(payload.structuredDataTag).toContain('"@type":"BlogPosting"');
    expect(getGraphTypes(payload.structuredDataTag)).toEqual([
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'WebPage',
      'BlogPosting',
    ]);
    const article = parseStructuredDataGraph(payload.structuredDataTag)['@graph'].find(
      (node) => node['@type'] === 'BlogPosting',
    );

    expect(article?.publisher).toEqual(expect.objectContaining({ name: 'МОСТ' }));
    expect(article?.mainEntityOfPage).toBe('https://1мост.рф/blog/test-article');
    expect(parseStructuredDataGraph(payload.structuredDataTag)['@graph']).toHaveLength(5);
  });

  it.each([
    [
      'malicious fields',
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Статья с подменой',
        publisher: {
          '@type': 'Organization',
          name: 'Подменённое издательство',
          url: 'https://example.test',
        },
        mainEntityOfPage: 'https://api.example.test/articles/42',
      },
    ],
    [
      'missing fields',
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Статья без издательства',
      },
    ],
  ])('normalizes custom BlogPosting with %s', (_case, structuredData) => {
    const canonicalUrl = 'https://1мост.рф/blog/secure-article';
    const payload = buildServerSeoPayload('/blog/secure-article', {
      title: 'Безопасная статья | МОСТ',
      description: 'Описание безопасной статьи.',
      canonicalUrl,
      type: 'article',
      statusCode: 200,
      structuredData,
    });
    const article = parseStructuredDataGraph(payload.structuredDataTag)['@graph'].find(
      (node) => node['@type'] === 'BlogPosting',
    );

    expect(article?.publisher).toEqual({
      '@type': 'Organization',
      '@id': 'https://1мост.рф/#organization',
      name: 'МОСТ',
      url: 'https://1мост.рф',
    });
    expect(article?.mainEntityOfPage).toBe(canonicalUrl);
  });

  it('escapes tag-opening characters in the SSR graph', () => {
    const payload = buildServerSeoPayload('/blog/test-article', {
      title: 'Тестовая статья | МОСТ',
      description: 'Описание тестовой статьи.',
      canonicalUrl: 'https://1мост.рф/blog/test-article',
      type: 'article',
      statusCode: 200,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: '</script><div>Тест</div>',
      },
    });

    expect(payload.structuredDataTag).not.toContain('</script><div>');
    expect(
      parseStructuredDataGraph(payload.structuredDataTag)['@graph'].find(
        (node) => node['@type'] === 'BlogPosting',
      )?.headline,
    ).toBe(
      '</script><div>Тест</div>',
    );
  });

  it('returns noindex 404 metadata for unknown routes', () => {
    const payload = buildServerSeoPayload('/unknown-page');

    expect(payload.statusCode).toBe(404);
    expect(payload.allMeta).toContain('<meta name="robots" content="noindex, nofollow, noarchive"');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/');
    expect(payload.title).toBe('Страница не найдена | МОСТ');
    expect(payload.structuredDataTag).toBe('');
  });

  it('returns a true 404 payload for unknown paths', () => {
    const payload = buildServerSeoPayload('/non-existing-test-codex');

    expect(payload.statusCode).toBe(404);
    expect(payload.title).toContain('Страница не найдена');
    expect(payload.allMeta).toContain('noindex');
  });

  it('returns redirect payload for legacy alias routes', () => {
    const payload = buildServerSeoPayload('/docs');

    expect(payload.statusCode).toBe(301);
    expect(payload.redirectTarget).toBe('/features');
  });
});
