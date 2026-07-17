import { describe, expect, it } from 'vitest';

import type { BlogArticle } from '@/types/blog';
import {
  normalizeMarketingBlogArticle,
  normalizeMarketingBlogText,
} from './marketingBlogNormalizer';

const article: BlogArticle = {
  id: 42,
  title: 'ProHelper помогает вести объект',
  slug: 'prohelper-guide',
  excerpt: 'Команда ProHelper',
  content: '<p>Откройте https://prohelper.pro/blog/a</p>',
  featured_image: 'https://cdn.example.com/prohelper.pro/featured.jpg',
  meta_title: 'ProHelper для стройки',
  meta_description: 'Команда ProHelper',
  og_title: 'ProHelper для команды',
  og_description: 'Сайт https://prohelper.pro/blog/a',
  og_image: 'https://cdn.example.com/prohelper.pro/og.jpg',
  status: 'published',
  published_at: '2026-07-01T10:00:00Z',
  views_count: 10,
  likes_count: 0,
  comments_count: 0,
  reading_time: 2,
  estimated_reading_time: 2,
  is_featured: false,
  allow_comments: true,
  is_published_in_rss: true,
  noindex: false,
  sort_order: 1,
  url: 'https://prohelper.pro/blog/prohelper-guide',
  is_published: true,
  category: {
    id: 7,
    name: 'ProHelper',
    slug: 'prohelper',
    color: '#0f172a',
    sort_order: 1,
    is_active: true,
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-07-01T10:00:00Z',
  },
  author: { id: 3, name: 'Команда ProHelper', email: 'editor@example.test' },
  tags: [{ id: 1, name: 'ProHelper', slug: 'prohelper' }],
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-01T10:00:00Z',
};

describe('normalizeMarketingBlogText', () => {
  it.each([
    ['ProHelper помогает вести объект', 'МОСТ помогает вести объект'],
    ['Команда ProHelper', 'Команда МОСТ'],
    ['https://prohelper.pro/blog/a', 'https://1мост.рф/blog/a'],
    ['https://example.com/prohelper.pro', 'https://example.com/prohelper.pro'],
  ])('нормализует только старый бренд и его собственный домен', (source, expected) => {
    expect(normalizeMarketingBlogText(source)).toBe(expected);
  });
});

describe('normalizeMarketingBlogArticle', () => {
  it('нормализует только публичные текстовые поля без изменения исходной статьи', () => {
    const normalized = normalizeMarketingBlogArticle(article);

    expect(normalized).toMatchObject({
      title: 'МОСТ помогает вести объект',
      excerpt: 'Команда МОСТ',
      content: '<p>Откройте https://1мост.рф/blog/a</p>',
      meta_title: 'МОСТ для стройки',
      meta_description: 'Команда МОСТ',
      og_title: 'МОСТ для команды',
      og_description: 'Сайт https://1мост.рф/blog/a',
      author: { name: 'Команда МОСТ' },
    });
    expect(normalized).toMatchObject({
      slug: article.slug,
      url: article.url,
      featured_image: article.featured_image,
      og_image: article.og_image,
      category: article.category,
      tags: article.tags,
      published_at: article.published_at,
    });
    expect(normalized).not.toBe(article);
    expect(article.title).toBe('ProHelper помогает вести объект');
    expect(article.author.name).toBe('Команда ProHelper');
  });
});
