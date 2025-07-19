import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../../../utils/blogApi';
import type { BlogComment, BlogCommentFilters } from '../../../types/blog';

interface CommentStatusBadgeProps {
  status: BlogComment['status'];
}

const CommentStatusBadge: React.FC<CommentStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Ожидает модерации' },
    approved: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Одобрено' },
    rejected: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Отклонено' },
    spam: { color: 'bg-red-200 text-red-900', icon: '🚫', label: 'Спам' },
  };

  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

interface CommentCardProps {
  comment: BlogComment;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onAction: (action: string, commentId: number) => void;
  onViewDetails: (comment: BlogComment) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  isSelected, 
  onSelect, 
  onAction, 
  onViewDetails 
}) => {
  return (
    <div className={`bg-white border rounded-lg p-4 transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(comment.id)}
          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">{comment.author_name}</div>
                <div className="text-sm text-gray-500">{comment.author_email}</div>
              </div>
            </div>
            <CommentStatusBadge status={comment.status} />
          </div>

          <p className="text-gray-700 mb-3 line-clamp-3">{comment.content}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <Link
                to={`/admin/blog/articles/${comment.article?.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                📄 {comment.article?.title}
              </Link>
              <span>🕒 {new Date(comment.created_at).toLocaleString('ru-RU')}</span>
              {comment.likes_count > 0 && (
                <span>❤️ {comment.likes_count}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              {comment.status === 'pending' && (
                <>
                  <button
                    onClick={() => onAction('approve', comment.id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    ✅ Одобрить
                  </button>
                  <button
                    onClick={() => onAction('reject', comment.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    ❌ Отклонить
                  </button>
                  <button
                    onClick={() => onAction('spam', comment.id)}
                    className="px-3 py-1 text-sm bg-red-200 text-red-800 rounded hover:bg-red-300"
                  >
                    🚫 Спам
                  </button>
                </>
              )}
              {comment.status === 'approved' && (
                <>
                  <button
                    onClick={() => onAction('reject', comment.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    ❌ Отклонить
                  </button>
                  <button
                    onClick={() => onAction('spam', comment.id)}
                    className="px-3 py-1 text-sm bg-red-200 text-red-800 rounded hover:bg-red-300"
                  >
                    🚫 Спам
                  </button>
                </>
              )}
              {(comment.status === 'rejected' || comment.status === 'spam') && (
                <button
                  onClick={() => onAction('approve', comment.id)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  ✅ Одобрить
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => onViewDetails(comment)}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                👁️ Подробнее
              </button>
              <button
                onClick={() => onAction('delete', comment.id)}
                className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentDetailModalProps {
  comment: BlogComment | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, commentId: number) => void;
}

const CommentDetailModal: React.FC<CommentDetailModalProps> = ({ 
  comment, 
  isOpen, 
  onClose, 
  onAction 
}) => {
  if (!isOpen || !comment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Подробности комментария</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-lg">{comment.author_name}</div>
                  <div className="text-gray-500">{comment.author_email}</div>
                  {comment.author_website && (
                    <a 
                      href={comment.author_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      🌐 {comment.author_website}
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Комментарий:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Статья:</h4>
                  <Link
                    to={`/admin/blog/articles/${comment.article?.id}`}
                    className="text-blue-600 hover:text-blue-800 block"
                  >
                    {comment.article?.title}
                  </Link>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Статус:</h4>
                  <CommentStatusBadge status={comment.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium mb-1">Дата создания:</h4>
                  <p>{new Date(comment.created_at).toLocaleString('ru-RU')}</p>
                </div>
                {comment.approved_at && (
                  <div>
                    <h4 className="font-medium mb-1">Дата модерации:</h4>
                    <p>{new Date(comment.approved_at).toLocaleString('ru-RU')}</p>
                  </div>
                )}
              </div>

              {comment.approved_by && (
                <div>
                  <h4 className="font-medium mb-1">Модератор:</h4>
                  <p>{comment.approved_by.name}</p>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Ответы ({comment.replies.length}):</h4>
                  <div className="space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{reply.author_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
            <div className="flex space-x-2">
              {comment.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      onAction('approve', comment.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✅ Одобрить
                  </button>
                  <button
                    onClick={() => {
                      onAction('reject', comment.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ❌ Отклонить
                  </button>
                  <button
                    onClick={() => {
                      onAction('spam', comment.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900"
                  >
                    🚫 Спам
                  </button>
                </>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  onAction('delete', comment.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🗑️ Удалить
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogCommentsModeration: React.FC = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [selectedComment, setSelectedComment] = useState<BlogComment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'spam'>('all');
  
  const [filters, setFilters] = useState<BlogCommentFilters>({
    page: 1,
    per_page: 20,
  });
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const statusFilter = activeTab === 'all' ? undefined : activeTab;
    setFilters(prev => ({ ...prev, status: statusFilter, page: 1 }));
    setSelectedComments([]);
  }, [activeTab]);

  useEffect(() => {
    fetchComments();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await blogApi.comments.getCommentsStats();
      setStats((response.data as any).data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await blogApi.comments.getComments(filters);
      const data = (response.data as any);
      setComments(data.data);
      setPagination(data.meta);
    } catch (err) {
      setError('Ошибка загрузки комментариев');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectComment = (commentId: number) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(comment => comment.id));
    }
  };

  const handleCommentAction = async (action: string, commentId: number) => {
    try {
      switch (action) {
        case 'approve':
          await blogApi.comments.updateCommentStatus(commentId, 'approved');
          break;
        case 'reject':
          await blogApi.comments.updateCommentStatus(commentId, 'rejected');
          break;
        case 'spam':
          await blogApi.comments.updateCommentStatus(commentId, 'spam');
          break;
        case 'delete':
          if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            await blogApi.comments.deleteComment(commentId);
          }
          break;
      }
      fetchComments();
      fetchStats();
    } catch (err) {
      console.error(`Error ${action} comment:`, err);
    }
  };

  const handleBulkAction = async (action: 'approved' | 'rejected' | 'spam') => {
    if (selectedComments.length === 0) return;

    try {
      await blogApi.comments.bulkUpdateStatus(selectedComments, action);
      setSelectedComments([]);
      fetchComments();
      fetchStats();
    } catch (err) {
      console.error('Error bulk updating comments:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (comment: BlogComment) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  const tabs = [
    { key: 'all' as const, label: 'Все', count: stats.total },
    { key: 'pending' as const, label: 'Ожидают', count: stats.pending },
    { key: 'approved' as const, label: 'Одобренные', count: stats.approved },
    { key: 'rejected' as const, label: 'Отклоненные', count: stats.rejected },
    { key: 'spam' as const, label: 'Спам', count: stats.spam },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Модерация комментариев</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
                {tab.key === 'pending' && tab.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {selectedComments.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                Выбрано: {selectedComments.length} комментариев
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approved')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  ✅ Одобрить все
                </button>
                <button
                  onClick={() => handleBulkAction('rejected')}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  ❌ Отклонить все
                </button>
                <button
                  onClick={() => handleBulkAction('spam')}
                  className="px-3 py-1 text-sm bg-red-200 text-red-800 rounded hover:bg-red-300"
                >
                  🚫 Отметить как спам
                </button>
                <button 
                  onClick={() => setSelectedComments([])}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Отменить выбор
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedComments.length === comments.length && comments.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Выбрать все на странице
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Показано {comments.length} из {pagination.total} комментариев
            </div>
          </div>

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

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Комментариев не найдено
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending' 
                  ? 'Нет комментариев, ожидающих модерации'
                  : `Нет ${activeTab === 'all' ? '' : tabs.find(t => t.key === activeTab)?.label.toLowerCase()} комментариев`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isSelected={selectedComments.includes(comment.id)}
                  onSelect={handleSelectComment}
                  onAction={handleCommentAction}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Показано {(pagination.current_page - 1) * pagination.per_page + 1}-{Math.min(pagination.current_page * pagination.per_page, pagination.total)} из {pagination.total} комментариев
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Назад
                </button>
                
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let page;
                  if (pagination.last_page <= 5) {
                    page = i + 1;
                  } else if (pagination.current_page <= 3) {
                    page = i + 1;
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    page = pagination.last_page - 4 + i;
                  } else {
                    page = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        pagination.current_page === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Вперед →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentDetailModal
        comment={selectedComment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComment(null);
        }}
        onAction={handleCommentAction}
      />
    </div>
  );
};

export default BlogCommentsModeration; 