import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CircleStackIcon,
  ArrowPathIcon,
  StarIcon,
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionLimits } from '@hooks/useSubscriptionLimits';
import LimitWidget from '@components/dashboard/LimitWidget';
import WarningsPanel from '@components/dashboard/WarningsPanel';

const SubscriptionLimitsPage: React.FC = () => {
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);

  const { 
    data, 
    loading, 
    error, 
    refresh, 
    hasSubscription, 
    needsUpgrade,
    lastUpdated
  } = useSubscriptionLimits({
    autoRefresh: false, // Отключаем автообновление на странице лимитов
    onCritical: (warnings) => {
      console.log('Критические предупреждения:', warnings);
    },
    onWarning: (warnings) => {
      console.log('Обычные предупреждения:', warnings);
    }
  });

  const handleDismissWarning = (warningType: string) => {
    setDismissedWarnings(prev => [...prev, warningType]);
  };

  const handleUpgradeClick = () => {
    console.log('Переход к обновлению тарифа');
  };

  const visibleWarnings = data?.warnings?.filter(
    warning => !dismissedWarnings.includes(warning.type)
  ) || [];

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-concrete-50 to-steel-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-construction-500 to-construction-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-steel-900 mb-2">Загрузка лимитов</h2>
              <p className="text-steel-600">Получаем актуальную информацию о вашей подписке...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-concrete-50 to-steel-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-steel-900 mb-2">Ошибка загрузки</h2>
              <p className="text-steel-600 mb-4">{error}</p>
              <button
                onClick={refresh}
                className="bg-gradient-to-r from-construction-500 to-construction-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-construction transition-all duration-200 hover:scale-105"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-concrete-50 to-steel-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-steel-900 mb-2">Лимиты подписки</h1>
            <p className="text-steel-600">
              Отслеживайте использование ресурсов и управляйте подпиской
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-sm text-steel-500">
              Обновлено: {lastUpdated?.toLocaleTimeString() || 'Никогда'}
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="bg-white border border-steel-300 text-steel-700 px-4 py-2 rounded-xl hover:bg-steel-50 transition-colors flex items-center disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </button>
          </div>
        </motion.div>

        {/* Информация о подписке */}
        {data.subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-steel-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-construction-500 to-construction-600 rounded-xl flex items-center justify-center shadow-construction">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-steel-900">{data.subscription.plan_name}</h2>
                  <p className="text-steel-600">{data.subscription.plan_description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  data.subscription.status === 'active' 
                    ? 'bg-earth-100 text-earth-800' 
                    : 'bg-safety-100 text-safety-800'
                }`}>
                  {data.subscription.status === 'active' ? 'Активна' : 'Пробная'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.subscription.is_trial && data.subscription.trial_ends_at && (
                <div className="flex items-center space-x-3 p-3 bg-safety-50 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-safety-600" />
                  <div>
                    <div className="text-sm font-medium text-safety-800">Пробный период</div>
                    <div className="text-xs text-safety-600">
                      До {new Date(data.subscription.trial_ends_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {data.subscription.next_billing_at && (
                <div className="flex items-center space-x-3 p-3 bg-earth-50 rounded-xl">
                  <CreditCardIcon className="w-5 h-5 text-earth-600" />
                  <div>
                    <div className="text-sm font-medium text-earth-800">Следующее списание</div>
                    <div className="text-xs text-earth-600">
                      {new Date(data.subscription.next_billing_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {data.subscription.ends_at && (
                <div className="flex items-center space-x-3 p-3 bg-steel-50 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-steel-600" />
                  <div>
                    <div className="text-sm font-medium text-steel-800">Действует до</div>
                    <div className="text-xs text-steel-600">
                      {new Date(data.subscription.ends_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Функции подписки */}
            {data.features && data.features.length > 0 && (
              <div className="mt-6 pt-6 border-t border-steel-200">
                <h3 className="text-sm font-medium text-steel-900 mb-3">Включенные функции:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {data.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-steel-700">
                      <div className="w-2 h-2 bg-earth-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Виджеты лимитов */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <LimitWidget
            title="Прорабы"
            limit={data.limits.foremen}
            unit="чел."
            icon={UsersIcon}
          />
          <LimitWidget
            title="Проекты"
            limit={data.limits.projects}
            unit="шт."
            icon={BuildingOfficeIcon}
          />
          <LimitWidget
            title="Хранилище"
            limit={data.limits.storage}
            unit="ГБ"
            icon={CircleStackIcon}
            isStorage={true}
          />
        </motion.div>

        {/* Панель предупреждений */}
        {visibleWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WarningsPanel
              warnings={visibleWarnings}
              onDismiss={handleDismissWarning}
              onUpgradeClick={handleUpgradeClick}
            />
          </motion.div>
        )}

        {/* Действия */}
        {needsUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-construction-500 to-construction-600 rounded-2xl p-6 text-white text-center"
          >
            <h3 className="text-xl font-semibold mb-2">Требуется обновление</h3>
            <p className="text-construction-100 mb-4">
              Ваши лимиты исчерпаны. Обновите тариф для продолжения работы.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard/billing"
                className="bg-white text-construction-600 px-6 py-3 rounded-xl font-medium hover:bg-construction-50 transition-colors"
              >
                Выбрать тариф
              </Link>
              <Link
                to="/dashboard/help"
                className="border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Получить помощь
              </Link>
            </div>
          </motion.div>
        )}

        {/* Информация для пользователей без подписки */}
        {!hasSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-steel-200 p-8 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-safety-500 to-safety-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <StarIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-steel-900 mb-2">Бесплатный тариф</h3>
            <p className="text-steel-600 mb-6">
              Вы используете бесплатный тариф с ограниченными возможностями. 
              Оформите подписку для получения дополнительных функций.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard/billing"
                className="bg-gradient-to-r from-construction-500 to-construction-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-construction transition-all duration-200 hover:scale-105"
              >
                Выбрать тариф
              </Link>
              <Link
                to="/dashboard/help"
                className="border border-steel-300 text-steel-700 px-6 py-3 rounded-xl font-medium hover:bg-steel-50 transition-colors"
              >
                Узнать больше
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionLimitsPage; 