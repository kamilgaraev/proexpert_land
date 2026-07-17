import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { marketingSitemapRoutes } from '@/data/marketingRegistry';
import { buildArticleDocumentProps } from '@/pages/catch-all.page.server';
import { normalizeArticleTitleBrand } from './seo';
import {
  buildStructuredDataGraph,
  generateArticleSchema,
  generateSoftwareSchema,
  getPageSEOData,
  normalizeOgImageUrl,
} from '@/utils/seo';

const require = createRequire(import.meta.url);
const { renderSitemapXml, validateSitemapRoutes } = require(path.resolve(process.cwd(), 'server/sitemap.cjs')) as {
  renderSitemapXml: (articles?: Array<{
    slug?: string;
    url?: string;
    published_at?: string;
    updated_at?: string;
  }>) => string;
  validateSitemapRoutes: (routes: unknown) => void;
};

describe('getPageSEOData', () => {
  it('returns 404 metadata for unknown routes', () => {
    const seoData = getPageSEOData('/unknown-page');

    expect(seoData.statusCode).toBe(404);
    expect(seoData.noIndex).toBe(true);
    expect(seoData.title).toBe('Страница не найдена | МОСТ');
    expect(seoData.canonicalUrl).toBe('https://1мост.рф/');
    expect(seoData.ogImage).toBe('https://1мост.рф/og/404.png');
  });

  it('marks preview pages as noindex and keeps canonical path', () => {
    const seoData = getPageSEOData('/blog/preview/42');

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(true);
    expect(seoData.canonicalUrl).toBe('https://1мост.рф/blog/preview/42');
    expect(seoData.ogImage).toBe('https://1мост.рф/og/blog.png');
  });

  it('returns cluster structured data and route-specific og image', () => {
    const seoData = getPageSEOData('/construction-crm');
    const types = seoData.structuredData.map((node) => (node as Record<string, unknown>)['@type']);

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(false);
    expect(seoData.ogImage).toBe('https://1мост.рф/og/construction-crm.png');
    expect(types).toEqual(['Service', 'ItemList', 'FAQPage']);
    expect(types).not.toContain('HowTo');
  });

  it('does not expose HowTo on either SEO contract level for all sitemap routes', () => {
    expect(marketingSitemapRoutes).toHaveLength(35);

    for (const { path: pathname } of marketingSitemapRoutes) {
      const seoData = getPageSEOData(pathname);
      const graph = buildStructuredDataGraph({
        pathname,
        title: seoData.title,
        description: seoData.description,
        canonicalUrl: seoData.canonicalUrl,
        noIndex: seoData.noIndex,
        statusCode: seoData.statusCode,
        structuredData: seoData.structuredData,
      });

      expect(JSON.stringify(seoData.structuredData), `${pathname}: getPageSEOData`).not.toContain(
        '"@type":"HowTo"',
      );
      expect(JSON.stringify(graph), `${pathname}: buildStructuredDataGraph`).not.toContain(
        '"@type":"HowTo"',
      );
      expect(seoData.canonicalUrl, pathname).toBe(
        `https://1мост.рф${pathname === '/' ? '/' : pathname}`,
      );
    }
  });
});

describe('buildStructuredDataGraph', () => {
  const baseInput = {
    pathname: '/features',
    title: 'Возможности МОСТ',
    description: 'Описание возможностей МОСТ.',
    canonicalUrl: 'https://1мост.рф/features',
    noIndex: false,
    statusCode: 200,
  };

  it('normalizes arrays and nested graphs under one context and deduplicates identical nodes', () => {
    const duplicate = {
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: 'Проверенная сущность',
    };
    const graph = buildStructuredDataGraph({
      ...baseInput,
      structuredData: [
        duplicate,
        {
          '@context': 'https://schema.org',
          '@graph': [
            { name: 'Проверенная сущность', '@type': 'Thing', '@context': 'https://schema.org' },
            { '@type': 'Dataset', name: 'Данные страницы' },
          ],
        },
      ],
    });

    expect(graph['@context']).toBe('https://schema.org');
    expect(graph['@graph'].filter((node) => node['@type'] === 'Thing')).toHaveLength(1);
    expect(graph['@graph'].map((node) => node['@type'])).toEqual([
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'WebPage',
      'Thing',
      'Dataset',
    ]);
    expect(JSON.stringify(graph['@graph'])).not.toContain('"@context"');
  });

  it('returns self-canonical, service schema, and distinct OG image for product workflow pages', () => {
    const seoData = getPageSEOData('/construction-procurement');

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(false);
    expect(seoData.canonicalUrl).toBe('https://1мост.рф/construction-procurement');
    expect(seoData.ogImage).toBe('https://1мост.рф/og/construction-procurement.png');
    expect(seoData.structuredData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'Service' }),
      ]),
    );
  });

  it('returns an empty graph for noindex and non-success pages', () => {
    expect(buildStructuredDataGraph({ ...baseInput, noIndex: true })['@graph']).toEqual([]);
    expect(buildStructuredDataGraph({ ...baseInput, statusCode: 404 })['@graph']).toEqual([]);
  });

  it('rejects injected HowTo nodes from the final commercial graph', () => {
    const graph = buildStructuredDataGraph({
      ...baseInput,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Скрытая инструкция',
      },
    });

    expect(graph['@graph'].map((node) => node['@type'])).not.toContain('HowTo');
  });

  it('recursively removes forbidden custom schema while preserving allowed nested objects', () => {
    const graph = buildStructuredDataGraph({
      ...baseInput,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Допустимый продукт',
        aggregateRating: { '@type': 'AggregateRating', ratingValue: 5 },
        review: { '@type': 'Review', reviewBody: 'Скрытый отзыв' },
        reviews: [{ '@type': 'Review', reviewBody: 'Ещё один скрытый отзыв' }],
        subjectOf: {
          '@type': 'CreativeWork',
          mentions: [
            { '@type': 'HowTo', name: 'Скрытая инструкция' },
            { '@type': 'FAQPage', name: 'Скрытый FAQ' },
            {
              '@type': 'Thing',
              name: 'Допустимый вложенный узел',
              review: { '@type': 'Review', reviewBody: 'Вложенный отзыв' },
            },
          ],
        },
      },
    });
    const serialized = JSON.stringify(graph);

    expect(serialized).not.toContain('HowTo');
    expect(serialized).not.toContain('AggregateRating');
    expect(serialized).not.toContain('FAQPage');
    expect(serialized).not.toContain('"aggregateRating"');
    expect(serialized).not.toContain('"review"');
    expect(serialized).not.toContain('"reviews"');
    expect(serialized).toContain('Допустимый вложенный узел');
  });

  it('keeps only system Organization and WebSite nodes regardless of injected ids', () => {
    const graph = buildStructuredDataGraph({
      ...baseInput,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': 'https://example.test/#organization',
          name: 'Подменённая организация',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Подменённый сайт',
        },
        { '@context': 'https://schema.org', '@type': 'Thing', name: 'Допустимый узел' },
      ],
    });
    const organizations = graph['@graph'].filter((node) => node['@type'] === 'Organization');
    const webSites = graph['@graph'].filter((node) => node['@type'] === 'WebSite');

    expect(organizations).toEqual([
      expect.objectContaining({
        '@id': 'https://1мост.рф/#organization',
        name: 'МОСТ',
      }),
    ]);
    expect(webSites).toEqual([
      expect.objectContaining({
        '@id': 'https://1мост.рф/#website',
        name: 'МОСТ',
      }),
    ]);
    expect(graph['@graph']).toEqual(
      expect.arrayContaining([expect.objectContaining({ '@type': 'Thing', name: 'Допустимый узел' })]),
    );
  });

  it('keeps software offers opt-in', () => {
    expect(generateSoftwareSchema()).not.toHaveProperty('offers');
    expect(generateSoftwareSchema(true)).toHaveProperty('offers');
  });

  it('retains the system node when custom structured data repeats its id', () => {
    const graph = buildStructuredDataGraph({
      ...baseInput,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://1мост.рф/#organization',
        name: 'Подмененная организация',
      },
    });
    const organizations = graph['@graph'].filter((node) => node['@id'] === 'https://1мост.рф/#organization');

    expect(organizations).toHaveLength(1);
    expect(organizations[0].name).toBe('МОСТ');
  });

  it('публикует бесплатную базу, десять пакетов и полный комплект', () => {
    const graph = buildStructuredDataGraph({
      ...baseInput,
      pathname: '/pricing',
      title: 'Тарифы МОСТ',
      canonicalUrl: 'https://1мост.рф/pricing',
    });
    const product = graph['@graph'].find((node) => node['@type'] === 'Product');
    const offers = product?.offers as Array<Record<string, unknown>>;

    expect(offers).toHaveLength(12);
    expect(offers.map((offer) => [offer.name, offer.price])).toEqual(expect.arrayContaining([
      ['Начните бесплатно', '0'],
      ['Проекты и процессы', '9900'],
      ['Полный комплект', '79900'],
    ]));
    for (const offer of offers) {
      expect(offer.price).toEqual(expect.any(String));
      expect(offer.priceCurrency).toBe('RUB');
      expect(offer.priceSpecification).toEqual({
        '@type': 'UnitPriceSpecification',
        price: offer.price,
        priceCurrency: 'RUB',
        billingDuration: 'P30D',
      });
    }
  });

  it('normalizes the legacy article author brand to МОСТ', () => {
    const schema = generateArticleSchema({
      title: 'Статья',
      description: 'Описание статьи.',
      author: 'ProHelper',
      category: 'Управление',
      url: 'https://1мост.рф/blog/article',
    });

    expect(schema.author.name).toBe('МОСТ');
    expect(schema.publisher.name).toBe('МОСТ');
  });
});

describe('normalizeOgImageUrl', () => {
  it('converts static МОСТ OG svg images to png', () => {
    expect(normalizeOgImageUrl('https://1мост.рф/og/contractor-control.svg'))
      .toBe('https://1мост.рф/og/contractor-control.png');
    expect(normalizeOgImageUrl('/og/contractor-control.svg')).toBe('/og/contractor-control.png');
  });

  it('keeps external or already raster images unchanged', () => {
    expect(normalizeOgImageUrl('https://cdn.example.test/cover.svg')).toBe('https://cdn.example.test/cover.svg');
    expect(normalizeOgImageUrl('https://1мост.рф/og/contractor-control.png'))
      .toBe('https://1мост.рф/og/contractor-control.png');
  });
});

describe('sitemap sync', () => {
  it('keeps generated OG sources on the approved public МОСТ brand', () => {
    const generator = fs.readFileSync(path.resolve(process.cwd(), 'scripts', 'generate-og-images.mjs'), 'utf8');
    const generatedImage = fs.readFileSync(path.resolve(process.cwd(), 'public', 'og', 'construction-procurement.svg'), 'utf8');

    expect(generator).toContain('МОСТ');
    expect(generator).not.toContain('PROHELPER.PRO');
    expect(generatedImage).toContain('МОСТ');
    expect(generatedImage).not.toContain('PROHELPER.PRO');
  });

  it('rejects malformed or duplicate runtime sitemap registry entries', () => {
    const route = {
      path: '/features',
      pageKey: 'features',
      priority: 0.9,
      changefreq: 'weekly',
    };
    const invalidRegistries = [
      null,
      {},
      [{ ...route, path: 'features' }],
      [{ ...route, path: '/features/' }],
      [{ ...route, pageKey: '' }],
      [{ ...route, priority: -0.1 }],
      [{ ...route, changefreq: 'yearly' }],
      [{ ...route, unexpected: true }],
      [route, { ...route, pageKey: 'features-copy' }],
      [route, { ...route, path: '/features-copy' }],
    ];

    expect(typeof validateSitemapRoutes).toBe('function');

    for (const registry of invalidRegistries) {
      expect(() => validateSitemapRoutes(registry)).toThrow();
    }
  });

  it('loads the registry beside sitemap.cjs in a deploy-like directory', () => {
    const deployDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'prohelper-sitemap-'));

    try {
      fs.copyFileSync(
        path.resolve(process.cwd(), 'server', 'sitemap.cjs'),
        path.join(deployDirectory, 'sitemap.cjs'),
      );
      fs.writeFileSync(
        path.join(deployDirectory, 'sitemapRoutes.json'),
        JSON.stringify([
          { path: '/', pageKey: 'home', priority: 1, changefreq: 'weekly' },
        ]),
      );

      const deployedSitemap = require(path.join(deployDirectory, 'sitemap.cjs')) as {
        renderSitemapXml: () => string;
      };

      expect(deployedSitemap.renderSitemapXml().match(/<url>/g)).toHaveLength(1);
    } finally {
      fs.rmSync(deployDirectory, { recursive: true, force: true });
    }
  });

  it('keeps public robots on the readable .рф domain without legacy static artifacts', () => {
    const robotsTxt = fs.readFileSync(path.resolve(process.cwd(), 'public', 'robots.txt'), 'utf8');

    expect(robotsTxt).toContain('Host: 1мост.рф');
    expect(robotsTxt).toContain('Sitemap: https://1мост.рф/sitemap.xml');
    expect(robotsTxt).not.toContain('prohelper.pro');
    expect(robotsTxt).not.toContain('xn--1-xtbgmf');
    expect(fs.existsSync(path.resolve(process.cwd(), 'public', 'sitemap.xml'))).toBe(false);
    expect(fs.existsSync(path.resolve(process.cwd(), 'public', 'index.html'))).toBe(false);
  });

  it('contains every indexable marketing route from the registry', () => {
    const sitemapXml = renderSitemapXml();
    const sitemapDocument = new DOMParser().parseFromString(sitemapXml, 'application/xml');
    const sitemapEntries = Array.from(sitemapDocument.querySelectorAll('url'), (url) => ({
      loc: url.querySelector('loc')?.textContent,
      changefreq: url.querySelector('changefreq')?.textContent,
      priority: Number(url.querySelector('priority')?.textContent),
      lastmod: url.querySelector('lastmod')?.textContent ?? null,
    }));
    const expectedEntries = marketingSitemapRoutes.map((route) => ({
      loc: `https://1мост.рф${route.path === '/' ? '/' : route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
      lastmod: null,
    }));
    const sitemapUrls = sitemapEntries.map((entry) => entry.loc);

    expect(sitemapEntries).toEqual(expectedEntries);
    expect(sitemapUrls).not.toContain('https://1мост.рф/privacy');
    expect(sitemapUrls).not.toContain('https://1мост.рф/offer');
    expect(sitemapUrls).not.toContain('https://1мост.рф/cookies');
  });

  it('omits lastmod from static marketing URLs', () => {
    const sitemapXml = renderSitemapXml();

    expect(sitemapXml).not.toContain('<lastmod>');
  });

  it('has a generated raster OG image for every indexable marketing route', () => {
    const missingImages = marketingSitemapRoutes.flatMap((route) => {
      const seoData = getPageSEOData(route.path);
      const imageFileName = new URL(seoData.ogImage).pathname.match(/^\/og\/([^/?#]+\.png)$/)?.[1];

      if (imageFileName && fs.existsSync(path.resolve(process.cwd(), 'public', 'og', imageFileName))) {
        return [];
      }

      return [`${route.path}: ${seoData.ogImage}`];
    });

    expect(missingImages).toEqual([]);
  });

  it('adds published blog article URLs supplied by the public blog sitemap API', () => {
    const sitemapXml = renderSitemapXml([
      {
        slug: 'kak-kontrolirovat-podryadchikov',
        updated_at: '2026-05-27T08:00:00.000000Z',
      },
    ]);

    expect(sitemapXml).toContain('<loc>https://1мост.рф/blog/kak-kontrolirovat-podryadchikov</loc>');
    expect(sitemapXml).toContain('<lastmod>2026-05-27T08:00:00.000Z</lastmod>');
  });

  it('uses published_at when updated_at is invalid', () => {
    const sitemapXml = renderSitemapXml([
      {
        slug: 'fallback-date',
        updated_at: 'not-a-date',
        published_at: '2026-04-10T12:00:00.000000Z',
      },
    ]);

    expect(sitemapXml).toContain('<lastmod>2026-04-10T12:00:00.000Z</lastmod>');
  });

  it('deduplicates article URLs and keeps the freshest valid lastmod', () => {
    const sitemapXml = renderSitemapXml([
      {
        slug: 'duplicate-article',
        updated_at: '2026-04-10T12:00:00.000000Z',
      },
      {
        url: '/blog/duplicate-article',
        updated_at: '2026-06-10T12:00:00.000000Z',
      },
    ]);

    expect(sitemapXml.match(/<loc>https:\/\/1мост\.рф\/blog\/duplicate-article<\/loc>/g)).toHaveLength(1);
    expect(sitemapXml).toContain('<lastmod>2026-06-10T12:00:00.000Z</lastmod>');
    expect(sitemapXml).not.toContain('<lastmod>2026-04-10T12:00:00.000Z</lastmod>');
  });

  it('keeps production sitemap routed to SSR instead of the static client file', () => {
    const nginxConfig = fs.readFileSync(path.resolve(process.cwd(), 'deploy', 'nginx', 'prohelper.pro.conf'), 'utf8');
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    const sitemapLocationIndex = nginxConfig.indexOf('location = /sitemap.xml');
    const rootLocationIndex = nginxConfig.indexOf('location = / {');
    const genericLocationIndex = nginxConfig.indexOf('location / {');
    const buildMarketing = packageJson.scripts['build:marketing'];
    const sitemapRegistryCopyIndex = buildMarketing.indexOf('cp src/data/marketing/sitemapRoutes.json dist/server/');
    const directoryRotationIndex = buildMarketing.indexOf('rm -rf client server');

    expect(sitemapLocationIndex).toBeGreaterThan(-1);
    expect(rootLocationIndex).toBeGreaterThan(sitemapLocationIndex);
    expect(genericLocationIndex).toBeGreaterThan(rootLocationIndex);
    expect(nginxConfig.slice(sitemapLocationIndex, genericLocationIndex)).toContain('proxy_pass http://127.0.0.1:3001');
    expect(nginxConfig.slice(rootLocationIndex, genericLocationIndex)).toContain('proxy_pass http://127.0.0.1:3001');
    expect(sitemapRegistryCopyIndex).toBeGreaterThan(-1);
    expect(directoryRotationIndex).toBeGreaterThan(sitemapRegistryCopyIndex);
    expect(buildMarketing).toContain('rm -f client/sitemap.xml client/index.html');
  });

  it('deploys the versioned nginx config through guarded validation and rollback', () => {
    const workflow = fs.readFileSync(path.resolve(process.cwd(), '.github', 'workflows', 'deploy.yml'), 'utf8');
    const applyScriptPath = path.resolve(process.cwd(), 'deploy', 'apply-marketing-nginx.sh');

    expect(workflow).toContain('username: root');
    expect(workflow).toContain('deploy/nginx/prohelper.pro.conf');
    expect(workflow).toContain('deploy/apply-marketing-nginx.sh');
    expect(workflow).toContain('bash deploy/apply-marketing-nginx.sh');
    expect(workflow).toContain('NGINX_CONFIG_PATH');
    expect(workflow.indexOf('bash deploy/apply-marketing-nginx.sh')).toBeLessThan(
      workflow.indexOf('ln -sfn "$RELEASE_PATH"'),
    );
    expect(fs.existsSync(applyScriptPath)).toBe(true);

    if (!fs.existsSync(applyScriptPath)) {
      return;
    }

    const applyScript = fs.readFileSync(applyScriptPath, 'utf8');

    expect(applyScript).toContain('[[ ! -f "$CONFIG_PATH" ]]');
    expect(applyScript).toContain('[[ ! -L "$ENABLED_PATH" ]]');
    expect(applyScript).toContain('readlink -f "$ENABLED_PATH"');
    expect(applyScript).toContain('rollback()');
    expect(applyScript).toContain('nginx -t');
    expect(applyScript).toContain('systemctl reload nginx');
  });
});

describe('blog article SSR metadata', () => {
  it.each([
    ['Материал | ProHelper', 'Материал | МОСТ'],
    ['Материал | pRoHeLpEr', 'Материал | МОСТ'],
    ['Материал | МОСТ', 'Материал | МОСТ'],
    ['Материал', 'Материал | МОСТ'],
    ['  Материал   |   ProHelper  ', 'Материал | МОСТ'],
    ['   ', 'МОСТ'],
    ['', 'МОСТ'],
  ])('normalizes the article brand in %j', (title, expected) => {
    expect(normalizeArticleTitleBrand(title)).toBe(expected);
  });

  it('drops legacy backend BlogPosting schema and normalizes legacy marketing URLs', () => {
    const documentProps = buildArticleDocumentProps({
      id: 1,
      title: 'Test article',
      slug: 'test-article',
      excerpt: 'Test excerpt',
      content: '<p>Test</p>',
      meta_description: 'Test description',
      og_image: 'https://prohelper.pro/og/foreman-software.png',
      structured_data: [
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://prohelper.pro/blog/test-article',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Test',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'https://prohelper.pro/contact',
              },
            },
          ],
        },
      ],
      status: 'published',
      published_at: '2026-05-19T03:52:44.000000Z',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      reading_time: 1,
      estimated_reading_time: 1,
      is_featured: false,
      allow_comments: true,
      is_published_in_rss: true,
      noindex: false,
      sort_order: 1,
      url: '/blog/test-article',
      is_published: true,
      category: {
        id: 1,
        name: 'Category',
        slug: 'category',
        color: '#000000',
        sort_order: 1,
        is_active: true,
        created_at: '2026-05-19T03:52:44.000000Z',
        updated_at: '2026-05-19T03:52:44.000000Z',
      },
      author: {
        id: 1,
        name: 'Author',
        email: 'author@example.test',
      },
      tags: [
        {
          id: 1,
          name: 'tag',
          slug: 'tag',
        },
      ],
      created_at: '2026-05-19T03:52:44.000000Z',
      updated_at: '2026-06-21T13:28:42.000000Z',
    });

    const structuredJson = JSON.stringify(documentProps.structuredData);
    const blogPostingCount = Array.from(structuredJson.matchAll(/"@type":"BlogPosting"/g)).length;

    expect(blogPostingCount).toBe(1);
    expect(structuredJson).not.toContain('prohelper.pro');
    expect(structuredJson).toContain('/blog/test-article');
    expect(structuredJson).toContain('/contact');
    expect(documentProps.title).toBe('Test article | МОСТ');
  });
});
