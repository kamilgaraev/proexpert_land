import { useEffect } from 'react';
import type { ProjectDetails } from '@/types/projects-overview';
import { RoleBadge } from './RoleBadge';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectDetails: ProjectDetails | null;
  loading: boolean;
  onGoToWork: (projectId: number) => void;
}

export const ProjectDetailsModal = ({
  isOpen,
  onClose,
  projectDetails,
  loading,
  onGoToWork
}: ProjectDetailsModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="sr-only">Закрыть</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Загрузка данных проекта...</p>
            </div>
          ) : projectDetails ? (
            <div className="bg-white">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {projectDetails.project.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {projectDetails.project.description}
                    </p>
                  </div>
                  <div className="ml-4">
                    <RoleBadge role={projectDetails.my_context.role} size="md" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Основная информация</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500">Адрес</dt>
                        <dd className="text-sm text-gray-900">{projectDetails.project.address}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Период реализации</dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(projectDetails.project.start_date)} - {formatDate(projectDetails.project.end_date)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Владелец проекта</dt>
                        <dd className="text-sm text-gray-900">{projectDetails.project.owner_organization.name}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Мои права</h4>
                    <div className="space-y-1">
                      {projectDetails.my_context.is_owner && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 mr-2 mb-1">
                          👑 Владелец проекта
                        </span>
                      )}
                      {projectDetails.my_context.can_manage_contracts && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1">
                          📄 Управление контрактами
                        </span>
                      )}
                      {projectDetails.my_context.can_view_finances && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mr-2 mb-1">
                          💰 Просмотр финансов
                        </span>
                      )}
                      {projectDetails.my_context.can_manage_works && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2 mb-1">
                          🔨 Управление работами
                        </span>
                      )}
                      {projectDetails.my_context.can_manage_warehouse && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 mr-2 mb-1">
                          📦 Управление складом
                        </span>
                      )}
                      {projectDetails.my_context.can_invite_participants && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-pink-100 text-pink-800 mr-2 mb-1">
                          👥 Приглашение участников
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Статистика</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Контракты</p>
                      <p className="text-2xl font-bold text-blue-900">{projectDetails.statistics.contracts_count}</p>
                      <p className="text-xs text-blue-700 mt-1">{formatAmount(projectDetails.statistics.total_contracts_amount)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium mb-1">Работы</p>
                      <p className="text-2xl font-bold text-green-900">{projectDetails.statistics.works_count}</p>
                      <p className="text-xs text-green-700 mt-1">{formatAmount(projectDetails.statistics.total_works_amount)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 font-medium mb-1">Выполнено</p>
                      <p className="text-2xl font-bold text-purple-900">{projectDetails.statistics.completion_percentage}%</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 font-medium mb-1">Участники</p>
                      <p className="text-2xl font-bold text-orange-900">{projectDetails.participants.length}</p>
                    </div>
                  </div>
                </div>

                {projectDetails.participants.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Участники проекта</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {projectDetails.participants.map(participant => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-900">{participant.name}</span>
                          <RoleBadge role={participant.role} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => onGoToWork(projectDetails.project.id)}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Перейти к работе →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Не удалось загрузить данные проекта</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

