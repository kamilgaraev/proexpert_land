import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../../../utils/blogApi';
import type { BlogArticle, BlogCategory, BlogArticleFilters } from '../../../types/blog';

interface ArticleStatusBadgeProps {
  status: BlogArticle['status'];
}

const ArticleStatusBadge: React.FC<ArticleStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-800', icon: '📝', label: 'Черновик' },
    published: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Опубликовано' },
    scheduled: { color: 'bg-blue-100 text-blue-800', icon: '⏰', label: 'Запланировано' },
    archived: { color: 'bg-orange-100 text-orange-800', icon: '📦', label: 'Архивировано' },
  };

  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

interface FiltersProps {
  filters: BlogArticleFilters;
  categories: BlogCategory[];
  onFiltersChange: (filters: BlogArticleFilters) => void;
  onResetFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, categories, onFiltersChange, onResetFilters }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="published">Опубликованные</option>
            <option value="scheduled">Запланированные</option>
            <option value="archived">Архивированные</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFiltersChange({ ...filters, category_id: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input
            type="text"
            placeholder="Поиск по заголовку..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">На странице</label>
          <select
            value={filters.per_page || 15}
            onChange={(e) => onFiltersChange({ ...filters, per_page: Number(e.target.value) })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onResetFilters}
            className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
};

interface ArticleActionsProps {
  article: BlogArticle;
  onAction: (action: string, articleId: number) => void;
}

const ArticleActions: React.FC<ArticleActionsProps> = ({ article, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 px-2 py-1"
      >
        ⚙️
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 bg-white rounded-md shadow-lg border">
            <div className="py-1">
              <Link
                to={`/admin/blog/articles/${article.id}/edit`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                ✏️ Редактировать
              </Link>
              <Link
                to={`/admin/blog/articles/${article.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                👁️ Предпросмотр
              </Link>
              {article.status === 'draft' && (
                <button
                  onClick={() => {
                    onAction('publish', article.id);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  🚀 Опубликовать
                </button>
              )}
              {article.status === 'published' && (
                <button
                  onClick={() => {
                    onAction('archive', article.id);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  📦 Архивировать
                </button>
              )}
              <button
                onClick={() => {
                  onAction('duplicate', article.id);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📄 Дублировать
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  onAction('delete', article.id);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, total, perPage, onPageChange }) => {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Показано {start}-{end} из {total} статей
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ← Назад
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let page;
          if (totalPages <= 5) {
            page = i + 1;
          } else if (currentPage <= 3) {
            page = i + 1;
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i;
          } else {
            page = currentPage - 2 + i;
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Вперед →
        </button>
      </div>
    </div>
  );
};

const BlogArticlesList: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  
  const [filters, setFilters] = useState<BlogArticleFilters>({
    page: 1,
    per_page: 15,
  });
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await blogApi.categories.getCategories();
      setCategories((response.data as any).data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await blogApi.articles.getArticles(filters);
      const data = (response.data as any);
      setArticles(data.data);
      setPagination(data.meta);
    } catch (err) {
      setError('Ошибка загрузки статей');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: BlogArticleFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, per_page: 15 });
    setSelectedArticles([]);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleSelectArticle = (articleId: number) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(article => article.id));
    }
  };

  const handleArticleAction = async (action: string, articleId: number) => {
    try {
      switch (action) {
        case 'publish':
          await blogApi.articles.publishArticle(articleId);
          break;
        case 'archive':
          await blogApi.articles.archiveArticle(articleId);
          break;
        case 'duplicate':
          await blogApi.articles.duplicateArticle(articleId);
          break;
        case 'delete':
          if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
            await blogApi.articles.deleteArticle(articleId);
          }
          break;
      }
      fetchArticles();
    } catch (err) {
      console.error(`Error ${action} article:`, err);
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Статьи блога {pagination.total > 0 && `(${pagination.total})`}
        </h1>
        <Link
          to="/admin/blog/articles/create"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          ➕ Создать статью
        </Link>
      </div>

      <Filters
        filters={filters}
        categories={categories}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
      />

      {selectedArticles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              Выбрано: {selectedArticles.length} статей
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                ✅ Опубликовать все
              </button>
              <button className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200">
                📦 Архивировать все
              </button>
              <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                🗑️ Удалить все
              </button>
              <button 
                onClick={() => setSelectedArticles([])}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Отменить выбор
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <span className="text-red-400 text-xl">⚠️</span>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedArticles.length === articles.length && articles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Фото
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заголовок
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Автор
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Метрики
                </th>
                <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(article.id)}
                      onChange={() => handleSelectArticle(article.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    {article.featured_image ? (
                      <img 
                        src={article.featured_image} 
                        alt="" 
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        📷
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <Link
                        to={`/admin/blog/articles/${article.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {article.title}
                      </Link>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {article.author.name.charAt(0)}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {article.author.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ArticleStatusBadge status={article.status} />
                    {(article.published_at || article.scheduled_at) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {article.published_at 
                          ? new Date(article.published_at).toLocaleDateString('ru-RU')
                          : new Date(article.scheduled_at!).toLocaleDateString('ru-RU')
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>👁️ {article.views_count?.toLocaleString()}</div>
                      <div>💬 {article.comments_count}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ArticleActions 
                      article={article} 
                      onAction={handleArticleAction} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Статей не найдено
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status || filters.category_id
                ? 'Попробуйте изменить параметры фильтрации'
                : 'Создайте первую статью для блога'
              }
            </p>
            {!filters.search && !filters.status && !filters.category_id && (
              <Link
                to="/admin/blog/articles/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ➕ Создать статью
              </Link>
            )}
          </div>
        )}
      </div>

      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default BlogArticlesList; 