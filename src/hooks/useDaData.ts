import { useCallback, useEffect, useRef, useState } from 'react';

export interface DaDataAddress {
  value: string;
  unrestricted_value: string;
  data: {
    postal_code: string;
    country: string;
    region: string;
    city: string;
    street: string;
    house: string;
    flat?: string;
    qc?: number;
  };
}

export interface DaDataOrganization {
  value: string;
  unrestricted_value: string;
  data: {
    inn: string;
    ogrn: string;
    name: {
      full: string;
      short: string;
      full_with_opf: string;
    };
    address: {
      unrestricted_value: string;
    };
    state: {
      status: string;
    };
  };
}

const API_BASE_URL = 'https://api.1мост.рф/api/v1/landing';
const CACHE_TTL_MS = 30000;
const responseCache = new Map<string, { expiresAt: number; data: unknown[] }>();

type SearchKind = 'addresses' | 'cities' | 'organizations';

export const useDaData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const controllers = useRef<Partial<Record<SearchKind, AbortController>>>({});
  const activeRequests = useRef(0);

  useEffect(() => () => {
    Object.values(controllers.current).forEach((controller) => controller?.abort());
  }, []);

  const requestSuggestions = useCallback(async <T,>(
    kind: SearchKind,
    endpoint: 'addresses' | 'organizations',
    query: string,
  ): Promise<T[]> => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');

    if (normalizedQuery.length < 2) {
      return [];
    }

    const cacheKey = `${kind}:${normalizedQuery}`;
    const cached = responseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T[];
    }

    controllers.current[kind]?.abort();
    const controller = new AbortController();
    controllers.current[kind] = controller;
    activeRequests.current += 1;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/dadata/suggest/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('suggestion_http_error');
      }

      const result = await response.json() as { success?: boolean; data?: T[] };

      if (!result.success) {
        throw new Error('suggestion_contract_error');
      }

      const data = result.data ?? [];
      responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return [];
      }

      throw new Error('Подсказки временно недоступны. Введите данные вручную.');
    } finally {
      activeRequests.current = Math.max(0, activeRequests.current - 1);
      setIsLoading(activeRequests.current > 0);
    }
  }, []);

  const searchAddresses = useCallback(
    (query: string) => requestSuggestions<DaDataAddress>('addresses', 'addresses', query),
    [requestSuggestions],
  );

  const searchCities = useCallback(async (query: string): Promise<DaDataAddress[]> => {
    const addresses = await requestSuggestions<DaDataAddress>('cities', 'addresses', query);
    const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');

    return addresses.filter((address) => (
      address.data.city?.toLocaleLowerCase('ru-RU').includes(normalizedQuery)
    ));
  }, [requestSuggestions]);

  const searchOrganizations = useCallback(
    (query: string) => requestSuggestions<DaDataOrganization>('organizations', 'organizations', query),
    [requestSuggestions],
  );

  const cleanAddress = useCallback(async (address: string): Promise<DaDataAddress | null> => {
    const [first] = await searchAddresses(address);
    return first ?? null;
  }, [searchAddresses]);

  return {
    searchAddresses,
    searchCities,
    searchOrganizations,
    cleanAddress,
    isLoading,
  };
};

export default useDaData;
