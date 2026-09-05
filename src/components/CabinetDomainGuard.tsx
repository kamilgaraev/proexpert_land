import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppLoadingFallback } from './common/AppLoadingFallback';
import { getCabinetRedirect } from '../utils/cabinetRedirect';

export const CabinetDomainGuard = ({ children }: { children: ReactNode }) => {
  const { pathname, search, hash } = useLocation();
  const target = typeof window === 'undefined'
    ? null
    : getCabinetRedirect(window.location.hostname, pathname, search, hash);

  useEffect(() => {
    if (target) {
      window.location.replace(target);
    }
  }, [target]);

  return target ? <AppLoadingFallback /> : children;
};
