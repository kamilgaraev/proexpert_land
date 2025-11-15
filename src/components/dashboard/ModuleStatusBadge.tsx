import React from 'react';
import { DevelopmentStatusInfo } from '@utils/api';
import {
  CodeBracketIcon,
  CheckCircleIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

interface ModuleStatusBadgeProps {
  developmentStatus?: DevelopmentStatusInfo;
}

const ModuleStatusBadge: React.FC<ModuleStatusBadgeProps> = ({ developmentStatus }) => {
  if (!developmentStatus) {
    // По умолчанию считаем модуль стабильным, если статус не указан
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Стабильный
      </span>
    );
  }

  const { label, color, icon } = developmentStatus;
  
  // Маппинг цветов на классы Tailwind
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
  };

  // Маппинг иконок
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.FC<{ className?: string }>> = {
      'check-circle': CheckCircleIcon,
      'check': CheckCircleIcon,
      'beaker': BeakerIcon,
      'flask': BeakerIcon,
      'code': CodeBracketIcon,
      'code-bracket': CodeBracketIcon,
      'clock': ClockIcon,
      'time': ClockIcon,
      'exclamation-triangle': ExclamationTriangleIcon,
      'warning': ExclamationTriangleIcon,
      'archive-box-x-mark': ArchiveBoxXMarkIcon,
      'archive': ArchiveBoxXMarkIcon,
      'x-mark': ArchiveBoxXMarkIcon
    };

    return iconMap[iconName] || CodeBracketIcon;
  };

  const IconComponent = getIconComponent(icon);
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color] || colorClasses.green}`}
      title={developmentStatus.description}
    >
      <IconComponent className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
};

export default ModuleStatusBadge;

