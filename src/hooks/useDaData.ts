import { useState, useCallback } from 'react';

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
    flat: string;
    geo_lat: string;
    geo_lon: string;
  };
}

export interface DaDataCity {
  value: string;
  unrestricted_value: string;
  data: {
    city: string;
    region: string;
    country: string;
  };
}

const DADATA_API_KEY = 'c2110ee53431438f940545629894ebb5dc1fb1a4';
const DADATA_SECRET_KEY = '9acd90e91b45e9105f0a7fac58bfebca6addf914';
const DADATA_BASE_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest';

export const useDaData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const searchAddresses = useCallback(async (query: string): Promise<DaDataAddress[]> => {
    if (!query || query.length < 3) return [];

    setIsLoading(true);
    try {
      const response = await fetch(`${DADATA_BASE_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_API_KEY}`,
          'X-Secret': DADATA_SECRET_KEY,
        },
        body: JSON.stringify({
          query: query,
          count: 10,
          locations: [
            {
              country: 'Россия'
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при запросе к DaData API');
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchCities = useCallback(async (query: string): Promise<DaDataCity[]> => {
    if (!query || query.length < 2) return [];

    setIsLoading(true);
    try {
      const response = await fetch(`${DADATA_BASE_URL}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_API_KEY}`,
          'X-Secret': DADATA_SECRET_KEY,
        },
        body: JSON.stringify({
          query: query,
          count: 10,
          from_bound: { value: 'city' },
          to_bound: { value: 'city' },
          locations: [
            {
              country: 'Россия'
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при запросе к DaData API');
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Ошибка поиска городов:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchAddresses,
    searchCities,
    isLoading,
  };
};

export default useDaData; 