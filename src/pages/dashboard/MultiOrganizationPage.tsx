import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PlusIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useMultiOrganization } from '@hooks/useMultiOrganization';
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
    isMultiOrganizationAvailable,
    canCreateHolding,
    isHolding,
    getCurrentOrganizationType,
  } = useMultiOrganization();

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

  if (!isMultiOrganizationAvailable()) {
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
                <div>
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-blue-100 p-6 rounded-lg text-center">
                      <BuildingOfficeIcon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold text-blue-900">{hierarchy.parent.name}</h3>
                      <p className="text-blue-600">Головная организация</p>
                    </div>
                  </div>

                  {hierarchy.children.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Дочерние организации</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hierarchy.children.map((child) => (
                          <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <BuildingOfficeIcon className="h-6 w-6 text-gray-500 mr-2" />
                              <h5 className="font-medium text-gray-900">{child.name}</h5>
                            </div>
                            {child.inn && (
                              <p className="text-sm text-gray-600">ИНН: {child.inn}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Уровень: {child.hierarchy_level}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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