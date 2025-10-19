import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import { 
  ArrowPathIcon, 
  ArrowDownTrayIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  FolderOpenIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const HoldingProjectsReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();

  const {
    projectsReport,
    loading,
    error,
    filters,
    updateFilters,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate,
  } = useProjectsReport();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!can('multi-organization.reports.view')) {
      navigate('/reports');
      return;
    }
    loadReport();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  const handleApplyFilters = () => {
    loadReport(filters);
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    await exportReport(format);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      planning: 'bg-steel-100 text-steel-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const statusNames: Record<string, string> = {
      planning: 'В планировании',
      active: 'Активный',
      completed: 'Завершен',
      on_hold: 'Приостановлен',
      cancelled: 'Отменен',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusColors[status] || 'bg-steel-100 text-steel-700'}`}>
        {statusNames[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <SEOHead 
        title="Отчет по проектам - ProHelper"
        description="Отчет по проектам холдинга"
      />
      <PageHeader 
        title="Отчет по проектам"
        subtitle="Сводная информация по всем проектам холдинга"
        actions={
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 text-steel-700 hover:text-steel-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Назад к отчетам
          </button>
        }
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {projectsReport?.holding && (
              <p className="text-steel-700 font-medium">{projectsReport.holding.name}</p>
            )}
            {projectsReport?.period && (
              <p className="text-sm text-steel-600 mt-1">
                Период: {projectsReport.period.from ? formatDate(projectsReport.period.from) : 'Не указан'} 
                {projectsReport.period.to && ` - ${formatDate(projectsReport.period.to)}`}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-steel-300 text-steel-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-steel-50 transition-colors shadow-sm"
            >
              <FunnelIcon className="w-4 h-4" />
              {showFilters ? 'Скрыть фильтры' : 'Фильтры'}
            </button>

            <button
              onClick={() => handleApplyFilters()}
              disabled={loading}
              className="flex items-center gap-2 bg-steel-700 hover:bg-steel-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>

            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Экспорт
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
            <h3 className="text-lg font-semibold text-steel-900 mb-4">Фильтры</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Дата от</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Дата до</label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Статус</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                >
                  <option value="">Все статусы</option>
                  <option value="planning">В планировании</option>
                  <option value="active">Активный</option>
                  <option value="completed">Завершен</option>
                  <option value="on_hold">Приостановлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Минимальный бюджет</label>
                <input
                  type="number"
                  value={filters.min_budget || ''}
                  onChange={(e) => handleFilterChange('min_budget', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {loading && !projectsReport && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-steel-700 border-t-transparent mx-auto mb-4"></div>
            <p className="text-steel-600 font-medium">Загрузка данных...</p>
          </div>
        )}

        {projectsReport?.summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <FolderOpenIcon className="w-8 h-8 text-steel-600" />
                  <span className="text-3xl font-bold text-steel-900">{projectsReport.summary.total_projects}</span>
                </div>
                <div className="text-sm font-medium text-steel-600">Всего проектов</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <CurrencyDollarIcon className="w-8 h-8 text-steel-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-steel-900">{formatCurrency(projectsReport.summary.total_budget)}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-steel-600">Общий бюджет</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <ChartBarIcon className="w-8 h-8 text-steel-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-steel-900">{formatCurrency(projectsReport.summary.total_contracts_amount)}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-steel-600">Сумма контрактов</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircleIcon className="w-8 h-8 text-steel-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-steel-900">{formatCurrency(projectsReport.summary.total_completed_works)}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-steel-600">Выполнено работ</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <BuildingOfficeIcon className="w-8 h-8 text-steel-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-steel-900">{formatCurrency(projectsReport.summary.total_materials_cost)}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-steel-600">Стоимость материалов</div>
              </div>
            </div>

            {projectsReport.summary.by_status && projectsReport.summary.by_status.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <h3 className="text-lg font-semibold text-steel-900 mb-6">Проекты по статусам</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectsReport.summary.by_status.map((statusItem) => (
                    <div key={statusItem.status} className="border border-steel-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        {getStatusBadge(statusItem.status)}
                        <span className="text-2xl font-bold text-steel-900">{statusItem.count}</span>
                      </div>
                      <p className="text-sm text-steel-600">Бюджет: <span className="font-medium text-steel-900">{formatCurrency(statusItem.total_budget)}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projectsReport.by_organization && projectsReport.by_organization.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-steel-200 overflow-hidden">
                <div className="bg-steel-50 px-6 py-4 border-b border-steel-200">
                  <h3 className="text-lg font-semibold text-steel-900">Показатели по организациям</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-steel-50 border-b border-steel-200">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-steel-700 text-sm">Организация</th>
                        <th className="text-right py-4 px-6 font-semibold text-steel-700 text-sm">Проектов</th>
                        <th className="text-right py-4 px-6 font-semibold text-steel-700 text-sm">Бюджет</th>
                        <th className="text-right py-4 px-6 font-semibold text-steel-700 text-sm">Контракты</th>
                        <th className="text-right py-4 px-6 font-semibold text-steel-700 text-sm">Выполнено</th>
                        <th className="text-right py-4 px-6 font-semibold text-steel-700 text-sm">% Завершения</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100">
                      {projectsReport.by_organization.map((org) => (
                        <tr key={org.organization_id} className="hover:bg-steel-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-steel-700 p-2 rounded-lg">
                                <BuildingOfficeIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-steel-900">{org.organization_name}</div>
                                <div className="text-sm text-steel-500">ID: {org.organization_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-steel-900">
                            {org.projects_count}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-steel-900">
                            {formatCurrency(org.total_budget)}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-steel-900">
                            {formatCurrency(org.contracts_amount)}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-steel-900">
                            {formatCurrency(org.completed_works)}
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-steel-900">
                            {formatPercent(org.completion_percentage)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {projectsReport.top_projects && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projectsReport.top_projects.by_budget && projectsReport.top_projects.by_budget.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                    <h3 className="text-lg font-semibold text-steel-900 mb-4">Топ проектов по бюджету</h3>
                    <div className="space-y-3">
                      {projectsReport.top_projects.by_budget.map((project, index) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-steel-50 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="bg-steel-700 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-steel-900">{project.name}</div>
                              {getStatusBadge(project.status)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-steel-900">{formatCurrency(project.budget_amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projectsReport.top_projects.overdue && projectsReport.top_projects.overdue.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                    <h3 className="text-lg font-semibold text-steel-900 mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                      Просроченные проекты
                    </h3>
                    <div className="space-y-3">
                      {projectsReport.top_projects.overdue.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:shadow-md transition-shadow">
                          <div>
                            <div className="font-medium text-steel-900">{project.name}</div>
                            <div className="text-sm text-steel-600">Окончание: {formatDate(project.end_date)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-red-600">{project.days_overdue} дн.</div>
                            <div className="text-xs text-steel-500">просрочено</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {projectsReport && (
          <div className="text-center text-sm text-steel-500">
            Последнее обновление: {formatDate(projectsReport.generated_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingProjectsReportPage;

