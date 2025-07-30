/**
 * Страница обработки приглашения подрядчика по токену
 * Используется когда пользователь переходит по ссылке из email
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  HomeIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useInvitationDetails } from '../../../hooks/useContractorInvitations';
import { usePageTitle } from '../../../hooks/useSEO';
import ContractorInvitationDetails from '../../../components/dashboard/contractor-invitations/ContractorInvitationDetails';
import PageLoading from '../../../components/common/PageLoading';
import { INVITATION_STATUSES } from '../../../types/contractor-invitations';

const ContractorInvitationTokenPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [processed, setProcessed] = useState(false);
  
  const { invitation, loading, error } = useInvitationDetails(token || null);
  
  usePageTitle(
    invitation 
      ? `Приглашение от ${invitation.from_organization.name}`
      : 'Приглашение к сотрудничеству'
  );

  // Редирект на список приглашений после обработки (через 3 секунды)
  useEffect(() => {
    if (processed) {
      const timer = setTimeout(() => {
        navigate('/dashboard/contractor-invitations');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [processed, navigate]);

  const handleInvitationProcessed = () => {
    setProcessed(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-steel-900 mb-2">
                Приглашение недоступно
              </h1>
              <p className="text-steel-600">
                {error}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/dashboard/contractor-invitations"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors font-semibold"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Все приглашения
              </Link>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-steel-300 text-steel-700 rounded-lg hover:bg-steel-50 transition-colors font-semibold"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                На главную
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 bg-steel-100 rounded-full flex items-center justify-center mx-auto">
              <EnvelopeIcon className="w-10 h-10 text-steel-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-steel-900 mb-2">
                Приглашение не найдено
              </h1>
              <p className="text-steel-600">
                Возможно, ссылка была повреждена или приглашение больше не существует
              </p>
            </div>

            <Link
              to="/dashboard/contractor-invitations"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors font-semibold"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              Все приглашения
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Показ сообщения об успешной обработке
  if (processed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 bg-construction-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10 text-construction-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-steel-900 mb-2">
                Приглашение обработано!
              </h1>
              <p className="text-steel-600">
                Вы будете автоматически перенаправлены на страницу всех приглашений через несколько секунд
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/dashboard/contractor-invitations"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors font-semibold"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Перейти сейчас
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-steel-300 text-steel-700 rounded-lg hover:bg-steel-50 transition-colors font-semibold"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                На главную
              </Link>
            </div>

            {/* Автоматический таймер */}
            <div className="flex items-center justify-center gap-2 text-sm text-steel-500">
              <ClockIcon className="w-4 h-4" />
              <span>Автоматическое перенаправление...</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Основной контент - детали приглашения
  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 via-concrete-100 to-steel-100">
      {/* Навигационная панель */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-steel-200 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-steel-600 hover:text-steel-800 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Личный кабинет</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/contractor-invitations"
                className="inline-flex items-center px-4 py-2 text-construction-600 hover:text-construction-700 font-medium"
              >
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                Все приглашения
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Специальное уведомление для срочных/истекающих приглашений */}
          {invitation.status === INVITATION_STATUSES.PENDING && 
           !invitation.is_expired && 
           invitation.can_be_accepted && (
            <div className="container-custom mb-6">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gradient-to-r from-safety-500 to-construction-500 text-white rounded-xl p-6 text-center"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <ClockIcon className="w-6 h-6" />
                    <h2 className="text-xl font-bold">
                      Новое приглашение к сотрудничеству!
                    </h2>
                  </div>
                  <p className="text-white/90">
                    Компания "{invitation.from_organization.name}" приглашает вас к сотрудничеству.
                    Ознакомьтесь с деталями и примите решение.
                  </p>
                </motion.div>
              </div>
            </div>
          )}

          <ContractorInvitationDetails
            invitation={invitation}
            onInvitationProcessed={handleInvitationProcessed}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ContractorInvitationTokenPage;