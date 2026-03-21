import { useEffect, useState } from 'react';
import SiteBuilderRenderer from '@/components/holding/site-builder/SiteBuilderRenderer';
import { SEOHead } from '@components/shared/SEOHead';
import { BuilderApiError, publicHoldingSiteService } from '@/services/holdingSiteBuilderService';
import type { PublicSitePayload } from '@/types/holding-site-builder';
import HoldingLandingPage from './HoldingLandingPage';

const HoldingLandingRuntimePage = () => {
  const [payload, setPayload] = useState<PublicSitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const loadPayload = async () => {
      setLoading(true);
      setError(null);
      setErrorStatus(null);

      try {
        const data = await publicHoldingSiteService.getSiteData(window.location.search);
        setPayload(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить опубликованный сайт.');
        setErrorStatus(loadError instanceof BuilderApiError ? loadError.status : null);
      } finally {
        setLoading(false);
      }
    };

    void loadPayload();
  }, []);

  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          Загрузка сайта холдинга...
        </div>
      </div>
    );
  }

  if (!payload) {
    if (!isPreview && errorStatus === 404) {
      return <HoldingLandingPage />;
    }

    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
        <div className="max-w-xl rounded-[28px] border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">
            {isPreview ? 'Превью недоступно' : 'Публичный сайт недоступен'}
          </h1>
          <p className="mt-3 text-sm text-slate-600">{error ?? 'Не удалось собрать черновик сайта.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-6 sm:px-6">
      <SEOHead
        title={payload.site.seo_meta.title || payload.site.title}
        description={payload.site.seo_meta.description || payload.site.description}
        keywords={payload.site.seo_meta.keywords}
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              {payload.runtime.mode === 'draft' ? 'Preview' : 'Published'}
            </div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{payload.site.title}</div>
          </div>
          <div className="text-sm text-slate-500">{payload.organization.holding.name}</div>
        </div>

        <SiteBuilderRenderer
          blocks={payload.blocks}
          mode="public"
          onSubmitLead={publicHoldingSiteService.submitLead}
          site={payload.site}
        />
      </div>
    </div>
  );
};

export default HoldingLandingRuntimePage;
