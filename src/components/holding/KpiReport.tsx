import React, { useEffect, useState } from 'react';
import { useHoldingReports } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';

const KpiReport: React.FC = () => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    kpiData,
    loading,
    error,
    fetchKpiReport,
    formatCurrency,
    formatPercent,
    formatDate,
    getTrendIcon
  } = useHoldingReports();

  const [period, setPeriod] = useState('');

  useEffect(() => {
    loadKpiReport();
  }, []);

  const loadKpiReport = async (selectedPeriod?: string) => {
    const targetPeriod = selectedPeriod || period;
    await fetchKpiReport(targetPeriod);
  };

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod);
    await loadKpiReport(newPeriod);
  };

  const getKpiStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-50';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderFinancialKpis = () => {
    if (!kpiData?.kpis?.financial_kpis) return null;

    const kpis = kpiData.kpis.financial_kpis;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6 text-green-600">📊 Финансовые KPI</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-2">Рост выручки</p>
            <p className="text-2xl font-bold text-green-700 flex items-center justify-center">
              {getTrendIcon((kpis.revenue_growth || 0) >= 0 ? 'growing' : 'declining')}
              {formatPercent(Math.abs(kpis.revenue_growth || 0))}
            </p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.revenue_growth || 0, { good: 10, warning: 5 })}`}>
              {(kpis.revenue_growth || 0) >= 10 ? 'Отлично' : (kpis.revenue_growth || 0) >= 5 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">Маржа прибыли</p>
            <p className="text-2xl font-bold text-blue-700">{formatPercent(kpis.profit_margin || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.profit_margin || 0, { good: 25, warning: 15 })}`}>
              {(kpis.profit_margin || 0) >= 25 ? 'Отлично' : (kpis.profit_margin || 0) >= 15 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-2">ROI</p>
            <p className="text-2xl font-bold text-purple-700">{formatPercent(kpis.roi || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.roi || 0, { good: 20, warning: 10 })}`}>
              {(kpis.roi || 0) >= 20 ? 'Отлично' : (kpis.roi || 0) >= 10 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 mb-2">Выручка на сотрудника</p>
            <p className="text-2xl font-bold text-indigo-700">{formatCurrency(kpis.revenue_per_employee || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor((kpis.revenue_per_employee || 0) / 1000, { good: 150, warning: 100 })}`}>
              {(kpis.revenue_per_employee || 0) >= 150000 ? 'Отлично' : (kpis.revenue_per_employee || 0) >= 100000 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOperationalKpis = () => {
    if (!kpiData?.kpis?.operational_kpis) return null;

    const kpis = kpiData.kpis.operational_kpis;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6 text-blue-600">⚙️ Операционные KPI</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-2">Завершенность проектов</p>
            <p className="text-2xl font-bold text-green-700">{formatPercent(kpis.project_completion_rate || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.project_completion_rate || 0, { good: 90, warning: 80 })}`}>
              {(kpis.project_completion_rate || 0) >= 90 ? 'Отлично' : (kpis.project_completion_rate || 0) >= 80 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">Продуктивность сотрудников</p>
            <p className="text-2xl font-bold text-blue-700">{(kpis.employee_productivity || 0).toFixed(1)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.employee_productivity || 0, { good: 85, warning: 75 })}`}>
              {(kpis.employee_productivity || 0) >= 85 ? 'Отлично' : (kpis.employee_productivity || 0) >= 75 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-2">Использование ресурсов</p>
            <p className="text-2xl font-bold text-purple-700">{formatPercent(kpis.resource_utilization || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.resource_utilization || 0, { good: 80, warning: 70 })}`}>
              {(kpis.resource_utilization || 0) >= 80 ? 'Отлично' : (kpis.resource_utilization || 0) >= 70 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 mb-2">Индекс качества</p>
            <p className="text-2xl font-bold text-indigo-700">{(kpis.quality_index || 0).toFixed(1)}/5</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.quality_index || 0, { good: 4.5, warning: 4.0 })}`}>
              {(kpis.quality_index || 0) >= 4.5 ? 'Отлично' : (kpis.quality_index || 0) >= 4.0 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEfficiencyKpis = () => {
    if (!kpiData?.kpis?.efficiency_kpis) return null;

    const kpis = kpiData.kpis.efficiency_kpis;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6 text-purple-600">⚡ KPI эффективности</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-2">Эффективность затрат</p>
            <p className="text-2xl font-bold text-green-700">{(kpis.cost_efficiency || 0).toFixed(2)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.cost_efficiency || 0, { good: 1.5, warning: 1.2 })}`}>
              {(kpis.cost_efficiency || 0) >= 1.5 ? 'Отлично' : (kpis.cost_efficiency || 0) >= 1.2 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">Эффективность времени</p>
            <p className="text-2xl font-bold text-blue-700">{formatPercent(kpis.time_efficiency || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.time_efficiency || 0, { good: 90, warning: 80 })}`}>
              {(kpis.time_efficiency || 0) >= 90 ? 'Отлично' : (kpis.time_efficiency || 0) >= 80 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-2">Уровень автоматизации</p>
            <p className="text-2xl font-bold text-purple-700">{formatPercent(kpis.automation_level || 0)}</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs mt-2 ${getKpiStatusColor(kpis.automation_level || 0, { good: 60, warning: 40 })}`}>
              {(kpis.automation_level || 0) >= 60 ? 'Отлично' : (kpis.automation_level || 0) >= 40 ? 'Хорошо' : 'Требует внимания'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    if (!kpiData?.trends) return null;

    const trends = kpiData.trends;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">📈 Тренды развития</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Тренд выручки</p>
            <div className="flex items-center justify-center">
              <span className="text-3xl mr-2">{getTrendIcon(trends.revenue_trend || 'stable')}</span>
              <span className="text-lg font-semibold capitalize">{trends.revenue_trend || 'stable'}</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Тренд эффективности</p>
            <div className="flex items-center justify-center">
              <span className="text-3xl mr-2">{getTrendIcon(trends.efficiency_trend || 'stable')}</span>
              <span className="text-lg font-semibold capitalize">{trends.efficiency_trend || 'stable'}</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Тренд прибыльности</p>
            <div className="flex items-center justify-center">
              <span className="text-3xl mr-2">{getTrendIcon(trends.profitability_trend || 'stable')}</span>
              <span className="text-lg font-semibold capitalize">{trends.profitability_trend || 'stable'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!kpiData) return null;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">📋 Сводка отчета</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Информация о холдинге</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Название:</span>
                <span className="font-medium">{kpiData.holding_name || 'Не указано'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID холдинга:</span>
                <span className="font-medium">{kpiData.holding_id || 'Не указан'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Количество организаций:</span>
                <span className="font-medium">{kpiData.organizations_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Период:</span>
                <span className="font-medium">{kpiData.period ? formatDate(kpiData.period) : 'Не указан'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Статистика отчета</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Дата генерации:</span>
                <span className="font-medium">{kpiData.generated_at ? formatDate(kpiData.generated_at) : 'Не указана'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Статус данных:</span>
                <span className="inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Актуальные
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!can('multi-organization.reports.kpi')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">У вас нет прав для просмотра KPI отчетов</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI отчет</h1>
          <p className="text-gray-600 mt-1">Ключевые показатели эффективности холдинга</p>
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
          
          <button
            onClick={() => loadKpiReport()}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.primary} text-white hover:opacity-90 disabled:opacity-50`}
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && !kpiData && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Генерация KPI отчета...</p>
        </div>
      )}

      {kpiData && (
        <>
          {renderSummary()}
          {renderFinancialKpis()}
          {renderOperationalKpis()}
          {renderEfficiencyKpis()}
          {renderTrends()}
        </>
      )}
    </div>
  );
};

export default KpiReport;
