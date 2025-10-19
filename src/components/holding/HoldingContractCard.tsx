import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface Contract {
  id: number;
  number: string;
  date: string;
  subject: string;
  total_amount: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  organization: {
    id: number;
    name: string;
  };
  contractor: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
  };
}

interface HoldingContractCardProps {
  contract: Contract;
  onClick?: (contract: Contract) => void;
  index?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  active: { label: 'Активный', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  suspended: { label: 'Приостановлен', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  completed: { label: 'Завершен', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  terminated: { label: 'Расторгнут', color: 'bg-red-100 text-red-700 border-red-300' },
};

export const HoldingContractCard = ({ contract, onClick, index = 0 }: HoldingContractCardProps) => {
  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick?.(contract)}
      className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                {contract.number}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{contract.subject}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ml-3 ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          {contract.organization?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BuildingOfficeIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <span className="truncate">{contract.organization.name}</span>
            </div>
          )}

          {contract.contractor?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserGroupIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">{contract.contractor.name}</span>
            </div>
          )}

          {contract.project?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BuildingOfficeIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="truncate">{contract.project.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Сумма:</span>
            </div>
            <span className="text-base font-bold text-emerald-600">
              {formatCurrency(contract.total_amount)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Даты:</span>
            <span className="text-gray-900">
              {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
            </span>
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

      <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
    </motion.div>
  );
};

