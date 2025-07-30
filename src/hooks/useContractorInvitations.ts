/**
 * React хуки для работы с приглашениями подрядчиков
 */

import { useState, useEffect, useCallback } from 'react';
import {
  contractorInvitationsService,
  handleContractorInvitationError
} from '../utils/contractorInvitationsApi';
import type {
  ContractorInvitation,
  InvitationListResponse,
  InvitationStats,
  InvitationFilters,
  InvitationStatus,
  InvitationAcceptResponse
} from '../types/contractor-invitations';

interface UseInvitationsListResult {
  invitations: ContractorInvitation[];
  pagination: InvitationListResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
  filters: InvitationFilters;
  setFilters: (filters: InvitationFilters) => void;
  refreshInvitations: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Хук для работы со списком входящих приглашений
 */
export const useInvitationsList = (initialFilters: InvitationFilters = {}): UseInvitationsListResult => {
  const [invitations, setInvitations] = useState<ContractorInvitation[]>([]);
  const [pagination, setPagination] = useState<InvitationListResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvitationFilters>(initialFilters);

  const loadInvitations = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
      }

      const currentPage = isLoadMore ? (pagination?.current_page || 0) + 1 : 1;
      const response = await contractorInvitationsService.getIncomingInvitations({
        ...filters,
        per_page: filters.per_page || 15,
        // Добавляем параметр страницы для пагинации
        ...(currentPage > 1 && { page: currentPage })
      });

      if (isLoadMore) {
        setInvitations(prev => [...prev, ...response.data]);
      } else {
        setInvitations(response.data);
      }
      
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = handleContractorInvitationError(err);
      setError(errorMessage);
      console.error('Ошибка загрузки приглашений:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination?.current_page]);

  const refreshInvitations = useCallback(() => {
    return loadInvitations(false);
  }, [loadInvitations]);

  const loadMore = useCallback(() => {
    return loadInvitations(true);
  }, [loadInvitations]);

  const hasMore = pagination?.has_more_pages || false;

  useEffect(() => {
    loadInvitations(false);
  }, [filters]);

  return {
    invitations,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refreshInvitations,
    loadMore,
    hasMore,
  };
};

interface UseInvitationDetailsResult {
  invitation: ContractorInvitation | null;
  loading: boolean;
  error: string | null;
  refreshInvitation: () => Promise<void>;
}

/**
 * Хук для работы с деталями приглашения по токену
 */
export const useInvitationDetails = (token: string | null): UseInvitationDetailsResult => {
  const [invitation, setInvitation] = useState<ContractorInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvitation = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await contractorInvitationsService.getInvitationByToken(token);
      setInvitation(response);
    } catch (err) {
      const errorMessage = handleContractorInvitationError(err);
      setError(errorMessage);
      console.error('Ошибка загрузки деталей приглашения:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshInvitation = useCallback(() => {
    return loadInvitation();
  }, [loadInvitation]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  return {
    invitation,
    loading,
    error,
    refreshInvitation,
  };
};

interface UseInvitationActionsResult {
  accepting: boolean;
  declining: boolean;
  acceptError: string | null;
  declineError: string | null;
  acceptInvitation: (token: string) => Promise<InvitationAcceptResponse | null>;
  declineInvitation: (token: string, reason?: string) => Promise<boolean>;
}

/**
 * Хук для действий с приглашениями (принятие/отклонение)
 */
export const useInvitationActions = (): UseInvitationActionsResult => {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [declineError, setDeclineError] = useState<string | null>(null);

  const acceptInvitation = useCallback(async (token: string): Promise<InvitationAcceptResponse | null> => {
    try {
      setAccepting(true);
      setAcceptError(null);
      const response = await contractorInvitationsService.acceptInvitation(token);
      return response;
    } catch (err) {
      const errorMessage = handleContractorInvitationError(err);
      setAcceptError(errorMessage);
      console.error('Ошибка принятия приглашения:', err);
      return null;
    } finally {
      setAccepting(false);
    }
  }, []);

  const declineInvitation = useCallback(async (token: string, reason?: string): Promise<boolean> => {
    try {
      setDeclining(true);
      setDeclineError(null);
      await contractorInvitationsService.declineInvitation(token, reason);
      return true;
    } catch (err) {
      const errorMessage = handleContractorInvitationError(err);
      setDeclineError(errorMessage);
      console.error('Ошибка отклонения приглашения:', err);
      return false;
    } finally {
      setDeclining(false);
    }
  }, []);

  return {
    accepting,
    declining,
    acceptError,
    declineError,
    acceptInvitation,
    declineInvitation,
  };
};

interface UseInvitationStatsResult {
  stats: InvitationStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

/**
 * Хук для работы со статистикой приглашений
 */
export const useInvitationStats = (): UseInvitationStatsResult => {
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractorInvitationsService.getInvitationStats();
      setStats(response);
    } catch (err) {
      const errorMessage = handleContractorInvitationError(err);
      setError(errorMessage);
      console.error('Ошибка загрузки статистики приглашений:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    return loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};

/**
 * Хук для фильтрации приглашений
 */
export const useInvitationFilters = (initialFilters: InvitationFilters = {}) => {
  const [filters, setFilters] = useState<InvitationFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof InvitationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const setStatusFilter = useCallback((status: InvitationStatus | undefined) => {
    updateFilter('status', status);
  }, [updateFilter]);

  const setDateRangeFilter = useCallback((dateFrom?: string, dateTo?: string) => {
    setFilters(prev => ({
      ...prev,
      date_from: dateFrom,
      date_to: dateTo,
    }));
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    setStatusFilter,
    setDateRangeFilter,
  };
};