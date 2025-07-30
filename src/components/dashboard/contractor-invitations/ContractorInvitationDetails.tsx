/**
 * Компонент детального просмотра приглашения подрядчика
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,

  MapPinIcon,
  ExclamationTriangleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useInvitationActions } from '../../../hooks/useContractorInvitations';
import {
  INVITATION_STATUS_LABELS,
  INVITATION_STATUS_COLORS,
  INVITATION_STATUSES,
  type ContractorInvitation,
} from '../../../types/contractor-invitations';
import {
  formatInvitationDate,
  getTimeUntilExpiry,
  isInvitationExpiringSoon,
} from '../../../utils/contractorInvitationsApi';
import ConfirmActionModal from '../../shared/ConfirmActionModal';

interface ContractorInvitationDetailsProps {
  invitation: ContractorInvitation;
  onBack?: () => void;
  onInvitationProcessed?: (invitation: ContractorInvitation) => void;
}

const ContractorInvitationDetails: React.FC<ContractorInvitationDetailsProps> = ({
  invitation,
  onBack,
  onInvitationProcessed,
}) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);

  const {
    accepting,
    declining,
    acceptError,
    declineError,
    acceptInvitation,
    declineInvitation,
  } = useInvitationActions();

  const handleAccept = async () => {
    if (!invitation.token) return;
    
    const result = await acceptInvitation(invitation.token);
    if (result) {
      setProcessingSuccess(`Приглашение принято! ${result.message}`);
      setShowAcceptModal(false);
      onInvitationProcessed?.({
        ...invitation,
        status: INVITATION_STATUSES.ACCEPTED,
        accepted_at: new Date().toISOString(),
      });
    }
  };

  const handleDecline = async () => {
    if (!invitation.token) return;
    
    const success = await declineInvitation(invitation.token, declineReason);
    if (success) {
      setProcessingSuccess('Приглашение отклонено');
      setShowDeclineModal(false);
      onInvitationProcessed?.({
        ...invitation,
        status: INVITATION_STATUSES.DECLINED,
        declined_at: new Date().toISOString(),
        decline_reason: declineReason,
      });
    }
  };

  const canProcessInvitation = 
    invitation.status === INVITATION_STATUSES.PENDING && 
    invitation.can_be_accepted && 
    !invitation.is_expired;

  const getStatusIcon = () => {
    switch (invitation.status) {
      case INVITATION_STATUSES.PENDING:
        return <ClockIcon className="w-5 h-5" />;
      case INVITATION_STATUSES.ACCEPTED:
        return <CheckCircleIcon className="w-5 h-5" />;
      case INVITATION_STATUSES.DECLINED:
        return <HandThumbDownIcon className="w-5 h-5" />;
      case INVITATION_STATUSES.EXPIRED:
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Хедер с кнопкой назад */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-steel-600 hover:text-steel-800 hover:bg-steel-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Назад к списку
          </button>
        )}
        <h1 className="text-2xl font-bold text-steel-900 font-construction">
          Приглашение к сотрудничеству
        </h1>
      </div>

      {/* Уведомление об успешной обработке */}
      {processingSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-construction-50 border border-construction-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-construction-600" />
            <div className="ml-3">
              <p className="text-construction-800 font-medium">{processingSuccess}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Основная карточка */}
      <div className="bg-white rounded-xl border border-steel-200 overflow-hidden">
        {/* Хедер карточки */}
        <div className="bg-gradient-to-r from-construction-50 to-safety-50 p-6 border-b border-steel-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Логотип организации */}
              <div className="flex-shrink-0">
                {invitation.from_organization.logo_path ? (
                  <img
                    src={invitation.from_organization.logo_path}
                    alt={invitation.from_organization.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Информация об организации */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-steel-900">
                    {invitation.from_organization.name}
                  </h2>
                  {invitation.from_organization.is_verified && (
                    <CheckCircleIcon className="w-6 h-6 text-construction-600" />
                  )}
                </div>
                
                <p className="text-steel-600 mb-1">
                  {invitation.from_organization.legal_name}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-steel-500">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {invitation.from_organization.city}
                  </span>
                  {invitation.from_organization.contractor_connections_count && (
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      {invitation.from_organization.contractor_connections_count} подрядчиков
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Статус */}
            <div className="text-right">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                INVITATION_STATUS_COLORS[invitation.status]
              }`}>
                {getStatusIcon()}
                {INVITATION_STATUS_LABELS[invitation.status]}
              </span>
              
              {invitation.status === INVITATION_STATUSES.PENDING && !invitation.is_expired && (
                <p className="text-sm text-steel-500 mt-2">
                  Истекает через {getTimeUntilExpiry(invitation.expires_at)}
                  {isInvitationExpiringSoon(invitation.expires_at) && (
                    <span className="text-safety-600 font-medium ml-1">
                      (скоро!)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Содержимое карточки */}
        <div className="p-6 space-y-6">
          {/* Описание организации */}
          {invitation.from_organization.description && (
            <div>
              <h3 className="text-lg font-semibold text-steel-900 mb-3">
                О компании
              </h3>
              <p className="text-steel-700 leading-relaxed">
                {invitation.from_organization.description}
              </p>
            </div>
          )}

          {/* Сообщение приглашения */}
          <div>
            <h3 className="text-lg font-semibold text-steel-900 mb-3">
              Сообщение от заказчика
            </h3>
            <div className="bg-concrete-50 rounded-xl p-4">
              <p className="text-steel-700 leading-relaxed whitespace-pre-wrap">
                {invitation.invitation_message}
              </p>
            </div>
          </div>

          {/* Метаданные проекта */}
          {invitation.metadata && Object.keys(invitation.metadata).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-steel-900 mb-3">
                Детали проекта
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invitation.metadata.project_type && (
                  <div className="flex items-center gap-3 p-3 bg-construction-50 rounded-lg">
                    <BriefcaseIcon className="w-5 h-5 text-construction-600" />
                    <div>
                      <p className="text-sm text-steel-600">Тип проекта</p>
                      <p className="font-medium text-steel-900">{invitation.metadata.project_type}</p>
                    </div>
                  </div>
                )}
                {invitation.metadata.budget_range && (
                  <div className="flex items-center gap-3 p-3 bg-safety-50 rounded-lg">
                    <CurrencyDollarIcon className="w-5 h-5 text-safety-600" />
                    <div>
                      <p className="text-sm text-steel-600">Бюджет</p>
                      <p className="font-medium text-steel-900">{invitation.metadata.budget_range}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Контактная информация */}
          <div>
            <h3 className="text-lg font-semibold text-steel-900 mb-3">
              Контактное лицо
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-construction-100 rounded-xl flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 text-construction-600" />
              </div>
              <div>
                <p className="font-medium text-steel-900">{invitation.invited_by.name}</p>
                <p className="text-steel-600">{invitation.invited_by.email}</p>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="border-t border-steel-200 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <InformationCircleIcon className="w-5 h-5 text-steel-500" />
              <h3 className="text-lg font-semibold text-steel-900">
                Дополнительная информация
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-steel-600">Приглашение отправлено:</span>
                <span className="ml-2 font-medium text-steel-900">
                  {formatInvitationDate(invitation.created_at)}
                </span>
              </div>
              <div>
                <span className="text-steel-600">Действительно до:</span>
                <span className="ml-2 font-medium text-steel-900">
                  {formatInvitationDate(invitation.expires_at)}
                </span>
              </div>
              {invitation.accepted_at && (
                <div>
                  <span className="text-steel-600">Принято:</span>
                  <span className="ml-2 font-medium text-construction-600">
                    {formatInvitationDate(invitation.accepted_at)}
                  </span>
                </div>
              )}
              {invitation.declined_at && (
                <div>
                  <span className="text-steel-600">Отклонено:</span>
                  <span className="ml-2 font-medium text-steel-600">
                    {formatInvitationDate(invitation.declined_at)}
                  </span>
                </div>
              )}
            </div>
            
            {invitation.decline_reason && (
              <div className="mt-4 p-3 bg-steel-50 rounded-lg">
                <p className="text-sm text-steel-600 mb-1">Причина отклонения:</p>
                <p className="text-steel-700">{invitation.decline_reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Действия */}
        {canProcessInvitation && (
          <div className="bg-concrete-50 p-6 border-t border-steel-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowAcceptModal(true)}
                disabled={accepting || declining}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-construction-600 text-white rounded-xl hover:bg-construction-700 disabled:opacity-50 transition-colors font-semibold"
              >
                <HandThumbUpIcon className="w-5 h-5" />
                {accepting ? 'Принимаю...' : 'Принять приглашение'}
              </button>
              
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={accepting || declining}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-steel-300 text-steel-700 rounded-xl hover:bg-steel-50 disabled:opacity-50 transition-colors font-semibold"
              >
                <HandThumbDownIcon className="w-5 h-5" />
                {declining ? 'Отклоняю...' : 'Отклонить'}
              </button>
            </div>
            
            {(acceptError || declineError) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <p className="ml-2 text-red-700 text-sm">
                    {acceptError || declineError}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модал подтверждения принятия */}
      <ConfirmActionModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        title="Принять приглашение?"
        message={`Вы уверены, что хотите принять приглашение от "${invitation.from_organization.name}"? После принятия между вашими организациями будет установлена подрядная связь.`}
        confirmLabel="Принять"
        isLoading={accepting}
        confirmColorClass="primary"
      />

      {/* Простой модал для отклонения */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-steel-900 mb-4">
              Отклонить приглашение?
            </h3>
            <p className="text-steel-600 mb-4">
              Вы можете указать причину отклонения (необязательно).
            </p>
            
            <div className="mb-6">
              <label htmlFor="decline-reason" className="block text-sm font-medium text-steel-900 mb-2">
                Причина отклонения (необязательно)
              </label>
              <textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500"
                placeholder="Укажите причину отклонения..."
              />
              <p className="text-xs text-steel-500 mt-1">
                {declineReason.length}/500 символов
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-2 border border-steel-300 text-steel-700 rounded-lg hover:bg-steel-50"
                disabled={declining}
              >
                Отмена
              </button>
              <button
                onClick={handleDecline}
                disabled={declining}
                className="flex-1 px-4 py-2 bg-steel-600 text-white rounded-lg hover:bg-steel-700 disabled:opacity-50"
              >
                {declining ? 'Отклоняю...' : 'Отклонить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorInvitationDetails;