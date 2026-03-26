import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogPublicLayout from './BlogPublicLayout';
import BlogSidebar from './BlogSidebar';
import { useSEO } from '@/hooks/useSEO';
import { generateArticleSchema } from '@/utils/seo';
import { blogPublicApi } from '../../../utils/blogPublicApi';
import type { BlogArticle } from '../../../types/blog';

const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO(
    article
      ? {
          title: article.meta_title || article.og_title || article.title,
          description:
            article.meta_description || article.og_description || article.excerpt || 'Статья ProHelper',
          keywords: article.meta_keywords?.join(', ') || article.tags.map((tag) => tag.name).join(', '),
          ogImage: article.og_image || article.featured_image,
          type: 'article',
          author: article.author.name,
          publishedTime: article.published_at || article.created_at,
          modifiedTime: article.updated_at,
          noIndex: article.noindex,
          structuredData: generateArticleSchema({
            title: article.title,
            description:
              article.meta_description || article.og_description || article.excerpt || article.title,
            author: article.author.name,
            publishedTime: article.published_at || article.created_at,
            modifiedTime: article.updated_at,
            image: article.og_image || article.featured_image,
            category: article.category.name,
            tags: article.tags.map((tag) => tag.name),
            url: `https://prohelper.pro/blog/${article.slug}`,
          }),
        }
      : {
          title: 'Блог ProHelper',
          description: 'Материалы ProHelper о строительных процессах и цифровизации стройки.',
        },
  );

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await blogPublicApi.getArticle(slug!);
      const articleData = (response.data as any).data;
      setArticle(articleData);

      if (articleData.id) {
        const relatedResponse = await blogPublicApi.getRelatedArticles(articleData.id, 4);
        setRelatedArticles((relatedResponse.data as any).data);
      }
    } catch (err) {
      setError('Статья не найдена');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} мин чтения`;
  };

  if (loading) {
    return (
      <BlogPublicLayout>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="animate-pulse space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </BlogPublicLayout>
    );
  }

  if (error || !article) {
    return (
      <BlogPublicLayout>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Статья не найдена</h1>
          <p className="text-gray-600 mb-6">
            Возможно, статья была удалена или перемещена
          </p>
          <Link
            to="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к блогу
          </Link>
        </div>
      </BlogPublicLayout>
    );
  }

  return (
    <BlogPublicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-3">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <span className="mx-2">→</span>
            <Link to="/blog" className="hover:text-blue-600">Блог</Link>
            <span className="mx-2">→</span>
            <Link 
              to={`/blog/category/${article.category.slug}`}
              className="hover:text-blue-600"
            >
              {article.category.name}
            </Link>
            <span className="mx-2">→</span>
            <span className="text-gray-900">{article.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
              <span className="text-gray-500 text-sm">
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span className="text-gray-500 text-sm">
                📖 {getReadingTime(article.content)}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between py-4 border-t border-b border-gray-200">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  👁️ {article.views_count?.toLocaleString() || 0} просмотров
                </span>
                {article.comments_count > 0 && (
                  <span className="flex items-center">
                    💬 {article.comments_count} комментариев
                  </span>
                )}
                {article.likes_count > 0 && (
                  <span className="flex items-center">
                    ❤️ {article.likes_count} лайков
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Поделиться</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Нравится</span>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-8">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-auto rounded-xl shadow-sm"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Теги статьи:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/blog/tag/${tag.slug}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio (если есть) */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {article.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{article.author.name}</h3>
                <p className="text-gray-600 mt-1">
                  Эксперт ProHelper по управлению строительными проектами
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Более 10 лет опыта в строительной отрасли. Специализируется на цифровизации процессов и внедрении современных методов управления проектами.
                </p>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Похожие статьи</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <article key={relatedArticle.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                    {relatedArticle.featured_image && (
                      <Link to={`/blog/${relatedArticle.slug}`}>
                        <img
                          src={relatedArticle.featured_image}
                          alt={relatedArticle.title}
                          className="w-full h-40 object-cover rounded-t-xl"
                        />
                      </Link>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ backgroundColor: relatedArticle.category.color }}
                        >
                          {relatedArticle.category.name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(relatedArticle.published_at || relatedArticle.created_at)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link to={`/blog/${relatedArticle.slug}`} className="hover:text-blue-600">
                          {relatedArticle.title}
                        </Link>
                      </h3>
                      {relatedArticle.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {article.allow_comments && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Комментарии ({article.comments_count})
              </h2>
              
              {/* Comment Form */}
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Оставить комментарий</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Ваш комментарий..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Отправить комментарий
                  </button>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                <div className="text-center text-gray-500 py-8">
                  Комментарии будут загружены с сервера
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <BlogSidebar />
        </div>
      </div>
    </BlogPublicLayout>
  );
};

export default BlogArticlePage; 
