import React, { useEffect, useState } from 'react';
import { useHoldingDashboard } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { 
  ArrowPathIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  FolderOpenIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const HoldingReportsDashboard: React.FC = () => {
  const { can } = usePermissionsContext();

  const {
    dashboardData,
    quickMetrics,
    loading,
    error,
    period,
    setPeriod,
    loadDashboard,
    loadQuickMetrics,
    refreshData,
    clearAndRefresh,
    formatCurrency,
    formatPercent,
    formatDate,
  } = useHoldingDashboard();

  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadQuickMetrics();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadQuickMetrics]);

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod);
    await loadDashboard(newPeriod);
  };

  if (!can('multi-organization.reports.dashboard')) {
    return (
      <div className="text-center py-12">
        <div className="bg-amber-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <ChartBarIcon className="h-12 w-12 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Доступ ограничен</h3>
        <p className="text-gray-600">У вас нет прав для просмотра дашборда отчетов холдинга</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд отчетности холдинга</h1>
          {dashboardData?.holding_info && (
            <p className="text-gray-600 mt-1">
              {dashboardData.holding_info.name} - {dashboardData.holding_info.organizations_count} организаций
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Период:</label>
            <input
              type="month"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-slate-700 focus:ring-slate-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600 font-medium">
              Автообновление
            </label>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
          
          {can('multi-organization.cache.clear') && (
            <button
              onClick={clearAndRefresh}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Очистить кэш
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {loading && !dashboardData && !quickMetrics && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка данных...</p>
        </div>
      )}

      {quickMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BuildingOfficeIcon className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{quickMetrics.organizations_count}</span>
            </div>
            <div className="text-sm font-medium opacity-90">Организаций</div>
          </div>

          <div className="bg-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FolderOpenIcon className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{quickMetrics.total_projects}</span>
            </div>
            <div className="text-sm font-medium opacity-90">Проектов</div>
          </div>

          <div className="bg-violet-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CurrencyDollarIcon className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(quickMetrics.current_revenue)}</div>
                <div className="text-xs opacity-80 flex items-center justify-end gap-1 mt-1">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  {formatPercent(quickMetrics.revenue_growth)}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium opacity-90">Текущая выручка</div>
          </div>

          <div className="bg-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BoltIcon className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{formatPercent(quickMetrics.efficiency_metrics.overall_efficiency)}</span>
            </div>
            <div className="text-sm font-medium opacity-90">Эффективность</div>
          </div>
        </div>
      )}

      {dashboardData?.consolidated_metrics && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Консолидированные показатели</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-center mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-700" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Общая выручка</p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(dashboardData.consolidated_metrics.total_revenue)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-center mb-2">
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Общие расходы</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(dashboardData.consolidated_metrics.total_expenses)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-700" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Чистая прибыль</p>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(dashboardData.consolidated_metrics.net_profit)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-violet-50 rounded-xl border border-violet-200">
              <div className="flex items-center justify-center mb-2">
                <ChartBarIcon className="w-5 h-5 text-violet-700" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Маржа прибыли</p>
              <p className="text-xl font-bold text-violet-700">
                {formatPercent(dashboardData.consolidated_metrics.profit_margin)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-center mb-2">
                {dashboardData.consolidated_metrics.growth_rate >= 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-amber-700" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-amber-700" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">Темп роста</p>
              <p className="text-xl font-bold text-amber-700">
                {formatPercent(Math.abs(dashboardData.consolidated_metrics.growth_rate))}
              </p>
            </div>
          </div>
        </div>
      )}

      {dashboardData?.organization_breakdown && dashboardData.organization_breakdown.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Показатели по организациям</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Организация</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Выручка</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Расходы</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Прибыль</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Сотрудники</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Проекты</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(dashboardData?.organization_breakdown || []).map((org) => (
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
                    <td className="py-4 px-6 text-right font-medium text-green-600">
                      {formatCurrency(org.revenue)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-red-600">
                      {formatCurrency(org.expenses)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-blue-600">
                      {formatCurrency(org.profit)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-900">
                      {org.employees_count}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-900">
                      {org.projects_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dashboardData?.kpi_summary && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Ключевые показатели</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Выручка на сотрудника</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.kpi_summary.revenue_per_employee)}
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Завершенность проектов</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercent(dashboardData.kpi_summary.project_completion_rate)}
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <StarIcon className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Удовлетворенность клиентов</p>
              <p className="text-2xl font-bold text-yellow-600">
                {dashboardData.kpi_summary.customer_satisfaction.toFixed(1)}/5
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl border border-purple-200">
              <BoltIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Показатель эффективности</p>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.kpi_summary.efficiency_score.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {quickMetrics && (
        <div className="text-center text-sm text-gray-500">
          Последнее обновление: {quickMetrics.updated_at ? formatDate(quickMetrics.updated_at) : 'Не указано'}
        </div>
      )}
    </div>
  );
};

export default HoldingReportsDashboard;
