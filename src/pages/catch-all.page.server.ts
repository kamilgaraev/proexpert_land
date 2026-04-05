import { isKnownMarketingPath, normalizeMarketingPath } from '@/data/marketingRegistry';

export function onBeforeRender(pageContext: { urlPathname?: string }) {
  const normalizedPath = normalizeMarketingPath(pageContext.urlPathname || '/');

  return {
    pageContext: {
      routeStatusCode: isKnownMarketingPath(normalizedPath) ? 200 : 404,
    },
  };
}
