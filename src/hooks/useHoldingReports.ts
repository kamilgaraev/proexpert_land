import { useState, useCallback } from 'react';
import { holdingReportsService } from '@utils/api';
import { toast } from 'react-toastify';
import type {
  HoldingDashboardData,
  OrganizationsComparisonData,
  FinancialReportData,
  KpiReportData,
  QuickMetricsData
} from '@/types/holding-reports';

export const useHoldingReports = () => {
  const [dashboardData, setDashboardData] = useState<HoldingDashboardData | null>(null);
  const [comparisonData, setComparisonData] = useState<OrganizationsComparisonData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReportData | null>(null);
  const [kpiData, setKpiData] = useState<KpiReportData | null>(null);
  const [quickMetrics, setQuickMetrics] = useState<QuickMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (holdingId: number, period?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getDashboard(holdingId, period);
      
      if (response.data && response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки дашборда');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки дашборда';
      setError(errorMessage);
      console.error('Ошибка при загрузке дашборда холдинга:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrganizationsComparison = useCallback(async (holdingId: number, period?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getOrganizationsComparison(holdingId, period);
      
      if (response.data && response.data.success) {
        setComparisonData(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки сравнения организаций');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки сравнения организаций';
      setError(errorMessage);
      console.error('Ошибка при загрузке сравнения организаций:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFinancialReport = useCallback(async (holdingId: number, startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getFinancialReport(holdingId, startDate, endDate);
      
      if (response.data && response.data.success) {
        setFinancialData(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки финансового отчета');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки финансового отчета';
      setError(errorMessage);
      console.error('Ошибка при загрузке финансового отчета:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKpiReport = useCallback(async (holdingId: number, period?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getKpiReport(holdingId, period);
      
      if (response.data && response.data.success) {
        setKpiData(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки KPI отчета');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки KPI отчета';
      setError(errorMessage);
      console.error('Ошибка при загрузке KPI отчета:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuickMetrics = useCallback(async (holdingId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getQuickMetrics(holdingId);
      
      if (response.data && response.data.success) {
        setQuickMetrics(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки быстрых метрик');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки быстрых метрик';
      setError(errorMessage);
      console.error('Ошибка при загрузке быстрых метрик:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(async (holdingId: number) => {
    try {
      const response = await holdingReportsService.clearCache(holdingId);
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Кэш отчетов успешно очищен');
        setDashboardData(null);
        setComparisonData(null);
        setFinancialData(null);
        setKpiData(null);
        setQuickMetrics(null);
      } else {
        toast.error(response.data?.message || 'Ошибка очистки кэша');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка очистки кэша';
      toast.error(errorMessage);
      console.error('Ошибка при очистке кэша:', err);
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatPercent = useCallback((value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  }, []);

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'growing':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  }, []);

  return {
    dashboardData,
    comparisonData,
    financialData,
    kpiData,
    quickMetrics,
    loading,
    error,
    fetchDashboard,
    fetchOrganizationsComparison,
    fetchFinancialReport,
    fetchKpiReport,
    fetchQuickMetrics,
    clearCache,
    formatCurrency,
    formatPercent,
    formatDate,
    getTrendIcon
  };
};

export const useHoldingDashboard = (holdingId: number, initialPeriod?: string) => {
  const {
    dashboardData,
    quickMetrics,
    loading,
    error,
    fetchDashboard,
    fetchQuickMetrics,
    clearCache,
    formatCurrency,
    formatPercent,
    formatDate,
    getTrendIcon
  } = useHoldingReports();

  const [period, setPeriod] = useState(initialPeriod || '');

  const loadDashboard = useCallback(async (selectedPeriod?: string) => {
    const targetPeriod = selectedPeriod || period;
    await fetchDashboard(holdingId, targetPeriod);
  }, [fetchDashboard, holdingId, period]);

  const loadQuickMetrics = useCallback(async () => {
    await fetchQuickMetrics(holdingId);
  }, [fetchQuickMetrics, holdingId]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadQuickMetrics()
    ]);
  }, [loadDashboard, loadQuickMetrics]);

  const clearAndRefresh = useCallback(async () => {
    await clearCache(holdingId);
    await refreshData();
  }, [clearCache, holdingId, refreshData]);

  return {
    dashboardData,
    quickMetrics,
    loading,
    error,
    period,
    setPeriod,
    loadDashboard,
    loadQuickMetrics,
    refreshData,
    clearAndRefresh,
    formatCurrency,
    formatPercent,
    formatDate,
    getTrendIcon
  };
};
