import {
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { marketingPaths } from "@/data/marketing/common";
import { blogPublicApi } from "@/utils/blogPublicApi";
import type { BlogArticle, BlogCategory, BlogTag } from "@/types/blog";
import { formatBlogDate } from "./blogPresentation";

interface BlogSidebarProps {
  categories?: BlogCategory[];
  showSearch?: boolean;
  showCategories?: boolean;
}

const BlogSidebar = ({
  categories: providedCategories,
  showSearch = true,
  showCategories = true,
}: BlogSidebarProps) => {
  const navigate = useNavigate();
  const [fetchedCategories, setFetchedCategories] = useState<BlogCategory[]>(
    [],
  );
  const [popularArticles, setPopularArticles] = useState<BlogArticle[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const categories = providedCategories ?? fetchedCategories;
  const shouldFetchCategories = providedCategories === undefined;

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const categoriesRequest = shouldFetchCategories
          ? blogPublicApi.getCategories()
          : Promise.resolve(null);
        const [categoriesResponse, popularResponse, tagsResponse] =
          await Promise.all([
            categoriesRequest,
            blogPublicApi.getPopularArticles(4),
            blogPublicApi.getTags(),
          ]);
        if (categoriesResponse) {
          setFetchedCategories(
            (categoriesResponse.data as { data: BlogCategory[] }).data,
          );
        }
        setPopularArticles(
          (popularResponse.data as { data: BlogArticle[] }).data,
        );
        setTags((tagsResponse.data as { data: BlogTag[] }).data.slice(0, 12));
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };
    fetchSidebarData();
  }, [shouldFetchCategories]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <aside className="most-blog-sidebar" aria-label="Навигация по блогу">
      {showSearch ? (
        <section>
          <h2>Поиск по блогу</h2>
          <form onSubmit={handleSearch} className="most-blog-search">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Например, график работ"
              aria-label="Поиск по блогу"
            />
            <button type="submit" aria-label="Найти статьи">
              <MagnifyingGlassIcon aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}
      {showCategories && categories.length ? (
        <section id="blog-categories">
          <h2>Темы</h2>
          <div className="most-blog-sidebar-links">
            {categories.map((category) => (
              <Link key={category.id} to={`/blog/category/${category.slug}`}>
                <span>{category.name}</span>
                <span>
                  {category.published_articles_count ??
                    category.articles_count ??
                    0}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {popularArticles.length ? (
        <section>
          <h2>Популярные материалы</h2>
          {popularArticles.map((article) => (
            <article key={article.id} className="most-blog-sidebar-article">
              <time dateTime={article.published_at || article.created_at || undefined}>
                {formatBlogDate(article.published_at || article.created_at)}
              </time>
              <h3>
                <Link to={`/blog/${article.slug}`}>{article.title}</Link>
              </h3>
            </article>
          ))}
        </section>
      ) : null}
      {tags.length ? (
        <section>
          <h2>Указатель тем</h2>
          <div className="most-blog-tags">
            {tags.map((tag) => (
              <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section id="blog-cta" className="most-blog-cta">
        <h2>Обсудим вашу задачу</h2>
        <p>
          Расскажите, как работает ваша команда. Покажем, какие задачи можно
          вести в МОСТ.
        </p>
        <Link to={marketingPaths.contact} className="most-blog-read">
          Связаться с нами
          <ArrowUpRightIcon aria-hidden="true" />
        </Link>
        <Link to={marketingPaths.about} className="most-blog-read">
          О продукте
          <ArrowUpRightIcon aria-hidden="true" />
        </Link>
      </section>
    </aside>
  );
};

export default BlogSidebar;
