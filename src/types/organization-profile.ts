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
export type WorkspaceInteractionMode =
  | 'project_participant'
  | 'procurement_counterparty'
  | 'service_counterparty';

export interface WorkspaceAction {
  key: string;
  label: string;
  route: string;
}

export interface WorkspaceOption {
  value: OrganizationCapability;
  label: string;
  default_route: string;
  interaction_modes: WorkspaceInteractionMode[];
  allowed_project_roles: string[];
  recommended_modules: ModuleInfo[];
}

export interface WorkspaceProfile {
  primary_profile: OrganizationCapability | null;
  workspace_options: WorkspaceOption[];
  recommended_actions: WorkspaceAction[];
}

export interface OrganizationProfile {
  organization_id: number;
  name: string;
  inn: string;
  capabilities: OrganizationCapability[];
  primary_business_type: OrganizationCapability | null;
  specializations: string[];
  certifications: string[];
  profile_completeness: number;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  recommended_modules: ModuleInfo[];
  workspace_profile?: WorkspaceProfile | null;
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
  primary_business_type: OrganizationCapability;
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
    primary_business_type?: OrganizationCapability | null;
    specializations?: string[];
    certifications?: string[];
    profile_completeness: number;
    recommended_modules: ModuleInfo[];
    workspace_profile?: WorkspaceProfile;
  };
}

export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
  data: {
    onboarding_completed: boolean;
    onboarding_completed_at: string;
    primary_business_type?: OrganizationCapability | null;
    profile_completeness?: number;
    recommended_modules?: ModuleInfo[];
    workspace_profile?: WorkspaceProfile;
  };
}

