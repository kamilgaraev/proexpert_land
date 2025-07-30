/**
 * Компонент статистики приглашений подрядчиков
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useInvitationStats } from '../../../hooks/useContractorInvitations';
import type { InvitationStats } from '../../../types/contractor-invitations';
import { PageLoading } from '../../common/PageLoading';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'construction' | 'safety' | 'steel' | 'concrete';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    construction: {
      bg: 'bg-construction-50',
      iconBg: 'bg-construction-500',
      text: 'text-construction-600',
      border: 'border-construction-200',
    },
    safety: {
      bg: 'bg-safety-50',
      iconBg: 'bg-safety-500',
      text: 'text-safety-600',
      border: 'border-safety-200',
    },
    steel: {
      bg: 'bg-steel-50',
      iconBg: 'bg-steel-500',
      text: 'text-steel-600',
      border: 'border-steel-200',
    },
    concrete: {
      bg: 'bg-concrete-50',
      iconBg: 'bg-concrete-500',
      text: 'text-concrete-600',
      border: 'border-concrete-200',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center">
        <div className={`${colors.iconBg} rounded-lg p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-steel-600">{title}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
          {description && (
            <p className="text-xs text-steel-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface InvitationsSectionProps {
  title: string;
  stats: InvitationStats['received_invitations'] | InvitationStats['sent_invitations'];
  type: 'received' | 'sent';
}

const InvitationsSection: React.FC<InvitationsSectionProps> = ({ title, stats, type }) => {
  const getSuccessRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.accepted / stats.total) * 100);
  };

  const getPendingRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.pending / stats.total) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {type === 'received' ? (
          <EnvelopeIcon className="w-5 h-5 text-construction-600" />
        ) : (
          <PaperAirplaneIcon className="w-5 h-5 text-safety-600" />
        )}
        <h3 className="text-lg font-semibold text-steel-900">{title}</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Всего"
          value={stats.total}
          icon={ChartBarIcon}
          color={type === 'received' ? 'construction' : 'safety'}
          description={type === 'received' ? 'получено' : 'отправлено'}
        />
        
        <StatsCard
          title="Ожидают"
          value={stats.pending}
          icon={ClockIcon}
          color="concrete"
          description={`${getPendingRate()}% от общего`}
        />
        
        <StatsCard
          title="Принято"
          value={stats.accepted}
          icon={CheckCircleIcon}
          color="construction"
          description={`${getSuccessRate()}% успеха`}
        />
        
        <StatsCard
          title="Отклонено"
          value={stats.declined}
          icon={XCircleIcon}
          color="steel"
          description={stats.total > 0 ? `${Math.round((stats.declined / stats.total) * 100)}% от общего` : undefined}
        />
      </div>
    </div>
  );
};

interface ContractorInvitationsStatsProps {
  className?: string;
  showTitle?: boolean;
}

const ContractorInvitationsStats: React.FC<ContractorInvitationsStatsProps> = ({
  className = '',
  showTitle = true,
}) => {
  const { stats, loading, error, refreshStats } = useInvitationStats();

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-800">Ошибка загрузки статистики</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={refreshStats}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`${className}`}>
        <div className="bg-steel-50 border border-steel-200 rounded-xl p-6 text-center">
          <ChartBarIcon className="w-12 h-12 text-steel-400 mx-auto mb-4" />
          <p className="text-steel-600">Статистика недоступна</p>
        </div>
      </div>
    );
  }

  const totalInvitations = stats.received_invitations.total + stats.sent_invitations.total;
  const totalAccepted = stats.received_invitations.accepted + stats.sent_invitations.accepted;
  const overallSuccessRate = totalInvitations > 0 ? Math.round((totalAccepted / totalInvitations) * 100) : 0;

  return (
    <div className={`space-y-8 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-steel-900 font-construction">
              Статистика приглашений
            </h2>
            <p className="text-steel-600 mt-1">
              Общий показатель успешности: {overallSuccessRate}%
            </p>
          </div>
          <button
            onClick={refreshStats}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-steel-300 rounded-lg text-steel-700 bg-white hover:bg-steel-50 disabled:opacity-50 transition-colors"
          >
            <ChartBarIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
      )}

      {/* Общая статистика */}
      {totalInvitations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-construction-50 to-safety-50 border border-construction-200 rounded-xl p-6"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-steel-900 mb-4">Общая активность</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-construction-600">{totalInvitations}</p>
                <p className="text-sm text-steel-600">Всего приглашений</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-safety-600">{totalAccepted}</p>
                <p className="text-sm text-steel-600">Успешных сделок</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-steel-600">{overallSuccessRate}%</p>
                <p className="text-sm text-steel-600">Общий успех</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Входящие приглашения */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <InvitationsSection
          title="Входящие приглашения"
          stats={stats.received_invitations}
          type="received"
        />
      </motion.div>

      {/* Исходящие приглашения (если есть) */}
      {stats.sent_invitations.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <InvitationsSection
            title="Исходящие приглашения"
            stats={stats.sent_invitations}
            type="sent"
          />
        </motion.div>
      )}

      {/* Рекомендации */}
      {totalInvitations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-concrete-50 border border-concrete-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-concrete-500 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-steel-900 mb-2">Рекомендации</h3>
              <div className="space-y-2 text-sm text-steel-700">
                {stats.received_invitations.pending > 0 && (
                  <p>• У вас есть {stats.received_invitations.pending} неответленных приглашений</p>
                )}
                {overallSuccessRate < 50 && totalInvitations > 5 && (
                  <p>• Рассмотрите возможность улучшения профиля организации для повышения успешности</p>
                )}
                {stats.received_invitations.total === 0 && (
                  <p>• Убедитесь, что ваша организация видна для потенциальных заказчиков</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Пустое состояние */}
      {totalInvitations === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <ChartBarIcon className="w-16 h-16 text-steel-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-steel-900 mb-2">
            Пока нет статистики
          </h3>
          <p className="text-steel-600 max-w-md mx-auto">
            Статистика появится после получения или отправки первых приглашений к сотрудничеству
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ContractorInvitationsStats;