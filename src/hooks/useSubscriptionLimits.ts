import { useState, useEffect, useCallback, useRef } from 'react';
import { billingService, SubscriptionLimitsResponse, SubscriptionWarning, ErrorResponse } from '@utils/api';

interface UseSubscriptionLimitsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onWarning?: (warnings: SubscriptionWarning[]) => void;
  onCritical?: (warnings: SubscriptionWarning[]) => void;
}

interface UseSubscriptionLimitsState {
  data: SubscriptionLimitsResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseSubscriptionLimitsReturn extends UseSubscriptionLimitsState {
  refresh: () => void;
  hasSubscription: boolean;
  needsUpgrade: boolean;
  hasWarnings: boolean;
  criticalWarnings: SubscriptionWarning[];
  normalWarnings: SubscriptionWarning[];
}

export const useSubscriptionLimits = (options: UseSubscriptionLimitsOptions = {}): UseSubscriptionLimitsReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 минут
    onWarning = null,
    onCritical = null
  } = options;

  const [state, setState] = useState<UseSubscriptionLimitsState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Используем ref'ы для колбэков, чтобы избежать лишних перерендеров
  const onWarningRef = useRef(onWarning);
  const onCriticalRef = useRef(onCritical);
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    onWarningRef.current = onWarning;
    onCriticalRef.current = onCritical;
  });

  const fetchLimits = useCallback(async () => {
    if (isLoadingRef.current) {
      return; // Предотвращаем множественные запросы
    }
    
    try {
      isLoadingRef.current = true;
      setState(prev => ({ ...prev, error: null }));
      
      const response = await billingService.getSubscriptionLimits();

      if (response.status === 200) {
        const data = response.data as SubscriptionLimitsResponse;

        setState({
          data,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
        isLoadingRef.current = false;

        // Вызываем колбэки для предупреждений только если они переданы
        if (data.warnings?.length > 0) {
          const criticalWarnings = data.warnings.filter(w => w.level === 'critical');
          const normalWarnings = data.warnings.filter(w => w.level === 'warning');

          if (criticalWarnings.length > 0 && onCriticalRef.current) {
            onCriticalRef.current(criticalWarnings);
          }
          
          if (normalWarnings.length > 0 && onWarningRef.current) {
            onWarningRef.current(normalWarnings);
          }
        }
      } else {
        const errorData = response.data as ErrorResponse;
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorData?.message || `Ошибка ${response.status}`
        }));
        isLoadingRef.current = false;
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Не удалось загрузить лимиты подписки'
      }));
      isLoadingRef.current = false;
    }
  }, []);

  // Первоначальная загрузка
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  // Автообновление
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchLimits, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchLimits]);

  const refresh = useCallback(() => {
    if (!isLoadingRef.current) {
      setState(prev => ({ ...prev, loading: true }));
      fetchLimits();
    }
  }, [fetchLimits]);

  // Вспомогательные геттеры
  const hasSubscription = state.data?.has_subscription || false;
  const needsUpgrade = state.data?.upgrade_required || false;
  const hasWarnings = (state.data?.warnings?.length ?? 0) > 0;
  const criticalWarnings = state.data?.warnings?.filter(w => w.level === 'critical') || [];
  const normalWarnings = state.data?.warnings?.filter(w => w.level === 'warning') || [];

  return {
    ...state,
    refresh,
    hasSubscription,
    needsUpgrade,
    hasWarnings,
    criticalWarnings,
    normalWarnings
  };
}; 