import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Lock, Mail, ShieldCheck } from 'lucide-react';
import '@/styles/auth.css';
import { userManagementService } from '@utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePageTitle } from '@/hooks/useSEO';

type InvitationDetails = {
  email: string;
  name: string;
  organization_name?: string | null;
  role_names?: string[];
  can_be_accepted: boolean;
  is_expired: boolean;
};

const getResponseData = (payload: any): InvitationDetails | null => {
  return payload?.data?.data ?? payload?.data ?? null;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object' || !('response' in error)) return undefined;
  const response = error.response;
  if (!response || typeof response !== 'object' || !('status' in response)) return undefined;
  return typeof response.status === 'number' ? response.status : undefined;
};

const getResponseMessage = (error: unknown): string => {
  const status = getErrorStatus(error);
  if (status === 404 || status === 410) return 'Приглашение недействительно или срок его действия истёк. Попросите коллегу отправить новое приглашение.';
  if (status === 422) return 'Не удалось принять приглашение. Проверьте введённые данные. Если они верны, попросите коллегу проверить приглашение и при необходимости отправить новое.';
  if (status === 429) return 'Слишком много попыток. Подождите немного и попробуйте снова.';
  return 'Не удалось связаться с сервисом. Проверьте подключение и попробуйте снова.';
};

const UserInvitationAcceptPage = () => {
  usePageTitle('Приглашение в команду — МОСТ');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [canRetry, setCanRetry] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setInvitation(null);
    setError('');
    setIsAccepted(false);
    setCanRetry(false);
    setPassword('');
    setPasswordConfirmation('');

    const loadInvitation = async () => {
      if (!token) {
        setError('Ссылка приглашения недействительна');
        setIsLoading(false);
        return;
      }

      try {
        const response = await userManagementService.getInvitationByToken(token);
        if (!isMounted) return;
        const details = getResponseData(response);

        if (!details || !details.can_be_accepted || details.is_expired) {
          setError('Приглашение уже использовано или срок действия истек');
          return;
        }

        if (isMounted) {
          setInvitation(details);
        }
      } catch (err) {
        if (isMounted) {
          setError(getResponseMessage(err));
          setCanRetry(![404, 410].includes(getErrorStatus(err) ?? 0));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInvitation();

    return () => {
      isMounted = false;
    };
  }, [token, loadAttempt]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Пароли не совпадают');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await userManagementService.acceptInvitation(token, password, passwordConfirmation);
      setIsAccepted(true);
    } catch (err) {
      setError(getResponseMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="most-workspace most-auth-page bg-background">
      <div className="most-auth-shell">
        <div className="most-auth-content">
          <Link to="/" className="inline-flex items-center mb-8 gap-3 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-foreground">МОСТ</span>
          </Link>

          {isLoading && (
            <div role="status" className="py-12 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Проверяем приглашение...</p>
            </div>
          )}

          {!isLoading && isAccepted && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted text-foreground flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Приглашение принято</h1>
                <p className="text-muted-foreground">
                  Теперь можно войти в личный кабинет с указанным email и новым паролем.
                </p>
              </div>
              <Button className="w-full h-12 text-base" onClick={() => navigate('/login')}>
                Перейти ко входу
              </Button>
            </div>
          )}

          {!isLoading && !isAccepted && error && !invitation && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Не удалось открыть приглашение</h1>
                <p role="alert" className="text-muted-foreground">{error}</p>
              </div>
              {canRetry && (
                <Button className="w-full" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                  Попробовать снова
                </Button>
              )}
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/login')}>
                Перейти ко входу
              </Button>
            </div>
          )}

          {!isLoading && !isAccepted && invitation && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  Приглашение в организацию
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Завершите регистрацию</h1>
                <p className="text-muted-foreground">
                  {invitation.organization_name
                    ? `Вас пригласили присоединиться к организации ${invitation.organization_name}.`
                    : 'Вас пригласили присоединиться к организации в МОСТ.'}
                </p>
              </div>

              <div className="mb-6 rounded border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="min-w-0 break-all font-medium">{invitation.email}</span>
                </div>
                {invitation.role_names && invitation.role_names.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {invitation.role_names.map((role) => (
                      <span key={role} className="rounded-full bg-white border px-3 py-1 text-xs font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div role="alert" className="mb-6 border border-destructive/30 rounded p-4 flex gap-3 items-start text-destructive">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className="pl-10 h-12 text-base"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Повторите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password_confirmation"
                      type="password"
                      autoComplete="new-password"
                      className="pl-10 h-12 text-base"
                      value={passwordConfirmation}
                      onChange={(event) => setPasswordConfirmation(event.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Принимаем приглашение...' : 'Принять приглашение'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default UserInvitationAcceptPage;
