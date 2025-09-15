import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  GlobeAltIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useHoldingSites } from '@/hooks/useHoldingSites';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import type { HoldingSite, SiteFilters } from '@/types/holding-sites';

interface HoldingSitesListProps {
  holdingId: number;
}

const HoldingSitesList: React.FC<HoldingSitesListProps> = ({ holdingId }) => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    sites,
    loading,
    error,
    fetchSites,
    deleteSite,
    publishSite
  } = useHoldingSites();

  const [filters, setFilters] = useState<SiteFilters>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchSites(holdingId, filters);
  }, [holdingId, filters, fetchSites]);

  const handleDeleteConfirm = async (siteId: number) => {
    const success = await deleteSite(siteId);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  const handlePublish = async (siteId: number) => {
    await publishSite(siteId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Черновик' },
      published: { color: 'bg-green-100 text-green-800', label: 'Опубликован' },
      disabled: { color: 'bg-gray-100 text-gray-800', label: 'Отключен' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!can('multi-organization.website.view')) {
    return (
      <div className="text-center py-8">
        <div className="bg-amber-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <GlobeAltIcon className="h-10 w-10 text-amber-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для просмотра сайтов холдинга</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сайты холдинга</h1>
          <p className="text-gray-600 mt-1">Управление сайтами и landing-страницами</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Фильтр по статусу */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="published">Опубликованные</option>
            <option value="disabled">Отключенные</option>
          </select>

          {/* Кнопка создания */}
          {can('multi-organization.website.create') && (
            <Link
              to={`/holding/${holdingId}/sites/create`}
              className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
            >
              <PlusIcon className="h-4 w-4" />
              Создать сайт
            </Link>
          )}
        </div>
      </div>

      {/* Список сайтов */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && sites.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Загрузка сайтов...</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Нет сайтов</h3>
          <p className="mt-1 text-sm text-gray-500">
            Создайте первый сайт для вашего холдинга
          </p>
          {can('multi-organization.website.create') && (
            <div className="mt-6">
              <Link
                to={`/holding/${holdingId}/sites/create`}
                className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2`}
              >
                <PlusIcon className="h-4 w-4" />
                Создать сайт
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Превью */}
              <div className="aspect-video bg-gray-100 rounded-t-xl relative overflow-hidden">
                {site.logo ? (
                  <img
                    src={site.logo.public_url}
                    alt={site.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <GlobeAltIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Статус */}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(site.status)}
                </div>

                {/* Кнопка превью */}
                <div className="absolute top-3 right-3">
                  <a
                    href={site.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg transition-colors"
                    title="Открыть превью"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Контент */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {site.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {site.domain}
                    </p>
                  </div>
                </div>

                {site.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {site.description}
                  </p>
                )}

                {/* Статистика */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{site.blocks_count} блоков</span>
                  <span>{site.assets_count} файлов</span>
                  <span>Обновлен {formatDate(site.last_updated)}</span>
                </div>

                {/* Действия */}
                <div className="flex items-center gap-2">
                  {can('multi-organization.website.edit') && (
                    <Link
                      to={`/holding/${holdingId}/sites/${site.id}/edit`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Редактировать
                    </Link>
                  )}

                  {/* Дополнительные действия */}
                  <div className="flex items-center gap-1">
                    {site.is_published && (
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Открыть сайт"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                    )}

                    {can('multi-organization.website.publish') && site.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(site.id)}
                        className="p-2 text-green-400 hover:text-green-600 transition-colors"
                        title="Опубликовать"
                      >
                        <GlobeAltIcon className="h-4 w-4" />
                      </button>
                    )}

                    {can('multi-organization.website.delete') && (
                      <button
                        onClick={() => setDeleteConfirmId(site.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Удалить"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Подтвердите удаление
            </h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот сайт? Это действие нельзя отменить.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldingSitesList;
