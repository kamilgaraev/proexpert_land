import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import '@/styles/auth.css';

const createEmailHash = async (email: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(email));

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const hashParam = searchParams.get('hash');
  const expiresParam = searchParams.get('expires');
  const signatureParam = searchParams.get('signature');
  const { verifyEmail, loading } = useEmailVerification();
  const { user, isLoading: isAuthLoading, fetchUser } = useAuth();
  const processedVerificationKeyRef = useRef<string | null>(null);
  
  const [verificationState, setVerificationState] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
  }>({
    status: 'pending',
    message: ''
  });

  useEffect(() => {
    const performVerification = async () => {
      let id = idParam;
      let hash = hashParam;
      const expires = expiresParam;
      const signature = signatureParam;
      const verificationKey = [
        id || `user:${user?.id ?? ''}`,
        hash || `email:${user?.email ?? ''}`,
        expires || '',
        signature || '',
      ].join('|');

      if (processedVerificationKeyRef.current === verificationKey) {
        return;
      }

      processedVerificationKeyRef.current = verificationKey;

      if ((!id || !hash) && user?.id && user.email) {
        id = String(user.id);
        hash = await createEmailHash(user.email);
      }

      if (!id || !hash || !expires || !signature) {
        setVerificationState({
          status: 'error',
          message: 'Неверная ссылка для подтверждения. Убедитесь, что вы перешли по ссылке из письма полностью.'
        });
        return;
      }

      const result = await verifyEmail(id, hash, expires, signature);

      if (result.success) {
        await Promise.resolve(fetchUser()).catch(() => undefined);
      }
      
      setVerificationState({
        status: result.success ? 'success' : 'error',
        message: result.message
      });
    };

    if (!isAuthLoading) {
      performVerification();
    }
  }, [
    expiresParam,
    fetchUser,
    hashParam,
    idParam,
    isAuthLoading,
    signatureParam,
    user?.email,
    user?.id,
    verifyEmail,
  ]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (isAuthLoading || loading || verificationState.status === 'pending') {
    return (
      <div className="most-workspace most-auth-page">
        <Card className="most-auth-shell most-auth-content shadow-none">
          <CardContent className="p-0 text-center" role="status" aria-live="polite">
            <Loader2 className="w-16 h-16 text-construction-600 animate-spin mx-auto mb-4" />
            <h1 className="font-bold text-foreground mb-2">
              Подтверждение email...
            </h1>
            <p className="text-gray-600">
              Пожалуйста, подождите
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="most-workspace most-auth-page">
      <Card className="most-auth-shell most-auth-content shadow-none">
        <CardHeader className="text-center p-0 pb-5">
          <div className="mx-auto mb-4">
            {verificationState.status === 'success' ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>
          <h1 className="font-bold">
            {verificationState.status === 'success' 
              ? 'Email подтвержден!' 
              : 'Ошибка подтверждения'
            }
          </h1>
        </CardHeader>
        <CardContent className="p-0 text-center space-y-6" role={verificationState.status === 'error' ? 'alert' : 'status'}>
          <CardDescription className="text-base">
            {verificationState.message}
          </CardDescription>

          {verificationState.status === 'success' ? (
            <div className="space-y-3">
              <Button
                onClick={handleGoToDashboard}
                className="w-full min-h-12"
                size="lg"
              >
                Перейти в личный кабинет
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500">
                Почта подтверждена. В кабинете доступны разделы вашей компании с учётом вашей роли.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                variant="outline"
                className="w-full min-h-12"
                size="lg"
              >
                Перейти на страницу входа
              </Button>
              <p className="text-sm text-gray-500">
                Если у вас возникли проблемы, свяжитесь с поддержкой
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;

