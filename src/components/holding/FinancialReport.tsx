import React, { useEffect, useState } from 'react';
import { useContractsReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useTheme } from '@components/shared/ThemeProvider';
import { 
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const FinancialReport: React.FC = () => {
  const { can } = usePermissionsContext();
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  
  const {
    contractsReport,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useContractsReport();

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

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    loadReport({ ...filters, page: newPage });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      terminated: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
    };

    const statusNames: Record<string, string> = {
      draft: 'Черновик',
      active: 'Активный',
      completed: 'Завершен',
      terminated: 'Расторгнут',
      suspended: 'Приостановлен',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusNames[status] || status}
      </span>
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчет по контрактам холдинга</h1>
          {contractsReport?.holding && (
            <p className="text-gray-600 mt-1">{contractsReport.holding.name}</p>
          )}
          {contractsReport?.period && (
            <p className="text-sm text-gray-500 mt-1">
              Период: {contractsReport.period.from ? formatDate(contractsReport.period.from) : 'Не указан'} 
              {contractsReport.period.to && ` - ${formatDate(contractsReport.period.to)}`}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>

          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.primary} text-white hover:opacity-90 disabled:opacity-50`}
          >
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Экспорт
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
          <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата от</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата до</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="active">Активный</option>
                <option value="completed">Завершен</option>
                <option value="terminated">Расторгнут</option>
                <option value="suspended">Приостановлен</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Минимальная сумма</label>
              <input
                type="number"
                value={filters.min_amount || ''}
                onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && !contractsReport && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 mt-2">Генерация отчета по контрактам...</p>
        </div>
      )}

      {contractsReport?.summary && (
        <>
          <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
            <h3 className="text-lg font-semibold mb-6">Общая сводка</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Всего контрактов</p>
                <p className="text-2xl font-bold text-slate-700">{contractsReport.summary.total_contracts}</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-2">Общая сумма</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(contractsReport.summary.total_amount)}</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-2">Оплачено</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(contractsReport.summary.total_paid)}</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-2">Остаток</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(contractsReport.summary.remaining_amount)}</p>
              </div>
              
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-600 mb-2">% Выполнения</p>
                <p className="text-2xl font-bold text-indigo-700">{formatPercent(contractsReport.summary.completion_percentage)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-600 mb-2">ГП сумма</p>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(contractsReport.summary.total_gp_amount)}</p>
              </div>

              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-cyan-600 mb-2">Акты утверждены</p>
                <p className="text-xl font-bold text-cyan-700">{formatCurrency(contractsReport.summary.total_acts_approved)}</p>
              </div>

              <div className="text-center p-4 bg-rose-50 rounded-lg">
                <p className="text-sm text-rose-600 mb-2">% Оплаты</p>
                <p className="text-xl font-bold text-rose-700">{formatPercent(contractsReport.summary.payment_percentage)}</p>
              </div>
            </div>
          </div>

          {contractsReport.summary.by_status && contractsReport.summary.by_status.length > 0 && (
            <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-6">Контракты по статусам</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractsReport.summary.by_status.map((statusItem) => (
                  <div key={statusItem.status} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      {getStatusBadge(statusItem.status)}
                      <span className="text-2xl font-bold text-gray-900">{statusItem.count}</span>
                    </div>
                    <p className="text-sm text-gray-600">Сумма: {formatCurrency(statusItem.total_amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contractsReport.by_organization && contractsReport.by_organization.length > 0 && (
            <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-6">Разбивка по организациям</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Организация</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Контрактов</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Сумма</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Оплачено</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Остаток</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">% Выполнения</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractsReport.by_organization.map((org) => (
                      <tr key={org.organization_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{org.organization_name}</div>
                              <div className="text-sm text-gray-500">ID: {org.organization_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">{org.contracts_count}</td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {formatCurrency(org.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-blue-600">
                          {formatCurrency(org.total_paid)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-purple-600">
                          {formatCurrency(org.remaining_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-indigo-600">
                          {formatPercent(org.completion_percentage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {contractsReport.by_contractor && contractsReport.by_contractor.data && contractsReport.by_contractor.data.length > 0 && (
            <div className={`bg-white rounded-xl p-6 border ${theme.border} shadow-sm`}>
              <h3 className="text-lg font-semibold mb-6">Подрядчики</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Подрядчик</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Контакты</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Контрактов</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Сумма</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Оплачено</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">% Выполнения</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Организации</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractsReport.by_contractor.data.map((contractor) => (
                      <tr key={contractor.contractor_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{contractor.contractor_name}</div>
                              <div className="text-xs text-gray-500">{contractor.contractor_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{contractor.contact_person}</div>
                            <div className="text-gray-500">{contractor.phone}</div>
                            <div className="text-gray-500">{contractor.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">{contractor.contracts_count}</td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {formatCurrency(contractor.total_amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-blue-600">
                          {formatCurrency(contractor.total_paid)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-indigo-600">
                          {formatPercent(contractor.completion_percentage)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={contractor.organizations}>
                            {contractor.organizations}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {contractsReport.by_contractor.pagination && contractsReport.by_contractor.pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Показано {contractsReport.by_contractor.data.length} из {contractsReport.by_contractor.pagination.total} подрядчиков
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(contractsReport.by_contractor.pagination.current_page - 1)}
                      disabled={contractsReport.by_contractor.pagination.current_page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      Страница {contractsReport.by_contractor.pagination.current_page} из {contractsReport.by_contractor.pagination.last_page}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(contractsReport.by_contractor.pagination.current_page + 1)}
                      disabled={contractsReport.by_contractor.pagination.current_page === contractsReport.by_contractor.pagination.last_page}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {contractsReport && (
        <div className="text-center text-sm text-gray-500">
          Последнее обновление: {formatDate(contractsReport.generated_at)}
        </div>
      )}
    </div>
  );
};

export default FinancialReport;
