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
  Building2, 
  CheckCircle, 
  AlertTriangle,
  Pencil,
  Loader2,
  Briefcase,
  Award,
  ListChecks
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// import { Separator } from '@/components/ui/separator';

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
      <div className="container mx-auto py-8 space-y-6">
         <Skeleton className="h-12 w-64" />
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-[600px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
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
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg shadow-sm border">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">{title}</h3>
              {isEmpty && !isEditing && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Не заполнено
                </p>
              )}
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSection(section)}
              className="gap-2"
            >
              <Pencil className="w-3 h-3" />
              {isEmpty ? 'Заполнить' : 'Изменить'}
            </Button>
          )}
        </div>

        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              {content}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Отменить
                </Button>
                <Button
                  onClick={() => handleSave(section)}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3">
                <AlertTriangle className="w-6 h-6 opacity-50" />
              </div>
              <p className="font-medium">Информация не заполнена</p>
              <p className="text-xs mt-1">Нажмите "Заполнить" для добавления данных</p>
            </div>
          ) : (
            content
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Профиль организации</h1>
        <p className="text-muted-foreground">
          Управляйте информацией о возможностях и специализациях вашей организации
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {profile?.name || orgVerification?.name || 'Организация'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    ИНН: {profile?.inn || orgVerification?.tax_number || 'Не указан'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Полнота профиля</p>
                  <p className="text-2xl font-bold text-primary">
                    {profile?.profile_completeness || 0}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Рекомендуемые модули</p>
                  <p className="text-2xl font-bold">
                    {profile?.recommended_modules?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {renderInfoSection(
            'Возможности организации',
            <CheckCircle className="w-5 h-5 text-primary" />,
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
                  <Badge key={cap} variant="secondary" className="px-3 py-1">
                    <CheckCircle className="w-3 h-3 mr-2 opacity-50" />
                    {CAPABILITY_LABELS[cap] || cap}
                  </Badge>
                ))}
              </div>
            ),
            'capabilities'
          )}

          {renderInfoSection(
            'Основной тип деятельности',
            <Briefcase className="w-5 h-5 text-blue-600" />,
            !profile?.primary_business_type,
            editingSection === 'business_type' ? (
              <BusinessTypeSelector
                selectedType={localBusinessType}
                onChange={setLocalBusinessType}
              />
            ) : (
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="text-3xl">🏗️</div>
                <div>
                  <p className="font-bold text-foreground">
                    {BUSINESS_TYPE_LABELS[profile?.primary_business_type || ''] || profile?.primary_business_type}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Основное направление работы организации
                  </p>
                </div>
              </div>
            ),
            'business_type'
          )}

          {renderInfoSection(
            'Специализации',
            <ListChecks className="w-5 h-5 text-emerald-600" />,
            !profile?.specializations || profile.specializations.length === 0,
            editingSection === 'specializations' ? (
              <SpecializationsSelector
                selectedSpecializations={localSpecializations}
                onChange={setLocalSpecializations}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.specializations?.map((spec) => (
                  <Badge key={spec} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1">
                    {SPECIALIZATION_LABELS[spec] || spec}
                  </Badge>
                ))}
              </div>
            ),
            'specializations'
          )}

          {renderInfoSection(
            'Сертификаты и допуски',
            <Award className="w-5 h-5 text-violet-600" />,
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
                    className="flex items-center gap-3 p-3 bg-violet-50/50 border border-violet-100 rounded-lg"
                  >
                    <div className="p-1 bg-violet-100 rounded-md">
                        <CheckCircle className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium">{cert}</span>
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
            <Card className="bg-gradient-to-br from-background to-muted border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Рекомендуемые модули</CardTitle>
                <CardDescription>На основе профиля вашей организации</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.recommended_modules.map((module: string | { value: string; label: string }, index: number) => {
                  const moduleText = typeof module === 'string' ? module : (module?.label || module?.value || 'Модуль');
                  const moduleKey = typeof module === 'string' ? module : (module?.value || index);
                  return (
                    <div
                      key={moduleKey}
                      className="flex items-center gap-2 text-sm p-3 bg-background rounded-lg border shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{moduleText}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
