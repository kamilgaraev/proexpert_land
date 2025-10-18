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

  const fetchDashboard = useCallback(async (period?: string, fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getDashboard(period, fromDate, toDate);
      
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

  const fetchOrganizationsComparison = useCallback(async (metrics?: string, organizationIds?: number[], period?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getOrganizationsComparison(metrics, organizationIds, period);
      
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

  const fetchFinancialReport = useCallback(async (period: string, startDate: string, endDate: string, breakdownBy?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getFinancialReport(period, startDate, endDate, breakdownBy);
      
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

  const fetchKpiReport = useCallback(async (period?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getKpiReport(period);
      
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

  const fetchQuickMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getQuickMetrics();
      
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

  const clearCache = useCallback(async () => {
    try {
      const response = await holdingReportsService.clearCache();
      
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
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 ₽';
    }
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatPercent = useCallback((value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0,0%';
    }
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'Дата не указана';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Некорректная дата';
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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

export const useHoldingDashboard = (initialPeriod?: string) => {
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
    await fetchDashboard(targetPeriod);
  }, [fetchDashboard, period]);

  const loadQuickMetrics = useCallback(async () => {
    await fetchQuickMetrics();
  }, [fetchQuickMetrics]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadQuickMetrics()
    ]);
  }, [loadDashboard, loadQuickMetrics]);

  const clearAndRefresh = useCallback(async () => {
    await clearCache();
    await refreshData();
  }, [clearCache, refreshData]);

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
