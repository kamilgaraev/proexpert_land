export interface BlogIndexQuery {
  category?: string | null;
  search?: string | null;
  page?: number;
}

export const parseBlogPage = (params: URLSearchParams): number => {
  const values = params.getAll("page");
  if (values.length === 0) return 1;
  if (values.length !== 1 || !/^[1-9]\d*$/.test(values[0])) return 0;
  const page = Number(values[0]);
  return Number.isSafeInteger(page) ? page : 0;
};

export const readBlogIndexQuery = (
  params: URLSearchParams,
): BlogIndexQuery => ({
  category: params.get("category")?.trim() || null,
  search: params.get("search")?.trim() || null,
  page: parseBlogPage(params),
});

export const buildBlogIndexQueryKey = ({
  category,
  search,
  page = 1,
}: BlogIndexQuery = {}) => {
  const params = new URLSearchParams();
  params.set("category", category?.trim() ?? "");
  params.set("search", search?.trim() ?? "");
  params.set("page", String(page));
  return params.toString();
};

export const buildBlogPageUrl = (
  pathname: string,
  query: BlogIndexQuery,
  page = query.page ?? 1,
) => {
  const params = new URLSearchParams();
  if (query.category?.trim()) params.set("category", query.category.trim());
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (page !== 1) params.set("page", String(page));
  return `${pathname}${params.size ? `?${params}` : ""}`;
};

export const getBlogListingSeo = (
  pathname: string,
  query: BlogIndexQuery,
  title: string,
  notFound = false,
  unavailable = false,
) => ({
  title: notFound
    ? "Страница не найдена | МОСТ"
    : `${title}${(query.page ?? 1) > 1 ? ` — страница ${query.page}` : ""}`,
  canonicalUrl: `https://1мост.рф${buildBlogPageUrl(pathname, query)}`,
  noIndex:
    notFound ||
    unavailable ||
    query.page === 0 ||
    Boolean(query.category || query.search),
  statusCode: notFound || query.page === 0 ? 404 : unavailable ? 503 : 200,
});

export const BLOG_INDEX_BASE_QUERY_KEY = buildBlogIndexQueryKey();
