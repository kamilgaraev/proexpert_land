import { useEffect, useState } from 'react';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { useOrganizationVerification } from '@/hooks/useOrganizationVerification';
import { CapabilitiesSelector } from '@/components/dashboard/organization/CapabilitiesSelector';
import { BusinessTypeSelector } from '@/components/dashboard/organization/BusinessTypeSelector';
import { SpecializationsSelector } from '@/components/dashboard/organization/SpecializationsSelector';
import { CertificationsList } from '@/components/dashboard/organization/CertificationsList';
import { ProfileCompletenessWidget } from '@/components/dashboard/organization/ProfileCompletenessWidget';
import type { OrganizationCapability } from '@/types/organization-profile';

export const OrganizationSettingsPage = () => {
  const {
    profile,
    availableCapabilities,
    loading,
    fetchProfile,
    fetchAvailableCapabilities,
    updateCapabilities,
    updateBusinessType,
    updateSpecializations,
    updateCertifications
  } = useOrganizationProfile();

  const { getOrganization, organization: orgVerification } = useOrganizationVerification();

  const [activeTab, setActiveTab] = useState<'capabilities' | 'business_type' | 'specializations' | 'certifications'>('capabilities');
  const [isSaving, setIsSaving] = useState(false);

  const [localCapabilities, setLocalCapabilities] = useState<OrganizationCapability[]>([]);
  const [localBusinessType, setLocalBusinessType] = useState<string | null>(null);
  const [localSpecializations, setLocalSpecializations] = useState<string[]>([]);
  const [localCertifications, setLocalCertifications] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchAvailableCapabilities();
    getOrganization().catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setLocalCapabilities(profile.capabilities || []);
      setLocalBusinessType(profile.primary_business_type);
      setLocalSpecializations(profile.specializations || []);
      setLocalCertifications(profile.certifications || []);
    }
  }, [profile]);

  const handleSaveCapabilities = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      await updateCapabilities(localCapabilities);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusinessType = async () => {
    if (!profile || !localBusinessType) return;
    try {
      setIsSaving(true);
      await updateBusinessType(localBusinessType);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSpecializations = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      await updateSpecializations(localSpecializations);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCertifications = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      await updateCertifications(localCertifications);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (!profile) return false;
    
    if (activeTab === 'capabilities') {
      return JSON.stringify([...(localCapabilities || [])].sort()) !== JSON.stringify([...(profile.capabilities || [])].sort());
    }
    if (activeTab === 'business_type') {
      return localBusinessType !== profile.primary_business_type;
    }
    if (activeTab === 'specializations') {
      return JSON.stringify([...(localSpecializations || [])].sort()) !== JSON.stringify([...(profile.specializations || [])].sort());
    }
    if (activeTab === 'certifications') {
      return JSON.stringify([...(localCertifications || [])].sort()) !== JSON.stringify([...(profile.certifications || [])].sort());
    }
    return false;
  };

  const getMissingFields = (): string[] => {
    if (!profile) return [];
    const missing: string[] = [];
    
    if (!profile.capabilities || profile.capabilities.length === 0) missing.push('capabilities');
    if (!profile.primary_business_type) missing.push('primary_business_type');
    if (!profile.specializations || profile.specializations.length === 0) missing.push('specializations');
    
    return missing;
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-construction-600 mb-4"></div>
          <p className="text-gray-600">Загрузка профиля организации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление организацией
          </h1>
          <p className="text-gray-600">
            Управляйте профилем и параметрами вашей организации
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('capabilities')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'capabilities'
                        ? 'border-construction-600 text-construction-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Возможности
                  </button>
                  <button
                    onClick={() => setActiveTab('business_type')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'business_type'
                        ? 'border-construction-600 text-construction-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Тип деятельности
                  </button>
                  <button
                    onClick={() => setActiveTab('specializations')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'specializations'
                        ? 'border-construction-600 text-construction-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Специализации
                  </button>
                  <button
                    onClick={() => setActiveTab('certifications')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'certifications'
                        ? 'border-construction-600 text-construction-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Сертификаты
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'capabilities' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Возможности организации
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Укажите, какие виды работ выполняет ваша организация. Это поможет системе подобрать подходящие модули и функции.
                      </p>
                    </div>
                    <CapabilitiesSelector
                      selectedCapabilities={localCapabilities}
                      availableCapabilities={availableCapabilities || []}
                      onChange={setLocalCapabilities}
                      showRecommendations={true}
                    />
                  </div>
                )}

                {activeTab === 'business_type' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Основной тип деятельности
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Выберите основное направление работы вашей организации.
                      </p>
                    </div>
                    <BusinessTypeSelector
                      selectedType={localBusinessType}
                      onChange={setLocalBusinessType}
                    />
                  </div>
                )}

                {activeTab === 'specializations' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Специализации
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Укажите области, в которых специализируется ваша организация.
                      </p>
                    </div>
                    <SpecializationsSelector
                      selectedSpecializations={localSpecializations}
                      onChange={setLocalSpecializations}
                    />
                  </div>
                )}

                {activeTab === 'certifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Сертификаты и допуски
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Добавьте сертификаты, лицензии и допуски вашей организации.
                      </p>
                    </div>
                    <CertificationsList
                      certifications={localCertifications}
                      onChange={setLocalCertifications}
                    />
                  </div>
                )}

                {hasChanges() && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        if (profile) {
                          setLocalCapabilities(profile.capabilities || []);
                          setLocalBusinessType(profile.primary_business_type);
                          setLocalSpecializations(profile.specializations || []);
                          setLocalCertifications(profile.certifications || []);
                        }
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Отменить
                    </button>
                    <button
                      onClick={() => {
                        if (activeTab === 'capabilities') handleSaveCapabilities();
                        else if (activeTab === 'business_type') handleSaveBusinessType();
                        else if (activeTab === 'specializations') handleSaveSpecializations();
                        else if (activeTab === 'certifications') handleSaveCertifications();
                      }}
                      disabled={isSaving}
                      className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-construction-600 to-construction-700 rounded-lg hover:from-construction-700 hover:to-construction-800 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(profile || orgVerification) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Информация об организации
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Название</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {profile?.name || orgVerification?.name || 'Не указано'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">ИНН</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {profile?.inn || orgVerification?.tax_number || 'Не указано'}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-gray-500 mt-4">
                  Для изменения основных данных организации обратитесь в службу поддержки
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {profile && (
              <ProfileCompletenessWidget
                completeness={profile.profile_completeness}
                missingFields={getMissingFields()}
                onComplete={() => setActiveTab('capabilities')}
              />
            )}

            {profile && profile.recommended_modules && profile.recommended_modules.length > 0 && (
              <div className="mt-6 bg-gradient-to-br from-construction-50 to-orange-50 border border-construction-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Рекомендуемые модули
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  На основе профиля вашей организации
                </p>
                <div className="space-y-2">
                  {profile.recommended_modules.map((module: string | { value: string; label: string }, index: number) => {
                    const moduleText = typeof module === 'string' ? module : (module?.label || module?.value || 'Модуль');
                    const moduleKey = typeof module === 'string' ? module : (module?.value || index);
                    return (
                      <div
                        key={moduleKey}
                        className="flex items-center space-x-2 text-sm text-gray-700 bg-white p-3 rounded-lg"
                      >
                        <svg className="w-4 h-4 text-construction-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{moduleText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

