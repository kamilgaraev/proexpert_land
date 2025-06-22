import React, { useState, useEffect } from 'react';
import { OrganizationUser } from '../../../hooks/useUserManagement';
import { useUserManagement } from '../../../hooks/useUserManagement';

interface UserEditModalProps {
  user: OrganizationUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const { roles, updateUserRoles, fetchRoles } = useUserManagement();
  const [selectedSystemRoles, setSelectedSystemRoles] = useState<string[]>([]);
  const [selectedCustomRoles, setSelectedCustomRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      setSelectedSystemRoles(user.roles.map(r => r.slug));
      setSelectedCustomRoles(user.custom_roles.map(r => r.id));
    }
  }, [isOpen, user, fetchRoles]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserRoles(user.id, {
        system_roles: selectedSystemRoles,
        custom_roles: selectedCustomRoles,
        action: 'replace'
      });
      onSave();
    } catch (error) {
      console.error('Ошибка обновления ролей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemRoleChange = (roleSlug: string, checked: boolean) => {
    if (checked) {
      setSelectedSystemRoles(prev => [...prev, roleSlug]);
    } else {
      setSelectedSystemRoles(prev => prev.filter(r => r !== roleSlug));
    }
  };

  const handleCustomRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomRoles(prev => [...prev, roleId]);
    } else {
      setSelectedCustomRoles(prev => prev.filter(r => r !== roleId));
    }
  };

  if (!isOpen) return null;

  const systemRoles = roles.filter(r => r.is_system);
  const customRoles = roles.filter(r => !r.is_system);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Редактировать пользователя
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

          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-medium text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {systemRoles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Системные роли</h4>
                <div className="space-y-2">
                  {systemRoles.map((role) => (
                    <label key={role.slug} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSystemRoles.includes(role.slug)}
                        onChange={(e) => handleSystemRoleChange(role.slug, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {customRoles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Пользовательские роли</h4>
                <div className="space-y-2">
                  {customRoles.map((role) => (
                    <label key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCustomRoles.includes(role.id)}
                        onChange={(e) => handleCustomRoleChange(role.id, e.target.checked)}
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
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal; 