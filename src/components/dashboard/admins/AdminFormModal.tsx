import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserCircleIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { adminPanelUserService } from '@utils/api';
import { AdminPanelUser, AdminFormData, SYSTEM_ROLES } from '@/types/admin';
import { toast } from 'react-toastify';
import { useAuth } from '@hooks/useAuth';

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: () => void;
  adminToEdit?: AdminPanelUser | null;
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({ isOpen, onClose, onFormSubmit, adminToEdit }) => {
  const isEditing = !!adminToEdit;
  const { user } = useAuth();

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

    if (!isEditing && !formData.password) {
      setError('Пароль обязателен при создании нового администратора.');
      toast.error('Пароль обязателен при создании нового администратора.');
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов.');
      toast.error('Пароль должен содержать не менее 8 символов.');
      return;
    }
    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Пароли не совпадают.');
      toast.error('Пароли не совпадают.');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditing && adminToEdit) {
        const dataToSendForUpdate: Partial<AdminFormData> = {
          name: formData.name,
          is_active: formData.is_active,
        };
        if (formData.password) {
          dataToSendForUpdate.password = formData.password;
          dataToSendForUpdate.password_confirmation = formData.password_confirmation;
        }
        response = await adminPanelUserService.updateAdminPanelUser(adminToEdit.id, dataToSendForUpdate);
      } else {
        const dataToSendForCreate = {
          name: formData.name,
          email: formData.email,
          role_slug: formData.role_slug,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          organization_id: user?.current_organization_id,
        };
        response = await adminPanelUserService.createAdminPanelUser(dataToSendForCreate);
      }

      if (response.success && response.data) {
        toast.success(response.message || `Администратор успешно ${isEditing ? 'обновлен' : 'создан'}.`);
        onFormSubmit();
        onClose();
      } else {
        let errorMessage = response.message || `Не удалось ${isEditing ? 'обновить' : 'создать'} администратора.`;
        if (response.errors) {
          const validationMessages = Object.values(response.errors).flat().join(' ');
          errorMessage += `: ${validationMessages}`;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.message || err.message || `Произошла ошибка при ${isEditing ? 'обновлении' : 'создании'} администратора.`;
      let detailedMessage = apiErrorMessage;
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        detailedMessage += `: ${validationErrors}`;
      }
      setError(detailedMessage);
      toast.error(detailedMessage);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-6 pt-8 pb-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
                    <UserCircleIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-7 text-gray-900">
                    {isEditing ? 'Редактировать администратора' : 'Добавить администратора'}
                  </Dialog.Title>
                </div>
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-4 flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Данные администратора</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Имя и Фамилия</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          autoFocus
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                          placeholder="Введите ФИО полностью"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          maxLength={255}
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                        />
                      </div>
                      <div>
                        <label htmlFor="role_slug" className="block text-sm font-medium text-gray-700">Роль</label>
                        <select
                          id="role_slug"
                          name="role_slug"
                          required
                          value={formData.role_slug}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                        >
                          {SYSTEM_ROLES.map(role => (
                            <option key={role.slug} value={role.slug}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Безопасность</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Пароль {isEditing ? <span className="text-gray-400">(оставьте пустым, чтобы не менять)</span> : <span className="text-gray-400">(мин. 8 символов)</span>}
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          required={!isEditing}
                          minLength={isEditing && !formData.password ? undefined : 8}
                          value={formData.password}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                          placeholder="Введите пароль"
                        />
                        <p className="text-xs text-gray-400 mt-1">Минимум 8 символов. Используйте буквы и цифры.</p>
                      </div>
                      <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Подтверждение пароля</label>
                        <input
                          type="password"
                          name="password_confirmation"
                          id="password_confirmation"
                          required={!!formData.password}
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                          placeholder="Повторите пароль"
                        />
                      </div>
                      <div className="flex items-center mt-2">
                        <input
                          id="is_active"
                          name="is_active"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Активен</label>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 sm:flex sm:flex-row-reverse gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:text-sm disabled:opacity-50 transition-all"
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <PlusIcon className="h-5 w-5 mr-2" />
                      )}
                      {isEditing ? 'Сохранить изменения' : 'Добавить'}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:text-sm disabled:opacity-50 transition-all"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
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