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
        const data = await publicHoldingSiteService.getSiteData(window.location.pathname, window.location.search);
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
  const showPreviewBadge = isPreview && payload?.runtime.mode === 'draft';
  const navigation =
    payload?.navigation && payload.navigation.length > 0
      ? payload.navigation
      : (payload?.pages ?? [])
          .filter((page) => page.is_active)
          .map((page) => ({
            id: page.id,
            slug: page.slug,
            label: page.navigation_label || page.title,
            page_type: page.page_type,
            is_home: page.is_home,
          }));

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <SEOHead
        title={payload.current_page?.seo_meta.title || payload.site.seo_meta.title || payload.site.title}
        description={
          payload.current_page?.seo_meta.description ||
          payload.site.seo_meta.description ||
          payload.site.description
        }
        keywords={payload.site.seo_meta.keywords}
      />
      {showPreviewBadge && (
        <div className="fixed right-4 top-4 z-50 inline-flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Режим превью</span>
        </div>
      )}
      <SiteBuilderRenderer
        blog={payload.blog}
        blocks={payload.blocks}
        mode="public"
        navigation={navigation}
        onSubmitLead={publicHoldingSiteService.submitLead}
        page={payload.current_page ?? payload.page ?? null}
        site={payload.site}
      />
    </div>
  );
};

export default HoldingLandingRuntimePage;
