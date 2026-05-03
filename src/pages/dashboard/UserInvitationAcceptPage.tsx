import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { userManagementService } from '@utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

const getResponseMessage = (error: any): string => {
  return error?.response?.data?.message || error?.message || 'Не удалось обработать приглашение';
};

const UserInvitationAcceptPage = () => {
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

    const loadInvitation = async () => {
      if (!token) {
        setError('Ссылка приглашения недействительна');
        setIsLoading(false);
        return;
      }

      try {
        const response = await userManagementService.getInvitationByToken(token);
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
  }, [token]);

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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff_0%,#fff8f1_46%,#f8fafc_100%)] flex items-center justify-center p-4 lg:p-8">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute bottom-[8%] right-[10%] h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),rgba(255,255,255,0.78)_42%,rgba(248,250,252,0.96)_100%)]" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-xl bg-card border rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-8 lg:p-10">
          <Link to="/" className="inline-flex items-center mb-8 gap-3 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-foreground">ProHelper</span>
          </Link>

          {isLoading && (
            <div className="py-12 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Проверяем приглашение...</p>
            </div>
          )}

          {!isLoading && isAccepted && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
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
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/login')}>
                Перейти ко входу
              </Button>
            </div>
          )}

          {!isLoading && !isAccepted && invitation && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  Приглашение в организацию
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Завершите регистрацию</h1>
                <p className="text-muted-foreground">
                  {invitation.organization_name
                    ? `Вас пригласили присоединиться к организации ${invitation.organization_name}.`
                    : 'Вас пригласили присоединиться к организации в ProHelper.'}
                </p>
              </div>

              <div className="mb-6 rounded-2xl border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{invitation.email}</span>
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
                <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start text-destructive">
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
      </motion.div>
    </div>
  );
};

export default UserInvitationAcceptPage;
