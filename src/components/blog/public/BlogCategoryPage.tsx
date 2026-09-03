import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BlogArticleCard from "./BlogArticleCard";
import BlogPagination from "./BlogPagination";
import BlogPublicLayout from "./BlogPublicLayout";
import BlogSidebar from "./BlogSidebar";
import { getBlogListMeta } from "./blogPresentation";
import { useSEO } from "@/hooks/useSEO";
import type {
  BlogArticle,
  BlogCategory,
  BlogCategoryInitialData,
} from "@/types/blog";
import { getBlogCategorySeo } from "@/utils/blogCategorySeo";
import {
  buildBlogIndexQueryKey,
  readBlogIndexQuery,
  type BlogIndexQuery,
} from "@/utils/blogIndexQuery";
import { blogPublicApi } from "@/utils/blogPublicApi";

interface BlogCategoryPageProps {
  initialData?: BlogCategoryInitialData;
}

const BlogCategoryContent = ({
  slug,
  query,
  initialData,
}: BlogCategoryPageProps & { slug: string; query: BlogIndexQuery }) => {
  const page = query.page ?? 1;
  const [articles, setArticles] = useState<BlogArticle[]>(
    initialData?.articles ?? [],
  );
  const [category, setCategory] = useState<BlogCategory | null>(
    initialData?.category ?? null,
  );
  const [categories, setCategories] = useState<BlogCategory[]>(
    initialData?.categories ?? [],
  );
  const [loading, setLoading] = useState(
    !initialData?.articlesLoaded && !initialData?.notFound && page > 0,
  );
  const [hasMore, setHasMore] = useState(
    Boolean(
      initialData &&
      initialData.pagination.current_page < initialData.pagination.last_page,
    ),
  );
  const [notFound, setNotFound] = useState(initialData?.notFound ?? false);
  const [pageNotFound, setPageNotFound] = useState(
    Boolean(initialData?.pageNotFound || page === 0),
  );
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(
    Boolean(initialData?.unavailable),
  );
  useSEO(
    getBlogCategorySeo(
      slug,
      category,
      notFound,
      query,
      pageNotFound,
      unavailable,
    ),
  );

  useEffect(() => {
    let cancelled = false;
    const fetchInitialData = async () => {
      if (page === 0 || initialData?.notFound || initialData?.articlesLoaded)
        return;
      try {
        setLoading(true);
        setError(null);
        const categoriesData = initialData?.categoriesLoaded
          ? initialData.categories
          : (await blogPublicApi.getCategories()).data.data;
        if (cancelled) return;
        const resolvedCategory =
          categoriesData.find((item) => item.slug === slug && item.is_active) ??
          null;
        setCategories(categoriesData);
        setCategory(resolvedCategory);
        setNotFound(resolvedCategory === null);
        if (!resolvedCategory) {
          setUnavailable(false);
          return;
        }
        if (resolvedCategory.id === null)
          throw new Error("Missing category identifier");
        const { data: payload } = await blogPublicApi.getArticles({
          page,
          per_page: 12,
          category_id: resolvedCategory.id,
          search: query.search || undefined,
        });
        if (cancelled) return;
        if (!payload.meta) throw new Error("Missing article pagination");
        if (
          payload.meta.current_page > payload.meta.last_page &&
          payload.data.length > 0
        )
          throw new Error("Invalid article pagination");
        const missingPage =
          page > payload.meta.last_page || page !== payload.meta.current_page;
        setPageNotFound(missingPage);
        setUnavailable(false);
        setArticles(missingPage ? [] : payload.data);
        setHasMore(!missingPage && page < payload.meta.last_page);
      } catch {
        if (!cancelled) {
          setUnavailable(true);
          setError("Не удалось загрузить материалы этой категории.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchInitialData();
    return () => {
      cancelled = true;
    };
  }, [slug, initialData, page, query.search]);

  return (
    <BlogPublicLayout
      title={
        notFound
          ? "Категория не найдена"
          : pageNotFound
            ? "Страница не найдена"
            : category
              ? category.name
              : "Материалы по категории"
      }
      description={
        category?.description ||
        "Статьи о задачах строительной команды, документах и работе на объекте."
      }
      nav={[
        { label: "Лента категории", href: "#blog-feed" },
        { label: "Все категории", href: "#blog-category-switcher" },
        { label: "Контакты", href: "#blog-cta" },
      ]}
    >
      <section id="blog-category-switcher" className="most-blog-filters">
        <div className="most-container">
          <nav className="most-blog-topic-filter" aria-label="Категории статей">
            <Link to="/blog">Все статьи</Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                to={`/blog/category/${item.slug}`}
                aria-current={item.slug === slug ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section id="blog-feed" className="most-blog-section">
        <div className="most-container most-blog-list-layout">
          <div>
            <div className="most-blog-feed-intro">
              <h2>Статьи по теме</h2>
              <p>{getBlogListMeta(articles.length)}</p>
            </div>
            {loading ? (
              <div className="most-blog-grid" aria-label="Загружаем статьи">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="most-blog-skeleton">
                    <div className="aspect-[16/10] animate-pulse bg-concrete-100" />
                    <div className="mt-5 h-4 w-32 animate-pulse bg-concrete-100" />
                    <div className="mt-4 h-8 w-4/5 animate-pulse bg-concrete-100" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="most-blog-notice" role="alert">
                <h3>Материалы временно недоступны</h3>
                <p>{error}</p>
              </div>
            ) : articles.length ? (
              <>
                <div className="most-blog-grid">
                  {articles.map((article) => (
                    <BlogArticleCard key={article.id} article={article} />
                  ))}
                </div>
                <BlogPagination
                  pathname={`/blog/category/${encodeURIComponent(slug)}`}
                  query={query}
                  hasNext={hasMore}
                />
              </>
            ) : (
              <div className="most-blog-notice">
                <h3>
                  {pageNotFound
                    ? "Страница не найдена"
                    : notFound
                      ? "Выберите другую тему"
                      : "В этой категории пока нет статей"}
                </h3>
                <p>
                  Вернитесь к общей ленте или выберите соседнюю тему в списке
                  категорий.
                </p>
                <Link
                  to={`/blog/category/${encodeURIComponent(slug)}`}
                  className="most-blog-read"
                >
                  К началу подборки
                </Link>
              </div>
            )}
          </div>
          <BlogSidebar categories={categories} />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

const BlogCategoryPage = ({ initialData }: BlogCategoryPageProps = {}) => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const query = { ...readBlogIndexQuery(params), category: null };
  const queryKey = buildBlogIndexQueryKey({ ...query, category: slug });
  const initialKey =
    initialData?.queryKey ??
    buildBlogIndexQueryKey({ category: initialData?.slug, page: 1 });
  return (
    <BlogCategoryContent
      key={`${slug}:${queryKey}`}
      slug={slug}
      query={query}
      initialData={
        initialData?.slug === slug && initialKey === queryKey
          ? initialData
          : undefined
      }
    />
  );
};

export default BlogCategoryPage;
