import React from 'react';
import { motion } from 'framer-motion';
import { SubscriptionLimitItem, StorageLimitItem } from '@utils/api';

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
  isStorage = false 
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      normal: 'from-earth-500 to-earth-600',
      approaching: 'from-safety-500 to-safety-600', 
      warning: 'from-construction-500 to-construction-600',
      exceeded: 'from-red-500 to-red-600',
      unlimited: 'from-blue-500 to-blue-600'
    };
    return colors[status as keyof typeof colors] || 'from-steel-400 to-steel-500';
  };

  const getStatusBgColor = (status: string) => {
    const colors = {
      normal: 'bg-earth-50 border-earth-200',
      approaching: 'bg-safety-50 border-safety-200',
      warning: 'bg-construction-50 border-construction-200', 
      exceeded: 'bg-red-50 border-red-200',
      unlimited: 'bg-blue-50 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-steel-50 border-steel-200';
  };

  const getStatusTextColor = (status: string) => {
    const colors = {
      normal: 'text-earth-700',
      approaching: 'text-safety-700',
      warning: 'text-construction-700',
      exceeded: 'text-red-700', 
      unlimited: 'text-blue-700'
    };
    return colors[status as keyof typeof colors] || 'text-steel-700';
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

  if (limit.is_unlimited) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${getStatusBgColor('unlimited')}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-blue">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-steel-900">{title}</h4>
              <p className="text-sm text-steel-600">Безлимитно</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">∞</div>
            <div className="text-xs text-blue-600">Безлимитно</div>
          </div>
        </div>
        
        <div className="flex items-center text-blue-600 bg-blue-100 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">Безлимитный доступ</span>
        </div>
      </motion.div>
    );
  }

  const usedValue = getUsedValue();
  const limitValue = getLimitValue();
  const remainingValue = getRemainingValue();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${getStatusBgColor(limit.status)}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${getStatusColor(limit.status)} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-steel-900">{title}</h4>
            <p className="text-sm text-steel-600">
              {formatValue(usedValue)} / {limitValue ? formatValue(limitValue) : '∞'} {unit}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getStatusTextColor(limit.status)}`}>
            {Math.round(limit.percentage_used)}%
          </div>
          <div className={`text-xs ${getStatusTextColor(limit.status)}`}>
            Использовано
          </div>
        </div>
      </div>
      
      {/* Прогресс-бар */}
      <div className="mb-4">
        <div className="w-full bg-steel-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(limit.percentage_used, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 bg-gradient-to-r ${getStatusColor(limit.status)} transition-all duration-300`}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-steel-600">
          <span>0 {unit}</span>
          <span>{limitValue ? formatValue(limitValue) : '∞'} {unit}</span>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-steel-600">
          <span className="font-medium">Осталось:</span>
        </div>
        <div className={`text-sm font-medium ${getStatusTextColor(limit.status)}`}>
          {remainingValue > 0 ? `${formatValue(remainingValue)} ${unit}` : 'Лимит исчерпан'}
        </div>
      </div>

      {/* Индикатор статуса */}
      <div className="mt-3 flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${
          limit.status === 'exceeded' ? 'bg-red-500 animate-pulse' : 
          limit.status === 'warning' ? 'bg-construction-500 animate-pulse' :
          limit.status === 'approaching' ? 'bg-safety-500' : 'bg-earth-500'
        }`}></div>
        <span className={`text-xs font-medium ${getStatusTextColor(limit.status)}`}>
          {limit.status === 'exceeded' ? 'Лимит превышен' :
           limit.status === 'warning' ? 'Приближается к лимиту' :
           limit.status === 'approaching' ? 'Использование растет' :
           'Нормальное использование'}
        </span>
      </div>
    </motion.div>
  );
};

export default LimitWidget; 