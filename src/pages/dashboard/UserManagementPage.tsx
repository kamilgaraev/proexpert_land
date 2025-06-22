import React, { useState, useEffect } from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';
import UsersList from '../../components/dashboard/users/UsersList';
import InvitationsList from '../../components/dashboard/users/InvitationsList';
import RolesList from '../../components/dashboard/users/RolesList';

type TabType = 'users' | 'invitations' | 'roles';

const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const {
    users,
    invitations,
    roles,
    limits,
    loading,
    error,
    fetchUsers,
    fetchInvitations,
    fetchRoles,
    clearError
  } = useUserManagement();

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchInvitations(),
          fetchRoles()
        ]);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };

    initData();
  }, [fetchUsers, fetchInvitations, fetchRoles]);

  useEffect(() => {
    if (error) {
      console.error('Ошибка:', error);
      clearError();
    }
  }, [error, clearError]);

  const tabs = [
    { id: 'users' as TabType, name: 'Пользователи', count: users.length },
    { id: 'invitations' as TabType, name: 'Приглашения', count: invitations.length },
    { id: 'roles' as TabType, name: 'Роли', count: roles.length }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersList users={users} loading={loading} onRefresh={fetchUsers} />;
      case 'invitations':
        return <InvitationsList invitations={invitations} loading={loading} onRefresh={fetchInvitations} />;
      case 'roles':
        return <RolesList roles={roles} loading={loading} onRefresh={fetchRoles} />;
      default:
        return null;
    }
  };

  const renderLimitCard = (title: string, limit: any, icon: string) => {
    if (!limit) return null;
    
    const percentage = limit.is_unlimited ? 0 : limit.percentage_used;
    const getStatusColor = () => {
      if (limit.is_unlimited) return 'text-blue-600 bg-blue-100';
      if (percentage >= 90) return 'text-red-600 bg-red-100';
      if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
      return 'text-green-600 bg-green-100';
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${getStatusColor()} flex items-center justify-center`}>
              <span className="text-lg">{icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">
                {limit.is_unlimited ? 'Безлимитно' : `${limit.used} / ${limit.limit}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {limit.is_unlimited ? '∞' : `${Math.round(percentage)}%`}
            </div>
          </div>
        </div>
        {!limit.is_unlimited && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  percentage >= 90 ? 'bg-red-500' : 
                  percentage >= 75 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
            <p className="text-sm text-gray-600 mt-1">
              Управляйте участниками, ролями и приглашениями в вашей организации
            </p>
          </div>
        </div>

        {limits && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {renderLimitCard('Пользователи', limits.limits.users, '👥')}
            {renderLimitCard('Прорабы', limits.limits.foremen, '👷')}
          </div>
        )}

        {limits?.warnings && limits.warnings.length > 0 && (
          <div className="mb-6">
            {limits.warnings.map((warning, index) => (
              <div
                key={index}
                className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-2"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">{warning.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.name}</span>
                <span className={`${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                } inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserManagementPage; 