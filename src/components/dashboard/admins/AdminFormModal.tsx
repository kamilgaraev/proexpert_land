import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { adminPanelUserService } from '@utils/api';
import { AdminPanelUser, AdminFormData, SYSTEM_ROLES } from '@/types/admin';

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: () => void;
  adminToEdit?: AdminPanelUser | null;
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({ isOpen, onClose, onFormSubmit, adminToEdit }) => {
  const isEditing = !!adminToEdit;

  const defaultRoleSlug = SYSTEM_ROLES.length > 0 ? SYSTEM_ROLES[0].slug : '';

  const initialFormState: AdminFormData = {
    name: '',
    email: '',
    role_slug: defaultRoleSlug,
    password: '',
    password_confirmation: '',
    is_active: true,
  };

  const [formData, setFormData] = useState<AdminFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && adminToEdit) {
        setFormData({
          name: adminToEdit.name,
          email: adminToEdit.email,
          role_slug: adminToEdit.roles && adminToEdit.roles.length > 0 ? adminToEdit.roles[0].slug : defaultRoleSlug,
          password: '',
          password_confirmation: '',
          is_active: adminToEdit.is_active !== undefined ? adminToEdit.is_active : true,
        });
      } else {
        setFormData({...initialFormState, role_slug: defaultRoleSlug});
      }
      setError(null);
      setIsLoading(false);
    } else {
      setFormData(initialFormState);
      setError(null);
    }
  }, [isOpen, isEditing, adminToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password || (!isEditing && !formData.password) ) {
    if (formData.password !== formData.password_confirmation) {
      setError('Пароли не совпадают.');
      return;
    }
      if (formData.password && formData.password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов.');
      return;
      }
    }

    setIsLoading(true);
    try {
      const dataToSend: Partial<AdminFormData> = {
        name: formData.name,
        email: formData.email,
        role_slug: formData.role_slug,
        is_active: formData.is_active,
      };

      if (formData.password) {
        dataToSend.password = formData.password;
        dataToSend.password_confirmation = formData.password_confirmation;
      }

      if (isEditing && adminToEdit) {
        await adminPanelUserService.updateAdminPanelUser(adminToEdit.id, dataToSend);
      } else {
        await adminPanelUserService.createAdminPanelUser(dataToSend as AdminFormData); 
      }
      onFormSubmit();
      onClose();
    } catch (err: any) {
      console.error(`Ошибка при ${isEditing ? 'обновлении' : 'создании'} администратора:`, err);
      const apiErrorMessage = err.response?.data?.message || err.message || `Не удалось ${isEditing ? 'обновить' : 'создать'} администратора.`;
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        setError(`${apiErrorMessage} ${validationErrors}`);
      } else {
        setError(apiErrorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Закрыть</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {isEditing ? 'Редактировать администратора' : 'Добавить администратора'}
                  </Dialog.Title>
                  
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Имя и Фамилия
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        maxLength={255}
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        maxLength={255}
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role_slug" className="block text-sm font-medium text-gray-700">
                      Роль
                    </label>
                    <div className="mt-1">
                      <select
                        id="role_slug"
                        name="role_slug"
                        required
                        value={formData.role_slug}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      >
                        {SYSTEM_ROLES.map(role => (
                          <option key={role.slug} value={role.slug}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Пароль {isEditing ? '(оставьте пустым, чтобы не менять)' : '(мин. 8 символов)'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required={!isEditing}
                        minLength={isEditing && !formData.password ? undefined : 8}
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                      Подтверждение пароля
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="password_confirmation"
                        id="password_confirmation"
                        required={!!formData.password}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Активен
                    </label>
                  </div>

                  <div className="pt-2 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isLoading ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Добавить')}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                      onClick={onClose}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AdminFormModal; 