/**
 * Компонент уведомлений о приглашениях подрядчиков
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useInvitationsList } from '../../../hooks/useContractorInvitations';
import { INVITATION_STATUSES } from '../../../types/contractor-invitations';
import { getTimeUntilExpiry, isInvitationExpiringSoon } from '../../../utils/contractorInvitationsApi';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={`absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-construction-600 rounded-full ${className}`}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
};

interface ContractorInvitationNotificationsProps {
  onNotificationClick?: () => void;
  showTooltip?: boolean;
}

const ContractorInvitationNotifications: React.FC<ContractorInvitationNotificationsProps> = ({
  onNotificationClick,
  showTooltip = true,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  // Получаем только ожидающие приглашения
  const { invitations, loading, error } = useInvitationsList({
    status: INVITATION_STATUSES.PENDING,
    per_page: 10,
  });

  // Фильтруем неотклоненные уведомления
  const activeNotifications = invitations.filter(invitation => 
    !dismissed.has(invitation.id) && 
    invitation.can_be_accepted && 
    !invitation.is_expired
  );

  const urgentNotifications = activeNotifications.filter(invitation =>
    isInvitationExpiringSoon(invitation.expires_at)
  );

  const totalCount = activeNotifications.length;
  const urgentCount = urgentNotifications.length;

  const handleDismiss = (invitationId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDismissed(prev => new Set([...prev, invitationId]));
  };

  const handleNotificationClick = () => {
    setShowDropdown(false);
    onNotificationClick?.();
  };

  // Автоматически скрывать дропдаун при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-notification-dropdown]')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" data-notification-dropdown>
      {/* Кнопка уведомлений */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-lg transition-colors ${
          totalCount > 0
            ? 'text-construction-600 hover:bg-construction-50'
            : 'text-steel-500 hover:bg-steel-50'
        }`}
        title={showTooltip ? `Приглашения к сотрудничеству${totalCount > 0 ? ` (${totalCount})` : ''}` : undefined}
      >
        <BellIcon className="w-6 h-6" />
        <AnimatePresence>
          {totalCount > 0 && (
            <NotificationBadge 
              count={totalCount}
              className={urgentCount > 0 ? 'animate-pulse' : ''}
            />
          )}
        </AnimatePresence>
      </button>

      {/* Дропдаун уведомлений */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-steel-200 z-50"
          >
            {/* Заголовок */}
            <div className="p-4 border-b border-steel-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-steel-900">
                  Приглашения к сотрудничеству
                </h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 text-steel-400 hover:text-steel-600 rounded"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {totalCount > 0 && (
                <p className="text-sm text-steel-600 mt-1">
                  {totalCount} новых приглашений
                  {urgentCount > 0 && (
                    <span className="text-safety-600 font-medium ml-1">
                      ({urgentCount} срочных)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Список уведомлений */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-construction-600 mx-auto"></div>
                  <p className="text-sm text-steel-600 mt-2">Загрузка...</p>
                </div>
              )}

              {error && (
                <div className="p-4 text-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">Ошибка загрузки уведомлений</p>
                </div>
              )}

              {!loading && !error && totalCount === 0 && (
                <div className="p-6 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-steel-400 mx-auto mb-3" />
                  <p className="text-steel-600 font-medium">Новых приглашений нет</p>
                  <p className="text-sm text-steel-500 mt-1">
                    Все приглашения обработаны
                  </p>
                </div>
              )}

              {activeNotifications.map((invitation, index) => (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={`/dashboard/contractor-invitations/invitation/${invitation.token}`}
                    onClick={handleNotificationClick}
                    className="block p-4 hover:bg-steel-50 transition-colors border-b border-steel-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-steel-900 truncate">
                            {invitation.from_organization.name}
                          </p>
                          {invitation.from_organization.is_verified && (
                            <CheckCircleIcon className="w-4 h-4 text-construction-600 flex-shrink-0" />
                          )}
                          {isInvitationExpiringSoon(invitation.expires_at) && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-safety-100 text-safety-700 text-xs font-medium rounded-full">
                              Срочно
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-steel-600 line-clamp-2 mb-2">
                          {invitation.invitation_message}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-steel-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            Истекает через {getTimeUntilExpiry(invitation.expires_at)}
                          </span>
                          <span>
                            {invitation.from_organization.city}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDismiss(invitation.id, e)}
                        className="flex-shrink-0 ml-2 p-1 text-steel-400 hover:text-steel-600 rounded"
                        title="Скрыть уведомление"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Футер */}
            {totalCount > 0 && (
              <div className="p-3 border-t border-steel-200">
                <Link
                  to="/dashboard/contractor-invitations"
                  onClick={handleNotificationClick}
                  className="block w-full px-4 py-2 text-center text-construction-600 hover:text-construction-700 font-medium rounded-lg hover:bg-construction-50 transition-colors"
                >
                  Посмотреть все приглашения
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContractorInvitationNotifications;