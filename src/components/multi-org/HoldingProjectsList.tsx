import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHoldingProjects } from '@/hooks/useHoldingProjects';
import { useHoldingFilters } from '@/hooks/useHoldingFilters';
import { HoldingFiltersPanel } from './HoldingFiltersPanel';
import { 
  BuildingOfficeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  planning: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Активен',
  planning: 'Планирование',
  completed: 'Завершен',
  suspended: 'Приостановлен',
};

export const HoldingProjectsList = () => {
  const {
    data,
    loading,
    error,
    filters,
    currentPage,
    updateFilters,
    resetFilters,
    refetch,
    goToPage,
  } = useHoldingProjects();

  const {
    options,
    selectedOrgIds,
    selectOrganization,
    setSelectedOrgIds,
  } = useHoldingFilters();

  const [showFilters, setShowFilters] = useState(true);

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const handleOrgIdsChange = (ids: number[]) => {
    setSelectedOrgIds(ids);
    updateFilters({ organization_ids: ids.length > 0 ? ids : undefined });
  };

  const handleReset = () => {
    setSelectedOrgIds([]);
    resetFilters();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && !data) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Проекты холдинга</h1>
          <p className="text-sm text-gray-500 mt-1">
            Все проекты дочерних организаций
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FunnelIcon className="w-5 h-5" />
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {showFilters && (
          <div className="lg:col-span-1">
            <HoldingFiltersPanel
              options={options}
              selectedOrgIds={selectedOrgIds}
              onOrgIdsChange={handleOrgIdsChange}
              onFiltersChange={handleFiltersChange}
              onReset={handleReset}
              currentFilters={filters}
            />
          </div>
        )}

        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={refetch}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Повторить попытку
              </button>
            </div>
          )}

          {data && data.data.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Проекты не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Проект
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Организация
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Бюджет
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Дата создания
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.data.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              to={`/landing/multi-organization/projects/${project.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {project.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {project.organization.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {STATUS_LABELS[project.status] || project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(project.budget_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(project.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data && data.last_page > 1 && (
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Показано <span className="font-medium">{data.data.length}</span> из{' '}
                      <span className="font-medium">{data.total}</span> проектов
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-700">
                        Страница {currentPage} из {data.last_page}
                      </span>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === data.last_page}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

