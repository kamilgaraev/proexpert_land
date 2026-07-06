import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Inbox,
  Loader2,
  Search,
  Send,
  UserRoundCog,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractorSearchPanel from '@/components/dashboard/contractor-marketplace/ContractorSearchPanel';
import OfferInbox from '@/components/dashboard/contractor-marketplace/OfferInbox';
import OutgoingOffersPanel from '@/components/dashboard/contractor-marketplace/OutgoingOffersPanel';
import ProfileEditor from '@/components/dashboard/contractor-marketplace/ProfileEditor';
import { normalizeOrganizationProfileResponse } from '@/hooks/useOrganizationProfile';
import { useCanAccess } from '@/hooks/usePermissions';
import { usePageTitle } from '@/hooks/useSEO';
import { organizationProfileService, organizationService, type Organization } from '@/utils/api';
import contractorMarketplaceApi from '@/utils/contractorMarketplaceApi';
import type {
  MarketplaceContractorProfile,
  MarketplaceProfileUpdatePayload,
  MarketplaceWorkCategory,
} from '@/types/contractor-marketplace';
import type { OrganizationProfile } from '@/types/organization-profile';

const normalizeErrorMessage = (error: unknown): string => {
  const responseMessage = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
    : null;

  return responseMessage || 'Не удалось загрузить данные каталога подрядчиков.';
};

const loadOrganization = async (): Promise<Organization | null> => {
  try {
    const response = await organizationService.getCurrent();

    return response.success ? response.data.organization : null;
  } catch {
    return null;
  }
};

const loadOrganizationProfile = async (): Promise<OrganizationProfile | null> => {
  try {
    const response = await organizationProfileService.getProfile();

    return response.data?.success
      ? normalizeOrganizationProfileResponse(response.data.data)
      : null;
  } catch {
    return null;
  }
};

const ContractorMarketplacePage = () => {
  const [categories, setCategories] = useState<MarketplaceWorkCategory[]>([]);
  const [profile, setProfile] = useState<MarketplaceContractorProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  usePageTitle('Каталог подрядчиков');

  const isOrganizationOwner = useCanAccess({ role: 'organization_owner' });
  const isOrganizationAdmin = useCanAccess({ role: 'organization_admin' });
  const hasSearchPermission = useCanAccess({ permission: 'contractor_marketplace.search.view' });
  const hasProfileViewPermission = useCanAccess({ permission: 'contractor_marketplace.profile.view' });
  const hasOffersViewPermission = useCanAccess({ permission: 'contractor_marketplace.offers.view' });
  const hasOfferCreatePermission = useCanAccess({ permission: 'contractor_marketplace.offers.create' });
  const hasOfferCancelPermission = useCanAccess({ permission: 'contractor_marketplace.offers.cancel' });
  const hasOfferReviewPermission = useCanAccess({ permission: 'contractor_marketplace.offers.review' });
  const hasOwnerAccess = isOrganizationOwner || isOrganizationAdmin;
  const canSearchContractors =
    hasOwnerAccess ||
    hasSearchPermission;
  const canViewProfile =
    hasOwnerAccess ||
    hasProfileViewPermission;
  const canViewOffers =
    hasOwnerAccess ||
    hasOffersViewPermission;
  const canCreateOffer =
    hasOwnerAccess ||
    hasOfferCreatePermission;
  const canCancelOffer =
    hasOwnerAccess ||
    hasOfferCancelPermission;
  const canReviewOffer =
    hasOwnerAccess ||
    hasOfferReviewPermission;
  const canUseMarketplace = canSearchContractors || canViewProfile || canViewOffers;

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        loadedCategories,
        loadedProfile,
        loadedOrganization,
        loadedOrganizationProfile,
      ] = await Promise.all([
        canUseMarketplace ? contractorMarketplaceApi.getCategories() : Promise.resolve([]),
        canViewProfile ? contractorMarketplaceApi.getProfile() : Promise.resolve(null),
        canViewProfile ? loadOrganization() : Promise.resolve(null),
        canViewProfile ? loadOrganizationProfile() : Promise.resolve(null),
      ]);

      setCategories(loadedCategories);
      setProfile(loadedProfile);
      setOrganization(loadedOrganization);
      setOrganizationProfile(loadedOrganizationProfile);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [canUseMarketplace, canViewProfile]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const saveProfile = async (payload: MarketplaceProfileUpdatePayload) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updatedProfile = await contractorMarketplaceApi.updateProfile(payload);
      setProfile(updatedProfile);
      toast.success('Профиль сохранен');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const publishProfile = async () => {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const updatedProfile = await contractorMarketplaceApi.publishProfile();
      setProfile(updatedProfile);
      toast.success('Профиль опубликован');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const pauseProfile = async () => {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const updatedProfile = await contractorMarketplaceApi.pauseProfile();
      setProfile(updatedProfile);
      toast.success('Профиль скрыт из каталога');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const uploadDocument = async (file: File, type: string, title: string) => {
    setIsUploadingDocument(true);
    setErrorMessage(null);

    try {
      const updatedProfile = await contractorMarketplaceApi.uploadDocument(file, type, title);
      setProfile(updatedProfile);
      toast.success('Документ загружен');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const deleteDocument = async (documentId: number) => {
    setIsUploadingDocument(true);
    setErrorMessage(null);

    try {
      const updatedProfile = await contractorMarketplaceApi.deleteDocument(documentId);
      setProfile(updatedProfile);
      toast.success('Документ удален');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsUploadingDocument(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Каталог подрядчиков</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Закрытый профиль для сотрудничества с генподрядчиками, входящие предложения и рабочие категории.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadInitialData()} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Обновить
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-xl border bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка каталога подрядчиков</span>
          </div>
        </div>
      ) : !canUseMarketplace ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>У вас нет доступа к каталогу подрядчиков.</AlertDescription>
        </Alert>
      ) : (
        <Tabs
          defaultValue={canSearchContractors ? 'search' : canViewProfile ? 'profile' : 'incoming'}
          className="space-y-5"
        >
          <TabsList className="grid w-full grid-cols-2 md:flex md:w-auto">
            {canSearchContractors && (
              <TabsTrigger value="search" className="gap-2">
                <Search className="h-4 w-4" />
                Поиск
              </TabsTrigger>
            )}
            {canViewOffers && (
              <TabsTrigger value="outgoing" className="gap-2">
                <Send className="h-4 w-4" />
                Исходящие
              </TabsTrigger>
            )}
            {canViewProfile && (
              <TabsTrigger value="profile" className="gap-2">
                <UserRoundCog className="h-4 w-4" />
                Профиль
              </TabsTrigger>
            )}
            {canViewOffers && (
              <TabsTrigger value="incoming" className="gap-2">
                <Inbox className="h-4 w-4" />
                Входящие
              </TabsTrigger>
            )}
          </TabsList>

          {canSearchContractors && (
            <TabsContent value="search" className="space-y-5">
              <ContractorSearchPanel categories={categories} canCreateOffer={canCreateOffer} />
            </TabsContent>
          )}

          {canViewOffers && (
            <TabsContent value="outgoing" className="space-y-5">
              <OutgoingOffersPanel canCancelOffer={canCancelOffer} canReviewOffer={canReviewOffer} />
            </TabsContent>
          )}

          {canViewProfile && (
            <TabsContent value="profile" className="space-y-5">
              {profile ? (
                <ProfileEditor
                  profile={profile}
                  categories={categories}
                  organization={organization}
                  organizationProfile={organizationProfile}
                  isSaving={isSaving}
                  isPublishing={isPublishing}
                  isUploadingDocument={isUploadingDocument}
                  onSave={saveProfile}
                  onPublish={publishProfile}
                  onPause={pauseProfile}
                  onUploadDocument={uploadDocument}
                  onDeleteDocument={deleteDocument}
                />
              ) : (
                <Alert>
                  <AlertDescription>Профиль подрядчика пока недоступен.</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          )}

          {canViewOffers && (
            <TabsContent value="incoming" className="space-y-5">
              <OfferInbox />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default ContractorMarketplacePage;
