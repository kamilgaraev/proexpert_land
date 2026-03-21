import { useEffect, useMemo, useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { getPrimaryWorkspaceRoute, resolvePrimaryBusinessType } from '@/utils/organizationProfile';
import { CapabilitiesSelector } from '../organization/CapabilitiesSelector';
import { BusinessTypeSelector } from '../organization/BusinessTypeSelector';
import { CertificationsList } from '../organization/CertificationsList';
import { RecommendedModulesCard } from '../organization/RecommendedModulesCard';
import { SpecializationsSelector } from '../organization/SpecializationsSelector';
import { WorkspaceQuickActionsCard } from '../organization/WorkspaceQuickActionsCard';

interface OnboardingWizardProps {
  onComplete: (defaultRoute?: string) => void;
}

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const onboarding = useOnboarding();
  const {
    profile,
    availableCapabilities,
    fetchAvailableCapabilities,
    updateBusinessType,
    updateCapabilities,
    updateCertifications,
    updateSpecializations,
    completeOnboarding,
  } = useOrganizationProfile();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailableCapabilities();
  }, [fetchAvailableCapabilities]);

  useEffect(() => {
    const nextBusinessType = resolvePrimaryBusinessType(
      onboarding.data.capabilities,
      onboarding.data.primary_business_type
    );

    if (nextBusinessType !== onboarding.data.primary_business_type) {
      onboarding.updateBusinessType(nextBusinessType);
    }
  }, [
    onboarding.data.capabilities,
    onboarding.data.primary_business_type,
    onboarding.updateBusinessType,
  ]);

  const currentWorkspaceRoute = useMemo(
    () => getPrimaryWorkspaceRoute(profile?.workspace_profile),
    [profile?.workspace_profile]
  );

  const canProceed = () => {
    if (onboarding.currentStep === 'capabilities') {
      return onboarding.data.capabilities.length > 0;
    }

    if (onboarding.currentStep === 'business_type') {
      return onboarding.data.primary_business_type !== null;
    }

    return true;
  };

  const handleNext = async () => {
    if (onboarding.currentStep === 'capabilities' && onboarding.data.capabilities.length > 0) {
      try {
        setIsSaving(true);
        await updateCapabilities(onboarding.data.capabilities);
        onboarding.goNext();
      } finally {
        setIsSaving(false);
      }

      return;
    }

    if (onboarding.currentStep === 'business_type' && onboarding.data.primary_business_type) {
      try {
        setIsSaving(true);
        await updateBusinessType(onboarding.data.primary_business_type);
        onboarding.goNext();
      } finally {
        setIsSaving(false);
      }

      return;
    }

    if (onboarding.currentStep === 'specializations') {
      if (onboarding.data.specializations.length === 0) {
        onboarding.goNext();
        return;
      }

      try {
        setIsSaving(true);
        await updateSpecializations(onboarding.data.specializations);
        onboarding.goNext();
      } finally {
        setIsSaving(false);
      }

      return;
    }

    if (onboarding.currentStep === 'certifications') {
      if (onboarding.data.certifications.length === 0) {
        onboarding.goNext();
        return;
      }

      try {
        setIsSaving(true);
        await updateCertifications(onboarding.data.certifications);
        onboarding.goNext();
      } finally {
        setIsSaving(false);
      }

      return;
    }

    if (onboarding.currentStep === 'complete') {
      try {
        setIsSaving(true);
        await completeOnboarding();
        onComplete(currentWorkspaceRoute);
      } finally {
        setIsSaving(false);
      }

      return;
    }

    onboarding.goNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-construction-50 via-white to-orange-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Настройка профиля организации</h1>
            <button onClick={() => onboarding.reset()} className="text-sm text-gray-500 hover:text-gray-700">
              Сбросить
            </button>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-construction-500 to-construction-600 transition-all duration-500 ease-out"
              style={{ width: `${onboarding.progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Шаг {onboarding.allSteps.findIndex((step) => step.id === onboarding.currentStep) + 1} из{' '}
            {onboarding.allSteps.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {onboarding.currentStep === 'welcome' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-construction-500 to-orange-600">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Добро пожаловать в ProHelper</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Сначала отметьте все направления, которыми компания реально занимается, а затем выберите основной
                режим работы для личного кабинета.
              </p>
            </div>
          )}

          {onboarding.currentStep === 'capabilities' && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Направления деятельности</h2>
                <p className="text-gray-600">Выберите все направления, которыми занимается организация</p>
              </div>
              <CapabilitiesSelector
                selectedCapabilities={onboarding.data.capabilities}
                availableCapabilities={availableCapabilities}
                onChange={(capabilities) => onboarding.updateCapabilities(capabilities)}
                showRecommendations
              />
            </div>
          )}

          {onboarding.currentStep === 'business_type' && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Основной режим работы</h2>
                <p className="text-gray-600">
                  Этот режим будет открываться первым и задаст приоритет рекомендациям по модулям и действиям
                </p>
              </div>
              <BusinessTypeSelector
                selectedType={onboarding.data.primary_business_type}
                onChange={(businessType) => onboarding.updateBusinessType(businessType)}
                availableTypes={onboarding.data.capabilities}
              />
            </div>
          )}

          {onboarding.currentStep === 'specializations' && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Специализации</h2>
                <p className="text-gray-600">Укажите специализации организации, если хотите уточнить профиль</p>
              </div>
              <SpecializationsSelector
                selectedSpecializations={onboarding.data.specializations}
                onChange={(specializations) => onboarding.updateSpecializations(specializations)}
              />
            </div>
          )}

          {onboarding.currentStep === 'certifications' && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Сертификаты и допуски</h2>
                <p className="text-gray-600">Этот шаг можно пропустить и вернуться к нему позже</p>
              </div>
              <CertificationsList
                certifications={onboarding.data.certifications}
                onChange={(certifications) => onboarding.updateCertifications(certifications)}
              />
            </div>
          )}

          {onboarding.currentStep === 'complete' && (
            <div className="space-y-8">
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Профиль готов</h2>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">
                  Мы сохранили выбранные направления и собрали стартовый workspace под основной режим работы.
                </p>
              </div>

              <WorkspaceQuickActionsCard
                workspaceProfile={profile?.workspace_profile}
                onActionClick={(action) => onComplete(action.route)}
              />

              <RecommendedModulesCard
                modules={profile?.recommended_modules || []}
                onModuleClick={() => onComplete('/dashboard/modules')}
              />
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              onClick={onboarding.goPrev}
              disabled={!onboarding.canGoPrev || isSaving}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Назад
            </button>

            <div className="flex space-x-2">
              {onboarding.allSteps.map((step) => (
                <div
                  key={step.id}
                  className={`h-2 rounded-full transition-all ${
                    onboarding.completedSteps.includes(step.id) || step.id === onboarding.currentStep
                      ? 'w-8 bg-construction-600'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isSaving}
              className="rounded-lg bg-construction-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-construction-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {onboarding.currentStep === 'complete' ? 'Начать работу' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
