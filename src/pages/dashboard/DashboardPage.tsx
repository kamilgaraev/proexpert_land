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

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
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