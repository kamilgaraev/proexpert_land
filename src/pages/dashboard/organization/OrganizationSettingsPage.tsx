import { useEffect, useState } from 'react';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { useOrganizationVerification } from '@/hooks/useOrganizationVerification';
import { CapabilitiesSelector } from '@/components/dashboard/organization/CapabilitiesSelector';
import { BusinessTypeSelector } from '@/components/dashboard/organization/BusinessTypeSelector';
import { SpecializationsSelector } from '@/components/dashboard/organization/SpecializationsSelector';
import { CertificationsList } from '@/components/dashboard/organization/CertificationsList';
import { ProfileCompletenessWidget } from '@/components/dashboard/organization/ProfileCompletenessWidget';
import type { OrganizationCapability } from '@/types/organization-profile';
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const CAPABILITY_LABELS: Record<OrganizationCapability, string> = {
  'general_contracting': 'Генеральный подряд',
  'subcontracting': 'Субподрядные работы',
  'design': 'Проектирование',
  'construction_supervision': 'Строительный контроль',
  'equipment_rental': 'Аренда техники',
  'materials_supply': 'Поставка материалов',
  'consulting': 'Консалтинг',
  'facility_management': 'Эксплуатация объектов'
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  'general_contracting': 'Генеральный подряд',
  'subcontracting': 'Субподрядные работы',
  'design': 'Проектирование',
  'construction_supervision': 'Строительный контроль',
  'equipment_rental': 'Аренда техники',
  'materials_supply': 'Поставка материалов',
  'consulting': 'Консалтинг',
  'facility_management': 'Эксплуатация объектов'
};

const SPECIALIZATION_LABELS: Record<string, string> = {
  'building_construction': 'Промышленное и гражданское строительство',
  'road_construction': 'Дорожное строительство',
  'bridge_construction': 'Мостовое строительство',
  'electrical_works': 'Электромонтажные работы',
  'plumbing_works': 'Сантехнические работы',
  'hvac_systems': 'Системы отопления и вентиляции',
  'roofing_works': 'Кровельные работы',
  'facade_works': 'Фасадные работы',
  'foundation_works': 'Фундаментные работы',
  'interior_finishing': 'Внутренняя отделка',
  'landscape_works': 'Благоустройство территории',
  'demolition_works': 'Демонтажные работы'
};

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

  const [editingSection, setEditingSection] = useState<'capabilities' | 'business_type' | 'specializations' | 'certifications' | null>(null);
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

  const handleSave = async (section: typeof editingSection) => {
    if (!profile) return;
    
    try {
      setIsSaving(true);
      
      if (section === 'capabilities') {
        await updateCapabilities(localCapabilities);
      } else if (section === 'business_type' && localBusinessType) {
        await updateBusinessType(localBusinessType);
      } else if (section === 'specializations') {
        await updateSpecializations(localSpecializations);
      } else if (section === 'certifications') {
        await updateCertifications(localCertifications);
      }
      
      setEditingSection(null);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setLocalCapabilities(profile.capabilities || []);
      setLocalBusinessType(profile.primary_business_type);
      setLocalSpecializations(profile.specializations || []);
      setLocalCertifications(profile.certifications || []);
    }
    setEditingSection(null);
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

  const renderInfoSection = (
    title: string,
    icon: React.ReactNode,
    isEmpty: boolean,
    content: React.ReactNode,
    section: typeof editingSection
  ) => {
    const isEditing = editingSection === section;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {isEmpty && !isEditing && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  Не заполнено
                </p>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setEditingSection(section)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {isEmpty ? 'Заполнить' : 'Изменить'}
            </button>
          )}
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              {content}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Отменить
                </button>
                <button
                  onClick={() => handleSave(section)}
                  disabled={isSaving}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-construction-600 to-construction-700 rounded-lg hover:from-construction-700 hover:to-construction-800 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <ExclamationCircleIcon className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-gray-600 font-medium">Информация не заполнена</p>
              <p className="text-sm text-gray-500 mt-1">Нажмите "Заполнить" для добавления данных</p>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Профиль организации
          </h1>
          <p className="text-gray-600">
            Управляйте информацией о возможностях и специализациях вашей организации
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile?.name || orgVerification?.name || 'Организация'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    ИНН: {profile?.inn || orgVerification?.tax_number || 'Не указан'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Полнота профиля</p>
                  <p className="text-2xl font-bold text-construction-600">
                    {profile?.profile_completeness || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Рекомендуемые модули</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {profile?.recommended_modules?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {renderInfoSection(
              'Возможности организации',
              <CheckCircleIcon className="w-5 h-5 text-construction-600" />,
              !profile?.capabilities || profile.capabilities.length === 0,
              editingSection === 'capabilities' ? (
                <CapabilitiesSelector
                  selectedCapabilities={localCapabilities}
                  availableCapabilities={availableCapabilities || []}
                  onChange={setLocalCapabilities}
                  showRecommendations={true}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.capabilities?.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center px-4 py-2 bg-construction-50 text-construction-700 border border-construction-200 rounded-lg font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      {CAPABILITY_LABELS[cap] || cap}
                    </span>
                  ))}
                </div>
              ),
              'capabilities'
            )}

            {renderInfoSection(
              'Основной тип деятельности',
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />,
              !profile?.primary_business_type,
              editingSection === 'business_type' ? (
                <BusinessTypeSelector
                  selectedType={localBusinessType}
                  onChange={setLocalBusinessType}
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-4xl">🏗️</div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {BUSINESS_TYPE_LABELS[profile?.primary_business_type || ''] || profile?.primary_business_type}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Основное направление работы организации
                    </p>
                  </div>
                </div>
              ),
              'business_type'
            )}

            {renderInfoSection(
              'Специализации',
              <CheckCircleIcon className="w-5 h-5 text-emerald-600" />,
              !profile?.specializations || profile.specializations.length === 0,
              editingSection === 'specializations' ? (
                <SpecializationsSelector
                  selectedSpecializations={localSpecializations}
                  onChange={setLocalSpecializations}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.specializations?.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium"
                    >
                      {SPECIALIZATION_LABELS[spec] || spec}
                    </span>
                  ))}
                </div>
              ),
              'specializations'
            )}

            {renderInfoSection(
              'Сертификаты и допуски',
              <CheckCircleIcon className="w-5 h-5 text-violet-600" />,
              !profile?.certifications || profile.certifications.length === 0,
              editingSection === 'certifications' ? (
                <CertificationsList
                  certifications={localCertifications}
                  onChange={setLocalCertifications}
                />
              ) : (
                <div className="space-y-2">
                  {profile?.certifications?.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-violet-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{cert}</span>
                    </div>
                  ))}
                </div>
              ),
              'certifications'
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {profile && (
              <ProfileCompletenessWidget
                completeness={profile.profile_completeness}
                missingFields={getMissingFields()}
                onComplete={() => setEditingSection('capabilities')}
              />
            )}

            {profile && profile.recommended_modules && profile.recommended_modules.length > 0 && (
              <div className="bg-gradient-to-br from-construction-50 to-orange-50 border border-construction-200 rounded-xl p-6">
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
                        className="flex items-center space-x-2 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm"
                      >
                        <CheckCircleIcon className="w-4 h-4 text-construction-600 flex-shrink-0" />
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
