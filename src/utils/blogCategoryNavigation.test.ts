import { describe, expect, it } from 'vitest';
import { getBlogNavigationCategories } from './blogCategoryNavigation';

describe('public blog category navigation', () => {
  const categories = [
    { slug: 'drafts', articles_count: 3, published_articles_count: 0 },
    { slug: 'published', articles_count: 5, published_articles_count: 2 },
    { slug: 'unknown', articles_count: 0 },
  ];

  it('does not offer categories containing only drafts', () => {
    expect(getBlogNavigationCategories(categories).map(category => category.slug))
      .toEqual(['published', 'unknown']);
    expect(categories).toHaveLength(3);
  });

  it('keeps a directly selected empty category visible', () => {
    expect(getBlogNavigationCategories(categories, 'drafts'))
      .toEqual(categories);
  });

  it('does not treat a missing published count as an empty category', () => {
    expect(getBlogNavigationCategories([{ slug: 'existing' }]))
      .toEqual([{ slug: 'existing' }]);
  });
});
