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

  const userOrg = user && 'organization' in user ? (user.organization as any) : null;
  const isHoldingOrg = userOrg?.organization_type === 'holding';

  if (!isHoldingOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600 mb-6">
            Панель холдинга доступна только для холдинговых организаций.
            Ваша организация не имеет статуса холдинга.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Вернуться в панель управления
          </Link>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-gray-900">Панель холдинга</h1>
              </div>
              {userOrg && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-purple-100 text-purple-800 border-purple-200">
                  <BuildingOfficeIcon className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{userOrg.name}</span>
                    <span className="text-xs opacity-75">Режим холдинга</span>
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

