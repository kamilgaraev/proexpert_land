import { Mail, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email?: string;
  onClose?: () => void;
}

export const EmailVerificationModal = ({ 
  isOpen, 
  email,
  onClose 
}: EmailVerificationModalProps) => {
  const {
    canResend,
    resendCooldown,
    resendVerificationEmail,
    loading
  } = useEmailVerification();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
              <Mail className="w-12 h-12 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            Подтвердите ваш email
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Для входа в систему необходимо подтвердить email адрес
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 mb-2">
              Мы отправили письмо с подтверждением на адрес:
            </p>
            {email && (
              <p className="font-semibold text-blue-900">
                {email}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Не видите письмо?</strong> Проверьте папку "Спам" или "Промоакции". 
              Письмо должно прийти в течение нескольких минут.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={resendVerificationEmail}
              disabled={!canResend || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : !canResend ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Повторить через {resendCooldown}с
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Отправить письмо повторно
                </>
              )}
            </Button>

            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Закрыть
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

