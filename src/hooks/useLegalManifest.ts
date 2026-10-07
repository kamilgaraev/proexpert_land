import { useEffect, useState } from 'react';
import { fetchLegalManifest, type LegalManifest } from '@/services/legalService';

export const useLegalManifest = () => {
  const [manifest, setManifest] = useState<LegalManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchLegalManifest(controller.signal).then(setManifest).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Документы временно недоступны.');
    });
    return () => controller.abort();
  }, []);
  return { manifest, error };
};
