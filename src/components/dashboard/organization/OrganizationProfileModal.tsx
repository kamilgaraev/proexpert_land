import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { CapabilitiesSelector } from './CapabilitiesSelector';
import { BusinessTypeSelector } from './BusinessTypeSelector';
import { SpecializationsSelector } from './SpecializationsSelector';
import { RecommendedModulesCard } from './RecommendedModulesCard';
import type { OrganizationCapability } from '@/types/organization-profile';
import { 
  Building2, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OrganizationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'capabilities' | 'business_type' | 'specializations' | 'modules' | 'complete';

export const OrganizationProfileModal = ({
  isOpen,
  onClose,
  onComplete
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
    completeOnboarding
  } = useOrganizationProfile();

  const [currentStep, setCurrentStep] = useState<Step>('capabilities');
  const [isSaving, setIsSaving] = useState(false);
  
  const [localCapabilities, setLocalCapabilities] = useState<OrganizationCapability[]>([]);
  const [localBusinessType, setLocalBusinessType] = useState<string | null>(null);
  const [localSpecializations, setLocalSpecializations] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      fetchAvailableCapabilities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (profile) {
      setLocalCapabilities(profile.capabilities || []);
      setLocalBusinessType(profile.primary_business_type);
      setLocalSpecializations(profile.specializations || []);
    }
  }, [profile]);

  const steps: { id: Step; title: string; description: string }[] = [
    { 
      id: 'capabilities', 
      title: 'Возможности организации', 
      description: 'Выберите, что умеет делать ваша организация' 
    },
    { 
      id: 'business_type', 
      title: 'Основной тип деятельности', 
      description: 'Укажите основное направление вашего бизнеса' 
    },
    { 
      id: 'specializations', 
      title: 'Специализации', 
      description: 'В каких областях вы специализируетесь?' 
    },
    { 
      id: 'modules', 
      title: 'Рекомендуемые модули', 
      description: 'На основе вашего профиля мы рекомендуем следующие модули' 
    },
    { 
      id: 'complete', 
      title: 'Готово!', 
      description: 'Профиль организации настроен' 
    }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = async () => {
    try {
      setIsSaving(true);

      if (currentStep === 'capabilities') {
        await updateCapabilities(localCapabilities);
        setCurrentStep('business_type');
      } else if (currentStep === 'business_type') {
        if (localBusinessType) {
          await updateBusinessType(localBusinessType);
        }
        setCurrentStep('specializations');
      } else if (currentStep === 'specializations') {
        await updateSpecializations(localSpecializations);
        setCurrentStep('modules');
      } else if (currentStep === 'modules') {
        setCurrentStep('complete');
      } else if (currentStep === 'complete') {
        await completeOnboarding();
        onComplete();
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    const stepIds: Step[] = ['capabilities', 'business_type', 'specializations', 'modules', 'complete'];
    const currentIndex = stepIds.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepIds[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const canProceed = () => {
    if (currentStep === 'capabilities') return localCapabilities.length > 0;
    if (currentStep === 'business_type') return localBusinessType !== null;
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Пропустить"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="h-2 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-construction-500 to-construction-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-construction-100 rounded-full mb-4">
                <Building2 className="w-8 h-8 text-construction-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {steps[currentStepIndex].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStepIndex].description}
              </p>
            </div>

            {loading && currentStepIndex === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-construction-600" />
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
                    selectedBusinessType={localBusinessType}
                    onChange={setLocalBusinessType}
                  />
                )}

                {currentStep === 'specializations' && (
                  <SpecializationsSelector
                    selectedSpecializations={localSpecializations}
                    onChange={setLocalSpecializations}
                  />
                )}

                {currentStep === 'modules' && profile && (
                  <RecommendedModulesCard
                    modules={profile.recommended_modules || []}
                    onModuleClick={(moduleId) => {
                      navigate('/dashboard/modules');
                      onClose();
                    }}
                  />
                )}

                {currentStep === 'complete' && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Профиль успешно настроен!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Полнота профиля: <span className="font-bold text-construction-600">{profile?.profile_completeness || 0}%</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Теперь вы можете пользоваться всеми возможностями платформы ProHelper
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentStepIndex
                        ? 'bg-construction-600 w-8'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-3">
                {currentStepIndex > 0 && currentStep !== 'complete' && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSaving}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                )}

                {currentStep !== 'complete' && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={isSaving}
                  >
                    Пропустить
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
                  className="min-w-[140px]"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {currentStep === 'complete' ? 'Начать работу' : 'Далее'}
                      {currentStep !== 'complete' && <ArrowRight className="w-4 h-4 ml-2" />}
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

