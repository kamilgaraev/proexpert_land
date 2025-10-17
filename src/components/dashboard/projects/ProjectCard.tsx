import type { ProjectOverview } from '@/types/projects-overview';
import { RoleBadge } from './RoleBadge';

interface ProjectCardProps {
  project: ProjectOverview;
  onViewDetails: (projectId: number) => void;
  onGoToWork: (projectId: number) => void;
}

export const ProjectCard = ({
  project,
  onViewDetails,
  onGoToWork
}: ProjectCardProps) => {
  const statusColors = {
    planned: 'text-gray-600 bg-gray-100',
    in_progress: 'text-construction-600 bg-construction-100',
    completed: 'text-green-600 bg-green-100',
    on_hold: 'text-yellow-600 bg-yellow-100'
  };

  const statusLabels = {
    planned: 'Запланирован',
    in_progress: 'В работе',
    completed: 'Завершен',
    on_hold: 'Приостановлен'
  };

  const completionPercentage = project.completion_percentage || 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
              {project.name}
            </h3>
            {project.address && (
              <p className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{project.address}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2 ml-3">
            <RoleBadge role={project.role} size="sm" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Прогресс</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-construction-500 to-construction-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-8 h-8 bg-construction-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-construction-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Контракты</p>
              <p className="font-semibold text-gray-900">{project.total_contracts}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Работы</p>
              <p className="font-semibold text-gray-900">{project.total_works}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Сумма контрактов:</span>
            <span className="font-semibold text-gray-900">{formatAmount(project.total_amount_contracts)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Выполнено работ:</span>
            <span className="font-semibold text-green-600">{formatAmount(project.total_amount_works)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{project.participants_count} участников</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex space-x-2">
        <button
          onClick={() => onViewDetails(project.id)}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-construction-500 focus:ring-offset-2"
        >
          Подробнее
        </button>
        <button
          onClick={() => onGoToWork(project.id)}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-construction-600 to-construction-700 rounded-lg hover:from-construction-700 hover:to-construction-800 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-construction-500 focus:ring-offset-2"
        >
          Перейти к работе →
        </button>
      </div>
    </div>
  );
};

