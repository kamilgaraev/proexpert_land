import React from 'react';
import { ModuleActivation } from '@utils/api';
import {
  SparklesIcon
} from '@heroicons/react/24/outline';

interface TrialBadgeProps {
  activation: ModuleActivation;
}

const TrialBadge: React.FC<TrialBadgeProps> = ({ activation }) => {
  if (!activation || activation.status !== 'trial') {
    return null;
  }

  const daysLeft = activation.days_until_expiration || 0;
  
  // Выбираем цвет в зависимости от оставшихся дней
  const getBadgeColor = () => {
    if (daysLeft <= 3) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (daysLeft <= 7) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor()}`}
      title={`Trial период истекает ${new Date(activation.trial_ends_at || '').toLocaleDateString('ru-RU')}`}
    >
      <SparklesIcon className="h-3 w-3 mr-1" />
      Trial {daysLeft} {daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}
    </span>
  );
};

export default TrialBadge;

