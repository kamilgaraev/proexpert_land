import type { BlogArticle, BlogCategory, BlogTag } from "@/types/blog";

const MARKETING_TEXT_TOKEN_PATTERN = /https?:\/\/[^\s<>"']+|ProHelper/gi;
const OLD_SITE_HOSTNAMES = new Set(["prohelper.pro", "www.prohelper.pro"]);
const TERMINAL_PUNCTUATION_PATTERN = /[.,;:!?()[\]{}]+$/;

const normalizeMarketingUrlToken = (token: string): string => {
  const terminalPunctuation =
    token.match(TERMINAL_PUNCTUATION_PATTERN)?.[0] ?? "";
  const urlValue = terminalPunctuation
    ? token.slice(0, -terminalPunctuation.length)
    : token;
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(urlValue);
  } catch {
    return token;
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, "");
  if (!OLD_SITE_HOSTNAMES.has(hostname)) {
    return token;
  }

  const authorityStart = urlValue.indexOf("://") + 3;
  const suffixOffset = urlValue.slice(authorityStart).search(/[/?#]/);
  const suffix =
    suffixOffset === -1 ? "" : urlValue.slice(authorityStart + suffixOffset);

  return `https://1мост.рф${suffix}${terminalPunctuation}`;
};

export const normalizeMarketingBlogText = (value: string): string =>
  value.replace(MARKETING_TEXT_TOKEN_PATTERN, (token) => {
    if (/^https?:\/\//i.test(token)) {
      return normalizeMarketingUrlToken(token);
    }

    return "МОСТ";
  });

const normalizeOptionalText = <T extends string | null | undefined>(
  value: T,
): T =>
  (typeof value === "string" ? normalizeMarketingBlogText(value) : value) as T;

export const normalizeMarketingBlogCategory = <T extends BlogCategory>(
  category: T,
): T => ({
  ...category,
  name: normalizeMarketingBlogText(category.name),
  description: normalizeOptionalText(category.description),
  meta_title: normalizeOptionalText(category.meta_title),
  meta_description: normalizeOptionalText(category.meta_description),
});

export const normalizeMarketingBlogTag = <T extends BlogTag>(tag: T): T => ({
  ...tag,
  name: normalizeMarketingBlogText(tag.name),
});

export const normalizeMarketingBlogArticle = <T extends BlogArticle>(
  article: T,
): T => ({
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
  category: normalizeMarketingBlogCategory(article.category),
  tags: article.tags.map(normalizeMarketingBlogTag),
});
