import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, Loader2, UserRoundCog } from 'lucide-react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OfferInbox from '@/components/dashboard/contractor-marketplace/OfferInbox';
import ProfileEditor from '@/components/dashboard/contractor-marketplace/ProfileEditor';
import { usePageTitle } from '@/hooks/useSEO';
import contractorMarketplaceApi from '@/utils/contractorMarketplaceApi';
import type {
  MarketplaceContractorProfile,
  MarketplaceProfileUpdatePayload,
  MarketplaceWorkCategory,
} from '@/types/contractor-marketplace';

const normalizeErrorMessage = (error: unknown): string => {
  const responseMessage = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
    : null;

  return responseMessage || 'Не удалось загрузить данные маркетплейса.';
};

const ContractorMarketplacePage = () => {
  const [categories, setCategories] = useState<MarketplaceWorkCategory[]>([]);
  const [profile, setProfile] = useState<MarketplaceContractorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  usePageTitle('Маркетплейс подрядчика');

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [loadedCategories, loadedProfile] = await Promise.all([
        contractorMarketplaceApi.getCategories(),
        contractorMarketplaceApi.getProfile(),
      ]);

      setCategories(loadedCategories);
      setProfile(loadedProfile);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">Маркетплейс подрядчика</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Закрытый профиль для сотрудничества с генподрядчиками, входящие оферы и рабочие категории.
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

      {isLoading || !profile ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-xl border bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка маркетплейса</span>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="space-y-5">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="profile" className="gap-2">
              <UserRoundCog className="h-4 w-4" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <BriefcaseBusiness className="h-4 w-4" />
              Оферы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-5">
            <ProfileEditor
              profile={profile}
              categories={categories}
              isSaving={isSaving}
              isPublishing={isPublishing}
              isUploadingDocument={isUploadingDocument}
              onSave={saveProfile}
              onPublish={publishProfile}
              onPause={pauseProfile}
              onUploadDocument={uploadDocument}
              onDeleteDocument={deleteDocument}
            />
          </TabsContent>

          <TabsContent value="offers" className="space-y-5">
            <OfferInbox />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ContractorMarketplacePage;
