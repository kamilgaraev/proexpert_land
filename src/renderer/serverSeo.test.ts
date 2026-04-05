import { describe, expect, it } from 'vitest';
import { buildServerSeoPayload } from '@/renderer/serverSeo';

describe('buildServerSeoPayload', () => {
  it('renders home SEO payload with faq schema and home og image', () => {
    const payload = buildServerSeoPayload('/');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://prohelper.pro/og/home.svg');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
    expect(payload.canonicalUrl).toBe('https://prohelper.pro');
  });

  it('renders cluster schema for commercial landing pages', () => {
    const payload = buildServerSeoPayload('/construction-crm');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://prohelper.pro/og/construction-crm.svg');
    expect(payload.structuredDataTag).toContain('"@type":"Service"');
    expect(payload.structuredDataTag).toContain('"@type":"HowTo"');
    expect(payload.structuredDataTag).toContain('"@type":"FAQPage"');
  });

  it('renders blog payload with blog og image', () => {
    const payload = buildServerSeoPayload('/blog');

    expect(payload.statusCode).toBe(200);
    expect(payload.allMeta).toContain('https://prohelper.pro/og/blog.svg');
    expect(payload.allMeta).toContain('<meta name="robots" content="index, follow');
  });

  it('returns noindex 404 metadata for unknown routes', () => {
    const payload = buildServerSeoPayload('/unknown-page');

    expect(payload.statusCode).toBe(404);
    expect(payload.allMeta).toContain('<meta name="robots" content="noindex, nofollow, noarchive"');
    expect(payload.canonicalUrl).toBe('https://prohelper.pro/unknown-page');
    expect(payload.title).toBe('Страница не найдена | ProHelper');
  });

  it('returns redirect payload for legacy alias routes', () => {
    const payload = buildServerSeoPayload('/docs');

    expect(payload.statusCode).toBe(301);
    expect(payload.redirectTarget).toBe('/features');
  });
});
