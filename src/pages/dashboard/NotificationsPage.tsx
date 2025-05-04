import React from 'react';
import Placeholder from '@components/Placeholder';
import { NotificationIcon } from '@components/icons/DashboardIcons';

const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-secondary-800 mb-6">Уведомления</h1>
      
      <Placeholder 
        title="Центр уведомлений" 
        description="Здесь будут отображаться все системные уведомления, оповещения о событиях проектов и важные напоминания."
        icon={<NotificationIcon />}
      />
    </div>
  );
};

export default NotificationsPage; 