import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CtaBand from '@/components/marketing/blocks/CtaBand';
import { marketingPaths } from '@/data/marketing/common';
import { blogPublicApi } from '@/utils/blogPublicApi';
import type { BlogArticle, BlogCategory, BlogTag } from '@/types/blog';
import { formatBlogDate } from './blogPresentation';

const BlogSidebar = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<BlogArticle[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [categoriesResponse, popularResponse, tagsResponse] = await Promise.all([
          blogPublicApi.getCategories(),
          blogPublicApi.getPopularArticles(4),
          blogPublicApi.getTags(),
        ]);

        setCategories((categoriesResponse.data as { data: BlogCategory[] }).data);
        setPopularArticles((popularResponse.data as { data: BlogArticle[] }).data);
        setTags((tagsResponse.data as { data: BlogTag[] }).data.slice(0, 12));
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      }
    };

    fetchSidebarData();
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <aside className="space-y-5">
      <section className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
          Поиск по блогу
        </div>
        <form onSubmit={handleSearch} className="relative mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Например, график работ"
            className="w-full rounded-[1.1rem] border border-steel-300 px-4 py-3 pl-11 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
          />
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel-400" />
        </form>
      </section>

      {categories.length ? (
        <section id="blog-categories" className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
            Категории
          </div>
          <div className="mt-4 grid gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/blog/category/${category.slug}`}
                className="flex items-start justify-between gap-3 rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm text-steel-700 transition hover:bg-construction-50 hover:text-construction-700"
              >
                <span className="inline-flex min-w-0 items-center gap-3 font-semibold">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="break-words">{category.name}</span>
                </span>
                <span className="shrink-0 text-steel-500">
                  {category.published_articles_count || category.articles_count || 0}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {popularArticles.length ? (
        <section className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
            Популярные материалы
          </div>
          <div className="mt-4 grid gap-4">
            {popularArticles.map((article) => (
              <article key={article.id} className="rounded-[1.15rem] bg-concrete-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-steel-500">
                  {formatBlogDate(article.published_at || article.created_at)}
                </div>
                <h3 className="mt-2 text-base font-bold leading-6 text-steel-950">
                  <Link to={`/blog/${article.slug}`} className="transition hover:text-construction-700">
                    {article.title}
                  </Link>
                </h3>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tags.length ? (
        <section className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
            Теги
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/blog/tag/${tag.slug}`}
                className="rounded-full bg-concrete-50 px-3 py-2 text-xs font-semibold text-steel-600 transition hover:bg-construction-50 hover:text-construction-700"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="blog-cta">
        <CtaBand
          eyebrow="Следующий шаг"
          title="Если нужен разбор вашего процесса, покажем релевантный сценарий ProHelper."
          description="На встрече свяжем материалы блога с вашим типом компании, текущими ролями и задачами запуска."
          actions={[
            { label: 'Связаться с нами', href: marketingPaths.contact, primary: true },
            { label: 'О продукте', href: marketingPaths.about },
          ]}
          tone="dark"
          size="compact"
        />
      </section>
    </aside>
  );
};

export default BlogSidebar;
