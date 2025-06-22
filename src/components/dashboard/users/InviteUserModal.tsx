import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../../hooks/useUserManagement';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const { roles, sendInvitation, fetchRoles } = useUserManagement();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role_slugs: [] as string[],
    welcome_message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      setFormData({ email: '', name: '', role_slugs: [], welcome_message: '' });
      setErrors({});
    }
  }, [isOpen, fetchRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.name) newErrors.name = 'Имя обязательно';
    if (formData.role_slugs.length === 0) newErrors.roles = 'Выберите хотя бы одну роль';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await sendInvitation({
        email: formData.email,
        name: formData.name,
        role_slugs: formData.role_slugs,
        metadata: {
          welcome_message: formData.welcome_message
        }
      });
      onSave();
    } catch (error) {
      console.error('Ошибка отправки приглашения:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Пригласить пользователя
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Имя участника"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роли
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.role_slugs.includes(role.slug)}
                      onChange={(e) => handleRoleChange(role.slug, e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
              {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles}</p>}
            </div>

            <div>
              <label htmlFor="welcome_message" className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение приглашения (опционально)
              </label>
              <textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) => setFormData(prev => ({ ...prev, welcome_message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Добро пожаловать в команду!"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Отправить приглашение'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal; 