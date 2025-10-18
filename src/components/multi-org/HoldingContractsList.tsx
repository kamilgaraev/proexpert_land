import { useState, useCallback, useEffect } from 'react';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import { useHoldingFilters } from '@/hooks/useHoldingFilters';
import { HoldingFiltersPanel } from './HoldingFiltersPanel';
import type { ContractWithOrganization, PaginatedData, HoldingFilters } from '@/types/multi-organization-v2';
import { 
  DocumentTextIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import { getErrorMessage } from '@/utils/multiOrgErrorHandler';

export const HoldingContractsList = () => {
  const [data, setData] = useState<PaginatedData<ContractWithOrganization> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HoldingFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  const {
    options,
    selectedOrgIds,
    setSelectedOrgIds,
  } = useHoldingFilters();

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getContracts(filters, currentPage, 50);
      setData(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleFiltersChange = (newFilters: Partial<HoldingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleOrgIdsChange = (ids: number[]) => {
    setSelectedOrgIds(ids);
    setFilters(prev => ({ ...prev, organization_ids: ids.length > 0 ? ids : undefined }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedOrgIds([]);
    setFilters({});
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && !data) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Контракты холдинга</h1>
          <p className="text-sm text-gray-500 mt-1">
            Все контракты дочерних организаций
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FunnelIcon className="w-5 h-5" />
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {showFilters && (
          <div className="lg:col-span-1">
            <HoldingFiltersPanel
              options={options}
              selectedOrgIds={selectedOrgIds}
              onOrgIdsChange={handleOrgIdsChange}
              onFiltersChange={handleFiltersChange}
              onReset={handleReset}
              currentFilters={filters}
            />
          </div>
        )}

        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchContracts}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Повторить попытку
              </button>
            </div>
          )}

          {data && data.data.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Контракты не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Номер контракта
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Организация
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Подрядчик
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Проект
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Сумма
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Дата создания
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.data.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {contract.number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {contract.organization.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.contractor?.name || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {contract.project?.name || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(contract.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contract.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data && data.last_page > 1 && (
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Показано <span className="font-medium">{data.data.length}</span> из{' '}
                      <span className="font-medium">{data.total}</span> контрактов
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-700">
                        Страница {currentPage} из {data.last_page}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(data.last_page, prev + 1))}
                        disabled={currentPage === data.last_page}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

