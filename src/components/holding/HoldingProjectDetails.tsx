import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  ChartBarIcon,
  BanknotesIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { useHoldingProjectDetails } from '@/hooks/useHoldingProjectDetails';
import { PageHeader } from './shared/PageHeader';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  active: { label: 'Активный', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  on_hold: { label: 'Приостановлен', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  completed: { label: 'Завершен', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-700 border-red-300' },
};

const WORK_TYPE_CATEGORY_CONFIG: Record<string, string> = {
  smr: 'СМР',
  installation: 'Монтажные работы',
  finishing: 'Отделочные работы',
  general_construction: 'Общестроительные работы',
  supply: 'Поставка',
  services: 'Услуги',
};

const GP_CALCULATION_TYPE_CONFIG: Record<string, string> = {
  percentage: 'Процент',
  coefficient: 'Коэффициент',
};

export const HoldingProjectDetails = () => {
  const { id, projectId } = useParams<{ id?: string; projectId?: string }>();
  const navigate = useNavigate();
  const { data: project, loading, error, fetchProject } = useHoldingProjectDetails();
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());
  
  const actualProjectId = id || projectId;

  useEffect(() => {
    if (actualProjectId) {
      fetchProject(Number(actualProjectId));
    }
  }, [actualProjectId, fetchProject]);

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    navigate(`/dashboard/projects/${actualProjectId}/edit`);
  };

  const toggleContractExpand = (contractId: number) => {
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedContracts(newExpanded);
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateContractsTotals = () => {
    if (!project?.contracts) return { total: 0, advance: 0, subcontract: 0 };
    return project.contracts.reduce((acc, contract: any) => {
      acc.total += Number(contract.total_amount || 0);
      acc.advance += Number(contract.actual_advance_amount || 0);
      acc.subcontract += Number(contract.subcontract_amount || 0);
      return acc;
    }, { total: 0, advance: 0, subcontract: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <LoadingSpinner message="Загрузка деталей проекта..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
          <p className="font-medium text-lg mb-2">Ошибка загрузки проекта</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <p className="text-gray-600">Проект не найден</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  const contractsTotals = calculateContractsTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title={project.name}
        subtitle={`Организация: ${project.organization.name}`}
        icon={<BuildingOffice2Icon className="w-7 h-7" />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <PencilSquareIcon className="w-5 h-5" />
              Редактировать
            </button>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Назад
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-700 p-2 rounded-lg">
              <InformationCircleIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Статус</h3>
          </div>
          <div className="flex flex-col gap-2">
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold border text-center ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {project.is_archived && (
              <span className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                <ArchiveBoxIcon className="w-4 h-4" />
                Архив
              </span>
            )}
            {(project as any).is_head && (
              <span className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 border border-blue-300">
                Головной проект
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Бюджет</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(project.budget_amount)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Контракты</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {project.contracts?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Сумма: {formatCurrency(contractsTotals.total)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-violet-600 p-2 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Участники</h3>
          </div>
          <p className="text-2xl font-bold text-violet-600">
            {project.organizations?.length || 0}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-700 p-2 rounded-lg">
              <BuildingOffice2Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Основная информация</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                ID проекта
              </label>
              <p className="text-gray-900 font-mono">#{project.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Организация-владелец
              </label>
              <p className="text-gray-900 font-medium">{project.organization.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                ИНН: {project.organization.tax_number} | ID: {project.organization.id}
              </p>
            </div>

            {project.address && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Адрес</label>
                  <p className="text-gray-900">{project.address}</p>
                </div>
              </div>
            )}

            {(project as any).site_area_m2 && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Площадь участка
                </label>
                <p className="text-gray-900">
                  {Number((project as any).site_area_m2).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} м²
                </p>
              </div>
            )}

            {(project as any).external_code && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Внешний код
                </label>
                <p className="text-gray-900 font-mono">{(project as any).external_code}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Даты и сроки</h3>
          </div>

          <div className="space-y-4">
            {(project as any).start_date && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Дата начала
                </label>
                <p className="text-gray-900">{formatDate((project as any).start_date)}</p>
              </div>
            )}

            {(project as any).end_date && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Дата окончания
                </label>
                <p className="text-gray-900">{formatDate((project as any).end_date)}</p>
              </div>
            )}

            {(project as any).contract_date && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Дата договора
                </label>
                <p className="text-gray-900">{formatDate((project as any).contract_date)}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Дата создания
              </label>
              <p className="text-gray-900">{formatDateTime(project.created_at)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Последнее обновление
              </label>
              <p className="text-gray-900">{formatDateTime(project.updated_at)}</p>
            </div>

            {(project as any).geocoded_at && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Дата геокодирования
                </label>
                <p className="text-gray-900">{formatDateTime((project as any).geocoded_at)}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-600 p-2 rounded-lg">
              <BuildingLibraryIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Стороны проекта</h3>
          </div>

          <div className="space-y-4">
            {(project as any).customer && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Заказчик</label>
                <p className="text-gray-900">{(project as any).customer}</p>
              </div>
            )}

            {(project as any).designer && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Проектировщик</label>
                <p className="text-gray-900">{(project as any).designer}</p>
              </div>
            )}

            {(project as any).customer_organization && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Организация-заказчик
                </label>
                <p className="text-gray-900">{(project as any).customer_organization}</p>
              </div>
            )}

            {(project as any).customer_representative && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Представитель заказчика
                </label>
                <p className="text-gray-900">{(project as any).customer_representative}</p>
              </div>
            )}

            {(project as any).contract_number && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Номер договора
                </label>
                <p className="text-gray-900 font-mono">{(project as any).contract_number}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-600 p-2 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Финансы и учет</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Бюджет проекта
              </label>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(project.budget_amount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-blue-700 block mb-1">
                  Сумма контрактов
                </label>
                <p className="text-sm font-bold text-blue-900">
                  {formatCurrency(contractsTotals.total)}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-green-700 block mb-1">
                  Авансы выданы
                </label>
                <p className="text-sm font-bold text-green-900">
                  {formatCurrency(contractsTotals.advance)}
                </p>
              </div>
            </div>

            {(project as any).cost_category_id && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  ID категории затрат
                </label>
                <p className="text-gray-900 font-mono">{(project as any).cost_category_id}</p>
              </div>
            )}

            {(project as any).use_in_accounting_reports !== undefined && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(project as any).use_in_accounting_reports}
                  disabled
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Использовать в бухгалтерских отчетах
                </label>
              </div>
            )}

            {(project as any).accounting_data && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  Учетные данные
                </label>
                <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">
                  {JSON.stringify((project as any).accounting_data, null, 2)}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {((project as any).latitude || (project as any).longitude) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-600 p-2 rounded-lg">
              <GlobeAltIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Геопозиция</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Широта</label>
              <p className="text-gray-900 font-mono">{(project as any).latitude}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Долгота</label>
              <p className="text-gray-900 font-mono">{(project as any).longitude}</p>
            </div>
          </div>
        </motion.div>
      )}

      {(project as any).description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-violet-600 p-2 rounded-lg">
              <InformationCircleIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Описание</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{(project as any).description}</p>
        </motion.div>
      )}

      {(project as any).additional_info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-600 p-2 rounded-lg">
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Дополнительная информация</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{(project as any).additional_info}</p>
        </motion.div>
      )}

      {project.contracts && project.contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Контракты</h3>
                <p className="text-sm text-gray-500">
                  Всего: {project.contracts.length} | Сумма: {formatCurrency(contractsTotals.total)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {project.contracts.map((contract: any, index: number) => {
              const isExpanded = expandedContracts.has(contract.id);
              const contractStatus = STATUS_CONFIG[contract.status as keyof typeof STATUS_CONFIG];

              return (
                <div
                  key={contract.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleContractExpand(contract.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-semibold text-gray-900">
                            {contract.number}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${contractStatus?.color || 'bg-gray-100 text-gray-700'}`}>
                            {contractStatus?.label || contract.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-1">{contract.subject}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Сумма контракта</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(contract.total_amount)}
                          </p>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            ID контракта
                          </label>
                          <p className="text-sm text-gray-900 font-mono">#{contract.id}</p>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            ID подрядчика
                          </label>
                          <p className="text-sm text-gray-900 font-mono">#{contract.contractor_id}</p>
                        </div>

                        {contract.parent_contract_id && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Родительский контракт
                            </label>
                            <p className="text-sm text-gray-900 font-mono">#{contract.parent_contract_id}</p>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Дата контракта
                          </label>
                          <p className="text-sm text-gray-900">{formatDate(contract.date)}</p>
                        </div>

                        {contract.start_date && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Дата начала
                            </label>
                            <p className="text-sm text-gray-900">{formatDate(contract.start_date)}</p>
                          </div>
                        )}

                        {contract.end_date && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Дата окончания
                            </label>
                            <p className="text-sm text-gray-900">{formatDate(contract.end_date)}</p>
                          </div>
                        )}

                        {contract.work_type_category && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Категория работ
                            </label>
                            <p className="text-sm text-gray-900">
                              {WORK_TYPE_CATEGORY_CONFIG[contract.work_type_category] || contract.work_type_category}
                            </p>
                          </div>
                        )}

                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Предмет контракта
                          </label>
                          <p className="text-sm text-gray-900">{contract.subject}</p>
                        </div>

                        {contract.payment_terms && (
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Условия оплаты
                            </label>
                            <p className="text-sm text-gray-900">{contract.payment_terms}</p>
                          </div>
                        )}

                        <div className="bg-emerald-50 p-4 rounded-lg">
                          <label className="text-xs font-medium text-emerald-700 block mb-2">
                            Общая сумма
                          </label>
                          <p className="text-xl font-bold text-emerald-900">
                            {formatCurrency(contract.total_amount)}
                          </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <label className="text-xs font-medium text-blue-700 block mb-2">
                            Планируемый аванс
                          </label>
                          <p className="text-xl font-bold text-blue-900">
                            {formatCurrency(contract.planned_advance_amount)}
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <label className="text-xs font-medium text-green-700 block mb-2">
                            Фактический аванс
                          </label>
                          <p className="text-xl font-bold text-green-900">
                            {formatCurrency(contract.actual_advance_amount)}
                          </p>
                        </div>

                        {contract.subcontract_amount && Number(contract.subcontract_amount) > 0 && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <label className="text-xs font-medium text-purple-700 block mb-2">
                              Сумма субподрядов
                            </label>
                            <p className="text-xl font-bold text-purple-900">
                              {formatCurrency(contract.subcontract_amount)}
                            </p>
                          </div>
                        )}

                        {contract.gp_percentage !== null && (
                          <div className="bg-amber-50 p-4 rounded-lg">
                            <label className="text-xs font-medium text-amber-700 block mb-2">
                              ГП (%)
                            </label>
                            <p className="text-xl font-bold text-amber-900">
                              {Number(contract.gp_percentage).toFixed(2)}%
                            </p>
                          </div>
                        )}

                        {contract.gp_calculation_type && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Тип расчета ГП
                            </label>
                            <p className="text-sm text-gray-900">
                              {GP_CALCULATION_TYPE_CONFIG[contract.gp_calculation_type] || contract.gp_calculation_type}
                            </p>
                          </div>
                        )}

                        {contract.gp_coefficient && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Коэффициент ГП
                            </label>
                            <p className="text-sm text-gray-900">{contract.gp_coefficient}</p>
                          </div>
                        )}

                        {contract.notes && (
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Примечания
                            </label>
                            <p className="text-sm text-gray-900">{contract.notes}</p>
                          </div>
                        )}

                        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Создан
                            </label>
                            <p className="text-sm text-gray-900">{formatDateTime(contract.created_at)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Обновлен
                            </label>
                            <p className="text-sm text-gray-900">{formatDateTime(contract.updated_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {project.organizations && project.organizations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-600 p-2 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Участники проекта</h3>
          </div>

          <div className="space-y-4">
            {project.organizations.map((orgData: any) => {
              const org = orgData;
              const roleColors: Record<string, string> = {
                owner: 'bg-blue-100 text-blue-700 border-blue-300',
                contractor: 'bg-green-100 text-green-700 border-green-300',
                subcontractor: 'bg-purple-100 text-purple-700 border-purple-300',
              };

              return (
                <div
                  key={org.id}
                  className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{org.name}</h4>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                            roleColors[org.pivot?.role || 'contractor'] || 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {org.pivot?.role || 'Участник'}
                        </span>
                        {org.pivot?.is_active ? (
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            Активен
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold">
                            Неактивен
                          </span>
                        )}
                      </div>
                      {org.legal_name && (
                        <p className="text-sm text-gray-600 mb-1">{org.legal_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        ИНН
                      </label>
                      <p className="text-sm text-gray-900 font-mono">{org.tax_number}</p>
                    </div>

                    {org.registration_number && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          ОГРН
                        </label>
                        <p className="text-sm text-gray-900 font-mono">{org.registration_number}</p>
                      </div>
                    )}

                    {org.phone && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Телефон
                        </label>
                        <p className="text-sm text-gray-900">{org.phone}</p>
                      </div>
                    )}

                    {org.email && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900">{org.email}</p>
                      </div>
                    )}

                    {org.address && (
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Адрес
                        </label>
                        <p className="text-sm text-gray-900">{org.address}</p>
                      </div>
                    )}

                    {org.organization_type && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Тип организации
                        </label>
                        <p className="text-sm text-gray-900">
                          {org.organization_type === 'parent' ? 'Головная' : org.organization_type === 'child' ? 'Дочерняя' : org.organization_type}
                        </p>
                      </div>
                    )}

                    {org.hierarchy_level !== undefined && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Уровень иерархии
                        </label>
                        <p className="text-sm text-gray-900">{org.hierarchy_level}</p>
                      </div>
                    )}

                    {org.is_holding !== undefined && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Холдинг
                        </label>
                        <p className="text-sm text-gray-900">{org.is_holding ? 'Да' : 'Нет'}</p>
                      </div>
                    )}

                    {org.capabilities && org.capabilities.length > 0 && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-xs font-medium text-gray-600 block mb-2">
                          Возможности
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {org.capabilities.map((cap: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {org.primary_business_type && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Основной вид деятельности
                        </label>
                        <p className="text-sm text-gray-900">{org.primary_business_type}</p>
                      </div>
                    )}

                    {org.pivot?.invited_at && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Приглашен
                        </label>
                        <p className="text-sm text-gray-900">{formatDateTime(org.pivot.invited_at)}</p>
                      </div>
                    )}

                    {org.pivot?.accepted_at && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Принято
                        </label>
                        <p className="text-sm text-gray-900">{formatDateTime(org.pivot.accepted_at)}</p>
                      </div>
                    )}
                  </div>

                  {org.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Описание
                      </label>
                      <p className="text-sm text-gray-700">{org.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HoldingProjectDetails;

