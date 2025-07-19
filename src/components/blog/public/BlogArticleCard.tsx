import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogArticle } from '../../../types/blog';

interface BlogArticleCardProps {
  article: BlogArticle;
}

const BlogArticleCard: React.FC<BlogArticleCardProps> = ({ article }) => {
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

  return (
    <article className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300">
      {article.featured_image && (
        <div className="relative overflow-hidden rounded-t-xl">
          <Link to={`/blog/${article.slug}`}>
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
          {article.is_featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Рекомендуем
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
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

        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link to={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h2>

        {article.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              👁️ {article.views_count?.toLocaleString() || 0}
            </span>
            {article.comments_count > 0 && (
              <span className="flex items-center">
                💬 {article.comments_count}
              </span>
            )}
            {article.likes_count > 0 && (
              <span className="flex items-center">
                ❤️ {article.likes_count}
              </span>
            )}
          </div>

          <Link
            to={`/blog/${article.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Читать далее →
          </Link>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  to={`/blog/tag/${tag.slug}`}
                  className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
              {article.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{article.tags.length - 3} еще
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogArticleCard; 