import React, { useState, useMemo } from 'react';
import { OrganizationUser } from '../../../hooks/useUserManagement';
import { userManagementService } from '../../../utils/api';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EnvelopeIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface UsersListProps {
  users: OrganizationUser[];
  loading: boolean;
  onRefresh: () => void;
}

const UsersList: React.FC<UsersListProps> = ({ users, loading, onRefresh }) => {
  const [filterUnverifiedOnly, setFilterUnverifiedOnly] = useState(false);
  const [sortByVerification, setSortByVerification] = useState<'none' | 'unverified-first' | 'verified-first'>('unverified-first');
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Неактивен';  
      case 'pending':
        return 'Ожидает';
      default:
        return status;
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Никогда';
    return new Date(lastLogin).toLocaleDateString('ru-RU');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return null;
    }
  };

  const isEmailVerified = (user: OrganizationUser) => {
    return user.email_verified_at !== null && user.email_verified_at !== undefined;
  };

  const handleResendVerificationEmail = async (userId: number) => {
    setSendingEmail(userId);
    try {
      const response = await userManagementService.resendVerificationEmailForUser(userId);
      if (response.data?.success) {
        toast.success('Письмо для подтверждения email отправлено');
        onRefresh();
      } else {
        throw new Error(response.data?.message || 'Ошибка отправки письма');
      }
    } catch (error: any) {
      toast.error(error.message || 'Не удалось отправить письмо');
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Фильтр по статусу верификации
    if (filterUnverifiedOnly) {
      filtered = filtered.filter(user => !isEmailVerified(user));
    }

    // Сортировка по статусу верификации
    if (sortByVerification === 'unverified-first') {
      filtered = [...filtered].sort((a, b) => {
        const aVerified = isEmailVerified(a);
        const bVerified = isEmailVerified(b);
        if (aVerified === bVerified) return 0;
        return aVerified ? 1 : -1;
      });
    } else if (sortByVerification === 'verified-first') {
      filtered = [...filtered].sort((a, b) => {
        const aVerified = isEmailVerified(a);
        const bVerified = isEmailVerified(b);
        if (aVerified === bVerified) return 0;
        return aVerified ? -1 : 1;
      });
    }

    return filtered;
  }, [users, filterUnverifiedOnly, sortByVerification]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
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
          <h2 className="text-lg font-semibold text-foreground">Пользователи организации</h2>
          <p className="text-sm text-muted-foreground">Управляйте участниками вашей организации</p>
        </div>
      </div>

      {/* Фильтры и сортировка */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterUnverifiedOnly}
            onChange={(e) => setFilterUnverifiedOnly(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground">Только неподтвержденные</span>
        </label>

        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortByVerification}
            onChange={(e) => setSortByVerification(e.target.value as any)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background text-foreground"
          >
            <option value="none">Без сортировки</option>
            <option value="unverified-first">Сначала неподтвержденные</option>
            <option value="verified-first">Сначала подтвержденные</option>
          </select>
        </div>
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground">Нет пользователей</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filterUnverifiedOnly 
              ? 'Все пользователи подтвердили email' 
              : 'Начните с приглашения участников'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Email статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Роли
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Последний вход
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredAndSortedUsers.map((user) => {
                const verified = isEmailVerified(user);
                return (
                  <tr key={user.id} className="hover:bg-secondary/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {verified ? (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Email подтвержден
                            </span>
                            {user.email_verified_at && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(user.email_verified_at)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Email не подтвержден
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: role.color + '20', 
                              color: role.color 
                            }}
                          >
                            {role.name}
                          </span>
                        ))}
                        {user.custom_roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: role.color + '20', 
                              color: role.color 
                            }}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatLastLogin(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {!verified && (
                          <button
                            onClick={() => handleResendVerificationEmail(user.id)}
                            disabled={sendingEmail === user.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingEmail === user.id ? (
                              <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Отправка...
                              </>
                            ) : (
                              <>
                                <EnvelopeIcon className="w-4 h-4" />
                                Отправить письмо повторно
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersList; 