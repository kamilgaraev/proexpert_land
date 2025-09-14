import { useState } from 'react';
import { useCustomRoles } from '@hooks/useCustomRoles';
import { CustomRole, CreateCustomRoleData } from '@utils/api';
import { ProtectedComponent } from '@/components/permissions/ProtectedComponent';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ConfirmActionModal from '@components/shared/ConfirmActionModal';
import { PageLoading } from '@components/common/PageLoading';
import NotificationService from '@components/shared/NotificationService';

interface CustomRoleFormModalProps {
  role?: CustomRole;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: CreateCustomRoleData) => Promise<void>;
  availablePermissions: any;
}

const CustomRoleFormModal = ({ role, isOpen, onClose, onSave, availablePermissions }: CustomRoleFormModalProps) => {
  const [formData, setFormData] = useState<CreateCustomRoleData>({
    name: role?.name || '',
    description: role?.description || '',
    system_permissions: role?.system_permissions || [],
    module_permissions: role?.module_permissions || {},
    interface_access: role?.interface_access || ['lk'],
    conditions: role?.conditions || {}
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions' | 'modules'>('basic');

  const handleSave = async () => {
    if (!formData.name.trim()) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка валидации',
        message: 'Название роли обязательно'
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      NotificationService.show({
        type: 'success',
        title: 'Успешно',
        message: role ? 'Роль обновлена' : 'Роль создана'
      });
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSystemPermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      system_permissions: prev.system_permissions.includes(permission)
        ? prev.system_permissions.filter(p => p !== permission)
        : [...prev.system_permissions, permission]
    }));
  };

  const toggleModulePermission = (module: string, permission: string) => {
    setFormData(prev => ({
      ...prev,
      module_permissions: {
        ...prev.module_permissions,
        [module]: prev.module_permissions?.[module]?.includes(permission)
          ? prev.module_permissions[module].filter(p => p !== permission)
          : [...(prev.module_permissions?.[module] || []), permission]
      }
    }));
  };

  const toggleInterfaceAccess = (interfaceName: string) => {
    setFormData(prev => ({
      ...prev,
      interface_access: prev.interface_access.includes(interfaceName)
        ? prev.interface_access.filter(i => i !== interfaceName)
        : [...prev.interface_access, interfaceName]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {role ? 'Редактировать роль' : 'Создать новую роль'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { key: 'basic', label: 'Основное', icon: ShieldCheckIcon },
              { key: 'permissions', label: 'Права доступа', icon: CheckIcon },
              { key: 'modules', label: 'Модули', icon: UsersIcon }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название роли *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Введите название роли"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Краткое описание роли"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Доступ к интерфейсам
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'lk', label: 'Личный кабинет' },
                    { key: 'admin', label: 'Админ-панель' },
                    { key: 'mobile', label: 'Мобильное приложение' }
                  ].map(interface_ => (
                    <label key={interface_.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interface_access.includes(interface_.key)}
                        onChange={() => toggleInterfaceAccess(interface_.key)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{interface_.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {availablePermissions?.system_permissions && (
                <>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Системные права</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePermissions.system_permissions.map((permission: any) => (
                        <label key={permission.key} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.system_permissions.includes(permission.key)}
                            onChange={() => toggleSystemPermission(permission.key)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                          />
                          <div className="ml-2">
                            <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                            {permission.description && (
                              <p className="text-xs text-gray-500">{permission.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Module Permissions Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              {availablePermissions?.module_permissions && Object.entries(availablePermissions.module_permissions).map(([module, permissions]: [string, any]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 capitalize">{module}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission: any) => (
                      <label key={permission.key} className="flex items-start">
                        <input
                          type="checkbox"
                          checked={formData.module_permissions?.[module]?.includes(permission.key) || false}
                          onChange={() => toggleModulePermission(module, permission.key)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                        />
                        <div className="ml-2">
                          <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                          {permission.description && (
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Отменить
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Сохранение...' : (role ? 'Обновить' : 'Создать')}
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomRolesPage = () => {
  const {
    customRoles,
    availablePermissions,
    loading,
    error,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    cloneCustomRole,
  } = useCustomRoles();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<CustomRole | null>(null);
  const [cloningRole, setCloningRole] = useState<CustomRole | null>(null);
  const [cloneName, setCloneName] = useState('');

  const handleCreateRole = async (roleData: CreateCustomRoleData) => {
    await createCustomRole(roleData);
    setShowCreateModal(false);
  };

  const handleUpdateRole = async (roleData: CreateCustomRoleData) => {
    if (!editingRole) return;
    await updateCustomRole(editingRole.id, roleData);
    setEditingRole(null);
  };

  const handleDeleteRole = async () => {
    if (!deletingRole) return;
    try {
      await deleteCustomRole(deletingRole.id);
      setDeletingRole(null);
      NotificationService.show({
        type: 'success',
        title: 'Роль удалена',
        message: `Роль "${deletingRole.name}" успешно удалена`
      });
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message
      });
    }
  };

  const handleCloneRole = async () => {
    if (!cloningRole || !cloneName.trim()) return;
    try {
      await cloneCustomRole(cloningRole.id, cloneName);
      setCloningRole(null);
      setCloneName('');
      NotificationService.show({
        type: 'success',
        title: 'Роль клонирована',
        message: `Создана копия роли "${cloneName}"`
      });
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message
      });
    }
  };

  if (loading && customRoles.length === 0) {
    return <PageLoading message="Загрузка кастомных ролей..." />;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-steel-900">Управление ролями</h1>
          <p className="text-steel-600 mt-2">
            Создавайте и настраивайте кастомные роли для пользователей организации
          </p>
        </div>
        
        <ProtectedComponent
          permission="roles.create_custom"
          role="organization_owner"
          requireAll={false}
          fallback={
            <div className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg">
              Нет прав на создание ролей
            </div>
          }
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Создать роль
          </button>
        </ProtectedComponent>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="bg-white shadow-lg rounded-2xl border border-steel-200">
        {customRoles.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет кастомных ролей</h3>
            <p className="text-gray-600 mb-4">Создайте первую роль для управления доступом пользователей</p>
            <ProtectedComponent permission="roles.create_custom" role="organization_owner" requireAll={false}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Создать роль
              </button>
            </ProtectedComponent>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {customRoles.map((role) => (
              <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-steel-900">{role.name}</h3>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        role.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                    
                    {role.description && (
                      <p className="text-steel-600 mb-3">{role.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-steel-500">
                      <div className="flex items-center">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        <span>{role.system_permissions.length} системных прав</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        <span>{Object.keys(role.module_permissions || {}).length} модулей</span>
                      </div>
                      <div className="text-xs">
                        Создана: {new Date(role.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ProtectedComponent
                      permission="roles.manage_custom"
                      role="organization_owner"
                      requireAll={false}
                      showFallback={false}
                    >
                      <button
                        onClick={() => setEditingRole(role)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Редактировать роль"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setCloningRole(role)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Клонировать роль"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setDeletingRole(role)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Удалить роль"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </ProtectedComponent>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomRoleFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRole}
        availablePermissions={availablePermissions}
      />
      
      <CustomRoleFormModal
        role={editingRole || undefined}
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        onSave={handleUpdateRole}
        availablePermissions={availablePermissions}
      />

      {/* Delete Confirmation */}
      <ConfirmActionModal
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDeleteRole}
        title="Удалить роль?"
        message={`Вы действительно хотите удалить роль "${deletingRole?.name}"? Это действие нельзя отменить.`}
        confirmLabel="Удалить"
        confirmColorClass="red"
        isLoading={loading}
      />

      {/* Clone Modal */}
      {cloningRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Клонировать роль</h3>
            <p className="text-gray-600 mb-4">
              Создать копию роли "{cloningRole.name}"
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название новой роли
              </label>
              <input
                type="text"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder={`Копия ${cloningRole.name}`}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCloningRole(null);
                  setCloneName('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отменить
              </button>
              <button
                onClick={handleCloneRole}
                disabled={!cloneName.trim()}
                className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Клонировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomRolesPage;
