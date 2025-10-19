import { useState, useCallback } from 'react';
import { holdingReportsService } from '@utils/api';
import { toast } from 'react-toastify';
import type {
  ProjectsReportData,
  ContractsReportData,
  IntraGroupReportData,
  ProjectsSummaryFilters,
  ContractsSummaryFilters,
  IntraGroupFilters
} from '@/types/holding-reports';

export const useHoldingReports = () => {
  const [projectsReport, setProjectsReport] = useState<ProjectsReportData | null>(null);
  const [contractsReport, setContractsReport] = useState<ContractsReportData | null>(null);
  const [intraGroupReport, setIntraGroupReport] = useState<IntraGroupReportData | null>(null);
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

  return {
    projectsReport,
    contractsReport,
    intraGroupReport,
    loading,
    error,
    fetchProjectsSummary,
    fetchContractsSummary,
    fetchIntraGroupReport,
    exportProjectsReport,
    exportContractsReport,
    exportIntraGroupReport,
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
