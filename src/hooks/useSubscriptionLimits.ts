import { useState, useEffect, useCallback } from 'react';
import { billingService, SubscriptionLimitsResponse, SubscriptionWarning, ErrorResponse } from '@utils/api';
import NotificationService from '@components/shared/NotificationService';

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

  const fetchLimits = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await billingService.getSubscriptionLimits();

      if (response.status === 200) {
        const data = response.data as SubscriptionLimitsResponse;

        // Вызываем колбэки для предупреждений
        if (data.warnings?.length > 0) {
          const criticalWarnings = data.warnings.filter(w => w.level === 'critical');
          const normalWarnings = data.warnings.filter(w => w.level === 'warning');

          if (criticalWarnings.length > 0) {
            if (onCritical) {
              onCritical(criticalWarnings);
            }
            // Показываем критические уведомления
            NotificationService.showCriticalLimitsAlert(criticalWarnings);
          }
          
          if (normalWarnings.length > 0) {
            if (onWarning) {
              onWarning(normalWarnings);
            }
            // Показываем обычные предупреждения (первое)
            if (normalWarnings[0]) {
              NotificationService.showLimitNotification(normalWarnings[0]);
            }
          }
        }

        setState({
          data,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } else {
        const errorData = response.data as ErrorResponse;
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorData?.message || `Ошибка ${response.status}`
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Не удалось загрузить лимиты подписки'
      }));
    }
  }, [onWarning, onCritical]);

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
    setState(prev => ({ ...prev, loading: true }));
    fetchLimits();
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