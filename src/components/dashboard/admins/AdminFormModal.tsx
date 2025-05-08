import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { userService } from '@utils/api';
import { OrganizationAdmin, OrganizationAdminRole } from '@pages/dashboard/AdminsPage';
import { toast } from 'react-toastify';

// Моковые данные для ролей, пока не получаем их с бэка или из пропсов
const MOCK_AVAILABLE_ROLES: OrganizationAdminRole[] = [
  { id: 3, name: 'Администратор организации', slug: 'organization_admin' },
  // Можно добавить другие роли, если API их поддерживает для назначения
  // { id: 4, name: 'Менеджер Проектов', slug: 'project_manager' }, 
];

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: () => void;
  adminToEdit?: OrganizationAdmin | null;
  // availableOrgRoles?: OrganizationAdminRole[]; // Для передачи доступных ролей в будущем
}

// Обновленный интерфейс для данных формы
interface OrganizationAdminFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  role_ids: number[]; // Массив ID выбранных ролей
  is_active: boolean;
  password?: string;
  password_confirmation?: string;
  // avatar File будет управляться отдельным состоянием
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onFormSubmit, 
  adminToEdit, 
  // availableOrgRoles = MOCK_AVAILABLE_ROLES // Используем мок по умолчанию
}) => {
  const isEditing = !!adminToEdit;
  const availableOrgRoles = MOCK_AVAILABLE_ROLES; // Пока используем мок

  const initialFormState: OrganizationAdminFormData = {
    name: '',
    email: '',
    phone: '',
    position: '',
    role_ids: [], // По умолчанию ни одна роль не выбрана
    is_active: true,
    password: '',
    password_confirmation: '',
  };

  const [formData, setFormData] = useState<OrganizationAdminFormData>(initialFormState);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  // Используем Record<string, string> для ошибок валидации по полям
  const [errors, setErrors] = useState<Record<string, string>>({}); 
  const [generalError, setGeneralError] = useState<string | null>(null);


  useEffect(() => {
    if (isOpen) {
      if (isEditing && adminToEdit) {
        setFormData({
          name: adminToEdit.name || '',
          email: adminToEdit.email || '',
          phone: adminToEdit.phone || '',
          position: adminToEdit.position || '',
          role_ids: adminToEdit.roles ? adminToEdit.roles.map(role => role.id) : [],
          is_active: adminToEdit.is_active === undefined ? true : adminToEdit.is_active,
          password: '',
          password_confirmation: '',
        });
        setAvatarPreview(adminToEdit.avatar_url || null);
      } else {
        setFormData(initialFormState);
        setAvatarPreview(null);
      }
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
      setErrors({});
      setGeneralError(null);
      setIsLoading(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''; // Сбрасываем значение инпута файла
      }
    }
  }, [isOpen, isEditing, adminToEdit, initialFormState]); // Добавил initialFormState в зависимости

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      // Для чекбоксов (is_active и выбор ролей)
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'is_active') {
        setFormData(prev => ({ ...prev, is_active: checked }));
      } else if (name === 'role_id') { // Обработка чекбоксов ролей
        const roleId = parseInt(value, 10);
        setFormData(prev => ({
          ...prev,
          role_ids: checked 
            ? [...prev.role_ids, roleId] 
            : prev.role_ids.filter(id => id !== roleId),
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Сбрасываем ошибку для текущего поля при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError(null); // Сбрасываем общую ошибку при любом изменении
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast.error('Размер файла аватара не должен превышать 2 МБ.');
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Допустимые форматы для аватара: JPG, PNG, GIF.');
        if (avatarInputRef.current) avatarInputRef.current.value = '';
        return;
      }
      setAvatarFile(file);
      setRemoveAvatarFlag(false); // Если выбрали новый файл, сбрасываем флаг удаления
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatarFlag(true);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''; // Очищаем input file
    }
    toast.info('Текущий аватар будет удален при сохранении.');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно для заполнения.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email.';
    }
    if (formData.role_ids.length === 0) {
      newErrors.role_ids = 'Необходимо выбрать хотя бы одну роль.';
    }

    if (!isEditing || formData.password) { // Валидация пароля при создании или если он введен при редактировании
      if (!formData.password) {
        newErrors.password = 'Пароль обязателен при создании.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Пароль должен содержать не менее 8 символов.';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Пароль должен содержать заглавную, строчную буквы и цифру.';
      }
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Пароли не совпадают.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме.');
      return;
    }

    setIsLoading(true);

    const dataToSubmit = new FormData();
    dataToSubmit.append('name', formData.name);
    dataToSubmit.append('email', formData.email);
    if (formData.phone) dataToSubmit.append('phone', formData.phone);
    if (formData.position) dataToSubmit.append('position', formData.position);
    
    formData.role_ids.forEach(roleId => {
      dataToSubmit.append('role_ids[]', roleId.toString());
    });
    
    // API ожидает 0 или 1 для булевых значений из FormData
    dataToSubmit.append('is_active', formData.is_active ? '1' : '0');

    if (formData.password) {
      dataToSubmit.append('password', formData.password);
      dataToSubmit.append('password_confirmation', formData.password_confirmation || '');
    }

    if (avatarFile) {
      dataToSubmit.append('avatar', avatarFile);
    } else if (removeAvatarFlag && isEditing) { // Флаг удаления имеет смысл только при редактировании
      dataToSubmit.append('remove_avatar', 'true');
    }

    try {
      if (isEditing && adminToEdit) {
        // Для PATCH, если не используем _method, нужно будет вызвать userService.updateOrganizationAdminPartially или аналогичный
        // Но так как мы используем _method: 'PATCH' внутри userService.updateOrganizationAdmin, то все нормально
        const response = await userService.updateOrganizationAdmin(adminToEdit.id, dataToSubmit);
        toast.success(response.message || 'Администратор успешно обновлен!');
      } else {
        const response = await userService.createOrganizationAdmin(dataToSubmit);
        toast.success(response.message || 'Администратор успешно создан!');
      }
      onFormSubmit(); // Вызовет fetchAdmins и закроет модалку из родителя
      // onClose(); // Закрытие теперь в onFormSubmit в родительском компоненте
    } catch (err: any) {
      console.error(`Ошибка при ${isEditing ? 'обновлении' : 'создании'} администратора:`, err);
      const message = err.message || `Не удалось ${isEditing ? 'обновить' : 'создать'} администратора.`;
      
      if (err.errors && typeof err.errors === 'object') {
        // Устанавливаем ошибки по полям
        const fieldErrors: Record<string, string> = {};
        for (const key in err.errors) {
          if (Array.isArray(err.errors[key]) && err.errors[key].length > 0) {
            fieldErrors[key.startsWith('role_ids.') ? 'role_ids' : key] = err.errors[key].join(' ');
          }
        }
        setErrors(fieldErrors);
        setGeneralError('Ошибка валидации. Проверьте поля.');
        toast.error('Ошибка валидации. Пожалуйста, проверьте поля формы.');
      } else {
        setGeneralError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
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

        <div className="fixed inset-0 z-40 overflow-y-auto">
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
                  
                  {generalError && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">{generalError}</p>
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
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 ${errors.name ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 ${errors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Телефон (опционально)
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Должность (опционально)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="position"
                        id="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Роли
                    </label>
                    <div className="mt-2 space-y-2">
                      {availableOrgRoles.map(role => (
                        <div key={role.id} className="flex items-center">
                          <input
                            id={`role_id_${role.id}`}
                            name="role_id"
                            type="checkbox"
                            value={role.id}
                            checked={formData.role_ids.includes(role.id)}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor={`role_id_${role.id}`} className="ml-2 block text-sm text-gray-900">
                            {role.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.role_ids && <p className="mt-1 text-sm text-red-600">{errors.role_ids}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Пароль {isEditing ? '(оставьте пустым, если не хотите менять)' : '(мин. 8 символов)'}
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required={!isEditing}
                        value={formData.password || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 ${errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
                        value={formData.password_confirmation || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 ${errors.password_confirmation ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                      />
                    </div>
                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Активен
                    </label>
                  </div>

                  <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                      Аватар
                    </label>
                    <div className="mt-2 flex items-center">
                      <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {avatarPreview ? (
                          <img className="h-full w-full text-gray-300 object-cover" src={avatarPreview} alt="Превью аватара" />
                        ) : (
                          <PhotoIcon className="h-full w-full text-gray-300" aria-hidden="true" />
                        )}
                      </span>
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleAvatarChange}
                        ref={avatarInputRef}
                        className="ml-5 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                      />
                    </div>
                    {isEditing && adminToEdit?.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                        disabled={removeAvatarFlag}
                      >
                        {removeAvatarFlag ? 'Аватар будет удален' : 'Удалить текущий аватар'}
                      </button>
                    )}
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isLoading ? (isEditing ? 'Сохранение...' : 'Создание...') : (isEditing ? 'Сохранить изменения' : 'Создать администратора')}
                      </button>
                    </div>
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