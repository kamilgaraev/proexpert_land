import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Clock3, Inbox, Loader2, MailOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  projectParticipantInvitationsApi,
  type IncomingProjectInvitation,
  type IncomingProjectInvitationsResponse,
} from '@/utils/projectParticipantInvitationsApi';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' });
const formatDate = (value: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

const statuses: Record<IncomingProjectInvitation['status'], string> = {
  pending: 'Ожидает принятия',
  accepted: 'Принято',
  expired: 'Срок истёк',
  cancelled: 'Отозвано',
  declined: 'Отклонено',
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response;
    if (response && typeof response === 'object' && 'status' in response && response.status === 403) {
      return 'Входящие приглашения доступны владельцу организации.';
    }
  }
  return 'Не удалось загрузить приглашения. Попробуйте ещё раз.';
};

function IncomingInvitationsList() {
  const [items, setItems] = useState<IncomingProjectInvitation[]>([]);
  const [meta, setMeta] = useState<IncomingProjectInvitationsResponse['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    setItems([]);
    setMeta(null);

    const load = async () => {
      try {
        const response = await projectParticipantInvitationsApi.listIncoming(page, controller.signal);
        if (controller.signal.aborted) return;
        if (!response.success || !Array.isArray(response.data) || !response.meta) {
          throw new Error('Invalid incoming invitations response');
        }
        setItems(response.data);
        setMeta(response.meta);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [page, attempt]);

  return (
    <section className="space-y-6" aria-labelledby="project-invitations-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <MailOpen className="h-4 w-4" aria-hidden="true" />Входящие
          </div>
          <h1 id="project-invitations-title" className="text-2xl font-bold tracking-tight sm:text-3xl">Приглашения в проекты</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Приглашения вашей организации от заказчиков и партнёров. Откройте приглашение, чтобы проверить проект и подтвердить участие.
          </p>
        </div>
        <Button variant="outline" onClick={() => setAttempt(value => value + 1)} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Обновить
        </Button>
      </header>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 rounded-xl border bg-card p-8 text-muted-foreground" role="status">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Загружаем приглашения…
        </div>
      ) : error ? (
        <div className="space-y-4 rounded-xl border border-destructive/30 bg-card p-6">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Попробовать снова</Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <div className="rounded-xl bg-muted p-3"><Inbox className="h-7 w-7 text-muted-foreground" aria-hidden="true" /></div>
          <h2 className="text-lg font-semibold">Пока нет приглашений</h2>
          <p className="max-w-md text-sm text-muted-foreground">Когда заказчик или партнёр пригласит вашу организацию в проект, приглашение появится здесь.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Всего приглашений: {meta?.total}</p>
          <ul className="space-y-4">
            {items.map(invitation => (
              <li key={invitation.id}>
                <article className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                    <h2 className="min-w-0 break-words text-lg font-semibold leading-snug">{invitation.project.name}</h2>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${invitation.can_accept ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {statuses[invitation.status] ?? 'Недоступно'}
                    </span>
                  </div>
                  <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <dt className="mb-1 flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" aria-hidden="true" />Приглашает</dt>
                      <dd className="font-medium">{invitation.inviting_organization?.name ?? 'Отправитель не указан'}</dd>
                    </div>
                    <div><dt className="mb-1 text-muted-foreground">Роль вашей организации</dt><dd className="font-medium">{invitation.role.name}</dd></div>
                    <div>
                      <dt className="mb-1 flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" aria-hidden="true" />Действует до</dt>
                      <dd>{formatDate(invitation.expires_at)}</dd>
                    </div>
                  </dl>
                  {invitation.message ? <p className="whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-4 text-sm">{invitation.message}</p> : null}
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">Получено {formatDate(invitation.created_at)}</p>
                    {invitation.can_accept && invitation.invitation_path ? (
                      <Button asChild className="w-full sm:w-auto"><Link to={invitation.invitation_path}>Открыть приглашение<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
                    ) : invitation.status === 'accepted' ? (
                      <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/dashboard/projects">Перейти к проектам<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meta && meta.last_page > 1 ? (
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Страницы приглашений">
          <p className="text-sm text-muted-foreground">Страница {meta.current_page} из {meta.last_page}</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={isLoading || page <= 1} onClick={() => setPage(value => value - 1)}>Назад</Button>
            <Button variant="outline" disabled={isLoading || page >= meta.last_page} onClick={() => setPage(value => value + 1)}>Далее</Button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}

export default function ProjectInvitationsPage() {
  const { user } = useAuth();
  return <IncomingInvitationsList key={`${user?.id}:${user?.current_organization_id ?? 'current'}`} />;
}
