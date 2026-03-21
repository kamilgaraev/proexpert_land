import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { organizationProfileService } from '@/utils/api';
import type {
  CapabilityInfo,
  ModuleInfo,
  OrganizationCapability,
  OrganizationProfile,
  WorkspaceProfile,
} from '@/types/organization-profile';

interface UseOrganizationProfileState {
  profile: OrganizationProfile | null;
  availableCapabilities: CapabilityInfo[];
  loading: boolean;
  error: string | null;
}

interface UseOrganizationProfileReturn extends UseOrganizationProfileState {
  fetchProfile: () => Promise<void>;
  updateCapabilities: (capabilities: OrganizationCapability[]) => Promise<void>;
  updateBusinessType: (businessType: OrganizationCapability) => Promise<void>;
  updateSpecializations: (specializations: string[]) => Promise<void>;
  updateCertifications: (certifications: string[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  fetchAvailableCapabilities: () => Promise<void>;
  refresh: () => Promise<void>;
}

const normalizeRecommendedModules = (recommendedModules: unknown): ModuleInfo[] => {
  if (!recommendedModules) {
    return [];
  }

  if (Array.isArray(recommendedModules)) {
    return recommendedModules as ModuleInfo[];
  }

  if (typeof recommendedModules === 'object') {
    return Object.values(recommendedModules as Record<string, ModuleInfo>);
  }

  return [];
};

const normalizeWorkspaceProfile = (workspaceProfile: unknown): WorkspaceProfile | null => {
  if (!workspaceProfile || typeof workspaceProfile !== 'object') {
    return null;
  }

  return workspaceProfile as WorkspaceProfile;
};

const normalizeProfile = (responseData: any): OrganizationProfile => {
  const profileData = responseData.profile || responseData;

  return {
    ...profileData,
    name: responseData.organization?.name || profileData.name,
    inn: responseData.organization?.inn || profileData.inn,
    capabilities: profileData.capabilities || [],
    primary_business_type: profileData.primary_business_type || null,
    specializations: profileData.specializations || [],
    certifications: profileData.certifications || [],
    recommended_modules: normalizeRecommendedModules(
      responseData.recommended_modules || profileData.recommended_modules
    ),
    workspace_profile: normalizeWorkspaceProfile(
      responseData.workspace_profile || profileData.workspace_profile
    ),
  };
};

const mergeProfileUpdate = (
  currentProfile: OrganizationProfile | null,
  updateData: any
): OrganizationProfile | null => {
  if (!currentProfile) {
    return null;
  }

  return {
    ...currentProfile,
    primary_business_type: updateData.primary_business_type ?? currentProfile.primary_business_type,
    profile_completeness: updateData.profile_completeness ?? currentProfile.profile_completeness,
    recommended_modules: normalizeRecommendedModules(updateData.recommended_modules),
    workspace_profile:
      normalizeWorkspaceProfile(updateData.workspace_profile) ?? currentProfile.workspace_profile,
  };
};

export const useOrganizationProfile = (): UseOrganizationProfileReturn => {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [availableCapabilities, setAvailableCapabilities] = useState<CapabilityInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.getProfile();

      if (response.data?.success) {
        setProfile(normalizeProfile(response.data.data));
        return;
      }

      setError(response.data?.message || 'Ошибка загрузки профиля организации');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки профиля организации';
      setError(errorMessage);
      console.error('Ошибка при загрузке профиля организации:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCapabilities = useCallback(async (capabilities: OrganizationCapability[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.updateCapabilities(capabilities);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ошибка обновления capabilities');
      }

      setProfile((currentProfile) => {
        const nextProfile = mergeProfileUpdate(currentProfile, response.data.data);

        if (!nextProfile) {
          return currentProfile;
        }

        return {
          ...nextProfile,
          capabilities,
        };
      });

      toast.success(response.data.message || 'Capabilities успешно обновлены!');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления capabilities';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusinessType = useCallback(async (businessType: OrganizationCapability) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.updateBusinessType(businessType);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ошибка обновления типа бизнеса');
      }

      setProfile((currentProfile) => mergeProfileUpdate(currentProfile, response.data.data));
      toast.success(response.data.message || 'Основной режим работы успешно обновлен!');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления типа бизнеса';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSpecializations = useCallback(async (specializations: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.updateSpecializations(specializations);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ошибка обновления специализаций');
      }

      setProfile((currentProfile) => {
        const nextProfile = mergeProfileUpdate(currentProfile, response.data.data);

        if (!nextProfile) {
          return currentProfile;
        }

        return {
          ...nextProfile,
          specializations,
        };
      });

      toast.success(response.data.message || 'Специализации успешно обновлены!');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления специализаций';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCertifications = useCallback(async (certifications: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.updateCertifications(certifications);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ошибка обновления сертификатов');
      }

      setProfile((currentProfile) => {
        const nextProfile = mergeProfileUpdate(currentProfile, response.data.data);

        if (!nextProfile) {
          return currentProfile;
        }

        return {
          ...nextProfile,
          certifications,
        };
      });

      toast.success(response.data.message || 'Сертификаты успешно обновлены!');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления сертификатов';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.completeOnboarding();

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ошибка завершения onboarding');
      }

      setProfile((currentProfile) => {
        const nextProfile = mergeProfileUpdate(currentProfile, response.data.data);

        if (!nextProfile) {
          return currentProfile;
        }

        return {
          ...nextProfile,
          onboarding_completed: response.data.data.onboarding_completed,
          onboarding_completed_at: response.data.data.onboarding_completed_at,
        };
      });

      toast.success(response.data.message || 'Onboarding успешно завершен!');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка завершения onboarding';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableCapabilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.getAvailableCapabilities();

      if (response.data?.success) {
        setAvailableCapabilities(response.data.data || []);
        return;
      }

      setError(response.data?.message || 'Ошибка загрузки списка capabilities');
      setAvailableCapabilities([]);
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки списка capabilities';
      setError(errorMessage);
      setAvailableCapabilities([]);
      console.error('Ошибка при загрузке списка capabilities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    availableCapabilities,
    loading,
    error,
    fetchProfile,
    updateCapabilities,
    updateBusinessType,
    updateSpecializations,
    updateCertifications,
    completeOnboarding,
    fetchAvailableCapabilities,
    refresh,
  };
};
