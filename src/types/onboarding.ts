import { OrganizationCapability } from './organization-profile';

export type OnboardingStep = 
  | 'welcome'
  | 'capabilities'
  | 'business_type'
  | 'specializations'
  | 'certifications'
  | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: {
    capabilities: OrganizationCapability[];
    primary_business_type: string | null;
    specializations: string[];
    certifications: string[];
  };
}

export interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  isOptional: boolean;
  order: number;
}

