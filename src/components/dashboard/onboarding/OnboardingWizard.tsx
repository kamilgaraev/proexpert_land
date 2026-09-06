import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { getPrimaryWorkspaceRoute, resolvePrimaryBusinessType } from '@/utils/organizationProfile';
import { CapabilitiesSelector } from '../organization/CapabilitiesSelector';
import { BusinessTypeSelector } from '../organization/BusinessTypeSelector';
import { CertificationsList } from '../organization/CertificationsList';
import { RecommendedPackagesCard } from '../organization/RecommendedPackagesCard';
import { SpecializationsSelector } from '../organization/SpecializationsSelector';
import { WorkspaceQuickActionsCard } from '../organization/WorkspaceQuickActionsCard';
import { rememberCommercialIntent } from '@/utils/commercialIntent';
import { getRecommendedPackages } from '@/utils/recommendedPackages';

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveInFlight = useRef(false);

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
  const recommendedPackages = useMemo(
    () => getRecommendedPackages(profile?.recommended_modules ?? []),
    [profile?.recommended_modules],
  );

  const openPackage = (packageSlug: Parameters<typeof rememberCommercialIntent>[0][number]) => {
    rememberCommercialIntent([packageSlug]);
    onComplete('/dashboard/billing');
  };

  const canProceed = () => {
    if (onboarding.currentStep === 'capabilities') {
      return onboarding.data.capabilities.length > 0;
    }

    if (onboarding.currentStep === 'business_type') {
      return onboarding.data.primary_business_type !== null;
    }

    return true;
  };

  const advanceStep = async () => {
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

  const handleNext = async () => {
    if (saveInFlight.current || !canProceed()) return;
    if (onboarding.currentStep === 'welcome') {
      onboarding.goNext();
      return;
    }
    saveInFlight.current = true;
    setSaveError(null);
    try {
      await advanceStep();
    } catch {
      setSaveError('Не удалось сохранить настройки. Ваш выбор остался в форме. Повторите попытку, когда соединение восстановится.');
    } finally {
      saveInFlight.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">Настройка профиля организации</h1>
            <Button variant="ghost" disabled={isSaving} onClick={() => { setSaveError(null); onboarding.reset(); }}>
              Сбросить
            </Button>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${onboarding.progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Шаг {onboarding.allSteps.findIndex((step) => step.id === onboarding.currentStep) + 1} из{' '}
            {onboarding.allSteps.length}
          </p>
        </div>

        <div className="rounded-sm border border-border bg-card p-5 sm:p-8">
          {onboarding.currentStep === 'welcome' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <svg className="h-10 w-10 text-foreground" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground">Добро пожаловать в МОСТ</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Сначала отметьте все направления, которыми компания реально занимается, а затем выберите основной
                режим работы для личного кабинета.
              </p>
            </div>
          )}

          {onboarding.currentStep === 'capabilities' && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-foreground">Направления деятельности</h2>
                <p className="text-muted-foreground">Выберите все направления, которыми занимается организация</p>
              </div>
              <CapabilitiesSelector
                selectedCapabilities={onboarding.data.capabilities}
                availableCapabilities={availableCapabilities}
                onChange={(capabilities) => onboarding.updateCapabilities(capabilities)}
                onPackageClick={openPackage}
                showRecommendations
              />
            </div>
          )}

          {onboarding.currentStep === 'business_type' && (
            <div className="space-y-6">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold text-foreground">Основной режим работы</h2>
                <p className="text-muted-foreground">
                  Этот режим будет открываться первым и задаст приоритет рекомендациям по пакетам и действиям
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
                <h2 className="mb-2 text-2xl font-bold text-foreground">Специализации</h2>
                <p className="text-muted-foreground">Укажите специализации организации, если хотите уточнить профиль</p>
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
                <h2 className="mb-2 text-2xl font-bold text-foreground">Сертификаты и допуски</h2>
                <p className="text-muted-foreground">Этот шаг можно пропустить и вернуться к нему позже</p>
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
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <svg className="h-10 w-10 text-foreground" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-foreground">Профиль готов</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Мы сохранили выбранные направления и собрали стартовый раздел под основной режим работы.
                </p>
              </div>

              <WorkspaceQuickActionsCard
                workspaceProfile={profile?.workspace_profile}
                onActionClick={(action) => onComplete(action.route)}
              />

              <RecommendedPackagesCard
                packages={recommendedPackages}
                onPackageClick={openPackage}
              />
            </div>
          )}

          {saveError && <p role="alert" className="mt-6 rounded-sm border border-border bg-muted p-4 text-sm text-foreground">{saveError}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={() => { setSaveError(null); onboarding.goPrev(); }}
              disabled={!onboarding.canGoPrev || isSaving}
            >
              Назад
            </Button>

            <div className="hidden space-x-2 sm:flex" aria-hidden="true">
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

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSaving}
            >
              {onboarding.currentStep === 'complete' ? 'Начать работу' : 'Далее'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
