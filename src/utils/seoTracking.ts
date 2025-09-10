export interface SEOEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

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
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.initMetrika();
    this.trackPageView();
    
    this.isInitialized = true;
  }

  private initMetrika() {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");

      ym(102888970, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        trackHash: true
      });
    `;
    document.head.appendChild(script);
  }

  trackPageView(url?: string) {
    const currentUrl = url || window.location.href;
    const pageTitle = document.title;

    const ymGlobal = (window as any).ym;
    if (ymGlobal) {
      ymGlobal(102888970, 'hit', currentUrl, {
        title: pageTitle
      });
    }
  }

  trackEvent(event: SEOEvent) {
    const ymGlobal = (window as any).ym;
    if (ymGlobal) {
      ymGlobal(102888970, 'reachGoal', event.action, {
        category: event.category,
        label: event.label,
        value: event.value
      });
    }
  }

  trackKeywordClick(keyword: string, elementType: string) {
    this.trackEvent({
      action: 'SEO_KEYWORD_CLICK',
      category: 'SEO_Optimization',
      label: `${keyword}_${elementType}`,
      value: 1
    });
  }

  trackCTAClick(ctaText: string, position: string) {
    this.trackEvent({
      action: 'SEO_CTA_CLICK',
      category: 'SEO_Optimization',
      label: `${ctaText}_${position}`,
      value: 1
    });
  }

  trackFormSubmit(formType: string) {
    this.trackEvent({
      action: 'FORM_SUBMIT',
      category: 'Business_Goals',
      label: formType,
      value: 10
    });
  }

  trackPhoneClick() {
    this.trackEvent({
      action: 'PHONE_CLICK',
      category: 'Business_Goals',
      label: 'contact_phone',
      value: 5
    });
  }

  trackBusinessGoal(goal: string, value?: number) {
    this.trackEvent({
      action: goal.toUpperCase(),
      category: 'Business_Goals',
      value: value || 1
    });

    const ymGlobal = (window as any).ym;
    if (ymGlobal) {
      ymGlobal(102888970, 'reachGoal', goal.toUpperCase());
    }
  }
}

export const seoTracker = SEOTracker.getInstance();

export const initSEOTracking = () => {
  seoTracker.init();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const seoId = element.getAttribute('data-seo-track');
        
        if (seoId) {
          seoTracker.trackEvent({
            action: 'ELEMENT_VIEW',
            category: 'SEO_Engagement',
            label: seoId,
            value: 1
          });
        }
      }
    });
  }, {
    threshold: 0.5
  });

  document.querySelectorAll('[data-seo-track]').forEach((element) => {
    observer.observe(element);
  });

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const seoTrack = target.getAttribute('data-seo-track') || 
                    target.closest('[data-seo-track]')?.getAttribute('data-seo-track');
    
    if (seoTrack) {
      seoTracker.trackEvent({
        action: 'ELEMENT_CLICK',
        category: 'SEO_Engagement',
        label: seoTrack,
        value: 1
      });
    }
  });
}; 