import { useState, useCallback } from 'react';
import { organizationProfileService } from '@/utils/api';
import { toast } from 'react-toastify';
import type {
  OrganizationProfile,
  OrganizationCapability,
  CapabilityInfo
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
  updateBusinessType: (businessType: string) => Promise<void>;
  updateSpecializations: (specializations: string[]) => Promise<void>;
  updateCertifications: (certifications: string[]) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  fetchAvailableCapabilities: () => Promise<void>;
  refresh: () => Promise<void>;
}

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
      
      if (response.data && response.data.success) {
        const responseData = response.data.data;
        const profileData = responseData.profile || responseData;
        
        let recommendedModules = responseData.recommended_modules || profileData.recommended_modules || [];
        if (typeof recommendedModules === 'object' && !Array.isArray(recommendedModules)) {
          recommendedModules = Object.values(recommendedModules);
        }
        
        setProfile({
          ...profileData,
          name: responseData.organization?.name || profileData.name,
          inn: responseData.organization?.inn || profileData.inn,
          address: responseData.organization?.address || profileData.address,
          capabilities: profileData.capabilities || [],
          specializations: profileData.specializations || [],
          certifications: profileData.certifications || [],
          recommended_modules: recommendedModules
        });
      } else {
        setError(response.data?.message || 'Ошибка загрузки профиля организации');
      }
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
      
      if (response.data && response.data.success) {
        const updateData = response.data.data;
        const profileData = updateData.profile || updateData;
        
        let recommendedModules = updateData.recommended_modules || [];
        if (typeof recommendedModules === 'object' && !Array.isArray(recommendedModules)) {
          recommendedModules = Object.values(recommendedModules);
        }
        
        setProfile(prev => prev ? {
          ...prev,
          capabilities,
          profile_completeness: profileData.profile_completeness || prev.profile_completeness,
          recommended_modules: recommendedModules
        } : null);
        toast.success(response.data.message || 'Capabilities успешно обновлены!');
      } else {
        throw new Error(response.data?.message || 'Ошибка обновления capabilities');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка обновления capabilities';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBusinessType = useCallback(async (businessType: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationProfileService.updateBusinessType(businessType);
      
      if (response.data && response.data.success) {
        const updateData = response.data.data;
        const profileData = updateData.profile || updateData;
        
        let recommendedModules = updateData.recommended_modules || [];
        if (typeof recommendedModules === 'object' && !Array.isArray(recommendedModules)) {
          recommendedModules = Object.values(recommendedModules);
        }
        
        setProfile(prev => prev ? {
          ...prev,
          primary_business_type: businessType,
          profile_completeness: profileData.profile_completeness || prev.profile_completeness,
          recommended_modules: recommendedModules
        } : null);
        toast.success(response.data.message || 'Тип бизнеса успешно обновлен!');
      } else {
        throw new Error(response.data?.message || 'Ошибка обновления типа бизнеса');
      }
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
      
      if (response.data && response.data.success) {
        const updateData = response.data.data;
        const profileData = updateData.profile || updateData;
        
        setProfile(prev => prev ? {
          ...prev,
          specializations,
          profile_completeness: profileData.profile_completeness || prev.profile_completeness
        } : null);
        toast.success(response.data.message || 'Специализации успешно обновлены!');
      } else {
        throw new Error(response.data?.message || 'Ошибка обновления специализаций');
      }
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
      
      if (response.data && response.data.success) {
        const updateData = response.data.data;
        const profileData = updateData.profile || updateData;
        
        setProfile(prev => prev ? {
          ...prev,
          certifications,
          profile_completeness: profileData.profile_completeness || prev.profile_completeness
        } : null);
        toast.success(response.data.message || 'Сертификаты успешно обновлены!');
      } else {
        throw new Error(response.data?.message || 'Ошибка обновления сертификатов');
      }
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
      
      if (response.data && response.data.success) {
        const completionData = response.data.data;
        setProfile(prev => prev ? {
          ...prev,
          onboarding_completed: completionData.onboarding_completed,
          onboarding_completed_at: completionData.onboarding_completed_at
        } : null);
        toast.success(response.data.message || 'Onboarding успешно завершен!');
      } else {
        throw new Error(response.data?.message || 'Ошибка завершения onboarding');
      }
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
      
      if (response.data && response.data.success) {
        setAvailableCapabilities(response.data.data || []);
      } else {
        setError(response.data?.message || 'Ошибка загрузки списка capabilities');
        setAvailableCapabilities([]);
      }
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
    refresh
  };
};

