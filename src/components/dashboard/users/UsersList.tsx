import React, { useState, useMemo } from 'react';
import { OrganizationUser } from '../../../hooks/useUserManagement';
import { useAuth } from '../../../hooks/useAuth';
import { useIsOwner } from '../../../hooks/usePermissions';
import { userManagementService } from '../../../utils/api';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EnvelopeIcon,
  FunnelIcon,
  ShieldCheckIcon
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
  const [ownerCandidate, setOwnerCandidate] = useState<OrganizationUser | null>(null);
  const [ownerAcknowledged, setOwnerAcknowledged] = useState(false);
  const [grantingOwner, setGrantingOwner] = useState(false);
  const { user: currentUser } = useAuth();
  const isCurrentUserOwner = useIsOwner();

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

  const hasOrganizationOwnerRole = (user: OrganizationUser) => {
    return user.roles.some(role => role.slug === 'organization_owner');
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

  const openGrantOwnerModal = (user: OrganizationUser) => {
    setOwnerCandidate(user);
    setOwnerAcknowledged(false);
  };

  const closeGrantOwnerModal = () => {
    if (grantingOwner) return;
    setOwnerCandidate(null);
    setOwnerAcknowledged(false);
  };

  const handleGrantOwner = async () => {
    if (!ownerCandidate || !ownerAcknowledged) return;

    setGrantingOwner(true);

    try {
      const response = await userManagementService.grantOrganizationOwner(ownerCandidate.id);
      if (response.data?.success) {
        toast.success(response.data.message || 'Пользователь назначен владельцем организации');
        setOwnerCandidate(null);
        setOwnerAcknowledged(false);
        onRefresh();
      } else {
        throw new Error(response.data?.message || 'Не удалось назначить владельца организации');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Не удалось назначить владельца организации';
      toast.error(message);
    } finally {
      setGrantingOwner(false);
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
                const isOwner = hasOrganizationOwnerRole(user);
                const canGrantOwner = isCurrentUserOwner && currentUser?.id !== user.id && !isOwner && user.status.toLowerCase() === 'active';
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
                        {canGrantOwner && (
                          <button
                            type="button"
                            onClick={() => openGrantOwnerModal(user)}
                            className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                          >
                            <ShieldCheckIcon className="w-4 h-4" />
                            Сделать владельцем
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

      {ownerCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-5 py-4">
              <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600" />
              <div>
                <h3 className="text-base font-semibold text-amber-950">
                  Назначить владельцем организации?
                </h3>
                <p className="mt-1 text-sm text-amber-900">
                  Это важная роль с полным доступом к управлению организацией, сотрудниками и настройками.
                </p>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">{ownerCandidate.name}</div>
                <div className="text-sm text-gray-600">{ownerCandidate.email}</div>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <input
                  type="checkbox"
                  checked={ownerAcknowledged}
                  onChange={(event) => setOwnerAcknowledged(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-700 focus:ring-amber-600"
                />
                <span>
                  Я понимаю, что сотрудник получит права владельца организации и сможет управлять доступами других пользователей.
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeGrantOwnerModal}
                disabled={grantingOwner}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleGrantOwner}
                disabled={!ownerAcknowledged || grantingOwner}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {grantingOwner && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                Назначить владельцем
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
