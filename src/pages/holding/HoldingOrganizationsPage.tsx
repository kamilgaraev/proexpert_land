import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  UsersIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { multiOrganizationService, getTokenFromStorages } from '@utils/api';
import type { HoldingOrganization } from '@utils/api';
import { SEOHead } from '@components/shared/SEOHead';

const HoldingOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<HoldingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holdingName, setHoldingName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrganizations = async () => {
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
          setHoldingName('Тестовый холдинг');
          const data = await multiOrganizationService.getAccessibleOrganizations();
          if (data.data.success) {
            const mockOrganizations: HoldingOrganization[] = data.data.data.map((org: any, index: number) => ({
              id: org.id,
              name: org.name,
              description: `Дочерняя организация ${index + 1}`,
              organization_type: 'child' as const,
              hierarchy_level: 1,
              tax_number: `123456789${index}`,
              registration_number: `98765432${index}`,
              address: `г. Казань, ул. Тестовая, ${index + 1}`,
              phone: `+7 (843) 123-45-${index.toString().padStart(2, '0')}`,
              email: `info@org${index + 1}.ru`,
              created_at: new Date().toISOString(),
              stats: {
                users_count: Math.floor(Math.random() * 20) + 5,
                projects_count: Math.floor(Math.random() * 10) + 1,
                contracts_count: Math.floor(Math.random() * 8) + 1,
                active_contracts_value: Math.floor(Math.random() * 5000000) + 500000,
              }
            }));
            setOrganizations(mockOrganizations);
          } else {
            throw new Error(data.data.message || 'Ошибка загрузки данных');
          }
        } else if (hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`)) {
          slug = hostname.split('.')[0];
          const data = await multiOrganizationService.getHoldingOrganizations(slug, token);
          setOrganizations(data);
          const holdingData = await multiOrganizationService.getHoldingPublicInfo(slug);
          setHoldingName(holdingData.holding.name);
        } else {
          throw new Error('Неверный поддомен');
        }
      } catch (err) {
        console.error('Ошибка загрузки организаций:', err);
        if (err instanceof Error && err.message === 'UNAUTHORIZED') {
          navigate('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка организаций...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BuildingOfficeIcon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Ошибка загрузки</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Назад</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title={`Организации - ${holdingName}`}
        description={`Список организаций входящих в холдинг ${holdingName}`}
        keywords="организации, холдинг, дочерние компании"
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Назад к панели</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Организации холдинга</h1>
                  <p className="text-sm text-gray-600">{holdingName}</p>
                </div>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Добавить организацию</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего организаций</p>
                <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общее число сотрудников</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org.stats.users_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpenIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общее число проектов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org.stats.projects_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Объем договоров</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(organizations.reduce((sum, org) => sum + org.stats.active_contracts_value, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список организаций */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Дочерние организации</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {organizations.map((org) => (
              <div key={org.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{org.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Активная
                        </span>
                      </div>
                      
                      {org.description && (
                        <p className="text-sm text-gray-600 mb-3">{org.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {org.tax_number && (
                          <div>
                            <span className="text-gray-500">ИНН:</span>
                            <span className="ml-1 font-medium">{org.tax_number}</span>
                          </div>
                        )}
                        {org.phone && (
                          <div>
                            <span className="text-gray-500">Телефон:</span>
                            <span className="ml-1 font-medium">{org.phone}</span>
                          </div>
                        )}
                        {org.email && (
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-1 font-medium">{org.email}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Создана:</span>
                          <span className="ml-1 font-medium">
                            {new Date(org.created_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                      
                      {org.address && (
                        <p className="text-sm text-gray-600 mt-2">{org.address}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3 ml-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">{org.stats.users_count}</p>
                        <p className="text-xs text-gray-600">Сотрудников</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{org.stats.projects_count}</p>
                        <p className="text-xs text-gray-600">Проектов</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600">{org.stats.contracts_count}</p>
                        <p className="text-xs text-gray-600">Договоров</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(org.stats.active_contracts_value)}</p>
                        <p className="text-xs text-gray-600">Объем</p>
                      </div>
                    </div>
                    
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                      <span>Перейти к организации</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {organizations.length === 0 && (
            <div className="p-12 text-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет организаций</h3>
              <p className="text-gray-600 mb-4">Добавьте дочерние организации для управления холдингом</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Добавить первую организацию</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoldingOrganizationsPage; 