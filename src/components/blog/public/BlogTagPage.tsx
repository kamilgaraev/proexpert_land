import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogPublicLayout from './BlogPublicLayout';
import BlogArticleCard from './BlogArticleCard';
import BlogSidebar from './BlogSidebar';
import { blogPublicApi } from '../../../utils/blogPublicApi';
import type { BlogArticle } from '../../../types/blog';

const BlogTagPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticles(true);
    }
  }, [slug]);

  const fetchArticles = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : currentPage + 1;
      const response = await blogPublicApi.searchArticles(`#${slug}`, page * 12);

      const data = (response.data as any);
      
      if (reset) {
        setArticles(data.data || []);
        setCurrentPage(1);
      } else {
        setArticles(prev => [...prev, ...(data.data || [])]);
        setCurrentPage(page);
      }

      setHasMore((data.data || []).length === 12);
    } catch (err) {
      setError('Ошибка загрузки статей');
      console.error('Error fetching articles by tag:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <BlogPublicLayout>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
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

  return (
    <BlogPublicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <span className="mx-2">→</span>
            <Link to="/blog" className="hover:text-blue-600">Блог</Link>
            <span className="mx-2">→</span>
            <span className="text-gray-900">Тег: #{slug}</span>
          </nav>

          {/* Tag Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">#</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">#{slug}</h1>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-4">
              Статьи по теме "{slug}"
            </p>

            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>
                📄 {articles.length} статей найдено
              </span>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться ко всем статьям
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex">
                <span className="text-red-400 text-xl">⚠️</span>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Статей с этим тегом не найдено
              </h3>
              <p className="text-gray-600 mb-6">
                Попробуйте поискать статьи по другим тегам или вернитесь к общему списку
              </p>
              <Link
                to="/blog"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Посмотреть все статьи
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {articles.map((article) => (
                  <BlogArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <button
                    onClick={() => fetchArticles(false)}
                    disabled={loadingMore}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Загружаем...
                      </span>
                    ) : (
                      'Загрузить еще статьи'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <BlogSidebar />
        </div>
      </div>
    </BlogPublicLayout>
  );
};

export default BlogTagPage; 