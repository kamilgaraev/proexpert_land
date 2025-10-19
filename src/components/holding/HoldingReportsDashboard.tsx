import React, { useEffect, useState } from 'react';
import { useProjectsReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { 
  ArrowPathIcon, 
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  FolderOpenIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const HoldingReportsDashboard: React.FC = () => {
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

  if (!can('multi-organization.reports.view')) {
    return (
      <div className="text-center py-12">
        <div className="bg-amber-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <ChartBarIcon className="h-12 w-12 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для просмотра отчетов холдинга</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const statusNames: Record<string, string> = {
      planning: 'В планировании',
      active: 'Активный',
      completed: 'Завершен',
      on_hold: 'Приостановлен',
      cancelled: 'Отменен',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusNames[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчет по проектам холдинга</h1>
          {projectsReport?.holding && (
            <p className="text-gray-600 mt-1">{projectsReport.holding.name}</p>
          )}
          {projectsReport?.period && (
            <p className="text-sm text-gray-500 mt-1">
              Период: {projectsReport.period.from ? formatDate(projectsReport.period.from) : 'Не указан'} 
              {projectsReport.period.to && ` - ${formatDate(projectsReport.period.to)}`}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>

          <button
            onClick={() => handleApplyFilters()}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>

          <div className="relative inline-block">
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              onClick={() => handleExport('excel')}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Экспорт Excel
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Фильтры</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата от</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата до</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Минимальный бюджет</label>
              <input
                type="number"
                value={filters.min_budget || ''}
                onChange={(e) => handleFilterChange('min_budget', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка данных...</p>
        </div>
      )}

      {projectsReport?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-slate-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FolderOpenIcon className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{projectsReport.summary.total_projects}</span>
            </div>
            <div className="text-sm font-medium opacity-90">Всего проектов</div>
          </div>

          <div className="bg-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-xl font-bold">{formatCurrency(projectsReport.summary.total_budget)}</div>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90">Общий бюджет</div>
          </div>

          <div className="bg-violet-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-xl font-bold">{formatCurrency(projectsReport.summary.total_contracts_amount)}</div>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90">Сумма контрактов</div>
          </div>

          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-xl font-bold">{formatCurrency(projectsReport.summary.total_completed_works)}</div>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90">Выполнено работ</div>
          </div>

          <div className="bg-amber-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BuildingOfficeIcon className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-xl font-bold">{formatCurrency(projectsReport.summary.total_materials_cost)}</div>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90">Стоимость материалов</div>
          </div>
        </div>
      )}

      {projectsReport?.summary?.by_status && projectsReport.summary.by_status.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Проекты по статусам</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsReport.summary.by_status.map((statusItem) => (
              <div key={statusItem.status} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  {getStatusBadge(statusItem.status)}
                  <span className="text-2xl font-bold text-gray-900">{statusItem.count}</span>
                </div>
                <p className="text-sm text-gray-600">Бюджет: {formatCurrency(statusItem.total_budget)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectsReport?.by_organization && projectsReport.by_organization.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Показатели по организациям</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Организация</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Проектов</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Бюджет</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Контракты</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Выполнено</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">% Завершения</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectsReport.by_organization.map((org) => (
                  <tr key={org.organization_id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-orange-500 to-blue-600 p-2 rounded-lg">
                          <BuildingOfficeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{org.organization_name}</div>
                          <div className="text-sm text-gray-500">ID: {org.organization_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-900">
                      {org.projects_count}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-green-600">
                      {formatCurrency(org.total_budget)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-blue-600">
                      {formatCurrency(org.contracts_amount)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-purple-600">
                      {formatCurrency(org.completed_works)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-indigo-600">
                      {formatPercent(org.completion_percentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {projectsReport?.top_projects && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectsReport.top_projects.by_budget && projectsReport.top_projects.by_budget.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Топ проектов по бюджету</h3>
              <div className="space-y-3">
                {projectsReport.top_projects.by_budget.map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{formatCurrency(project.budget_amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectsReport.top_projects.overdue && projectsReport.top_projects.overdue.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                Просроченные проекты
              </h3>
              <div className="space-y-3">
                {projectsReport.top_projects.overdue.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-600">Окончание: {formatDate(project.end_date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">{project.days_overdue} дн.</div>
                      <div className="text-xs text-gray-500">просрочено</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {projectsReport && (
        <div className="text-center text-sm text-gray-500">
          Последнее обновление: {formatDate(projectsReport.generated_at)}
        </div>
      )}
    </div>
  );
};

export default HoldingReportsDashboard;
