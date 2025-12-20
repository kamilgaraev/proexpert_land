import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, loading } = useEmailVerification();
  
  const [verificationState, setVerificationState] = useState<{
    status: 'pending' | 'success' | 'error';
    message: string;
  }>({
    status: 'pending',
    message: ''
  });

  useEffect(() => {
    const performVerification = async () => {
      const id = searchParams.get('id');
      const hash = searchParams.get('hash');
      const expires = searchParams.get('expires');
      const signature = searchParams.get('signature');

      if (!id || !hash || !expires || !signature) {
        setVerificationState({
          status: 'error',
          message: 'Неверная ссылка для подтверждения. Убедитесь, что вы перешли по ссылке из письма полностью.'
        });
        return;
      }

      const result = await verifyEmail(id, hash, expires, signature);
      
      setVerificationState({
        status: result.success ? 'success' : 'error',
        message: result.message
      });
    };

    performVerification();
  }, [searchParams, verifyEmail]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (loading || verificationState.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-construction-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Подтверждение email...
            </h2>
            <p className="text-gray-600">
              Пожалуйста, подождите
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
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
          <CardTitle className="text-2xl">
            {verificationState.status === 'success' 
              ? 'Email подтвержден!' 
              : 'Ошибка подтверждения'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <CardDescription className="text-base">
            {verificationState.message}
          </CardDescription>

          {verificationState.status === 'success' ? (
            <div className="space-y-3">
              <Button
                onClick={handleGoToDashboard}
                className="w-full"
                size="lg"
              >
                Перейти в личный кабинет
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-gray-500">
                Теперь у вас есть доступ ко всем функциям платформы ProHelper
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                variant="outline"
                className="w-full"
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

