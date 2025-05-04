import React from 'react';
import Placeholder from '@components/Placeholder';
import { SettingsIcon } from '@components/icons/DashboardIcons';

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Настройки</h1>
      
      <Placeholder 
        title="Настройки системы" 
        description="Здесь вы сможете настроить параметры системы, управлять правами доступа, интеграциями и другими системными настройками."
        icon={<SettingsIcon />}
      />
    </div>
  );
};

export default SettingsPage; 