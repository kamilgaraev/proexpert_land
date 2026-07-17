import type {
  BlogArticle,
  BlogAuthor,
  BlogCategory,
  BlogComment,
  BlogIndexInitialData,
  BlogPaginationMeta,
  BlogTag,
} from '@/types/blog';
import { BLOG_INDEX_BASE_QUERY_KEY } from '@/utils/blogIndexQuery';
import { normalizeMarketingBlogArticle } from '@/utils/marketingBlogNormalizer';

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
    || currentPage > lastPage
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

  return collection;
};

const normalizeApiBase = (apiBase: string) => apiBase.replace(/\/+$/, '');

const fetchBlogIndexResource = async (
  path: string,
  { apiBaseDomain, fetchImpl, timeoutMs }: Required<BlogIndexSsrOptions>,
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
      throw new Error(`Blog API returned ${response.status}`);
    }

    const payload = await response.json() as unknown;

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchBlogIndexForSsr = async (
  options: BlogIndexSsrOptions = {},
): Promise<BlogIndexInitialData> => {
  const requestOptions: Required<BlogIndexSsrOptions> = {
    apiBaseDomain: options.apiBaseDomain ?? DEFAULT_API_BASE_DOMAIN,
    fetchImpl: options.fetchImpl ?? fetch,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
  const [articlesResult, categoriesResult] = await Promise.allSettled([
    fetchBlogIndexResource(
      '/api/v1/blog/articles?status=published&page=1&per_page=12',
      requestOptions,
    ),
    fetchBlogIndexResource('/api/v1/blog/categories', requestOptions),
  ]);
  const articlesPayload = articlesResult.status === 'fulfilled'
    ? normalizeArticlesEnvelope(articlesResult.value)
    : null;
  const categoriesPayload = categoriesResult.status === 'fulfilled'
    ? normalizeCategoriesEnvelope(categoriesResult.value)
    : null;

  return {
    articles: articlesPayload?.articles ?? [],
    categories: categoriesPayload ?? [],
    pagination: articlesPayload?.pagination ?? EMPTY_BLOG_PAGINATION,
    articlesLoaded: articlesPayload !== null,
    categoriesLoaded: categoriesPayload !== null,
    queryKey: BLOG_INDEX_BASE_QUERY_KEY,
  };
};
