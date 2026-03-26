import { ArrowUpRightIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import type { BlogArticle } from '@/types/blog';
import { formatBlogDate, getBlogReadingTime } from './blogPresentation';

interface BlogArticleCardProps {
  article: BlogArticle;
}

const BlogArticleCard = ({ article }: BlogArticleCardProps) => (
  <article className="rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-construction-300">
    {article.featured_image ? (
      <Link to={`/blog/${article.slug}`} className="block overflow-hidden rounded-[1.35rem] border border-steel-100 bg-concrete-50">
        <img
          src={article.featured_image}
          alt={article.title}
          className="aspect-[16/10] h-auto w-full object-cover transition duration-300 hover:scale-[1.02]"
        />
      </Link>
    ) : null}

    <div className={article.featured_image ? 'mt-5' : ''}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
          style={{ backgroundColor: article.category.color }}
        >
          {article.category.name}
        </span>
        {article.is_featured ? (
          <span className="inline-flex rounded-full border border-construction-200 bg-construction-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-construction-700">
            Рекомендуем
          </span>
        ) : null}
      </div>

      <h2 className="mt-4 text-2xl font-bold leading-tight text-steel-950">
        <Link to={`/blog/${article.slug}`} className="transition hover:text-construction-700">
          {article.title}
        </Link>
      </h2>

      {article.excerpt ? (
        <p className="mt-4 text-sm leading-7 text-steel-600">{article.excerpt}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-steel-100 pt-4 text-sm text-steel-500">
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          {formatBlogDate(article.published_at || article.created_at)}
        </span>
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          {getBlogReadingTime(article.content)}
        </span>
        <span className="inline-flex items-center gap-2">
          <EyeIcon className="h-4 w-4" />
          {article.views_count?.toLocaleString('ru-RU') || 0}
        </span>
      </div>

      {article.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag.id}
              to={`/blog/tag/${tag.slug}`}
              className="rounded-full bg-concrete-50 px-3 py-1 text-xs font-semibold text-steel-600 transition hover:bg-construction-50 hover:text-construction-700"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      ) : null}

      <Link
        to={`/blog/${article.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-construction-700 transition hover:text-construction-800"
      >
        Читать статью
        <ArrowUpRightIcon className="h-4 w-4" />
      </Link>
    </div>
  </article>
);

export default BlogArticleCard;
