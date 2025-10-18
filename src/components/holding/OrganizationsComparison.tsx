import React, { useEffect, useState } from 'react';
import { useHoldingReports } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';

const OrganizationsComparison: React.FC = () => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    comparisonData,
    loading,
    error,
    fetchOrganizationsComparison,
    formatCurrency,
    formatPercent
  } = useHoldingReports();

  const [period, setPeriod] = useState('');

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async (selectedPeriod?: string) => {
    const targetPeriod = selectedPeriod || period;
    await fetchOrganizationsComparison(undefined, undefined, targetPeriod);
  };

  const handlePeriodChange = async (newPeriod: string) => {
    setPeriod(newPeriod);
    await loadComparison(newPeriod);
  };

  const getRankBadge = (rank: number) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-gray-100 text-gray-800',
      3: 'bg-orange-100 text-orange-800'
    };
    
    const color = colors[rank as keyof typeof colors] || 'bg-blue-100 text-blue-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        #{rank}
      </span>
    );
  };

  const renderOrganizationsTable = () => {
    if (!comparisonData?.organizations?.length) return null;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Сравнение организаций</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Организация</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Выручка</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Маржа</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Сотрудники</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Проекты</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Эффективность</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Завершенность</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Рейтинги</th>
              </tr>
            </thead>
            <tbody>
              {(comparisonData.organizations || []).map((org) => (
                <tr key={org.organization_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{org.organization_name}</div>
                    <div className="text-sm text-gray-500">ID: {org.organization_id}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatCurrency(org.metrics?.revenue || 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-blue-600">
                    {formatPercent(org.metrics?.profit_margin || 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {org.metrics?.employees_count || 0}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {org.metrics?.projects_count || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-purple-600">
                    {org.metrics?.efficiency_score?.toFixed(1) || '0.0'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-indigo-600">
                    {formatPercent(org.metrics?.completion_rate || 0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs text-gray-500">В:</span>
                        {getRankBadge(org.ranking?.revenue_rank || 999)}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs text-gray-500">Э:</span>
                        {getRankBadge(org.ranking?.efficiency_rank || 999)}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs text-gray-500">Р:</span>
                        {getRankBadge(org.ranking?.growth_rank || 999)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>В - рейтинг по выручке, Э - рейтинг по эффективности, Р - рейтинг по росту</p>
        </div>
      </div>
    );
  };

  const renderTopPerformers = () => {
    if (!comparisonData?.organizations?.length) return null;

    const organizations = comparisonData.organizations || [];
    const topByRevenue = [...organizations].sort((a, b) => (a.ranking?.revenue_rank || 999) - (b.ranking?.revenue_rank || 999)).slice(0, 3);
    const topByEfficiency = [...organizations].sort((a, b) => (a.ranking?.efficiency_rank || 999) - (b.ranking?.efficiency_rank || 999)).slice(0, 3);
    const topByGrowth = [...organizations].sort((a, b) => (a.ranking?.growth_rank || 999) - (b.ranking?.growth_rank || 999)).slice(0, 3);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <h4 className="text-lg font-semibold mb-4 text-green-600">Лидеры по выручке</h4>
          <div className="space-y-3">
            {topByRevenue.map((org, index) => (
              <div key={org.organization_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankBadge(index + 1)}
                  <span className="text-sm font-medium">{org.organization_name}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(org.metrics?.revenue || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <h4 className="text-lg font-semibold mb-4 text-purple-600">Лидеры по эффективности</h4>
          <div className="space-y-3">
            {topByEfficiency.map((org, index) => (
              <div key={org.organization_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankBadge(index + 1)}
                  <span className="text-sm font-medium">{org.organization_name}</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {org.metrics?.efficiency_score?.toFixed(1) || '0.0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <h4 className="text-lg font-semibold mb-4 text-indigo-600">Лидеры по росту</h4>
          <div className="space-y-3">
            {topByGrowth.map((org, index) => (
              <div key={org.organization_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankBadge(index + 1)}
                  <span className="text-sm font-medium">{org.organization_name}</span>
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {formatPercent(org.metrics?.completion_rate || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!can('multi-organization.reports.comparison')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">У вас нет прав для просмотра сравнения организаций</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сравнение организаций</h1>
          <p className="text-gray-600 mt-1">Сравнительный анализ показателей организаций холдинга</p>
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
            onClick={() => loadComparison()}
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

      {loading && !comparisonData && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Загрузка данных сравнения...</p>
        </div>
      )}

      {renderTopPerformers()}
      {renderOrganizationsTable()}
    </div>
  );
};

export default OrganizationsComparison;
