import { useState, useCallback } from 'react';
import { holdingReportsService } from '@utils/api';
import { toast } from 'react-toastify';
import type {
  ProjectsReportData,
  ContractsReportData,
  IntraGroupReportData,
  ConsolidatedReportData,
  DetailedContractsReportData,
  ProjectsSummaryFilters,
  ContractsSummaryFilters,
  IntraGroupFilters,
  ConsolidatedFilters,
  DetailedContractsFilters
} from '@/types/holding-reports';

export const useHoldingReports = () => {
  const [projectsReport, setProjectsReport] = useState<ProjectsReportData | null>(null);
  const [contractsReport, setContractsReport] = useState<ContractsReportData | null>(null);
  const [intraGroupReport, setIntraGroupReport] = useState<IntraGroupReportData | null>(null);
  const [consolidatedReport, setConsolidatedReport] = useState<ConsolidatedReportData | null>(null);
  const [detailedContractsReport, setDetailedContractsReport] = useState<DetailedContractsReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectsSummary = useCallback(async (filters?: ProjectsSummaryFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getProjectsSummary(filters);
      
      if (response.data && response.data.success) {
        setProjectsReport(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки отчета по проектам');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки отчета по проектам';
      setError(errorMessage);
      console.error('Ошибка при загрузке отчета по проектам:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContractsSummary = useCallback(async (filters?: ContractsSummaryFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getContractsSummary(filters);
      
      if (response.data && response.data.success) {
        setContractsReport(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки отчета по контрактам');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки отчета по контрактам';
      setError(errorMessage);
      console.error('Ошибка при загрузке отчета по контрактам:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportProjectsReport = useCallback(async (filters?: ProjectsSummaryFilters, format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    try {
      const blob = await holdingReportsService.exportProjectsReport(filters, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projects_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Отчет успешно экспортирован');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка экспорта отчета';
      toast.error(errorMessage);
      console.error('Ошибка при экспорте отчета по проектам:', err);
    }
  }, []);

  const exportContractsReport = useCallback(async (filters?: ContractsSummaryFilters, format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    try {
      const blob = await holdingReportsService.exportContractsReport(filters, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contracts_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Отчет успешно экспортирован');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка экспорта отчета';
      toast.error(errorMessage);
      console.error('Ошибка при экспорте отчета по контрактам:', err);
    }
  }, []);

  const fetchIntraGroupReport = useCallback(async (filters?: IntraGroupFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getIntraGroupReport(filters);
      
      if (response.data && response.data.success) {
        setIntraGroupReport(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки отчета по внутригрупповым проектам');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки отчета по внутригрупповым проектам';
      setError(errorMessage);
      console.error('Ошибка при загрузке отчета по внутригрупповым проектам:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportIntraGroupReport = useCallback(async (filters?: IntraGroupFilters, format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    try {
      const blob = await holdingReportsService.exportIntraGroupReport(filters, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `intragroup_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Отчет успешно экспортирован');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка экспорта отчета';
      toast.error(errorMessage);
      console.error('Ошибка при экспорте отчета по внутригрупповым проектам:', err);
    }
  }, []);

  const fetchConsolidatedReport = useCallback(async (filters?: ConsolidatedFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getConsolidatedReport(filters);
      
      if (response.data && response.data.success) {
        setConsolidatedReport(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки консолидированного отчета');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки консолидированного отчета';
      setError(errorMessage);
      console.error('Ошибка при загрузке консолидированного отчета:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportConsolidatedReport = useCallback(async (filters?: ConsolidatedFilters, format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    try {
      const blob = await holdingReportsService.exportConsolidatedReport(filters, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consolidated_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Отчет успешно экспортирован');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка экспорта отчета';
      toast.error(errorMessage);
      console.error('Ошибка при экспорте консолидированного отчета:', err);
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

  const fetchDetailedContractsReport = useCallback(async (filters?: DetailedContractsFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingReportsService.getDetailedContractsReport(filters);
      
      if (response.data && response.data.success) {
        setDetailedContractsReport(response.data.data);
      } else {
        setError(response.data?.error || 'Ошибка загрузки детального отчета по контрактам');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки детального отчета по контрактам';
      setError(errorMessage);
      console.error('Ошибка при загрузке детального отчета по контрактам:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportDetailedContractsReport = useCallback(async (filters?: DetailedContractsFilters, format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    try {
      const blob = await holdingReportsService.exportDetailedContractsReport(filters, format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `detailed_contracts_report_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Отчет успешно экспортирован');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка экспорта отчета';
      toast.error(errorMessage);
      console.error('Ошибка при экспорте детального отчета по контрактам:', err);
    }
  }, []);

  return {
    projectsReport,
    contractsReport,
    intraGroupReport,
    consolidatedReport,
    detailedContractsReport,
    loading,
    error,
    fetchProjectsSummary,
    fetchContractsSummary,
    fetchIntraGroupReport,
    fetchConsolidatedReport,
    fetchDetailedContractsReport,
    exportProjectsReport,
    exportContractsReport,
    exportIntraGroupReport,
    exportConsolidatedReport,
    exportDetailedContractsReport,
    formatCurrency,
    formatPercent,
    formatDate
  };
};

export const useProjectsReport = () => {
  const {
    projectsReport,
    loading,
    error,
    fetchProjectsSummary,
    exportProjectsReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useHoldingReports();

  const [filters, setFilters] = useState<ProjectsSummaryFilters>({});

  const loadReport = useCallback(async (newFilters?: ProjectsSummaryFilters) => {
    const targetFilters = newFilters || filters;
    await fetchProjectsSummary(targetFilters);
  }, [fetchProjectsSummary, filters]);

  const updateFilters = useCallback((newFilters: Partial<ProjectsSummaryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    await exportProjectsReport(filters, format);
  }, [exportProjectsReport, filters]);

  return {
    projectsReport,
    loading,
    error,
    filters,
    updateFilters,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  };
};

export const useContractsReport = () => {
  const {
    contractsReport,
    loading,
    error,
    fetchContractsSummary,
    exportContractsReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useHoldingReports();

  const [filters, setFilters] = useState<ContractsSummaryFilters>({
    page: 1,
    per_page: 50
  });

  const loadReport = useCallback(async (newFilters?: ContractsSummaryFilters) => {
    const targetFilters = newFilters || filters;
    await fetchContractsSummary(targetFilters);
  }, [fetchContractsSummary, filters]);

  const updateFilters = useCallback((newFilters: Partial<ContractsSummaryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const changePage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    await exportContractsReport(filters, format);
  }, [exportContractsReport, filters]);

  return {
    contractsReport,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  };
};

export const useIntraGroupReport = () => {
  const {
    intraGroupReport,
    loading,
    error,
    fetchIntraGroupReport,
    exportIntraGroupReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useHoldingReports();

  const [filters, setFilters] = useState<IntraGroupFilters>({});

  const loadReport = useCallback(async (newFilters?: IntraGroupFilters) => {
    const targetFilters = newFilters || filters;
    await fetchIntraGroupReport(targetFilters);
  }, [fetchIntraGroupReport, filters]);

  const updateFilters = useCallback((newFilters: Partial<IntraGroupFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    await exportIntraGroupReport(filters, format);
  }, [exportIntraGroupReport, filters]);

  return {
    intraGroupReport,
    loading,
    error,
    filters,
    updateFilters,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  };
};

export const useConsolidatedReport = () => {
  const {
    consolidatedReport,
    loading,
    error,
    fetchConsolidatedReport,
    exportConsolidatedReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useHoldingReports();

  const [filters, setFilters] = useState<ConsolidatedFilters>({});

  const loadReport = useCallback(async (newFilters?: ConsolidatedFilters) => {
    const targetFilters = newFilters || filters;
    await fetchConsolidatedReport(targetFilters);
  }, [fetchConsolidatedReport, filters]);

  const updateFilters = useCallback((newFilters: Partial<ConsolidatedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    await exportConsolidatedReport(filters, format);
  }, [exportConsolidatedReport, filters]);

  return {
    consolidatedReport,
    loading,
    error,
    filters,
    updateFilters,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  };
};

export const useDetailedContractsReport = () => {
  const {
    detailedContractsReport,
    loading,
    error,
    fetchDetailedContractsReport,
    exportDetailedContractsReport,
    formatCurrency,
    formatPercent,
    formatDate
  } = useHoldingReports();

  const [filters, setFilters] = useState<DetailedContractsFilters>({
    page: 1,
    per_page: 50
  });

  const loadReport = useCallback(async (newFilters?: DetailedContractsFilters) => {
    const targetFilters = newFilters || filters;
    await fetchDetailedContractsReport(targetFilters);
  }, [fetchDetailedContractsReport, filters]);

  const updateFilters = useCallback((newFilters: Partial<DetailedContractsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const changePage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'xlsx' = 'excel') => {
    await exportDetailedContractsReport(filters, format);
  }, [exportDetailedContractsReport, filters]);

  return {
    detailedContractsReport,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    loadReport,
    exportReport,
    formatCurrency,
    formatPercent,
    formatDate
  };
};
