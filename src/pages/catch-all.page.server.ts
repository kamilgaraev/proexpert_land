import { isKnownMarketingPath, normalizeMarketingPath } from '@/data/marketingRegistry';
import type {
  BlogArticle,
  BlogAuthor,
  BlogCategory,
  BlogComment,
  BlogIndexInitialData,
  BlogPaginationMeta,
  BlogTag,
} from '@/types/blog';
import { generateArticleSchema, normalizeArticleTitleBrand } from '@/utils/seo';

const BASE_URL = 'https://1мост.рф';
const API_BASE_DOMAIN = process.env.VITE_API_BASE ?? process.env.API_BASE_URL ?? 'https://api.1мост.рф';

interface BlogApiResponse<T> {
  success: boolean;
  data: T | null;
}

interface BlogArticleSsrResult {
  article?: BlogArticle;
  notFound?: boolean;
}

const EMPTY_BLOG_PAGINATION: BlogPaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isOptional = (value: unknown, validator: (item: unknown) => boolean) =>
  value === undefined || validator(value);
const isStringArray = (value: unknown) => Array.isArray(value) && value.every(isString);

const isBlogAuthor = (value: unknown): value is BlogAuthor =>
  isRecord(value)
  && isFiniteNumber(value.id)
  && isString(value.name)
  && isString(value.email);

const isBlogTag = (value: unknown): value is BlogTag =>
  isRecord(value)
  && isFiniteNumber(value.id)
  && isString(value.name)
  && isString(value.slug);

const isBlogCategory = (value: unknown): value is BlogCategory => {
  if (!isRecord(value)) {
    return false;
  }

  return isFiniteNumber(value.id)
    && isString(value.name)
    && isString(value.slug)
    && isOptional(value.description, isString)
    && isOptional(value.meta_title, isString)
    && isOptional(value.meta_description, isString)
    && isString(value.color)
    && isOptional(value.image, isString)
    && isFiniteNumber(value.sort_order)
    && isBoolean(value.is_active)
    && isOptional(value.articles_count, isFiniteNumber)
    && isOptional(value.published_articles_count, isFiniteNumber)
    && isString(value.created_at)
    && isString(value.updated_at);
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
    && isOptional(value.parent_id, isFiniteNumber)
    && isString(value.author_name)
    && isString(value.author_email)
    && isOptional(value.author_website, isString)
    && isString(value.content)
    && isString(value.status)
    && BLOG_COMMENT_STATUSES.has(value.status as BlogComment['status'])
    && isOptional(value.approved_at, isString)
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
    && isString(value.excerpt)
    && isString(value.content)
    && isOptional(value.featured_image, isString)
    && isOptional(value.gallery_images, isStringArray)
    && isOptional(value.meta_title, isString)
    && isOptional(value.meta_description, isString)
    && isOptional(value.meta_keywords, isStringArray)
    && isOptional(value.og_title, isString)
    && isOptional(value.og_description, isString)
    && isOptional(value.og_image, isString)
    && isString(value.status)
    && BLOG_ARTICLE_STATUSES.has(value.status as BlogArticle['status'])
    && isOptional(value.published_at, isString)
    && isOptional(value.scheduled_at, isString)
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
    && isOptional(value.readable_published_at, isString)
    && isBlogCategory(value.category)
    && isBlogAuthor(value.author)
    && Array.isArray(value.tags)
    && value.tags.every(isBlogTag)
    && isOptional(value.comments, (comments) => Array.isArray(comments) && comments.every(isBlogComment))
    && isString(value.created_at)
    && isString(value.updated_at);
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

  return { articles, pagination };
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

const fetchBlogIndexResource = async (path: string): Promise<unknown> => {
  const response = await fetch(`${normalizeApiBase(API_BASE_DOMAIN)}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Blog API returned ${response.status}`);
  }

  return response.json() as Promise<unknown>;
};

const fetchBlogIndexForSsr = async (): Promise<BlogIndexInitialData> => {
  const [articlesResult, categoriesResult] = await Promise.allSettled([
    fetchBlogIndexResource('/api/v1/blog/articles?status=published&page=1&per_page=12'),
    fetchBlogIndexResource('/api/v1/blog/categories'),
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
  };
};

const normalizeApiBase = (apiBase: string) => apiBase.replace(/\/+$/, '');
const LEGACY_MARKETING_ORIGIN_PATTERN = /^https?:\/\/(?:www\.)?prohelper\.pro/i;
const normalizeMarketingUrl = (value: string) => value.replace(LEGACY_MARKETING_ORIGIN_PATTERN, BASE_URL);

const resolveAbsoluteUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return normalizeMarketingUrl(value);
  }

  return `${BASE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const normalizeStructuredDataValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return normalizeMarketingUrl(value);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeStructuredDataValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, item]) => [key, normalizeStructuredDataValue(item)]),
    );
  }

  return value;
};

const getSchemaTypes = (value: unknown): string[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }

  const schemaType = (value as Record<string, unknown>)['@type'];

  if (Array.isArray(schemaType)) {
    return schemaType.filter((item): item is string => typeof item === 'string');
  }

  return typeof schemaType === 'string' ? [schemaType] : [];
};

const resolveBlogArticleSlug = (pathname: string) => {
  const match = pathname.match(/^\/blog\/([^/]+)$/);

  return match ? decodeURIComponent(match[1]) : null;
};

const normalizeStructuredData = (value: unknown): unknown[] => {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .map(normalizeStructuredDataValue)
    .filter((item) => !getSchemaTypes(item).includes('BlogPosting'));
};

const fetchBlogArticleForSsr = async (slug: string): Promise<BlogArticleSsrResult> => {
  try {
    const response = await fetch(
      `${normalizeApiBase(API_BASE_DOMAIN)}/api/v1/blog/articles/${encodeURIComponent(slug)}?track_view=0`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (response.status === 404) {
      return { notFound: true };
    }

    if (!response.ok) {
      return {};
    }

    const payload = await response.json() as BlogApiResponse<BlogArticle>;

    if (!payload.success || !payload.data) {
      return { notFound: true };
    }

    return { article: payload.data };
  } catch {
    return {};
  }
};

export const buildArticleDocumentProps = (article: BlogArticle) => {
  const articleUrl = `${BASE_URL}/blog/${article.slug}`;
  const image = resolveAbsoluteUrl(article.og_image || article.featured_image);
  const description = article.meta_description || article.og_description || article.excerpt || article.title;

  return {
    title: normalizeArticleTitleBrand(article.meta_title || article.og_title || article.title),
    description,
    keywords: article.meta_keywords?.join(', ') || article.tags.map((tag) => tag.name).join(', '),
    canonicalUrl: articleUrl,
    ogImage: image,
    type: 'article' as const,
    noIndex: article.noindex,
    statusCode: 200,
    structuredData: [
      generateArticleSchema({
        title: article.title,
        description,
        author: article.author.name,
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        image,
        category: article.category.name,
        tags: article.tags.map((tag) => tag.name),
        url: articleUrl,
      }),
      ...normalizeStructuredData(article.structured_data),
    ],
  };
};

const buildMissingArticleDocumentProps = () => ({
  title: 'Статья не найдена | МОСТ',
  description: 'Материал блога МОСТ не найден или еще не опубликован.',
  keywords: 'блог МОСТ, статья не найдена',
  canonicalUrl: `${BASE_URL}/blog`,
  noIndex: true,
  statusCode: 404,
});

export async function onBeforeRender(pageContext: { urlPathname?: string }) {
  const normalizedPath = normalizeMarketingPath(pageContext.urlPathname || '/');
  const routeStatusCode = isKnownMarketingPath(normalizedPath) ? 200 : 404;
  const articleSlug = resolveBlogArticleSlug(normalizedPath);

  if (normalizedPath === '/blog') {
    const initialBlogIndexData = await fetchBlogIndexForSsr();

    return {
      pageContext: {
        routeStatusCode: 200,
        pageProps: {
          initialBlogIndexData,
        },
      },
    };
  }

  if (!articleSlug) {
    return {
      pageContext: {
        routeStatusCode,
      },
    };
  }

  const articleResult = await fetchBlogArticleForSsr(articleSlug);

  if (articleResult.article) {
    return {
      pageContext: {
        routeStatusCode: 200,
        pageProps: {
          initialBlogArticle: articleResult.article,
        },
        documentProps: buildArticleDocumentProps(articleResult.article),
      },
    };
  }

  if (articleResult.notFound) {
    return {
      pageContext: {
        routeStatusCode: 404,
        pageProps: {
          initialBlogArticleNotFound: true,
          initialBlogArticleNotFoundSlug: articleSlug,
        },
        documentProps: buildMissingArticleDocumentProps(),
      },
    };
  }

  return {
    pageContext: {
      routeStatusCode,
    },
  };
}
