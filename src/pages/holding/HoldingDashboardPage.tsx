import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingDashboardData } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';

const HoldingDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<HoldingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getTokenFromStorages();
        if (!token) {
          navigate('/login');
          return;
        }

        const hostname = window.location.hostname;
        const mainDomain = 'prohelper.pro';
        let slug = '';
        
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          slug = 'proverocka';
          // В разработке используем обычное API
          const data = await multiOrganizationService.getHierarchy();
          if (data.data.success) {
            const hierarchyData = data.data.data;
            const dashboardData: HoldingDashboardData = {
              holding: {
                id: 1,
                name: hierarchyData.parent.name,
                slug: 'proverocka',
                description: 'Тестовый холдинг',
                parent_organization_id: hierarchyData.parent.id,
                status: 'active',
              },
              hierarchy: hierarchyData,
              user: {
                id: 1,
                name: 'Тестовый пользователь',
                email: 'test@example.com'
              },
              consolidated_stats: {
                total_child_organizations: hierarchyData.total_stats.total_organizations,
                total_users: hierarchyData.total_stats.total_users,
                total_projects: hierarchyData.total_stats.total_projects,
                total_contracts: hierarchyData.total_stats.total_contracts,
                total_contracts_value: 0,
                active_contracts_count: hierarchyData.total_stats.total_contracts,
                recent_activity: [],
                performance_metrics: {
                  monthly_growth: 0,
                  efficiency_score: 0,
                  satisfaction_index: 0
                }
              }
            };
            setDashboardData(dashboardData);
          } else {
            throw new Error(data.data.message || 'Ошибка загрузки данных');
          }
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          slug = hostname.split('.')[0];
          const data = await multiOrganizationService.getHoldingDashboardInfo(slug, token);
          setDashboardData(data);
        } else {
          throw new Error('Неверный поддомен');
        }
      } catch (err) {
        console.error('Ошибка загрузки панели управления:', err);
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
          navigate('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BuildingOfficeIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Ошибка загрузки</h1>
          <p className="text-red-600 mb-4">{error || 'Не удалось загрузить данные панели управления'}</p>
          <Link 
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
          >
            <span>Войти в систему</span>
          </Link>
        </div>
      </div>
    );
  }

  const { holding, hierarchy, user, consolidated_stats } = dashboardData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={`Панель управления - ${holding.name}`}
        description={`Административная панель холдинга ${holding.name}`}
        keywords="панель управления, холдинг, администрирование"
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{holding.name}</h1>
                <p className="text-sm text-gray-600">Панель управления холдингом</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Добро пожаловать, {user.name}</span>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Публичная страница
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Организации</p>
                <p className="text-2xl font-bold text-gray-900">{consolidated_stats.total_child_organizations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Сотрудники</p>
                <p className="text-2xl font-bold text-gray-900">{consolidated_stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpenIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Проекты</p>
                <p className="text-2xl font-bold text-gray-900">{consolidated_stats.total_projects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Договоры</p>
                <p className="text-2xl font-bold text-gray-900">{consolidated_stats.active_contracts_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Организации холдинга */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Организации холдинга</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                    <PlusIcon className="h-4 w-4" />
                    <span>Добавить</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Головная организация */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{hierarchy.parent.name}</h3>
                          <p className="text-sm text-gray-600">Головная организация</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Управляющая
                      </span>
                    </div>
                  </div>

                  {/* Дочерние организации */}
                  {hierarchy.children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-600 p-2 rounded-lg">
                            <BuildingOfficeIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{child.name}</h3>
                            <p className="text-sm text-gray-600">
                              {child.tax_number && `ИНН: ${child.tax_number}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Активная
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            Перейти
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Сайдбар с дополнительной информацией */}
          <div className="space-y-6">
            {/* Быстрые действия */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Быстрые действия</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                  <PlusIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Добавить организацию</span>
                </button>
                <Link 
                  to="/organizations"
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Все организации</span>
                </Link>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Консолидированные отчеты</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
                  <CogIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Настройки холдинга</span>
                </button>
              </div>
            </div>

            {/* Последняя активность */}
            {consolidated_stats.recent_activity.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Последняя активность</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {consolidated_stats.recent_activity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.organization_name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Статистика производительности */}
            {consolidated_stats.total_contracts_value > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Финансы</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Общий объем договоров</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(consolidated_stats.total_contracts_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Активных договоров</p>
                      <p className="text-xl font-semibold text-green-600">
                        {consolidated_stats.active_contracts_count}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingDashboardPage; 