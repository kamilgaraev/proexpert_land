import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MultiOrgErrorBoundary } from '@/components/multi-org/MultiOrgErrorBoundary';
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
    href: '/contracts',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Отчеты',
    href: '/reports/1',
    icon: ChartBarIcon,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Загрузка панели холдинга...</p>
        </div>
      </div>
    );
  }

  const userOrg = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrg = userOrg?.organization_type === 'holding';

  return (
    <MultiOrgErrorBoundary fallbackPath="/dashboard">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-blue-600 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </button>

                <Link to="/dashboard" className="flex items-center gap-3 group">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl group-hover:bg-white/30 transition-all duration-300">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-white">
                      {userOrg?.name || 'Панель холдинга'}
                    </h1>
                    <p className="text-xs text-orange-100">
                      {isHoldingOrg ? 'Управление холдингом' : 'Система управления'}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  title="Поиск"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>

                <button
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors relative"
                  title="Уведомления"
                >
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name || 'Пользователь'}
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-200">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Профиль
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Настройки
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout?.();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                  <input
                    type="search"
                    placeholder="Поиск по организациям, проектам, контрактам..."
                    className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}
        </header>

        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-transparent text-gray-600 hover:text-orange-600 hover:border-orange-200 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="absolute left-0 top-16 bottom-0 w-64 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    location.pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {userOrg?.name || 'ProHelper'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  © 2025 Панель управления холдингом
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <Link to="/help" className="text-gray-600 hover:text-orange-600 transition-colors">
                  Помощь
                </Link>
                <Link to="/docs" className="text-gray-600 hover:text-orange-600 transition-colors">
                  Документация
                </Link>
                <Link to="/support" className="text-gray-600 hover:text-orange-600 transition-colors">
                  Поддержка
                </Link>
                <span className="text-gray-400">v2.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MultiOrgErrorBoundary>
  );
};
