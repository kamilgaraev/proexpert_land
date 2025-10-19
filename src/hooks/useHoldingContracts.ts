import { useState, useCallback } from 'react';
import axios from 'axios';

interface Contract {
  id: number;
  organization_id: number;
  project_id: number;
  contractor_id: number;
  parent_contract_id: number | null;
  number: string;
  date: string;
  subject: string;
  work_type_category: string | null;
  payment_terms: string | null;
  total_amount: string;
  gp_percentage: string | null;
  gp_calculation_type: string;
  gp_coefficient: string | null;
  subcontract_amount: string;
  planned_advance_amount: string | null;
  actual_advance_amount: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  organization: {
    id: number;
    name: string;
    is_holding: boolean;
  };
  contractor: {
    id: number;
    organization_id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    inn: string | null;
  };
  project: {
    id: number;
    name: string;
  };
}

interface ContractFilters {
  organization_ids?: number[];
  project_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const useHoldingContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const fetchContracts = useCallback(
    async (filters: ContractFilters = {}, page = 1, perPage = 25) => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          page,
          per_page: perPage,
          filters: {},
        };

        if (filters.organization_ids && filters.organization_ids.length > 0) {
          params.filters['organization_ids'] = filters.organization_ids;
        }
        if (filters.project_id) {
          params.filters.project_id = filters.project_id;
        }
        if (filters.status) {
          params.filters.status = filters.status;
        }
        if (filters.date_from) {
          params.filters.date_from = filters.date_from;
        }
        if (filters.date_to) {
          params.filters.date_to = filters.date_to;
        }

        console.log('useHoldingContracts: Making API request...', {
          url: '/api/v1/landing/multi-organization/contracts-v2',
          params,
        });

        const response = await axios.get<{
          success: boolean;
          data: {
            data: Contract[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
          };
        }>('/api/v1/landing/multi-organization/contracts-v2', {
          params,
        });

        console.log('useHoldingContracts: API response received', response.data);

        if (response.data.success) {
          setContracts(response.data.data.data);
          setPagination({
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total,
            from: response.data.data.from,
            to: response.data.data.to,
          });
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Ошибка загрузки контрактов';
        setError(errorMessage);
        console.error('Error fetching holding contracts:', err);
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    contracts,
    loading,
    error,
    pagination,
    fetchContracts,
  };
};

