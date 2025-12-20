import { useState, useEffect, useCallback } from 'react';
import { useOrganizationProfile } from './useOrganizationProfile';

const ONBOARDING_STORAGE_KEY = 'profile_onboarding_skipped';
const ONBOARDING_SHOWN_KEY = 'profile_onboarding_shown';

interface UseProfileOnboardingReturn {
  shouldShowOnboarding: boolean;
  isLoading: boolean;
  showOnboarding: () => void;
  hideOnboarding: () => void;
  skipOnboarding: () => void;
  isOnboardingCompleted: boolean;
  profileCompleteness: number;
}

export const useProfileOnboarding = (): UseProfileOnboardingReturn => {
  const { profile, loading, fetchProfile } = useOrganizationProfile();
  const [shouldShow, setShouldShow] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const isOnboardingSkipped = useCallback(() => {
    try {
      const skipped = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return skipped === 'true';
    } catch {
      return false;
    }
  }, []);

  const wasOnboardingShown = useCallback(() => {
    try {
      const shown = sessionStorage.getItem(ONBOARDING_SHOWN_KEY);
      return shown === 'true';
    } catch {
      return false;
    }
  }, []);

  const markOnboardingAsShown = useCallback(() => {
    try {
      sessionStorage.setItem(ONBOARDING_SHOWN_KEY, 'true');
    } catch {
      console.error('Не удалось сохранить статус показа онбординга');
    }
  }, []);

  const checkShouldShowOnboarding = useCallback(() => {
    if (!profile || hasChecked) return;

    const skipped = isOnboardingSkipped();
    const alreadyShown = wasOnboardingShown();

    const isIncomplete = !profile.onboarding_completed || (profile.profile_completeness < 80);
    
    const needsOnboarding = isIncomplete && !skipped && !alreadyShown;

    if (needsOnboarding) {
      setShouldShow(true);
      markOnboardingAsShown();
    }

    setHasChecked(true);
  }, [profile, hasChecked, isOnboardingSkipped, wasOnboardingShown, markOnboardingAsShown]);

  useEffect(() => {
    if (!loading && !profile) {
      fetchProfile();
    }
  }, [loading, profile, fetchProfile]);

  useEffect(() => {
    if (profile && !loading) {
      checkShouldShowOnboarding();
    }
  }, [profile, loading, checkShouldShowOnboarding]);

  const showOnboarding = useCallback(() => {
    setShouldShow(true);
    markOnboardingAsShown();
  }, [markOnboardingAsShown]);

  const hideOnboarding = useCallback(() => {
    setShouldShow(false);
  }, []);

  const skipOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setShouldShow(false);
    } catch {
      console.error('Не удалось сохранить статус пропуска онбординга');
    }
  }, []);

  return {
    shouldShowOnboarding: shouldShow,
    isLoading: loading,
    showOnboarding,
    hideOnboarding,
    skipOnboarding,
    isOnboardingCompleted: profile?.onboarding_completed || false,
    profileCompleteness: profile?.profile_completeness || 0
  };
};

