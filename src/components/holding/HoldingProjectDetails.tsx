import { useEffect } from 'react';
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

export const HoldingProjectDetails = () => {
  const { id, projectId } = useParams<{ id?: string; projectId?: string }>();
  const navigate = useNavigate();
  const { data: project, loading, error, fetchProject } = useHoldingProjectDetails();
  
  const actualProjectId = id || projectId;

  useEffect(() => {
    if (actualProjectId) {
      fetchProject(Number(actualProjectId));
    }
  }, [actualProjectId, fetchProject]);

  const handleBack = () => {
    navigate('/landing/multi-organization/projects');
  };

  const handleEdit = () => {
    navigate(`/dashboard/projects/${actualProjectId}/edit`);
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            {project.is_archived && (
              <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                <ArchiveBoxIcon className="w-4 h-4" />
                Архив
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Бюджет</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {formatCurrency(project.budget_amount)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Контракты</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {project.contracts?.length || 0}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
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
                Организация-владелец
              </label>
              <p className="text-gray-900 font-medium">{project.organization.name}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {project.organization.id}</p>
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

            {project.customer && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Заказчик</label>
                <p className="text-gray-900">{project.customer}</p>
              </div>
            )}

            {(project as any).designer && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Проектировщик</label>
                <p className="text-gray-900">{(project as any).designer}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
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
              <p className="text-gray-900">{formatDate(project.created_at)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {(project as any).description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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

      {project.contracts && project.contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <DocumentTextIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Контракты</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Номер
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Подрядчик
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Сумма
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {project.contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {(contract as any).contract_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(contract as any).contractor_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                      {formatCurrency(contract.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${
                          STATUS_CONFIG[(contract as any).status as keyof typeof STATUS_CONFIG]?.color ||
                          'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {STATUS_CONFIG[(contract as any).status as keyof typeof STATUS_CONFIG]?.label ||
                          (contract as any).status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {project.organizations && project.organizations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-600 p-2 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Участники проекта</h3>
          </div>

          <div className="space-y-3">
            {project.organizations.map((org) => (
              <div
                key={org.organization_id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{org.organization_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Роль: <span className="font-medium">{org.role_label}</span>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    org.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {org.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HoldingProjectDetails;

