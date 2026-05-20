import { describe, expect, it } from 'vitest';
import type { BlogArticle, BlogTag } from '@/types/blog';
import { filterBlogArticlesByTagSlug, getBlogTagDisplayName, getBlogTagSearchTerm, resolveBlogTagBySlug } from './blogTags';

const ptoTag: BlogTag = {
  id: 7,
  name: 'ПТО',
  slug: 'pto',
};

const articleWithPto = {
  id: 7,
  title: 'Документы ПТО',
  tags: [ptoTag],
} as BlogArticle;

const articleWithoutPto = {
  id: 8,
  title: 'Материалы',
  tags: [
    {
      id: 9,
      name: 'снабжение',
      slug: 'snabzhenie',
    },
  ],
} as BlogArticle;

describe('blog tag helpers', () => {
  it('resolves route slug to the Russian tag name used by public search', () => {
    const resolvedTag = resolveBlogTagBySlug([ptoTag], 'pto');

    expect(getBlogTagDisplayName('pto', resolvedTag)).toBe('ПТО');
    expect(getBlogTagSearchTerm('pto', resolvedTag)).toBe('#ПТО');
  });

  it('keeps only exact tag matches after public search returns articles', () => {
    expect(filterBlogArticlesByTagSlug([articleWithPto, articleWithoutPto], 'pto')).toEqual([articleWithPto]);
  });
});
