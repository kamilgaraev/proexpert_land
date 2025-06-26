import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowPathIcon,
  EyeIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { SEOHead } from '@components/shared/SEOHead';

interface HoldingDashboardData {
  holding: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
  stats: {
    total_child_organizations: number;
    total_users: number;
    total_projects: number;
    total_contracts_value: number;
  };
  organizations: Array<{
    id: number;
    name: string;
    organization_type: string;
    stats: {
      users_count: number;
      projects_count: number;
      contracts_count: number;
    };
  }>;
}

const HoldingDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<HoldingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) {
        window.location.href = 'https://prohelper.pro/login';
        return;
      }
      setIsAuthenticated(true);
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        const response = await fetch('/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = 'https://prohelper.pro/login';
            return;
          }
          throw new Error('Не удалось загрузить данные панели управления');
        }
        
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          throw new Error(data.message || 'Ошибка загрузки данных');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSwitchToOrganization = (orgId: number) => {
    window.location.href = `https://prohelper.pro/dashboard?switch_to=${orgId}`;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isAuthenticated ? 'Проверка авторизации...' : 'Загрузка панели управления...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h1>
          <p className="text-gray-600">{error || 'Данные панели управления недоступны'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Панель управления - ${dashboardData.holding.name}`}
        description={`Административная панель холдинга ${dashboardData.holding.name}`}
        keywords={`${dashboardData.holding.name}, панель управления, холдинг, администрирование`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Панель управления холдингом
                  </h1>
                  <p className="text-sm text-gray-600">{dashboardData.holding.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <a
                  href="/"
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                  На главную
                </a>
                <a
                  href="https://prohelper.pro/dashboard"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CogIcon className="h-5 w-5 mr-2" />
                  Основная панель
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Организаций</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.total_child_organizations}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Пользователей</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.total_users}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Проектов</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.stats.total_projects}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BanknotesIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Объем договоров</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.stats.total_contracts_value)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Организации холдинга
                </h2>
                <a
                  href="https://prohelper.pro/dashboard/multi-organization"
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Добавить организацию
                </a>
              </div>
            </div>

            <div className="p-6">
              {dashboardData.organizations && dashboardData.organizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.organizations.map((org) => (
                    <div key={org.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-500 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{org.name}</h3>
                            <p className="text-sm text-gray-600">
                              {org.organization_type === 'parent' ? 'Головная организация' : 'Дочерняя организация'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{org.stats.users_count}</p>
                          <p className="text-xs text-gray-600">Пользователей</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{org.stats.projects_count}</p>
                          <p className="text-xs text-gray-600">Проектов</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">{org.stats.contracts_count}</p>
                          <p className="text-xs text-gray-600">Договоров</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSwitchToOrganization(org.id)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex-1"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Перейти
                        </button>
                        <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Детали
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет организаций</h3>
                  <p className="text-gray-600 mb-4">Добавьте дочерние организации для управления холдингом</p>
                  <a
                    href="https://prohelper.pro/dashboard/multi-organization"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Добавить первую организацию
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Быстрые действия</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://prohelper.pro/dashboard/multi-organization"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Управление структурой</h3>
                    <p className="text-sm text-gray-600">Настройка холдинга и организаций</p>
                  </div>
                </a>

                <a
                  href="https://prohelper.pro/dashboard/analytics"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Консолидированные отчеты</h3>
                    <p className="text-sm text-gray-600">Аналитика по всему холдингу</p>
                  </div>
                </a>

                <a
                  href="https://prohelper.pro/dashboard/users"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Управление пользователями</h3>
                    <p className="text-sm text-gray-600">Пользователи всех организаций</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoldingDashboardPage; 