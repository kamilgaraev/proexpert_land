import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { getPrimaryWorkspaceRoute, resolvePrimaryBusinessType } from '@/utils/organizationProfile';
import type { OrganizationCapability } from '@/types/organization-profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CapabilitiesSelector } from './CapabilitiesSelector';
import { BusinessTypeSelector } from './BusinessTypeSelector';
import { RecommendedModulesCard } from './RecommendedModulesCard';
import { SpecializationsSelector } from './SpecializationsSelector';
import { WorkspaceQuickActionsCard } from './WorkspaceQuickActionsCard';

interface OrganizationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (defaultRoute?: string) => void;
}

type Step = 'capabilities' | 'business_type' | 'specializations' | 'workspace' | 'complete';

export const OrganizationProfileModal = ({
  isOpen,
  onClose,
  onComplete,
}: OrganizationProfileModalProps) => {
  const navigate = useNavigate();
  const {
    profile,
    availableCapabilities,
    loading,
    fetchProfile,
    fetchAvailableCapabilities,
    updateCapabilities,
    updateBusinessType,
    updateSpecializations,
    completeOnboarding,
  } = useOrganizationProfile();

  const [currentStep, setCurrentStep] = useState<Step>('capabilities');
  const [isSaving, setIsSaving] = useState(false);
  const [localCapabilities, setLocalCapabilities] = useState<OrganizationCapability[]>([]);
  const [localBusinessType, setLocalBusinessType] = useState<OrganizationCapability | null>(null);
  const [localSpecializations, setLocalSpecializations] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    fetchProfile();
    fetchAvailableCapabilities();
  }, [fetchAvailableCapabilities, fetchProfile, isOpen]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setLocalCapabilities(profile.capabilities || []);
    setLocalBusinessType(profile.primary_business_type);
    setLocalSpecializations(profile.specializations || []);
  }, [profile]);

  useEffect(() => {
    const nextBusinessType = resolvePrimaryBusinessType(localCapabilities, localBusinessType);

    if (nextBusinessType !== localBusinessType) {
      setLocalBusinessType(nextBusinessType);
    }
  }, [localCapabilities, localBusinessType]);

  const steps: { id: Step; title: string; description: string }[] = [
    {
      id: 'capabilities',
      title: 'Направления деятельности',
      description: 'Выберите все направления, которыми занимается организация',
    },
    {
      id: 'business_type',
      title: 'Основной режим работы',
      description: 'Определяет стартовый workspace и приоритет рекомендаций',
    },
    {
      id: 'specializations',
      title: 'Специализации',
      description: 'Уточните специализацию организации, если это важно',
    },
    {
      id: 'workspace',
      title: 'Стартовый workspace',
      description: 'Быстрые действия и рекомендуемые модули по выбранному режиму',
    },
    {
      id: 'complete',
      title: 'Готово',
      description: 'Профиль организации настроен',
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const primaryWorkspaceRoute = useMemo(
    () => getPrimaryWorkspaceRoute(profile?.workspace_profile),
    [profile?.workspace_profile]
  );

  const handleNext = async () => {
    try {
      setIsSaving(true);

      if (currentStep === 'capabilities') {
        await updateCapabilities(localCapabilities);
        setCurrentStep('business_type');
        return;
      }

      if (currentStep === 'business_type') {
        if (localBusinessType) {
          await updateBusinessType(localBusinessType);
        }
        setCurrentStep('specializations');
        return;
      }

      if (currentStep === 'specializations') {
        await updateSpecializations(localSpecializations);
        setCurrentStep('workspace');
        return;
      }

      if (currentStep === 'workspace') {
        setCurrentStep('complete');
        return;
      }

      await completeOnboarding();
      onComplete(primaryWorkspaceRoute);
    } catch (error) {
      console.error('Ошибка при сохранении профиля организации:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    const stepIds: Step[] = ['capabilities', 'business_type', 'specializations', 'workspace', 'complete'];
    const currentIndex = stepIds.indexOf(currentStep);

    if (currentIndex > 0) {
      setCurrentStep(stepIds[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    onComplete(primaryWorkspaceRoute);
    onClose();
  };

  const canProceed = () => {
    if (currentStep === 'capabilities') {
      return localCapabilities.length > 0;
    }

    if (currentStep === 'business_type') {
      return localBusinessType !== null;
    }

    return true;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center bg-black/50 p-4">
        <div
          className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 z-10 p-2 text-gray-400 transition-colors hover:text-gray-600"
            title="Пропустить"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="h-2 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-construction-500 to-construction-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-construction-100">
                <Building2 className="h-8 w-8 text-construction-600" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">{steps[currentStepIndex].title}</h2>
              <p className="text-gray-600">{steps[currentStepIndex].description}</p>
            </div>

            {loading && currentStepIndex === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-construction-600" />
              </div>
            ) : (
              <div className="mb-8">
                {currentStep === 'capabilities' && (
                  <CapabilitiesSelector
                    selectedCapabilities={localCapabilities}
                    availableCapabilities={availableCapabilities}
                    onChange={setLocalCapabilities}
                    showRecommendations={false}
                  />
                )}

                {currentStep === 'business_type' && (
                  <BusinessTypeSelector
                    selectedType={localBusinessType}
                    onChange={setLocalBusinessType}
                    availableTypes={localCapabilities}
                  />
                )}

                {currentStep === 'specializations' && (
                  <SpecializationsSelector
                    selectedSpecializations={localSpecializations}
                    onChange={setLocalSpecializations}
                  />
                )}

                {currentStep === 'workspace' && (
                  <div className="space-y-6">
                    <WorkspaceQuickActionsCard
                      workspaceProfile={profile?.workspace_profile}
                      onActionClick={(action) => {
                        navigate(action.route);
                        onClose();
                      }}
                    />

                    <RecommendedModulesCard
                      modules={profile?.recommended_modules || []}
                      onModuleClick={() => {
                        navigate('/dashboard/modules');
                        onClose();
                      }}
                    />
                  </div>
                )}

                {currentStep === 'complete' && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">Профиль успешно настроен</h3>
                      <p className="mb-4 text-gray-600">
                        Полнота профиля: <span className="font-bold text-construction-600">{profile?.profile_completeness || 0}%</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        После завершения откроется основной workspace, связанный с выбранным режимом работы.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-6">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`h-2 rounded-full transition-all ${
                      index <= currentStepIndex ? 'w-8 bg-construction-600' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-3">
                {currentStepIndex > 0 && currentStep !== 'complete' && (
                  <Button variant="outline" onClick={handleBack} disabled={isSaving}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                )}

                {currentStep !== 'complete' && (
                  <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
                    Пропустить
                  </Button>
                )}

                <Button onClick={handleNext} disabled={!canProceed() || isSaving} className="min-w-[160px]">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {currentStep === 'complete' ? 'Начать работу' : 'Далее'}
                      {currentStep !== 'complete' && <ArrowRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
