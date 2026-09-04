import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { UserInvitation } from '../../../hooks/useUserManagement';

interface InvitationsListProps {
  invitations: UserInvitation[];
  loading: boolean;
  onRefresh: () => void;
  onInvite: () => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ invitations, loading, onInvite }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-secondary text-foreground';
      case 'accepted':
        return 'bg-secondary text-foreground';
      case 'expired':
        return 'bg-secondary text-muted-foreground';
      default:
        return 'bg-secondary text-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Приглашения</h2>
          <p className="text-sm text-gray-600">Отслеживайте статус отправленных приглашений</p>
        </div>
        <Button type="button" className="w-full sm:w-auto" onClick={onInvite}>
          <Send aria-hidden="true" className="mr-2 h-5 w-5" />Пригласить сотрудника
        </Button>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Нет приглашений</h3>
          <p className="mt-1 text-sm text-gray-500">Отправьте первое приглашение участнику</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-border">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Приглашённый
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Роли
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Истекает
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Пригласил
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-secondary">
                        <span className="text-sm font-medium text-foreground">
                          {invitation.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{invitation.name}</div>
                        <div className="text-sm text-gray-500">{invitation.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {invitation.role_names.map((roleName, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded border border-border px-2 py-1 text-xs font-medium text-foreground"
                        >
                          {roleName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                      {invitation.status_text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invitation.expires_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.invited_by.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invitation.status === 'pending' && (
                      <button className="text-blue-600 hover:text-blue-900 font-medium mr-4">
                        Повторить
                      </button>
                    )}
                    <button className="text-red-600 hover:text-red-900 font-medium">
                      Отменить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvitationsList; 