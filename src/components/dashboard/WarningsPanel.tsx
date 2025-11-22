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
        bgColor: 'bg-red-50 border-red-100',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        icon: ExclamationTriangleIcon,
        buttonColor: 'bg-red-600 hover:bg-red-700',
        pulseColor: 'bg-red-500'
      };
    } else {
      return {
        bgColor: 'bg-orange-50 border-orange-100',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600',
        icon: InformationCircleIcon,
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        pulseColor: 'bg-orange-500'
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
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
          Уведомления о лимитах
        </h3>
        <div className="text-sm text-slate-500">
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
              className={`relative rounded-2xl border p-5 ${config.bgColor} transition-all duration-300 hover:shadow-md`}
            >
              {/* Индикатор пульсации для критических предупреждений */}
              {warning.level === 'critical' && (
                <div className="absolute -top-1 -right-1">
                  <div className={`w-3 h-3 ${config.pulseColor} rounded-full animate-ping`}></div>
                  <div className={`absolute top-0 right-0 w-3 h-3 ${config.pulseColor} rounded-full`}></div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        warning.level === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {warning.level === 'critical' ? 'Критично' : 'Внимание'}
                      </span>
                      <span className="text-xs text-slate-500 capitalize font-medium">
                        {warning.type === 'foremen' ? 'Прорабы' :
                         warning.type === 'projects' ? 'Проекты' :
                         warning.type === 'storage' ? 'Хранилище' : warning.type}
                      </span>
                    </div>

                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(warning.type)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-black/5 rounded-lg"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed ${config.textColor} mb-4 font-medium`}>
                    {warning.message}
                  </p>

                  {warning.level === 'critical' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/dashboard/billing"
                        onClick={onUpgradeClick}
                        className={`inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-xl ${config.buttonColor} transition-all duration-200 hover:scale-105 shadow-md`}
                      >
                        <ArrowUpIcon className="w-4 h-4 mr-2" />
                        Обновить тариф
                      </Link>
                      <Link
                        to="/dashboard/help"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Подробнее
                      </Link>
                    </div>
                  )}

                  {warning.level === 'warning' && (
                    <div className="flex items-center text-xs text-slate-600 font-medium bg-white/50 p-2 rounded-lg inline-block">
                      <div className={`w-2 h-2 ${config.pulseColor} rounded-full mr-2 inline-block`}></div>
                      Рекомендуем проверить использование ресурсов
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
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-bold text-lg mb-1">Требуется обновление тарифа</h4>
              <p className="text-sm text-orange-50 opacity-90">
                Некоторые функции могут быть ограничены из-за превышения лимитов
              </p>
            </div>
            <Link
              to="/dashboard/billing"
              onClick={onUpgradeClick}
              className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center shadow-sm"
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" />
              Обновить
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WarningsPanel; 