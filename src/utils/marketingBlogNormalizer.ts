import type { BlogArticle } from '@/types/blog';

const MARKETING_TEXT_TOKEN_PATTERN = /https?:\/\/[^\s<>"']+|ProHelper/gi;
const OLD_SITE_ORIGIN_PATTERN = /^https?:\/\/(?:www\.)?prohelper\.pro/i;
const TERMINAL_PUNCTUATION_PATTERN = /^[.,;:!?()[\]{}]+$/;

const normalizeMarketingUrlToken = (token: string): string => {
  const originMatch = token.match(OLD_SITE_ORIGIN_PATTERN);

  if (!originMatch) {
    return token;
  }

  const suffix = token.slice(originMatch[0].length);

  if (suffix.startsWith('.')) {
    if (TERMINAL_PUNCTUATION_PATTERN.test(suffix)) {
      return `https://1мост.рф${suffix}`;
    }

    if (/^\.(?=\/|[?#])/.test(suffix)) {
      return `https://1мост.рф${suffix.slice(1)}`;
    }

    return token;
  }

  if (/^[a-z0-9-]/i.test(suffix)) {
    return token;
  }

  return `https://1мост.рф${suffix}`;
};

export const normalizeMarketingBlogText = (value: string): string =>
  value.replace(MARKETING_TEXT_TOKEN_PATTERN, (token) => {
    if (/^https?:\/\//i.test(token)) {
      return normalizeMarketingUrlToken(token);
    }

    return 'МОСТ';
  });

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
