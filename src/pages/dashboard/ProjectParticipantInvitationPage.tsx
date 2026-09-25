import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, Clock3, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/useSEO';
import {
  projectParticipantInvitationsApi,
  type AcceptedProjectParticipantInvitation,
  type ProjectParticipantInvitation,
} from '@/utils/projectParticipantInvitationsApi';
import { clearProjectInvitationReturnPath, getProjectParticipantInvitationPath, storeProjectInvitationReturnPath } from '@/utils/projectParticipantInvitationReturn';
import '@/styles/auth.css';

const getErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined;
  const response = error.response;
  if (!response || typeof response !== 'object' || !('status' in response)) return undefined;
  return typeof response.status === 'number' ? response.status : undefined;
};

const getInvitationError = (error: unknown): string => {
  const status = getErrorStatus(error);
  if (status === 404 || status === 410) return 'Приглашение недействительно или срок его действия истёк. Попросите отправителя прислать новую ссылку.';
  if (status === 401) return 'Войдите в личный кабинет, чтобы принять приглашение.';
  if (status === 403) return 'У вашей учётной записи нет прав принять это приглашение. Войдите под владельцем организации.';
  if (status === 409) return 'Приглашение не подходит для текущей организации. Проверьте выбранную организацию или обратитесь к отправителю.';
  return 'Не удалось загрузить приглашение. Проверьте подключение и попробуйте ещё раз.';
};

const projectRoleLabels: Record<string, string> = {
  owner: 'Владелец проекта',
  customer: 'Заказчик',
  general_contractor: 'Генподрядчик',
  contractor: 'Подрядчик',
  subcontractor: 'Субподрядчик',
  construction_supervision: 'Стройконтроль',
  designer: 'Проектировщик',
  observer: 'Наблюдатель',
  parent_administrator: 'Администратор холдинга',
};

const getRoleName = (role: ProjectParticipantInvitation['role']): string => {
  const value = typeof role === 'string' ? role : role?.name;
  return projectRoleLabels[value] ?? value ?? 'Участник проекта';
};

const formatDate = (value: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(date);
};

const ProjectParticipantInvitationPage = () => {
  const { token = '' } = useParams<{ token: string }>();
  const activeTokenRef = useRef(token);
  activeTokenRef.current = token;
  const requestGenerationRef = useRef(0);
  const navigate = useNavigate();
  const invitationPath = useMemo(() => getProjectParticipantInvitationPath(token), [token]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [invitation, setInvitation] = useState<ProjectParticipantInvitation | null>(null);
  const [accepted, setAccepted] = useState<AcceptedProjectParticipantInvitation | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptErrorStatus, setAcceptErrorStatus] = useState<number | undefined>();
  const [attempt, setAttempt] = useState(0);
  const hasCurrentTokenData = loadedToken === token;
  const currentInvitation = hasCurrentTokenData ? invitation : null;
  const currentAccepted = hasCurrentTokenData ? accepted : null;
  const currentError = hasCurrentTokenData ? error : '';
  const pageIsLoading = isLoading || !hasCurrentTokenData;

  usePageTitle('Приглашение в проект — МОСТ');

  const loadInvitation = useCallback(async () => {
    const requestToken = token;
    const generation = ++requestGenerationRef.current;
    setIsLoading(true);
    setLoadedToken(null);
    setError('');
    setInvitation(null);
    setAccepted(null);
    setIsAccepting(false);
    setAcceptErrorStatus(undefined);
    try {
      const response = await projectParticipantInvitationsApi.getByToken(requestToken);
      if (generation !== requestGenerationRef.current || requestToken !== activeTokenRef.current) return;
      if (!response.success || !response.data) throw new Error('Invalid invitation response');
      setInvitation(response.data);
      setLoadedToken(requestToken);
    } catch (loadError) {
      if (generation !== requestGenerationRef.current || requestToken !== activeTokenRef.current) return;
      setInvitation(null);
      setError(getInvitationError(loadError));
      setLoadedToken(requestToken);
    } finally {
      if (generation === requestGenerationRef.current && requestToken === activeTokenRef.current) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) void loadInvitation();
    else {
      setError('Ссылка приглашения не содержит токен.');
      setIsLoading(false);
    }
    return () => {
      requestGenerationRef.current += 1;
    };
  }, [loadInvitation, token, attempt]);

  const acceptInvitation = async () => {
    const requestToken = token;
    const generation = requestGenerationRef.current;
    setError('');
    setAcceptErrorStatus(undefined);
    setIsAccepting(true);
    storeProjectInvitationReturnPath(invitationPath);
    try {
      const response = await projectParticipantInvitationsApi.accept(requestToken);
      if (generation !== requestGenerationRef.current || requestToken !== activeTokenRef.current) return;
      if (!response.success || !response.data) throw new Error('Invalid acceptance response');
      clearProjectInvitationReturnPath();
      setAccepted(response.data);
      setInvitation((current) => current ? { ...current, status: response.data.invitation.status, can_accept: false } : current);
    } catch (acceptError) {
      if (generation !== requestGenerationRef.current || requestToken !== activeTokenRef.current) return;
      setAcceptErrorStatus(getErrorStatus(acceptError));
      setError(getInvitationError(acceptError));
    } finally {
      if (generation === requestGenerationRef.current && requestToken === activeTokenRef.current) {
        setIsAccepting(false);
      }
    }
  };

  const registerHref = `/register?next=${encodeURIComponent(invitationPath)}`;
  const handleLogin = () => navigate('/login', { state: { from: { pathname: invitationPath } } });

  return (
    <main className="most-workspace most-auth-page bg-background">
      <section className="most-auth-shell most-auth-content" aria-labelledby="project-invitation-title">
        <Link to="/" className="mb-8 inline-flex min-h-11 items-center gap-3 font-bold text-2xl">
          <img src="/logo.svg" alt="" className="h-10 w-10" />МОСТ
        </Link>

        {pageIsLoading || authLoading ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center" role="status">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden="true" />
            <p className="text-muted-foreground">Проверяем приглашение…</p>
          </div>
        ) : currentAccepted ? (
          <div className="space-y-6 py-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-700" aria-hidden="true" />
            <div>
              <h1 id="project-invitation-title" className="mb-3 text-3xl font-bold">Организация добавлена в проект</h1>
              <p className="text-muted-foreground">{currentAccepted.organization.name} теперь участвует в проекте «{currentAccepted.project.name}».</p>
            </div>
            <Button className="h-12 w-full" onClick={() => navigate('/dashboard/projects')}>
              Перейти к проектам<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        ) : currentError && !currentInvitation ? (
          <div className="space-y-6 py-6 text-center">
            <AlertTriangle className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
            <div>
              <h1 id="project-invitation-title" className="mb-3 text-3xl font-bold">Приглашение недоступно</h1>
              <p role="alert" className="text-muted-foreground">{currentError}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setAttempt((value) => value + 1)}>Проверить ещё раз</Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>Перейти ко входу</Button>
          </div>
        ) : currentInvitation ? (
          <div className="space-y-6">
            {currentAccepted || currentInvitation.status.toLowerCase() === 'accepted' ? (
              <div className="space-y-6 py-6 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-700" aria-hidden="true" />
                <div>
                  <h1 id="project-invitation-title" className="mb-3 text-3xl font-bold">Приглашение уже принято</h1>
                  <p className="text-muted-foreground">Организация участвует в проекте «{currentInvitation.project.name}».</p>
                </div>
                <Button className="h-12 w-full" onClick={() => navigate('/dashboard/projects')}>Перейти к проектам<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Button>
              </div>
            ) : !currentInvitation.can_accept ? (
              <div className="space-y-6 py-6 text-center">
                <AlertTriangle className="mx-auto h-14 w-14 text-muted-foreground" aria-hidden="true" />
                <div>
                  <h1 id="project-invitation-title" className="mb-3 text-3xl font-bold">Приглашение больше недоступно</h1>
                  <p className="text-muted-foreground">
                    {currentInvitation.status === 'expired' ? 'Срок действия ссылки истёк.' : 'Отправитель уже отозвал приглашение или изменил его статус.'}
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Перейти ко входу</Button>
              </div>
            ) : (
              <>
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />Приглашение организации в проект
                  </div>
                  <h1 id="project-invitation-title" className="mb-3 text-3xl font-bold">{currentInvitation.project.name}</h1>
                  <p className="text-muted-foreground">Ваша организация приглашена участвовать в проекте.</p>
                </div>

                <div className="space-y-4 rounded border bg-muted/30 p-4">
                  {currentInvitation.invited_organization && (
                    <div className="flex items-start gap-3 text-sm">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span><span className="text-muted-foreground">Приглашённая организация: </span><strong>{currentInvitation.invited_organization.name}</strong></span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 text-sm">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span><span className="text-muted-foreground">Роль в проекте: </span><strong>{getRoleName(currentInvitation.role)}</strong></span>
                  </div>
                  {formatDate(currentInvitation.expires_at) && (
                    <div className="flex items-start gap-3 text-sm">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span><span className="text-muted-foreground">Действует до: </span>{formatDate(currentInvitation.expires_at)}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="space-y-3 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <p role="alert">{error}</p>
                    {acceptErrorStatus === 409 && (
                      <div className="space-y-2">
                        <p>Если у вас несколько организаций, откройте личный кабинет, смените организацию кнопкой «Сменить организацию» и вернитесь к этому приглашению.</p>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>Открыть личный кабинет</Button>
                      </div>
                    )}
                  </div>
                )}

                {isAuthenticated ? currentInvitation.can_accept ? (
                  <Button className="h-12 w-full" onClick={() => void acceptInvitation()} disabled={isAccepting}>
                    {isAccepting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Принимаем приглашение…</> : <>Принять приглашение<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></>}
                  </Button>
                ) : (
                  <div className="rounded border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Это приглашение сейчас нельзя принять. Проверьте его статус или обратитесь к отправителю.
                  </div>
                ) : currentInvitation.next_action === 'register' ? (
                  <div className="space-y-3">
                    <Button asChild className="h-12 w-full"><Link to={registerHref}>Создать организацию и аккаунт<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link></Button>
                    <Button variant="outline" className="h-12 w-full" onClick={handleLogin}>Уже есть аккаунт? Войти</Button>
                    <p className="text-center text-sm text-muted-foreground">Вы станете владельцем своей организации. Роль в проекте не заменяет роль в организации; модули и пользователей вы настроите в личном кабинете.</p>
                  </div>
                ) : currentInvitation.next_action === 'login' ? (
                  <div className="space-y-3">
                    <Button className="h-12 w-full" onClick={handleLogin}>Войти и продолжить<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Button>
                    <p className="text-center text-sm text-muted-foreground">Приглашение отправлено в организацию {currentInvitation.invited_organization?.name ?? 'МОСТ'}. Войдите под учётной записью владельца этой организации.</p>
                  </div>
                ) : (
                  <div className="rounded border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Для этого приглашения нужно войти в личный кабинет или запросить новую ссылку у отправителя.
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default ProjectParticipantInvitationPage;
