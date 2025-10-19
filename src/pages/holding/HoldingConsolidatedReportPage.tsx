import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsolidatedReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import { 
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

const HoldingConsolidatedReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  
  const {
    consolidatedReport,
    loading,
    error,
    filters,
    updateFilters,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useConsolidatedReport();

  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState<Record<number, boolean>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});
  const [expandedContracts, setExpandedContracts] = useState<Record<number, boolean>>({});

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

  const handleExport = async (format: 'excel' | 'csv') => {
    await exportReport(format);
  };

  const toggleOrg = (orgId: number) => {
    setExpandedOrgs(prev => ({ ...prev, [orgId]: !prev[orgId] }));
  };

  const toggleProject = (projectId: number) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const toggleContract = (contractId: number) => {
    setExpandedContracts(prev => ({ ...prev, [contractId]: !prev[contractId] }));
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      planning: 'bg-steel-100 text-steel-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
    };

    const statusNames: Record<string, string> = {
      planning: 'Планирование',
      active: 'Активный',
      completed: 'Завершен',
      on_hold: 'Приостановлен',
      cancelled: 'Отменен',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || 'bg-steel-100 text-steel-700'}`}>
        {statusNames[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-steel-50">
      <SEOHead 
        title="Консолидированный отчет холдинга - ProHelper"
        description="Полный консолидированный отчет холдинга со всеми данными"
      />
      <PageHeader 
        title="Консолидированный отчет"
        subtitle="Максимально детальный отчет со всеми данными холдинга"
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
            {consolidatedReport?.holding && (
              <p className="text-steel-700 font-medium">{consolidatedReport.holding.name}</p>
            )}
            {consolidatedReport?.period && (
              <p className="text-sm text-steel-600 mt-1">
                Период: {consolidatedReport.period.from ? formatDate(consolidatedReport.period.from) : 'Не указан'} 
                {consolidatedReport.period.to && ` - ${formatDate(consolidatedReport.period.to)}`}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="planning">Планирование</option>
                  <option value="active">Активный</option>
                  <option value="completed">Завершен</option>
                  <option value="on_hold">Приостановлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.is_holding_member === true}
                  onChange={(e) => handleFilterChange('is_holding_member', e.target.checked ? true : undefined)}
                  className="rounded border-steel-300 text-steel-700 focus:ring-steel-500"
                />
                <span className="text-sm font-medium text-steel-700">Показать только внутренние контракты (подрядчики из холдинга)</span>
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && !consolidatedReport && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-steel-700"></div>
            <p className="text-steel-600 mt-2">Генерация отчета...</p>
          </div>
        )}

        {consolidatedReport?.summary && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
              <h3 className="text-lg font-semibold text-steel-900 mb-6">Общая сводка</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-steel-600" />
                  <p className="text-2xl font-bold text-steel-900">{consolidatedReport.summary.total_organizations}</p>
                  <p className="text-sm text-steel-600">Организаций</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <BriefcaseIcon className="w-8 h-8 mx-auto mb-2 text-steel-600" />
                  <p className="text-2xl font-bold text-steel-900">{consolidatedReport.summary.total_projects}</p>
                  <p className="text-sm text-steel-600">Проектов</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-steel-600" />
                  <p className="text-2xl font-bold text-steel-900">{consolidatedReport.summary.total_contracts}</p>
                  <p className="text-sm text-steel-600">Контрактов</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <WrenchScrewdriverIcon className="w-8 h-8 mx-auto mb-2 text-steel-600" />
                  <p className="text-2xl font-bold text-steel-900">{consolidatedReport.summary.total_contractors}</p>
                  <p className="text-sm text-steel-600">Подрядчиков</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-steel-200 rounded-lg">
                  <h4 className="font-semibold text-steel-900 mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5" />
                    Финансы
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-steel-600">Общая сумма:</span>
                      <span className="font-medium">{formatCurrency(consolidatedReport.summary.financial.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Оплачено:</span>
                      <span className="font-medium text-green-600">{formatCurrency(consolidatedReport.summary.financial.total_paid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">По актам:</span>
                      <span className="font-medium">{formatCurrency(consolidatedReport.summary.financial.total_acts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Остаток:</span>
                      <span className="font-medium">{formatCurrency(consolidatedReport.summary.financial.remaining)}</span>
                    </div>
                    <div className="pt-2 border-t border-steel-200">
                      <div className="flex justify-between">
                        <span className="text-steel-600">Выполнение:</span>
                        <span className="font-bold">{formatPercent(consolidatedReport.summary.financial.completion_percentage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-steel-600">Оплата:</span>
                        <span className="font-bold">{formatPercent(consolidatedReport.summary.financial.payment_percentage)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-steel-200 rounded-lg">
                  <h4 className="font-semibold text-steel-900 mb-3 flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                    Детали
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-steel-600">Платежей:</span>
                      <span className="font-medium">{consolidatedReport.summary.details.total_payments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Актов:</span>
                      <span className="font-medium">{consolidatedReport.summary.details.total_acts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Работ выполнено:</span>
                      <span className="font-medium">{consolidatedReport.summary.details.total_completed_works}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Доп. соглашений:</span>
                      <span className="font-medium">{consolidatedReport.summary.details.total_agreements}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Спецификаций:</span>
                      <span className="font-medium">{consolidatedReport.summary.details.total_specifications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Субконтрактов:</span>
                      <span className="font-medium">{consolidatedReport.summary.details.total_child_contracts}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-steel-200 rounded-lg">
                  <h4 className="font-semibold text-steel-900 mb-3 flex items-center gap-2">
                    <ArchiveBoxIcon className="w-5 h-5" />
                    Материалы
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-steel-600">Поступлений:</span>
                      <span className="font-medium">{consolidatedReport.summary.materials.total_receipts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">На сумму:</span>
                      <span className="font-medium">{formatCurrency(consolidatedReport.summary.materials.receipts_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Списаний:</span>
                      <span className="font-medium">{consolidatedReport.summary.materials.total_write_offs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {consolidatedReport.data && consolidatedReport.data.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-steel-900">Организации и проекты</h3>
                
                {consolidatedReport.data.map((org) => (
                  <div key={org.organization_id} className="bg-white rounded-xl shadow-lg border border-steel-200 overflow-hidden">
                    <div 
                      className="p-5 cursor-pointer hover:bg-steel-50 transition-colors border-b border-steel-200"
                      onClick={() => toggleOrg(org.organization_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BuildingOfficeIcon className="w-6 h-6 text-steel-600" />
                          <div>
                            <h4 className="text-lg font-semibold text-steel-900">{org.organization_name}</h4>
                            <p className="text-sm text-steel-600">
                              {org.organization_type === 'holding' ? 'Головная организация' : 'Дочерняя организация'} • 
                              Проектов: {org.projects_count}
                            </p>
                          </div>
                        </div>
                        
                        <button className="p-2 hover:bg-steel-100 rounded-lg transition-colors">
                          {expandedOrgs[org.organization_id] ? (
                            <ChevronUpIcon className="w-5 h-5 text-steel-600" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-steel-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedOrgs[org.organization_id] && org.projects.length > 0 && (
                      <div className="p-5 bg-steel-50 space-y-3">
                        {org.projects.map((project) => (
                          <div key={project.project_id} className="bg-white rounded-lg border border-steel-200 overflow-hidden">
                            <div 
                              className="p-4 cursor-pointer hover:bg-steel-50 transition-colors"
                              onClick={() => toggleProject(project.project_id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-semibold text-steel-900">{project.project_name}</h5>
                                    {getStatusBadge(project.project_status)}
                                  </div>
                                  <p className="text-sm text-steel-600">{project.project_address}</p>
                                  <div className="flex gap-4 mt-2 text-sm text-steel-600">
                                    <span>Бюджет: {formatCurrency(project.project_budget)}</span>
                                    <span>Контрактов: {project.contracts_count}</span>
                                  </div>
                                </div>
                                
                                <button className="ml-4 p-2 hover:bg-steel-100 rounded-lg transition-colors">
                                  {expandedProjects[project.project_id] ? (
                                    <ChevronUpIcon className="w-5 h-5 text-steel-600" />
                                  ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-steel-600" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {expandedProjects[project.project_id] && (
                              <div className="p-4 bg-steel-50 border-t border-steel-200 space-y-3">
                                {project.contracts && project.contracts.length > 0 && (
                                  <div className="space-y-2">
                                    <h6 className="font-medium text-steel-900 text-sm">Контракты</h6>
                                    {project.contracts.map((contract) => (
                                      <div key={contract.contract_id} className="bg-white rounded-lg border border-steel-200">
                                        <div 
                                          className="p-3 cursor-pointer hover:bg-steel-50 transition-colors"
                                          onClick={() => toggleContract(contract.contract_id)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-medium text-steel-900">{contract.contract_number}</span>
                                                {getStatusBadge(contract.contract_status)}
                                                {contract.contractor?.is_holding_member && (
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                    🏢 Внутренний
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-sm text-steel-600">
                                                {contract.contractor?.name || 'Подрядчик не указан'}
                                                {contract.contractor?.organization_name && (
                                                  <span className="text-steel-500"> ({contract.contractor.organization_name})</span>
                                                )}
                                              </p>
                                              <div className="flex gap-4 mt-1 text-xs text-steel-600">
                                                <span>Сумма: {formatCurrency(contract.financial.total_amount)}</span>
                                                <span>Выполнение: {formatPercent(contract.financial.completion_percentage)}</span>
                                              </div>
                                            </div>
                                            
                                            <button className="ml-4 p-1 hover:bg-steel-100 rounded">
                                              {expandedContracts[contract.contract_id] ? (
                                                <ChevronUpIcon className="w-4 h-4 text-steel-600" />
                                              ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-steel-600" />
                                              )}
                                            </button>
                                          </div>
                                        </div>

                                        {expandedContracts[contract.contract_id] && (
                                          <div className="p-3 bg-steel-50 border-t border-steel-200 space-y-3 text-sm">
                                            <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                <p className="text-steel-600 mb-1">Финансы</p>
                                                <div className="space-y-1 text-xs">
                                                  <div className="flex justify-between">
                                                    <span>Оплачено:</span>
                                                    <span className="font-medium">{formatCurrency(contract.financial.total_paid)}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>По актам:</span>
                                                    <span className="font-medium">{formatCurrency(contract.financial.total_acts)}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>Остаток:</span>
                                                    <span className="font-medium">{formatCurrency(contract.financial.remaining)}</span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div>
                                                <p className="text-steel-600 mb-1">Количество</p>
                                                <div className="space-y-1 text-xs">
                                                  <div className="flex justify-between">
                                                    <span>Платежей:</span>
                                                    <span className="font-medium">{contract.payments_count}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>Актов:</span>
                                                    <span className="font-medium">{contract.acts_count}</span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span>Работ:</span>
                                                    <span className="font-medium">{contract.works_count}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {project.materials_summary && project.materials_summary.receipts_count > 0 && (
                                  <div className="bg-white rounded-lg border border-steel-200 p-3">
                                    <h6 className="font-medium text-steel-900 text-sm mb-2">Материалы</h6>
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                      <div>
                                        <span className="text-steel-600">Поступлений:</span>
                                        <p className="font-medium">{project.materials_summary.receipts_count}</p>
                                      </div>
                                      <div>
                                        <span className="text-steel-600">На сумму:</span>
                                        <p className="font-medium">{formatCurrency(project.materials_summary.receipts_total)}</p>
                                      </div>
                                      <div>
                                        <span className="text-steel-600">Списаний:</span>
                                        <p className="font-medium">{project.materials_summary.write_offs_count}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {consolidatedReport && (
          <div className="text-center text-sm text-steel-500">
            Последнее обновление: {formatDate(consolidatedReport.generated_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingConsolidatedReportPage;

