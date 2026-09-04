import type {
  BlogArticle,
  BlogAuthor,
  BlogCategory,
  BlogCategoryInitialData,
  BlogComment,
  BlogIndexInitialData,
  BlogPaginationMeta,
  BlogTag,
  BlogTagInitialData,
} from '@/types/blog';
import { buildBlogIndexQueryKey, type BlogIndexQuery } from '@/utils/blogIndexQuery';
import {
  normalizeMarketingBlogArticle,
  normalizeMarketingBlogCategory,
} from '@/utils/marketingBlogNormalizer';

import { applyBlogTagArticles, createBlogTagData, normalizeBlogTagQuery } from '@/utils/blogTagListing';

class BlogIndexHttpError extends Error {
  constructor(readonly status: number) {
    super(`Blog API returned ${status}`);
  }
}

const DEFAULT_API_BASE_DOMAIN = process.env.VITE_API_BASE
  ?? process.env.API_BASE_URL
  ?? 'https://api.1мост.рф';
const configuredTimeoutMs = Number(process.env.BLOG_INDEX_SSR_TIMEOUT_MS);
const DEFAULT_TIMEOUT_MS = Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
  ? configuredTimeoutMs
  : 5_000;

const EMPTY_BLOG_PAGINATION: BlogPaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
};

interface BlogIndexSsrOptions {
  query?: BlogIndexQuery;
  apiBaseDomain?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isOptional = (value: unknown, validator: (item: unknown) => boolean) =>
  value === undefined || validator(value);
const isNullable = (value: unknown, validator: (item: unknown) => boolean) =>
  value === null || validator(value);
const isNullableOptional = (value: unknown, validator: (item: unknown) => boolean) =>
  value === undefined || isNullable(value, validator);
const isStringArray = (value: unknown) => Array.isArray(value) && value.every(isString);

const isBlogAuthor = (value: unknown): value is BlogAuthor =>
  isRecord(value)
  && isNullable(value.id, isFiniteNumber)
  && isString(value.name)
  && isNullable(value.email, isString);

const isBlogTag = (value: unknown): value is BlogTag =>
  isRecord(value)
  && isFiniteNumber(value.id)
  && isString(value.name)
  && isString(value.slug);

const isBlogCategory = (value: unknown): value is BlogCategory => {
  if (!isRecord(value)) {
    return false;
  }

  return isNullable(value.id, isFiniteNumber)
    && isString(value.name)
    && isString(value.slug)
    && isNullableOptional(value.description, isString)
    && isNullableOptional(value.meta_title, isString)
    && isNullableOptional(value.meta_description, isString)
    && isString(value.color)
    && isNullableOptional(value.image, isString)
    && isFiniteNumber(value.sort_order)
    && isBoolean(value.is_active)
    && isOptional(value.articles_count, isFiniteNumber)
    && isOptional(value.published_articles_count, isFiniteNumber)
    && isNullable(value.created_at, isString)
    && isNullable(value.updated_at, isString);
};

const BLOG_COMMENT_STATUSES = new Set<BlogComment['status']>([
  'pending',
  'approved',
  'rejected',
  'spam',
]);

const isBlogCommentArticle = (value: unknown) =>
  isRecord(value)
  && isFiniteNumber(value.id)
  && isString(value.title)
  && isString(value.slug);

const isBlogComment = (value: unknown): value is BlogComment => {
  if (!isRecord(value)) {
    return false;
  }

  return isFiniteNumber(value.id)
    && isFiniteNumber(value.article_id)
    && isNullableOptional(value.parent_id, isFiniteNumber)
    && isString(value.author_name)
    && isString(value.author_email)
    && isNullableOptional(value.author_website, isString)
    && isString(value.content)
    && isString(value.status)
    && BLOG_COMMENT_STATUSES.has(value.status as BlogComment['status'])
    && isNullableOptional(value.approved_at, isString)
    && isFiniteNumber(value.likes_count)
    && isBoolean(value.is_approved)
    && isBoolean(value.is_root)
    && isOptional(value.article, isBlogCommentArticle)
    && isOptional(value.replies, (replies) => Array.isArray(replies) && replies.every(isBlogComment))
    && isOptional(value.approved_by, isBlogAuthor)
    && isString(value.created_at)
    && isString(value.updated_at);
};

const BLOG_ARTICLE_STATUSES = new Set<BlogArticle['status']>([
  'draft',
  'published',
  'scheduled',
  'archived',
]);

const isBlogArticle = (value: unknown): value is BlogArticle => {
  if (!isRecord(value)) {
    return false;
  }

  return isFiniteNumber(value.id)
    && isString(value.title)
    && isString(value.slug)
    && isNullable(value.excerpt, isString)
    && isString(value.content)
    && isNullableOptional(value.featured_image, isString)
    && isNullableOptional(value.gallery_images, isStringArray)
    && isNullableOptional(value.meta_title, isString)
    && isNullableOptional(value.meta_description, isString)
    && isNullableOptional(value.meta_keywords, isStringArray)
    && isNullableOptional(value.og_title, isString)
    && isNullableOptional(value.og_description, isString)
    && isNullableOptional(value.og_image, isString)
    && isString(value.status)
    && BLOG_ARTICLE_STATUSES.has(value.status as BlogArticle['status'])
    && isNullableOptional(value.published_at, isString)
    && isNullableOptional(value.scheduled_at, isString)
    && isFiniteNumber(value.views_count)
    && isFiniteNumber(value.likes_count)
    && isFiniteNumber(value.comments_count)
    && isFiniteNumber(value.reading_time)
    && isFiniteNumber(value.estimated_reading_time)
    && isBoolean(value.is_featured)
    && isBoolean(value.allow_comments)
    && isBoolean(value.is_published_in_rss)
    && isBoolean(value.noindex)
    && isFiniteNumber(value.sort_order)
    && isString(value.url)
    && isBoolean(value.is_published)
    && isNullableOptional(value.readable_published_at, isString)
    && isBlogCategory(value.category)
    && isBlogAuthor(value.author)
    && Array.isArray(value.tags)
    && value.tags.every(isBlogTag)
    && isOptional(value.comments, (comments) => Array.isArray(comments) && comments.every(isBlogComment))
    && isNullable(value.created_at, isString)
    && isNullable(value.updated_at, isString);
};

const normalizePaginationMeta = (value: unknown): BlogPaginationMeta | null => {
  if (!isRecord(value)) {
    return null;
  }

  const { current_page: currentPage, last_page: lastPage, per_page: perPage, total } = value;

  if (
    !isFiniteNumber(currentPage)
    || !isFiniteNumber(lastPage)
    || !isFiniteNumber(perPage)
    || !isFiniteNumber(total)
    || !Number.isInteger(currentPage)
    || !Number.isInteger(lastPage)
    || !Number.isInteger(perPage)
    || !Number.isInteger(total)
    || currentPage < 1
    || lastPage < 1
    || perPage < 1
    || total < 0
  ) {
    return null;
  }

  return {
    current_page: currentPage,
    last_page: lastPage,
    per_page: perPage,
    total,
  };
};

const normalizeArticlesEnvelope = (value: unknown) => {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    return null;
  }

  const articles = value.data.data;
  const pagination = normalizePaginationMeta(value.data.meta);

  if (!Array.isArray(articles) || !articles.every(isBlogArticle) || !pagination) {
    return null;
  }
  if (pagination.current_page > pagination.last_page && articles.length > 0) {
    return null;
  }

  return {
    articles: articles.map(normalizeMarketingBlogArticle),
    pagination,
  };
};

const normalizeCategoriesEnvelope = (value: unknown): BlogCategory[] | null => {
  if (!isRecord(value) || value.success !== true) {
    return null;
  }

  const collection = Array.isArray(value.data)
    ? value.data
    : isRecord(value.data)
      ? value.data.data
      : null;

  if (!Array.isArray(collection) || !collection.every(isBlogCategory)) {
    return null;
  }

  return collection.map(normalizeMarketingBlogCategory);
};

const normalizeApiBase = (apiBase: string) => apiBase.replace(/\/+$/, '');

const fetchBlogIndexResource = async (
  path: string,
  { apiBaseDomain, fetchImpl, timeoutMs }: Required<Omit<BlogIndexSsrOptions, 'query'>>,
): Promise<unknown> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${normalizeApiBase(apiBaseDomain)}${path}`, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new BlogIndexHttpError(response.status);
    }

    const payload = await response.json() as unknown;

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchBlogTagForSsr = async (
  slug: string,
  options: BlogIndexSsrOptions = {},
): Promise<BlogTagInitialData> => {
  const query = normalizeBlogTagQuery(options.query ?? {});
  const initial = createBlogTagData(slug, query);
  if (initial.notFound || initial.pageNotFound) return initial;
  const params = new URLSearchParams({ tag_slug: slug, page: String(query.page), per_page: '12' });
  if (query.search) params.set('search', query.search);
  try {
    const payload = normalizeArticlesEnvelope(await fetchBlogIndexResource(`/api/v1/blog/articles?${params}`, {
      apiBaseDomain: options.apiBaseDomain ?? DEFAULT_API_BASE_DOMAIN,
      fetchImpl: options.fetchImpl ?? fetch,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    }));
    if (!payload) throw new Error('Invalid blog tag response');
    return applyBlogTagArticles(initial, payload.articles, payload.pagination);
  } catch (error) {
    return error instanceof BlogIndexHttpError && error.status === 404
      ? { ...initial, notFound: true }
      : { ...initial, unavailable: true };
  }
};

export const fetchBlogCategoryForSsr = async (
  slug: string,
  options: BlogIndexSsrOptions = {},
): Promise<BlogCategoryInitialData> => {
  const query = { ...options.query, category: slug };
  const data = await fetchBlogIndexForSsr({ ...options, query });
  const category = data.categories.find((item) => item.slug === slug && item.is_active) ?? null;
  return {
    ...data,
    slug,
    category,
    queryKey: buildBlogIndexQueryKey(query),
    notFound: data.categoriesLoaded && category === null,
    pageNotFound: Boolean(data.notFound && category !== null),
  };
};

export const fetchBlogIndexForSsr = async (
  options: BlogIndexSsrOptions = {},
): Promise<BlogIndexInitialData> => {
  const requestOptions: Required<Omit<BlogIndexSsrOptions, 'query'>> = {
    apiBaseDomain: options.apiBaseDomain ?? DEFAULT_API_BASE_DOMAIN,
    fetchImpl: options.fetchImpl ?? fetch,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
  const query = options.query ?? {};
  const page = query.page ?? 1;
  const result: BlogIndexInitialData = {
    articles: [],
    categories: [],
    pagination: { ...EMPTY_BLOG_PAGINATION, current_page: page },
    articlesLoaded: false,
    categoriesLoaded: false,
    queryKey: buildBlogIndexQueryKey(query),
    notFound: page < 1 || !Number.isSafeInteger(page),
  };
  const categoriesPromise = fetchBlogIndexResource('/api/v1/blog/categories', requestOptions)
    .then(normalizeCategoriesEnvelope).catch(() => null);
  const loadArticles = async (categoryId?: number) => {
    if (result.notFound) return null;
    const params = new URLSearchParams({ status: 'published', page: String(page), per_page: '12' });
    if (categoryId !== undefined) params.set('category_id', String(categoryId));
    if (query.search?.trim()) params.set('search', query.search.trim());
    return fetchBlogIndexResource(`/api/v1/blog/articles?${params}`, requestOptions)
      .then(normalizeArticlesEnvelope).catch(() => null);
  };
  const articlesPromise = query.category
    ? categoriesPromise.then((categories) => {
        if (!categories) return null;
        const category = categories.find((item) => item.slug === query.category && item.is_active);
        if (!category) {
          result.notFound = true;
          return null;
        }
        return category.id === null ? null : loadArticles(category.id);
      })
    : loadArticles();
  const [categories, payload] = await Promise.all([categoriesPromise, articlesPromise]);
  result.categories = categories ?? [];
  result.categoriesLoaded = categories !== null;
  if (payload) {
    result.notFound = page > payload.pagination.last_page || page !== payload.pagination.current_page;
    result.articles = result.notFound ? [] : payload.articles;
    result.pagination = payload.pagination;
  }
  result.articlesLoaded = payload !== null || Boolean(result.notFound);
  result.unavailable = !result.notFound && (!result.articlesLoaded || !result.categoriesLoaded);
  return result;
};
