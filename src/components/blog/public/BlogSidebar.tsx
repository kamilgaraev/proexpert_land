import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogPublicApi } from '../../../utils/blogPublicApi';
import type { BlogCategory, BlogArticle } from '../../../types/blog';

const BlogSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<BlogArticle[]>([]);
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesResponse, popularResponse] = await Promise.all([
        blogPublicApi.getCategories(),
        blogPublicApi.getPopularArticles(5)
      ]);

      setCategories((categoriesResponse.data as any).data);
      setPopularArticles((popularResponse.data as any).data);
    } catch (err) {
      console.error('Error fetching sidebar data:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams();
    params.set('search', searchQuery.trim());
    navigate(`/blog?${params.toString()}`);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    try {
      // TODO: Реализовать API подписки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscriptionMessage('Спасибо за подписку! Проверьте почту для подтверждения.');
      setEmail('');
    } catch (err) {
      setSubscriptionMessage('Ошибка подписки. Попробуйте позже.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <aside className="space-y-8">
      {/* Поиск */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Поиск по блогу</h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите ключевые слова..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute inset-y-0 left-0 pl-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Категории */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Категории</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/blog/category/${category.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {category.published_articles_count || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Популярные статьи */}
      {popularArticles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные статьи</h3>
          <div className="space-y-4">
            {popularArticles.map((article) => (
              <article key={article.id} className="flex space-x-3">
                {article.featured_image && (
                  <div className="flex-shrink-0">
                    <Link to={`/blog/${article.slug}`}>
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </Link>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    <Link to={`/blog/${article.slug}`} className="hover:text-blue-600">
                      {article.title}
                    </Link>
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                    <span>•</span>
                    <span>👁️ {article.views_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Подписка на рассылку */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Подписка на блог</h3>
        <p className="text-blue-100 text-sm mb-4">
          Получайте новые статьи на email первыми
        </p>
        
        {subscriptionMessage ? (
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
            {subscriptionMessage}
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              className="w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50 outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="w-full bg-white text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isSubscribing ? 'Подписываем...' : 'Подписаться'}
            </button>
          </form>
        )}
      </div>

      {/* Теги облако (если есть место) */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные теги</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'строительство', 'управление', 'проекты', 'команда', 'планирование',
            'бюджет', 'качество', 'безопасность', 'инновации', 'технологии'
          ].map((tag) => (
            <Link
              key={tag}
              to={`/blog/tag/${tag}`}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Контакты / CTA */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Нужна помощь?</h3>
        <p className="text-gray-300 text-sm mb-4">
          Наши эксперты готовы помочь с внедрением ProHelper в ваш проект
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Связаться с нами
        </Link>
      </div>
    </aside>
  );
};

export default BlogSidebar; 