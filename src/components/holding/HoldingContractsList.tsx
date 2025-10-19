import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useHoldingContracts } from '@/hooks/useHoldingContracts';
import { HoldingContractCard } from './HoldingContractCard';
import { PageHeader } from './shared/PageHeader';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { motion } from 'framer-motion';

export const HoldingContractsList = () => {
  const navigate = useNavigate();
  const { contracts, loading, error, pagination, fetchContracts } = useHoldingContracts();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    status?: string;
    search?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('HoldingContractsList: Fetching contracts...', { currentPage, status: filters.status });
    const apiFilters: any = {};
    if (filters.status) {
      apiFilters.status = filters.status;
    }
    fetchContracts(apiFilters, currentPage, 25);
  }, [currentPage, filters.status, fetchContracts]);

  const handleContractClick = (contract: any) => {
    navigate(`/projects/contracts/${contract.id}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        contract.number.toLowerCase().includes(search) ||
        contract.subject.toLowerCase().includes(search) ||
        contract.contractor.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="Контракты холдинга"
        subtitle={
          pagination
            ? `Всего контрактов: ${pagination.total} | Страница ${pagination.current_page} из ${pagination.last_page}`
            : 'Загрузка...'
        }
        icon={<DocumentTextIcon className="w-7 h-7" />}
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            <FunnelIcon className="w-5 h-5" />
            Фильтры
          </button>
        }
      />

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск по номеру/предмету/подрядчику
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="active">Активный</option>
                <option value="suspended">Приостановлен</option>
                <option value="completed">Завершен</option>
                <option value="terminated">Расторгнут</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({});
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner message="Загрузка контрактов..." />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
          <p className="font-medium text-lg mb-2">Ошибка загрузки контрактов</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filteredContracts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Контракты не найдены</p>
          <p className="text-gray-500 text-sm mt-2">Попробуйте изменить параметры фильтрации</p>
        </div>
      )}

      {!loading && !error && filteredContracts.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {filteredContracts.map((contract, index) => (
              <HoldingContractCard
                key={contract.id}
                contract={contract}
                onClick={handleContractClick}
                index={index}
              />
            ))}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Назад
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.last_page - 2) {
                    pageNum = pagination.last_page - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HoldingContractsList;

