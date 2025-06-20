import { useCallback } from 'react';
import { trackYandexGoal, trackYandexEvent } from '../components/analytics/YandexMetrika';

export const useAnalytics = () => {
  const trackGoal = useCallback((goalName: string, params?: Record<string, any>) => {
    trackYandexGoal(goalName, params);
  }, []);

  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    trackYandexEvent(eventName, params);
  }, []);

  const trackFormSubmit = useCallback((formName: string, formData?: Record<string, any>) => {
    trackGoal('form_submit', {
      form_name: formName,
      ...formData
    });
  }, []);

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      location: location || window.location.pathname
    });
  }, []);

  const trackPageView = useCallback((pageName: string, additionalParams?: Record<string, any>) => {
    trackEvent('page_view', {
      page_name: pageName,
      url: window.location.href,
      ...additionalParams
    });
  }, []);

  const trackRegistration = useCallback((method: string = 'email') => {
    trackGoal('registration', {
      method,
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackLogin = useCallback((method: string = 'email') => {
    trackGoal('login', {
      method,
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackPricingView = useCallback((plan?: string) => {
    trackEvent('pricing_view', {
      plan,
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackContactForm = useCallback((formType: string, contactData?: Record<string, any>) => {
    trackGoal('contact_form', {
      form_type: formType,
      ...contactData
    });
  }, []);

  const trackDownload = useCallback((fileName: string, fileType: string) => {
    trackGoal('download', {
      file_name: fileName,
      file_type: fileType,
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackApiDocumentation = useCallback((section: string) => {
    trackEvent('api_docs_view', {
      section,
      timestamp: new Date().toISOString()
    });
  }, []);

  const trackIntegrationInterest = useCallback((integrationName: string) => {
    trackGoal('integration_interest', {
      integration_name: integrationName,
      timestamp: new Date().toISOString()
    });
  }, []);

  return {
    trackGoal,
    trackEvent,
    trackFormSubmit,
    trackButtonClick,
    trackPageView,
    trackRegistration,
    trackLogin,
    trackPricingView,
    trackContactForm,
    trackDownload,
    trackApiDocumentation,
    trackIntegrationInterest
  };
};

export default useAnalytics; 