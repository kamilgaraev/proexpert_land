import { useState, useCallback, useEffect, useRef } from 'react';
import { billingService, OrganizationBalance, ErrorResponse } from '@utils/api';

interface UseBalanceReturn {
  balance: OrganizationBalance | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  triggerRefresh: () => void;
}

export const useBalance = (): UseBalanceReturn => {
  const [balance, setBalance] = useState<OrganizationBalance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const fetchBalance = useCallback(async (force = false) => {
    if (!force && (loadedRef.current || isLoadingRef.current)) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await billingService.getBalance();
      
      if (response.status === 200) {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          setBalance((response.data as any).data as OrganizationBalance);
          setError(null);
          loadedRef.current = true;
        } else {
          console.error('Неожиданный формат данных баланса:', response.data);
          setError('Ошибка формата баланса');
        }
      } else if (response.status === 500) {
        console.warn('Серверная ошибка при загрузке баланса');
        setError('Временная ошибка сервера');
      } else {
        const errorData = response.data as unknown as ErrorResponse;
        setError(errorData?.message || `Ошибка ${response.status}`);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки баланса:', err);
      setError('Временная ошибка загрузки');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchBalance(true);
  }, [fetchBalance]);

  const triggerRefresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent('balance-refresh-requested'));
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const handleRefreshRequest = () => {
      refresh();
    };

    const handleBalanceUpdated = () => {
      refresh();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'organization_id' || e.key === 'token' || e.key === 'authToken') {
        loadedRef.current = false;
        setBalance(null);
        fetchBalance();
      }
    };

    window.addEventListener('balance-refresh-requested', handleRefreshRequest);
    window.addEventListener('balance-updated', handleBalanceUpdated);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('organization-changed', handleRefreshRequest);
    window.addEventListener('user-login', handleRefreshRequest);
    window.addEventListener('user-logout', () => {
      setBalance(null);
      setError(null);
      loadedRef.current = false;
    });

    return () => {
      window.removeEventListener('balance-refresh-requested', handleRefreshRequest);
      window.removeEventListener('balance-updated', handleBalanceUpdated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('organization-changed', handleRefreshRequest);
      window.removeEventListener('user-login', handleRefreshRequest);
    };
  }, [refresh, fetchBalance]);

  return {
    balance,
    error,
    isLoading,
    refresh,
    triggerRefresh
  };
};

export const dispatchBalanceUpdate = () => {
  window.dispatchEvent(new CustomEvent('balance-updated'));
};
