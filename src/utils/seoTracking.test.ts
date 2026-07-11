import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/marketingConsent', () => ({
  hasAnalyticsConsent: () => true,
}));

vi.mock('@/utils/publicSite', () => ({
  isMarketingPublicPath: () => true,
  isPrimaryMarketingHost: () => true,
}));

import { SEOTracker } from './seoTracking';

describe('SEOTracker', () => {
  beforeEach(() => {
    window.ym = vi.fn();
  });

  it('отправляет SEO-цели в новый счетчик', () => {
    const tracker = new SEOTracker();

    tracker.trackCTAClick('Попробовать', 'hero');

    expect(window.ym).toHaveBeenCalledWith(
      110599591,
      'reachGoal',
      'SEO_CTA_CLICK',
      expect.objectContaining({ category: 'SEO_Optimization' }),
    );
  });
});
