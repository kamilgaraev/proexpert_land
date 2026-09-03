import type { BlogCategory } from '@/types/blog';

export const getBlogNavigationCategories = <T extends Pick<BlogCategory, 'slug' | 'published_articles_count'>>(
  categories: readonly T[],
  selectedSlug?: string | null,
): T[] => categories.filter((category) => (
  category.slug === selectedSlug || category.published_articles_count !== 0
));
