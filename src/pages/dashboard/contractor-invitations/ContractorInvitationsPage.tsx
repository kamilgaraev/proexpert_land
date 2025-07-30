/**
 * Страница приглашений подрядчиков в личном кабинете
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { usePageTitle } from '../../../hooks/useSEO';
import ContractorInvitationsList from '../../../components/dashboard/contractor-invitations/ContractorInvitationsList';
import ContractorInvitationsStats from '../../../components/dashboard/contractor-invitations/ContractorInvitationsStats';
import ContractorInvitationDetails from '../../../components/dashboard/contractor-invitations/ContractorInvitationDetails';
import type { ContractorInvitation } from '../../../types/contractor-invitations';

type TabType = 'invitations' | 'stats';

interface TabButtonProps {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: (id: TabType) => void;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon, active, onClick, count }) => (
  <button
    onClick={() => onClick(id)}
    className={`relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
      active
        ? 'bg-construction-600 text-white shadow-construction'
        : 'bg-white text-steel-700 hover:bg-steel-50 border border-steel-200'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
        active 
          ? 'bg-white/20 text-white' 
          : 'bg-construction-600 text-white'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const ContractorInvitationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('invitations');
  const [selectedInvitation, setSelectedInvitation] = useState<ContractorInvitation | null>(null);
  
  usePageTitle('Приглашения подрядчиков');

  const handleInvitationSelect = (invitation: ContractorInvitation) => {
    setSelectedInvitation(invitation);
  };

  const handleBackToList = () => {
    setSelectedInvitation(null);
  };

  const handleInvitationProcessed = (updatedInvitation: ContractorInvitation) => {
    setSelectedInvitation(updatedInvitation);
    // Здесь можно добавить логику для обновления списка приглашений
  };

  if (selectedInvitation) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="container-custom py-8"
      >
        <ContractorInvitationDetails
          invitation={selectedInvitation}
          onBack={handleBackToList}
          onInvitationProcessed={handleInvitationProcessed}
        />
      </motion.div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Заголовок страницы */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-steel-900 font-construction">
            Приглашения к сотрудничеству
          </h1>
          <p className="text-lg text-steel-600 mt-2 max-w-2xl mx-auto">
            Управляйте входящими приглашениями от потенциальных заказчиков и отслеживайте статистику сотрудничества
          </p>
        </motion.div>

        {/* Навигационные вкладки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <TabButton
            id="invitations"
            label="Приглашения"
            icon={EnvelopeIcon}
            active={activeTab === 'invitations'}
            onClick={setActiveTab}
          />
          <TabButton
            id="stats"
            label="Статистика"
            icon={ChartBarIcon}
            active={activeTab === 'stats'}
            onClick={setActiveTab}
          />
        </motion.div>

        {/* Контент вкладок */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'invitations' && (
            <ContractorInvitationsList
              onInvitationSelect={handleInvitationSelect}
              showFilters={true}
            />
          )}
          
          {activeTab === 'stats' && (
            <ContractorInvitationsStats
              showTitle={false}
              className="max-w-6xl mx-auto"
            />
          )}
        </motion.div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-concrete-50 to-steel-50 rounded-xl p-6 border border-steel-200"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-construction-500 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-steel-900 mb-2">
                Как работают приглашения?
              </h3>
              <div className="space-y-2 text-sm text-steel-700">
                <p>
                  <strong>1. Получение приглашения:</strong> Потенциальные заказчики находят вашу организацию 
                  и отправляют приглашение к сотрудничеству с описанием проекта.
                </p>
                <p>
                  <strong>2. Рассмотрение:</strong> Вы изучаете детали приглашения, информацию о заказчике 
                  и условия сотрудничества.
                </p>
                <p>
                  <strong>3. Принятие решения:</strong> Принимаете или отклоняете приглашение. 
                  При принятии автоматически создается подрядная связь между организациями.
                </p>
                <p>
                  <strong>4. Сотрудничество:</strong> После принятия приглашения вы получаете доступ 
                  к совместной работе и синхронизации данных с заказчиком.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Полезные ссылки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h3 className="text-lg font-semibold text-steel-900">
            Нужна помощь?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/help/contractor-invitations"
              className="inline-flex items-center px-4 py-2 bg-white border border-steel-300 rounded-lg text-steel-700 hover:bg-steel-50 transition-colors"
            >
              Справочная информация
            </a>
            <a
              href="/support"
              className="inline-flex items-center px-4 py-2 bg-construction-600 text-white rounded-lg hover:bg-construction-700 transition-colors"
            >
              Связаться с поддержкой
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContractorInvitationsPage;