import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus, Send, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrganizationTeamDirectory from '@/components/dashboard/users/OrganizationTeamDirectory';
import OrganizationTeamAccessAction from '@/components/dashboard/users/OrganizationTeamAccessAction';
import OrganizationTeamOwnerAction from '@/components/dashboard/users/OrganizationTeamOwnerAction';
import OrganizationTeamRoleAction from '@/components/dashboard/users/OrganizationTeamRoleAction';
import InvitationsList from '@/components/dashboard/users/InvitationsList';
import UserCreateInviteModal from '@/components/dashboard/users/UserCreateInviteModal';
import RolesComparisonTable from '@/components/dashboard/roles/RolesComparisonTable';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserManagement } from '@/hooks/useUserManagement';

function TeamInvitations({ onInvite }: { onInvite?: () => void }) {
  const { invitations, loading, error, fetchInvitations, clearError } = useUserManagement();
  const refresh = useCallback(async () => {
    clearError();
    await fetchInvitations();
  }, [clearError, fetchInvitations]);

  useEffect(() => { void fetchInvitations(); }, [fetchInvitations]);

  if (error) {
    return (
      <div role="alert" className="space-y-3 border-y border-border py-6">
        <p>Не удалось загрузить приглашения. Попробуйте ещё раз.</p>
        <Button variant="outline" onClick={() => void refresh()}>Повторить загрузку</Button>
      </div>
    );
  }

  return <InvitationsList invitations={invitations} loading={loading} onRefresh={refresh} onInvite={onInvite} />;
}

interface WorkspaceProps {
  scope: string;
  actorId: number;
  organizationId: number;
  canAssignRoles: boolean;
  canCreate: boolean;
  canInvite: boolean;
  canViewRoles: boolean;
  canGrantOwner: boolean;
}

function TeamWorkspace({ scope, actorId, organizationId, canAssignRoles, canCreate, canInvite, canViewRoles, canGrantOwner }: WorkspaceProps) {
  const { reload } = usePermissions();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [revision, setRevision] = useState(0);
  const canAdd = canCreate || canInvite;

  return (
    <div className="min-w-0 space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Команда</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Сотрудники компании, их роли и доступ к работе.</p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus aria-hidden="true" className="mr-2 h-5 w-5" />Добавить сотрудника
          </Button>
        )}
      </header>
      <Tabs defaultValue="employees" className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="w-full min-w-0 sm:w-auto">
            <TabsList aria-label="Разделы команды" className="grid h-auto w-full auto-cols-fr grid-flow-col gap-1 bg-transparent p-0 sm:flex sm:justify-start">
              <TabsTrigger value="employees" className="min-h-11 min-w-0 flex-col gap-2 px-1 py-3 sm:flex-row sm:px-4 sm:py-2 data-[state=active]:bg-secondary data-[state=active]:shadow-none">
                <Users aria-hidden="true" className="h-5 w-5 shrink-0" />Сотрудники
              </TabsTrigger>
              <TabsTrigger value="invitations" className="min-h-11 min-w-0 flex-col gap-2 px-1 py-3 sm:flex-row sm:px-4 sm:py-2 data-[state=active]:bg-secondary data-[state=active]:shadow-none">
                <Send aria-hidden="true" className="h-5 w-5 shrink-0" />Приглашения
              </TabsTrigger>
              {canViewRoles && (
                <TabsTrigger value="roles" className="min-h-11 min-w-0 flex-col gap-2 px-1 py-3 sm:flex-row sm:px-4 sm:py-2 data-[state=active]:bg-secondary data-[state=active]:shadow-none">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0" />Роли и права
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          {canViewRoles && (
            <Button variant="ghost" asChild>
              <Link to="/dashboard/custom-roles">Настроить роли<ArrowUpRight aria-hidden="true" className="ml-2 h-5 w-5" /></Link>
            </Button>
          )}
        </div>
        <TabsContent value="employees" className="mt-6">
          <OrganizationTeamDirectory key={revision} scope={scope} canManage renderActions={(member, refresh) => (
            <div className="flex flex-wrap items-center gap-2">
              <OrganizationTeamRoleAction member={member} actorId={actorId} organizationId={organizationId} canAssign={canAssignRoles} onChanged={() => {
                if (member.id === actorId) {
                  void reload();
                } else {
                  refresh();
                }
              }} />
              <OrganizationTeamAccessAction member={member} actorId={actorId} scope={scope} canManage onChanged={refresh} />
              <OrganizationTeamOwnerAction member={member} actorId={actorId} scope={scope} canGrant={canGrantOwner} onChanged={refresh} />
            </div>
          )} />
        </TabsContent>
        <TabsContent value="invitations" className="mt-6"><TeamInvitations key={revision} onInvite={canInvite ? () => setShowInviteModal(true) : undefined} /></TabsContent>
        {canViewRoles && <TabsContent value="roles" className="mt-6"><RolesComparisonTable /></TabsContent>}
      </Tabs>
      {showInviteModal && canAdd && (
        <UserCreateInviteModal isOpen canInvite={canInvite} onClose={() => setShowInviteModal(false)} onSave={() => {
          setShowInviteModal(false);
          setRevision(value => value + 1);
        }} />
      )}
    </div>
  );
}

export default function AdminsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { permissions, isLoaded, isLoading, error, can, hasRole, reload } = usePermissions();
  const organizationId = user?.current_organization_id;
  const contextMatches = Boolean(user && organizationId && permissions.user_id === user.id && permissions.organization_id === organizationId);

  if (authLoading || isLoading || (!isLoaded && !error)) {
    return <p role="status" className="py-10 text-muted-foreground">Загружаем команду…</p>;
  }
  if (!user || !organizationId) {
    return <p className="py-10 text-muted-foreground">Выберите компанию, чтобы открыть её команду.</p>;
  }
  if (error || !contextMatches) {
    return (
      <div role="alert" className="space-y-4 py-10">
        <p>Не удалось подтвердить доступ к команде этой компании.</p>
        <Button variant="outline" onClick={() => void reload()}>Проверить доступ</Button>
      </div>
    );
  }
  if (!can('users.manage')) {
    return <p className="py-10 text-muted-foreground">У вас нет доступа к управлению командой этой компании.</p>;
  }

  const scope = `${user.id}:${organizationId}`;
  return <TeamWorkspace key={scope} scope={scope} actorId={user.id} organizationId={organizationId} canAssignRoles={can('users.assign_roles') && can('roles.view_custom')} canCreate={can('roles.view_custom')} canInvite={can('users.invite') && can('roles.view_custom')} canViewRoles={can('roles.view_custom') || hasRole('organization_owner')} canGrantOwner={can('users.assign_roles') && hasRole('organization_owner')} />;
}
