import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { multiOrganizationService } from '@utils/api';
import type { HoldingPublicData } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';

const HoldingLandingPage = () => {
  const [holdingData, setHoldingData] = useState<HoldingPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHoldingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const hostname = window.location.hostname;
        const mainDomain = 'prohelper.pro';
        let slug = '';
        
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
          slug = 'proverocka';
          try {
            const data = await multiOrganizationService.getHoldingPublicInfo(slug);
            setHoldingData(data);
          } catch (publicInfoError) {
            console.warn('Не удалось загрузить через getHoldingPublicInfo, пробую getHierarchy:', publicInfoError);
            const data = await multiOrganizationService.getHierarchy();
            if (data?.data?.success && data.data.data) {
              const hierarchyData = data.data.data;
              const publicData: HoldingPublicData = {
                holding: {
                  id: 1,
                  name: hierarchyData.parent?.name || 'Тестовый холдинг',
                  slug: 'proverocka',
                  description: 'Тестовый холдинг',
                  parent_organization_id: hierarchyData.parent?.id || 1,
                  status: 'active',
                  created_at: hierarchyData.parent?.created_at || new Date().toISOString(),
                },
                parent_organization: {
                  id: hierarchyData.parent?.id || 1,
                  name: hierarchyData.parent?.name || 'Головная организация',
                  legal_name: hierarchyData.parent?.name || 'Головная организация',
                  tax_number: hierarchyData.parent?.tax_number || '',
                  registration_number: hierarchyData.parent?.registration_number || '',
                  address: hierarchyData.parent?.address || '',
                  city: 'Казань',
                  description: 'Строительная компания',
                },
                stats: {
                  total_child_organizations: hierarchyData.total_stats?.total_organizations || 0,
                  total_users: hierarchyData.total_stats?.total_users || 0,
                  total_projects: hierarchyData.total_stats?.total_projects || 0,
                  total_contracts: hierarchyData.total_stats?.total_contracts || 0,
                  total_contracts_value: 0,
                  active_contracts_count: hierarchyData.total_stats?.total_contracts || 0,
                }
              };
              setHoldingData(publicData);
            } else {
              throw new Error('Ошибка загрузки данных иерархии');
            }
          }
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          slug = hostname.split('.')[0];
          const data = await multiOrganizationService.getHoldingPublicInfo(slug);
          setHoldingData(data);
        } else {
          throw new Error('Неверный поддомен');
        }
      } catch (err) {
        console.error('Ошибка загрузки данных холдинга:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadHoldingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных холдинга...</p>
        </div>
      </div>
    );
  }

  if (error || !holdingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Холдинг не найден</h1>
          <p className="text-red-600 mb-4">{error || 'Холдинг с таким именем не существует'}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const holding = holdingData?.holding;
  const parent_organization = holdingData?.parent_organization;
  const stats = holdingData?.stats;

  if (!holding || !parent_organization || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Ошибка загрузки данных</h1>
          <p className="text-red-600 mb-4">Данные о холдинге не найдены или повреждены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SEOHead 
        title={`${holding.name} - Холдинг`}
        description={`Официальная страница холдинга ${holding.name}. Управляем ${stats.total_child_organizations} организациями с ${stats.total_users} пользователями.`}
        keywords="холдинг, управление организациями, мультиорганизация"
      />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-blue-50 opacity-30"></div>
        
        <nav className="relative bg-white/80 backdrop-blur-sm border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{holding.name}</h1>
                  <p className="text-sm text-gray-600">Холдинг компаний</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>Панель управления</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Добро пожаловать в холдинг
                <span className="text-blue-600 block mt-2">{holding.name}</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {holding.description || `Мы объединяем усилия ${stats.total_child_organizations} организаций для достижения общих целей и создания синергетического эффекта в строительной отрасли.`}
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_child_organizations}</h3>
                  <p className="text-gray-600">Организаций</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_users}</h3>
                  <p className="text-gray-600">Сотрудников</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                    <FolderOpenIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_projects}</h3>
                  <p className="text-gray-600">Проектов</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                    <DocumentTextIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total_contracts}</h3>
                  <p className="text-gray-600">Договоров</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">О холдинге</h3>
            <p className="text-xl text-gray-600">
              Подробная информация о нашей компании
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Головная организация</h4>
                  <p className="text-blue-600 font-medium">Управляющая компания</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6">
                <h5 className="text-xl font-bold text-gray-900 mb-2">{parent_organization?.name}</h5>
                {parent_organization?.legal_name && parent_organization.legal_name !== parent_organization.name && (
                  <p className="text-gray-600 mb-2">Полное название: {parent_organization.legal_name}</p>
                )}
                {parent_organization?.tax_number && (
                  <p className="text-gray-600 mb-2">ИНН: {parent_organization.tax_number}</p>
                )}
                {parent_organization?.registration_number && (
                  <p className="text-gray-600 mb-2">ОГРН: {parent_organization.registration_number}</p>
                )}
                {parent_organization?.address && (
                  <p className="text-gray-600">{parent_organization.address}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">Стратегическое планирование</span>
                </div>
                <div className="flex items-center">
                  <BoltIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">Координация проектов</span>
                </div>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">Контроль качества</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200">
              <div className="flex items-center mb-6">
                <div className="bg-green-600 p-3 rounded-lg mr-4">
                  <UsersIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Ключевые показатели</h4>
                  <p className="text-green-600 font-medium">Наши достижения</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Организаций в холдинге</span>
                  <span className="text-2xl font-bold text-blue-600">{stats?.total_child_organizations || 0}</span>
                </div>
                <div className="bg-white rounded-xl p-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Активных проектов</span>
                  <span className="text-2xl font-bold text-green-600">{stats?.total_projects || 0}</span>
                </div>
                <div className="bg-white rounded-xl p-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Договоров в работе</span>
                  <span className="text-2xl font-bold text-purple-600">{stats?.active_contracts_count || 0}</span>
                </div>
                {(stats?.total_contracts_value || 0) > 0 && (
                  <div className="bg-white rounded-xl p-4 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Объем договоров</span>
                    <span className="text-xl font-bold text-orange-600">{formatCurrency(stats?.total_contracts_value || 0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">{holding.name}</span>
              </div>
              <p className="text-gray-400">
                {holding.description || 'Современное управление холдинговой структурой с фокусом на эффективность и развитие.'}
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-lg mb-4">Контакты</h5>
              {parent_organization?.address && (
                <p className="text-gray-400 mb-2">{parent_organization.address}</p>
              )}
              {parent_organization?.phone && (
                <p className="text-gray-400 mb-2">{parent_organization.phone}</p>
              )}
              {parent_organization?.email && (
                <p className="text-gray-400 mb-2">{parent_organization.email}</p>
              )}
              {parent_organization?.tax_number && (
                <p className="text-gray-400">ИНН: {parent_organization.tax_number}</p>
              )}
            </div>
            
            <div>
              <h5 className="font-semibold text-lg mb-4">Для партнеров</h5>
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
              >
                <span>Войти в систему</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {holding.name}. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HoldingLandingPage; 