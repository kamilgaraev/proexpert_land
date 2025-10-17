import { useState, useCallback } from 'react';
import type { OnboardingStep, OnboardingState, OnboardingStepConfig } from '@/types/onboarding';
import type { OrganizationCapability } from '@/types/organization-profile';

const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать!',
    description: 'Настроим профиль вашей организации',
    isOptional: false,
    order: 0
  },
  {
    id: 'capabilities',
    title: 'Возможности организации',
    description: 'Что умеет делать ваша организация?',
    isOptional: false,
    order: 1
  },
  {
    id: 'business_type',
    title: 'Тип деятельности',
    description: 'Основной тип деятельности вашей организации',
    isOptional: false,
    order: 2
  },
  {
    id: 'specializations',
    title: 'Специализации',
    description: 'В каких областях вы специализируетесь?',
    isOptional: true,
    order: 3
  },
  {
    id: 'certifications',
    title: 'Сертификаты',
    description: 'Ваши сертификаты и допуски',
    isOptional: true,
    order: 4
  },
  {
    id: 'complete',
    title: 'Завершение',
    description: 'Проверим введенную информацию',
    isOptional: false,
    order: 5
  }
];

interface UseOnboardingReturn {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: OnboardingState['data'];
  progress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  currentStepConfig: OnboardingStepConfig | undefined;
  allSteps: OnboardingStepConfig[];
  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: OnboardingStep) => void;
  updateCapabilities: (capabilities: OrganizationCapability[]) => void;
  updateBusinessType: (businessType: string) => void;
  updateSpecializations: (specializations: string[]) => void;
  updateCertifications: (certifications: string[]) => void;
  reset: () => void;
}

export const useOnboarding = (): UseOnboardingReturn => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'welcome',
    completedSteps: [],
    data: {
      capabilities: [],
      primary_business_type: null,
      specializations: [],
      certifications: []
    }
  });

  const currentStepConfig = ONBOARDING_STEPS.find(s => s.id === state.currentStep);
  const currentStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === state.currentStep);
  
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;
  
  const canGoNext = currentStepIndex < ONBOARDING_STEPS.length - 1;
  const canGoPrev = currentStepIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      const nextStep = ONBOARDING_STEPS[currentStepIndex + 1];
      setState(prev => ({
        ...prev,
        currentStep: nextStep.id,
        completedSteps: prev.completedSteps.includes(prev.currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep]
      }));
    }
  }, [currentStepIndex, canGoNext]);

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      const prevStep = ONBOARDING_STEPS[currentStepIndex - 1];
      setState(prev => ({
        ...prev,
        currentStep: prevStep.id
      }));
    }
  }, [currentStepIndex, canGoPrev]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }));
  }, []);

  const updateCapabilities = useCallback((capabilities: OrganizationCapability[]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        capabilities
      }
    }));
  }, []);

  const updateBusinessType = useCallback((businessType: string) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        primary_business_type: businessType
      }
    }));
  }, []);

  const updateSpecializations = useCallback((specializations: string[]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        specializations
      }
    }));
  }, []);

  const updateCertifications = useCallback((certifications: string[]) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        certifications
      }
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentStep: 'welcome',
      completedSteps: [],
      data: {
        capabilities: [],
        primary_business_type: null,
        specializations: [],
        certifications: []
      }
    });
  }, []);

  return {
    currentStep: state.currentStep,
    completedSteps: state.completedSteps,
    data: state.data,
    progress,
    canGoNext,
    canGoPrev,
    currentStepConfig,
    allSteps: ONBOARDING_STEPS,
    goNext,
    goPrev,
    goToStep,
    updateCapabilities,
    updateBusinessType,
    updateSpecializations,
    updateCertifications,
    reset
  };
};

