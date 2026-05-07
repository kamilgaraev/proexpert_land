import { useCallback, useEffect, useState } from 'react';
import {
  ModulesOverview,
  ModulesOverviewSolution,
  ModulesOverviewTier,
  newModulesService,
  packagesService,
} from '@utils/api';

type UseModulesOverviewResult = {
  overview: ModulesOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  subscribeToPackage: (packageSlug: string, tier: string, durationDays?: number) => Promise<void>;
  unsubscribeFromPackage: (packageSlug: string) => Promise<void>;
  activateModule: (moduleSlug: string, durationDays?: number) => Promise<void>;
  deactivateModule: (moduleSlug: string) => Promise<void>;
  renewModule: (moduleSlug: string, durationDays?: number) => Promise<void>;
  toggleAutoRenew: (moduleSlug: string, enabled: boolean) => Promise<void>;
};

type ApiResponseLike = {
  data?: unknown;
  status?: number;
  success?: boolean;
  message?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const arrayOrEmpty = <T,>(value: unknown): T[] => (
  Array.isArray(value) ? value as T[] : []
);

const unwrapResponsePayload = (response: ApiResponseLike): unknown => {
  const root = response?.data;

  if (isRecord(root) && isRecord(root.data) && isRecord(root.data.data)) {
    return root.data.data;
  }

  if (isRecord(root) && root.data !== undefined) {
    return root.data;
  }

  return root;
};

const normalizeTier = (tier: ModulesOverviewTier): ModulesOverviewTier => ({
  ...tier,
  modules: arrayOrEmpty<string>(tier.modules),
  included_modules: arrayOrEmpty<string>(tier.included_modules).length > 0
    ? arrayOrEmpty<string>(tier.included_modules)
    : arrayOrEmpty<string>(tier.modules),
  highlights: arrayOrEmpty<string>(tier.highlights),
});

const normalizeSolution = (solution: ModulesOverviewSolution): ModulesOverviewSolution => ({
  ...solution,
  foundation_modules: arrayOrEmpty<string>(solution.foundation_modules),
  integrations: arrayOrEmpty(solution.integrations),
  recommended_addons: arrayOrEmpty(solution.recommended_addons),
  business_outcomes: arrayOrEmpty<string>(solution.business_outcomes),
  data_sources: arrayOrEmpty(solution.data_sources),
  capabilities: arrayOrEmpty(solution.capabilities),
  tiers: arrayOrEmpty<ModulesOverviewTier>(solution.tiers).map(normalizeTier),
});

const getResponsePayload = (response: ApiResponseLike): ModulesOverview => {
  const payload = unwrapResponsePayload(response);

  if (!isRecord(payload)) {
    throw new Error('Не удалось получить данные страницы модулей');
  }

  return {
    ...payload,
    summary: payload.summary,
    solutions: arrayOrEmpty<ModulesOverviewSolution>(payload.solutions).map(normalizeSolution),
    standalone_modules: arrayOrEmpty(payload.standalone_modules),
    advanced_modules: arrayOrEmpty(payload.advanced_modules),
    warnings: arrayOrEmpty(payload.warnings),
  } as ModulesOverview;
};

const ensureSuccess = (response: ApiResponseLike, fallbackMessage: string) => {
  const data = isRecord(response?.data) ? response.data : null;

  if ((response?.status ?? 0) >= 400 || data?.success === false || response?.success === false) {
    const message = typeof data?.message === 'string' ? data.message : response?.message;

    throw new Error(message || fallbackMessage);
  }
};

export const useModulesOverview = (): UseModulesOverviewResult => {
  const [overview, setOverview] = useState<ModulesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await newModulesService.getOverview();
      ensureSuccess(response, 'Не удалось загрузить страницу модулей');
      setOverview(getResponsePayload(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить страницу модулей');
    } finally {
      setLoading(false);
    }
  }, []);

  const runAction = useCallback(async (action: () => Promise<ApiResponseLike>, fallbackMessage: string) => {
    const response = await action();
    ensureSuccess(response, fallbackMessage);
    await refresh();
  }, [refresh]);

  const subscribeToPackage = useCallback((packageSlug: string, tier: string, durationDays = 30) => (
    runAction(
      () => packagesService.subscribe(packageSlug, tier, durationDays),
      'Не удалось подключить решение',
    )
  ), [runAction]);

  const unsubscribeFromPackage = useCallback((packageSlug: string) => (
    runAction(
      () => packagesService.unsubscribe(packageSlug),
      'Не удалось отключить решение',
    )
  ), [runAction]);

  const activateModule = useCallback((moduleSlug: string, durationDays = 30) => (
    runAction(
      () => newModulesService.activateModule(moduleSlug, durationDays),
      'Не удалось подключить возможность',
    )
  ), [runAction]);

  const deactivateModule = useCallback((moduleSlug: string) => (
    runAction(
      () => newModulesService.deactivateModule(moduleSlug),
      'Не удалось отключить возможность',
    )
  ), [runAction]);

  const renewModule = useCallback((moduleSlug: string, durationDays = 30) => (
    runAction(
      () => newModulesService.renewModule(moduleSlug, durationDays),
      'Не удалось продлить возможность',
    )
  ), [runAction]);

  const toggleAutoRenew = useCallback((moduleSlug: string, enabled: boolean) => (
    runAction(
      () => newModulesService.toggleAutoRenew(moduleSlug, enabled),
      'Не удалось изменить автопродление',
    )
  ), [runAction]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    overview,
    loading,
    error,
    refresh,
    subscribeToPackage,
    unsubscribeFromPackage,
    activateModule,
    deactivateModule,
    renewModule,
    toggleAutoRenew,
  };
};
