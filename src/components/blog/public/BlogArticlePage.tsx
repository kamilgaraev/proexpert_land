import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BlogArticleCard from './BlogArticleCard';
import BlogPublicLayout from './BlogPublicLayout';
import BlogSidebar from './BlogSidebar';
import { formatBlogDate, getBlogReadingTime } from './blogPresentation';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import { useSEO } from '@/hooks/useSEO';
import type { BlogArticle } from '@/types/blog';
import { generateArticleSchema } from '@/utils/seo';
import { blogPublicApi } from '@/utils/blogPublicApi';

const BlogArticlePage = () => {
  const { slug, articleId } = useParams<{ slug?: string; articleId?: string }>();
  const [searchParams] = useSearchParams();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isPreview = Boolean(articleId);

  useSEO(
    article
      ? {
          title: article.meta_title || article.og_title || article.title,
          description: article.meta_description || article.og_description || article.excerpt || 'Статья ProHelper',
          keywords: article.meta_keywords?.join(', ') || article.tags.map((tag) => tag.name).join(', '),
          ogImage: article.og_image || article.featured_image,
          type: 'article',
          author: article.author.name,
          publishedTime: article.published_at || article.created_at,
          modifiedTime: article.updated_at,
          noIndex: isPreview || article.noindex,
          structuredData: generateArticleSchema({
            title: article.title,
            description: article.meta_description || article.og_description || article.excerpt || article.title,
            author: article.author.name,
            publishedTime: article.published_at || article.created_at,
            modifiedTime: article.updated_at,
            image: article.og_image || article.featured_image,
            category: article.category.name,
            tags: article.tags.map((tag) => tag.name),
            url: isPreview ? `https://prohelper.pro/blog/preview/${article.id}` : `https://prohelper.pro/blog/${article.slug}`,
          }),
        }
      : {
          title: 'Блог ProHelper',
          description: 'Материалы ProHelper о строительных процессах и цифровом контуре.',
          type: 'website',
        },
  );

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = isPreview
          ? await blogPublicApi.getPreviewArticle(articleId!, searchParams)
          : await blogPublicApi.getArticle(slug!);
        const articleData = (response.data as { data: BlogArticle }).data;
        setArticle(articleData);

        if (!isPreview && articleData.id) {
          const relatedResponse = await blogPublicApi.getRelatedArticles(articleData.id, 3);
          setRelatedArticles((relatedResponse.data as { data: BlogArticle[] }).data);
        } else {
          setRelatedArticles([]);
        }
      } catch (fetchError) {
        console.error('Error fetching article:', fetchError);
        setError('Статья не найдена или временно недоступна.');
      } finally {
        setLoading(false);
      }
    };

    if ((isPreview && articleId) || (!isPreview && slug)) {
      fetchArticle();
    }
  }, [articleId, isPreview, searchParams, slug]);

  if (loading) {
    return (
      <BlogPublicLayout
        eyebrow="Блог ProHelper"
        title="Загружаем материал"
        description="Подготавливаем статью и связанные материалы."
      >
        <section className="bg-concrete-50 py-16 lg:py-20">
          <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="h-4 w-40 animate-pulse rounded bg-concrete-100" />
              <div className="mt-4 h-12 w-4/5 animate-pulse rounded bg-concrete-100" />
              <div className="mt-4 h-24 animate-pulse rounded bg-concrete-100" />
            </div>
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <div className="h-48 animate-pulse rounded bg-concrete-100" />
            </div>
          </div>
        </section>
      </BlogPublicLayout>
    );
  }

  if (error || !article) {
    return (
      <BlogPublicLayout
        eyebrow="Блог ProHelper"
        title="Статья недоступна"
        description="Похоже, материал был перемещен, удален или еще не опубликован."
      >
        <section className="bg-concrete-50 py-16 lg:py-20">
          <div className="container-custom">
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-steel-950">Статья не найдена</h2>
              <p className="mt-4 text-sm leading-7 text-steel-600">{error}</p>
              <Link
                to="/blog"
                className="mt-6 inline-flex rounded-full bg-steel-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-steel-900"
              >
                Вернуться в блог
              </Link>
            </div>
          </div>
        </section>
      </BlogPublicLayout>
    );
  }

  return (
    <BlogPublicLayout
      eyebrow={isPreview ? 'Preview' : article.category.name}
      title={article.title}
      description={article.excerpt || 'Материал ProHelper о строительных процессах, ролях и цифровом контуре.'}
      nav={[
        { label: 'Содержание', href: '#article-content' },
        { label: isPreview ? 'Предпросмотр' : 'Похожие материалы', href: isPreview ? '#article-content' : '#related-articles' },
        { label: 'Контакты', href: '#blog-cta' },
      ]}
      aside={
        <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-700">
            Контекст статьи
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
              Автор: {article.author.name}
            </div>
            <div className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
              Опубликовано: {formatBlogDate(article.published_at || article.created_at)}
            </div>
            <div className="rounded-[1.15rem] bg-concrete-50 px-4 py-4 text-sm leading-7 text-steel-700">
              {getBlogReadingTime(article.content)}
            </div>
          </div>
        </div>
      }
    >
      <section id="article-content" className="py-16 lg:py-20">
        <div className="container-custom grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <article>
            <div className="rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-steel-500">
                <Link to="/" className="transition hover:text-construction-700">
                  Главная
                </Link>
                <span>/</span>
                <Link to="/blog" className="transition hover:text-construction-700">
                  {isPreview ? 'Preview' : 'Блог'}
                </Link>
                <span>/</span>
                {isPreview ? (
                  <span>Черновик</span>
                ) : (
                  <Link
                    to={`/blog/category/${article.category.slug}`}
                    className="transition hover:text-construction-700"
                  >
                    {article.category.name}
                  </Link>
                )}
              </nav>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-steel-500">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                  style={{ backgroundColor: isPreview ? '#0f172a' : article.category.color }}
                >
                  {isPreview ? 'Preview' : article.category.name}
                </span>
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

              {article.featured_image ? (
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-steel-100 bg-concrete-50">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="h-auto w-full object-cover"
                  />
                </div>
              ) : null}

              <div
                className="blog-content mt-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {article.tags?.length ? (
                <div className="mt-8 border-t border-steel-100 pt-6">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-500">
                    Теги
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/blog/tag/${tag.slug}`}
                        className="rounded-full bg-concrete-50 px-3 py-2 text-xs font-semibold text-steel-600 transition hover:bg-construction-50 hover:text-construction-700"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {relatedArticles.length && !isPreview ? (
              <section id="related-articles" className="mt-8">
                <SectionHeader
                  eyebrow="Похожие материалы"
                  title="Что еще посмотреть по этой теме."
                  description="Собрали соседние статьи, которые продолжают контекст текущего материала."
                />
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {relatedArticles.map((relatedArticle) => (
                    <BlogArticleCard key={relatedArticle.id} article={relatedArticle} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <BlogSidebar />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogArticlePage;
