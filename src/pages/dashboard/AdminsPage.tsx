import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { adminPanelUserService } from '@utils/api';
import { AdminPanelUser } from '@/types/admin';
import AdminFormModal from '@components/dashboard/admins/AdminFormModal';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import { toast } from 'react-toastify';

const AdminsPage = () => {
  const [admins, setAdmins] = useState<AdminPanelUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminPanelUser | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminPanelUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const stats = [
    {
      name: 'Всего администраторов',
      value: admins.length.toString(),
      icon: UsersIcon,
      color: 'construction'
    },
    {
      name: 'Владельцы организаций',
      value: admins.filter(admin => admin.role_slug === 'organization_owner').length.toString(),
      icon: BuildingOfficeIcon,
      color: 'safety'
    },
    {
      name: 'Активных аккаунтов',
      value: admins.filter(admin => admin.is_active).length.toString(),
      icon: ShieldCheckIcon,
      color: 'earth'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      construction: {
        bg: 'bg-gradient-to-br from-construction-500 to-construction-600',
        lightBg: 'bg-construction-50',
        border: 'border-construction-200'
      },
      safety: {
        bg: 'bg-gradient-to-br from-safety-500 to-safety-600',
        lightBg: 'bg-safety-50',
        border: 'border-safety-200'
      },
      earth: {
        bg: 'bg-gradient-to-br from-earth-500 to-earth-600',
        lightBg: 'bg-earth-50',
        border: 'border-earth-200'
      }
    };
    return colors[color as keyof typeof colors] || colors.construction;
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-steel-900 mb-2">Команда</h1>
            <p className="text-steel-600 text-lg">Управление администраторами и прорабами</p>
          </div>
          <motion.button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-construction-500 to-construction-600 text-white rounded-xl hover:shadow-construction focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-construction-500 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Добавить администратора
          </motion.button>
        </div>
      </motion.div>

      {/* Статистика */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <motion.div
              key={stat.name}
              className="bg-white rounded-2xl p-6 shadow-lg border border-steel-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-steel-600 text-sm font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-steel-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Поиск */}
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

      {/* Контент */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {error && !isProcessingDelete && (
          <motion.div 
            className="mb-6 p-4 bg-construction-50 border border-construction-200 text-construction-700 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-construction-200 border-t-construction-600"></div>
          </div>
        ) : filteredAdmins.length === 0 && !error ? (
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
        ) : (
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
                {/* Аватар и основная информация */}
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

                {/* Контактная информация */}
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

                                 {/* Статус активности */}
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

                {/* Действия */}
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
        )}
      </motion.div>

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