import { useEffect } from 'react';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { Mail, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
}

export const EmailVerificationBanner = ({ onDismiss }: EmailVerificationBannerProps) => {
  const {
    isVerified,
    email,
    loading,
    canResend,
    resendCooldown,
    checkVerificationStatus,
    resendVerificationEmail
  } = useEmailVerification();

  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  if (loading && isVerified === null) {
    return null;
  }

  if (isVerified === true) {
    return null;
  }

  if (isVerified === false) {
    return (
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Email не подтвержден
                </p>
                <p className="text-sm text-yellow-700">
                  Мы отправили письмо на <span className="font-semibold">{email}</span>. 
                  Подтвердите email для доступа ко всем функциям.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={resendVerificationEmail}
                disabled={!canResend || loading}
                size="sm"
                variant="outline"
                className="bg-white hover:bg-yellow-50 text-yellow-800 border-yellow-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : !canResend ? (
                  `Повторить через ${resendCooldown}с`
                ) : (
                  'Отправить письмо повторно'
                )}
              </Button>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

