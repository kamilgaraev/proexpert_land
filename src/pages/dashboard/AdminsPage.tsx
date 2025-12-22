import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserPlusIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { adminPanelUserService } from '@utils/api';
import { AdminPanelUser } from '@/types/admin';
import AdminFormModal from '@components/dashboard/admins/AdminFormModal';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import { toast } from 'react-toastify';
import { useUserManagement } from '@hooks/useUserManagement';
import UsersList from '@components/dashboard/users/UsersList';
import InvitationsList from '@components/dashboard/users/InvitationsList';
import UserCreateInviteModal from '@components/dashboard/users/UserCreateInviteModal';
import RolesComparisonTable from '@components/dashboard/roles/RolesComparisonTable';
import { ProtectedComponent } from '@/components/permissions/ProtectedComponent';

type TabType = 'admins' | 'users' | 'invitations' | 'roles-comparison';

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
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  const {
    users,
    invitations,
    limits,
    loading: userManagementLoading,
    error: userManagementError,
    fetchUsers,
    fetchInvitations,
    fetchRoles,
    clearError
  } = useUserManagement();

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
          await Promise.all([
            fetchUsers(),
            fetchRoles(),
          ]);
        } else if (activeTab === 'invitations') {
          await Promise.all([
            fetchInvitations(),
            fetchRoles(),
          ]);
        } else {
          await Promise.all([
            fetchUsers(),
            fetchInvitations(),
            fetchRoles(),
          ]);
        }
      } catch (err) {
      }
    };

    if (activeTab !== 'admins') {
      initUserManagementData();
    }
  }, [activeTab, fetchUsers, fetchInvitations, fetchRoles]);

  useEffect(() => {
    if (userManagementError) {
      clearError();
    }
  }, [userManagementError, clearError]);

  // Загружаем роли всегда при заходе на страницу, чтобы эндпоинт available-roles вызывался сразу
  useEffect(() => {
    fetchRoles().catch(() => {});
  }, [fetchRoles]);

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
        return 'Владелец';
      case 'organization_admin':
        return 'Администратор';
      case 'web_admin':
        return 'Веб-админ';
      case 'accountant':
        return 'Бухгалтер';
      case 'super_admin':
        return 'Главный';
      case 'admin':
        return 'Админ';
      case 'content_admin':
        return 'Контент';
      case 'support_admin':
        return 'Поддержка';
      default:
        return role_slug || 'Пользователь';
    }
  };

  const getRoleColor = (role_slug: string | null): string => {
    switch (role_slug) {
      case 'organization_owner':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'organization_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'web_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'accountant':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string | null): string | null => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return null;
    }
  };

  const isEmailVerified = (admin: AdminPanelUser) => {
    return admin.email_verified_at !== null && admin.email_verified_at !== undefined;
  };

  const handleResendVerificationEmail = async (adminId: number) => {
    setSendingEmail(adminId);
    try {
      const result = await adminPanelUserService.resendVerificationEmailForAdmin(adminId);
      if (result.success) {
        toast.success('Письмо для подтверждения email отправлено');
        fetchAdmins();
      } else {
        throw new Error(result.message || 'Ошибка отправки письма');
      }
    } catch (err: any) {
      toast.error(err.message || 'Не удалось отправить письмо');
    } finally {
      setSendingEmail(null);
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
    { id: 'admins' as TabType, name: 'Администраторы', icon: UsersIcon, count: admins.length },
    { id: 'users' as TabType, name: 'Пользователи', icon: UserPlusIcon, count: users.length },
    { id: 'invitations' as TabType, name: 'Приглашения', icon: PaperAirplaneIcon, count: invitations.filter(i => i.status === 'pending').length },
    { id: 'roles-comparison' as TabType, name: 'Сравнение ролей', icon: ChartBarIcon, count: null }
  ];

  const renderContent = () => {
    if (userManagementError && ['users', 'invitations'].includes(activeTab)) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
               <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Ошибка загрузки данных</h3>
            <p className="text-sm text-red-700 mb-4">{userManagementError}</p>
            <button 
              onClick={() => {
                clearError();
                if (activeTab === 'users') fetchUsers();
                else if (activeTab === 'invitations') fetchInvitations();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
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
            <UserCreateInviteModal 
              isOpen={showInviteModal} 
              onClose={() => setShowInviteModal(false)} 
              onSave={() => {
                setShowInviteModal(false);
                fetchInvitations();
              }}
            />
          </>
        );
      case 'roles-comparison':
        return <RolesComparisonTable />;
      case 'admins':
      default:
        return renderAdminsContent();
    }
  };

  const renderAdminsContent = () => {
    if (isLoading) {
      return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          </div>
      );
    }

    if (filteredAdmins.length === 0 && !error) {
      return (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <UsersIcon className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {searchTerm ? 'Администраторы не найдены' : 'Нет администраторов'}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              {searchTerm 
                ? 'Попробуйте изменить критерии поиска' 
                : 'Добавьте первого администратора для начала работы с командой'
              }
            </p>
            {!searchTerm && (
              <motion.button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                className="bg-card rounded-3xl p-6 shadow-lg shadow-primary/5 border border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300 group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-primary/10 rounded-full transition-transform group-hover:scale-150 duration-500"></div>

                <div className="relative z-10">
                   <div className="flex items-center space-x-4 mb-6">
                     <div className="relative">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary p-1 ring-2 ring-background shadow-md">
                          <div className="w-full h-full rounded-xl overflow-hidden bg-background flex items-center justify-center">
                            <UserCircleIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        </div>
                        {admin.is_active ? (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-background flex items-center justify-center shadow-sm" title="Активен">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                           <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-muted rounded-lg border-2 border-background flex items-center justify-center shadow-sm" title="Неактивен">
                            <CalendarIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h3 className="text-lg font-bold text-foreground truncate mb-1">{admin.name}</h3>
                       <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleColor(admin.role_slug)}`}>
                         {getRoleDisplayName(admin.role_slug)}
                       </span>
                     </div>
                   </div>

                   <div className="space-y-3 mb-6">
                     <div className="flex items-center text-sm text-muted-foreground bg-secondary p-2.5 rounded-xl">
                       <EnvelopeIcon className="w-4 h-4 mr-3 text-muted-foreground flex-shrink-0" />
                       <span className="truncate font-medium">{admin.email}</span>
                     </div>
                     
                     <div className="flex items-center justify-between text-sm bg-secondary p-2.5 rounded-xl">
                       <div className="flex items-center">
                         {isEmailVerified(admin) ? (
                           <>
                             <CheckCircleIcon className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                             <span className="text-green-700 font-medium">Email подтвержден</span>
                             {admin.email_verified_at && (
                               <span className="text-muted-foreground ml-2 text-xs">
                                 {formatDateTime(admin.email_verified_at)}
                               </span>
                             )}
                           </>
                         ) : (
                           <>
                             <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                             <span className="text-red-700 font-medium">Email не подтвержден</span>
                           </>
                         )}
                       </div>
                     </div>
                     
                     <div className="flex items-center text-sm text-muted-foreground bg-secondary p-2.5 rounded-xl">
                       <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground flex-shrink-0" />
                       <span className="font-medium">Добавлен: {formatDate(admin.created_at)}</span>
                     </div>
                   </div>

                   {!isEmailVerified(admin) && (
                     <div className="mb-3">
                       <button
                         onClick={() => handleResendVerificationEmail(admin.id)}
                         disabled={sendingEmail === admin.id}
                         className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed bg-background border border-border rounded-xl hover:bg-secondary transition-all"
                       >
                         {sendingEmail === admin.id ? (
                           <>
                             <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                             Отправка...
                           </>
                         ) : (
                           <>
                             <EnvelopeIcon className="w-4 h-4" />
                             Отправить письмо повторно
                           </>
                         )}
                       </button>
                     </div>
                   )}
                   <div className="flex gap-3 pt-2 border-t border-border">
                     <motion.button
                       onClick={() => handleOpenEditModal(admin)}
                       className="flex-1 inline-flex items-center justify-center px-3 py-2.5 bg-background border border-border text-foreground rounded-xl hover:bg-secondary hover:border-border transition-all font-bold text-sm shadow-sm"
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                     >
                       <PencilIcon className="w-4 h-4 mr-2" />
                       Изменить
                     </motion.button>
                     <motion.button
                       onClick={() => handleOpenDeleteConfirmModal(admin)}
                       className="px-3 py-2.5 bg-background border border-border text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                     >
                       <TrashIcon className="w-4 h-4" />
                     </motion.button>
                   </div>
                </div>
              </motion.div>
            ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 min-h-screen bg-background p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Команда</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Управление доступом и ролями сотрудников
            </p>
          </div>
          {activeTab === 'admins' && (
            <motion.button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Добавить админа
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-background p-1.5 rounded-2xl shadow-sm border border-border inline-flex overflow-x-auto max-w-full">
           {tabs.map((tab) => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`relative flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                   isActive 
                     ? 'text-primary' 
                     : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                 }`}
               >
                 {isActive && (
                   <motion.div
                     layoutId="activeTab"
                     className="absolute inset-0 bg-secondary rounded-xl border border-border"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                 )}
                 <span className="relative z-10 flex items-center">
                   <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                   {tab.name}
                   {tab.count !== null && (
                     <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs ${
                       isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                     }`}>
                       {tab.count}
                     </span>
                   )}
                 </span>
               </button>
             );
           })}
        </div>

        {/* Summary Cards */}
        <motion.div 
           className="grid grid-cols-1 md:grid-cols-3 gap-6"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
           <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
              <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full opacity-50"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <UsersIcon className="w-6 h-6 text-primary" />
                 </div>
                 <p className="text-muted-foreground font-medium text-sm mb-1">Администраторы</p>
                 <p className="text-3xl font-bold text-foreground">{admins.length}</p>
              </div>
           </div>
           
           <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
              <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <UserPlusIcon className="w-6 h-6 text-blue-600" />
                 </div>
                 <p className="text-muted-foreground font-medium text-sm mb-1">Пользователи</p>
                 <p className="text-3xl font-bold text-foreground">{users.length}</p>
              </div>
           </div>

           <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
              <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-green-50 rounded-full opacity-50"></div>
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                    <PaperAirplaneIcon className="w-6 h-6 text-green-600" />
                 </div>
                 <p className="text-muted-foreground font-medium text-sm mb-1">Приглашения</p>
                 <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-foreground">{invitations.filter(i => i.status === 'pending').length}</p>
                    <p className="text-sm text-muted-foreground">ожидают</p>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Roles Banner */}
        <ProtectedComponent 
          permission="roles.view_custom"
          role="organization_owner"
          requireAll={false}
          showFallback={false}
        >
          <motion.div
            className="bg-gradient-to-r from-slate-50 to-white rounded-3xl p-8 shadow-sm border border-border relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-orange-100 rounded-xl">
                      <ShieldCheckIcon className="w-6 h-6 text-orange-600" />
                   </div>
                   <h3 className="text-xl font-bold text-foreground">Настройка ролей доступа</h3>
                </div>
                <p className="text-muted-foreground max-w-lg">
                  Создавайте кастомные роли и гибко настраивайте права доступа для сотрудников вашей организации
                </p>
              </div>
              <button
                onClick={() => (window.location.href = '/dashboard/custom-roles')}
                className="px-6 py-3 bg-background border border-border text-foreground hover:bg-secondary hover:border-orange-200 hover:text-orange-700 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
              >
                Управление ролями
              </button>
            </div>
          </motion.div>
        </ProtectedComponent>

        {/* Limits Info */}
        {limits && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {limits.limits.users && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-foreground">Лимит пользователей</h4>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      limits.limits.users.is_unlimited 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {limits.limits.users.is_unlimited ? 'БЕЗЛИМИТ' : `${limits.limits.users.used} / ${limits.limits.users.limit}`}
                    </span>
                  </div>
                  {!limits.limits.users.is_unlimited && (
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(limits.limits.users.percentage_used, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {limits.limits.foremen && (
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-foreground">Лимит прорабов</h4>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      limits.limits.foremen.is_unlimited 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {limits.limits.foremen.is_unlimited ? 'БЕЗЛИМИТ' : `${limits.limits.foremen.used} / ${limits.limits.foremen.limit}`}
                    </span>
                  </div>
                  {!limits.limits.foremen.is_unlimited && (
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(limits.limits.foremen.percentage_used, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
          </div>
        )}

        {/* Search Bar */}
        {activeTab === 'admins' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Поиск администратора..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none shadow-sm font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          {error && !isProcessingDelete && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
          
          <AnimatePresence mode='wait'>
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               transition={{ duration: 0.3 }}
             >
               {renderContent()}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
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