import { useCallback, useEffect, useState } from 'react';
import {
  ModulesOverview,
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

const getResponsePayload = (response: any): ModulesOverview => {
  const payload = response?.data?.data ?? response?.data;

  if (!payload) {
    throw new Error('Не удалось получить данные страницы модулей');
  }

  return payload;
};

const ensureSuccess = (response: any, fallbackMessage: string) => {
  if (response?.status >= 400 || response?.data?.success === false) {
    throw new Error(response?.data?.message || fallbackMessage);
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

  const runAction = useCallback(async (action: () => Promise<any>, fallbackMessage: string) => {
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
