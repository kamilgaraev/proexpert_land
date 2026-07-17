import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BlogArticleCard from "./BlogArticleCard";
import BlogPublicLayout from "./BlogPublicLayout";
import BlogSidebar from "./BlogSidebar";
import { getBlogListMeta } from "./blogPresentation";
import { SectionHeader } from "@/components/marketing/MarketingPrimitives";
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
  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");
  const queryKey = useMemo(
    () =>
      buildBlogIndexQueryKey({
        category: selectedCategory,
        search: searchQuery,
      }),
    [searchQuery, selectedCategory],
  );
  const [articles, setArticles] = useState<BlogArticle[]>(
    () => initialData?.articles ?? [],
  );
  const [categories, setCategories] = useState<BlogCategory[]>(
    () => initialData?.categories ?? [],
  );
  const [categoriesLoaded, setCategoriesLoaded] = useState(
    initialData?.categoriesLoaded ?? false,
  );
  const [loading, setLoading] = useState(
    () => !(initialData?.articlesLoaded ?? false),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    initialData?.articlesLoaded
      ? initialData.pagination.current_page < initialData.pagination.last_page
      : true,
  );
  const [loadedPage, setLoadedPage] = useState(() =>
    initialData?.articlesLoaded ? initialData.pagination.current_page : 0,
  );
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const appliedQueryKeyRef = useRef(
    initialData?.articlesLoaded
      ? (initialData.queryKey ?? BLOG_INDEX_BASE_QUERY_KEY)
      : null,
  );
  const articlesRequestRef = useRef<ArticlesRequest | null>(null);
  const articlesGenerationRef = useRef(0);
  const categoriesRequestRef = useRef<Promise<BlogCategory[]> | null>(null);
  const currentQueryKeyRef = useRef(queryKey);
  const loadingMoreRef = useRef(false);
  const mountedRef = useRef(false);
  currentQueryKeyRef.current = queryKey;

  useSEO({
    ...marketingSeo.blog,
    type: "website",
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

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
      categories.find((category) => category.slug === selectedCategory)?.id ??
      undefined
    );
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (selectedCategory && !categoriesLoaded) {
      return;
    }

    if (selectedCategory && categoryId === undefined) {
      appliedQueryKeyRef.current = queryKey;
      loadingMoreRef.current = false;
      setArticles([]);
      setLoadedPage(0);
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      setError("Категория не найдена.");
      return;
    }

    if (appliedQueryKeyRef.current === queryKey) {
      setLoading(false);
      return;
    }

    let active = true;
    loadingMoreRef.current = false;
    setLoadingMore(false);
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
            page: 1,
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

        const currentPage = payload.meta?.current_page ?? 1;
        const lastPage = payload.meta?.last_page ?? currentPage;
        appliedQueryKeyRef.current = queryKey;
        setArticles(payload.data);
        setLoadedPage(currentPage);
        setHasMore(currentPage < lastPage);
      })
      .catch((fetchError) => {
        if (
          !active ||
          currentQueryKeyRef.current !== queryKey ||
          articlesGenerationRef.current !== generation
        ) {
          return;
        }

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
  }, [categoriesLoaded, categoryId, queryKey, searchQuery, selectedCategory]);

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

  const handleLoadMore = async () => {
    if (loadingMoreRef.current) {
      return;
    }

    const requestQueryKey = queryKey;
    const requestGeneration = articlesGenerationRef.current;
    const nextPage = loadedPage + 1;
    loadingMoreRef.current = true;

    try {
      setLoadingMore(true);

      const response = await blogPublicApi.getArticles({
        page: nextPage,
        per_page: 12,
        category_id: categoryId,
        search: searchQuery || undefined,
      });

      if (
        !mountedRef.current ||
        currentQueryKeyRef.current !== requestQueryKey ||
        articlesGenerationRef.current !== requestGeneration
      ) {
        return;
      }

      const payload = response.data;
      const currentPage = payload.meta?.current_page ?? nextPage;
      const lastPage = payload.meta?.last_page ?? currentPage;
      setArticles((prev) => [...prev, ...payload.data]);
      setLoadedPage(currentPage);
      setHasMore(currentPage < lastPage);

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(currentPage));
        return next;
      });
    } catch (fetchError) {
      if (
        !mountedRef.current ||
        currentQueryKeyRef.current !== requestQueryKey
      ) {
        return;
      }

      console.error("Error loading more articles:", fetchError);
      setError("Не удалось загрузить следующую страницу статей.");
    } finally {
      if (
        mountedRef.current &&
        currentQueryKeyRef.current === requestQueryKey
      ) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  const selectedCategoryMeta = categories.find(
    (category) => category.slug === selectedCategory,
  );
  const heroAside = (
    <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
        Что внутри блога
      </div>
      <div className="mt-4 grid gap-3">
        {[
          "Организация ежедневной работы на объекте.",
          "Документы, заявки, снабжение и подрядчики.",
          "Данные для руководителя и подготовка отчётности.",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <BlogPublicLayout
      eyebrow="Блог МОСТ"
      title="Практические статьи об управлении стройкой."
      description="В блоге опубликованы материалы о работе прораба и ПТО, графиках, заявках на материалы, подрядчиках, документах и ежедневной проверке объектов руководителем."
      nav={[
        { label: "Лента статей", href: "#blog-feed" },
        { label: "Фильтры", href: "#blog-filters" },
        { label: "Контакты", href: "#blog-cta" },
      ]}
      aside={heroAside}
    >
      <section id="blog-filters" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.78fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Лента"
              title="Найдите материал по теме или роли."
              description="Используйте поиск по словам или выберите категорию. В ленте остаются только опубликованные статьи."
            />
          </div>

          <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Поиск и фильтры
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Например, бюджет, график работ или снабжение"
                className="w-full rounded-[1.1rem] border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
              />
            </div>
            <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
              <FunnelIcon className="h-4 w-4" />
              Категории
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleCategoryFilter(null)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !selectedCategory
                    ? "bg-steel-950 text-white"
                    : "border border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700"
                }`}
              >
                Все статьи
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category.slug
                      ? "border-transparent text-white"
                      : "border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700"
                  }`}
                  style={
                    selectedCategory === category.slug
                      ? { backgroundColor: category.color }
                      : undefined
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="blog-feed" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                    Подборка материалов
                  </div>
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
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-sm"
                  >
                    <div className="aspect-[16/10] animate-pulse rounded-[1.35rem] bg-concrete-100" />
                    <div className="mt-5 h-4 w-32 animate-pulse rounded bg-concrete-100" />
                    <div className="mt-4 h-8 w-4/5 animate-pulse rounded bg-concrete-100" />
                    <div className="mt-3 h-20 animate-pulse rounded bg-concrete-100" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="mt-6 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm leading-7 text-rose-700">
                {error}
              </div>
            ) : articles.length === 0 ? (
              <div className="mt-6 rounded-[1.75rem] border border-steel-200 bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-steel-950">
                  Статьи не найдены
                </h3>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Попробуйте изменить запрос, снять фильтр по категории или
                  перейти к общей ленте.
                </p>
                <a
                  href={marketingPaths.blog}
                  className="mt-5 inline-flex w-full min-w-0 flex-wrap items-center justify-center rounded-full bg-steel-950 px-5 py-3 text-center text-sm font-semibold text-white whitespace-normal [overflow-wrap:anywhere] transition hover:bg-steel-900 sm:w-auto"
                >
                  Открыть все статьи
                </a>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {articles.map((article) => (
                    <BlogArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {hasMore ? (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className={`inline-flex w-full min-w-0 flex-wrap items-center justify-center rounded-full px-5 py-3 text-center text-sm font-semibold whitespace-normal [overflow-wrap:anywhere] transition sm:w-auto ${
                        loadingMore
                          ? "cursor-not-allowed bg-steel-300 text-white"
                          : "bg-steel-950 text-white hover:bg-steel-900"
                      }`}
                    >
                      {loadingMore ? "Загружаем статьи" : "Показать еще"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <BlogSidebar categories={categories} />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogPublicPage;
