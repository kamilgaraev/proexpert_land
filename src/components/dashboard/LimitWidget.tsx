import React from 'react';
import { motion } from 'framer-motion';
import { SubscriptionLimitItem, StorageLimitItem } from '@utils/api';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

// Remove WidgetTheme type and interface to simplify
interface LimitWidgetProps {
  title: string;
  limit: SubscriptionLimitItem | StorageLimitItem;
  unit: string;
  icon: React.ElementType;
  isStorage?: boolean;
}

const LimitWidget: React.FC<LimitWidgetProps> = ({ 
  title, 
  limit, 
  unit, 
  icon: Icon, 
  isStorage = false,
}) => {
  // Brand theme configuration using 'construction' palette (orange)
  const theme = {
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    progress: 'bg-gradient-to-r from-orange-500 to-orange-600',
    text: 'text-slate-900',
    subText: 'text-slate-500'
  };

  const formatValue = (value: number) => {
    return isStorage ? value.toFixed(2) : value.toString();
  };

  const getUsedValue = () => {
    return isStorage ? (limit as StorageLimitItem).used_gb : (limit as SubscriptionLimitItem).used;
  };

  const getLimitValue = () => {
    return isStorage ? (limit as StorageLimitItem).limit_gb : (limit as SubscriptionLimitItem).limit;
  };

  const getRemainingValue = () => {
    return isStorage ? (limit as StorageLimitItem).remaining_gb : (limit as SubscriptionLimitItem).remaining;
  };

  const usedValue = getUsedValue();
  const limitValue = getLimitValue();
  const remainingValue = getRemainingValue();
  const percentage = Math.min(limit.percentage_used, 100);
  
  const isWarning = limit.status === 'warning' || limit.status === 'approaching';
  const isExceeded = limit.status === 'exceeded';
  
  let progressColor = theme.progress;
  if (isExceeded) progressColor = 'bg-gradient-to-r from-red-500 to-red-600';
  else if (isWarning) progressColor = 'bg-gradient-to-r from-orange-500 to-red-500';

  if (limit.is_unlimited) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${theme.iconBg}`}>
            <Icon className={`w-6 h-6 ${theme.iconColor}`} />
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600`}>
            ∞
          </span>
        </div>
        
        <div>
          <h3 className={`${theme.subText} text-sm font-medium mb-1`}>{title}</h3>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">Безлимитно</span>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${theme.progress} w-full opacity-20`} />
        </div>
        
        <div className="mt-2 text-xs text-slate-400 font-medium">
          Нет ограничений
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
    >
      {/* Background accent pattern */}
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full ${theme.iconBg} opacity-30 group-hover:opacity-60 transition-opacity`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${theme.iconBg} transition-colors duration-300`}>
          <Icon className={`w-6 h-6 ${theme.iconColor}`} />
        </div>
        
        {isExceeded ? (
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Превышен
          </span>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
            percentage > 90 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className={`${theme.subText} text-sm font-medium mb-1`}>{title}</h3>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">{formatValue(usedValue)}</span>
          <span className="text-lg text-slate-400 font-medium">/ {limitValue ? formatValue(limitValue) : '∞'}</span>
          <span className="text-xs text-slate-400 ml-1 font-medium">{unit}</span>
        </div>
      </div>

      <div className="mt-5 relative z-10">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Прогресс</span>
          <span className={`${isWarning || isExceeded ? 'text-red-600' : 'text-slate-400'} font-medium`}>
             {remainingValue > 0 ? `Осталось ${formatValue(remainingValue)}` : 'Исчерпано'}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${progressColor} shadow-sm`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LimitWidget;