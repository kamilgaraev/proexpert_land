import React from 'react';
import Placeholder from '@components/Placeholder';
import { CalendarIcon } from '@components/icons/DashboardIcons';

const CalendarPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Календарь</h1>
      
      <Placeholder 
        title="Календарь работ" 
        description="Здесь будет представлен календарь с планируемыми работами, сроками выполнения задач, важными событиями и встречами."
        icon={<CalendarIcon />}
      />
    </div>
  );
};

export default CalendarPage; 