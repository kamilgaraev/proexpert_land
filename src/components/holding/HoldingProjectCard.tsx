import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import type { ProjectWithOrganization } from '@/types/multi-organization-v2';

interface HoldingProjectCardProps {
  project: ProjectWithOrganization;
  onClick?: (project: ProjectWithOrganization) => void;
  index?: number;
}

const STATUS_CONFIG = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  active: { label: 'Активный', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  on_hold: { label: 'Приостановлен', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  completed: { label: 'Завершен', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-700 border-red-300' },
};

export const HoldingProjectCard = ({ project, onClick, index = 0 }: HoldingProjectCardProps) => {
  const statusConfig = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
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

  const getOrganizationColor = (orgId: number) => {
    const colors = [
      'bg-slate-100 text-slate-700 border-slate-300',
      'bg-blue-100 text-blue-700 border-blue-300',
      'bg-violet-100 text-violet-700 border-violet-300',
      'bg-emerald-100 text-emerald-700 border-emerald-300',
      'bg-amber-100 text-amber-700 border-amber-300',
    ];
    return colors[orgId % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => onClick?.(project)}
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${project.is_archived ? 'opacity-60' : ''}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {project.name}
              </h3>
              {project.is_archived && (
                <ArchiveBoxIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getOrganizationColor(project.organization.id)}`}>
                {project.organization.name}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig.color} flex-shrink-0`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Бюджет:</span>
            </div>
            <span className="text-base font-bold text-emerald-600">
              {formatCurrency(project.budget_amount)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Создан:</span>
            <span className="text-gray-900">{formatDate(project.created_at)}</span>
          </div>
        </div>

        {onClick && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end text-slate-700 font-medium text-sm">
            <span className="flex items-center gap-1 hover:gap-2 transition-all">
              Подробнее
              <ChevronRightIcon className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-slate-700 to-slate-800"></div>
    </motion.div>
  );
};

