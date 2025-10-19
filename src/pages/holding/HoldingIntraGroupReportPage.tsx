import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntraGroupReport } from '@/hooks/useHoldingReports';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { SEOHead } from '@components/shared/SEOHead';
import { PageHeader } from '@components/holding/shared';
import { 
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

const HoldingIntraGroupReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissionsContext();
  
  const {
    intraGroupReport,
    loading,
    error,
    filters,
    updateFilters,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useIntraGroupReport();

  const [showFilters, setShowFilters] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});

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

  const toggleProject = (projectId: number) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
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
      planning: 'В планировании',
      active: 'Активный',
      completed: 'Завершен',
      on_hold: 'Приостановлен',
      cancelled: 'Отменен',
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
        title="Отчет по внутригрупповым проектам - ProHelper"
        description="Отчет по внутригрупповым проектам холдинга"
      />
      <PageHeader 
        title="Внутригрупповые проекты"
        subtitle="Иерархия проектов с анализом маржинальности дочерних компаний"
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
            {intraGroupReport?.holding && (
              <p className="text-steel-700 font-medium">{intraGroupReport.holding.name}</p>
            )}
            {intraGroupReport?.period && (
              <p className="text-sm text-steel-600 mt-1">
                Период: {intraGroupReport.period.from ? formatDate(intraGroupReport.period.from) : 'Не указан'} 
                {intraGroupReport.period.to && ` - ${formatDate(intraGroupReport.period.to)}`}
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
                  <option value="planning">В планировании</option>
                  <option value="active">Активный</option>
                  <option value="completed">Завершен</option>
                  <option value="on_hold">Приостановлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && !intraGroupReport && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-steel-700"></div>
            <p className="text-steel-600 mt-2">Генерация отчета...</p>
          </div>
        )}

        {intraGroupReport?.summary && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-steel-200 p-6">
              <h3 className="text-lg font-semibold text-steel-900 mb-6">Общая сводка</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Всего проектов</p>
                  <p className="text-2xl font-bold text-steel-900">{intraGroupReport.summary.total_projects}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Общая маржа</p>
                  <p className="text-xl font-bold text-steel-900">{formatCurrency(intraGroupReport.summary.financial_analysis.total_margin)}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Средняя маржа</p>
                  <p className="text-xl font-bold text-steel-900">{formatPercent(intraGroupReport.summary.financial_analysis.average_margin_percentage)}</p>
                </div>
                
                <div className="text-center p-4 bg-steel-50 rounded-lg">
                  <p className="text-sm text-steel-600 mb-2">Эффективность</p>
                  <p className="text-xl font-bold text-steel-900">{formatPercent(intraGroupReport.summary.financial_analysis.internal_efficiency)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 border border-steel-200 rounded-lg">
                  <h4 className="font-semibold text-steel-900 mb-3">Головная организация</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-steel-600">Контрактов:</span>
                      <span className="font-medium text-steel-900">{intraGroupReport.summary.head_organization.contracts_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Сумма:</span>
                      <span className="font-medium text-steel-900">{formatCurrency(intraGroupReport.summary.head_organization.contracts_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Оплачено:</span>
                      <span className="font-medium text-steel-900">{formatCurrency(intraGroupReport.summary.head_organization.contracts_paid)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-steel-200 rounded-lg">
                  <h4 className="font-semibold text-steel-900 mb-3">Дочерние организации</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-steel-600">Уникальных:</span>
                      <span className="font-medium text-steel-900">{intraGroupReport.summary.child_organizations.unique_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Субконтрактов:</span>
                      <span className="font-medium text-steel-900">{intraGroupReport.summary.child_organizations.subcontracts_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-steel-600">Сумма субподряда:</span>
                      <span className="font-medium text-steel-900">{formatCurrency(intraGroupReport.summary.child_organizations.subcontracts_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {intraGroupReport.projects && intraGroupReport.projects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-steel-900">Проекты</h3>
                
                {intraGroupReport.projects.map((project) => (
                  <div key={project.project_id} className="bg-white rounded-xl shadow-lg border border-steel-200 overflow-hidden">
                    <div 
                      className="p-6 cursor-pointer hover:bg-steel-50 transition-colors"
                      onClick={() => toggleProject(project.project_id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-steel-900">{project.project_name}</h4>
                            {getStatusBadge(project.project_status)}
                          </div>
                          <p className="text-sm text-steel-600 mb-3">{project.project_address}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-steel-600">Бюджет проекта</p>
                              <p className="font-semibold text-steel-900">{formatCurrency(project.project_budget)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-steel-600">Входящие средства</p>
                              <p className="font-semibold text-steel-900">{formatCurrency(project.financial_flow.total_inflow)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-steel-600">Исходящие средства</p>
                              <p className="font-semibold text-steel-900">{formatCurrency(project.financial_flow.total_outflow)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-steel-600">Чистая маржа</p>
                              <p className="font-semibold text-green-600">{formatCurrency(project.financial_flow.net_margin)}</p>
                            </div>
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
                      <div className="border-t border-steel-200 bg-steel-50 p-6">
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-8 bg-steel-700 rounded"></div>
                            <h5 className="font-semibold text-steel-900">Головная организация</h5>
                          </div>
                          <div className="bg-white rounded-lg p-4 ml-3 border-l-2 border-steel-300">
                            <div className="flex items-center gap-3 mb-3">
                              <BuildingOfficeIcon className="w-5 h-5 text-steel-600" />
                              <span className="font-medium text-steel-900">{project.head_organization.name}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-steel-600">Контрактов</p>
                                <p className="font-semibold">{project.head_organization.contracts_count}</p>
                              </div>
                              <div>
                                <p className="text-steel-600">Сумма</p>
                                <p className="font-semibold">{formatCurrency(project.head_organization.contracts_amount)}</p>
                              </div>
                              <div>
                                <p className="text-steel-600">Оплачено</p>
                                <p className="font-semibold">{formatCurrency(project.head_organization.contracts_paid)}</p>
                              </div>
                              <div>
                                <p className="text-steel-600">Остаток</p>
                                <p className="font-semibold">{formatCurrency(project.head_organization.contracts_remaining)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {project.child_organizations && project.child_organizations.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-1 h-8 bg-blue-600 rounded"></div>
                              <h5 className="font-semibold text-steel-900">Дочерние организации (подрядчики)</h5>
                            </div>
                            
                            <div className="space-y-4 ml-3">
                              {project.child_organizations.map((child) => (
                                <div key={child.organization_id} className="bg-white rounded-lg p-4 border-l-2 border-blue-300">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                                      <div>
                                        <span className="font-medium text-steel-900">{child.organization_name}</span>
                                        <p className="text-xs text-steel-600">Контракт: {child.parent_contract_number}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-green-600">
                                        {formatPercent(child.margin_percentage)}
                                      </div>
                                      <div className="text-xs text-steel-600">маржа</div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                    <div>
                                      <p className="text-steel-600">Получено от головной</p>
                                      <p className="font-semibold text-steel-900">{formatCurrency(child.parent_contract_amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-steel-600">Субконтрактов</p>
                                      <p className="font-semibold text-steel-900">{child.subcontracts_count}</p>
                                    </div>
                                    <div>
                                      <p className="text-steel-600">Сумма субподряда</p>
                                      <p className="font-semibold text-steel-900">{formatCurrency(child.subcontracts_amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-steel-600">Маржа</p>
                                      <p className="font-semibold text-green-600">{formatCurrency(child.margin)}</p>
                                    </div>
                                  </div>

                                  {child.subcontracts && child.subcontracts.length > 0 && (
                                    <details className="mt-3">
                                      <summary className="cursor-pointer text-sm font-medium text-steel-700 hover:text-steel-900 flex items-center gap-2">
                                        <ChevronDownIcon className="w-4 h-4" />
                                        Субконтракты ({child.subcontracts.length})
                                      </summary>
                                      <div className="mt-3 space-y-2 ml-6">
                                        {child.subcontracts.map((sub) => (
                                          <div key={sub.id} className="flex items-center justify-between p-3 bg-steel-50 rounded-lg text-sm">
                                            <div>
                                              <p className="font-medium text-steel-900">{sub.contractor_name}</p>
                                              <p className="text-xs text-steel-600">{sub.number}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-semibold text-steel-900">{formatCurrency(sub.amount)}</p>
                                              <p className="text-xs text-steel-600">Оплачено: {formatCurrency(sub.paid)}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {intraGroupReport && (
          <div className="text-center text-sm text-steel-500">
            Последнее обновление: {formatDate(intraGroupReport.generated_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingIntraGroupReportPage;

