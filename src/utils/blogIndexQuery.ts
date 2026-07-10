export interface BlogIndexQuery {
  category?: string | null;
  search?: string | null;
}

export const buildBlogIndexQueryKey = ({ category, search }: BlogIndexQuery = {}) => {
  const params = new URLSearchParams();
  params.set('category', category?.trim() ?? '');
  params.set('search', search?.trim() ?? '');
  params.set('page', '1');

  return params.toString();
};

export const BLOG_INDEX_BASE_QUERY_KEY = buildBlogIndexQueryKey();
