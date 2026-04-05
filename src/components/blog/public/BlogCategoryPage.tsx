import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BlogArticleCard from './BlogArticleCard';
import BlogPublicLayout from './BlogPublicLayout';
import BlogSidebar from './BlogSidebar';
import { getBlogListMeta } from './blogPresentation';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { useSEO } from '@/hooks/useSEO';
import type { BlogArticle, BlogCategory } from '@/types/blog';
import { blogPublicApi } from '@/utils/blogPublicApi';

const BlogCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useSEO(
    category
      ? {
          title: category.meta_title || `${category.name} - блог ProHelper`,
          description:
            category.meta_description ||
            category.description ||
            `Подборка материалов ProHelper по теме "${category.name}".`,
          keywords: `${category.name}, блог ProHelper, строительство`,
          type: 'website',
        }
      : {
          title: 'Категория блога ProHelper',
          description: 'Подборка материалов ProHelper по категориям блога.',
          type: 'website',
        },
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesResponse = await blogPublicApi.getCategories();
        const categoriesData = (categoriesResponse.data as { data: BlogCategory[] }).data;
        const resolvedCategory = categoriesData.find((item) => item.slug === slug) || null;

        setCategories(categoriesData);
        setCategory(resolvedCategory);

        if (!resolvedCategory) {
          setError('Категория не найдена.');
          return;
        }

        const articlesResponse = await blogPublicApi.getArticles({
          page: 1,
          per_page: 12,
          category_id: resolvedCategory.id,
        });

        const payload = articlesResponse.data as {
          data: BlogArticle[];
          meta: { current_page: number; last_page: number };
        };

        setArticles(payload.data);
        setCurrentPage(1);
        setHasMore(payload.meta.current_page < payload.meta.last_page);
      } catch (fetchError) {
        console.error('Error fetching category page data:', fetchError);
        setError('Не удалось загрузить материалы этой категории.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [slug]);

  const handleLoadMore = async () => {
    if (!category) {
      return;
    }

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await blogPublicApi.getArticles({
        page: nextPage,
        per_page: 12,
        category_id: category.id,
      });

      const payload = response.data as {
        data: BlogArticle[];
        meta: { current_page: number; last_page: number };
      };

      setArticles((prev) => [...prev, ...payload.data]);
      setCurrentPage(nextPage);
      setHasMore(payload.meta.current_page < payload.meta.last_page);
    } catch (fetchError) {
      console.error('Error loading more category articles:', fetchError);
      setError('Не удалось загрузить следующую страницу статей.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <BlogPublicLayout
      eyebrow="Категория блога"
      title={category ? category.name : 'Материалы по категории'}
      description={
        category?.description ||
        'Собираем материалы по выбранной теме, чтобы быстрее найти релевантные статьи перед запуском или демонстрацией.'
      }
      nav={[
        { label: 'Лента категории', href: '#blog-feed' },
        { label: 'Все категории', href: '#blog-category-switcher' },
        { label: 'Контакты', href: '#blog-cta' },
      ]}
      aside={
        <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
            Что можно сделать дальше
          </div>
          <div className="mt-4 grid gap-3">
            {[
              'Открыть полную ленту и сравнить соседние темы.',
              'Перейти к разбору похожих статей в сайдбаре.',
              'Связать тему категории с вашим сценарием на демонстрации.',
            ].map((item) => (
              <div key={item} className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      }
    >
      <section id="blog-category-switcher" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Категории"
            title="Переключайтесь между темами без выхода из блога."
            description="Категории помогают собрать материалы под конкретный рабочий контур или роль в строительной команде."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/blog"
              className="rounded-full border border-steel-200 bg-white px-4 py-2 text-sm font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700"
            >
              Все статьи
            </Link>
            {categories.map((item) => (
              <Link
                key={item.id}
                to={`/blog/category/${item.slug}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  item.slug === slug
                    ? 'border-transparent text-white'
                    : 'border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700'
                }`}
                style={item.slug === slug ? { backgroundColor: item.color } : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="blog-feed" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                Лента категории
              </div>
              <h2 className="mt-2 text-3xl font-bold text-steel-950">
                {category ? category.name : 'Категория'}
              </h2>
              <p className="mt-4 text-sm leading-7 text-steel-600">
                {error ? error : getBlogListMeta(articles.length)}
              </p>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-sm">
                    <div className="aspect-[16/10] animate-pulse rounded-[1.35rem] bg-concrete-100" />
                    <div className="mt-5 h-4 w-32 animate-pulse rounded bg-concrete-100" />
                    <div className="mt-4 h-8 w-4/5 animate-pulse rounded bg-concrete-100" />
                    <div className="mt-3 h-20 animate-pulse rounded bg-concrete-100" />
                  </div>
                ))}
              </div>
            ) : articles.length ? (
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
                          ? 'cursor-not-allowed bg-steel-300 text-white'
                          : 'bg-steel-950 text-white hover:bg-steel-900'
                      }`}
                    >
                      {loadingMore ? 'Загружаем статьи' : 'Показать еще'}
                    </button>
                  </div>
                ) : null}
              </>
            ) : !loading ? (
              <div className="mt-6 rounded-[1.75rem] border border-steel-200 bg-white p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-steel-950">В этой категории пока нет статей</h3>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Вернитесь к общей ленте или выберите соседнюю тему в списке категорий.
                </p>
              </div>
            ) : null}
          </div>

          <BlogSidebar />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogCategoryPage;
