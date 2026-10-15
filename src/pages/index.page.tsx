import LandingPage from '@pages/landing/LandingPage';
import MarketingShell from '@/components/landing/MarketingShell';
import { marketingSeo } from '@/data/marketingRegistry';
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { isHoldingHostname } from '@/utils/holdingDomain';
import type { HoldingPublicPageState } from '@/utils/holdingPublicPage';
import { getHoldingRouter, loadHoldingRouter } from '@/holdingRouterLoader';
import { AppErrorBoundary } from '@components/common/AppErrorBoundary';
import { AppLoadingFallback } from '@components/common/AppLoadingFallback';

const LazyHoldingRouter = lazy(() => loadHoldingRouter().then((defaultExport) => ({ default: defaultExport })));

export const Page = ({ requestHostname, initialHoldingPage }: { requestHostname?: string; initialHoldingPage?: HoldingPublicPageState } = {}) => {
  const location = useLocation();
  const hostname = requestHostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  if (isHoldingHostname(hostname)) {
    const HoldingRouter = getHoldingRouter() ?? LazyHoldingRouter;
    return <AppErrorBoundary resetKey={`${location.pathname}${location.search}`}><Suspense fallback={<AppLoadingFallback />}><HoldingRouter initialHoldingPage={initialHoldingPage} /></Suspense></AppErrorBoundary>;
  }

  return <MarketingShell><LandingPage /></MarketingShell>;
};

export const documentProps = {
  title: marketingSeo.home.title,
  description: marketingSeo.home.description,
};
