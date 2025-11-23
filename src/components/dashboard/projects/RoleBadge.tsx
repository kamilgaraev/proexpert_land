import type { ProjectOrganizationRole, ProjectRole } from '@/types/projects-overview';

interface RoleBadgeProps {
  role: ProjectRole | ProjectOrganizationRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

interface RoleBadgeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ROLE_CONFIGS: Record<ProjectOrganizationRole, RoleBadgeConfig> = {
  owner: {
    label: 'Владелец',
    color: 'text-amber-900',
    bgColor: 'bg-gradient-to-r from-amber-100 to-yellow-100',
    borderColor: 'border-amber-400'
  },
  customer: {
    label: 'Заказчик',
    color: 'text-purple-900',
    bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100',
    borderColor: 'border-purple-400'
  },
  general_contractor: {
    label: 'Генподрядчик',
    color: 'text-blue-900',
    bgColor: 'bg-gradient-to-r from-blue-100 to-indigo-100',
    borderColor: 'border-blue-400'
  },
  contractor: {
    label: 'Подрядчик',
    color: 'text-cyan-900',
    bgColor: 'bg-gradient-to-r from-cyan-100 to-sky-100',
    borderColor: 'border-cyan-400'
  },
  subcontractor: {
    label: 'Субподрядчик',
    color: 'text-green-900',
    bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
    borderColor: 'border-green-400'
  },
  construction_supervision: {
    label: 'Стройконтроль',
    color: 'text-red-900',
    bgColor: 'bg-gradient-to-r from-red-100 to-rose-100',
    borderColor: 'border-red-400'
  },
  designer: {
    label: 'Проектировщик',
    color: 'text-pink-900',
    bgColor: 'bg-gradient-to-r from-pink-100 to-fuchsia-100',
    borderColor: 'border-pink-400'
  },
  observer: {
    label: 'Наблюдатель',
    color: 'text-gray-700',
    bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
    borderColor: 'border-gray-400'
  }
};

const ROLE_ICONS: Record<ProjectOrganizationRole, string> = {
  owner: '👑',
  customer: '💼',
  general_contractor: '🏗️',
  contractor: '👷',
  subcontractor: '🔧',
  construction_supervision: '👁️',
  designer: '📐',
  observer: '👀'
};

export const RoleBadge = ({
  role,
  size = 'md',
  showIcon = true,
  className = ''
}: RoleBadgeProps) => {
  const roleValue: ProjectOrganizationRole = typeof role === 'string' 
    ? role 
    : role?.value || 'observer';
  
  const roleLabel = typeof role === 'string' 
    ? undefined 
    : role?.label;

  const config = ROLE_CONFIGS[roleValue] || {
    label: roleLabel || roleValue || 'Неизвестно',
    color: 'text-gray-700',
    bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
    borderColor: 'border-gray-400'
  };
  
  const displayLabel = roleLabel || config.label;
  const icon = ROLE_ICONS[roleValue] || '👤';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center space-x-1 rounded-full font-semibold border-2
        ${config.color}
        ${config.bgColor}
        ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && icon && <span className="text-base">{icon}</span>}
      <span>{displayLabel}</span>
    </span>
  );
};
