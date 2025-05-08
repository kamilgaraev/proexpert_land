import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { userService } from '@utils/api';
import AdminFormModal from '@components/dashboard/admins/AdminFormModal';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import { toast } from 'react-toastify';

export interface OrganizationAdminRole {
  id: number;
  name: string;
  slug: string;
}

export interface OrganizationAdmin {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  roles: OrganizationAdminRole[];
}

const AdminsPage = () => {
  const [admins, setAdmins] = useState<OrganizationAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<OrganizationAdmin | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<OrganizationAdmin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setEditingAdmin(null);
    setDeletingAdmin(null);
    setError(null);
    try {
      const responseData = await userService.getOrganizationAdmins();
      setAdmins(Array.isArray(responseData) ? responseData : []);
    } catch (err: any) {
      console.error("Ошибка при загрузке администраторов организации:", err);
      const message = err.message || (err.errors && Object.values(err.errors).flat().join(' ')) || "Не удалось загрузить список администраторов.";
      setError(message);
      toast.error(message);
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
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.phone && admin.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admin.position && admin.position.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [admins, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (admin: OrganizationAdmin) => {
    setEditingAdmin(admin);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAdmin(null);
  };
  
  const handleFormSubmitted = () => {
    fetchAdmins();
    handleCloseFormModal();
  };

  const handleOpenDeleteConfirmModal = (admin: OrganizationAdmin) => {
    setDeletingAdmin(admin);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleCloseDeleteConfirmModal = () => {
    setDeletingAdmin(null);
    setIsConfirmDeleteModalOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingAdmin) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      await userService.deleteOrganizationAdmin(deletingAdmin.id);
      toast.success(`Администратор ${deletingAdmin.name} успешно удален.`);
      fetchAdmins();
      handleCloseDeleteConfirmModal();
    } catch (err: any) {
      console.error("Ошибка при удалении администратора:", err);
      const message = err.message || (err.errors && Object.values(err.errors).flat().join(' ')) || "Не удалось удалить администратора.";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayRoles = (roles: OrganizationAdminRole[]) => {
    if (!roles || roles.length === 0) return 'Нет ролей';
    return roles.map(role => role.name).join(', ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString; 
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900">Управление администраторами организации</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Добавить администратора
          </button>
        </div>
      </div>

      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Поиск по имени, email, телефону, должности..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      {error && !isProcessing && (
        <div className="rounded-md bg-red-50 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {isLoading && <p className="text-center py-4 text-gray-500">Загрузка администраторов...</p>}
            {!isLoading && filteredAdmins.length === 0 && !error && (
              <p className="text-center py-4 text-gray-500">
                {searchTerm ? 'Администраторы не найдены по вашему запросу.' : 'Администраторы организации не найдены.'}
              </p>
            )}
            {!isLoading && filteredAdmins.length > 0 && (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">АДМИНИСТРАТОР</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">РОЛИ</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">СТАТУС</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ДАТА СОЗДАНИЯ</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-left text-sm font-semibold text-gray-900">ДЕЙСТВИЯ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {admin.avatar_url ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={admin.avatar_url} alt="" />
                            ) : (
                              <UserCircleIcon className="h-10 w-10 rounded-full text-gray-300" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{admin.name}</div>
                            <div className="text-gray-500">{admin.email}</div>
                            {admin.phone && <div className="text-xs text-gray-400">{admin.phone}</div>}
                            {admin.position && <div className="text-xs text-gray-400">{admin.position}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {displayRoles(admin.roles)}
                      </td>
                       <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {admin.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="mr-1.5 h-4 w-4 text-green-400" />
                            Активен
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="mr-1.5 h-4 w-4 text-red-400" />
                            Неактивен
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(admin.created_at)}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0">
                        <button 
                          onClick={() => handleOpenEditModal(admin)}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">, {admin.name}</span>
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteConfirmModal(admin)}
                          className="ml-3 text-red-600 hover:text-red-900 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span className="sr-only">, {admin.name}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AdminFormModal 
        isOpen={isFormModalOpen} 
        onClose={handleCloseFormModal} 
        onFormSubmit={handleFormSubmitted} 
        adminToEdit={editingAdmin}
      />

      {deletingAdmin && (
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteModalOpen}
          onClose={handleCloseDeleteConfirmModal}
          onConfirm={handleDeleteConfirmed}
          title="Удалить администратора"
          message={`Вы уверены, что хотите удалить администратора ${deletingAdmin.name}? Это действие необратимо.`}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default AdminsPage; 