import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetailedContractsReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import { 
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const HoldingDetailedContractsReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  
  const {
    detailedContractsReport,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    loadReport,
    exportReport,
    formatDate
  } = useDetailedContractsReport();

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

  const handleExport = async (format: 'excel' | 'csv' | 'xlsx') => {
    await exportReport(format);
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    loadReport({ ...filters, page: newPage });
  };

  const formatCurrencyDetailed = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0,00 ₽';
    }
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentDetailed = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0,000%';
    }
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(value / 100);
  };

  const totalPages = detailedContractsReport?.total_rows 
    ? Math.ceil(detailedContractsReport.total_rows / (filters.per_page || 50))
    : 1;

  return (
    <div className="min-h-screen bg-steel-50">
      <SEOHead 
        title="Детальный отчет по контрактам - ProHelper"
        description="Детальный отчет по контрактам холдинга"
      />
      <PageHeader 
        title="Детальный отчет по контрактам"
        subtitle="Подробная информация по каждому контракту с финансовыми показателями"
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
            {detailedContractsReport?.holding && (
              <p className="text-steel-700 font-medium">{detailedContractsReport.holding.name}</p>
            )}
            {detailedContractsReport?.period && (
              <p className="text-sm text-steel-600 mt-1">
                Период: {detailedContractsReport.period.from || 'Не указан'} 
                {detailedContractsReport.period.to && ` - ${detailedContractsReport.period.to}`}
              </p>
            )}
            {detailedContractsReport?.total_rows !== undefined && (
              <p className="text-sm text-steel-600 mt-1">
                Всего записей: {detailedContractsReport.total_rows}
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

            <div className="relative">
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Экспорт
              </button>
            </div>
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
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
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
                <label className="block text-sm font-medium text-steel-700 mb-2">Категория работ</label>
                <select
                  value={filters.work_type_category || ''}
                  onChange={(e) => handleFilterChange('work_type_category', e.target.value || undefined)}
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                >
                  <option value="">Все категории</option>
                  <option value="smr">СМР</option>
                  <option value="поставка">Поставка</option>
                  <option value="прочие">Прочие</option>
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

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Максимальная сумма</label>
                <input
                  type="number"
                  value={filters.max_amount || ''}
                  onChange={(e) => handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Записей на странице</label>
                <select
                  value={filters.per_page || 50}
                  onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-700 mb-2">Сортировка</label>
                <select
                  value={filters.sort_direction || 'desc'}
                  onChange={(e) => handleFilterChange('sort_direction', e.target.value as 'asc' | 'desc')}
                  className="w-full border border-steel-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-steel-500 focus:border-transparent"
                >
                  <option value="desc">По убыванию</option>
                  <option value="asc">По возрастанию</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.include_child_contracts === true}
                  onChange={(e) => handleFilterChange('include_child_contracts', e.target.checked ? true : undefined)}
                  className="rounded border-steel-300 text-steel-700 focus:ring-steel-500"
                />
                <span className="text-sm font-medium text-steel-700">Включать дочерние контракты</span>
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && !detailedContractsReport && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-steel-700"></div>
            <p className="text-steel-600 mt-2">Генерация детального отчета по контрактам...</p>
          </div>
        )}

        {detailedContractsReport && detailedContractsReport.data && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-steel-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead className="bg-steel-50 border-b border-steel-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs sticky left-0 bg-steel-50 z-10">Дата реестра</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Дата оплаты/выполнения</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Месяц</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Год</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Организация</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Подрядчик</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Договор</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">ДС/СП</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Наименование работ</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Категория</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Условие оплаты</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Сумма по договору</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">% ГП</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Сумма ГП</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Гарантийное удержание</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Сумма к оплате</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Аванс оплаченный</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Оплата за факт</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Оплата 10%</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">ИТОГО оплачено</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Остаток к оплате</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Выполнение, факт</th>
                      <th className="text-right py-3 px-4 font-medium text-steel-700 text-xs">Остаток выполнения</th>
                      <th className="text-left py-3 px-4 font-medium text-steel-700 text-xs">Примечание</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-100">
                    {detailedContractsReport.data.map((row, index) => (
                      <tr key={index} className="hover:bg-steel-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-steel-900 sticky left-0 bg-white z-10">{row.date_registry || '-'}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.date_payment_performance || '-'}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.month || '-'}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.year || '-'}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.organization_name}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.contractor_name}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.contract_number_date}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.agreement_specification_number || '-'}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 max-w-xs truncate" title={row.subject}>{row.subject}</td>
                        <td className="py-3 px-4 text-sm text-steel-900">{row.work_type_category}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 max-w-xs truncate" title={row.payment_terms}>{row.payment_terms || '-'}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.contract_amount)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatPercentDetailed(row.gp_percentage)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.gp_amount)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.warranty_retention_reference)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right font-medium">{formatCurrencyDetailed(row.amount_to_pay)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.advance_paid)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.fact_payment_paid)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.deferred_payment_paid)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right font-medium">{formatCurrencyDetailed(row.total_paid)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.remaining_to_pay)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.performed_amount)}</td>
                        <td className="py-3 px-4 text-sm text-steel-900 text-right">{formatCurrencyDetailed(row.remaining_to_perform)}</td>
                        <td className="py-3 px-4 text-sm text-steel-600 max-w-xs truncate" title={row.notes || ''}>{row.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-steel-200 bg-steel-50">
                  <div className="text-sm text-steel-600">
                    Показано {detailedContractsReport.data.length} из {detailedContractsReport.total_rows} записей
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={(filters.page || 1) === 1}
                      className="px-3 py-2 border border-steel-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    
                    <span className="text-sm text-steel-700">
                      Страница {filters.page || 1} из {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={(filters.page || 1) >= totalPages}
                      className="px-3 py-2 border border-steel-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {detailedContractsReport && (
          <div className="text-center text-sm text-steel-500">
            Последнее обновление: {formatDate(detailedContractsReport.generated_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingDetailedContractsReportPage;

