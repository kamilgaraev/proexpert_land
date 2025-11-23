import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CircleStackIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import LimitWidget from '@/components/dashboard/LimitWidget';
import WarningsPanel from '@/components/dashboard/WarningsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LimitsView: React.FC = () => {
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);

  const { 
    data, 
    loading, 
    error, 
    refresh, 
    needsUpgrade,
    lastUpdated
  } = useSubscriptionLimits({
    autoRefresh: false,
      onCritical: (_warnings) => {
      },
      onWarning: (_warnings) => {
      }
  });

  const handleDismissWarning = (warningType: string) => {
    setDismissedWarnings(prev => [...prev, warningType]);
  };

  const handleUpgradeClick = () => {
    // Logic to switch tab to Plans or navigate
    // For now, let's assume this component is used inside tabs where Plans is another tab
    // We can dispatch an event or use a context if needed, but link is also fine if it just scrolls or switches
  };

  const visibleWarnings = data?.warnings?.filter(
    warning => !dismissedWarnings.includes(warning.type)
  ) || [];


  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
           <ArrowPathIcon className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
           <p className="text-muted-foreground">Загрузка лимитов...</p>
        </div>
     </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Ошибка загрузки</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={refresh} variant="default">
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-foreground">Мои лимиты</h2>
            <p className="text-muted-foreground">Мониторинг использования ресурсов</p>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
              Обновлено: {lastUpdated?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || '--:--'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
         </div>
      </div>

      {/* Основная карточка подписки если нет подписки */}
      {!data.has_subscription && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-500 rounded-full opacity-10 blur-3xl"></div>
          <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
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
                <Link to="/dashboard/billing?tab=plans">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20 font-bold h-12 px-8 rounded-xl">
                    Выбрать тариф <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 transform hover:rotate-6 transition-transform duration-500">
                <StarIcon className="w-16 h-16 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сетка лимитов */}
      {data.limits && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      )}

      {/* Панель предупреждений */}
      {visibleWarnings.length > 0 && (
        <WarningsPanel
          warnings={visibleWarnings}
          onDismiss={handleDismissWarning}
          onUpgradeClick={handleUpgradeClick}
        />
      )}

      {/* Блок призыва к действию (Upgrade) */}
      {needsUpgrade && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-red-900 mb-2">Лимиты исчерпаны</h3>
            <p className="text-red-700 mb-6 max-w-2xl mx-auto">
              Для продолжения бесперебойной работы и добавления новых ресурсов необходимо обновить тарифный план.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard/billing?tab=plans">
                <Button variant="destructive" className="font-bold px-8 py-6 h-auto rounded-xl shadow-lg shadow-red-200">
                  Обновить сейчас
                </Button>
              </Link>
              <Link to="/dashboard/help">
                <Button variant="outline" className="font-bold text-red-700 border-red-200 hover:bg-red-50 px-8 py-6 h-auto rounded-xl">
                  Написать в поддержку
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitsView;

