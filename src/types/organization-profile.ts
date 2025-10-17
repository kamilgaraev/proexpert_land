export type OrganizationCapability = 
  | 'general_contracting'
  | 'subcontracting'
  | 'design'
  | 'construction_supervision'
  | 'equipment_rental'
  | 'materials_supply'
  | 'consulting'
  | 'facility_management';

export type ModuleInfo = string | { value: string; label: string };

export interface OrganizationProfile {
  organization_id: number;
  name: string;
  inn: string;
  capabilities: OrganizationCapability[];
  primary_business_type: string | null;
  specializations: string[];
  certifications: string[];
  profile_completeness: number;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  recommended_modules: ModuleInfo[];
}

export interface CapabilityInfo {
  value: OrganizationCapability;
  label: string;
  description: string;
  recommended_modules: ModuleInfo[];
}

export interface UpdateCapabilitiesRequest {
  capabilities: OrganizationCapability[];
}

export interface UpdateBusinessTypeRequest {
  primary_business_type: string;
}

export interface UpdateSpecializationsRequest {
  specializations: string[];
}

export interface UpdateCertificationsRequest {
  certifications: string[];
}

export interface OrganizationProfileResponse {
  success: boolean;
  data: OrganizationProfile;
}

export interface CapabilitiesListResponse {
  success: boolean;
  data: CapabilityInfo[];
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    capabilities?: OrganizationCapability[];
    primary_business_type?: string;
    specializations?: string[];
    certifications?: string[];
    profile_completeness: number;
    recommended_modules: ModuleInfo[];
  };
}

export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
  data: {
    onboarding_completed: boolean;
    onboarding_completed_at: string;
  };
}

