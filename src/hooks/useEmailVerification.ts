import { useState, useCallback, useEffect } from 'react';
import { authService } from '@/utils/api';
import { toast } from 'react-toastify';

interface EmailVerificationState {
  isVerified: boolean | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  canResend: boolean;
  resendCooldown: number;
}

interface UseEmailVerificationReturn extends EmailVerificationState {
  checkVerificationStatus: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  verifyEmail: (id: string, hash: string, expires: string, signature: string) => Promise<{ success: boolean; message: string }>;
}

const RESEND_COOLDOWN_SECONDS = 60;
const COOLDOWN_STORAGE_KEY = 'email_verification_cooldown';

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [state, setState] = useState<EmailVerificationState>({
    isVerified: null,
    email: null,
    loading: false,
    error: null,
    canResend: true,
    resendCooldown: 0
  });

  const checkCooldown = useCallback(() => {
    try {
      const cooldownEnd = localStorage.getItem(COOLDOWN_STORAGE_KEY);
      if (cooldownEnd) {
        const endTime = parseInt(cooldownEnd, 10);
        const now = Date.now();
        if (now < endTime) {
          const remainingSeconds = Math.ceil((endTime - now) / 1000);
          setState(prev => ({ ...prev, canResend: false, resendCooldown: remainingSeconds }));
          return remainingSeconds;
        } else {
          localStorage.removeItem(COOLDOWN_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Ошибка проверки cooldown:', error);
    }
    return 0;
  }, []);

  useEffect(() => {
    const remaining = checkCooldown();
    if (remaining > 0) {
      const interval = setInterval(() => {
        const newRemaining = checkCooldown();
        if (newRemaining <= 0) {
          setState(prev => ({ ...prev, canResend: true, resendCooldown: 0 }));
          clearInterval(interval);
        } else {
          setState(prev => ({ ...prev, resendCooldown: newRemaining }));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [checkCooldown]);

  const checkVerificationStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authService.checkEmailVerification();
      
      if (response.data && response.data.success) {
        setState(prev => ({
          ...prev,
          isVerified: response.data.verified,
          email: response.data.email,
          loading: false
        }));
      } else {
        throw new Error(response.data?.message || 'Ошибка проверки статуса верификации');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка проверки статуса верификации';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      console.error('Ошибка проверки статуса верификации:', error);
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!state.canResend) {
      toast.warning(`Подождите ${state.resendCooldown} сек. перед повторной отправкой`);
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authService.resendVerificationEmail();
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Письмо успешно отправлено!');
        
        const cooldownEnd = Date.now() + (RESEND_COOLDOWN_SECONDS * 1000);
        localStorage.setItem(COOLDOWN_STORAGE_KEY, cooldownEnd.toString());
        
        setState(prev => ({
          ...prev,
          loading: false,
          canResend: false,
          resendCooldown: RESEND_COOLDOWN_SECONDS
        }));
      } else {
        throw new Error(response.data?.message || 'Ошибка отправки письма');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка отправки письма';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      console.error('Ошибка отправки письма верификации:', error);
    }
  }, [state.canResend, state.resendCooldown]);

  const verifyEmail = useCallback(async (
    id: string, 
    hash: string, 
    expires: string, 
    signature: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await authService.verifyEmail(id, hash, expires, signature);
      
      setState(prev => ({ ...prev, loading: false }));
      
      if (response.data && response.data.success) {
        setState(prev => ({ ...prev, isVerified: true }));
        return {
          success: true,
          message: response.data.message || 'Email успешно подтвержден!'
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Ссылка недействительна или истекла'
        };
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false }));
      const errorMessage = error.message || 'Ошибка верификации email';
      return {
        success: false,
        message: errorMessage
      };
    }
  }, []);

  return {
    ...state,
    checkVerificationStatus,
    resendVerificationEmail,
    verifyEmail
  };
};

