import { describe, expect, it } from 'vitest';
import { buildServerSeoPayload } from '@/renderer/serverSeo';

describe('buildServerSeoPayload', () => {
  it('renders home SEO payload with faq schema and home og image', () => {
    const payload = buildServerSeoPayload('/');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://1мост.рф/og/home.png');
    expect(payload.allMeta).toContain('<meta property="og:image:type" content="image/png" />');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/');
    expect(payload.faviconTags).toContain('/site.webmanifest.json');
  });

  it('renders cluster schema for commercial landing pages', () => {
    const payload = buildServerSeoPayload('/construction-crm');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://1мост.рф/og/construction-crm.png');
    expect(payload.structuredDataTag).toContain('"@type":"Service"');
    expect(payload.structuredDataTag).toContain('"@type":"HowTo"');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
  });

  it('returns indexable metadata for known marketing pages', () => {
    const payload = buildServerSeoPayload('/features');

    expect(payload.statusCode).toBe(200);
    expect(payload.title).toContain('Возможности МОСТ');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/features');
    expect(payload.allMeta).toContain('index, follow');
    expect(payload.structuredDataTag).toContain('application/ld+json');
  });

  it('renders blog payload with blog og image', () => {
    const payload = buildServerSeoPayload('/blog');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://1мост.рф/og/blog.png');
    expect(payload.allMeta).toContain('<meta name="robots" content="index, follow');
  });

  it('uses server-provided article metadata for dynamic blog article pages', () => {
    const payload = buildServerSeoPayload('/blog/test-article', {
      title: 'Тестовая статья | МОСТ',
      description: 'Описание тестовой статьи для поисковой выдачи.',
      canonicalUrl: 'https://1мост.рф/blog/test-article',
      ogImage: 'https://1мост.рф/og/contractor-control.svg',
      type: 'article',
      statusCode: 200,
      structuredData: [{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Тестовая статья',
      }],
    });

    expect(payload.statusCode).toBe(200);
    expect(payload.title).toBe('Тестовая статья | МОСТ');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/blog/test-article');
    expect(payload.allMeta).toContain('<meta property="og:type" content="article" />');
    expect(payload.allMeta).toContain('https://1мост.рф/og/contractor-control.png');
    expect(payload.allMeta).not.toContain('https://1мост.рф/og/contractor-control.svg');
    expect(payload.structuredDataTag).toContain('"@type":"BlogPosting"');
  });

  it('returns noindex 404 metadata for unknown routes', () => {
    const payload = buildServerSeoPayload('/unknown-page');

    expect(payload.statusCode).toBe(404);
    expect(payload.allMeta).toContain('<meta name="robots" content="noindex, nofollow, noarchive"');
    expect(payload.canonicalUrl).toBe('https://1мост.рф/');
    expect(payload.title).toBe('Страница не найдена | МОСТ');
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
