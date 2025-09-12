import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  TicketIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
  WrenchScrewdriverIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { landingService, billingService } from '@utils/api';
import type { LandingDashboardResponse } from '@utils/api';
import StatCard from '@components/dashboard/StatCard';
import FinancialCard from '@components/dashboard/FinancialCard';
import LineChart from '@components/dashboard/LineChart';
import DonutStatusChart from '@components/dashboard/DonutStatusChart';
import { useSubscriptionLimits } from '@hooks/useSubscriptionLimits';

const DashboardPage = () => {
  const [landingData, setLandingData] = useState<LandingDashboardResponse | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Хук для лимитов подписки
  const { 
    hasWarnings, 
    criticalWarnings, 
    needsUpgrade 
  } = useSubscriptionLimits({
    autoRefresh: true,
    refreshInterval: 300000, // 5 минут
    onCritical: (_warnings) => {
    },
    onWarning: (_warnings) => {
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: landing }, { data: planData }] = await Promise.all([
          landingService.getLandingDashboard(),
          billingService.getOrgDashboard(),
        ]);
        setLandingData(landing);
        setDashboard(planData);
        setDashboardError(null);
        setDashboardLoading(false);
      } catch (e: any) {
        setDashboardError(e.message || 'Ошибка загрузки данных');
        setDashboardLoading(false);
      }
    })();
  }, []);

  // Удаляем объявление const projectStats = [...] и recentProjects
  // Вместо них формируем динамический массив
  const statCards = landingData ? [
    {
      name: 'Проекты',
      value: landingData.projects.total,
      icon: <BuildingOfficeIcon className="h-6 w-6 text-white" />,
      color: 'construction',
    },
    {
      name: 'Контракты',
      value: landingData.contracts.total,
      icon: <DocumentTextIcon className="h-6 w-6 text-white" />,
      color: 'safety',
    },
    {
      name: 'Команда',
      value: landingData.team.total,
      icon: <UsersIcon className="h-6 w-6 text-white" />,
      color: 'earth',
    },
    {
      name: 'Акты',
      value: landingData.acts.total,
      icon: <CheckCircleIcon className="h-6 w-6 text-white" />,
      color: 'steel',
    },
  ] : [];

  const quickActions = [
    {
      name: 'Создать проект',
      description: 'Добавить новый строительный объект',
      href: '/dashboard/projects/create',
      icon: BuildingOfficeIcon,
      color: 'construction'
    },
    {
      name: 'Пригласить прораба',
      description: 'Добавить нового члена команды',
      href: '/dashboard/admins',
      icon: UsersIcon,
      color: 'safety'
    },
    {
      name: 'Загрузить документы',
      description: 'Добавить планы и чертежи',
      href: '/dashboard/documents',
      icon: DocumentTextIcon,
      color: 'earth'
    },
    {
      name: 'Посмотреть отчеты',
      description: 'Аналитика по проектам',
      href: '/dashboard/reports',
      icon: ChartBarIcon,
      color: 'steel'
    }
  ];

  const managementCards = [
    {
      name: 'Финансы',
      description: 'Управление бюджетом и платежами',
      href: '/dashboard/billing',
      icon: BanknotesIcon,
      color: 'construction'
    },
    {
      name: 'Команда',
      description: 'Администраторы и прорабы',
      href: '/dashboard/admins',
      icon: ShieldCheckIcon,
      color: 'safety'
    },
    {
      name: 'Услуги',
      description: 'Тарифы и дополнительные возможности',
      href: '/dashboard/paid-services',
      icon: TicketIcon,
      color: 'earth'
    }
  ];

  const supportCards = [
    {
      name: 'База знаний',
      description: 'Ответы на частые вопросы',
      href: '/dashboard/help',
      icon: QuestionMarkCircleIcon,
      color: 'steel'
    },
    {
      name: 'Техподдержка',
      description: 'Связаться с нашей командой',
      href: '/dashboard/support',
      icon: LifebuoyIcon,
      color: 'construction'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      construction: {
        bg: 'bg-gradient-to-br from-construction-500 to-construction-600',
        text: 'text-construction-600',
        lightBg: 'bg-construction-50',
        border: 'border-construction-200'
      },
      safety: {
        bg: 'bg-gradient-to-br from-safety-500 to-safety-600', 
        text: 'text-safety-600',
        lightBg: 'bg-safety-50',
        border: 'border-safety-200'
      },
      earth: {
        bg: 'bg-gradient-to-br from-earth-500 to-earth-600',
        text: 'text-earth-600', 
        lightBg: 'bg-earth-50',
        border: 'border-earth-200'
      },
      steel: {
        bg: 'bg-gradient-to-br from-steel-500 to-steel-600',
        text: 'text-steel-600',
        lightBg: 'bg-steel-50', 
        border: 'border-steel-200'
      }
    };
    return colors[color as keyof typeof colors] || colors.construction;
  };

  const LimitBar = ({ label, used, max }: { label: string; used: number; max: number }) => {
    const percent = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
    let barColor = 'bg-earth-500';
    if (percent >= 90) barColor = 'bg-construction-500';
    else if (percent >= 70) barColor = 'bg-safety-500';

    return (
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-steel-700">{label}</span>
          <span className="text-steel-600">{used} / {max}</span>
        </div>
        <div className="w-full h-3 bg-steel-100 rounded-full overflow-hidden">
          <div
            className={`h-3 rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-steel-900 mb-2">
            Добро пожаловать в ProExpert
          </h1>
          <p className="text-steel-600 text-lg">
            Управляйте строительными проектами эффективно
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm text-steel-500">
          <ClockIcon className="h-4 w-4" />
          <span>Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}</span>
        </div>
      </motion.div>

      {/* Предупреждения о лимитах */}
      {hasWarnings && criticalWarnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              <div>
                <h3 className="font-semibold">Внимание к лимитам</h3>
                <p className="text-sm text-red-100">
                  {criticalWarnings.length === 1 
                    ? `1 критическое предупреждение` 
                    : `${criticalWarnings.length} критических предупреждений`}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/dashboard/limits"
                className="bg-white text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm"
              >
                Подробнее
              </Link>
              {needsUpgrade && (
                <Link
                  to="/dashboard/billing"
                  className="bg-red-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-800 transition-colors text-sm"
                >
                  Обновить тариф
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Статистика */}
      {landingData && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <FinancialCard
            balance={landingData.financial.balance}
            credits={landingData.financial.credits_this_month}
            debits={landingData.financial.debits_this_month}
          />
          {statCards.map((card) => (
            <StatCard
              key={card.name}
              title={card.name}
              value={card.value.toString()}
              icon={card.icon}
              colorClasses={getColorClasses(card.color)}
            />
          ))}
        </motion.div>
      )}

      {/* Графики */}
      {landingData && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <LineChart
            title="Проекты по месяцам"
            labels={landingData.charts.projects_monthly.labels}
            values={landingData.charts.projects_monthly.values}
          />
          <LineChart
            title="Контракты по месяцам"
            labels={landingData.charts.contracts_monthly.labels}
            values={landingData.charts.contracts_monthly.values}
          />
          <LineChart
            title="Завершённые работы"
            labels={landingData.charts.completed_works_monthly.labels}
            values={landingData.charts.completed_works_monthly.values}
          />
          <LineChart
            title="Баланс"
            labels={landingData.charts.balance_monthly.labels}
            values={landingData.charts.balance_monthly.values}
          />
        </motion.div>
      )}

      {/* Кольцевые диаграммы */}
      {landingData && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <DonutStatusChart title="Статусы проектов" data={landingData.charts.projects_status} />
          <DonutStatusChart title="Статусы контрактов" data={landingData.charts.contracts_status} />
        </motion.div>
      )}

      {/* Тариф и лимиты */}
      {dashboardLoading ? (
        <motion.div
          className="flex justify-center items-center h-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-construction-200 border-t-construction-600"></div>
        </motion.div>
      ) : dashboardError ? (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{dashboardError}</span>
          </div>
        </motion.div>
      ) : dashboard && dashboard.plan ? (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-steel-900">Тариф: {dashboard.plan.name}</h3>
                <p className="text-steel-600 text-sm">
                  Действует до: {dashboard.plan.ends_at ? new Date(dashboard.plan.ends_at).toLocaleDateString('ru-RU') : '—'}
                  <span className="ml-2 text-construction-600 font-medium">({dashboard.plan.days_left} дн.)</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-construction-500 to-construction-600 rounded-xl flex items-center justify-center">
                <TicketIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <LimitBar label="Прорабы" used={dashboard.plan.used_foremen} max={dashboard.plan.max_foremen} />
              <LimitBar label="Объекты" used={dashboard.plan.used_projects} max={dashboard.plan.max_projects} />
              <LimitBar label="Хранилище (ГБ)" used={dashboard.plan.used_storage_gb} max={dashboard.plan.max_storage_gb} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-steel-900">Дополнительные услуги</h3>
                <p className="text-steel-600 text-sm">Активные add-ons и расширения</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-safety-500 to-safety-600 rounded-xl flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            {dashboard.addons && dashboard.addons.length > 0 ? (
              <div className="space-y-3">
                {dashboard.addons.map((addon: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-steel-50 rounded-lg">
                    <div>
                      <span className="font-medium text-steel-900">{addon.name}</span>
                      {addon.expires_at && (
                        <p className="text-xs text-steel-500 mt-1">до {new Date(addon.expires_at).toLocaleDateString('ru-RU')}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      addon.status === 'active' ? 'bg-earth-100 text-earth-700' : 'bg-steel-100 text-steel-600'
                    }`}>{addon.status === 'active' ? 'Активен' : addon.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TruckIcon className="h-12 w-12 text-steel-300 mx-auto mb-3" />
                <p className="text-steel-500">Нет активных дополнительных услуг</p>
                <Link to="/dashboard/paid-services" className="text-construction-600 hover:text-construction-700 text-sm font-medium mt-2 inline-block">Посмотреть доступные услуги →</Link>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}

      {/* Быстрые действия */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-steel-900 mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const colors = getColorClasses(action.color);
            return (
              <motion.div
                key={action.name}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Link
                  to={action.href}
                  className="block bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-steel-900 mb-2">{action.name}</h3>
                  <p className="text-steel-600 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Управление и поддержка */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-steel-900 mb-6">Управление</h2>
          <div className="space-y-4">
            {managementCards.map((card, index) => {
              const colors = getColorClasses(card.color);
              return (
                <motion.div
                  key={card.name}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    to={card.href}
                    className="flex items-center p-4 bg-white rounded-xl shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mr-4`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-steel-900">{card.name}</h3>
                      <p className="text-steel-600 text-sm">{card.description}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-steel-900 mb-6">Поддержка</h2>
          <div className="space-y-4">
            {supportCards.map((card, index) => {
              const colors = getColorClasses(card.color);
              return (
                <motion.div
                  key={card.name}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                >
                  <Link
                    to={card.href}
                    className="flex items-center p-4 bg-white rounded-xl shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mr-4`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-steel-900">{card.name}</h3>
                      <p className="text-steel-600 text-sm">{card.description}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage; 