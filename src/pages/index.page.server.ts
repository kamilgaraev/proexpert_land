import { isHoldingHostname } from '@/utils/holdingDomain';
import { loadHoldingPageContext } from './holdingSiteSsr';

export const doNotPrerender = true;

export async function onBeforeRender(pageContext: { requestHostname?: string; urlOriginal?: string }) {
  const hostname = pageContext.requestHostname || '';
  if (!isHoldingHostname(hostname)) return { pageContext: {} };

  const search = new URL(pageContext.urlOriginal || '/', 'https://1мост.рф').search;
  return { pageContext: await loadHoldingPageContext(hostname, '/', search) };
}
