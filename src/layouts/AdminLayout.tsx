import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { classNames } from '@utils/classNames';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Блог', href: '/admin/blog' },
    { name: 'Вакансии', href: '/admin/vacancies' },
    { name: 'Пользователи', href: '/admin/users' },
    { name: 'Проекты', href: '/admin/projects' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <div className="h-16 flex items-center px-4 border-b">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-4 flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex-shrink-0 w-full bg-white border-b h-16 flex items-center px-4">
        <button
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-bold">Admin Panel</h1>
      </div>

      {/* Main content */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0 p-4">
        <Outlet />
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Закрыть меню</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="h-16 flex items-center px-4 border-b">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <nav className="mt-4 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout; 