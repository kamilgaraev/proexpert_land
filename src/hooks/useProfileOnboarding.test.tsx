import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OrganizationProfile } from '@/types/organization-profile';

const { fetchProfileMock, useOrganizationProfileMock } = vi.hoisted(() => ({
  fetchProfileMock: vi.fn(),
  useOrganizationProfileMock: vi.fn(),
}));

vi.mock('./useOrganizationProfile', () => ({
  useOrganizationProfile: useOrganizationProfileMock,
}));

import { useProfileOnboarding } from './useProfileOnboarding';

const createProfile = (overrides: Partial<OrganizationProfile> = {}): OrganizationProfile => ({
  organization_id: 15,
  name: 'Строй Контур',
  inn: '7700000000',
  capabilities: ['general_contracting'],
  primary_business_type: 'general_contracting',
  specializations: [],
  certifications: [],
  profile_completeness: 100,
  onboarding_completed: true,
  onboarding_completed_at: '2026-04-01T10:00:00+03:00',
  recommended_modules: [],
  workspace_profile: null,
  ...overrides,
});

const mockProfile = (profile: OrganizationProfile | null) => {
  useOrganizationProfileMock.mockReturnValue({
    profile,
    loading: false,
    error: null,
    availableCapabilities: [],
    fetchProfile: fetchProfileMock,
    updateCapabilities: vi.fn(),
    updateBusinessType: vi.fn(),
    updateSpecializations: vi.fn(),
    updateCertifications: vi.fn(),
    completeOnboarding: vi.fn(),
    fetchAvailableCapabilities: vi.fn(),
    refresh: vi.fn(),
  });
};

describe('useProfileOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('не открывает мастер для организации с завершенным onboarding даже при неполном профиле', () => {
    mockProfile(createProfile({ profile_completeness: 60 }));

    const { result } = renderHook(() => useProfileOnboarding());

    expect(result.current.shouldShowOnboarding).toBe(false);
    expect(window.sessionStorage.getItem('profile_onboarding_shown')).toBeNull();
  });
});
