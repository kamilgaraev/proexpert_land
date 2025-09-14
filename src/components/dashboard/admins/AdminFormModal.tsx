import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  UserCircleIcon, 
  ExclamationTriangleIcon, 
  PlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { adminPanelUserService, customRolesService } from '@utils/api';
import { AdminPanelUser, AdminFormData } from '@/types/admin';
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

  const initialFormState: AdminFormData = {
    name: '',
    email: '',
    role_slug: '',
    password: '',
    password_confirmation: '',
    is_active: true,
  };

  const [formData, setFormData] = useState<AdminFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleOptions, setRoleOptions] = useState<Array<{ slug: string; name: string; type: 'system' | 'custom' }>>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && adminToEdit) {
        setFormData({
          name: adminToEdit.name,
          email: adminToEdit.email,
          role_slug: adminToEdit.roles && adminToEdit.roles.length > 0 ? adminToEdit.roles[0].slug : '',
          password: '',
          password_confirmation: '',
          is_active: adminToEdit.is_active !== undefined ? adminToEdit.is_active : true,
        });
      } else {
        setFormData({ ...initialFormState });
      }
      setError(null);
      setIsLoading(false);
    } else {
      setFormData(initialFormState);
      setError(null);
    }
  }, [isOpen, isEditing, adminToEdit]);

  useEffect(() => {
    if (!isOpen) return;
    const mapSlugToRu = (slug: string) => {
      const dict: Record<string, string> = {
        super_admin: 'Суперадминистратор',
        support: 'Поддержка',
        system_admin: 'Системный администратор',
        accountant: 'Бухгалтер',
        organization_admin: 'Администратор организации',
        organization_owner: 'Владелец организации',
        viewer: 'Просмотр (только чтение)',
        foreman: 'Прораб',
        observer: 'Наблюдатель',
        worker: 'Рабочий',
        contractor: 'Подрядчик',
        project_manager: 'Руководитель проекта',
        site_engineer: 'Инженер ПТО',
      };
      if (dict[slug]) return dict[slug];
      return slug
        .split('_')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    };

    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        const resp = await customRolesService.getAvailableRoles();
        const payload = resp?.data;
        const data = payload?.data ?? payload;
        const system: string[] = Array.isArray(data?.system_roles) ? data.system_roles : [];
        const custom: any[] = Array.isArray(data?.custom_roles) ? data.custom_roles : [];

        const systemOpts = system.map((slug: string) => ({ slug, name: mapSlugToRu(slug), type: 'system' as const }));
        const customOpts = custom
          .filter((r) => r && r.slug && (r.is_active === undefined || r.is_active))
          .map((r) => ({ slug: String(r.slug), name: String(r.name ?? r.slug), type: 'custom' as const }));

        const opts = [...systemOpts, ...customOpts];
        setRoleOptions(opts);
        if (!isEditing) {
          const defaultSlug = systemOpts[0]?.slug || customOpts[0]?.slug || '';
          setFormData((prev) => ({ ...prev, role_slug: prev.role_slug || defaultSlug }));
        }
      } catch {
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, [isOpen, isEditing]);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 4);
  };

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Имя обязательно для заполнения';
        } else if (value.trim().length < 2) {
          errors.name = 'Имя должно содержать минимум 2 символа';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email обязателен для заполнения';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Введите корректный email';
        }
        break;
      case 'password':
        if (!isEditing && !value) {
          errors.password = 'Пароль обязателен при создании администратора';
        } else if (value && value.length < 8) {
          errors.password = 'Пароль должен содержать минимум 8 символов';
        }
        break;
      case 'password_confirmation':
        if (formData.password && value !== formData.password) {
          errors.password_confirmation = 'Пароли не совпадают';
        }
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors[name] || ''
    }));
  };

  const generatePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password, password_confirmation: password });
    setPasswordStrength(getPasswordStrength(password));
    validateField('password', password);
    validateField('password_confirmation', password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
    
    validateField(name, value);
    
    if (name === 'password' && formData.password_confirmation) {
      validateField('password_confirmation', formData.password_confirmation);
    }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-gradient-to-br from-white to-concrete-50 px-8 pt-10 pb-8 text-left shadow-construction-lg ring-1 ring-construction-200/50 transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-10">
                <div className="flex items-center mb-8">
                  <div className="flex-shrink-0 bg-gradient-to-r from-construction-500 to-construction-600 rounded-full p-3 mr-4 shadow-construction">
                    <UserCircleIcon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <Dialog.Title as="h3" className="text-3xl font-bold bg-gradient-to-r from-steel-800 to-steel-600 bg-clip-text text-transparent">
                      {isEditing ? 'Редактировать администратора' : 'Добавить администратора'}
                    </Dialog.Title>
                    <p className="text-steel-600 mt-1">
                      {isEditing ? 'Измените данные администратора' : 'Создайте нового администратора системы'}
                    </p>
                  </div>
                </div>
                {error && (
                  <div className="rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-4 mb-6 flex items-start shadow-sm">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-gradient-to-r from-construction-50 to-construction-100 rounded-2xl p-6 border border-construction-200">
                    <div className="flex items-center mb-4">
                      <UserCircleIcon className="h-6 w-6 text-construction-600 mr-2" />
                      <h4 className="text-xl font-bold text-steel-800">Данные администратора</h4>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-steel-700 mb-2">Имя и Фамилия</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          autoFocus
                          value={formData.name}
                          onChange={handleChange}
                          className={`block w-full rounded-xl border-2 transition-all duration-200 px-4 py-3 text-steel-900 placeholder-steel-500 bg-white/80 backdrop-blur-sm shadow-sm text-sm font-medium ${
                            fieldErrors.name 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4' 
                              : 'border-steel-200 focus:border-construction-500 focus:ring-construction-500/20 focus:ring-4 hover:border-steel-300'
                          }`}
                          placeholder="Введите ФИО полностью"
                        />
                        {fieldErrors.name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-steel-700 mb-2">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-steel-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            maxLength={255}
                            value={formData.email}
                            onChange={handleChange}
                            className={`block w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 text-steel-900 placeholder-steel-500 bg-white/80 backdrop-blur-sm shadow-sm text-sm font-medium ${
                              fieldErrors.email 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4' 
                                : 'border-steel-200 focus:border-construction-500 focus:ring-construction-500/20 focus:ring-4 hover:border-steel-300'
                            }`}
                            placeholder="admin@example.com"
                          />
                        </div>
                        {fieldErrors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="role_slug" className="block text-sm font-semibold text-steel-700 mb-2">Роль</label>
                        <select
                          id="role_slug"
                          name="role_slug"
                          required
                          value={formData.role_slug}
                          onChange={handleChange}
                          className="block w-full rounded-xl border-2 border-steel-200 transition-all duration-200 px-4 py-3 text-steel-900 bg-white/80 backdrop-blur-sm shadow-sm text-sm font-medium focus:border-construction-500 focus:ring-construction-500/20 focus:ring-4 hover:border-steel-300"
                        >
                          {!formData.role_slug && <option value="" disabled>{rolesLoading ? 'Загрузка...' : 'Выберите роль'}</option>}
                          {roleOptions.some((r) => r.type === 'system') && (
                            <optgroup label="Системные роли">
                              {roleOptions.filter((r) => r.type === 'system').map((r) => (
                                <option key={`system:${r.slug}`} value={r.slug}>{r.name}</option>
                              ))}
                            </optgroup>
                          )}
                          {roleOptions.some((r) => r.type === 'custom') && (
                            <optgroup label="Кастомные роли">
                              {roleOptions.filter((r) => r.type === 'custom').map((r) => (
                                <option key={`custom:${r.slug}`} value={r.slug}>{r.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-safety-50 to-safety-100 rounded-2xl p-6 border border-safety-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <LockClosedIcon className="h-6 w-6 text-safety-600 mr-2" />
                        <h4 className="text-xl font-bold text-steel-800">Безопасность</h4>
                      </div>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-safety-700 bg-safety-100 hover:bg-safety-200 transition-colors duration-200"
                        >
                          <SparklesIcon className="h-4 w-4 mr-1" />
                          Сгенерировать
                        </button>
                      )}
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-steel-700 mb-2">
                          Пароль {isEditing ? <span className="text-steel-500 font-normal">(оставьте пустым, чтобы не менять)</span> : <span className="text-steel-500 font-normal">(мин. 8 символов)</span>}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-steel-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            required={!isEditing}
                            minLength={isEditing && !formData.password ? undefined : 8}
                            value={formData.password}
                            onChange={handleChange}
                            className={`block w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-200 text-steel-900 placeholder-steel-500 bg-white/80 backdrop-blur-sm shadow-sm text-sm font-medium ${
                              fieldErrors.password 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4' 
                                : 'border-steel-200 focus:border-safety-500 focus:ring-safety-500/20 focus:ring-4 hover:border-steel-300'
                            }`}
                            placeholder="Введите пароль"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-steel-400 hover:text-steel-600 transition-colors duration-200"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        
                        {formData.password && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-steel-600 font-medium">Сложность пароля</span>
                              <span className={`font-bold ${
                                passwordStrength <= 1 ? 'text-red-600' : 
                                passwordStrength <= 2 ? 'text-safety-600' : 
                                passwordStrength <= 3 ? 'text-construction-600' : 'text-green-600'
                              }`}>
                                {passwordStrength <= 1 ? 'Слабый' : 
                                 passwordStrength <= 2 ? 'Средний' : 
                                 passwordStrength <= 3 ? 'Хороший' : 'Отличный'}
                              </span>
                            </div>
                            <div className="w-full bg-steel-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength <= 1 ? 'bg-red-500 w-1/4' : 
                                  passwordStrength <= 2 ? 'bg-safety-500 w-2/4' : 
                                  passwordStrength <= 3 ? 'bg-construction-500 w-3/4' : 'bg-green-500 w-full'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                        
                        {fieldErrors.password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {fieldErrors.password}
                          </p>
                        )}
                        {!fieldErrors.password && formData.password && (
                          <p className="text-xs text-steel-600 mt-2 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                            Используйте буквы разного регистра, цифры и специальные символы для большей безопасности
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-steel-700 mb-2">Подтверждение пароля</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-steel-400" />
                          </div>
                          <input
                            type={showPasswordConfirmation ? "text" : "password"}
                            name="password_confirmation"
                            id="password_confirmation"
                            required={!!formData.password}
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className={`block w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-200 text-steel-900 placeholder-steel-500 bg-white/80 backdrop-blur-sm shadow-sm text-sm font-medium ${
                              fieldErrors.password_confirmation 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4' 
                                : 'border-steel-200 focus:border-safety-500 focus:ring-safety-500/20 focus:ring-4 hover:border-steel-300'
                            }`}
                            placeholder="Повторите пароль"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-steel-400 hover:text-steel-600 transition-colors duration-200"
                          >
                            {showPasswordConfirmation ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {fieldErrors.password_confirmation && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {fieldErrors.password_confirmation}
                          </p>
                        )}
                        {!fieldErrors.password_confirmation && formData.password_confirmation && formData.password === formData.password_confirmation && (
                          <p className="mt-2 text-sm text-green-600 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Пароли совпадают
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-white/50 rounded-xl p-4 border border-safety-200">
                        <div className="flex items-center">
                          <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-2 border-steel-300 text-safety-600 focus:ring-safety-500/20 focus:ring-4 transition-all duration-200"
                          />
                          <label htmlFor="is_active" className="ml-3 flex items-center">
                            <span className="text-sm font-semibold text-steel-800">Активен</span>
                            <span className="ml-2 text-xs text-steel-600">Администратор сможет войти в систему</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-construction-600 to-construction-500 hover:from-construction-700 hover:to-construction-600 focus:outline-none focus:ring-4 focus:ring-construction-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-construction hover:shadow-construction-lg"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditing ? 'Сохранение...' : 'Создание...'}
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-5 w-5 mr-2" />
                          {isEditing ? 'Сохранить изменения' : 'Добавить администратора'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-base font-semibold text-steel-700 bg-white border-2 border-steel-200 hover:border-construction-300 hover:bg-construction-50 hover:text-construction-700 focus:outline-none focus:ring-4 focus:ring-steel-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
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