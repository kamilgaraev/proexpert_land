import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';
import { useCustomRoles } from '../../../hooks/useCustomRoles';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const { roles, sendInvitation, fetchRoles, createUserWithCustomRoles } = useUserManagement();
  const { customRoles, fetchCustomRoles } = useCustomRoles();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role_slugs: [] as string[],
    custom_role_ids: [] as number[],
    welcome_message: '',
    password: '',
    password_confirmation: '',
    send_credentials: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteType, setInviteType] = useState<'invitation' | 'direct'>('invitation');
  const [showEmailVerificationNotice, setShowEmailVerificationNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchCustomRoles();
      setFormData({ 
        email: '', 
        name: '', 
        role_slugs: [], 
        custom_role_ids: [],
        welcome_message: '',
        password: '',
        password_confirmation: '',
        send_credentials: true
      });
      setErrors({});
      setInviteType('invitation');
    }
  }, [isOpen, fetchRoles, fetchCustomRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.name) newErrors.name = 'Имя обязательно';
    
    if (inviteType === 'direct') {
      // Прямое создание пользователя с кастомными ролями
      if (formData.custom_role_ids.length === 0) {
        newErrors.roles = 'Выберите хотя бы одну кастомную роль';
      }
      if (!formData.password) newErrors.password = 'Пароль обязателен';
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Пароли не совпадают';
      }
    } else {
      // Приглашение через email
      if (formData.role_slugs.length === 0) {
        newErrors.roles = 'Выберите хотя бы одну роль';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setShowEmailVerificationNotice(false);
    try {
      if (inviteType === 'direct') {
        // Создаем пользователя с кастомными ролями напрямую
        const response = await createUserWithCustomRoles({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          custom_role_ids: formData.custom_role_ids,
          send_credentials: formData.send_credentials
        });
        
        // Проверяем статус верификации email
        if (response?.data?.user?.email_verified_at === null || response?.data?.user?.email_verified_at === undefined) {
          setShowEmailVerificationNotice(true);
        } else {
          onSave();
        }
      } else {
        // Отправляем приглашение
        await sendInvitation({
          email: formData.email,
          name: formData.name,
          role_slugs: formData.role_slugs,
          metadata: {
            welcome_message: formData.welcome_message
          }
        });
        onSave();
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка создания пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleSlug: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        role_slugs: [...prev.role_slugs, roleSlug]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        role_slugs: prev.role_slugs.filter(slug => slug !== roleSlug)
      }));
    }
  };

  const handleCustomRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        custom_role_ids: [...prev.custom_role_ids, roleId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        custom_role_ids: prev.custom_role_ids.filter(id => id !== roleId)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {inviteType === 'direct' ? 'Создать пользователя' : 'Пригласить пользователя'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Selection */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setInviteType('invitation')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg border ${
                inviteType === 'invitation'
                  ? 'bg-orange-50 text-orange-700 border-orange-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Отправить приглашение
            </button>
            <button
              type="button"
              onClick={() => setInviteType('direct')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg border ${
                inviteType === 'direct'
                  ? 'bg-orange-50 text-orange-700 border-orange-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Создать напрямую
            </button>
          </div>
        </div>

        {showEmailVerificationNotice && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Пользователь создан успешно</h4>
              <p className="text-sm text-yellow-800">
                На его email отправлено письмо для подтверждения адреса. Пользователь сможет войти в систему только после подтверждения email.
              </p>
              <button
                onClick={() => {
                  setShowEmailVerificationNotice(false);
                  onSave();
                }}
                className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                Понятно
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Имя пользователя"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Password Fields for Direct Creation */}
          {inviteType === 'direct' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль *
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Введите пароль"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердите пароль *
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Повторите пароль"
                />
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
          )}

          {/* Roles Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {inviteType === 'direct' ? 'Кастомные роли *' : 'Системные роли *'}
            </label>
            
            {inviteType === 'direct' ? (
              /* Custom Roles */
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {customRoles.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет доступных кастомных ролей</p>
                ) : (
                  customRoles.map((role) => (
                    <label key={role.id} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.custom_role_ids.includes(role.id)}
                        onChange={(e) => handleCustomRoleChange(role.id, e.target.checked)}
                        className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                      />
                      <div className="ml-2">
                        <span className="text-sm font-medium text-gray-900">{role.name}</span>
                        {role.description && (
                          <p className="text-xs text-gray-500">{role.description}</p>
                        )}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          role.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {role.is_active ? 'Активна' : 'Неактивна'}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            ) : (
              /* System Roles */
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {roles.filter((r: any) => r.is_system).map((role) => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.role_slugs.includes(role.slug)}
                      onChange={(e) => handleRoleChange(role.slug, e.target.checked)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="ml-2 flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="text-sm text-gray-700">{role.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
          </div>

          {/* Options */}
          {inviteType === 'direct' ? (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.send_credentials}
                  onChange={(e) => setFormData(prev => ({ ...prev, send_credentials: e.target.checked }))}
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Отправить данные для входа на email
                </span>
              </label>
            </div>
          ) : (
            <div>
              <label htmlFor="welcome_message" className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение приглашения (необязательно)
              </label>
              <textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Добро пожаловать в команду!"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? (inviteType === 'direct' ? 'Создание...' : 'Отправка...') : 
               (inviteType === 'direct' ? 'Создать пользователя' : 'Отправить приглашение')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal; 