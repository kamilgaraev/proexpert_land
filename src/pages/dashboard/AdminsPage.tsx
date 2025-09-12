import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { adminPanelUserService } from '@utils/api';
import { AdminPanelUser } from '@/types/admin';
import AdminFormModal from '@components/dashboard/admins/AdminFormModal';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import { toast } from 'react-toastify';
import { useUserManagement } from '@hooks/useUserManagement';
import { useCustomRoles } from '@hooks/useCustomRoles';
import UsersList from '@components/dashboard/users/UsersList';
import InvitationsList from '@components/dashboard/users/InvitationsList';
import RolesList from '@components/dashboard/users/RolesList';
import InviteUserModal from '@components/dashboard/users/InviteUserModal';
import { ProtectedComponent } from '@/components/permissions/ProtectedComponent';

type TabType = 'admins' | 'users' | 'invitations' | 'roles' | 'custom-roles';

const AdminsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('admins');
  const [admins, setAdmins] = useState<AdminPanelUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminPanelUser | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminPanelUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    users,
    invitations,
    roles,
    limits,
    loading: userManagementLoading,
    error: userManagementError,
    fetchUsers,
    fetchInvitations,
    fetchRoles,
    clearError
  } = useUserManagement();

  const {
    customRoles,
    loading: customRolesLoading,
    error: customRolesError,
    fetchCustomRoles,
    createCustomRole,
    deleteCustomRole,
    cloneCustomRole
  } = useCustomRoles();

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setEditingAdmin(null);
    setDeletingAdmin(null);
    try {
      const response = await adminPanelUserService.getAdminPanelUsers();
      setAdmins(response.data || []);
      setError(null);
    } catch (err) {
      setError("Не удалось загрузить список администраторов. Пожалуйста, попробуйте еще раз.");
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    const initUserManagementData = async () => {
      try {
        if (activeTab === 'users') {
          await fetchUsers();
        } else if (activeTab === 'invitations') {
          await fetchInvitations();
        } else if (activeTab === 'roles') {
          await fetchRoles();
        } else if (activeTab === 'custom-roles') {
          await fetchCustomRoles();
        } else {
          // Загружаем все данные для общего обзора
          await Promise.all([
            fetchUsers(),
            fetchInvitations(),
            fetchRoles(),
            fetchCustomRoles()
          ]);
        }
      } catch (err) {
      }
    };

    if (activeTab !== 'admins') {
      initUserManagementData();
    }
  }, [activeTab, fetchUsers, fetchInvitations, fetchRoles, fetchCustomRoles]);

  useEffect(() => {
    if (userManagementError) {
      clearError();
    }
  }, [userManagementError, clearError]);

  const filteredAdmins = useMemo(() => {
    if (!searchTerm) {
      return admins;
    }
    return admins.filter(admin => 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getRoleDisplayName = (role_slug: string | null): string => {
    switch (role_slug) {
      case 'organization_owner':
        return 'Владелец организации';
      case 'organization_admin':
        return 'Администратор организации';
      case 'web_admin':
        return 'Веб-администратор';
      case 'accountant':
        return 'Бухгалтер';
      case 'super_admin':
        return 'Главный администратор';
      case 'admin':
        return 'Администратор';
      case 'content_admin':
        return 'Администратор контента';
      case 'support_admin':
        return 'Администратор поддержки';
      default:
        return role_slug || 'N/A';
    }
  };

  const getRoleColor = (role_slug: string | null): string => {
    switch (role_slug) {
      case 'organization_owner':
        return 'bg-construction-100 text-construction-800';
      case 'organization_admin':
        return 'bg-safety-100 text-safety-800';
      case 'web_admin':
        return 'bg-earth-100 text-earth-800';
      case 'accountant':
        return 'bg-steel-100 text-steel-800';
      case 'super_admin':
        return 'bg-construction-100 text-construction-800';
      case 'admin':
        return 'bg-safety-100 text-safety-800';
      default:
        return 'bg-steel-100 text-steel-800';
    }
  };
  
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (admin: AdminPanelUser) => {
    setEditingAdmin(admin);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAdmin(null);
  };
  
  const handleFormSubmitted = () => {
    fetchAdmins();
  };

  const handleOpenDeleteConfirmModal = (admin: AdminPanelUser) => {
    setDeletingAdmin(admin);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleCloseDeleteConfirmModal = () => {
    setDeletingAdmin(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingAdmin) return;
    
    setIsProcessingDelete(true);
    setError(null);
    try {
      const result = await adminPanelUserService.deleteAdminPanelUser(deletingAdmin.id);

      if (result.success) {
        toast.success(result.message || 'Администратор успешно удален.');
        fetchAdmins();
        handleCloseDeleteConfirmModal();
      } else {
        const errorMessage = result.message || "Не удалось удалить администратора.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Не удалось удалить администратора.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const tabs = [
    { id: 'admins' as TabType, name: 'Администраторы', count: admins.length },
    { id: 'users' as TabType, name: 'Пользователи', count: users.length },
    { id: 'invitations' as TabType, name: 'Приглашения', count: invitations.length },
    { id: 'roles' as TabType, name: 'Роли', count: roles.length },
    { id: 'custom-roles' as TabType, name: 'Кастомные роли', count: customRoles.length }
  ];

  const renderContent = () => {
    // Показываем ошибки управления пользователями для соответствующих табов
    if (userManagementError && ['users', 'invitations', 'roles'].includes(activeTab)) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900">Ошибка загрузки данных</h3>
            <p className="text-sm text-red-700 mt-1">{userManagementError}</p>
            <button 
              onClick={() => {
                clearError();
                if (activeTab === 'users') fetchUsers();
                else if (activeTab === 'invitations') fetchInvitations();
                else if (activeTab === 'roles') fetchRoles();
              }}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    // Показываем ошибки кастомных ролей для соответствующего таба
    if (customRolesError && activeTab === 'custom-roles') {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900">Ошибка загрузки кастомных ролей</h3>
            <p className="text-sm text-red-700 mt-1">{customRolesError}</p>
            <button 
              onClick={() => fetchCustomRoles()}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return <UsersList users={users} loading={userManagementLoading} onRefresh={fetchUsers} />;
      case 'invitations':
        return (
          <>
            <InvitationsList 
              invitations={invitations} 
              loading={userManagementLoading} 
              onRefresh={fetchInvitations} 
              onInvite={() => setShowInviteModal(true)}
            />
            <InviteUserModal 
              isOpen={showInviteModal} 
              onClose={() => setShowInviteModal(false)} 
              onSave={() => {
                setShowInviteModal(false);
                fetchInvitations();
              }}
            />
          </>
        );
      case 'roles':
        return <RolesList roles={roles} loading={userManagementLoading} onRefresh={fetchRoles} />;
      case 'custom-roles':
        return renderCustomRolesContent();
      case 'admins':
      default:
        return renderAdminsContent();
    }
  };

  const renderCustomRolesContent = () => {
    if (customRolesLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-construction-200 border-t-construction-600"></div>
        </div>
      );
    }

    if (customRoles.length === 0 && !customRolesError) {
      return (
        <div className="text-center py-12">
          <ShieldCheckIcon className="h-16 w-16 text-steel-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-steel-900 mb-2">Нет кастомных ролей</h3>
          <p className="text-steel-600 mb-6">
            Создайте кастомные роли для управления правами пользователей
          </p>
          <ProtectedComponent 
            permission="roles.create_custom"
            role="organization_owner"
            requireAll={false}
            showFallback={false}
          >
            <motion.button
              onClick={() => window.location.href = '/dashboard/custom-roles'}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl hover:shadow-construction transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Создать роль
            </motion.button>
          </ProtectedComponent>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customRoles.map((role, index) => (
          <motion.div
            key={role.id}
            className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <ShieldCheckIcon className="w-10 h-10 text-orange-500" />
                  </div>
                </div>
                {role.is_active && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-earth-500 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-steel-900 truncate">{role.name}</h3>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  role.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {role.is_active ? 'Активна' : 'Неактивна'}
                </span>
              </div>
            </div>

            {role.description && (
              <p className="text-steel-600 text-sm mb-4 line-clamp-2">{role.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-steel-600">
                <CheckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{role.system_permissions.length} системных прав</span>
              </div>
              
              <div className="flex items-center text-sm text-steel-600">
                <UsersIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{Object.keys(role.module_permissions || {}).length} модулей</span>
              </div>
              
              <div className="flex items-center text-sm text-steel-600">
                <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Создана: {new Date(role.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <ProtectedComponent 
                permission="roles.view_custom"
                role="organization_owner"
                requireAll={false}
                showFallback={false}
              >
                <motion.button
                  onClick={() => window.location.href = '/dashboard/custom-roles'}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-steel-300 text-steel-700 rounded-lg hover:bg-steel-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Управление
                </motion.button>
              </ProtectedComponent>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderAdminsContent = () => {
    if (isLoading) {
      return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-construction-200 border-t-construction-600"></div>
          </div>
      );
    }

    if (filteredAdmins.length === 0 && !error) {
      return (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-steel-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-steel-900 mb-2">
              {searchTerm ? 'Администраторы не найдены' : 'Нет администраторов'}
            </h3>
            <p className="text-steel-600 mb-6">
              {searchTerm 
                ? 'Попробуйте изменить критерии поиска' 
                : 'Добавьте первого администратора для начала работы'
              }
            </p>
            {!searchTerm && (
              <motion.button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl hover:shadow-construction transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Добавить администратора
              </motion.button>
            )}
          </div>
      );
    }

    return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdmins.map((admin, index) => (
              <motion.div
                key={admin.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                                         <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-construction-500 to-construction-600 p-0.5">
                       <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                         <UserCircleIcon className="w-10 h-10 text-steel-400" />
                       </div>
                     </div>
                     {admin.is_active && (
                       <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-earth-500 rounded-full flex items-center justify-center">
                         <ShieldCheckIcon className="w-3 h-3 text-white" />
                       </div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-steel-900 truncate">{admin.name}</h3>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role_slug)}`}>
                      {getRoleDisplayName(admin.role_slug)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-steel-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{admin.email}</span>
              </div>
                  
                  <div className="flex items-center text-sm text-steel-600">
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Создан: {formatDate(admin.created_at)}</span>
                          </div>
                        </div>

                 <div className="mb-4">
                        {admin.is_active ? (
                     <div className="flex items-center text-sm text-earth-600">
                       <ShieldCheckIcon className="w-4 h-4 mr-2" />
                       <span>Активный пользователь</span>
                     </div>
                   ) : (
                     <div className="flex items-center text-sm text-safety-600">
                       <CalendarIcon className="w-4 h-4 mr-2" />
                       <span>Неактивный пользователь</span>
                     </div>
                   )}
                 </div>

                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleOpenEditModal(admin)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-steel-300 text-steel-700 rounded-lg hover:bg-steel-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Редактировать
                  </motion.button>
                  <motion.button
                    onClick={() => handleOpenDeleteConfirmModal(admin)}
                    className="px-3 py-2 border border-construction-300 text-construction-700 rounded-lg hover:bg-construction-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
      </div>
    );
  };



  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Команда</h1>
            <p className="text-sm text-gray-600 mt-1">
              Управление администраторами, пользователями, ролями и приглашениями
            </p>
          </div>
          {activeTab === 'admins' && (
            <motion.button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl hover:shadow-construction transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Добавить администратора
            </motion.button>
          )}
          {activeTab === 'custom-roles' && (
            <ProtectedComponent 
              permission="roles.create_custom"
              role="organization_owner"
              requireAll={false}
              showFallback={false}
            >
              <motion.button
                onClick={() => window.location.href = '/dashboard/custom-roles'}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-orange transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Управление ролями
              </motion.button>
            </ProtectedComponent>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-construction-100 text-construction-600 flex items-center justify-center">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Администраторы</h3>
                  <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Пользователи</h3>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Приглашения</h3>
                  <p className="text-2xl font-bold text-gray-900">{invitations.filter(inv => inv.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Роли</h3>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                  <p className="text-xs text-gray-500">+{customRoles.length} кастомных</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {limits && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Лимиты подписки</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {limits.limits.users && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Пользователи:</span>
                      <span className="text-sm text-gray-600">
                        {limits.limits.users.is_unlimited ? 'Безлимитно' : `${limits.limits.users.used} / ${limits.limits.users.limit}`}
                      </span>
                    </div>
                    {!limits.limits.users.is_unlimited && (
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(limits.limits.users.percentage_used, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {limits.limits.foremen && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Прорабы:</span>
                      <span className="text-sm text-gray-600">
                        {limits.limits.foremen.is_unlimited ? 'Безлимитно' : `${limits.limits.foremen.used} / ${limits.limits.foremen.limit}`}
                      </span>
                    </div>
                    {!limits.limits.foremen.is_unlimited && (
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(limits.limits.foremen.percentage_used, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.name}</span>
                <span className={`${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'admins' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-steel-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-steel-300 rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors"
            />
          </div>
        </motion.div>
      )}

      <div className="bg-white shadow rounded-lg">
        {error && !isProcessingDelete && (
          <motion.div 
            className="mb-6 p-4 bg-construction-50 border border-construction-200 text-construction-700 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">{error}</p>
      </motion.div>
        )}
        {renderContent()}
      </div>

             {/* Модальные окна */}
      <AdminFormModal 
        isOpen={isFormModalOpen} 
        onClose={handleCloseFormModal} 
        onFormSubmit={handleFormSubmitted} 
         adminToEdit={editingAdmin}
      />

        <ConfirmDeleteModal
         isOpen={isConfirmDeleteModalOpen}
          onClose={handleCloseDeleteConfirmModal}
          onConfirm={handleDeleteConfirmed}
          title="Удалить администратора"
         message={`Вы уверены, что хотите удалить администратора "${deletingAdmin?.name}"? Это действие нельзя отменить.`}
          isLoading={isProcessingDelete}
        />
    </div>
  );
};

export default AdminsPage; 