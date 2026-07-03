import { isKnownMarketingPath, normalizeMarketingPath } from '@/data/marketingRegistry';
import type { BlogArticle } from '@/types/blog';
import { generateArticleSchema } from '@/utils/seo';

const BASE_URL = 'https://prohelper.pro';
const API_BASE_DOMAIN = process.env.VITE_API_BASE ?? process.env.API_BASE_URL ?? 'https://api.prohelper.pro';

interface BlogApiResponse<T> {
  success: boolean;
  data: T | null;
}

interface BlogArticleSsrResult {
  article?: BlogArticle;
  notFound?: boolean;
}

const normalizeApiBase = (apiBase: string) => apiBase.replace(/\/+$/, '');

const resolveAbsoluteUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BASE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const resolveBlogArticleSlug = (pathname: string) => {
  const match = pathname.match(/^\/blog\/([^/]+)$/);

  return match ? decodeURIComponent(match[1]) : null;
};

const normalizeStructuredData = (value: unknown): unknown[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
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

const buildArticleDocumentProps = (article: BlogArticle) => {
  const articleUrl = `${BASE_URL}/blog/${article.slug}`;
  const image = resolveAbsoluteUrl(article.og_image || article.featured_image);
  const description = article.meta_description || article.og_description || article.excerpt || article.title;

  return {
    title: article.meta_title || article.og_title || article.title,
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
