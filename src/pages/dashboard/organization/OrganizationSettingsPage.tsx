import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationProfile } from '@/hooks/useOrganizationProfile';
import { useOrganizationVerification } from '@/hooks/useOrganizationVerification';
import { CapabilitiesSelector } from '@/components/dashboard/organization/CapabilitiesSelector';
import { BusinessTypeSelector } from '@/components/dashboard/organization/BusinessTypeSelector';
import { SpecializationsSelector } from '@/components/dashboard/organization/SpecializationsSelector';
import { CertificationsList } from '@/components/dashboard/organization/CertificationsList';
import { ProfileCompletenessWidget } from '@/components/dashboard/organization/ProfileCompletenessWidget';
import { RecommendedModulesCard } from '@/components/dashboard/organization/RecommendedModulesCard';
import { WorkspaceQuickActionsCard } from '@/components/dashboard/organization/WorkspaceQuickActionsCard';
import type { OrganizationCapability } from '@/types/organization-profile';
import { BUSINESS_TYPE_LABELS, resolvePrimaryBusinessType } from '@/utils/organizationProfile';
import {
  Building2,
  CheckCircle,
  AlertTriangle,
  Pencil,
  Loader2,
  Briefcase,
  Award,
  ListChecks,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const SPECIALIZATION_LABELS: Record<string, string> = {
  building_construction: 'Промышленное и гражданское строительство',
  road_construction: 'Дорожное строительство',
  bridge_construction: 'Мостовое строительство',
  electrical_works: 'Электромонтажные работы',
  plumbing_works: 'Сантехнические работы',
  hvac_systems: 'Системы отопления и вентиляции',
  roofing_works: 'Кровельные работы',
  facade_works: 'Фасадные работы',
  foundation_works: 'Фундаментные работы',
  interior_finishing: 'Внутренняя отделка',
  landscape_works: 'Благоустройство территории',
  demolition_works: 'Демонтажные работы',
};

export const OrganizationSettingsPage = () => {
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
    updateCertifications,
  } = useOrganizationProfile();

  const { getOrganization, organization: orgVerification } = useOrganizationVerification();

  const [editingSection, setEditingSection] = useState<
    'capabilities' | 'business_type' | 'specializations' | 'certifications' | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);

  const [localCapabilities, setLocalCapabilities] = useState<OrganizationCapability[]>([]);
  const [localBusinessType, setLocalBusinessType] = useState<OrganizationCapability | null>(null);
  const [localSpecializations, setLocalSpecializations] = useState<string[]>([]);
  const [localCertifications, setLocalCertifications] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchAvailableCapabilities();
    getOrganization().catch(() => {});
  }, [fetchAvailableCapabilities, fetchProfile, getOrganization]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setLocalCapabilities(profile.capabilities || []);
    setLocalBusinessType(profile.primary_business_type);
    setLocalSpecializations(profile.specializations || []);
    setLocalCertifications(profile.certifications || []);
  }, [profile]);

  useEffect(() => {
    const nextBusinessType = resolvePrimaryBusinessType(localCapabilities, localBusinessType);

    if (nextBusinessType !== localBusinessType) {
      setLocalBusinessType(nextBusinessType);
    }
  }, [localCapabilities, localBusinessType]);

  const handleSave = async (section: typeof editingSection) => {
    if (!profile) {
      return;
    }

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
    if (!profile) {
      return [];
    }

    const missing: string[] = [];

    if (!profile.capabilities || profile.capabilities.length === 0) {
      missing.push('capabilities');
    }

    if (!profile.primary_business_type) {
      missing.push('primary_business_type');
    }

    if (!profile.specializations || profile.specializations.length === 0) {
      missing.push('specializations');
    }

    return missing;
  };

  if (loading && !profile) {
    return (
      <div className="container mx-auto space-y-6 py-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[600px] rounded-xl lg:col-span-2" />
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
        <div className="flex items-center justify-between border-b bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border bg-background p-2 shadow-sm">{icon}</div>
            <div>
              <h3 className="text-lg font-bold leading-none">{title}</h3>
              {isEmpty && !isEditing && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
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
              <Pencil className="h-3 w-3" />
              {isEmpty ? 'Заполнить' : 'Изменить'}
            </Button>
          )}
        </div>

        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              {content}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
                  Отменить
                </Button>
                <Button onClick={() => handleSave(section)} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="py-8 text-center text-muted-foreground">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertTriangle className="h-6 w-6 opacity-50" />
              </div>
              <p className="font-medium">Информация не заполнена</p>
              <p className="mt-1 text-xs">Нажмите "Заполнить" для добавления данных</p>
            </div>
          ) : (
            content
          )}
        </CardContent>
      </Card>
    );
  };

  const primaryBusinessType = profile?.primary_business_type;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Профиль организации</h1>
        <p className="text-muted-foreground">
          Управляйте направлениями деятельности, основным режимом работы и специализациями
          вашей организации
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Building2 className="h-8 w-8 text-primary" />
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

              <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Полнота профиля</p>
                  <p className="text-2xl font-bold text-primary">
                    {profile?.profile_completeness || 0}%
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Рекомендуемые модули</p>
                  <p className="text-2xl font-bold">
                    {profile?.recommended_modules?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {renderInfoSection(
            'Направления деятельности',
            <CheckCircle className="h-5 w-5 text-primary" />,
            !profile?.capabilities || profile.capabilities.length === 0,
            editingSection === 'capabilities' ? (
              <CapabilitiesSelector
                selectedCapabilities={localCapabilities}
                availableCapabilities={availableCapabilities || []}
                onChange={setLocalCapabilities}
                showRecommendations
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.capabilities?.map((capability) => (
                  <Badge key={capability} variant="secondary" className="px-3 py-1">
                    <CheckCircle className="mr-2 h-3 w-3 opacity-50" />
                    {BUSINESS_TYPE_LABELS[capability] || capability}
                  </Badge>
                ))}
              </div>
            ),
            'capabilities'
          )}

          {renderInfoSection(
            'Основной режим работы',
            <Briefcase className="h-5 w-5 text-blue-600" />,
            !profile?.primary_business_type,
            editingSection === 'business_type' ? (
              <BusinessTypeSelector
                selectedType={localBusinessType}
                onChange={setLocalBusinessType}
                availableTypes={localCapabilities}
              />
            ) : (
              <div className="flex items-center gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div className="text-3xl">🏗️</div>
                <div>
                  <p className="font-bold text-foreground">
                    {primaryBusinessType ? BUSINESS_TYPE_LABELS[primaryBusinessType] : null}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Основной workspace и сценарий, который открывается первым
                  </p>
                </div>
              </div>
            ),
            'business_type'
          )}

          {renderInfoSection(
            'Специализации',
            <ListChecks className="h-5 w-5 text-emerald-600" />,
            !profile?.specializations || profile.specializations.length === 0,
            editingSection === 'specializations' ? (
              <SpecializationsSelector
                selectedSpecializations={localSpecializations}
                onChange={setLocalSpecializations}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.specializations?.map((specialization) => (
                  <Badge
                    key={specialization}
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
                  >
                    {SPECIALIZATION_LABELS[specialization] || specialization}
                  </Badge>
                ))}
              </div>
            ),
            'specializations'
          )}

          {renderInfoSection(
            'Сертификаты и допуски',
            <Award className="h-5 w-5 text-violet-600" />,
            !profile?.certifications || profile.certifications.length === 0,
            editingSection === 'certifications' ? (
              <CertificationsList
                certifications={localCertifications}
                onChange={setLocalCertifications}
              />
            ) : (
              <div className="space-y-2">
                {profile?.certifications?.map((certification, index) => (
                  <div
                    key={`${certification}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-violet-100 bg-violet-50/50 p-3"
                  >
                    <div className="rounded-md bg-violet-100 p-1">
                      <CheckCircle className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-sm font-medium">{certification}</span>
                  </div>
                ))}
              </div>
            ),
            'certifications'
          )}
        </div>

        <div className="space-y-6 lg:col-span-1">
          {profile && (
            <ProfileCompletenessWidget
              completeness={profile.profile_completeness}
              missingFields={getMissingFields()}
              onComplete={() => setEditingSection('capabilities')}
            />
          )}

          {profile && (
            <WorkspaceQuickActionsCard
              workspaceProfile={profile.workspace_profile}
              onActionClick={(action) => navigate(action.route)}
            />
          )}

          {profile && profile.recommended_modules && profile.recommended_modules.length > 0 && (
            <RecommendedModulesCard
              modules={profile.recommended_modules}
              onModuleClick={() => {
                navigate('/dashboard/modules');
              }}
              showTitle
            />
          )}
        </div>
      </div>
    </div>
  );
};
