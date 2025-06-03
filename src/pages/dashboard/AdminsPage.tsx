import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { adminPanelUserService } from '@utils/api';
import { AdminPanelUser, AdminPanelUserRole } from '@/types/admin'; // Исправлен путь импорта
import AdminFormModal from '@components/dashboard/admins/AdminFormModal';
import ConfirmDeleteModal from '@components/shared/ConfirmDeleteModal';
import { toast } from 'react-toastify'; // Добавляем импорт toast

const AdminsPage = () => {
  const [admins, setAdmins] = useState<AdminPanelUser[]>([]); // Используем AdminPanelUser
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false); // Для индикации загрузки при удалении
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminPanelUser | null>(null); // Используем AdminPanelUser
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false); // Правильное определение
  const [deletingAdmin, setDeletingAdmin] = useState<AdminPanelUser | null>(null); // Используем AdminPanelUser
  const [searchTerm, setSearchTerm] = useState(''); // Состояние для поиска

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setEditingAdmin(null); // Сбрасываем редактируемого админа при обновлении списка
    setDeletingAdmin(null); // Сбрасываем удаляемого админа
    try {
      const response = await adminPanelUserService.getAdminPanelUsers();
      setAdmins(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Ошибка при загрузке администраторов:", err);
      setError("Не удалось загрузить список администраторов. Пожалуйста, попробуйте еще раз.");
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Фильтрация администраторов на стороне клиента
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

  const getRoleDisplayName = (roles: AdminPanelUserRole[]): string => {
    if (!roles || roles.length === 0) {
      return 'N/A';
    }
    // Пока отображаем первую роль. Можно доработать для отображения нескольких.
    const role = roles[0];
    switch (role.slug) {
      case 'organization_owner':
        return 'Владелец организации';
      case 'organization_admin':
        return 'Администратор организации';
      case 'web_admin':
        return 'Веб-администратор';
      case 'accountant':
        return 'Бухгалтер';
      default:
        return role.name || role.slug;
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
    setEditingAdmin(null); // Убеждаемся, что это создание, а не редактирование
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (admin: AdminPanelUser) => { // Используем AdminPanelUser
    setEditingAdmin(admin);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAdmin(null); // Сбрасываем редактируемого админа при закрытии модалки
  };
  
  const handleFormSubmitted = () => {
    fetchAdmins(); // Перезагружаем список администраторов после добавления/редактирования
  };

  const handleOpenDeleteConfirmModal = (admin: AdminPanelUser) => { // Используем AdminPanelUser
    setDeletingAdmin(admin);
    setIsConfirmDeleteModalOpen(true); // Правильное использование
  };

  const handleCloseDeleteConfirmModal = () => {
    setDeletingAdmin(null);
    setIsConfirmDeleteModalOpen(false); // Правильное использование
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingAdmin) return;
    
    setIsProcessingDelete(true);
    setError(null);
    console.log('AdminsPage: handleDeleteConfirmed for admin ID:', deletingAdmin.id);
    try {
      const result = await adminPanelUserService.deleteAdminPanelUser(deletingAdmin.id);
      console.log('AdminsPage: Delete API Response:', result);

      if (result.success) {
        toast.success(result.message || 'Администратор успешно удален.');
        fetchAdmins(); // Обновляем список
        handleCloseDeleteConfirmModal(); // Закрываем модальное окно
      } else {
        // Обработка логической ошибки от API (success: false)
        const errorMessage = result.message || "Не удалось удалить администратора (ответ API с ошибкой).";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('AdminsPage: API logical error during delete:', errorMessage, 'Full response:', result);
      }
    } catch (err: any) {
      // Обработка ошибок сети или других исключений от axios/fetch
      console.error("AdminsPage: Catch block error during delete:", err);
      const errMsg = err.response?.data?.message || err.message || "Не удалось удалить администратора.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsProcessingDelete(false);
      console.log('AdminsPage: handleDeleteConfirmed finished.');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-tight text-gray-900">Управление администраторами</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
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

      {/* Поле для поиска */}
      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
      </div>

      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {isLoading && <p className="text-center py-4">Загрузка администраторов...</p>}
            {/* Обновляем отображение глобальной ошибки */}
            {error && !isProcessingDelete && (
              <div className="rounded-md bg-red-50 p-4 my-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Используем filteredAdmins для отображения и проверки на пустоту */}
            {!isLoading && filteredAdmins.length === 0 && !error && (
              <p className="text-center py-4 text-gray-500">
                {searchTerm ? 'Администраторы не найдены по вашему запросу.' : 'Администраторы не найдены.'}
              </p>
            )}
            {!isLoading && filteredAdmins.length > 0 && (
              <table className="min-w-full divide-y divide-gray-300">
                {/* ... Заголовки таблицы ... */}
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      АДМИНИСТРАТОР
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      РОЛЬ
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      СТАТУС
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      ДАТА СОЗДАНИЯ
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      ДЕЙСТВИЯ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      {/* ... Ячейки с именем и email ... */}
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {/* TODO: Отображать аватар, если он есть в admin.avatar_url */}
                            <UserCircleIcon className="h-10 w-10 rounded-full text-gray-300" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{admin.name}</div>
                            <div className="text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getRoleDisplayName(admin.roles)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {admin.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Активен
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Неактивен
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(admin.created_at)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0">
                        <button 
                          onClick={() => handleOpenEditModal(admin)} // Обработчик для редактирования
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          disabled={isProcessingDelete} // Блокируем кнопки во время удаления
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">, {admin.name}</span>
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteConfirmModal(admin)} // Открываем подтверждение
                          className="ml-3 text-red-600 hover:text-red-900 disabled:opacity-50"
                          disabled={isProcessingDelete} // Блокируем кнопки во время удаления
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
        adminToEdit={editingAdmin} // Передаем редактируемого админа
      />
      {deletingAdmin && (
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteModalOpen} // Правильное использование
          onClose={handleCloseDeleteConfirmModal}
          onConfirm={handleDeleteConfirmed}
          title="Удалить администратора"
          message={`Вы уверены, что хотите удалить администратора ${deletingAdmin.name}? Это действие необратимо.`}
          isLoading={isProcessingDelete}
        />
      )}
    </div>
  );
};

export default AdminsPage; 