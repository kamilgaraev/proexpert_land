import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useMultiOrganization } from '@hooks/useMultiOrganization';
import { PageLoading } from '@components/common/PageLoading';
import type { CreateHoldingRequest, AddChildOrganizationRequest } from '@utils/api';

const MultiOrganizationPage = () => {
  const {
    availability,
    hierarchy,
    accessibleOrganizations,
    selectedOrganization,
    loading,
    error,
    checkAvailability,
    fetchHierarchy,
    fetchAccessibleOrganizations,
    fetchOrganizationDetails,
    createHolding,
    addChildOrganization,
    switchContext,
    canCreateHolding,
    isHolding,
    getCurrentOrganizationType,
  } = useMultiOrganization();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateHoldingModal, setShowCreateHoldingModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedOrgForDetails, setSelectedOrgForDetails] = useState<number | null>(null);
  const [holdingForm, setHoldingForm] = useState<CreateHoldingRequest>({
    name: '',
    description: '',
    max_child_organizations: 25,
    settings: {
      consolidated_reports: true,
      shared_materials: false,
      unified_billing: true,
    },
    permissions_config: {
      default_child_permissions: {
        projects: ['read', 'create', 'edit'],
        contracts: ['read', 'create'],
        materials: ['read', 'create'],
        reports: ['read'],
        users: ['read'],
      },
    },
  });
  const [childForm, setChildForm] = useState<AddChildOrganizationRequest>({
    group_id: hierarchy?.parent?.group_id || 1,
    name: '',
    description: '',
    inn: '',
    kpp: '',
    address: '',
    phone: '',
    email: '',
    owner: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const initializeData = async () => {
      const available = await checkAvailability();
      if (available || availability) {
        await Promise.all([
          fetchHierarchy(),
          fetchAccessibleOrganizations(),
        ]);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (hierarchy?.parent?.group_id) {
      setChildForm(prev => ({ ...prev, group_id: hierarchy.parent.group_id! }));
    }
  }, [hierarchy]);

  const handleCreateHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHolding(holdingForm);
      setShowCreateHoldingModal(false);
      setHoldingForm({
        name: '',
        description: '',
        max_child_organizations: 25,
        settings: {
          consolidated_reports: true,
          shared_materials: false,
          unified_billing: true,
        },
        permissions_config: {
          default_child_permissions: {
            projects: ['read', 'create', 'edit'],
            contracts: ['read', 'create'],
            materials: ['read', 'create'],
            reports: ['read'],
            users: ['read'],
          },
        },
      });
    } catch (error) {
      console.error('Ошибка создания холдинга:', error);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addChildOrganization(childForm);
      setShowAddChildModal(false);
      setChildForm({
        group_id: hierarchy?.parent?.group_id || 1,
        name: '',
        description: '',
        inn: '',
        kpp: '',
        address: '',
        phone: '',
        email: '',
        owner: { name: '', email: '', password: '' },
      });
    } catch (error) {
      console.error('Ошибка добавления дочерней организации:', error);
    }
  };

  const handleSwitchContext = async (organizationId: number) => {
    try {
      await switchContext(organizationId);
      window.location.reload();
    } catch (error) {
      console.error('Ошибка смены контекста:', error);
    }
  };

  const handleViewOrganizationDetails = async (orgId: number) => {
    setSelectedOrgForDetails(orgId);
    await fetchOrganizationDetails(orgId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(value);
  };

  if (loading && !availability) {
    return <PageLoading message="Проверка доступности мультиорганизации..." />;
  }

  if (!availability?.available && !loading && !hierarchy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Модуль недоступен</h3>
          <p className="text-gray-500 mb-4">
            Модуль "Мультиорганизация" не активирован для вашей организации
          </p>
          <p className="text-sm text-gray-400">
            Активируйте модуль в разделе "Модули" для получения доступа к функциям холдинга
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: ChartBarIcon },
    { id: 'hierarchy', name: 'Структура холдинга', icon: BuildingOfficeIcon },
    { id: 'organizations', name: 'Переключение', icon: ArrowPathIcon },
    { id: 'analytics', name: 'Аналитика', icon: DocumentTextIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мультиорганизация</h1>
          <p className="text-gray-600 mt-2">
            {getCurrentOrganizationType() === 'parent' 
              ? 'Управление холдинговой структурой' 
              : getCurrentOrganizationType() === 'child'
              ? 'Дочерняя организация холдинга'
              : 'Создание и управление холдингом'
            }
          </p>
          {hierarchy?.parent && (
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              Текущая организация: {hierarchy.parent.name}
              {hierarchy.parent.organization_type === 'parent' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Головная организация
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          {hierarchy?.parent?.slug && (
            <button
              onClick={() => window.open(`https://${hierarchy.parent.slug}.prohelper.pro/`, '_blank')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
              Перейти на сайт холдинга
            </button>
          )}
        
        {canCreateHolding() && !isHolding() && (
          <button
            onClick={() => setShowCreateHoldingModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Создать холдинг
          </button>
        )}
        
          {isHolding() && hierarchy?.parent && (
          <button
            onClick={() => setShowAddChildModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
              Добавить дочернюю организацию
          </button>
        )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Тип организации</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {getCurrentOrganizationType() === 'parent' ? 'Головная организация' : 
                         getCurrentOrganizationType() === 'child' ? 'Дочерняя организация' : 'Обычная организация'}
                      </p>
                    </div>
                  </div>
                </div>

                {hierarchy?.total_stats && (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-600">Всего пользователей</p>
                          <p className="text-lg font-semibold text-green-900">{hierarchy.total_stats.total_users}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-purple-600">Проектов в холдинге</p>
                          <p className="text-lg font-semibold text-purple-900">{hierarchy.total_stats.total_projects}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {hierarchy?.parent && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о холдинге</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Название</p>
                      <p className="text-gray-900">{hierarchy.parent.name}</p>
                    </div>
                    {hierarchy.parent.tax_number && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">ИНН</p>
                        <p className="text-gray-900">{hierarchy.parent.tax_number}</p>
                    </div>
                    )}
                    {hierarchy.parent.address && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Адрес</p>
                        <p className="text-gray-900">{hierarchy.parent.address}</p>
                    </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Дочерних организаций</p>
                      <p className="text-gray-900">{hierarchy.children.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="space-y-6">
              {hierarchy ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Структура холдинга</h3>
                  
                  <div className="relative">
                    <div className="flex flex-col items-center space-y-8">
                <div className="relative">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[280px] text-white">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                              <BuildingOfficeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{hierarchy.parent.name}</h4>
                              <p className="text-blue-100">Головная организация</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-blue-100 space-y-2">
                            {hierarchy.parent.tax_number && (
                              <p>ИНН: {hierarchy.parent.tax_number}</p>
                            )}
                            <p>Уровень: {hierarchy.parent.hierarchy_level}</p>
                            <p>Дочерних: {hierarchy.children.length}</p>
                          </div>
                          
                          <div className="flex justify-center mt-4">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {hierarchy.children.length > 0 && (
                        <div className="w-px h-8 bg-gray-300"></div>
                      )}

                      {hierarchy.children.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                          {hierarchy.children.map((child) => (
                            <div key={child.id} className="relative group">
                              <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                  <BuildingOfficeIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">{child.name}</h4>
                                  <p className="text-purple-600 text-xs">Дочерняя организация</p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>Уровень: {child.hierarchy_level}</p>
                                  {child.tax_number && (
                                    <p>ИНН: {child.tax_number}</p>
                                  )}
                              </div>
                              
                                <div className="flex space-x-2 mt-3">
                                  <button
                                    onClick={() => handleViewOrganizationDetails(child.id)}
                                    className="flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                                  >
                                    <EyeIcon className="h-3 w-3 mr-1" />
                                    Детали
                                  </button>
                                  <button
                                    onClick={() => handleSwitchContext(child.id)}
                                    className="flex items-center px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded hover:bg-purple-200 transition-colors"
                                  >
                                    <ArrowPathIcon className="h-3 w-3 mr-1" />
                                    Переключиться
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {hierarchy.total_stats && (
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Статистика холдинга</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{hierarchy.total_stats.total_organizations}</p>
                          <p className="text-sm text-gray-600">Организаций</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{hierarchy.total_stats.total_users}</p>
                          <p className="text-sm text-gray-600">Пользователей</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{hierarchy.total_stats.total_projects}</p>
                          <p className="text-sm text-gray-600">Проектов</p>
                      </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{hierarchy.total_stats.total_contracts}</p>
                          <p className="text-sm text-gray-600">Договоров</p>
                      </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных о структуре</h3>
                  <p className="text-gray-500">Создайте холдинг для просмотра структуры организаций</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Быстрое переключение между организациями</h3>
              {accessibleOrganizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {accessibleOrganizations.map((org) => (
                    <div key={org.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-500 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{org.name}</h3>
                            <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">
                                {org.organization_type === 'parent' ? 'Головная организация' : 
                                 org.organization_type === 'child' ? 'Дочерняя организация' : 'Обычная организация'}
                            </p>
                        {org.is_holding && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Холдинг
                          </span>
                        )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSwitchContext(org.id)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Переключиться
                        </button>
                        <button
                          onClick={() => handleViewOrganizationDetails(org.id)}
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Подробности
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных организаций</h3>
                  <p className="text-gray-500">Создайте холдинг или получите доступ к другим организациям</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Консолидированная аналитика</h3>
              {hierarchy?.total_stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Пользователи в холдинге</p>
                        <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_users}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Проекты в работе</p>
                        <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_projects}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <BanknotesIcon className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Договоры</p>
                        <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_contracts}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных для аналитики</h3>
                  <p className="text-gray-500">Данные появятся после создания холдинга и добавления дочерних организаций</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOrganization && selectedOrgForDetails && (
        <div className="mt-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Детали организации</h3>
              <button
                onClick={() => {
                  setSelectedOrgForDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Основная информация</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Название</p>
                    <p className="text-gray-900">{selectedOrganization.organization.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Тип</p>
                    <p className="text-gray-900">
                      {selectedOrganization.organization.organization_type === 'parent' ? 'Головная организация' :
                       selectedOrganization.organization.organization_type === 'child' ? 'Дочерняя организация' : 'Обычная организация'}
                    </p>
                  </div>
                  {selectedOrganization.organization.inn && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">ИНН</p>
                      <p className="text-gray-900">{selectedOrganization.organization.inn}</p>
                    </div>
                  )}
                  {selectedOrganization.organization.address && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Адрес</p>
                      <p className="text-gray-900">{selectedOrganization.organization.address}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Статистика</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{selectedOrganization.stats.users_count}</p>
                    <p className="text-xs text-blue-600">Пользователей</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{selectedOrganization.stats.projects_count}</p>
                    <p className="text-xs text-green-600">Проектов</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">{selectedOrganization.stats.contracts_count}</p>
                    <p className="text-xs text-purple-600">Договоров</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(selectedOrganization.stats.active_contracts_value)}
                    </p>
                    <p className="text-xs text-orange-600">Объем договоров</p>
                  </div>
                </div>
                
                {selectedOrganization.recent_activity && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Последняя активность</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      {selectedOrganization.recent_activity.last_project_created && (
                        <p>Последний проект: {new Date(selectedOrganization.recent_activity.last_project_created).toLocaleDateString('ru-RU')}</p>
                      )}
                      {selectedOrganization.recent_activity.last_contract_signed && (
                        <p>Последний договор: {new Date(selectedOrganization.recent_activity.last_contract_signed).toLocaleDateString('ru-RU')}</p>
                      )}
                      {selectedOrganization.recent_activity.last_user_added && (
                        <p>Последний пользователь: {new Date(selectedOrganization.recent_activity.last_user_added).toLocaleDateString('ru-RU')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateHoldingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Создать холдинг</h2>
              
            <form onSubmit={handleCreateHolding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название холдинга <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={holdingForm.name}
                  onChange={(e) => setHoldingForm({ ...holdingForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Строительный холдинг АБВ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={holdingForm.description}
                  onChange={(e) => setHoldingForm({ ...holdingForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                    placeholder="Группа строительных компаний"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимум дочерних организаций
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={holdingForm.max_child_organizations}
                    onChange={(e) => setHoldingForm({ ...holdingForm, max_child_organizations: parseInt(e.target.value) || 25 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Настройки холдинга</label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="consolidated_reports"
                        checked={holdingForm.settings?.consolidated_reports || false}
                        onChange={(e) => setHoldingForm({
                          ...holdingForm,
                          settings: { ...holdingForm.settings, consolidated_reports: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="consolidated_reports" className="ml-2 text-sm text-gray-700">
                        Консолидированные отчеты
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="shared_materials"
                        checked={holdingForm.settings?.shared_materials || false}
                        onChange={(e) => setHoldingForm({
                          ...holdingForm,
                          settings: { ...holdingForm.settings, shared_materials: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="shared_materials" className="ml-2 text-sm text-gray-700">
                        Общие материалы
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="unified_billing"
                        checked={holdingForm.settings?.unified_billing || false}
                        onChange={(e) => setHoldingForm({
                          ...holdingForm,
                          settings: { ...holdingForm.settings, unified_billing: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="unified_billing" className="ml-2 text-sm text-gray-700">
                        Единый биллинг
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateHoldingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Создание...' : 'Создать холдинг'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {showAddChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Добавить дочернюю организацию</h2>
              
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название организации <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={childForm.name}
                  onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ООО Новый Строитель"
                />
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={childForm.description}
                    onChange={(e) => setChildForm({ ...childForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Дочерняя строительная компания"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ИНН
                </label>
                <input
                  type="text"
                  value={childForm.inn}
                  onChange={(e) => setChildForm({ ...childForm, inn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234567890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      КПП
                    </label>
                    <input
                      type="text"
                      value={childForm.kpp}
                      onChange={(e) => setChildForm({ ...childForm, kpp: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456789"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={childForm.address}
                    onChange={(e) => setChildForm({ ...childForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="г. Москва, ул. Дочерняя, 5"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={childForm.phone}
                      onChange={(e) => setChildForm({ ...childForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+7 (495) 123-45-67"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={childForm.email}
                  onChange={(e) => setChildForm({ ...childForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="info@novyy-stroitel.ru"
                />
                  </div>
              </div>
              
              {/* Owner Information */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-md font-medium text-gray-900 mb-2">Владелец организации</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Имя владельца <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={childForm.owner.name}
                      onChange={(e) => setChildForm({ ...childForm, owner: { ...childForm.owner, name: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email владельца <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={childForm.owner.email}
                      onChange={(e) => setChildForm({ ...childForm, owner: { ...childForm.owner, email: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="owner@example.com"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль владельца <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={childForm.owner.password}
                    onChange={(e) => setChildForm({ ...childForm, owner: { ...childForm.owner, password: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите пароль"
                  />
                </div>
              </div>
              
                <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Добавление...' : 'Добавить организацию'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiOrganizationPage; 