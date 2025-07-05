import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingDashboardData } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { useTheme, type ThemeColor } from '@components/shared/ThemeProvider';
import HoldingSummaryPanel from '@components/holding/HoldingSummaryPanel';

const HoldingDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<HoldingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const navigate = useNavigate();
  const { color, setColor, getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const colorOptions: { value: ThemeColor; name: string; preview: string }[] = [
    { value: 'blue', name: 'Синий', preview: 'bg-blue-500' },
    { value: 'green', name: 'Зеленый', preview: 'bg-green-500' },
    { value: 'purple', name: 'Фиолетовый', preview: 'bg-purple-500' },
    { value: 'pink', name: 'Розовый', preview: 'bg-pink-500' },
    { value: 'indigo', name: 'Индиго', preview: 'bg-indigo-500' },
    { value: 'orange', name: 'Оранжевый', preview: 'bg-orange-500' }
  ];

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
          const data = await multiOrganizationService.getHierarchy();
          if (data.data.success && data.data.data) {
            const hierarchyData = data.data.data;
            
            if (!hierarchyData?.parent || !hierarchyData?.total_stats) {
              throw new Error('Неполные данные иерархии организации');
            }
            
            const dashboardData: HoldingDashboardData = {
              holding: {
                id: 1,
                name: hierarchyData.parent.name || 'ООО НЕО СТРОЙ',
                slug: 'proverocka',
                description: 'Тестовый холдинг',
                parent_organization_id: hierarchyData.parent.id || 1,
                status: 'active',
              },
              hierarchy: hierarchyData,
              user: {
                id: 1,
                name: 'Тестовый пользователь',
                email: 'test@example.com'
              },
              consolidated_stats: {
                total_child_organizations: hierarchyData.total_stats.total_organizations || 0,
                total_users: hierarchyData.total_stats.total_users || 0,
                total_projects: hierarchyData.total_stats.total_projects || 0,
                total_contracts: hierarchyData.total_stats.total_contracts || 0,
                total_contracts_value: 0,
                active_contracts_count: hierarchyData.total_stats.total_contracts || 0,
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
            throw new Error(data.data?.message || 'Ошибка загрузки данных');
          }
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          slug = hostname.split('.')[0];
          
          const publicData = await multiOrganizationService.getHoldingPublicInfo(slug);
          
          let childOrganizations: any[] = [];
          try {
            childOrganizations = await multiOrganizationService.getHoldingOrganizations(slug, token);
          } catch (err) {
            console.warn('Не удалось загрузить дочерние организации:', err);
          }
          
          const dashboardData: HoldingDashboardData = {
            holding: {
              id: publicData?.holding?.id || 1,
              name: publicData?.holding?.name || 'Холдинг',
              slug: publicData?.holding?.slug || 'holding',
              description: publicData?.holding?.description || 'Описание холдинга',
              parent_organization_id: publicData?.holding?.parent_organization_id || 1,
              status: publicData?.holding?.status || 'active',
            },
            hierarchy: {
              parent: {
                id: publicData?.parent_organization?.id || 1,
                name: publicData?.parent_organization?.name || 'Головная организация',
                slug: publicData?.holding?.slug || 'holding',
                organization_type: 'parent' as const,
                is_holding: true,
                hierarchy_level: 0,
                tax_number: publicData?.parent_organization?.tax_number || '',
                registration_number: publicData?.parent_organization?.registration_number || '',
                address: publicData?.parent_organization?.address || '',
                created_at: publicData?.holding?.created_at || new Date().toISOString(),
              },
              children: (childOrganizations || []).map((org: any) => ({
                id: org?.id || 0,
                name: org?.name || 'Дочерняя организация',
                organization_type: 'child' as const,
                is_holding: false,
                hierarchy_level: 1,
                tax_number: org?.tax_number || '',
                created_at: org?.created_at || new Date().toISOString(),
              })),
              total_stats: {
                total_organizations: publicData?.stats?.total_child_organizations || 0,
                total_users: publicData?.stats?.total_users || 0,
                total_projects: publicData?.stats?.total_projects || 0,
                total_contracts: publicData?.stats?.total_contracts || 0,
              }
            },
            user: {
              id: 1,
              name: 'Пользователь',
              email: 'user@example.com'
            },
            consolidated_stats: {
              total_child_organizations: publicData?.stats?.total_child_organizations || 0,
              total_users: publicData?.stats?.total_users || 0,
              total_projects: publicData?.stats?.total_projects || 0,
              total_contracts: publicData?.stats?.total_contracts || 0,
              total_contracts_value: publicData?.stats?.total_contracts_value || 0,
              active_contracts_count: publicData?.stats?.active_contracts_count || 0,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${color}-600 mx-auto mb-4`}></div>
          <p className="text-gray-600">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
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
            <span>Войти заново</span>
          </Link>
        </div>
      </div>
    );
  }

  const holding = dashboardData.holding;
  const stats = dashboardData.consolidated_stats;
  const hierarchy = dashboardData.hierarchy;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background}`}>
      <SEOHead 
        title={`${holding.name} - Панель управления холдингом`}
        description={`Панель управления холдингом ${holding.name}. Управление ${stats.total_child_organizations} организациями с ${stats.total_users} пользователями.`}
        keywords="панель управления, холдинг, дашборд, управление организациями"
      />

      <div className="relative">
        <nav className={`bg-white/90 backdrop-blur-lg ${theme.border} border-b sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3">
                  <div className={`${theme.primary} p-2 rounded-xl shadow-lg`}>
                    <BuildingOfficeIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{holding.name}</h1>
                    <p className="text-sm text-gray-600">Панель управления</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`${theme.primary} ${theme.hover} text-white p-2 rounded-lg transition-colors flex items-center space-x-2`}
                  >
                    <SwatchIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Тема</span>
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[200px] z-50">
                      <h3 className="font-semibold text-gray-900 mb-3">Выберите цветовую тему</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {colorOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setColor(option.value);
                              setShowColorPicker(false);
                            }}
                            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                              color === option.value 
                                ? 'border-gray-900 bg-gray-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-6 h-6 ${option.preview} rounded-full mx-auto mb-1`}></div>
                            <span className="text-xs font-medium text-gray-700">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Link
                  to="/organizations"
                  className={`${theme.secondary} ${theme.text} hover:bg-opacity-80 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2`}
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>Организации</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать в панель управления
            </h2>
            <p className="text-lg text-gray-600">
              Обзор деятельности холдинга {holding.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/50">
              <div className="flex items-center">
                <div className={`${theme.secondary} p-3 rounded-xl mr-4`}>
                  <BuildingOfficeIcon className={`h-8 w-8 ${theme.text}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Организаций</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_child_organizations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/50">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <UsersIcon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Сотрудников</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/50">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-xl mr-4">
                  <FolderOpenIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Проектов</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_projects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-white/50">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-xl mr-4">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Договоров</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_contracts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Структура холдинга</h3>
                <Link
                  to="/organizations"
                  className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2`}
                >
                  <span>Управление</span>
                  <BuildingOfficeIcon className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                <div className={`${theme.accent} rounded-xl p-4 ${theme.border} border`}>
                  <div className="flex items-center space-x-3">
                    <div className={`${theme.primary} p-2 rounded-lg`}>
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{hierarchy.parent.name}</h4>
                      <p className="text-sm text-gray-600">Головная организация</p>
                      {hierarchy.parent.tax_number && (
                        <p className="text-xs text-gray-500">ИНН: {hierarchy.parent.tax_number}</p>
                      )}
                    </div>
                    <div className={`${theme.secondary} px-3 py-1 rounded-full`}>
                      <span className={`text-sm font-medium ${theme.text}`}>Головная</span>
                    </div>
                  </div>
                </div>

                {hierarchy.children.slice(0, 3).map((child) => (
                  <div key={child.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-300 p-2 rounded-lg">
                        <BuildingOfficeIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{child.name}</h4>
                        <p className="text-sm text-gray-600">Дочерняя организация</p>
                        {child.tax_number && (
                          <p className="text-xs text-gray-500">ИНН: {child.tax_number}</p>
                        )}
                      </div>
                      <div className="bg-gray-200 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-gray-600">Дочерняя</span>
                      </div>
                    </div>
                  </div>
                ))}

                {hierarchy.children.length > 3 && (
                  <div className="text-center py-4">
                    <Link
                      to="/organizations"
                      className={`${theme.text} hover:underline font-medium`}
                    >
                      И еще {hierarchy.children.length - 3} организаций...
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Финансовые показатели</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Активных договоров</span>
                    <span className="font-semibold text-gray-900">{stats.active_contracts_count}</span>
                  </div>
                  {stats.total_contracts_value > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Объем договоров</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(stats.total_contracts_value)}
                      </span>
                    </div>
                  )}
                  <div className={`${theme.accent} p-4 rounded-lg ${theme.border} border`}>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Общая эффективность</p>
                      <p className={`text-2xl font-bold ${theme.text}`}>
                        {Math.round((stats.total_projects + stats.active_contracts_count) / Math.max(stats.total_child_organizations, 1))}
                      </p>
                      <p className="text-xs text-gray-500">проектов на организацию</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Быстрые действия</h3>
                <div className="space-y-3">
                  <Link
                    to="/organizations"
                    className={`w-full ${theme.primary} ${theme.hover} text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2`}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Добавить организацию</span>
                  </Link>
                  
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <ChartBarIcon className="h-5 w-5" />
                    <span>Отчеты</span>
                  </button>
                  
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <CogIcon className="h-5 w-5" />
                    <span>Настройки</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Сводка по холдингу */}
          <HoldingSummaryPanel />
        </div>
      </div>
    </div>
  );
};

export default HoldingDashboardPage; 