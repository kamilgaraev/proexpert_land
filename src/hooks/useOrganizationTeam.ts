import { useCallback, useEffect, useState } from 'react';
import { getOrganizationTeam } from '@/services/organizationTeamService';
import type { OrganizationTeamPage } from '@/types/organization-team';

interface TeamQuery {
  scope: string;
  search: string;
  page: number;
}

interface TeamResult {
  key: string;
  page: OrganizationTeamPage | null;
  error: string | null;
}

export function useOrganizationTeam(scope: string | null, enabled = true) {
  const [query, setQuery] = useState<TeamQuery>({ scope: scope ?? '', search: '', page: 1 });
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<TeamResult | null>(null);
  const active = enabled && scope !== null;
  const current = query.scope === scope ? query : { scope: scope ?? '', search: '', page: 1 };
  const key = JSON.stringify([scope, current.search, current.page, revision]);

  useEffect(() => {
    if (!active) {
      setResult(null);
      return;
    }
    const controller = new AbortController();
    let disposed = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await getOrganizationTeam({ search: current.search.trim(), page: current.page, per_page: 20 }, controller.signal);
        if (disposed) return;
        if (response.meta.current_page > response.meta.last_page) {
          setQuery({ scope: scope ?? '', search: current.search, page: response.meta.last_page });
          return;
        }
        setResult({ key, page: response, error: null });
      } catch {
        if (!disposed && !controller.signal.aborted) {
          setResult({ key, page: null, error: 'Не удалось загрузить сотрудников. Проверьте соединение и попробуйте ещё раз.' });
        }
      }
    }, current.search ? 300 : 0);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, scope, current.search, current.page, key]);

  const setSearch = useCallback((search: string) => {
    setQuery({ scope: scope ?? '', search: search.slice(0, 200), page: 1 });
  }, [scope]);

  const setPage = useCallback((page: number) => {
    if (!Number.isSafeInteger(page) || page < 1) return;
    setQuery(previous => ({ scope: scope ?? '', search: previous.scope === scope ? previous.search : '', page }));
  }, [scope]);

  const refresh = useCallback(() => setRevision(value => value + 1), []);
  const visible = active && result?.key === key ? result : null;

  return {
    members: visible?.page?.data ?? [],
    meta: visible?.page?.meta ?? null,
    loading: active && visible === null,
    error: visible?.error ?? null,
    search: current.search,
    page: current.page,
    setSearch,
    setPage,
    refresh,
  };
}
