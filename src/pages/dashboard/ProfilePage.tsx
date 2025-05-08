import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { userService } from '@utils/api';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, fetchUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState(user?.position || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setPosition(user.position || '');
      setAvatarPreview(user.avatar_url || null);
      setAvatarFile(null);
      setRemoveAvatarFlag(false);
    }
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Размер файла аватара не должен превышать 2 МБ.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Допустимые форматы для аватара: JPG, PNG, GIF.');
        return;
      }
      setAvatarFile(file);
      setRemoveAvatarFlag(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatarFlag(true);
    toast.info('Текущий аватар будет удален при сохранении.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSaving(true);

    if (!user) {
      toast.error('Ошибка: данные пользователя не загружены.');
      setIsSaving(false);
      return;
    }

    const formData = new FormData();
    if (name !== user.name) formData.append('name', name);
    if (email !== user.email) formData.append('email', email);
    if (phone !== (user.phone || '')) formData.append('phone', phone);
    if (position !== (user.position || '')) formData.append('position', position);
    formData.append('_method', 'PUT');

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    } else if (removeAvatarFlag) {
      formData.append('remove_avatar', 'true');
    }

    let hasChanges = false;
    for (const _ of formData.entries()) {
      hasChanges = true;
      break;
    }

    if (!hasChanges) {
      toast.info('Нет изменений для сохранения.');
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    try {
      const response = await userService.updateProfile(formData);
      console.log('Профиль успешно обновлен:', response);
      toast.success(response.data?.message || 'Профиль успешно обновлен!');
      
      await fetchUser();
      
      setIsEditing(false);
    } catch (err: any) {
      console.error('Ошибка при обновлении профиля:', err);
      if (err.errors && typeof err.errors === 'object') {
        const serverErrors: Record<string, string> = {};
        for (const key in err.errors) {
          if (Array.isArray(err.errors[key]) && err.errors[key].length > 0) {
            serverErrors[key] = err.errors[key][0];
          }
        }
        setValidationErrors(serverErrors);
        toast.error(err.message || 'Ошибка валидации данных.');
      } else {
        toast.error(err.message || 'Не удалось обновить профиль.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return <div>Не удалось загрузить данные пользователя.</div>;
  }

  const handleCancelEdit = () => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setPosition(user.position || '');
    setAvatarPreview(user.avatar_url || null);
    setAvatarFile(null);
    setRemoveAvatarFlag(false);
    setValidationErrors({});
    setIsEditing(false);
  };

  return (
    <div className="py-6 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-secondary-900">Профиль пользователя</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Здесь вы можете просмотреть и обновить свои данные
        </p>
      </div>

      <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-secondary-900">Личная информация</h3>
            <p className="mt-1 max-w-2xl text-sm text-secondary-500">Основные данные вашего профиля</p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-outline"
            >
              Редактировать
            </button>
          )}
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Аватар</label>
            <div className="mt-1 flex items-center gap-4">
              <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Текущий аватар" className="h-full w-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-full w-full text-gray-300" />
                )}
              </span>
              {isEditing && (
                <div className="flex-grow">
                  <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <span>{avatarFile ? 'Выбран другой файл' : 'Сменить аватар'}</span>
                    <input id="avatar-upload" name="avatar" type="file" className="sr-only" accept="image/jpeg,image/png,image/gif" onChange={handleAvatarChange} />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="ml-3 text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Имя</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-semibold">{user.name}</p>
              )}
              {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-semibold">{user.email}</p>
              )}
              {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Телефон</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-semibold">{user.phone || '-'}</p>
              )}
              {validationErrors.phone && <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Должность</label>
              {isEditing ? (
                <input
                  type="text"
                  name="position"
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${validationErrors.position ? 'border-red-500' : 'border-gray-300'}`}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 font-semibold">{user.position || '-'}</p>
              )}
              {validationErrors.position && <p className="mt-1 text-sm text-red-600">{validationErrors.position}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6 border-t border-gray-200 pt-6">
            <div className="sm:col-span-3"><dt className="text-sm font-medium text-gray-500">ID организации</dt><dd>{user.current_organization_id}</dd></div>
            <div className="sm:col-span-3"><dt className="text-sm font-medium text-gray-500">Дата регистрации</dt><dd>{new Date(user.created_at).toLocaleDateString('ru-RU')} {new Date(user.created_at).toLocaleTimeString('ru-RU')}</dd></div>
            <div className="sm:col-span-3"><dt className="text-sm font-medium text-gray-500">Статус Email</dt><dd>{user.email_verified_at ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Подтвержден
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Не подтвержден
              </span>
            )}</dd></div>
          </div>
        </div>

        {isEditing && (
          <div className="px-4 py-3 sm:px-6 bg-gray-50 text-right">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="btn btn-secondary mr-2"
            >
              Отмена
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Сохранение...
                </>
              ) : 'Сохранить изменения'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 