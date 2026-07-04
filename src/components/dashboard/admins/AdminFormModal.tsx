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
import type { AvailableRole } from '@utils/api';
import { AdminPanelUser, AdminFormData } from '@/types/admin';
import { toast } from 'react-toastify';
import { useAuth } from '@hooks/useAuth';

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: () => void;
  adminToEdit?: AdminPanelUser | null;
}

type RoleOption = {
  slug: string;
  name: string;
  type: 'system' | 'custom';
  description?: string;
  permission_preview?: string[];
  system_permissions_count?: number;
  module_permissions_count?: number;
  interface_access?: string[];
};

const ROLE_FALLBACK_NAMES: Record<string, string> = {
  super_admin: 'Суперадминистратор',
  support: 'Поддержка',
  system_admin: 'Системный администратор',
  accountant: 'Бухгалтер',
  organization_admin: 'Администратор организации',
  organization_owner: 'Владелец организации',
  viewer: 'Наблюдатель',
  supplier: 'Снабженец',
  brigade_manager: 'Менеджер бригады',
  brigade_representative: 'Представитель бригады',
  admin_viewer: 'Наблюдатель админ-панели',
  brigade_catalog_moderator: 'Модератор каталога бригад',
  finance_admin: 'Финансовый администратор',
  web_admin: 'Веб-администратор',
  foreman: 'Прораб',
  observer: 'Наблюдатель проекта',
  worker: 'Рабочий',
  contractor: 'Подрядчик',
  project_manager: 'Руководитель проекта',
  project_viewer: 'Наблюдатель проекта',
  site_engineer: 'Инженер ПТО',
  parent_administrator: 'Администратор холдинга',
};

const INTERFACE_LABELS: Record<string, string> = {
  admin: 'Админ-панель',
  lk: 'Личный кабинет',
  mobile: 'Мобильное приложение',
  customer: 'Кабинет заказчика',
};

const fallbackRoleName = (slug: string): string => ROLE_FALLBACK_NAMES[slug] ?? slug
  .split('_')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const normalizeRoleOption = (role: string | AvailableRole, defaultType: 'system' | 'custom'): RoleOption => {
  if (typeof role === 'string') {
    return {
      slug: role,
      name: fallbackRoleName(role),
      type: defaultType,
    };
  }

  return {
    slug: String(role.slug),
    name: String(role.name ?? fallbackRoleName(role.slug)),
    type: role.type ?? defaultType,
    description: role.description,
    permission_preview: role.permission_preview,
    system_permissions_count: role.system_permissions_count,
    module_permissions_count: role.module_permissions_count,
    interface_access: role.interface_access,
  };
};

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
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [selectedRoleSlugs, setSelectedRoleSlugs] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showEmailVerificationNotice, setShowEmailVerificationNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && adminToEdit) {
        const roleSlugs = adminToEdit.roles && adminToEdit.roles.length > 0
          ? adminToEdit.roles.map((role) => role.slug)
          : adminToEdit.role_slug ? [adminToEdit.role_slug] : [];

        setFormData({
          name: adminToEdit.name,
          email: adminToEdit.email,
          role_slug: roleSlugs[0] ?? '',
          role_slugs: roleSlugs,
          password: '',
          password_confirmation: '',
          is_active: adminToEdit.is_active !== undefined ? adminToEdit.is_active : true,
        });
        setSelectedRoleSlugs(roleSlugs);
      } else {
        setFormData({ ...initialFormState });
        setSelectedRoleSlugs([]);
      }
      setError(null);
      setIsLoading(false);
    } else {
      setFormData(initialFormState);
      setSelectedRoleSlugs([]);
      setError(null);
    }
  }, [isOpen, isEditing, adminToEdit]);

  useEffect(() => {
    if (!isOpen) return;
    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        const resp = await customRolesService.getAvailableRoles({ scope: 'admin_panel' });
        const payload = resp?.data;
        const data = payload?.data ?? payload;
        const system: Array<string | AvailableRole> = Array.isArray(data?.system_roles) ? data.system_roles : [];
        const custom: AvailableRole[] = Array.isArray(data?.custom_roles) ? data.custom_roles : [];

        const systemOpts = system
          .map((role) => normalizeRoleOption(role, 'system'))
          .filter((role) => role.slug !== 'organization_owner');
        const customOpts = custom
          .filter((r) => r && r.slug && (r.is_active === undefined || r.is_active))
          .map((role) => normalizeRoleOption({ ...role, type: 'custom' }, 'custom'));

        const opts = [...systemOpts, ...customOpts];
        setRoleOptions(opts);
        if (!isEditing) {
          const defaultSlug = systemOpts[0]?.slug || customOpts[0]?.slug || '';
          setFormData((prev) => ({
            ...prev,
            role_slug: prev.role_slug || defaultSlug,
            role_slugs: prev.role_slugs?.length ? prev.role_slugs : defaultSlug ? [defaultSlug] : [],
          }));
          setSelectedRoleSlugs((prev) => (prev.length ? prev : defaultSlug ? [defaultSlug] : []));
        }
      } catch {
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, [isOpen, isEditing]);

  const selectedRoleOptions = roleOptions.filter((role) => selectedRoleSlugs.includes(role.slug));

  const handleRoleToggle = (roleSlug: string) => {
    setSelectedRoleSlugs((prev) => {
      const next = prev.includes(roleSlug)
        ? prev.filter((slug) => slug !== roleSlug)
        : [...prev, roleSlug];

      setFormData((current) => ({
        ...current,
        role_slug: next[0] ?? '',
        role_slugs: next,
      }));

      return next;
    });
  };

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
    if (selectedRoleSlugs.length === 0) {
      setError('Выберите хотя бы одну роль.');
      toast.error('Выберите хотя бы одну роль.');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditing && adminToEdit) {
        const dataToSendForUpdate: Partial<AdminFormData> = {
          name: formData.name,
          is_active: formData.is_active,
          role_slugs: selectedRoleSlugs,
        };
        if (formData.password) {
          dataToSendForUpdate.password = formData.password;
          dataToSendForUpdate.password_confirmation = formData.password_confirmation;
        }
        response = await adminPanelUserService.updateAdminPanelUser(adminToEdit.id, dataToSendForUpdate);
      } else {
        const dataToSendForCreate = {
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          role_slug: selectedRoleSlugs[0],
          role_slugs: selectedRoleSlugs,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          organization_id: user?.current_organization_id,
        };
        response = await adminPanelUserService.createAdminPanelUser(dataToSendForCreate);
      }

      if (response.success && response.data) {
        // Проверяем статус верификации email при создании нового администратора
        if (!isEditing && response.data.email_verified_at === null) {
          setShowEmailVerificationNotice(true);
        } else {
          toast.success(response.message || `Администратор успешно ${isEditing ? 'обновлен' : 'создан'}.`);
          onFormSubmit();
          onClose();
        }
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
                {showEmailVerificationNotice && (
                  <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 p-4 mb-6 flex items-start shadow-sm">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-900 mb-1">Администратор создан успешно</h4>
                      <p className="text-sm text-yellow-800 mb-3">
                        На его email отправлено письмо для подтверждения адреса. Пользователь сможет войти в систему только после подтверждения email.
                      </p>
                      <button
                        onClick={() => {
                          setShowEmailVerificationNotice(false);
                          onFormSubmit();
                          onClose();
                        }}
                        className="text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
                      >
                        Понятно
                      </button>
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
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <label className="block text-sm font-semibold text-steel-700">Роли</label>
                          <span className="text-xs font-semibold text-steel-500">
                            Выбрано: {selectedRoleSlugs.length}
                          </span>
                        </div>
                        <div className="rounded-xl border-2 border-steel-200 bg-white/80 p-3 shadow-sm">
                          {rolesLoading ? (
                            <div className="py-6 text-center text-sm font-medium text-steel-500">Загрузка ролей...</div>
                          ) : roleOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm font-medium text-steel-500">Нет доступных ролей</div>
                          ) : (
                            <div className="space-y-4">
                              {(['system', 'custom'] as const).map((roleType) => {
                                const roles = roleOptions.filter((role) => role.type === roleType);

                                if (roles.length === 0) {
                                  return null;
                                }

                                return (
                                  <div key={roleType}>
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-steel-500">
                                      {roleType === 'system' ? 'Системные роли' : 'Кастомные роли'}
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                      {roles.map((role) => {
                                        const checked = selectedRoleSlugs.includes(role.slug);
                                        const permissionsCount = (role.system_permissions_count ?? 0) + (role.module_permissions_count ?? 0);

                                        return (
                                          <label
                                            key={`${role.type}:${role.slug}`}
                                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-all ${
                                              checked
                                                ? 'border-construction-300 bg-construction-50'
                                                : 'border-steel-100 bg-white hover:border-steel-200 hover:bg-steel-50'
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() => handleRoleToggle(role.slug)}
                                              className="mt-1 h-4 w-4 rounded border-steel-300 text-construction-600 focus:ring-construction-500"
                                            />
                                            <span className="min-w-0 flex-1">
                                              <span className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-steel-900">{role.name}</span>
                                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                  role.type === 'system'
                                                    ? 'bg-steel-100 text-steel-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                  {role.type === 'system' ? 'Системная' : 'Кастомная'}
                                                </span>
                                              </span>
                                              <span className="mt-1 flex flex-wrap gap-2 text-xs text-steel-500">
                                                {permissionsCount > 0 && <span>{permissionsCount} прав</span>}
                                                {role.interface_access?.length ? (
                                                  <span>{role.interface_access.map((slug) => INTERFACE_LABELS[slug] ?? slug).join(', ')}</span>
                                                ) : null}
                                              </span>
                                              {role.description && (
                                                <span className="mt-1 block text-xs text-steel-600">{role.description}</span>
                                              )}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {selectedRoleOptions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedRoleOptions.map((role) => (
                              <button
                                key={`selected:${role.type}:${role.slug}`}
                                type="button"
                                onClick={() => handleRoleToggle(role.slug)}
                                className="inline-flex max-w-full items-center gap-1 rounded-full border border-construction-200 bg-construction-50 px-3 py-1 text-xs font-semibold text-construction-800 hover:border-construction-300"
                              >
                                <span className="truncate">{role.name}</span>
                                <XMarkIcon className="h-3.5 w-3.5 flex-shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
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
