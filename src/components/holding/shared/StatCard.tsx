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
    bg: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-100 text-orange-600',
    trend: 'text-orange-600',
  },
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-100 text-blue-600',
    trend: 'text-blue-600',
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'bg-green-100 text-green-600',
    trend: 'text-green-600',
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-100 text-purple-600',
    trend: 'text-purple-600',
  },
  yellow: {
    bg: 'from-yellow-500 to-yellow-600',
    icon: 'bg-yellow-100 text-yellow-600',
    trend: 'text-yellow-600',
  },
  red: {
    bg: 'from-red-500 to-red-600',
    icon: 'bg-red-100 text-red-600',
    trend: 'text-red-600',
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

