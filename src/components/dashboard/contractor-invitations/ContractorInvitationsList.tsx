/**
 * Компонент списка приглашений подрядчиков
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  EyeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useInvitationsList, useInvitationFilters } from '../../../hooks/useContractorInvitations';
import {
  INVITATION_STATUS_LABELS,
  INVITATION_STATUS_COLORS,
  INVITATION_STATUSES,
  type InvitationStatus,
  type ContractorInvitation,
} from '../../../types/contractor-invitations';
import {
  formatInvitationDate,
  getTimeUntilExpiry,
  isInvitationExpiringSoon,
} from '../../../utils/contractorInvitationsApi';
import PageLoading from '../../common/PageLoading';

interface ContractorInvitationsListProps {
  onInvitationSelect?: (invitation: ContractorInvitation) => void;
  showFilters?: boolean;
}

const ContractorInvitationsList: React.FC<ContractorInvitationsListProps> = ({
  onInvitationSelect,
  showFilters = true,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<InvitationStatus | 'all'>('all');
  const { filters, setStatusFilter, resetFilters } = useInvitationFilters();
  
  const {
    invitations,
    pagination,
    loading,
    error,
    refreshInvitations,
    loadMore,
    hasMore,
  } = useInvitationsList(filters);

  const handleStatusFilter = (status: InvitationStatus | 'all') => {
    setSelectedStatus(status);
    if (status === 'all') {
      setStatusFilter(undefined);
    } else {
      setStatusFilter(status);
    }
  };

  const getStatusIcon = (status: InvitationStatus) => {
    switch (status) {
      case INVITATION_STATUSES.PENDING:
        return <ClockIcon className="w-4 h-4" />;
      case INVITATION_STATUSES.ACCEPTED:
        return <CheckCircleIcon className="w-4 h-4" />;
      case INVITATION_STATUSES.DECLINED:
        return <XCircleIcon className="w-4 h-4" />;
      case INVITATION_STATUSES.EXPIRED:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getInvitationPriorityBadge = (invitation: ContractorInvitation) => {
    if (invitation.status === INVITATION_STATUSES.PENDING) {
      if (invitation.is_expired) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-concrete-100 text-concrete-700">
            Истекло
          </span>
        );
      }
      
      if (isInvitationExpiringSoon(invitation.expires_at)) {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-safety-100 text-safety-700 animate-pulse">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Срочно
          </span>
        );
      }
    }
    return null;
  };

  if (loading && invitations.length === 0) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-steel-900 font-construction">
            Приглашения к сотрудничеству
          </h2>
          <p className="text-steel-600 mt-1">
            {pagination ? `Всего: ${pagination.total}` : 'Загрузка...'}
          </p>
        </div>
        
        <button
          onClick={refreshInvitations}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-steel-300 rounded-lg text-steel-700 bg-white hover:bg-steel-50 disabled:opacity-50 transition-colors"
        >
          <ArrowRightIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Обновление...' : 'Обновить'}
        </button>
      </div>

      {/* Фильтры по статусу */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-steel-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FunnelIcon className="w-5 h-5 text-steel-600" />
            <h3 className="text-lg font-semibold text-steel-900">Фильтры</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-construction-600 text-white'
                  : 'bg-steel-100 text-steel-700 hover:bg-steel-200'
              }`}
            >
              Все
            </button>
            
            {Object.entries(INVITATION_STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status as InvitationStatus)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-construction-600 text-white'
                    : 'bg-steel-100 text-steel-700 hover:bg-steel-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Список приглашений */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка загрузки</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {invitations.map((invitation, index) => (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-steel-200 hover:border-construction-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => onInvitationSelect?.(invitation)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Аватар организации */}
                    <div className="flex-shrink-0">
                      {invitation.from_organization.logo_path ? (
                        <img
                          src={invitation.from_organization.logo_path}
                          alt={invitation.from_organization.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center">
                          <BuildingOfficeIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Информация о приглашении */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-steel-900 truncate">
                          {invitation.from_organization.name}
                        </h3>
                        {invitation.from_organization.is_verified && (
                          <CheckCircleIcon className="w-4 h-4 text-construction-600 flex-shrink-0" />
                        )}
                        {getInvitationPriorityBadge(invitation)}
                      </div>
                      
                      <p className="text-sm text-steel-600 mb-2">
                        {invitation.from_organization.city}
                      </p>
                      
                      <p className="text-steel-700 line-clamp-2 mb-3">
                        {invitation.invitation_message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-steel-500">
                        <span className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4" />
                          От: {invitation.invited_by.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatInvitationDate(invitation.created_at)}
                        </span>
                        {invitation.status === INVITATION_STATUSES.PENDING && !invitation.is_expired && (
                          <span className="flex items-center gap-1 text-safety-600">
                            Истекает через {getTimeUntilExpiry(invitation.expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Статус и действия */}
                  <div className="flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      INVITATION_STATUS_COLORS[invitation.status]
                    }`}>
                      {getStatusIcon(invitation.status)}
                      <span className="ml-1">{INVITATION_STATUS_LABELS[invitation.status]}</span>
                    </span>
                    
                    <button className="inline-flex items-center text-sm text-construction-600 hover:text-construction-700 font-medium">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Пустое состояние */}
      {!loading && invitations.length === 0 && (
        <div className="text-center py-12">
          <EnvelopeIcon className="w-16 h-16 text-steel-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-steel-900 mb-2">
            {filters.status ? 'Нет приглашений с таким статусом' : 'Нет приглашений'}
          </h3>
          <p className="text-steel-600 mb-4">
            {filters.status
              ? 'Попробуйте изменить фильтры или обновить список'
              : 'Когда вас пригласят к сотрудничеству, приглашения появятся здесь'
            }
          </p>
          {filters.status && (
            <button
              onClick={() => handleStatusFilter('all')}
              className="inline-flex items-center px-4 py-2 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors"
            >
              Показать все приглашения
            </button>
          )}
        </div>
      )}

      {/* Загрузить еще */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-construction-600 text-white rounded-lg hover:bg-construction-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Загрузка...
              </>
            ) : (
              <>
                Загрузить еще
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContractorInvitationsList;