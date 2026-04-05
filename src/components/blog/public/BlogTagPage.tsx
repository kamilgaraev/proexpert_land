import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BlogArticleCard from './BlogArticleCard';
import BlogPublicLayout from './BlogPublicLayout';
import BlogSidebar from './BlogSidebar';
import { getBlogListMeta } from './blogPresentation';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { useSEO } from '@/hooks/useSEO';
import type { BlogArticle } from '@/types/blog';
import { blogPublicApi } from '@/utils/blogPublicApi';

const BlogTagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: slug ? `Тег #${slug} - блог ProHelper` : 'Теги блога ProHelper',
    description: slug ? `Подборка статей ProHelper по тегу #${slug}.` : 'Подборка статей ProHelper по тегам.',
    keywords: slug ? `${slug}, блог ProHelper, строительство` : 'теги блога ProHelper',
    noIndex: true,
    type: 'website',
  });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await blogPublicApi.searchArticles(`#${slug}`, 12);
        const payload = response.data as { data?: BlogArticle[] };
        const nextArticles = payload.data || [];

        setArticles(nextArticles);
        setCurrentPage(1);
        setHasMore(nextArticles.length === 12);
      } catch (fetchError) {
        console.error('Error fetching articles by tag:', fetchError);
        setError('Не удалось загрузить подборку по тегу.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticles();
    }
  }, [slug]);

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);

      const nextPage = currentPage + 1;
      const response = await blogPublicApi.searchArticles(`#${slug}`, nextPage * 12);
      const payload = response.data as { data?: BlogArticle[] };
      const nextArticles = payload.data || [];

      setArticles(nextArticles);
      setCurrentPage(nextPage);
      setHasMore(nextArticles.length === nextPage * 12);
    } catch (fetchError) {
      console.error('Error loading more tag articles:', fetchError);
      setError('Не удалось загрузить дополнительные статьи по тегу.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <BlogPublicLayout
      eyebrow="Тег блога"
      title={slug ? `Материалы по тегу #${slug}` : 'Материалы по тегу'}
      description="Теги помогают быстро собрать статьи по одной узкой теме без лишних переходов по категориям."
      nav={[
        { label: 'Лента тега', href: '#blog-feed' },
        { label: 'Все статьи', href: '#blog-tag-actions' },
        { label: 'Контакты', href: '#blog-cta' },
      ]}
      aside={
        <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
            Как использовать тег
          </div>
          <div className="mt-4 grid gap-3">
            {[
              'Собрать подборку по одной теме для внутренней команды.',
              'Перейти из статьи к соседним материалам по тому же вопросу.',
              'Использовать тег как быстрый маршрут перед демонстрацией.',
            ].map((item) => (
              <div key={item} className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      }
    >
      <section id="blog-tag-actions" className="py-16 lg:py-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Маршрут"
            title="Используйте тег как короткий срез по теме."
            description="Если нужно расширить выборку, переходите к общей ленте блога или к категориям через сайдбар."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/blog"
              className="inline-flex w-full min-w-0 flex-wrap items-center justify-center rounded-full bg-steel-950 px-5 py-3 text-center text-sm font-semibold text-white whitespace-normal [overflow-wrap:anywhere] transition hover:bg-steel-900 sm:w-auto"
            >
              Открыть все статьи
            </Link>
          </div>
        </div>
      </section>

      <section id="blog-feed" className="bg-concrete-50 py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                Лента тега
              </div>
              <h2 className="mt-2 text-3xl font-bold text-steel-950">#{slug}</h2>
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
                <h3 className="text-2xl font-bold text-steel-950">По этому тегу пока нет материалов</h3>
                <p className="mt-4 text-sm leading-7 text-steel-600">
                  Вернитесь к общей ленте или воспользуйтесь поиском и категориями в правой колонке.
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

export default BlogTagPage;
