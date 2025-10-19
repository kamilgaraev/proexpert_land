import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingDashboardData } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';
import { StatCard, LoadingSpinner, PageHeader } from '@components/holding/shared';
import HoldingSummaryPanel from '@components/holding/HoldingSummaryPanel';

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
    return <LoadingSpinner size="lg" text="Загрузка панели управления..." fullScreen />;
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-3">Ошибка загрузки</h1>
          <p className="text-red-600 mb-6">{error || 'Не удалось загрузить данные панели управления'}</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-orange-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Войти заново
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData.consolidated_stats;
  const hierarchy = dashboardData.hierarchy;

  return (
    <div>
      <SEOHead 
        title={`${dashboardData.holding.name} - Панель управления холдингом`}
        description={`Панель управления холдингом ${dashboardData.holding.name}. Управление ${stats.total_child_organizations} организациями с ${stats.total_users} пользователями.`}
        keywords="панель управления, холдинг, дашборд, управление организациями"
      />

      <PageHeader
        title="Обзор холдинга"
        subtitle={`Добро пожаловать в панель управления ${dashboardData.holding.name}`}
        icon={<ChartBarIcon className="w-8 h-8" />}
        actions={
          <div className="flex gap-2">
            <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Сегодня
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Организаций"
          value={stats.total_child_organizations}
          icon={<BuildingOfficeIcon className="w-8 h-8" />}
          colorScheme="orange"
          subtitle="Дочерних компаний"
          onClick={() => navigate('/organizations')}
        />

        <StatCard
          title="Сотрудников"
          value={stats.total_users}
          icon={<UsersIcon className="w-8 h-8" />}
          colorScheme="blue"
          trend={{ value: 12, isPositive: true }}
          subtitle="Всего по холдингу"
        />

        <StatCard
          title="Проектов"
          value={stats.total_projects}
          icon={<FolderOpenIcon className="w-8 h-8" />}
          colorScheme="green"
          trend={{ value: 8, isPositive: true }}
          subtitle="Активных проектов"
        />

        <StatCard
          title="Договоров"
          value={stats.total_contracts}
          icon={<DocumentTextIcon className="w-8 h-8" />}
          colorScheme="purple"
          subtitle={`На сумму ${formatCurrency(stats.total_contracts_value)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Структура холдинга</h3>
                <button 
                  onClick={() => navigate('/organizations')}
                  className="text-sm text-slate-700 hover:text-slate-900 font-medium"
                >
                  Подробнее →
                </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-700 p-3 rounded-xl">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{hierarchy.parent.name}</h4>
                    <p className="text-sm text-gray-600">Головная организация</p>
                    {hierarchy.parent.tax_number && (
                      <p className="text-xs text-gray-500 mt-1">ИНН: {hierarchy.parent.tax_number}</p>
                    )}
                  </div>
                  <span className="bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Головная
                  </span>
                </div>
              </div>

              {hierarchy.children.slice(0, 3).map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 p-3 rounded-xl">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{child.name}</h4>
                      <p className="text-sm text-gray-600">Дочерняя организация</p>
                      {child.tax_number && (
                        <p className="text-xs text-gray-500 mt-1">ИНН: {child.tax_number}</p>
                      )}
                    </div>
                    <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                      Дочерняя
                    </span>
                  </div>
                </div>
              ))}

              {hierarchy.children.length > 3 && (
                <button 
                  onClick={() => navigate('/organizations')}
                  className="w-full text-center py-3 text-slate-700 hover:text-slate-900 font-medium hover:bg-slate-50 rounded-xl transition-all"
                >
                  Показать еще {hierarchy.children.length - 3} организаций
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ключевые показатели</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Активных договоров</span>
                <span className="font-bold text-gray-900 text-lg">{stats.active_contracts_count}</span>
              </div>
              
              {stats.total_contracts_value > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Объем договоров</span>
                  <span className="font-bold text-green-600 text-sm">
                    {formatCurrency(stats.total_contracts_value)}
                  </span>
                </div>
              )}
              
              <div className="bg-slate-50 p-4 rounded-xl mt-4 border border-slate-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Средняя нагрузка</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {Math.round((stats.total_projects + stats.active_contracts_count) / Math.max(stats.total_child_organizations, 1))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">проектов на организацию</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <ArrowTrendingUpIcon className="w-8 h-8" />
              <h3 className="text-lg font-bold">Производительность</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Эффективность</span>
                <span className="font-bold text-lg">87%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white rounded-full h-2 w-[87%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HoldingSummaryPanel />
    </div>
  );
};

export default HoldingDashboardPage;
