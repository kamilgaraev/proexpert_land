import type { BlogArticle } from '@/types/blog';

const OLD_BRAND_PATTERN = /ProHelper(?!\.pro)/gi;
const OLD_SITE_PATTERN = /https?:\/\/(?:www\.)?prohelper\.pro(?=\/|["'\s<]|$)/gi;

export const normalizeMarketingBlogText = (value: string): string =>
  value.replace(OLD_SITE_PATTERN, 'https://1мост.рф').replace(OLD_BRAND_PATTERN, 'МОСТ');

const normalizeOptionalText = <T extends string | null | undefined>(value: T): T =>
  (typeof value === 'string' ? normalizeMarketingBlogText(value) : value) as T;

export const normalizeMarketingBlogArticle = <T extends BlogArticle>(article: T): T => ({
  ...article,
  title: normalizeMarketingBlogText(article.title),
  meta_title: normalizeOptionalText(article.meta_title),
  meta_description: normalizeOptionalText(article.meta_description),
  og_title: normalizeOptionalText(article.og_title),
  og_description: normalizeOptionalText(article.og_description),
  excerpt: normalizeOptionalText(article.excerpt),
  content: normalizeMarketingBlogText(article.content),
  author: {
    ...article.author,
    name: normalizeMarketingBlogText(article.author.name),
  },
});
