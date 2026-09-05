import { useState, useEffect, useRef } from 'react';
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
  CheckIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ConfirmActionModal from '@components/shared/ConfirmActionModal';
import { PageLoading } from '@components/common/PageLoading';
import NotificationService from '@components/shared/NotificationService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface CustomRoleFormModalProps {
  role?: CustomRole;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: CreateCustomRoleData) => Promise<void>;
  availablePermissions: any;
}

const INTERFACE_SYSTEM_PERMISSIONS: Record<string, string[]> = {
  admin: ['admin.access', 'admin.view', 'dashboard.view'],
};

const INTERFACE_GATE_PERMISSIONS: Record<string, string[]> = {
  admin: ['admin.access', 'admin.view'],
};

const getPermissionKeys = (permissions: any): string[] => (
  Array.isArray(permissions)
    ? permissions.map((permission: any) => permission.key).filter(Boolean)
    : []
);

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
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions' | 'modules'>('basic');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (isOpen) {
      if (role) {
        // Нормализуем данные при редактировании
        const sysPerms = role.system_permissions || [];
        const modPerms = role.module_permissions || {};

        const normalizedModPerms: Record<string, string[]> = {};
        Object.entries(modPerms).forEach(([mod, perms]) => {
          normalizedModPerms[mod] = Array.isArray(perms) ? perms : Object.values(perms);
        });

        setFormData({
          name: role.name || '',
          description: role.description || '',
          system_permissions: Array.isArray(sysPerms) ? sysPerms : Object.values(sysPerms),
          module_permissions: normalizedModPerms,
          interface_access: role.interface_access || ['lk'],
          conditions: role.conditions || {}
        });
      } else {
        // Сброс для новой роли
        setFormData({
          name: '',
          description: '',
          system_permissions: [],
          module_permissions: {},
          interface_access: ['lk'],
          conditions: {}
        });
      }
      setActiveTab('basic');
      setExpandedModules(new Set());
    }
  }, [isOpen, role]);

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
    setFormData(prev => {
      const currentModulePermissions = prev.module_permissions?.[module] || [];
      const nextPermissionList = currentModulePermissions.includes(permission)
        ? currentModulePermissions.filter(p => p !== permission)
        : [...currentModulePermissions, permission];
      const nextModulePermissions = { ...(prev.module_permissions || {}) };

      if (nextPermissionList.length > 0) {
        nextModulePermissions[module] = nextPermissionList;
      } else {
        delete nextModulePermissions[module];
      }

      return {
        ...prev,
        module_permissions: nextModulePermissions
      };
    });
  };

  const toggleModuleExpanded = (module: string) => {
    setExpandedModules(prev => {
      const nextExpandedModules = new Set(prev);

      if (nextExpandedModules.has(module)) {
        nextExpandedModules.delete(module);
      } else {
        nextExpandedModules.add(module);
      }

      return nextExpandedModules;
    });
  };

  const selectModulePermissions = (module: string, permissions: any) => {
    const permissionKeys = getPermissionKeys(permissions);

    if (permissionKeys.length === 0) return;

    setFormData(prev => ({
      ...prev,
      module_permissions: {
        ...(prev.module_permissions || {}),
        [module]: permissionKeys
      }
    }));
  };

  const clearModulePermissions = (module: string) => {
    setFormData(prev => {
      const nextModulePermissions = { ...(prev.module_permissions || {}) };
      delete nextModulePermissions[module];

      return {
        ...prev,
        module_permissions: nextModulePermissions
      };
    });
  };

  const selectAllModulePermissions = () => {
    const allModulePermissions = Object.entries(availablePermissions?.module_permissions || {}).reduce(
      (acc, [module, permissions]) => {
        const permissionKeys = getPermissionKeys(permissions);
        if (permissionKeys.length > 0) {
          acc[module] = permissionKeys;
        }
        return acc;
      },
      {} as Record<string, string[]>
    );

    setFormData(prev => ({
      ...prev,
      module_permissions: allModulePermissions,
    }));
  };

  const clearAllModulePermissions = () => {
    setFormData(prev => ({
      ...prev,
      module_permissions: {},
    }));
  };

  const toggleInterfaceAccess = (interfaceName: string) => {
    setFormData(prev => ({
      ...prev,
      interface_access: prev.interface_access.includes(interfaceName)
        ? prev.interface_access.filter(i => i !== interfaceName)
        : [...prev.interface_access, interfaceName],
      system_permissions: prev.interface_access.includes(interfaceName)
        ? prev.system_permissions.filter(permission => !(INTERFACE_GATE_PERMISSIONS[interfaceName] || []).includes(permission))
        : Array.from(new Set([
            ...prev.system_permissions,
            ...(INTERFACE_SYSTEM_PERMISSIONS[interfaceName] || []),
          ])),
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !loading) onClose(); }}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:rounded-md" onPointerDownOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={(event) => { event.preventDefault(); returnFocusRef.current?.focus(); }}>
        <DialogHeader className="border-b border-border p-5 pr-14 text-left sm:p-6 sm:pr-14">
          <DialogTitle>{role ? 'Редактировать роль' : 'Создать роль'}</DialogTitle>
          <DialogDescription>Укажите название и выберите доступные сотруднику разделы и действия.</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex min-h-0 flex-1 flex-col">

        {/* Tabs */}
        <div className="border-b border-border">
          <TabsList aria-label="Настройка роли" className="grid h-auto w-full grid-cols-3 gap-1 rounded-none bg-transparent p-2">
            {[
              { key: 'basic', label: 'Основное', icon: ShieldCheckIcon },
              { key: 'permissions', label: 'Права доступа', icon: CheckIcon },
              { key: 'modules', label: 'Модули', icon: UsersIcon }
            ].map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="min-h-11 min-w-0 whitespace-normal px-2 py-2 text-center leading-snug">
                <tab.icon className="mr-2 hidden h-5 w-5 shrink-0 sm:block" aria-hidden="true" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="m-0 space-y-6">
              <div>
                <label htmlFor="custom-role-name" className="block text-sm font-medium text-foreground mb-2">
                  Название роли *
                </label>
                <input
                  id="custom-role-name"
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full min-h-11 rounded-sm border border-input bg-background px-3 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="Введите название роли"
                />
              </div>

              <div>
                <label htmlFor="custom-role-description" className="block text-sm font-medium text-foreground mb-2">
                  Описание
                </label>
                <textarea
                  id="custom-role-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full min-h-11 rounded-sm border border-input bg-background px-3 py-2 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="Краткое описание роли"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Доступ к интерфейсам
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'lk', label: 'Личный кабинет' },
                    { key: 'admin', label: 'Работа с объектами' },
                    { key: 'mobile', label: 'Мобильное приложение' }
                  ].map(interface_ => (
                    <label key={interface_.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interface_access.includes(interface_.key)}
                        onChange={() => toggleInterfaceAccess(interface_.key)}
                        className="h-4 w-4 shrink-0 accent-primary focus:ring-primary border-border rounded"
                      />
                      <span className="ml-2 text-sm text-foreground">{interface_.label}</span>
                    </label>
                  ))}
                </div>
              </div>
          </TabsContent>

          <TabsContent value="permissions" className="m-0 space-y-6">
              {availablePermissions?.system_permissions && (
                <>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-4">Системные права</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePermissions.system_permissions.map((permission: any) => (
                        <label key={permission.key} className="flex items-start">
                          <input
                            type="checkbox"
                            checked={formData.system_permissions.includes(permission.key)}
                            onChange={() => toggleSystemPermission(permission.key)}
                            className="h-4 w-4 shrink-0 accent-primary focus:ring-primary border-border rounded mt-0.5"
                          />
                          <div className="ml-2">
                            <span className="text-sm font-medium text-foreground">{permission.name}</span>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
          </TabsContent>

          <TabsContent value="modules" className="m-0 space-y-6">
              {availablePermissions?.module_permissions && (
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Button variant="outline" onClick={selectAllModulePermissions}>Выбрать все</Button>
                  <Button variant="outline" onClick={clearAllModulePermissions}>Снять все</Button>
                </div>
              )}
              {availablePermissions?.module_permissions && Object.entries(availablePermissions.module_permissions).map(([module, permissions]: [string, any]) => {
                const moduleName = availablePermissions?.module_groups?.[module] || module;
                const permissionList = Array.isArray(permissions) ? permissions : [];
                const permissionKeys = getPermissionKeys(permissions);
                const selectedPermissions = formData.module_permissions?.[module] || [];
                const selectedCount = permissionKeys.filter(permission => selectedPermissions.includes(permission)).length;
                const isExpanded = expandedModules.has(module);
                const isFullySelected = permissionKeys.length > 0 && permissionKeys.every(permission => selectedPermissions.includes(permission));
                const moduleSelectionLabel = isFullySelected
                  ? `Снять все права модуля ${moduleName}`
                  : `Выбрать все права модуля ${moduleName}`;

                return (
                  <div key={module} className="overflow-hidden rounded-lg border border-border">
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={`module-permissions-${module}`}
                        aria-label={isExpanded ? `Свернуть модуль ${moduleName}` : `Развернуть модуль ${moduleName}`}
                        onClick={() => toggleModuleExpanded(module)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <ChevronDownIcon className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        <span className="min-w-0">
                          <span className="block text-lg font-medium text-foreground">{moduleName}</span>
                          <span className="block text-sm text-muted-foreground">Выбрано прав: {selectedCount} из {permissionKeys.length}</span>
                        </span>
                      </button>
                      <Button
                        variant="outline"
                        aria-label={moduleSelectionLabel}
                        disabled={permissionKeys.length === 0}
                        onClick={() => {
                          if (isFullySelected) {
                            clearModulePermissions(module);
                          } else {
                            selectModulePermissions(module, permissions);
                          }
                        }}
                        className="shrink-0"
                      >
                        {isFullySelected ? 'Снять модуль' : 'Выбрать модуль'}
                      </Button>
                    </div>
                    {isExpanded && (
                      <div id={`module-permissions-${module}`} className="border-t border-border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissionList.map((permission: any) => (
                            <label key={permission.key} className="flex items-start">
                              <input
                                type="checkbox"
                                checked={formData.module_permissions?.[module]?.includes(permission.key) || false}
                                onChange={() => toggleModulePermission(module, permission.key)}
                                className="h-4 w-4 shrink-0 accent-primary focus:ring-primary border-border rounded mt-0.5"
                              />
                              <div className="ml-2">
                                <span className="text-sm font-medium text-foreground">{permission.name}</span>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </TabsContent>
        </div>
        </Tabs>
        <DialogFooter className="gap-2 border-t border-border p-5 sm:p-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>Отменить</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Сохранение…' : (role ? 'Сохранить' : 'Создать')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const cloneFocusRef = useRef<HTMLElement | null>(null);

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
        title: 'Роль скопирована',
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

  if (loading && customRoles.length === 0 && !showCreateModal && !editingRole && !cloningRole && !deletingRole) {
    return <PageLoading message="Загружаем роли…" />;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-foreground">Управление ролями</h1>
          <p className="text-muted-foreground mt-2">
            Настройте, какие разделы и действия доступны сотрудникам
          </p>
        </div>

        <ProtectedComponent
          permission="roles.create_custom"
          role="organization_owner"
          requireAll={false}
          fallback={
            <div className="px-4 py-2 bg-muted text-muted-foreground rounded-lg">
              Нет прав на создание ролей
            </div>
          }
        >
          <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
            <PlusIcon aria-hidden="true" />
            Создать роль
          </Button>
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
      <div className="bg-card shadow-sm rounded-2xl border border-border">
        {customRoles.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ShieldCheckIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-2">Дополнительных ролей пока нет</h2>
            <p className="text-muted-foreground mb-4">Создайте роль, если сотруднику нужен свой набор прав</p>
            <ProtectedComponent permission="roles.create_custom" role="organization_owner" requireAll={false}>
              <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                <PlusIcon aria-hidden="true" />
                Создать роль
              </Button>
            </ProtectedComponent>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {customRoles.map((role) => (
              <div key={role.id} className="p-6 hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                      <span className="inline-flex rounded-sm border border-border bg-muted px-2 py-1 text-xs font-medium text-foreground">
                        {role.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>

                    {role.description && (
                      <p className="text-muted-foreground mb-3">{role.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
                      <Button variant="outline" size="icon" onClick={() => setEditingRole(role)} aria-label={`Редактировать роль «${role.name}»`}>
                        <PencilIcon aria-hidden="true" />
                      </Button>

                      <Button variant="outline" size="icon" onClick={() => setCloningRole(role)} aria-label={`Копировать роль «${role.name}»`}>
                        <DocumentDuplicateIcon aria-hidden="true" />
                      </Button>

                      <Button variant="outline" size="icon" onClick={() => setDeletingRole(role)} aria-label={`Удалить роль «${role.name}»`}>
                        <TrashIcon aria-hidden="true" />
                      </Button>
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
        <Dialog open onOpenChange={(open) => { if (!open && !loading) { setCloningRole(null); setCloneName(''); } }}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:rounded-md"
            onOpenAutoFocus={() => { cloneFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
            onCloseAutoFocus={(event) => { event.preventDefault(); cloneFocusRef.current?.focus(); }}
            onPointerDownOutside={(event) => event.preventDefault()}>
            <DialogHeader className="pr-8 text-left">
              <DialogTitle>Копировать роль</DialogTitle>
              <DialogDescription>Создать копию роли «{cloningRole.name}» с тем же набором прав.</DialogDescription>
            </DialogHeader>
            <div className="mb-4">
              <label htmlFor="clone-role-name" className="block text-sm font-medium text-foreground mb-2">
                Название новой роли
              </label>
              <input
                id="clone-role-name"
                type="text"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                className="min-h-11 w-full rounded-sm border border-input bg-background px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                placeholder={`Копия ${cloningRole.name}`}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" disabled={loading} onClick={() => { setCloningRole(null); setCloneName(''); }}>Отменить</Button>
              <Button onClick={handleCloneRole} disabled={loading || !cloneName.trim()}>
                {loading ? 'Копирование…' : 'Создать копию'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomRolesPage;
