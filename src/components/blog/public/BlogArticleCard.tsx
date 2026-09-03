import { ArrowUpRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import type { BlogArticle } from "@/types/blog";
import { formatBlogDate, getBlogReadingTime } from "./blogPresentation";

interface BlogArticleCardProps {
  article: BlogArticle;
}

const BlogArticleCard = ({ article }: BlogArticleCardProps) => (
  <article className="most-blog-card">
    {article.featured_image ? (
      <Link
        to={`/blog/${article.slug}`}
        className="most-blog-card-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={article.featured_image}
          alt=""
          loading="lazy"
          decoding="async"
          width={960}
          height={600}
        />
      </Link>
    ) : null}
    <div className="most-blog-card-content">
      <div className="most-blog-meta">
        <Link to={`/blog/category/${article.category.slug}`}>
          {article.category.name}
        </Link>
        <time dateTime={article.published_at || article.created_at || undefined}>
          {formatBlogDate(article.published_at || article.created_at)}
        </time>
      </div>
      <h2>
        <Link to={`/blog/${article.slug}`}>{article.title}</Link>
      </h2>
      {article.excerpt ? (
        <p className="most-blog-card-excerpt">{article.excerpt}</p>
      ) : null}
      <div className="most-blog-card-bottom">
        <span className="most-blog-reading">
          <ClockIcon aria-hidden="true" />
          {getBlogReadingTime(article.content)}
        </span>
        <Link to={`/blog/${article.slug}`} className="most-blog-read">
          Читать статью
          <ArrowUpRightIcon aria-hidden="true" />
        </Link>
      </div>
      {article.tags?.length ? (
        <div className="most-blog-tags" aria-label="Темы статьи">
          {article.tags.slice(0, 3).map((tag) => (
            <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  </article>
);

export default BlogArticleCard;
