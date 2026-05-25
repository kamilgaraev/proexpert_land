import { useState, useEffect, useCallback, useRef } from 'react';
import { billingService, SubscriptionLimitsResponse, SubscriptionWarning, ErrorResponse } from '@utils/api';

interface UseSubscriptionLimitsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
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

type RecordLike = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordLike => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const unwrapLimitsPayload = (payload: unknown): unknown => {
  if (isRecord(payload) && isRecord(payload.data) && isRecord(payload.data.data)) {
    return payload.data.data;
  }

  if (isRecord(payload) && payload.data !== undefined) {
    return payload.data;
  }

  return payload;
};

const emptyLimit = {
  limit: 0,
  used: 0,
  remaining: 0,
  percentage_used: 0,
  is_unlimited: false,
  status: 'normal' as const,
};

const emptyStorageLimit = {
  limit_gb: 0,
  used_gb: 0,
  remaining_gb: 0,
  percentage_used: 0,
  is_unlimited: false,
  status: 'normal' as const,
};

const normalizeLimitItem = (value: unknown): SubscriptionLimitsResponse['limits']['users'] => ({
  ...emptyLimit,
  ...(isRecord(value) ? value : {}),
} as SubscriptionLimitsResponse['limits']['users']);

const normalizeStorageLimitItem = (value: unknown): SubscriptionLimitsResponse['limits']['storage'] => ({
  ...emptyStorageLimit,
  ...(isRecord(value) ? value : {}),
} as SubscriptionLimitsResponse['limits']['storage']);

const normalizeLimitsResponse = (value: unknown): SubscriptionLimitsResponse => {
  const data = isRecord(value) ? value as Partial<SubscriptionLimitsResponse> : {};
  const limits: RecordLike = isRecord(data.limits) ? data.limits : {};

  return {
    has_subscription: Boolean(data.has_subscription),
    subscription: data.subscription ?? null,
    limits: {
      foremen: normalizeLimitItem(limits.foremen),
      projects: normalizeLimitItem(limits.projects),
      users: normalizeLimitItem(limits.users),
      storage: normalizeStorageLimitItem(limits.storage),
      ...(isRecord(limits.invitations) ? { invitations: normalizeLimitItem(limits.invitations) } : {}),
      ...(isRecord(limits.ai_requests) ? { ai_requests: normalizeLimitItem(limits.ai_requests) } : {}),
      ...(isRecord(limits.ai) ? { ai: normalizeLimitItem(limits.ai) } : {}),
    },
    features: Array.isArray(data.features) ? data.features : [],
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
    upgrade_required: Boolean(data.upgrade_required),
  };
};

export const useSubscriptionLimits = (options: UseSubscriptionLimitsOptions = {}): UseSubscriptionLimitsReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 минут
    enabled = true,
    onWarning = null,
    onCritical = null
  } = options;

  const [state, setState] = useState<UseSubscriptionLimitsState>({
    data: null,
    loading: enabled,
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
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false, error: null }));
      return;
    }

    if (isLoadingRef.current) {
      return; // Предотвращаем множественные запросы
    }
    
    try {
      isLoadingRef.current = true;
      setState(prev => ({ ...prev, error: null }));
      
      const response = await billingService.getSubscriptionLimits();

      if (response.status === 200) {
        const safeData = normalizeLimitsResponse(unwrapLimitsPayload(response.data));

        setState({
          data: safeData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
        isLoadingRef.current = false;

        // Вызываем колбэки для предупреждений только если они переданы
        if (safeData.warnings?.length > 0) {
          const criticalWarnings = safeData.warnings.filter(w => w.level === 'critical');
          const normalWarnings = safeData.warnings.filter(w => w.level === 'warning');

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
      console.error('❌ Ошибка загрузки лимитов:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Не удалось загрузить лимиты подписки'
      }));
      isLoadingRef.current = false;
    }
  }, [enabled]);

  // Первоначальная загрузка
  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, loading: false, error: null }));
      return;
    }

    fetchLimits();
  }, [enabled, fetchLimits]);

  // Автообновление
  useEffect(() => {
    if (enabled && autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchLimits, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [enabled, autoRefresh, refreshInterval, fetchLimits]);

  const refresh = useCallback(() => {
    if (!enabled) return;

    if (!isLoadingRef.current) {
      setState(prev => ({ ...prev, loading: true }));
      fetchLimits();
    }
  }, [enabled, fetchLimits]);

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
