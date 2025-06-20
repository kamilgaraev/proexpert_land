import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { SubscriptionWarning } from '@utils/api';

interface WarningsPanelProps {
  warnings: SubscriptionWarning[];
  onDismiss?: (warningType: string) => void;
  onUpgradeClick?: () => void;
}

const WarningsPanel: React.FC<WarningsPanelProps> = ({ 
  warnings, 
  onDismiss,
  onUpgradeClick 
}) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getWarningConfig = (level: 'warning' | 'critical') => {
    if (level === 'critical') {
      return {
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        icon: ExclamationTriangleIcon,
        buttonColor: 'bg-red-600 hover:bg-red-700',
        pulseColor: 'bg-red-500'
      };
    } else {
      return {
        bgColor: 'bg-construction-50 border-construction-200',
        textColor: 'text-construction-800',
        iconColor: 'text-construction-600',
        icon: InformationCircleIcon,
        buttonColor: 'bg-construction-600 hover:bg-construction-700',
        pulseColor: 'bg-construction-500'
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-steel-900 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-construction-600" />
          Уведомления о лимитах
        </h3>
        <div className="text-sm text-steel-600">
          {warnings.length} {warnings.length === 1 ? 'уведомление' : 'уведомлений'}
        </div>
      </div>

      <AnimatePresence>
        {warnings.map((warning, index) => {
          const config = getWarningConfig(warning.level);
          const Icon = config.icon;

          return (
            <motion.div
              key={`${warning.type}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl border-2 p-4 ${config.bgColor} transition-all duration-300 hover:shadow-lg`}
            >
              {/* Индикатор пульсации для критических предупреждений */}
              {warning.level === 'critical' && (
                <div className="absolute -top-1 -right-1">
                  <div className={`w-3 h-3 ${config.pulseColor} rounded-full animate-ping`}></div>
                  <div className={`absolute top-0 right-0 w-3 h-3 ${config.pulseColor} rounded-full`}></div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        warning.level === 'critical' 
                          ? 'bg-red-200 text-red-800' 
                          : 'bg-construction-200 text-construction-800'
                      }`}>
                        {warning.level === 'critical' ? 'Критично' : 'Предупреждение'}
                      </span>
                      <span className="text-xs text-steel-500 capitalize">
                        {warning.type === 'foremen' ? 'Прорабы' :
                         warning.type === 'projects' ? 'Проекты' :
                         warning.type === 'storage' ? 'Хранилище' : warning.type}
                      </span>
                    </div>

                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(warning.type)}
                        className="text-steel-400 hover:text-steel-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed ${config.textColor} mb-3`}>
                    {warning.message}
                  </p>

                  {warning.level === 'critical' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        to="/dashboard/billing"
                        onClick={onUpgradeClick}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-xl ${config.buttonColor} transition-all duration-200 hover:scale-105 shadow-lg`}
                      >
                        <ArrowUpIcon className="w-4 h-4 mr-2" />
                        Обновить тариф
                      </Link>
                      <Link
                        to="/dashboard/help"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-steel-700 bg-white border border-steel-300 rounded-xl hover:bg-steel-50 transition-colors"
                      >
                        Подробнее
                      </Link>
                    </div>
                  )}

                  {warning.level === 'warning' && (
                    <div className="flex items-center text-xs text-steel-600">
                      <div className={`w-2 h-2 ${config.pulseColor} rounded-full mr-2`}></div>
                      Рекомендуем обратить внимание на использование ресурсов
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Общая кнопка обновления, если есть критические предупреждения */}
      {warnings.some(w => w.level === 'critical') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-construction-500 to-construction-600 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Требуется обновление тарифа</h4>
              <p className="text-sm text-construction-100">
                Некоторые функции могут быть ограничены из-за превышения лимитов
              </p>
            </div>
            <Link
              to="/dashboard/billing"
              onClick={onUpgradeClick}
              className="bg-white text-construction-600 px-4 py-2 rounded-xl font-medium hover:bg-construction-50 transition-colors flex items-center"
            >
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              Обновить
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WarningsPanel; 