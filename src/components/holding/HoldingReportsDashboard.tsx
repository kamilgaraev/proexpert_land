import React, { useEffect, useState } from 'react';
import { useHoldingDashboard } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';

interface HoldingReportsDashboardProps {
  holdingId: number;
}

const HoldingReportsDashboard: React.FC<HoldingReportsDashboardProps> = ({ holdingId }) => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

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
    getTrendIcon
  } = useHoldingDashboard(holdingId);

  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadQuickMetrics();
    }, 30 * 60 * 1000); // 30 минут

    return () => clearInterval(interval);
  }, [autoRefresh, loadQuickMetrics]);

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod);
    await loadDashboard(newPeriod);
  };

  const renderQuickMetrics = () => {
    if (!quickMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Организации</p>
              <p className="text-2xl font-bold text-gray-900">{quickMetrics.organizations_count}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-blue-600">🏢</span>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Проекты</p>
              <p className="text-2xl font-bold text-gray-900">{quickMetrics.total_projects}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-green-600">📁</span>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Текущая выручка</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(quickMetrics.current_revenue)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                📈 {formatPercent(quickMetrics.revenue_growth)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-purple-600">💰</span>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Эффективность</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(quickMetrics.efficiency_metrics.overall_efficiency)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <span className="text-orange-600">⚡</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConsolidatedMetrics = () => {
    if (!dashboardData?.consolidated_metrics) return null;

    const metrics = dashboardData.consolidated_metrics;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Консолидированные показатели</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Общая выручка</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.total_revenue)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Общие расходы</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(metrics.total_expenses)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Чистая прибыль</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(metrics.net_profit)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Маржа прибыли</p>
            <p className="text-xl font-bold text-purple-600">{formatPercent(metrics.profit_margin)}</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Темп роста</p>
            <p className="text-xl font-bold text-indigo-600 flex items-center justify-center">
              {getTrendIcon(metrics.growth_rate >= 0 ? 'growing' : 'declining')}
              {formatPercent(Math.abs(metrics.growth_rate))}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderOrganizationBreakdown = () => {
    if (!dashboardData?.organization_breakdown?.length) return null;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Показатели по организациям</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Организация</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Выручка</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Расходы</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Прибыль</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Сотрудники</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Проекты</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardData.organization_breakdown || []).map((org) => (
                <tr key={org.organization_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{org.organization_name}</div>
                    <div className="text-sm text-gray-500">ID: {org.organization_id}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatCurrency(org.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    {formatCurrency(org.expenses)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-blue-600">
                    {formatCurrency(org.profit)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {org.employees_count}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {org.projects_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderKpiSummary = () => {
    if (!dashboardData?.kpi_summary) return null;

    const kpi = dashboardData.kpi_summary;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Ключевые показатели</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Выручка на сотрудника</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(kpi.revenue_per_employee)}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Завершенность проектов</p>
            <p className="text-xl font-bold text-gray-900">{formatPercent(kpi.project_completion_rate)}</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Удовлетворенность клиентов</p>
            <p className="text-xl font-bold text-gray-900">{kpi.customer_satisfaction.toFixed(1)}/5</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Показатель эффективности</p>
            <p className="text-xl font-bold text-gray-900">{kpi.efficiency_score.toFixed(1)}</p>
          </div>
        </div>
      </div>
    );
  };

  if (!can('multi-organization.reports.dashboard')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">У вас нет прав для просмотра дашборда отчетов холдинга</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд отчетности холдинга</h1>
          {dashboardData?.holding_info && (
            <p className="text-gray-600 mt-1">
              {dashboardData.holding_info.name} - {dashboardData.holding_info.organizations_count} организаций
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Период:</label>
            <input
              type="month"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Автообновление
            </label>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.primary} text-white hover:opacity-90 disabled:opacity-50`}
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
          
          {can('multi-organization.cache.clear') && (
            <button
              onClick={clearAndRefresh}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Очистить кэш
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && !dashboardData && !quickMetrics && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Загрузка данных...</p>
        </div>
      )}

      {renderQuickMetrics()}
      {renderConsolidatedMetrics()}
      {renderOrganizationBreakdown()}
      {renderKpiSummary()}

      {quickMetrics && (
        <div className="text-xs text-gray-500 text-center mt-8">
          Последнее обновление: {quickMetrics.updated_at ? formatDate(quickMetrics.updated_at) : 'Не указано'}
        </div>
      )}
    </div>
  );
};

export default HoldingReportsDashboard;
