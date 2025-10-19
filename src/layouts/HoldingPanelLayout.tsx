import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MultiOrgErrorBoundary } from '@/components/multi-org/MultiOrgErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  HomeIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Дашборд',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Организации',
    href: '/organizations',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Проекты',
    href: '/projects',
    icon: FolderOpenIcon,
  },
  {
    name: 'Контракты',
    href: '/projects/contracts',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Отчеты',
    href: '/reports/1',
    icon: ChartBarIcon,
  },
  {
    name: 'Лендинг сайта',
    href: '/landing/editor',
    icon: GlobeAltIcon,
  },
  {
    name: 'Настройки',
    href: '/settings',
    icon: CogIcon,
  },
];

export const HoldingPanelLayout = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Убираем initialLoad только после первой загрузки
  React.useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading, initialLoad]);

  // Закрываем меню при изменении маршрута
  React.useEffect(() => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Показываем загрузку только при первоначальной загрузке, не при навигации
  if (isLoading && initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка панели холдинга...</p>
        </div>
      </div>
    );
  }

  const userOrg = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrg = userOrg?.organization_type === 'holding';

  return (
    <MultiOrgErrorBoundary fallbackPath="/dashboard">
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
            {sidebarOpen ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-3 group">
                  <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-slate-600 transition-colors">
                    <BuildingOfficeIcon className="w-6 h-6 text-slate-200" />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-sm font-bold text-white truncate">
                      {userOrg?.name || 'Холдинг'}
                    </h1>
                    <p className="text-xs text-slate-400 truncate">
                      {isHoldingOrg ? 'Панель управления' : 'Организация'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="mx-auto text-slate-400 hover:text-white transition-colors p-1"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-800 p-3">
            <button
              onClick={() => logout?.()}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 w-full ${
                !sidebarOpen ? 'justify-center' : ''
              }`}
              title={!sidebarOpen ? 'Выйти' : undefined}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Выйти</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <aside
              className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-slate-200" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white">
                      {userOrg?.name || 'Холдинг'}
                    </h1>
                    <p className="text-xs text-slate-400">
                      {isHoldingOrg ? 'Панель управления' : 'Организация'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="px-3 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    location.pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-800 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout?.();
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 w-full"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Выйти
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => location.pathname === item.href || location.pathname.startsWith(item.href + '/'))?.name || 'Панель холдинга'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <button
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors hidden sm:block"
                title="Поиск"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors relative"
                title="Уведомления"
              >
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-2 sm:px-3 py-2 rounded-lg transition-colors"
                >
                  <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                    {user?.name || 'Пользователь'}
                  </span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Профиль
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Настройки
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout?.();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Выйти из системы
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BuildingOfficeIcon className="w-4 h-4 text-slate-600" />
                  <span className="font-medium">{userOrg?.name || 'ProHelper'}</span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span className="hidden sm:inline text-gray-500">© 2025 Все права защищены</span>
                </div>
                
                <div className="flex items-center gap-4 text-gray-500">
                  <Link to="/help" className="hover:text-slate-700 transition-colors">
                    Помощь
                  </Link>
                  <Link to="/support" className="hover:text-slate-700 transition-colors">
                    Поддержка
                  </Link>
                  <span className="text-gray-400">v2.0.0</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </MultiOrgErrorBoundary>
  );
};
