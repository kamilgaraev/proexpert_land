import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { CapabilitiesSelector } from '../organization/CapabilitiesSelector';
import { BusinessTypeSelector } from '../organization/BusinessTypeSelector';
import { SpecializationsSelector } from '../organization/SpecializationsSelector';
import { CertificationsList } from '../organization/CertificationsList';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const onboarding = useOnboarding();
  const {
    updateCapabilities,
    updateBusinessType,
    updateSpecializations,
    updateCertifications,
    completeOnboarding,
    fetchAvailableCapabilities,
    availableCapabilities
  } = useOrganizationProfile();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailableCapabilities();
  }, []);

  const handleNext = async () => {
    if (onboarding.currentStep === 'capabilities' && onboarding.data.capabilities.length > 0) {
      try {
        setIsSaving(true);
        await updateCapabilities(onboarding.data.capabilities);
        onboarding.goNext();
      } catch (error) {
      } finally {
        setIsSaving(false);
      }
    } else if (onboarding.currentStep === 'business_type' && onboarding.data.primary_business_type) {
      try {
        setIsSaving(true);
        await updateBusinessType(onboarding.data.primary_business_type);
        onboarding.goNext();
      } catch (error) {
      } finally {
        setIsSaving(false);
      }
    } else if (onboarding.currentStep === 'specializations') {
      if (onboarding.data.specializations.length > 0) {
        try {
          setIsSaving(true);
          await updateSpecializations(onboarding.data.specializations);
          onboarding.goNext();
        } catch (error) {
        } finally {
          setIsSaving(false);
        }
      } else {
        onboarding.goNext();
      }
    } else if (onboarding.currentStep === 'certifications') {
      if (onboarding.data.certifications.length > 0) {
        try {
          setIsSaving(true);
          await updateCertifications(onboarding.data.certifications);
          onboarding.goNext();
        } catch (error) {
        } finally {
          setIsSaving(false);
        }
      } else {
        onboarding.goNext();
      }
    } else if (onboarding.currentStep === 'complete') {
      try {
        setIsSaving(true);
        await completeOnboarding();
        onComplete();
      } catch (error) {
      } finally {
        setIsSaving(false);
      }
    } else {
      onboarding.goNext();
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-construction-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Настройка профиля организации
            </h1>
            <button
              onClick={() => onboarding.reset()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Сбросить
            </button>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-construction-500 to-construction-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${onboarding.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Шаг {onboarding.allSteps.findIndex(s => s.id === onboarding.currentStep) + 1} из {onboarding.allSteps.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {onboarding.currentStep === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-construction-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Добро пожаловать в ProHelper!
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Давайте настроим профиль вашей организации. Это займет всего несколько минут и поможет подобрать оптимальные инструменты для работы.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-construction-50 rounded-lg">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Персонализация</h3>
                  <p className="text-sm text-gray-600">Индивидуальные настройки под ваш бизнес</p>
                </div>
                <div className="p-6 bg-green-50 rounded-lg">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Быстрый старт</h3>
                  <p className="text-sm text-gray-600">Начните работать через 5 минут</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Рекомендации</h3>
                  <p className="text-sm text-gray-600">Подберем лучшие модули для вас</p>
                </div>
              </div>
            </div>
          )}

          {onboarding.currentStep === 'capabilities' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Возможности вашей организации
                </h2>
                <p className="text-gray-600">
                  Выберите, какие виды работ выполняет ваша организация
                </p>
              </div>
              <CapabilitiesSelector
                selectedCapabilities={onboarding.data.capabilities}
                availableCapabilities={availableCapabilities}
                onChange={(caps) => onboarding.updateCapabilities(caps)}
                showRecommendations={true}
              />
            </div>
          )}

          {onboarding.currentStep === 'business_type' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Основной тип деятельности
                </h2>
                <p className="text-gray-600">
                  Выберите основное направление работы вашей организации
                </p>
              </div>
              <BusinessTypeSelector
                selectedType={onboarding.data.primary_business_type}
                onChange={(type) => onboarding.updateBusinessType(type)}
              />
            </div>
          )}

          {onboarding.currentStep === 'specializations' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Специализации
                </h2>
                <p className="text-gray-600">
                  Укажите специализации вашей организации (необязательно)
                </p>
              </div>
              <SpecializationsSelector
                selectedSpecializations={onboarding.data.specializations}
                onChange={(specs) => onboarding.updateSpecializations(specs)}
              />
            </div>
          )}

          {onboarding.currentStep === 'certifications' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Сертификаты и допуски
                </h2>
                <p className="text-gray-600">
                  Добавьте ваши сертификаты (необязательно)
                </p>
              </div>
              <CertificationsList
                certifications={onboarding.data.certifications}
                onChange={(certs) => onboarding.updateCertifications(certs)}
              />
            </div>
          )}

          {onboarding.currentStep === 'complete' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Отлично! Всё готово
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Профиль вашей организации настроен. Теперь вы можете приступить к работе с проектами.
              </p>
              
              <div className="bg-gradient-to-r from-construction-50 to-orange-50 border border-construction-200 rounded-lg p-6 mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Что вы указали:</h3>
                <div className="space-y-3 text-left max-w-2xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Возможности организации</p>
                      <p className="text-sm text-gray-600">{onboarding.data.capabilities.length} выбрано</p>
                    </div>
                  </div>
                  {onboarding.data.primary_business_type && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Тип деятельности</p>
                        <p className="text-sm text-gray-600">{onboarding.data.primary_business_type}</p>
                      </div>
                    </div>
                  )}
                  {onboarding.data.specializations.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Специализации</p>
                        <p className="text-sm text-gray-600">{onboarding.data.specializations.length} указано</p>
                      </div>
                    </div>
                  )}
                  {onboarding.data.certifications.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Сертификаты</p>
                        <p className="text-sm text-gray-600">{onboarding.data.certifications.length} добавлено</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onboarding.goPrev}
              disabled={!onboarding.canGoPrev || isSaving}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Назад
            </button>
            
            <div className="flex space-x-2">
              {onboarding.allSteps.map((step) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    onboarding.completedSteps.includes(step.id) || step.id === onboarding.currentStep
                      ? 'bg-construction-600 w-8'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed() || isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-construction-600 to-construction-700 rounded-lg hover:from-construction-700 hover:to-construction-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {isSaving ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Сохранение...</span>
                </span>
              ) : (
                <>
                  {onboarding.currentStep === 'complete' ? 'Завершить' : 'Далее'} →
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

