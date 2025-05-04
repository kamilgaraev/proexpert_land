import React from 'react';
import Placeholder from '@components/Placeholder';
import { HelpIcon } from '@components/icons/DashboardIcons';

const HelpPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Справка</h1>
      
      <Placeholder 
        title="Центр помощи" 
        description="Здесь будет доступна документация по использованию системы, ответы на часто задаваемые вопросы и форма обращения в техническую поддержку."
        icon={<HelpIcon />}
      />
    </div>
  );
};

export default HelpPage; 