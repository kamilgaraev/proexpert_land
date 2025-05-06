import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  UsersIcon, 
  CogIcon, 
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  TicketIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Заглушка для баланса
  const currentBalance = '15,750.00 ₽'; // Позже будет из API или контекста

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Основные пункты ЛК Владельца
  const mainNavigation = [
    { name: 'Обзор', href: '/dashboard', icon: HomeIcon },
    { name: 'Баланс', href: '/dashboard/billing', icon: BanknotesIcon },
    { name: 'Подписки', href: '/dashboard/subscriptions', icon: TicketIcon },
    { name: 'Администраторы', href: '/dashboard/admins', icon: ShieldCheckIcon }, // Управление пользователями админки
    { name: 'Профиль', href: '/dashboard/profile', icon: UserCircleIcon },
    { name: 'Справка', href: '/dashboard/help', icon: QuestionMarkCircleIcon }, // Включает ссылку на поддержку
  ];

  // Функция для определения активного пункта меню
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Мобильная шторка */}
      <div 
        className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}
        aria-hidden="true"
      >
        {/* Затемнение фона */}
        <div 
          className={`fixed inset-0 bg-secondary-900 bg-opacity-75 transition-opacity duration-300 ease-linear ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Боковое меню */}
        <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Закрыть */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Закрыть меню</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          {/* Логотип */}
          <div className="flex h-16 shrink-0 items-center px-6">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="ProExpert"
            />
          </div>
          
          {/* Навигация */}
          <div className="mt-5 flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-6 w-6 ${
                    isActive(item.href)
                      ? 'text-primary-500'
                      : 'text-secondary-500 group-hover:text-secondary-700'
                  }`} aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Выход */}
          <div className="border-t border-secondary-200 p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6 text-secondary-500 group-hover:text-secondary-700" aria-hidden="true" />
              Выйти
            </button>
          </div>
        </div>
      </div>
      
      {/* Статический сайдбар для десктопа */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-secondary-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="ProExpert"
              />
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href)
                      ? 'text-primary-500'
                      : 'text-secondary-500 group-hover:text-secondary-700'
                  }`} aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Выход */}
          <div className="border-t border-secondary-200 p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-secondary-500 group-hover:text-secondary-700" aria-hidden="true" />
              Выйти
            </button>
          </div>
        </div>
      </div>
      
      {/* Контент */}
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-4 md:px-6">
            <button
              type="button"
              className="md:hidden inline-flex h-12 w-12 items-center justify-center rounded-md text-secondary-500 hover:text-secondary-900 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Открыть меню</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex justify-between md:justify-end">
              <div className="flex items-center space-x-4">
                {/* Баланс и ссылка на биллинг */}
                <Link to="/dashboard/billing" className="flex items-center text-sm font-medium text-secondary-700 hover:text-primary-600">
                  <WalletIcon className="h-5 w-5 mr-1.5 text-secondary-500 group-hover:text-primary-500" />
                  <span>Баланс: {currentBalance}</span>
                </Link>
                
                {/* Профиль пользователя */}
                <Link to="/dashboard/profile" className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full bg-secondary-200"
                    src={"/avatar-placeholder.svg"}
                    alt="Аватар пользователя"
                  />
                  <span className="ml-2 text-sm font-medium text-secondary-900">
                    {user?.name || 'Администратор'}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 