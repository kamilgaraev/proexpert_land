import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useMultiOrganization } from '@hooks/useMultiOrganization';
import { useModules } from '@hooks/useModules';
import { PageLoading } from '@components/common/PageLoading';
import type { CreateHoldingRequest, AddChildOrganizationRequest } from '@utils/api';

const MultiOrganizationPage = () => {
  const {
    availability,
    hierarchy,
    accessibleOrganizations,
    loading,
    error,
    checkAvailability,
    fetchHierarchy,
    fetchAccessibleOrganizations,
    createHolding,
    addChildOrganization,
    switchContext,
    canCreateHolding,
    isHolding,
    getCurrentOrganizationType,
  } = useMultiOrganization();
  
  const { getActiveModuleSlugs } = useModules();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateHoldingModal, setShowCreateHoldingModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [holdingForm, setHoldingForm] = useState<CreateHoldingRequest>({
    name: '',
    description: '',
    max_child_organizations: 10,
    settings: {
      consolidated_reports: true,
      shared_materials: false,
    },
  });
  const [childForm, setChildForm] = useState<AddChildOrganizationRequest>({
    group_id: 1,
    name: '',
    description: '',
    inn: '',
    kpp: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const initializeData = async () => {
      const available = await checkAvailability();
      if (available) {
        fetchHierarchy();
        fetchAccessibleOrganizations();
      }
    };
    initializeData();
  }, [checkAvailability, fetchHierarchy, fetchAccessibleOrganizations]);

  const handleCreateHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHolding(holdingForm);
      setShowCreateHoldingModal(false);
      setHoldingForm({
        name: '',
        description: '',
        max_child_organizations: 10,
        settings: {
          consolidated_reports: true,
          shared_materials: false,
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
        group_id: 1,
        name: '',
        description: '',
        inn: '',
        kpp: '',
        address: '',
        phone: '',
        email: '',
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

  if (loading && !availability) {
    return <PageLoading message="Проверка доступности мультиорганизации..." />;
  }

  const activeModules = getActiveModuleSlugs();
  const hasMultiOrgAccess = activeModules.includes('multi_organization');
  
  console.log('Активные модули:', activeModules);
  console.log('Доступ к мультиорганизации:', hasMultiOrgAccess);

  // Если API вызовы проходят успешно (статус 200), значит модуль активен
  // Используем успешный ответ API как индикатор доступности
  const apiWorking = hierarchy !== null || accessibleOrganizations.length > 0;

  if (!hasMultiOrgAccess && !apiWorking) {
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
    { id: 'hierarchy', name: 'Иерархия', icon: BuildingOfficeIcon },
    { id: 'organizations', name: 'Организации', icon: UsersIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мультиорганизация</h1>
          <p className="text-gray-600 mt-2">Управление холдинговой структурой</p>
        </div>
        
        {canCreateHolding() && !isHolding() && (
          <button
            onClick={() => setShowCreateHoldingModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Создать холдинг
          </button>
        )}
        
        {isHolding() && (
          <button
            onClick={() => setShowAddChildModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Добавить дочернюю
          </button>
        )}
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
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Тип организации</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {getCurrentOrganizationType() === 'parent' ? 'Головная' : 
                         getCurrentOrganizationType() === 'child' ? 'Дочерняя' : 'Обычная'}
                      </p>
                    </div>
                  </div>
                </div>

                {hierarchy && (
                  <>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-600">Всего организаций</p>
                          <p className="text-lg font-semibold text-green-900">
                            {hierarchy.total_stats.total_organizations}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-purple-600">Всего пользователей</p>
                          <p className="text-lg font-semibold text-purple-900">
                            {hierarchy.total_stats.total_users}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {hierarchy && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика холдинга</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_projects}</p>
                      <p className="text-sm text-gray-600">Проектов</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_contracts}</p>
                      <p className="text-sm text-gray-600">Контрактов</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_users}</p>
                      <p className="text-sm text-gray-600">Пользователей</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{hierarchy.total_stats.total_organizations}</p>
                      <p className="text-sm text-gray-600">Организаций</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="space-y-6">
              {hierarchy ? (
                <div className="relative">
                  {/* Интерактивная схема холдинга */}
                  <div className="min-h-[600px] relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-8">
                    
                    {/* Головная организация в центре */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="relative group">
                        <div className="bg-white border-4 border-blue-500 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[280px] text-center">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BuildingOfficeIcon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{hierarchy.parent.name}</h3>
                          <p className="text-blue-600 font-medium mb-2">Головная организация</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Уровень: {hierarchy.parent.hierarchy_level}</p>
                          </div>
                          
                          {/* Статистика */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="font-medium text-gray-900">{hierarchy.total_stats.total_organizations}</p>
                                <p className="text-gray-500">Организаций</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{hierarchy.total_stats.total_users}</p>
                                <p className="text-gray-500">Пользователей</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Пульсирующий эффект */}
                        <div className="absolute inset-0 bg-blue-500 rounded-2xl opacity-20 animate-ping"></div>
                      </div>
                    </div>

                    {/* SVG для связей */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
                      <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Используем дочерние организации из accessibleOrganizations */}
                      {accessibleOrganizations.filter(org => org.organization_type === 'child' || org.hierarchy_level > 0).map((child, index) => {
                        const childOrganizations = accessibleOrganizations.filter(org => org.organization_type === 'child' || org.hierarchy_level > 0);
                        const angle = (index * 360) / childOrganizations.length;
                        const radius = 200;
                        const centerX = 400;
                        const centerY = 300;
                        const childX = centerX + radius * Math.cos((angle * Math.PI) / 180);
                        const childY = centerY + radius * Math.sin((angle * Math.PI) / 180);
                        
                        return (
                          <g key={child.id}>
                            {/* Основная связь */}
                            <line
                              x1={centerX}
                              y1={centerY}
                              x2={childX}
                              y2={childY}
                              stroke="url(#connectionGradient)"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                              className="animate-pulse"
                            />
                            
                            {/* Точки соединения */}
                            <circle cx={centerX} cy={centerY} r="4" fill="#3b82f6" />
                            <circle cx={childX} cy={childY} r="4" fill="#8b5cf6" />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Дочерние организации по кругу */}
                    {accessibleOrganizations.filter(org => org.organization_type === 'child' || org.hierarchy_level > 0).map((child, index) => {
                      const childOrganizations = accessibleOrganizations.filter(org => org.organization_type === 'child' || org.hierarchy_level > 0);
                      const angle = (index * 360) / childOrganizations.length;
                      const radius = 200;
                      const childX = 50 + radius * Math.cos((angle * Math.PI) / 180);
                      const childY = 50 + radius * Math.sin((angle * Math.PI) / 180);
                      
                      return (
                        <div
                          key={child.id}
                          className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${childX}%`,
                            top: `${childY}%`,
                          }}
                        >
                          <div className="group cursor-pointer">
                            <div className="bg-white border-2 border-purple-400 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[220px] hover:scale-105">
                              <div className="flex items-center mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                  <BuildingOfficeIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">{child.name}</h4>
                                  <p className="text-purple-600 text-xs">
                                    {child.organization_type === 'child' ? 'Дочерняя организация' : 'Дочерняя организация'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>Уровень: {child.hierarchy_level}</p>
                              </div>
                              
                              {/* Индикатор связи */}
                              <div className="flex justify-center mt-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                            
                            {/* Hover эффект */}
                            <div className="absolute inset-0 bg-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Декоративные элементы */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="absolute top-8 right-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-6 left-8 w-4 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                    
                    {/* Сетка фона */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="h-full w-full" style={{
                        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                      }}></div>
                    </div>
                  </div>

                  {/* Легенда */}
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Структура холдинга</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Головная организация</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Дочерние организации</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-600">Связи управления</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных об иерархии</h3>
                  <p className="text-gray-500">Создайте холдинг для просмотра структуры</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="space-y-6">
              {accessibleOrganizations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {accessibleOrganizations.map((org) => (
                    <div key={org.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-8 w-8 text-gray-500 mr-3" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{org.name}</h3>
                            <p className="text-sm text-gray-600">
                              {org.organization_type === 'parent' ? 'Головная' : 
                               org.organization_type === 'child' ? 'Дочерняя' : 'Обычная'}
                            </p>
                          </div>
                        </div>
                        {org.is_holding && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Холдинг
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSwitchContext(org.id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Переключиться
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных организаций</h3>
                  <p className="text-gray-500">У вас нет доступа к другим организациям</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания холдинга */}
      {showCreateHoldingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Создание холдинга</h3>
            <form onSubmit={handleCreateHolding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название холдинга
                </label>
                <input
                  type="text"
                  required
                  value={holdingForm.name}
                  onChange={(e) => setHoldingForm({ ...holdingForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  onChange={(e) => setHoldingForm({ ...holdingForm, max_child_organizations: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateHoldingModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно добавления дочерней организации */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Добавление дочерней организации</h3>
            <form onSubmit={handleAddChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название организации
                </label>
                <input
                  type="text"
                  required
                  value={childForm.name}
                  onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ИНН
                </label>
                <input
                  type="text"
                  value={childForm.inn}
                  onChange={(e) => setChildForm({ ...childForm, inn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Добавление...' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiOrganizationPage; 