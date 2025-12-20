import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { userService } from '@utils/api';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { 
  UserCircleIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

const ProfilePage = () => {
  const { user, fetchUser, isLoading: authLoading } = useAuth();
  const {
    isVerified,
    loading: verificationLoading,
    canResend,
    resendCooldown,
    checkVerificationStatus,
    resendVerificationEmail
  } = useEmailVerification();
  
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
      checkVerificationStatus();
    }
  }, [user, checkVerificationStatus]);

  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

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
    formData.append('_method', 'PATCH');

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
      toast.success(response.data?.message || 'Профиль успешно обновлен!');
      await fetchUser();
      setIsEditing(false);
    } catch (err: any) {
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-construction-200 border-t-construction-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-steel-500">Не удалось загрузить данные пользователя.</div>
      </div>
    );
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
    <div className="space-y-8">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-steel-900 mb-2">Профиль пользователя</h1>
        <p className="text-steel-600 text-lg">Управляйте своими личными данными и настройками</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Карточка аватара */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-steel-100">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-construction-500 to-construction-600 p-1 shadow-construction">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Аватар пользователя" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-steel-100 flex items-center justify-center">
                        <UserCircleIcon className="w-20 h-20 text-steel-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="w-10 h-10 bg-construction-600 rounded-full flex items-center justify-center shadow-lg hover:bg-construction-700 transition-colors">
                        <CameraIcon className="w-5 h-5 text-white" />
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-steel-900">{user.name}</h2>
                <p className="text-steel-600 mt-1">{user.position || 'Не указана должность'}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-steel-500 text-sm">{user.email}</p>
                  {verificationLoading ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : isVerified === true ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Подтвержден
                    </div>
                  ) : isVerified === false ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      <XCircle className="w-3 h-3" />
                      Не подтвержден
                    </div>
                  ) : null}
                </div>
                {isVerified === false && (
                  <div className="mt-3">
                    <Button
                      onClick={resendVerificationEmail}
                      disabled={!canResend || verificationLoading}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      {verificationLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Отправка...
                        </>
                      ) : !canResend ? (
                        `Повторить через ${resendCooldown}с`
                      ) : (
                        'Отправить письмо повторно'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing && avatarPreview && (
                <motion.button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Удалить аватар
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Форма профиля */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-steel-100 overflow-hidden">
            {/* Заголовок формы */}
            <div className="bg-gradient-to-r from-construction-50 to-safety-50 px-8 py-6 border-b border-steel-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-steel-900">Личная информация</h3>
                  <p className="text-steel-600 mt-1">Основные данные вашего профиля</p>
                </div>
                {!isEditing ? (
                  <motion.button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-construction-600 text-white rounded-xl hover:bg-construction-700 transition-colors shadow-construction"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Редактировать
                  </motion.button>
                ) : (
                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-steel-300 text-steel-700 rounded-xl hover:bg-steel-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Отмена
                    </motion.button>
                    <motion.button
                      type="submit"
                      form="profile-form"
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 bg-safety-600 text-white rounded-xl hover:bg-safety-700 transition-colors shadow-safety disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <CheckIcon className="w-4 h-4 mr-2" />
                      )}
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Форма */}
            <form id="profile-form" onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Имя */}
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    <IdentificationIcon className="w-4 h-4 inline mr-2" />
                    Полное имя
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors ${
                        validationErrors.name ? 'border-red-300' : 'border-steel-300'
                      }`}
                      placeholder="Введите ваше полное имя"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-steel-50 rounded-xl text-steel-900 font-medium">
                      {user.name || 'Не указано'}
                    </div>
                  )}
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                    Email адрес
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors ${
                        validationErrors.email ? 'border-red-300' : 'border-steel-300'
                      }`}
                      placeholder="Введите ваш email"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="px-4 py-3 bg-steel-50 rounded-xl text-steel-900 font-medium flex items-center justify-between">
                        <span>{user.email || 'Не указан'}</span>
                        {verificationLoading ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : isVerified === true ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Подтвержден
                          </div>
                        ) : isVerified === false ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            <XCircle className="w-3 h-3" />
                            Не подтвержден
                          </div>
                        ) : null}
                      </div>
                      {isVerified === false && !isEditing && (
                        <Button
                          onClick={resendVerificationEmail}
                          disabled={!canResend || verificationLoading}
                          size="sm"
                          variant="outline"
                          className="text-xs w-full sm:w-auto"
                        >
                          {verificationLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Отправка...
                            </>
                          ) : !canResend ? (
                            `Повторить через ${resendCooldown}с`
                          ) : (
                            'Отправить письмо повторно'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                {/* Телефон */}
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-2" />
                    Номер телефона
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors ${
                        validationErrors.phone ? 'border-red-300' : 'border-steel-300'
                      }`}
                      placeholder="+7 (999) 123-45-67"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-steel-50 rounded-xl text-steel-900 font-medium">
                      {user.phone || 'Не указан'}
                    </div>
                  )}
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>

                {/* Должность */}
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-2">
                    <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                    Должность
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-construction-500 focus:border-construction-500 transition-colors ${
                        validationErrors.position ? 'border-red-300' : 'border-steel-300'
                      }`}
                      placeholder="Например: Главный инженер"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-steel-50 rounded-xl text-steel-900 font-medium">
                      {user.position || 'Не указана'}
                    </div>
                  )}
                  {validationErrors.position && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.position}</p>
                  )}
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="mt-8 pt-8 border-t border-steel-200">
                <h4 className="text-lg font-semibold text-steel-900 mb-4">Дополнительная информация</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-construction-50 rounded-xl">
                    <div>
                      <p className="font-medium text-steel-900">Дата регистрации</p>
                      <p className="text-steel-600 text-sm">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Не указана'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-construction-100 rounded-lg flex items-center justify-center">
                      <IdentificationIcon className="w-5 h-5 text-construction-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-safety-50 rounded-xl">
                    <div>
                      <p className="font-medium text-steel-900">Последнее обновление</p>
                      <p className="text-steel-600 text-sm">
                        {user.updated_at ? new Date(user.updated_at).toLocaleDateString('ru-RU') : 'Не указано'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-safety-100 rounded-lg flex items-center justify-center">
                      <PencilIcon className="w-5 h-5 text-safety-600" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 