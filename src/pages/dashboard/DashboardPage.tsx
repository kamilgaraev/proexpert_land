import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  TicketIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { billingService } from '@utils/api';
import { useSubscriptionLimits } from '@hooks/useSubscriptionLimits';

const DashboardPage = () => {
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
    onCritical: (warnings) => {
      console.log('🚨 Критические лимиты на главной:', warnings);
    },
    onWarning: (warnings) => {
      console.log('⚠️ Предупреждения о лимитах на главной:', warnings);
    }
  });

  useEffect(() => {
    (async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const res = await billingService.getOrgDashboard();
        setDashboard(res.data);
      } catch (e: any) {
        setDashboardError(e.message || 'Ошибка загрузки данных');
      } finally {
        setDashboardLoading(false);
      }
    })();
  }, []);

  const projectStats = [
    {
      name: 'Активные проекты',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'construction'
    },
    {
      name: 'Команда',
      value: '28',
      change: '+3',
      changeType: 'increase', 
      icon: UsersIcon,
      color: 'safety'
    },
    {
      name: 'Завершено в месяц',
      value: '5',
      change: '+1',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'earth'
    },
    {
      name: 'Общий бюджет',
      value: '₽2.4М',
      change: '+15%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'steel'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'ЖК "Северный"',
      status: 'В работе',
      progress: 75,
      team: 8,
      deadline: '2024-03-15',
      budget: '₽850,000'
    },
    {
      id: 2, 
      name: 'Торговый центр "Мега"',
      status: 'Планирование',
      progress: 25,
      team: 12,
      deadline: '2024-06-20',
      budget: '₽1,200,000'
    },
    {
      id: 3,
      name: 'Офисное здание "Технопарк"',
      status: 'В работе',
      progress: 90,
      team: 6,
      deadline: '2024-02-10',
      budget: '₽450,000'
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'В работе': return 'bg-construction-100 text-construction-800';
      case 'Планирование': return 'bg-safety-100 text-safety-800';
      case 'Завершен': return 'bg-earth-100 text-earth-800';
      default: return 'bg-steel-100 text-steel-800';
    }
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
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {projectStats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.name}
              className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-steel-600 text-sm font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-steel-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-earth-500 mr-1" />
                    <span className="text-earth-600 text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

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
                        <p className="text-xs text-steel-500 mt-1">
                          до {new Date(addon.expires_at).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      addon.status === 'active' 
                        ? 'bg-earth-100 text-earth-700' 
                        : 'bg-steel-100 text-steel-600'
                    }`}>
                      {addon.status === 'active' ? 'Активен' : addon.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TruckIcon className="h-12 w-12 text-steel-300 mx-auto mb-3" />
                <p className="text-steel-500">Нет активных дополнительных услуг</p>
                <Link 
                  to="/dashboard/paid-services"
                  className="text-construction-600 hover:text-construction-700 text-sm font-medium mt-2 inline-block"
                >
                  Посмотреть доступные услуги →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}

      {/* Последние проекты */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-steel-900">Активные проекты</h2>
          <Link 
            to="/dashboard/projects"
            className="text-construction-600 hover:text-construction-700 font-medium flex items-center"
          >
            Все проекты
            <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-steel-900">{project.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-steel-600">Прогресс</span>
                    <span className="font-medium text-steel-900">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-steel-100 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-gradient-to-r from-construction-500 to-construction-600 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-steel-600">Команда:</span>
                  <span className="font-medium text-steel-900">{project.team} чел.</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-steel-600">Дедлайн:</span>
                  <span className="font-medium text-steel-900">{new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-steel-600">Бюджет:</span>
                  <span className="font-medium text-construction-600">{project.budget}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

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