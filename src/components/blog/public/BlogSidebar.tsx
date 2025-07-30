import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  TagIcon,
  FireIcon,
  EnvelopeIcon,
  PhoneIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
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
    <motion.aside 
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Поиск */}
      <motion.div 
        className="bg-white/90 border-2 border-steel-200 rounded-2xl p-6 backdrop-blur-sm hover:border-construction-300 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 text-construction-500" />
          <h3 className="text-lg font-semibold text-steel-900 font-construction">Поиск по блогу</h3>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите ключевые слова..."
            className="w-full pl-12 pr-4 py-3 border-2 border-steel-200 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute inset-y-0 left-0 pl-4 flex items-center group"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-steel-400 group-hover:text-construction-600 transition-colors" />
          </button>
        </form>
      </motion.div>

      {/* Категории */}
      {categories.length > 0 && (
        <motion.div 
          className="bg-white/90 border-2 border-steel-200 rounded-2xl p-6 backdrop-blur-sm hover:border-safety-300 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-safety-500" />
            <h3 className="text-lg font-semibold text-steel-900 font-construction">Категории</h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/blog/category/${category.slug}`}
                className="group flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-steel-50 hover:to-construction-50 transition-all duration-300"
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-steel-700 group-hover:text-construction-700 font-medium">{category.name}</span>
                </div>
                <span className="text-sm text-steel-500 bg-steel-100 px-2 py-1 rounded-full group-hover:bg-construction-100 group-hover:text-construction-600 transition-all duration-300">
                  {category.published_articles_count || 0}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Популярные статьи */}
      {popularArticles.length > 0 && (
        <motion.div 
          className="bg-white/90 border-2 border-steel-200 rounded-2xl p-6 backdrop-blur-sm hover:border-construction-300 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FireIcon className="w-5 h-5 text-construction-500" />
            <h3 className="text-lg font-semibold text-steel-900 font-construction">Популярные статьи</h3>
          </div>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <motion.article 
                key={article.id} 
                className="group flex space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-steel-50 hover:to-construction-50 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {article.featured_image && (
                  <div className="flex-shrink-0">
                    <Link to={`/blog/${article.slug}`}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-concrete-100 to-steel-100">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-steel-900 line-clamp-2 mb-2 group-hover:text-construction-700 transition-colors">
                    <Link to={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h4>
                  <div className="flex items-center text-xs text-steel-500 space-x-2">
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      {article.views_count?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      )}

      {/* Подписка на рассылку */}
      <motion.div 
        className="bg-gradient-to-br from-construction-600 via-safety-600 to-steel-600 rounded-2xl p-6 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-construction-grid opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <EnvelopeIcon className="w-5 h-5" />
            <h3 className="text-lg font-semibold font-construction">Подписка на блог</h3>
          </div>
          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            Получайте лучшие статьи о строительстве и управлении проектами первыми
          </p>
          
          {subscriptionMessage ? (
            <motion.div 
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-sm border border-white/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {subscriptionMessage}
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="w-full px-4 py-3 rounded-xl text-steel-900 placeholder-steel-500 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-white focus:ring-opacity-50 outline-none transition-all duration-300"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-white text-construction-600 font-semibold py-3 rounded-xl hover:bg-white/90 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {isSubscribing ? 'Подписываем...' : 'Подписаться'}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* Теги облако */}
      <motion.div 
        className="bg-white/90 border-2 border-steel-200 rounded-2xl p-6 backdrop-blur-sm hover:border-steel-300 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TagIcon className="w-5 h-5 text-steel-500" />
          <h3 className="text-lg font-semibold text-steel-900 font-construction">Популярные теги</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            'строительство', 'управление', 'проекты', 'команда', 'планирование',
            'бюджет', 'качество', 'безопасность', 'инновации', 'технологии'
          ].map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <Link
                to={`/blog/tag/${tag}`}
                className="px-3 py-1.5 bg-gradient-to-r from-steel-100 to-construction-100 hover:from-construction-100 hover:to-safety-100 text-steel-700 hover:text-construction-700 text-sm rounded-full transition-all duration-300 hover:scale-105 font-medium"
              >
                #{tag}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Контакты / CTA */}
      <motion.div 
        className="bg-gradient-to-br from-steel-800 to-steel-900 rounded-2xl p-6 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-construction-grid opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <WrenchScrewdriverIcon className="w-5 h-5 text-construction-400" />
            <h3 className="text-lg font-semibold font-construction">Нужна помощь?</h3>
          </div>
          <p className="text-steel-200 text-sm mb-4 leading-relaxed">
            Наши эксперты готовы помочь с внедрением ProHelper в ваш проект
          </p>
          <div className="space-y-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-construction-500 to-construction-600 hover:from-construction-600 hover:to-construction-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-construction"
            >
              <PhoneIcon className="w-4 h-4" />
              Связаться с нами
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default BlogSidebar; 