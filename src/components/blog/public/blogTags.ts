import type { BlogArticle, BlogTag } from '@/types/blog';

export const normalizeBlogTagSlug = (slug?: string): string => {
  const rawSlug = slug?.trim() ?? '';

  if (!rawSlug) {
    return '';
  }

  try {
    return decodeURIComponent(rawSlug).trim();
  } catch {
    return rawSlug;
  }
};

export const resolveBlogTagBySlug = (tags: BlogTag[], slug?: string): BlogTag | null => {
  const normalizedSlug = normalizeBlogTagSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  return tags.find((tag) => tag.slug === normalizedSlug) ?? null;
};

export const getBlogTagDisplayName = (slug?: string, tag?: BlogTag | null): string => {
  return tag?.name ?? normalizeBlogTagSlug(slug);
};

export const getBlogTagSearchTerm = (slug?: string, tag?: BlogTag | null): string => {
  const displayName = getBlogTagDisplayName(slug, tag).trim();

  return displayName ? `#${displayName}` : '';
};

export const filterBlogArticlesByTagSlug = (articles: BlogArticle[], slug?: string): BlogArticle[] => {
  const normalizedSlug = normalizeBlogTagSlug(slug);

  if (!normalizedSlug) {
    return articles;
  }

  return articles.filter((article) => article.tags?.some((tag) => tag.slug === normalizedSlug));
};
