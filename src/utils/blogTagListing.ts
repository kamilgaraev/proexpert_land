import type {
  BlogArticle,
  BlogPaginationMeta,
  BlogTagInitialData,
} from "@/types/blog";
import {
  buildBlogIndexQueryKey,
  getBlogListingSeo,
  type BlogIndexQuery,
} from "./blogIndexQuery";

export const normalizeBlogTagQuery = (
  query: BlogIndexQuery,
): BlogIndexQuery => ({
  ...query,
  category: null,
  page:
    Number.isSafeInteger(query.page ?? 1) &&
    (query.page ?? 1) > 0 &&
    (query.page ?? 1) <= 2147483647
      ? (query.page ?? 1)
      : 0,
});

export const createBlogTagData = (
  slug: string,
  query: BlogIndexQuery,
): BlogTagInitialData => ({
  slug,
  queryKey: buildBlogIndexQueryKey({ ...query, category: slug }),
  articles: [],
  pagination: {
    current_page: query.page ?? 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  },
  articlesLoaded: false,
  notFound: !/^[\p{L}\p{N}_-]{1,255}$/u.test(slug),
  pageNotFound: query.page === 0,
  unavailable: false,
});

export const applyBlogTagArticles = (
  initial: BlogTagInitialData,
  articles: BlogArticle[],
  pagination?: BlogPaginationMeta,
): BlogTagInitialData => {
  if (
    !pagination ||
    !Array.isArray(articles) ||
    ![
      pagination.current_page,
      pagination.last_page,
      pagination.per_page,
      pagination.total,
    ].every(Number.isSafeInteger) ||
    pagination.current_page < 1 ||
    pagination.last_page < 1 ||
    pagination.per_page !== 12 ||
    pagination.total < 0 ||
    pagination.last_page !==
      Math.max(1, Math.ceil(pagination.total / pagination.per_page)) ||
    (pagination.current_page > pagination.last_page && articles.length > 0) ||
    articles.length > pagination.per_page ||
    articles.some(
      (article) => !article.tags?.some((tag) => tag.slug === initial.slug),
    )
  ) {
    throw new Error("Invalid blog tag pagination");
  }
  const requestedPage = initial.pagination.current_page;
  if (pagination.current_page !== requestedPage)
    throw new Error("Unexpected blog tag page");
  const pageNotFound = requestedPage > pagination.last_page;
  const expectedCount = pageNotFound
    ? 0
    : Math.min(
        pagination.per_page,
        Math.max(0, pagination.total - (requestedPage - 1) * pagination.per_page),
      );
  if (articles.length !== expectedCount)
    throw new Error("Incomplete blog tag page");
  return {
    ...initial,
    articles: pageNotFound ? [] : articles,
    pagination,
    pageNotFound,
    articlesLoaded: true,
    unavailable: false,
  };
};

export const getBlogTagName = (data: BlogTagInitialData) =>
  data.articles
    .flatMap((article) => article.tags)
    .find((tag) => tag.slug === data.slug)?.name;

export const getBlogTagSeo = (
  data: BlogTagInitialData,
  query: BlogIndexQuery,
) => {
  const name = getBlogTagName(data);
  return {
    ...getBlogListingSeo(
      `/blog/tag/${encodeURIComponent(data.slug)}`,
      query,
      name ? `${name} — блог МОСТ` : "Статьи по теме — блог МОСТ",
      data.notFound || data.pageNotFound,
      data.unavailable,
    ),
    description: name
      ? `Статьи МОСТ по теме «${name}».`
      : "Практические материалы о работе строительной команды.",
    noIndex: true,
    type: "website" as const,
  };
};
