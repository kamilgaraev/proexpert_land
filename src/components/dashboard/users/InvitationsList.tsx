import { useRef, useState } from 'react';
import { Check, Clock, Loader2, Send, X } from 'lucide-react';
import type { UserInvitation } from '@/hooks/useUserManagement';
import { useHasPermission } from '@/hooks/usePermissions';
import { userManagementService } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvitationsListProps {
  invitations: UserInvitation[];
  loading: boolean;
  onRefresh: () => void | Promise<void>;
  onInvite: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает ответа',
  accepted: 'Принято',
  expired: 'Срок истёк',
  cancelled: 'Отменено',
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Не указан' : date.toLocaleDateString('ru-RU');
};

const InvitationsList = ({ invitations, loading, onRefresh, onInvite }: InvitationsListProps) => {
  const canInvite = useHasPermission('users.invite');
  const [candidate, setCandidate] = useState<UserInvitation | null>(null);
  const [pending, setPending] = useState<{ id: number; action: 'resend' | 'cancel' } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<number[]>([]);
  const busy = useRef(false);

  const performAction = async (invitation: UserInvitation, action: 'resend' | 'cancel') => {
    if (!canInvite || busy.current || invitation.status !== 'pending' || cancelledIds.includes(invitation.id)) return;
    busy.current = true;
    setPending({ id: invitation.id, action });
    setError(null);
    setNotice(null);
    try {
      const response = action === 'resend'
        ? await userManagementService.resendInvitation(invitation.id)
        : await userManagementService.cancelInvitation(invitation.id);
      if (!response.data.success) throw new Error('request_failed');
      if (action === 'cancel') {
        setCancelledIds(ids => [...ids, invitation.id]);
        setCandidate(null);
      }
      setNotice(action === 'resend' ? 'Приглашение отправлено повторно.' : 'Приглашение отменено. Ссылка больше не действует.');
      try {
        await onRefresh();
      } catch {
        setError('Действие выполнено, но обновить список не удалось. Обновите страницу.');
      }
    } catch {
      setError(action === 'resend'
        ? 'Не удалось повторно отправить приглашение. Попробуйте ещё раз.'
        : 'Не удалось отменить приглашение. Попробуйте ещё раз.');
    } finally {
      busy.current = false;
      setPending(null);
    }
  };

  return (
    <section className="space-y-5" aria-labelledby="team-invitations-title" aria-busy={loading || !!pending}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="team-invitations-title" className="text-xl font-semibold text-foreground">Приглашения</h2>
          <p className="mt-1 text-sm text-muted-foreground">Сотрудники получают ссылку на почту и присоединяются к вашей компании.</p>
        </div>
        {canInvite && <Button type="button" className="w-full shrink-0 sm:w-auto" onClick={onInvite} disabled={!!pending}>
          <Send aria-hidden="true" className="mr-2 h-5 w-5" />Пригласить сотрудника
        </Button>}
      </div>

      {notice && <p role="status" className="rounded border border-border bg-card px-4 py-3 text-sm text-foreground">{notice}</p>}
      {error && !candidate && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {loading && invitations.length === 0 ? (
        <div role="status" className="space-y-3">
          <span className="sr-only">Загружаем приглашения</span>
          {[0, 1, 2].map(index => <div key={index} aria-hidden="true" className="h-24 animate-pulse rounded bg-secondary motion-reduce:animate-none" />)}
        </div>
      ) : invitations.length === 0 ? (
        <div className="rounded border border-border bg-card px-5 py-12 text-center">
          <Send aria-hidden="true" className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Приглашений пока нет</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{canInvite ? 'Пригласите сотрудника, чтобы вместе работать с объектами и документами.' : 'Здесь появятся приглашения, отправленные вашей компанией.'}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded border border-border bg-card">
          {invitations.map(invitation => {
            const status = cancelledIds.includes(invitation.id) ? 'cancelled' : invitation.status;
            const isPending = status === 'pending';
            const StatusIcon = status === 'accepted' ? Check : isPending ? Clock : X;
            return (
              <li key={invitation.id} className="grid min-w-0 gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <p className="break-words font-medium text-foreground">{invitation.name || invitation.email}</p>
                  {invitation.name && <p className="mt-1 break-all text-sm text-muted-foreground">{invitation.email}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {invitation.role_names.map((role, index) => <span key={`${role}-${index}`} className="rounded bg-secondary px-2 py-1 text-xs text-foreground">{role}</span>)}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <StatusIcon aria-hidden="true" className={`h-4 w-4 shrink-0 ${status === 'accepted' ? 'text-emerald-700' : 'text-muted-foreground'}`} />
                    {isPending && invitation.is_expired ? 'Срок ссылки истёк' : statusLabels[status] ?? 'Статус уточняется'}
                  </span>
                  <dl className="space-y-1 text-muted-foreground">
                    <div className="flex flex-wrap gap-x-2"><dt>Срок приглашения:</dt><dd>{formatDate(invitation.expires_at)}</dd></div>
                    <div className="flex flex-wrap gap-x-2"><dt>Пригласил:</dt><dd className="break-words">{invitation.invited_by.name}</dd></div>
                  </dl>
                </div>
                {canInvite && isPending && <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Button type="button" variant="outline" size="sm" disabled={!!pending || loading} onClick={() => void performAction(invitation, 'resend')} aria-label={`Повторить приглашение ${invitation.email}`}>
                    {pending?.id === invitation.id && pending.action === 'resend' ? <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="mr-2 h-4 w-4" />}
                    Повторить
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={!!pending || loading} onClick={() => { setError(null); setCandidate(invitation); }} aria-label={`Отменить приглашение ${invitation.email}`}>Отменить</Button>
                </div>}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!candidate} onOpenChange={open => { if (!open && !busy.current) { setCandidate(null); setError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить приглашение?</DialogTitle>
            <DialogDescription className="break-words">Ссылка для {candidate?.email} перестанет действовать. При необходимости вы сможете пригласить сотрудника снова.</DialogDescription>
          </DialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={!!pending} onClick={() => { setCandidate(null); setError(null); }}>Оставить приглашение</Button>
            <Button type="button" disabled={!!pending || !canInvite} onClick={() => { if (candidate) void performAction(candidate, 'cancel'); }}>
              {pending?.action === 'cancel' ? 'Отменяем…' : 'Отменить приглашение'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InvitationsList;
