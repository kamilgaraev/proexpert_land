import { describe, expect, it } from 'vitest';
import { buildServerSeoPayload } from '@/renderer/serverSeo';

describe('buildServerSeoPayload', () => {
  it('renders home SEO payload with faq schema and home og image', () => {
    const payload = buildServerSeoPayload('/');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://prohelper.pro/og/home.svg');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
    expect(payload.canonicalUrl).toBe('https://prohelper.pro/');
    expect(payload.faviconTags).toContain('/site.webmanifest.json');
  });

  it('renders cluster schema for commercial landing pages', () => {
    const payload = buildServerSeoPayload('/construction-crm');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://prohelper.pro/og/construction-crm.svg');
    expect(payload.structuredDataTag).toContain('"@type":"Service"');
    expect(payload.structuredDataTag).toContain('"@type":"HowTo"');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
  });

  it('returns indexable metadata for known marketing pages', () => {
    const payload = buildServerSeoPayload('/features');

    expect(payload.statusCode).toBe(200);
    expect(payload.title).toContain('Возможности ProHelper');
    expect(payload.canonicalUrl).toBe('https://prohelper.pro/features');
    expect(payload.allMeta).toContain('index, follow');
    expect(payload.structuredDataTag).toContain('application/ld+json');
  });

  it('renders blog payload with blog og image', () => {
    const payload = buildServerSeoPayload('/blog');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://prohelper.pro/og/blog.svg');
    expect(payload.allMeta).toContain('<meta name="robots" content="index, follow');
  });

  it('uses server-provided article metadata for dynamic blog article pages', () => {
    const payload = buildServerSeoPayload('/blog/test-article', {
      title: 'Тестовая статья | ProHelper',
      description: 'Описание тестовой статьи для поисковой выдачи.',
      canonicalUrl: 'https://prohelper.pro/blog/test-article',
      type: 'article',
      statusCode: 200,
      structuredData: [{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Тестовая статья',
      }],
    });

    expect(payload.statusCode).toBe(200);
    expect(payload.title).toBe('Тестовая статья | ProHelper');
    expect(payload.canonicalUrl).toBe('https://prohelper.pro/blog/test-article');
    expect(payload.allMeta).toContain('<meta property="og:type" content="article" />');
    expect(payload.structuredDataTag).toContain('"@type":"BlogPosting"');
  });

  it('returns noindex 404 metadata for unknown routes', () => {
    const payload = buildServerSeoPayload('/unknown-page');

    expect(payload.statusCode).toBe(404);
    expect(payload.allMeta).toContain('<meta name="robots" content="noindex, nofollow, noarchive"');
    expect(payload.canonicalUrl).toBe('https://prohelper.pro/');
    expect(payload.title).toBe('Страница не найдена | ProHelper');
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
