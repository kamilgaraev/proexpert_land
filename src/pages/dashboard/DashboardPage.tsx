import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TicketIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
  UsersIcon,
  UserGroupIcon,
  CreditCardIcon,
  // WalletIcon, // Больше не нужен здесь для стат. карточки
  // BanknotesIcon, // Больше не нужен здесь для карточки управления
} from '@heroicons/react/24/outline';
import { DashboardIcon } from '@components/icons/DashboardIcons';
import { billingService } from '@utils/api';

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const res = await billingService.getOrgDashboard();
        setDashboard(res.data);
      } catch (e: any) {
        setDashboardError(e.message || 'Ошибка загрузки данных по тарифу');
      } finally {
        setDashboardLoading(false);
      }
    })();
  }, []);

  // Данные для статистических карточек
  const statCardsData = [
    // Карточка currentBalance удалена
    {
      id: 'totalAdmins',
      name: 'Всего администраторов',
      value: '5',
      icon: UsersIcon,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'totalForemen',
      name: 'Всего прорабов',
      value: '23',
      icon: UserGroupIcon,
      color: 'bg-teal-100 text-teal-700',
    },
    {
      id: 'currentSubscription',
      name: 'Текущая подписка',
      value: 'Профи (до 25.12.2024)',
      icon: CreditCardIcon,
      color: 'bg-indigo-100 text-indigo-700',
    },
  ];

  // Данные для карточек управления
  const managementCards = [
    // Карточка billing удалена
    {
      id: 'paid-services',
      name: 'Платные услуги',
      description: 'Тарифы, add-on и разовые покупки для вашей организации.',
      href: '/dashboard/paid-services',
      icon: TicketIcon,
      color: 'bg-primary-100 text-primary-700',
      bgColor: 'hover:bg-primary-50'
    },
    {
      id: 'admins',
      name: 'Управление администраторами',
      description: 'Добавление и настройка прав доступа для администраторов.',
      href: '/dashboard/admins',
      icon: ShieldCheckIcon,
      color: 'bg-accent-100 text-accent-700',
      bgColor: 'hover:bg-accent-50'
    },
  ];

  // Данные для карточек помощи
  const helpCards = [
    {
      id: 'help-center',
      name: 'Справочный центр',
      description: 'Найдите ответы на часто задаваемые вопросы.',
      href: '/dashboard/help',
      icon: QuestionMarkCircleIcon,
      color: 'bg-green-100 text-green-700',
      bgColor: 'hover:bg-green-50'
    },
    {
      id: 'support',
      name: 'Техническая поддержка',
      description: 'Свяжитесь с нашей командой для получения помощи.',
      href: '/dashboard/support',
      icon: LifebuoyIcon,
      color: 'bg-yellow-100 text-yellow-700',
      bgColor: 'hover:bg-yellow-50'
    },
  ];

  const Card = ({ item }: { item: typeof managementCards[0] | typeof helpCards[0] }) => (
    <Link to={item.href} className={`block p-6 bg-white shadow-lg rounded-lg ${item.bgColor} transition-colors duration-200`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 p-3 rounded-md ${item.color}`}>
          <item.icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-secondary-900">{item.name}</h3>
          <p className="mt-1 text-sm text-secondary-600">{item.description}</p>
        </div>
      </div>
    </Link>
  );

  const StatCard = ({ item }: { item: typeof statCardsData[0] }) => (
    <div className="bg-white shadow-lg rounded-lg p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md ${item.color}`}>
          <item.icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="ml-4">
          <dt className="text-sm font-medium text-secondary-500 truncate">{item.name}</dt>
          <dd className="text-2xl font-semibold text-secondary-900">{item.value}</dd>
        </div>
      </div>
    </div>
  );

  // Компонент для отображения лимита с прогресс-баром
  const LimitBar = ({ label, used, max }: { label: string; used: number; max: number }) => {
    const percent = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
    let barColor = 'bg-green-400';
    if (percent >= 90) barColor = 'bg-red-500';
    else if (percent >= 70) barColor = 'bg-yellow-400';
    return (
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>{label}</span>
          <span>{used} / {max}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div className={`h-2 rounded ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <div className="flex items-center">
          <DashboardIcon />
          <div className="ml-4">
            <h1 className="text-2xl font-semibold text-secondary-900">Обзор</h1>
            <p className="mt-1 text-sm text-secondary-500">
              Добро пожаловать в ваш личный кабинет. Здесь вы можете управлять организацией и получить помощь.
            </p>
          </div>
        </div>
      </div>

      {/* Блок тариф/лимиты/аддоны */}
      <div className="mb-10">
        {dashboardLoading ? (
          <div className="flex justify-center items-center h-32"><svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
        ) : dashboardError ? (
          <div className="text-red-600 text-sm mb-4">{dashboardError}</div>
        ) : dashboard && dashboard.plan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-5 flex flex-col">
              <div className="text-lg font-semibold text-primary-700 mb-1">Тариф: {dashboard.plan.name}</div>
              <div className="text-xs text-gray-500 mb-2">Действует до: {dashboard.plan.ends_at ? new Date(dashboard.plan.ends_at).toLocaleDateString('ru-RU') : '—'} ({dashboard.plan.days_left} дн.)</div>
              <div className="flex flex-col gap-2 mt-2">
                <LimitBar label="Прорабы" used={dashboard.plan.used_foremen} max={dashboard.plan.max_foremen} />
                <LimitBar label="Объекты" used={dashboard.plan.used_projects} max={dashboard.plan.max_projects} />
                <LimitBar label="Хранилище (ГБ)" used={dashboard.plan.used_storage_gb} max={dashboard.plan.max_storage_gb} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-5 flex flex-col">
              <div className="text-lg font-semibold text-primary-700 mb-2">Add-ons</div>
              {dashboard.addons && dashboard.addons.length > 0 ? (
                <ul className="space-y-2">
                  {dashboard.addons.map((addon: any, idx: number) => (
                    <li key={idx} className="flex items-center justify-between border-b pb-1 last:border-b-0 last:pb-0">
                      <span className="font-medium text-gray-800">{addon.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${addon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{addon.status}</span>
                      {addon.expires_at && <span className="text-xs text-gray-400 ml-2">до {new Date(addon.expires_at).toLocaleDateString('ru-RU')}</span>}
                    </li>
                  ))}
                </ul>
              ) : <span className="text-gray-400 text-sm">Нет активных add-on</span>}
            </div>
          </div>
        ) : null}
      </div>

      {dashboardLoading ? (
        <div className="flex justify-center items-center h-32"><svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
      ) : (
        <div className="space-y-10">
          {/* Секция Ключевые показатели */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Ключевые показатели</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {statCardsData.map((item) => (
                <StatCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Секция Управление организацией */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Управление организацией</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {managementCards.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Секция Помощь и поддержка */}
          <div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Помощь и поддержка</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {helpCards.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 