import React from 'react';
import Placeholder from '@components/Placeholder';
import { TeamIcon } from '@components/icons/DashboardIcons';

const TeamPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Команда</h1>
      
      <Placeholder 
        title="Управление персоналом" 
        description="Здесь будет доступно управление сотрудниками, назначение на проекты, отслеживание занятости и учет рабочего времени."
        icon={<TeamIcon />}
      />
    </div>
  );
};

export default TeamPage; 