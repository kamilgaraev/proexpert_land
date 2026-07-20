import { useCallback, useState } from 'react';
import type { HoldingLegalArchiveDossier } from '@/types/legalArchive';
import { holdingLegalArchiveService } from '@/services/legalArchiveService';

export const useHoldingContractDetails = () => {
  const [data, setData] = useState<HoldingLegalArchiveDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContractDetails = useCallback(async (contractId: number) => {
    try {
      setLoading(true);
      setError(null);
      setData(await holdingLegalArchiveService.getContractDossier(contractId));
    } catch (error: unknown) {
      const response = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { status?: number; data?: { message?: string } } }).response
        : undefined;
      setError(response?.status === 404 ? 'Досье не найдено или доступ к нему отсутствует' : response?.data?.message ?? 'Не удалось загрузить юридическое досье');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchContractDetails };
};
