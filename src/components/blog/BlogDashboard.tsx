import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../../utils/blogApi';
import type { BlogDashboardOverview, BlogQuickStats } from '../../types/blog';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  percentage?: number;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  icon: string;
  linkTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, percentage, color, icon, linkTo }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };

  const percentageColor = percentage && percentage > 0 ? 'text-green-600' : 'text-red-600';

  const content = (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm opacity-60 mt-1">{subtitle}</p>}
          {percentage !== undefined && (
            <p className={`text-sm mt-2 ${percentageColor}`}>
              {percentage > 0 ? '+' : ''}{percentage}% за неделю
            </p>
          )}
        </div>
        <div className="text-4xl opacity-60">{icon}</div>
      </div>
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};

interface PopularArticlesTableProps {
  articles: any[];
}

const PopularArticlesTable: React.FC<PopularArticlesTableProps> = ({ articles }) => (
  <div className="bg-white rounded-lg shadow-sm border">
    <div className="p-4 border-b">
      <h3 className="text-lg font-semibold">Популярные статьи</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Заголовок
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Просмотры
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Лайки
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Комментарии
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div>
                  <Link 
                    to={`/admin/blog/articles/${article.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {article.title}
                  </Link>
                  <div className="text-sm text-gray-500">{article.category?.name}</div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                👁️ {article.views_count?.toLocaleString()}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                ❤️ {article.likes_count}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                💬 {article.comments_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

interface RecentActivityProps {
  articles: any[];
  comments: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ articles, comments }) => {
  const activities = [
    ...articles.map(article => ({
      type: 'article',
      title: `Новая статья: ${article.title}`,
      time: article.created_at,
      icon: '📝'
    })),
    ...comments.map(comment => ({
      type: 'comment',
      title: `Новый комментарий от ${comment.author_name}`,
      time: comment.created_at,
      icon: '💬'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Последние действия</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.time).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogDashboard: React.FC = () => {
  const [overview, setOverview] = useState<BlogDashboardOverview | null>(null);
  const [quickStats, setQuickStats] = useState<BlogQuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewResponse, quickStatsResponse] = await Promise.all([
          blogApi.dashboard.getOverview(),
          blogApi.dashboard.getQuickStats()
        ]);

        setOverview((overviewResponse.data as any).data);
        setQuickStats((quickStatsResponse.data as any).data);
      } catch (err) {
        setError('Ошибка загрузки данных дашборда');
        console.error('Dashboard loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl">⚠️</span>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const todayViews = quickStats?.today_vs_yesterday?.views?.today || 0;
  const todayChange = quickStats?.today_vs_yesterday?.views?.change_percent || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд блога</h1>
        <Link
          to="/admin/blog/articles/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          ➕ Создать статью
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего статей"
          value={overview.articles.total}
          subtitle="Статей в блоге"
          color="blue"
          icon="📄"
          linkTo="/admin/blog/articles"
        />
        <StatCard
          title="Опубликовано"
          value={overview.articles.published}
          subtitle={`${Math.round((overview.articles.published / overview.articles.total) * 100)}% от общего`}
          color="green"
          icon="✅"
          linkTo="/admin/blog/articles?status=published"
        />
        <StatCard
          title="Ожидают модерации"
          value={overview.comments.pending}
          color={overview.comments.pending > 5 ? "red" : "yellow"}
          icon="💬"
          linkTo="/admin/blog/comments?status=pending"
        />
        <StatCard
          title="Просмотры за сегодня"
          value={todayViews.toLocaleString()}
          percentage={todayChange}
          color="purple"
          icon="👁️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularArticlesTable articles={overview.popular_articles || []} />
        <RecentActivity 
          articles={overview.recent_articles || []} 
          comments={overview.recent_comments || []} 
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">График активности</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">7 дней</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">30 дней</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">3 месяца</button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          📊 График активности (будет реализован с Chart.js)
        </div>
      </div>
    </div>
  );
};

export default BlogDashboard; 