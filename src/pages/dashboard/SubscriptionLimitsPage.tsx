import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CircleStackIcon,
  ArrowPathIcon,
  StarIcon,
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon
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
    needsUpgrade,
    lastUpdated
  } = useSubscriptionLimits({
    autoRefresh: false, // Отключаем автообновление на странице лимитов
      onCritical: (_warnings) => {
      },
      onWarning: (_warnings) => {
      }
  });

  const handleDismissWarning = (warningType: string) => {
    setDismissedWarnings(prev => [...prev, warningType]);
  };

  const handleUpgradeClick = () => {
  };

  const visibleWarnings = data?.warnings?.filter(
    warning => !dismissedWarnings.includes(warning.type)
  ) || [];


  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ArrowPathIcon className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Загрузка данных</h2>
              <p className="text-slate-500">Получаем информацию о подписке...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Ошибка загрузки</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <button
                onClick={refresh}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Заголовок и действия */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Моя подписка</h1>
            <p className="text-slate-500 mt-1">
              Управление тарифом и мониторинг ресурсов
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hidden sm:block">
              Обновлено: {lastUpdated?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || '--:--'}
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-all flex items-center disabled:opacity-50 font-medium"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </button>
          </div>
        </motion.div>

        {/* Основная карточка подписки */}
        {!data.has_subscription ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-500 rounded-full opacity-10 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white mb-4 border border-white/10">
                  <StarIcon className="w-3 h-3 mr-1.5 text-orange-400" />
                  Базовый доступ
                </div>
                <h2 className="text-3xl font-bold mb-3">Переходите на Pro уровень</h2>
                <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                  Вы используете ограниченную версию. Получите полный доступ ко всем инструментам для эффективного управления строительством.
                </p>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/dashboard/billing"
                    className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center group"
                  >
                    Выбрать тариф
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/dashboard/features"
                    className="px-8 py-3.5 rounded-xl font-bold text-white border border-white/20 hover:bg-white/10 transition-all"
                  >
                    Сравнить планы
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 transform hover:rotate-6 transition-transform duration-500">
                  <StarIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : data.subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
            <div className="p-8">
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Левая часть: Информация о плане */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                      <StarIcon className="w-7 h-7 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{data.subscription.plan_name}</h2>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          data.subscription.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {data.subscription.status === 'active' ? 'Активна' : 'Пробный период'}
                        </span>
                        {data.subscription.is_trial && (
                          <span className="ml-2 text-xs text-slate-500 font-medium">
                            Trial
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed mb-6 max-w-2xl">
                    {data.subscription.plan_description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/dashboard/billing"
                      className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                    >
                      Управление подпиской
                    </Link>
                    {data.subscription.next_billing_at && (
                       <div className="inline-flex items-center px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium border border-slate-200">
                         <CreditCardIcon className="w-4 h-4 mr-2 text-slate-400" />
                         След. списание: {new Date(data.subscription.next_billing_at).toLocaleDateString()}
                       </div>
                    )}
                  </div>
                </div>

                {/* Правая часть: Даты и статистика */}
                <div className="lg:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 opacity-80">Сроки действия</h3>
                  <div className="space-y-4">
                    {data.subscription.is_trial && data.subscription.trial_ends_at && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                          <ClockIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Пробный период до</div>
                          <div className="text-sm font-bold text-slate-900">
                            {new Date(data.subscription.trial_ends_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {data.subscription.ends_at && (
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-white border border-slate-200 rounded-lg mt-0.5">
                          <ClockIcon className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Подписка активна до</div>
                          <div className="text-sm font-bold text-slate-900">
                            {new Date(data.subscription.ends_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer карточки: Функции */}
              {data.features && data.features.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center mb-4">
                     <SparklesIcon className="w-4 h-4 text-orange-500 mr-2" />
                     <span className="text-sm font-bold text-slate-900">Включено в ваш тариф</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6">
                    {data.features.map((feature, index) => (
                      <div key={index} className="flex items-start group">
                        <CheckCircleIcon className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-slate-600 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Сетка лимитов */}
        {data.limits && (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Использование ресурсов</h3>
                {!data.has_subscription && (
                  <span className="text-sm text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-lg">
                    Лимиты бесплатного тарифа
                  </span>
                )}
             </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <LimitWidget
                title="Прорабы"
                limit={data.limits.foremen}
                unit="чел."
                icon={UsersIcon}
              />
              <LimitWidget
                title="Пользователи"
                limit={data.limits.users}
                unit="чел."
                icon={UserGroupIcon}
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
          </div>
        )}

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

        {/* Блок призыва к действию (Upgrade) */}
        {needsUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-red-900 mb-2">Лимиты исчерпаны</h3>
              <p className="text-red-700 mb-6 max-w-2xl mx-auto">
                Для продолжения бесперебойной работы и добавления новых ресурсов необходимо обновить тарифный план.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/dashboard/billing"
                  className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Обновить сейчас
                </Link>
                <Link
                  to="/dashboard/help"
                  className="bg-white text-red-700 border border-red-200 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors"
                >
                  Написать в поддержку
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionLimitsPage;