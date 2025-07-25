import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import BlogPublicLayout from './BlogPublicLayout';
import BlogArticleCard from './BlogArticleCard';
import BlogSidebar from './BlogSidebar';
import { blogPublicApi } from '../../../utils/blogPublicApi';
import type { BlogArticle, BlogCategory } from '../../../types/blog';

const BlogPublicPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    fetchArticles(true);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await blogPublicApi.getCategories();
      setCategories((response.data as any).data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArticles = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      params.set('page', reset ? '1' : (currentPage + 1).toString());
      params.set('per_page', '12');
      
      if (selectedCategory) {
        params.set('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const categoryId = selectedCategory 
        ? categories.find(c => c.slug === selectedCategory)?.id 
        : undefined;

      const response = await blogPublicApi.getArticles({
        page: reset ? 1 : currentPage + 1,
        per_page: 12,
        category_id: categoryId,
        search: searchQuery || undefined,
      });
      const newArticles = (response.data as any).data;
      const pagination = (response.data as any).meta;

      if (reset) {
        setArticles(newArticles);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
        setSearchParams(prev => {
          prev.set('page', (currentPage + 1).toString());
          return prev;
        });
      }

      setHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Ошибка загрузки статей. Попробуйте позже.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCategoryFilter = (categorySlug: string | null) => {
    setSearchParams(prev => {
      if (categorySlug) {
        prev.set('category', categorySlug);
      } else {
        prev.delete('category');
      }
      prev.delete('page');
      prev.delete('search');
      return prev;
    });
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => {
      if (query.trim()) {
        prev.set('search', query.trim());
      } else {
        prev.delete('search');
      }
      prev.delete('page');
      prev.delete('category');
      return prev;
    });
  };

  return (
    <BlogPublicLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search & Filters */}
          <motion.div 
            className="bg-white/90 border-2 border-steel-200 rounded-2xl backdrop-blur-sm p-6 mb-8 hover:border-construction-300 transition-all duration-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <MagnifyingGlassIcon className="w-5 h-5 text-construction-500" />
                  <h3 className="text-lg font-semibold text-steel-900 font-construction">Поиск и фильтры</h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск статей о строительстве..."
                    defaultValue={searchQuery || ''}
                    onChange={(e) => {
                      const timer = setTimeout(() => handleSearch(e.target.value), 500);
                      return () => clearTimeout(timer);
                    }}
                    className="w-full pl-12 pr-4 py-3 border-2 border-steel-200 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-steel-400" />
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FunnelIcon className="w-5 h-5 text-safety-500" />
                  <h4 className="text-base font-semibold text-steel-900 font-construction">Категории</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => handleCategoryFilter(null)}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                      !selectedCategory
                        ? 'bg-gradient-to-r from-construction-500 to-construction-600 text-white shadow-construction'
                        : 'bg-steel-100 hover:bg-construction-100 text-steel-700 hover:text-construction-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4" />
                      Все статьи
                    </span>
                  </motion.button>
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.slug)}
                      className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                        selectedCategory === category.slug
                          ? 'text-white shadow-lg'
                          : 'bg-steel-100 hover:bg-construction-100 text-steel-700 hover:text-construction-700'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === category.slug ? category.color : undefined
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-steel-200 border-t-construction-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-construction-500 to-safety-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <motion.div 
              className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-red-600 text-lg font-semibold mb-2">Ошибка загрузки</div>
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={() => fetchArticles(true)}
                className="px-6 py-3 bg-gradient-to-r from-construction-500 to-construction-600 text-white font-semibold rounded-xl hover:from-construction-600 hover:to-construction-700 transition-all duration-300 hover:scale-105"
              >
                Попробовать снова
              </button>
            </motion.div>
          ) : articles.length === 0 ? (
            <motion.div 
              className="bg-gradient-to-br from-steel-50 to-construction-50 border-2 border-steel-200 rounded-2xl p-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-construction-400 to-safety-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-steel-900 mb-4 font-construction">Статьи не найдены</h3>
              <p className="text-steel-600 mb-6 text-lg">
                Попробуйте изменить критерии поиска или выбрать другую категорию
              </p>
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="px-6 py-3 bg-gradient-to-r from-construction-500 to-construction-600 text-white font-semibold rounded-xl hover:from-construction-600 hover:to-construction-700 transition-all duration-300 hover:scale-105"
              >
                Сбросить фильтры
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <BlogArticleCard article={article} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {hasMore && (
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => fetchArticles(false)}
                    disabled={loadingMore}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-construction-500 to-construction-600 text-white font-semibold rounded-xl hover:from-construction-600 hover:to-construction-700 transition-all duration-300 hover:scale-105 hover:shadow-construction disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Загружаем статьи...
                      </>
                    ) : (
                      <>
                        Загрузить еще статьи
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <BlogSidebar />
        </motion.div>
      </div>
    </BlogPublicLayout>
  );
};

export default BlogPublicPage; 