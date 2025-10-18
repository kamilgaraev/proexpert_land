import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MultiOrgErrorBoundary } from '@/components/multi-org/MultiOrgErrorBoundary';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Обзор холдинга',
    href: '/landing/multi-organization/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Проекты',
    href: '/landing/multi-organization/projects',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Контракты',
    href: '/landing/multi-organization/contracts',
    icon: DocumentTextIcon,
  },
];

export const HoldingPanelLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Получаем информацию об организации
  const userOrg = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrg = userOrg?.organization_type === 'holding';
  
  // Доступ разрешен если модуль активен и есть права
  // Компоненты внутри сами покажут нужный UI в зависимости от organization_type

  return (
    <MultiOrgErrorBoundary fallbackPath="/dashboard">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">
                  {isHoldingOrg ? 'Панель холдинга' : 'Мультиорганизация'}
                </h1>
              </div>
              {userOrg && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  isHoldingOrg 
                    ? 'bg-purple-100 text-purple-800 border-purple-200' 
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  <BuildingOfficeIcon className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{userOrg.name}</span>
                    <span className="text-xs opacity-75">
                      {isHoldingOrg ? 'Режим холдинга' : 'Режим организации'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-4 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
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

        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-500">
              © 2025 ProHelper. Панель управления холдингом.
            </div>
          </div>
        </footer>
      </div>
    </MultiOrgErrorBoundary>
  );
};

