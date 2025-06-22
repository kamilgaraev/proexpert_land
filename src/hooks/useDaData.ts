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

const API_BASE_URL = '/api/v1/landing';

export const useDaData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const searchAddresses = useCallback(async (query: string): Promise<DaDataAddress[]> => {
    if (!query || query.length < 3) return [];

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dadata/suggest/addresses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при поиске адресов');
      }

      const result = await response.json();
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Ошибка поиска адресов');
      }
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchCities = useCallback(async (query: string): Promise<DaDataAddress[]> => {
    if (!query || query.length < 2) return [];

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dadata/suggest/addresses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при поиске городов');
      }

      const result = await response.json();
      if (result.success) {
        const addresses = result.data || [];
        return addresses.filter((addr: DaDataAddress) => 
          addr.data.city && addr.data.city.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        throw new Error(result.message || 'Ошибка поиска городов');
      }
    } catch (error) {
      console.error('Ошибка поиска городов:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchOrganizations = useCallback(async (query: string): Promise<DaDataOrganization[]> => {
    if (!query || query.length < 2) return [];

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dadata/suggest/organizations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при поиске организаций');
      }

      const result = await response.json();
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Ошибка поиска организаций');
      }
    } catch (error) {
      console.error('Ошибка поиска организаций:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanAddress = useCallback(async (address: string): Promise<DaDataAddress | null> => {
    if (!address) return null;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dadata/clean/address`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при стандартизации адреса');
      }

      const result = await response.json();
      if (result.success) {
        return {
          value: result.data.result,
          unrestricted_value: result.data.result,
          data: {
            postal_code: result.data.postal_code || '',
            country: result.data.country || '',
            region: result.data.region || '',
            city: result.data.city || '',
            street: result.data.street || '',
            house: result.data.house || '',
            qc: result.data.qc
          }
        };
      } else {
        throw new Error(result.message || 'Ошибка стандартизации адреса');
      }
    } catch (error) {
      console.error('Ошибка стандартизации адреса:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchAddresses,
    searchCities,
    searchOrganizations,
    cleanAddress,
    isLoading,
  };
};

export default useDaData; 