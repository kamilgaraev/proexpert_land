import {
  hasAnalyticsConsent,
} from '@/utils/marketingConsent';
import {
  isMarketingPublicPath,
  isPrimaryMarketingHost,
} from '@/utils/publicSite';

export interface SEOEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

const COUNTER_ID = 102888970;

const canTrack = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    hasAnalyticsConsent() &&
    isPrimaryMarketingHost(window.location.hostname) &&
    isMarketingPublicPath(window.location.pathname)
  );
};

export class SEOTracker {
  private static instance: SEOTracker;
  private isInitialized = false;

  static getInstance(): SEOTracker {
    if (!SEOTracker.instance) {
      SEOTracker.instance = new SEOTracker();
    }

    return SEOTracker.instance;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.isInitialized = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const seoId = element.getAttribute('data-seo-track');

          if (seoId) {
            this.trackEvent({
              action: 'ELEMENT_VIEW',
              category: 'SEO_Engagement',
              label: seoId,
              value: 1,
            });
          }
        });
      },
      {
        threshold: 0.5,
      },
    );

    document.querySelectorAll('[data-seo-track]').forEach((element) => {
      observer.observe(element);
    });

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const seoTrack =
        target.getAttribute('data-seo-track') ??
        target.closest('[data-seo-track]')?.getAttribute('data-seo-track');

      if (seoTrack) {
        this.trackEvent({
          action: 'ELEMENT_CLICK',
          category: 'SEO_Engagement',
          label: seoTrack,
          value: 1,
        });
      }
    });
  }

  trackPageView(url?: string) {
    if (!canTrack()) {
      return;
    }

    const currentUrl = url ?? window.location.href;
    window.ym?.(COUNTER_ID, 'hit', currentUrl, {
      title: document.title,
      referer: document.referrer,
    });
  }

  trackEvent(event: SEOEvent) {
    if (!canTrack()) {
      return;
    }

    window.ym?.(COUNTER_ID, 'reachGoal', event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
    });
  }

  trackKeywordClick(keyword: string, elementType: string) {
    this.trackEvent({
      action: 'SEO_KEYWORD_CLICK',
      category: 'SEO_Optimization',
      label: `${keyword}_${elementType}`,
      value: 1,
    });
  }

  trackCTAClick(ctaText: string, position: string) {
    this.trackEvent({
      action: 'SEO_CTA_CLICK',
      category: 'SEO_Optimization',
      label: `${ctaText}_${position}`,
      value: 1,
    });
  }

  trackFormSubmit(formType: string) {
    this.trackEvent({
      action: 'FORM_SUBMIT',
      category: 'Business_Goals',
      label: formType,
      value: 10,
    });
  }

  trackPhoneClick() {
    this.trackEvent({
      action: 'PHONE_CLICK',
      category: 'Business_Goals',
      label: 'contact_phone',
      value: 5,
    });
  }

  trackBusinessGoal(goal: string, value?: number) {
    this.trackEvent({
      action: goal.toUpperCase(),
      category: 'Business_Goals',
      value: value ?? 1,
    });
  }
}

export const seoTracker = SEOTracker.getInstance();

export const initSEOTracking = () => {
  seoTracker.init();
};
