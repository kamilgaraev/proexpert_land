import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  EyeIcon, 
  ChatBubbleLeftIcon, 
  HeartIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
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
    <motion.article 
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className="bg-white/90 border-2 border-steel-200 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-construction hover:border-construction-300 overflow-hidden h-full flex flex-col">
        {article.featured_image && (
          <div className="relative overflow-hidden">
            <Link to={`/blog/${article.slug}`}>
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-concrete-100 to-steel-100">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
            
            {article.is_featured && (
              <motion.div 
                className="absolute top-4 left-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div className="bg-gradient-to-r from-safety-500 to-safety-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-lg">
                  <StarIcon className="w-4 h-4" />
                  Рекомендуем
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </div>
            <div className="flex items-center gap-4 text-steel-500 text-sm">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {getReadingTime(article.content)}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-steel-900 mb-3 line-clamp-2 group-hover:text-construction-600 transition-colors duration-300 font-construction">
            <Link to={`/blog/${article.slug}`}>
              {article.title}
            </Link>
          </h2>

          {article.excerpt && (
            <p className="text-steel-600 mb-4 line-clamp-3 flex-grow text-base leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-steel-100">
            <div className="flex items-center gap-4 text-sm text-steel-500">
              <span className="flex items-center gap-1 hover:text-construction-600 transition-colors">
                <EyeIcon className="w-4 h-4" />
                {article.views_count?.toLocaleString() || 0}
              </span>
              {article.comments_count > 0 && (
                <span className="flex items-center gap-1 hover:text-safety-600 transition-colors">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  {article.comments_count}
                </span>
              )}
              {article.likes_count > 0 && (
                <span className="flex items-center gap-1 hover:text-construction-600 transition-colors">
                  <HeartIcon className="w-4 h-4" />
                  {article.likes_count}
                </span>
              )}
            </div>

            <Link
              to={`/blog/${article.slug}`}
              className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white font-semibold rounded-lg hover:from-construction-600 hover:to-construction-700 transition-all duration-300 hover:scale-105 hover:shadow-construction text-sm"
            >
              Читать
              <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-steel-100">
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/blog/tag/${tag.slug}`}
                    className="inline-flex items-center px-2.5 py-1 bg-steel-100 hover:bg-construction-100 text-steel-600 hover:text-construction-700 text-xs font-medium rounded-full transition-all duration-300 hover:scale-105"
                  >
                    #{tag.name}
                  </Link>
                ))}
                {article.tags.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-steel-50 text-steel-500 text-xs font-medium rounded-full">
                    +{article.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default BlogArticleCard; 