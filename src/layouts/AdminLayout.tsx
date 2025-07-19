import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  UsersIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '@hooks/useAdminAuth';
import { classNames } from '@utils/classNames';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { 
      name: 'Панель управления', 
      href: '/admin', 
      icon: ChartBarIcon,
      description: 'Обзор и статистика'
    },
    { 
      name: 'Блог', 
      href: '/admin/blog', 
      icon: DocumentTextIcon,
      description: 'Управление контентом',
      subItems: [
        { name: '📊 Дашборд', href: '/admin/blog' },
        { name: '📝 Статьи', href: '/admin/blog/articles' },
        { name: '📂 Категории', href: '/admin/blog/categories' },
        { name: '💬 Комментарии', href: '/admin/blog/comments' },
        { name: '🔍 SEO', href: '/admin/blog/seo' },
      ]
    },
    { 
      name: 'Вакансии', 
      href: '/admin/vacancies', 
      icon: BriefcaseIcon,
      description: 'HR и подбор'
    },
    { 
      name: 'Пользователи', 
      href: '/admin/users', 
      icon: UsersIcon,
      description: 'Управление аккаунтами'
    },
    { 
      name: 'Проекты', 
      href: '/admin/projects', 
      icon: FolderIcon,
      description: 'Контроль проектов'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-indigo-200">ProHelper</p>
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="px-6 py-6 border-b border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-white">{admin?.name || 'Администратор'}</p>
                <p className="text-xs text-slate-400">{admin?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                  {admin?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={classNames(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon 
                    className={classNames(
                      'mr-4 h-6 w-6 transition-colors',
                      isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    )} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={classNames(
                      'text-xs mt-0.5',
                      isActive(item.href) ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'
                    )}>
                      {item.description}
                    </div>
                  </div>
                </Link>
                {item.subItems && isActive(item.href) && (
                  <div className="mt-2 ml-6 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={classNames(
                          'block px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                          location.pathname === subItem.href
                            ? 'bg-indigo-500 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="px-4 pb-6 space-y-2">
            <Link
              to="/admin/settings"
              className="group flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              <CogIcon className="mr-4 h-6 w-6 text-slate-400 group-hover:text-white" />
              <span>Настройки</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6 text-slate-400 group-hover:text-white" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
          <button
            className="text-slate-600 hover:text-slate-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
          </div>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-72">
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-slate-200">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {navItems.find(item => isActive(item.href))?.name || 'Панель управления'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-slate-700">{admin?.name}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Mobile logo */}
            <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                  <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                  <p className="text-xs text-indigo-200">ProHelper</p>
                </div>
              </div>
            </div>

            {/* Mobile user info */}
            <div className="px-6 py-6 border-b border-slate-700">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-white">{admin?.name || 'Администратор'}</p>
                  <p className="text-xs text-slate-400">{admin?.email}</p>
                </div>
              </div>
            </div>

            {/* Mobile navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={classNames(
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon 
                      className={classNames(
                        'mr-4 h-6 w-6 transition-colors',
                        isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      )} 
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={classNames(
                        'text-xs mt-0.5',
                        isActive(item.href) ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                  {item.subItems && isActive(item.href) && (
                    <div className="mt-2 ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={classNames(
                            'block px-3 py-2 text-sm rounded-lg transition-colors duration-200',
                            location.pathname === subItem.href
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          )}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile bottom section */}
            <div className="px-4 pb-6 space-y-2">
              <Link
                to="/admin/settings"
                className="group flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-slate-800 hover:text-white transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <CogIcon className="mr-4 h-6 w-6 text-slate-400 group-hover:text-white" />
                <span>Настройки</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6 text-slate-400 group-hover:text-white" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout; 