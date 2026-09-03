import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BlogArticleCard from "./BlogArticleCard";
import BlogPagination from "./BlogPagination";
import BlogPublicLayout from "./BlogPublicLayout";
import BlogSidebar from "./BlogSidebar";
import BlogTopicFilter from "./BlogTopicFilter";
import { getBlogListMeta } from "./blogPresentation";
import { marketingPaths, marketingSeo } from "@/data/marketingRegistry";
import { useSEO } from "@/hooks/useSEO";
import type {
  BlogArticle,
  BlogCategory,
  BlogIndexInitialData,
  BlogPaginationMeta,
} from "@/types/blog";
import {
  BLOG_INDEX_BASE_QUERY_KEY,
  buildBlogIndexQueryKey,
  getBlogListingSeo,
  readBlogIndexQuery,
} from "@/utils/blogIndexQuery";
import { blogPublicApi } from "@/utils/blogPublicApi";

interface BlogPublicPageProps {
  initialData?: BlogIndexInitialData;
}

interface ArticlesRequest {
  generation: number;
  key: string;
  promise: Promise<{ data: BlogArticle[]; meta?: BlogPaginationMeta }>;
}

const BlogPublicPage = ({ initialData }: BlogPublicPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = readBlogIndexQuery(searchParams);
  const selectedCategory = query.category;
  const searchQuery = query.search;
  const page = query.page ?? 1;
  const queryKey = useMemo(
    () =>
      buildBlogIndexQueryKey({
        category: selectedCategory,
        search: searchQuery,
        page,
      }),
    [searchQuery, selectedCategory, page],
  );
  const matchingInitialData =
    initialData?.queryKey === queryKey ? initialData : undefined;
  const [articles, setArticles] = useState<BlogArticle[]>(
    () => matchingInitialData?.articles ?? [],
  );
  const [categories, setCategories] = useState<BlogCategory[]>(
    () => initialData?.categories ?? [],
  );
  const [categoriesLoaded, setCategoriesLoaded] = useState(
    initialData?.categoriesLoaded ?? false,
  );
  const [categoriesError, setCategoriesError] = useState(false);
  const [unavailable, setUnavailable] = useState(
    Boolean(matchingInitialData?.unavailable),
  );
  const [loading, setLoading] = useState(
    () => !(matchingInitialData?.articlesLoaded ?? false) && page > 0,
  );
  const [hasMore, setHasMore] = useState(() =>
    initialData?.articlesLoaded
      ? initialData.pagination.current_page < initialData.pagination.last_page
      : true,
  );
  const [notFound, setNotFound] = useState(
    Boolean(matchingInitialData?.notFound || page === 0),
  );
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const appliedQueryKeyRef = useRef(
    matchingInitialData?.articlesLoaded
      ? (matchingInitialData.queryKey ?? BLOG_INDEX_BASE_QUERY_KEY)
      : null,
  );
  const articlesRequestRef = useRef<ArticlesRequest | null>(null);
  const articlesGenerationRef = useRef(0);
  const categoriesRequestRef = useRef<Promise<BlogCategory[]> | null>(null);
  const currentQueryKeyRef = useRef(queryKey);
  currentQueryKeyRef.current = queryKey;

  useSEO({
    ...marketingSeo.blog,
    ...getBlogListingSeo(
      "/blog",
      query,
      marketingSeo.blog.title,
      notFound,
      unavailable || categoriesError,
    ),
    type: "website",
  });

  useEffect(() => {
    setSearchInput(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalizedValue = searchInput.trim();
      const previousValue = searchParams.get("search") || "";

      if (normalizedValue === previousValue) {
        return;
      }

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (normalizedValue) {
          next.set("search", normalizedValue);
        } else {
          next.delete("search");
        }

        next.delete("page");
        return next;
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  useEffect(() => {
    if (categoriesLoaded) {
      return;
    }

    let active = true;

    if (!categoriesRequestRef.current) {
      categoriesRequestRef.current = blogPublicApi
        .getCategories()
        .then((response) => response.data.data);
    }

    categoriesRequestRef.current
      .then((nextCategories) => {
        if (!active) {
          return;
        }

        setCategories(nextCategories);
        setCategoriesLoaded(true);
      })
      .catch((fetchError) => {
        if (!active) {
          return;
        }

        setCategoriesError(true);
        console.error("Error fetching categories:", fetchError);
      });

    return () => {
      active = false;
    };
  }, [categoriesLoaded]);

  const categoryId = useMemo(() => {
    if (!selectedCategory) {
      return undefined;
    }

    return (
      categories.find(
        (category) => category.slug === selectedCategory && category.is_active,
      )?.id ?? undefined
    );
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (page === 0) {
      appliedQueryKeyRef.current = queryKey;
      setArticles([]);
      setNotFound(true);
      setUnavailable(false);
      setLoading(false);
      setHasMore(false);
      setError(null);
      return;
    }
    if (selectedCategory && !categoriesLoaded) {
      setLoading(!categoriesError);
      setError(
        categoriesError
          ? "Не удалось загрузить категории. Попробуйте обновить страницу позже."
          : null,
      );
      return;
    }

    if (selectedCategory && categoryId === undefined) {
      appliedQueryKeyRef.current = queryKey;
      setNotFound(true);
      setArticles([]);
      setHasMore(false);
      setLoading(false);
      setError("Категория не найдена.");
      return;
    }

    if (appliedQueryKeyRef.current === queryKey) {
      if (categoriesLoaded) setUnavailable(false);
      setLoading(false);
      return;
    }

    let active = true;
    setNotFound(false);
    setLoading(true);
    setError(null);

    let request = articlesRequestRef.current;

    if (!request || request.key !== queryKey) {
      const generation = articlesGenerationRef.current + 1;
      articlesGenerationRef.current = generation;
      request = {
        generation,
        key: queryKey,
        promise: blogPublicApi
          .getArticles({
            page,
            per_page: 12,
            category_id: categoryId,
            search: searchQuery || undefined,
          })
          .then((response) => response.data),
      };
      articlesRequestRef.current = request;
    }

    const { generation } = request;

    request.promise
      .then((payload) => {
        if (
          !active ||
          currentQueryKeyRef.current !== queryKey ||
          articlesGenerationRef.current !== generation
        ) {
          return;
        }

        if (!payload.meta) throw new Error("Missing article pagination");
        const currentPage = payload.meta.current_page;
        const lastPage = payload.meta.last_page;
        if (currentPage > lastPage && payload.data.length > 0)
          throw new Error("Invalid article pagination");
        const pageNotFound = page > lastPage || currentPage !== page;
        appliedQueryKeyRef.current = queryKey;
        setArticles(pageNotFound ? [] : payload.data);
        setNotFound(pageNotFound);
        setUnavailable(false);
        setHasMore(!pageNotFound && currentPage < lastPage);
      })
      .catch((fetchError) => {
        if (
          !active ||
          currentQueryKeyRef.current !== queryKey ||
          articlesGenerationRef.current !== generation
        ) {
          return;
        }

        setUnavailable(true);
        console.error("Error fetching articles:", fetchError);
        setError(
          "Не удалось загрузить статьи. Попробуйте обновить страницу позже.",
        );
      })
      .finally(() => {
        if (
          !active ||
          currentQueryKeyRef.current !== queryKey ||
          articlesGenerationRef.current !== generation
        ) {
          return;
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    categoriesLoaded,
    categoriesError,
    categoryId,
    queryKey,
    searchQuery,
    selectedCategory,
    page,
  ]);

  const handleCategoryFilter = (categorySlug: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (categorySlug) {
        next.set("category", categorySlug);
      } else {
        next.delete("category");
      }

      next.delete("page");
      return next;
    });
  };

  const selectedCategoryMeta = categories.find(
    (category) => category.slug === selectedCategory,
  );

  return (
    <BlogPublicLayout
      title="О работе на стройке и в офисе"
      description="Графики, материалы, документы и работа команды. Разбираем задачи, которые каждый день связывают площадку и офис."
      nav={[]}
    >
      <section id="blog-filters" className="most-blog-filters">
        <div className="most-container">
          <div>
            <label htmlFor="blog-search" className="most-blog-search-label">
              Найти статью
            </label>
            <div className="most-blog-search most-blog-search-wide">
              <MagnifyingGlassIcon aria-hidden="true" />
              <input
                id="blog-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Например, бюджет, график работ или снабжение"
              />
            </div>
            <BlogTopicFilter selectedName={selectedCategoryMeta?.name}>
              <button
                type="button"
                onClick={() => handleCategoryFilter(null)}
                aria-pressed={!selectedCategory}
              >
                Все статьи
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryFilter(category.slug)}
                  aria-pressed={selectedCategory === category.slug}
                >
                  {category.name}
                </button>
              ))}
            </BlogTopicFilter>
          </div>
        </div>
      </section>

      <section id="blog-feed" className="most-blog-section">
        <div className="most-container most-blog-list-layout">
          <div>
            <div className="most-blog-feed-intro">
              <div className="most-blog-feed-heading">
                <div>
                  <h2 className="mt-2 text-3xl font-bold text-steel-950">
                    {selectedCategoryMeta
                      ? selectedCategoryMeta.name
                      : "Все статьи"}
                  </h2>
                </div>
                <div className="text-sm text-steel-500">
                  {getBlogListMeta(articles.length)}
                </div>
              </div>
              {searchQuery ? (
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Поиск по запросу:{" "}
                  <span className="font-semibold text-steel-950">
                    {searchQuery}
                  </span>
                </p>
              ) : null}
            </div>

            {loading ? (
              <div className="most-blog-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="most-blog-skeleton">
                    <div className="aspect-[16/10] animate-pulse bg-concrete-100" />
                    <div className="mt-5 h-4 w-32 animate-pulse rounded bg-concrete-100" />
                    <div className="mt-4 h-8 w-4/5 animate-pulse rounded bg-concrete-100" />
                    <div className="mt-3 h-20 animate-pulse rounded bg-concrete-100" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="most-blog-notice">{error}</div>
            ) : articles.length === 0 ? (
              <div className="most-blog-notice">
                <h3 className="text-2xl font-bold text-steel-950">
                  {notFound ? "Страница не найдена" : "Статьи не найдены"}
                </h3>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Попробуйте изменить запрос, снять фильтр по категории или
                  перейти к общей ленте.
                </p>
                <a href={marketingPaths.blog} className="most-blog-button">
                  Открыть все статьи
                </a>
              </div>
            ) : (
              <>
                <div className="most-blog-grid">
                  {articles.map((article) => (
                    <BlogArticleCard key={article.id} article={article} />
                  ))}
                </div>

                <BlogPagination
                  pathname="/blog"
                  query={query}
                  hasNext={hasMore}
                />
              </>
            )}
          </div>

          <BlogSidebar
            categories={categories}
            showSearch={false}
            showCategories={false}
          />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogPublicPage;
