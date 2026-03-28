import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogArticleCard from './BlogArticleCard';
import BlogPublicLayout from './BlogPublicLayout';
import BlogSidebar from './BlogSidebar';
import { getBlogListMeta } from './blogPresentation';
import { MarketingLink, SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { marketingBlogEditorialSeries, marketingPaths, marketingSeo } from '@/data/marketingRegistry';
import { useSEO } from '@/hooks/useSEO';
import type { BlogArticle, BlogCategory } from '@/types/blog';
import { blogPublicApi } from '@/utils/blogPublicApi';

const BlogPublicPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  useSEO({
    ...marketingSeo.blog,
    type: 'website',
  });

  const currentPage = Number(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalizedValue = searchInput.trim();
      const previousValue = searchParams.get('search') || '';

      if (normalizedValue === previousValue) {
        return;
      }

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        if (normalizedValue) {
          next.set('search', normalizedValue);
        } else {
          next.delete('search');
        }

        next.delete('page');
        return next;
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await blogPublicApi.getCategories();
        setCategories((response.data as { data: BlogCategory[] }).data);
      } catch (fetchError) {
        console.error('Error fetching categories:', fetchError);
      }
    };

    fetchCategories();
  }, []);

  const categoryId = useMemo(() => {
    if (!selectedCategory) {
      return undefined;
    }

    return categories.find((category) => category.slug === selectedCategory)?.id;
  }, [categories, selectedCategory]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await blogPublicApi.getArticles({
          page: 1,
          per_page: 12,
          category_id: categoryId,
          search: searchQuery || undefined,
        });

        const payload = response.data as { data: BlogArticle[]; meta: { current_page: number; last_page: number } };
        setArticles(payload.data);
        setHasMore(payload.meta.current_page < payload.meta.last_page);
      } catch (fetchError) {
        console.error('Error fetching articles:', fetchError);
        setError('Не удалось загрузить статьи. Попробуйте обновить страницу позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [categoryId, searchQuery]);

  const handleCategoryFilter = (categorySlug: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (categorySlug) {
        next.set('category', categorySlug);
      } else {
        next.delete('category');
      }

      next.delete('page');
      return next;
    });
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);

      const nextPage = currentPage + 1;
      const response = await blogPublicApi.getArticles({
        page: nextPage,
        per_page: 12,
        category_id: categoryId,
        search: searchQuery || undefined,
      });

      const payload = response.data as { data: BlogArticle[]; meta: { current_page: number; last_page: number } };
      setArticles((prev) => [...prev, ...payload.data]);
      setHasMore(payload.meta.current_page < payload.meta.last_page);

      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(nextPage));
        return next;
      });
    } catch (fetchError) {
      console.error('Error loading more articles:', fetchError);
      setError('Не удалось загрузить следующую страницу статей.');
    } finally {
      setLoadingMore(false);
    }
  };

  const selectedCategoryMeta = categories.find((category) => category.slug === selectedCategory);
  const heroAside = (
    <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
        Что внутри блога
      </div>
      <div className="mt-4 grid gap-3">
        {[
          'Разборы графиков работ, заявок и снабжения.',
          'Материалы о запуске цифрового контура в строительной команде.',
          'Пояснения по ролям, документам и управленческой отчетности.',
        ].map((item) => (
          <div key={item} className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <BlogPublicLayout
      eyebrow="Блог ProHelper"
      title="Публикуем материалы о строительных процессах и запуске системы."
      description="Здесь собраны статьи о графиках работ, снабжении, документах, финансах и организации цифрового контура строительной команды."
      nav={[
        { label: 'Лента статей', href: '#blog-feed' },
        { label: 'Фильтры', href: '#blog-filters' },
        { label: 'Контакты', href: '#blog-cta' },
      ]}
      aside={heroAside}
    >
      <section id="blog-filters" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.78fr)] xl:items-start">
          <div>
            <SectionHeader
              eyebrow="Лента"
              title="Подберите статьи по теме, роли или текущему вопросу."
              description="Фильтры и поиск помогают быстро собрать релевантные материалы перед демонстрацией или запуском."
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
                  !selectedCategory ? 'bg-steel-950 text-white' : 'border border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'
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
                      ? 'border-transparent text-white'
                      : 'border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'
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

      <section className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Редакционный план"
            title="Три серии SEO-материалов под роли, боли и процессы стройки."
            description="Блог теперь работает как информационный слой: каждая статья поддерживает свой кластер запроса и ведет в профильную коммерческую посадочную."
          />

          <div className="mt-10 grid gap-5 xl:grid-cols-3">
            {marketingBlogEditorialSeries.map((series) => (
              <article
                key={series.id}
                className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
                  {series.title}
                </div>
                <p className="mt-4 text-sm leading-7 text-steel-600">{series.description}</p>
                <div className="mt-6 grid gap-3">
                  {series.articles.map((article) => (
                    <MarketingLink
                      key={article.title}
                      href={article.relatedPath}
                      className="rounded-[1.2rem] bg-concrete-50 px-4 py-4 transition hover:bg-construction-50/70"
                    >
                      <div className="text-sm font-semibold text-steel-950">{article.title}</div>
                      <div className="mt-2 text-sm leading-7 text-steel-600">{article.summary}</div>
                    </MarketingLink>
                  ))}
                </div>
              </article>
            ))}
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
                    {selectedCategoryMeta ? selectedCategoryMeta.name : 'Все статьи'}
                  </h2>
                </div>
                <div className="text-sm text-steel-500">{getBlogListMeta(articles.length)}</div>
              </div>
              {searchQuery ? (
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Поиск по запросу: <span className="font-semibold text-steel-950">{searchQuery}</span>
                </p>
              ) : null}
            </div>

            {loading ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-sm">
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
                <h3 className="text-2xl font-bold text-steel-950">Статьи не найдены</h3>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Попробуйте изменить запрос, снять фильтр по категории или перейти к общей ленте.
                </p>
                <a
                  href={marketingPaths.blog}
                  className="mt-5 inline-flex rounded-full bg-steel-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-steel-900"
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
                      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold transition ${
                        loadingMore
                          ? 'cursor-not-allowed bg-steel-300 text-white'
                          : 'bg-steel-950 text-white hover:bg-steel-900'
                      }`}
                    >
                      {loadingMore ? 'Загружаем статьи' : 'Показать еще'}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <BlogSidebar />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogPublicPage;
