import { Link } from "react-router-dom";
import { buildBlogPageUrl, type BlogIndexQuery } from "@/utils/blogIndexQuery";

interface BlogPaginationProps {
  pathname: string;
  query: BlogIndexQuery;
  hasNext: boolean;
}

export default function BlogPagination({
  pathname,
  query,
  hasNext,
}: BlogPaginationProps) {
  const page = query.page ?? 1;
  if (page < 1 || (page === 1 && !hasNext)) return null;
  return (
    <nav className="most-blog-topic-filter mt-8" aria-label="Страницы статей">
      {page > 1 ? (
        <Link to={buildBlogPageUrl(pathname, query, page - 1)} rel="prev">
          Предыдущая
        </Link>
      ) : null}
      <span aria-current="page">Страница {page}</span>
      {hasNext ? (
        <Link to={buildBlogPageUrl(pathname, query, page + 1)} rel="next">
          Следующая
        </Link>
      ) : null}
    </nav>
  );
}
