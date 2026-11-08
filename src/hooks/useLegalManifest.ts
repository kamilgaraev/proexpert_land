import { useEffect, useSyncExternalStore } from 'react';
import {
  getLegalManifestState,
  loadLegalManifest,
  refreshLegalManifest,
  subscribeLegalManifest,
  type LegalManifest,
} from '@/services/legalService';

export interface UseLegalManifestResult {
  manifest: LegalManifest | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useLegalManifest = (): UseLegalManifestResult => {
  const { manifest, error } = useSyncExternalStore(subscribeLegalManifest, getLegalManifestState, getLegalManifestState);

  useEffect(() => {
    void loadLegalManifest();
  }, []);

  useEffect(() => {
    if (!error) return undefined;
    const retry = () => { void loadLegalManifest(); };
    window.addEventListener('focus', retry);
    window.addEventListener('online', retry);
    return () => {
      window.removeEventListener('focus', retry);
      window.removeEventListener('online', retry);
    };
  }, [error]);

  return { manifest, error, refresh: refreshLegalManifest };
};
