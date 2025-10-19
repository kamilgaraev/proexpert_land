import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  colorScheme?: 'orange' | 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  onClick?: () => void;
}

const colorSchemes = {
  orange: {
    bg: 'from-slate-700 to-slate-800',
    icon: 'bg-slate-100 text-slate-700',
    trend: 'text-slate-700',
  },
  blue: {
    bg: 'from-blue-600 to-blue-700',
    icon: 'bg-blue-50 text-blue-700',
    trend: 'text-blue-700',
  },
  green: {
    bg: 'from-emerald-600 to-emerald-700',
    icon: 'bg-emerald-50 text-emerald-700',
    trend: 'text-emerald-700',
  },
  purple: {
    bg: 'from-violet-600 to-violet-700',
    icon: 'bg-violet-50 text-violet-700',
    trend: 'text-violet-700',
  },
  yellow: {
    bg: 'from-amber-600 to-amber-700',
    icon: 'bg-amber-50 text-amber-700',
    trend: 'text-amber-700',
  },
  red: {
    bg: 'from-red-600 to-red-700',
    icon: 'bg-red-50 text-red-700',
    trend: 'text-red-700',
  },
};

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  colorScheme = 'orange',
  onClick,
}: StatCardProps) => {
  const colors = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <span
                  className={`flex items-center text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
          </div>

          {icon && (
            <div className={`${colors.icon} p-3 rounded-xl`}>
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className={`h-1 bg-gradient-to-r ${colors.bg}`}></div>
    </motion.div>
  );
};

