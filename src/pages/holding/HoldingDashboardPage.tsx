import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  SwatchIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingDashboardData } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { useTheme, type ThemeColor } from '@components/shared/ThemeProvider';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import HoldingSummaryPanel from '@components/holding/HoldingSummaryPanel';

const HoldingDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<HoldingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { color, setColor, getThemeClasses } = useTheme();
  const { can } = usePermissionsContext();
  const theme = getThemeClasses();

  const navigationItems = [
    { name: 'Дашборд', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    { name: 'Организации', href: '/organizations', icon: BuildingOfficeIcon, current: location.pathname === '/organizations' },
    { 
      name: 'Отчеты', 
      href: `/reports/${dashboardData?.holding?.id || 1}`, 
      icon: ChartBarIcon, 
      current: location.pathname.includes('/reports'),
      permission: 'multi-organization.reports.view'
    },
    { name: 'Настройки', href: '/settings', icon: CogIcon, current: location.pathname === '/settings' },
  ];

  const navigation = navigationItems.filter(item => !item.permission || can(item.permission));

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

  const renderSidebar = () => (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className={`flex flex-col flex-grow bg-white ${theme.border} border-r overflow-y-auto`}>
        <div className="flex items-center flex-shrink-0 px-6 py-4">
          <div className={`${theme.primary} p-2 rounded-xl shadow-lg`}>
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">{holding.name}</h1>
            <p className="text-sm text-gray-600">Холдинг</p>
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? `${theme.primary} text-white`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`w-full ${theme.secondary} ${theme.text} hover:bg-opacity-80 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm`}
            >
              <SwatchIcon className="h-4 w-4" />
              <span>Цветовая тема</span>
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Выберите цвет</h3>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setColor(option.value);
                        setShowColorPicker(false);
                      }}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        color === option.value 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 ${option.preview} rounded-full mx-auto mb-1`}></div>
                      <span className="text-xs font-medium text-gray-700">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileMenu = () => (
    <div className={`lg:hidden ${mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
      
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center">
            <div className={`${theme.primary} p-2 rounded-xl shadow-lg`}>
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">{holding.name}</h1>
              <p className="text-sm text-gray-600">Холдинг</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? `${theme.primary} text-white`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={`${holding.name} - Панель управления холдингом`}
        description={`Панель управления холдингом ${holding.name}. Управление ${stats.total_child_organizations} организациями с ${stats.total_users} пользователями.`}
        keywords="панель управления, холдинг, дашборд, управление организациями"
      />

      {renderSidebar()}
      {renderMobileMenu()}

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
          <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold leading-6 text-gray-900">Дашборд</h1>
                <p className="text-sm text-gray-600">Обзор деятельности холдинга</p>
              </div>
            </div>
          </div>
        </div>

        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Карточки статистики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`${theme.secondary} p-3 rounded-lg mr-4`}>
                      <BuildingOfficeIcon className={`h-8 w-8 ${theme.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Организаций</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_child_organizations}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                      <UsersIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Сотрудников</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="bg-violet-100 p-3 rounded-lg mr-4">
                      <FolderOpenIcon className="h-8 w-8 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Проектов</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_projects}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-3 rounded-lg mr-4">
                      <DocumentTextIcon className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Договоров</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_contracts}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Основной контент */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Структура холдинга */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Структура холдинга</h3>
                      <Link
                        to="/organizations"
                        className={`${theme.primary} ${theme.hover} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                      >
                        Управление
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {/* Головная организация */}
                      <div className={`${theme.accent} rounded-lg p-4 border ${theme.border}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`${theme.primary} p-2.5 rounded-lg`}>
                            <BuildingOfficeIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{hierarchy.parent.name}</h4>
                            <p className="text-sm text-gray-600">Головная организация</p>
                            {hierarchy.parent.tax_number && (
                              <p className="text-xs text-gray-500 mt-1">ИНН: {hierarchy.parent.tax_number}</p>
                            )}
                          </div>
                          <div className={`${theme.secondary} px-3 py-1 rounded-full`}>
                            <span className={`text-xs font-medium ${theme.text}`}>Головная</span>
                          </div>
                        </div>
                      </div>

                      {/* Дочерние организации */}
                      {hierarchy.children.slice(0, 4).map((child) => (
                        <div key={child.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 p-2.5 rounded-lg">
                              <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{child.name}</h4>
                              <p className="text-sm text-gray-600">Дочерняя организация</p>
                              {child.tax_number && (
                                <p className="text-xs text-gray-500 mt-1">ИНН: {child.tax_number}</p>
                              )}
                            </div>
                            <div className="bg-gray-200 px-3 py-1 rounded-full">
                              <span className="text-xs font-medium text-gray-600">Дочерняя</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {hierarchy.children.length > 4 && (
                        <div className="text-center py-2">
                          <Link
                            to="/organizations"
                            className={`text-sm ${theme.text} hover:underline font-medium`}
                          >
                            Показать еще {hierarchy.children.length - 4} организаций
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Сайдбар с информацией */}
              <div className="space-y-6">
                {/* Финансовые показатели */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ключевые показатели</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Активных договоров</span>
                        <span className="font-semibold text-gray-900">{stats.active_contracts_count}</span>
                      </div>
                      
                      {stats.total_contracts_value > 0 && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Объем договоров</span>
                          <span className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(stats.total_contracts_value)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`${theme.accent} p-4 rounded-lg border ${theme.border} mt-4`}>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Средняя нагрузка</p>
                          <p className={`text-xl font-bold ${theme.text}`}>
                            {Math.round((stats.total_projects + stats.active_contracts_count) / Math.max(stats.total_child_organizations, 1))}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">проектов на организацию</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Быстрые ссылки */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Управление</h3>
                    <div className="space-y-3">
                      <Link
                        to="/organizations"
                        className={`w-full ${theme.primary} ${theme.hover} text-white p-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2`}
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Добавить организацию</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Сводка по холдингу */}
            <div className="mt-8">
              <HoldingSummaryPanel />
              
              {/* Дополнительная информация для пользователей с доступом к отчетам */}
              {can('multi-organization.reports.view') && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        📊 Расширенная аналитика
                      </h3>
                      <p className="text-blue-700 mb-3 text-sm lg:text-base">
                        Получите подробные отчеты по KPI, финансовым показателям и сравнению организаций
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          KPI метрики
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Финансовые отчеты
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Сравнение организаций
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        to={`/reports/${dashboardData?.holding?.id || 1}`}
                        className={`${theme.primary} ${theme.hover} text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-md w-full lg:w-auto`}
                      >
                        <ChartBarIcon className="h-5 w-5" />
                        <span>Открыть отчеты</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HoldingDashboardPage; 