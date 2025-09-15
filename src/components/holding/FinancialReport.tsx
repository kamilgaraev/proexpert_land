import React, { useEffect, useState } from 'react';
import { useHoldingReports } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';

interface FinancialReportProps {
  holdingId: number;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ holdingId }) => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    financialData,
    loading,
    error,
    fetchFinancialReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useHoldingReports();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadFinancialReport();
    }
  }, [startDate, endDate]);

  const loadFinancialReport = async () => {
    if (!startDate || !endDate) return;
    await fetchFinancialReport(holdingId, startDate, endDate);
  };

  const setQuickPeriod = (months: number) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const renderPeriodSelector = () => (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">От:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">До:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Быстрый выбор:</span>
        <button
          onClick={() => setQuickPeriod(1)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Текущий месяц
        </button>
        <button
          onClick={() => setQuickPeriod(3)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Квартал
        </button>
        <button
          onClick={() => setQuickPeriod(12)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Год
        </button>
      </div>
    </div>
  );

  const renderConsolidatedFinancials = () => {
    if (!financialData?.consolidated_financials) return null;

    const financials = financialData.consolidated_financials;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Консолидированные финансовые показатели</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-2">Общая выручка</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(financials.total_revenue)}</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-2">Общие расходы</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(financials.total_expenses)}</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-2">Валовая прибыль</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(financials.gross_profit)}</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-2">Чистая прибыль</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(financials.net_profit)}</p>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 mb-2">Маржа прибыли</p>
            <p className="text-2xl font-bold text-indigo-700">{formatPercent(financials.profit_margin)}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderOrganizationBreakdown = () => {
    if (!financialData?.breakdown_by_organization?.length) return null;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Разбивка по организациям</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Организация</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Выручка</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Расходы</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Прибыль</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Маржа</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Доля в общей выручке</th>
              </tr>
            </thead>
            <tbody>
              {financialData.breakdown_by_organization.map((org) => {
                const revenueShare = (org.revenue / financialData.consolidated_financials.total_revenue) * 100;
                
                return (
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
                    <td className="py-3 px-4 text-right font-medium text-purple-600">
                      {formatPercent(org.profit_margin)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {revenueShare.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMonthlyDynamics = () => {
    if (!financialData?.monthly_dynamics?.length) return null;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Помесячная динамика</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialData.monthly_dynamics.map((month) => (
            <div key={month.month} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {new Date(month.month + '-01').toLocaleDateString('ru-RU', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Выручка:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(month.revenue)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Расходы:</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(month.expenses)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Прибыль:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {formatCurrency(month.profit)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExpenseCategories = () => {
    if (!financialData?.expense_categories?.length) return null;

    const totalExpenses = financialData.consolidated_financials.total_expenses;

    return (
      <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm mb-8`}>
        <h3 className="text-lg font-semibold mb-6">Структура расходов</h3>
        
        <div className="space-y-4">
          {financialData.expense_categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="ml-4 text-right">
                <span className="font-medium text-gray-900">{formatCurrency(category.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!can('multi-organization.reports.financial')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">У вас нет прав для просмотра финансовых отчетов</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Финансовый отчет</h1>
          <p className="text-gray-600 mt-1">Детальная финансовая отчетность по холдингу</p>
          {financialData?.period && (
            <p className="text-sm text-gray-500 mt-1">
              Период: {formatDate(financialData.period.start_date)} - {formatDate(financialData.period.end_date)} 
              ({financialData.period.days_count} дней)
            </p>
          )}
        </div>
        
        <button
          onClick={loadFinancialReport}
          disabled={loading || !startDate || !endDate}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.primary} text-white hover:opacity-90 disabled:opacity-50`}
        >
          {loading ? 'Загрузка...' : 'Создать отчет'}
        </button>
      </div>

      {renderPeriodSelector()}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Генерация финансового отчета...</p>
        </div>
      )}

      {financialData && (
        <>
          {renderConsolidatedFinancials()}
          {renderOrganizationBreakdown()}
          {renderMonthlyDynamics()}
          {renderExpenseCategories()}
        </>
      )}
    </div>
  );
};

export default FinancialReport;
