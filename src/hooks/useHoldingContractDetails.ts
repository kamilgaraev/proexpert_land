import { useState, useCallback } from 'react';
import axios from 'axios';
import { getTokenFromStorages } from '@/utils/api';

const API_BASE_DOMAIN = 'https://api.prohelper.pro';
const MULTI_ORG_API_URL = `${API_BASE_DOMAIN}/api/v1/landing/multi-organization`;

const createApiClient = () => {
  const client = axios.create({
    baseURL: MULTI_ORG_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getTokenFromStorages();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const api = createApiClient();

interface ContractDetails {
  contract: any;
  financial_summary: {
    total_amount: number;
    gp_amount: number;
    subcontract_amount: number;
    planned_advance: number;
    actual_advance: number;
    total_paid: number;
    total_acts_approved: number;
    total_works_approved: number;
    remaining_amount: number;
    completion_percentage: number;
  };
  child_contracts_summary: {
    total_count: number;
    total_amount: number;
    by_status: Record<string, { count: number; total_amount: number }>;
  };
  payments_by_type: Record<string, { count: number; total_amount: number }>;
  timeline: {
    contract_date: string;
    start_date: string | null;
    end_date: string | null;
    days_total: number;
    days_passed: number;
    days_remaining: number;
  };
}

export const useHoldingContractDetails = () => {
  const [data, setData] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractDetails = useCallback(async (contractId: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log('useHoldingContractDetails: Making API request...', {
        url: `/contracts/${contractId}`,
        fullUrl: `${MULTI_ORG_API_URL}/contracts/${contractId}`,
      });

      const response = await api.get<{
        success: boolean;
        data: ContractDetails;
      }>(`/contracts/${contractId}`);

      console.log('useHoldingContractDetails: API response received', response.data);

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Контракт не найден или доступ запрещен');
      } else {
        setError(err.response?.data?.message || 'Ошибка загрузки контракта');
      }
      console.error('Error fetching contract details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchContractDetails,
  };
};

