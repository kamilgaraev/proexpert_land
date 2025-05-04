import React from 'react';
import Placeholder from '@components/Placeholder';
import { FinanceIcon } from '@components/icons/DashboardIcons';

const FinancePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Финансы</h1>
      
      <Placeholder 
        title="Финансовый учет" 
        description="Здесь будет доступна информация о финансовых операциях, бюджетах проектов, отчеты и аналитика по расходам и доходам."
        icon={<FinanceIcon />}
      />
    </div>
  );
};

export default FinancePage; 