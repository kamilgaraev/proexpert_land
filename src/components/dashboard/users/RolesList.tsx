import React from 'react';
import { OrganizationRole } from '../../../hooks/useUserManagement';

interface RolesListProps {
  roles: OrganizationRole[];
  loading: boolean;
  onRefresh: () => void;
}

const RolesList: React.FC<RolesListProps> = ({ roles, loading }) => {
  const formatPermissions = (permissionsFormatted: Record<string, Array<{slug: string, name: string, granted: boolean}>>) => {
    const granted = Object.values(permissionsFormatted)
      .flat()
      .filter(p => p.granted)
      .map(p => p.name);
    
    if (granted.length === 0) return 'Нет разрешений';
    if (granted.length <= 3) return granted.join(', ');
    return `${granted.slice(0, 3).join(', ')} и еще ${granted.length - 3}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Роли организации</h2>
          <p className="text-sm text-gray-600">Управляйте ролями и разрешениями</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          Создать роль
        </button>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Нет ролей</h3>
          <p className="mt-1 text-sm text-gray-500">Создайте первую роль для организации</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {role.is_system && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Системная
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    role.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {role.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Разрешения:</p>
                <p className="text-sm text-gray-700">{formatPermissions(role.permissions_formatted)}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Пользователей: {role.users_count}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    Редактировать
                  </button>
                  {!role.is_system && (
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesList; 