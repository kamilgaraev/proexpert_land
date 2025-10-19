import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContractsReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import { 
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const HoldingContractsReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  
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
    if (!can('multi-organization.reports.financial')) {
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

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    loadReport({ ...filters, page: newPage });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-steel-100 text-steel-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      terminated: 'bg-red-100 text-red-700',
      suspended: 'bg-amber-100 text-amber-700',
    };

    const statusNames: Record<string, string> = {
      draft: 'Черновик',
      active: 'Активный',
      completed: 'Завершен',
      terminated: 'Расторгнут',
      suspended: 'Приостановлен',
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
        title="Отчет по контрактам - ProHelper"
        description="Отчет по контрактам холдинга"
      />
      <PageHeader 
        title="Отчет по контрактам"
        subtitle="Детальная информация по контрактам и подрядчикам"
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
            {contractsReport?.holding && (
              <p className="text-steel-700 font-medium">{contractsReport.holding.name}</p>
            )}
            {contractsReport?.period && (
              <p className="text-sm text-steel-600 mt-1">
                Период: {contractsReport.period.from ? formatDate(contractsReport.period.from) : 'Не указан'} 
                {contractsReport.period.to && ` - ${formatDate(contractsReport.period.to)}`}
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
              onClick={handleApplyFilters}
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
                  <option value="draft">Черновик</option>
                  <option value="active">Активный</option>
                  <option value="completed">Завершен</option>
                  <option value="terminated">Расторгнут</option>
                  <option value="suspended">Приостановлен</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Минимальная сумма</label>
                <input
                  type="number"
                  value={filters.min_amount || ''}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-steel-700"></div>
            <p className="text-steel-600 mt-2">Генерация отчета по контрактам...</p>
          </div>
        )}

        {contractsReport?.summary && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
              <h3 className="text-lg font-semibold text-steel-900 mb-6">Общая сводка</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Всего контрактов</p>
                  <p className="text-2xl font-bold text-steel-900">{contractsReport.summary.total_contracts}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Общая сумма</p>
                  <p className="text-xl font-bold text-steel-900">{formatCurrency(contractsReport.summary.total_amount)}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Оплачено</p>
                  <p className="text-xl font-bold text-steel-900">{formatCurrency(contractsReport.summary.total_paid)}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Остаток</p>
                  <p className="text-xl font-bold text-steel-900">{formatCurrency(contractsReport.summary.remaining_amount)}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">% Выполнения</p>
                  <p className="text-xl font-bold text-steel-900">{formatPercent(contractsReport.summary.completion_percentage)}</p>
                </div>
              </div>
            </div>

            {contractsReport.summary.by_status && contractsReport.summary.by_status.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
                <h3 className="text-lg font-semibold text-steel-900 mb-6">Контракты по статусам</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contractsReport.summary.by_status.map((statusItem) => (
                    <div key={statusItem.status} className="border border-steel-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        {getStatusBadge(statusItem.status)}
                        <span className="text-2xl font-bold text-steel-900">{statusItem.count}</span>
                      </div>
                      <p className="text-sm text-steel-600">Сумма: <span className="font-medium text-steel-900">{formatCurrency(statusItem.total_amount)}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contractsReport.by_organization && contractsReport.by_organization.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-steel-200 overflow-hidden">
                <div className="bg-steel-50 px-6 py-4 border-b border-steel-200">
                  <h3 className="text-lg font-semibold text-steel-900">Разбивка по организациям</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-steel-50 border-b border-steel-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-steel-700">Организация</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Контрактов</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Сумма</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Оплачено</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Остаток</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">% Выполнения</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100">
                      {contractsReport.by_organization.map((org) => (
                        <tr key={org.organization_id} className="hover:bg-steel-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-steel-700 p-2 rounded-lg">
                                <BuildingOfficeIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-steel-900">{org.organization_name}</div>
                                <div className="text-sm text-steel-500">ID: {org.organization_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">{org.contracts_count}</td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
                            {formatCurrency(org.total_amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
                            {formatCurrency(org.total_paid)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
                            {formatCurrency(org.remaining_amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
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
              <div className="bg-white rounded-xl shadow-lg border border-steel-200 overflow-hidden">
                <div className="bg-steel-50 px-6 py-4 border-b border-steel-200">
                  <h3 className="text-lg font-semibold text-steel-900">Подрядчики</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-steel-50 border-b border-steel-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-steel-700">Подрядчик</th>
                        <th className="text-left py-3 px-4 font-medium text-steel-700">Контакты</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Контрактов</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Сумма</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">Оплачено</th>
                        <th className="text-right py-3 px-4 font-medium text-steel-700">% Выполнения</th>
                        <th className="text-left py-3 px-4 font-medium text-steel-700">Организации</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100">
                      {contractsReport.by_contractor.data.map((contractor) => (
                        <tr key={contractor.contractor_id} className="hover:bg-steel-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-steel-700 p-2 rounded-lg">
                                <UserGroupIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-steel-900">{contractor.contractor_name}</div>
                                <div className="text-xs text-steel-500">{contractor.contractor_type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="text-steel-900">{contractor.contact_person}</div>
                              <div className="text-steel-500">{contractor.phone}</div>
                              <div className="text-steel-500">{contractor.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">{contractor.contracts_count}</td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
                            {formatCurrency(contractor.total_amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
                            {formatCurrency(contractor.total_paid)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-steel-900">
                            {formatPercent(contractor.completion_percentage)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-steel-600 max-w-xs truncate" title={contractor.organizations}>
                              {contractor.organizations}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {contractsReport.by_contractor.pagination && contractsReport.by_contractor.pagination.last_page > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-steel-200 bg-steel-50">
                    <div className="text-sm text-steel-600">
                      Показано {contractsReport.by_contractor.data.length} из {contractsReport.by_contractor.pagination.total} подрядчиков
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(contractsReport.by_contractor.pagination.current_page - 1)}
                        disabled={contractsReport.by_contractor.pagination.current_page === 1}
                        className="px-3 py-2 border border-steel-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      
                      <span className="text-sm text-steel-700">
                        Страница {contractsReport.by_contractor.pagination.current_page} из {contractsReport.by_contractor.pagination.last_page}
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(contractsReport.by_contractor.pagination.current_page + 1)}
                        disabled={contractsReport.by_contractor.pagination.current_page === contractsReport.by_contractor.pagination.last_page}
                        className="px-3 py-2 border border-steel-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
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
          <div className="text-center text-sm text-steel-500">
            Последнее обновление: {formatDate(contractsReport.generated_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingContractsReportPage;

