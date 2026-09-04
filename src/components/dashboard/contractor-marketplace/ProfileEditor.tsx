import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, EyeOff, FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  MarketplaceAvailabilityStatus,
  MarketplaceContractorProfile,
  MarketplacePortfolioItem,
  MarketplacePortfolioItemPayload,
  MarketplaceProfileCategory,
  MarketplaceProfileUpdatePayload,
  MarketplaceRegion,
  MarketplaceWorkCategory,
} from '@/types/contractor-marketplace';
import type { OrganizationProfile } from '@/types/organization-profile';
import type { Organization } from '@/utils/api';
import {
  buildContractorMarketplaceDraftDefaults,
  optionalNumber,
  toStringValue,
  type MarketplaceCategoryDraft,
  type MarketplaceRegionDraft,
} from '@/utils/contractorMarketplaceDefaults';

interface PortfolioDraft {
  category_id: string;
  title: string;
  description: string;
  city: string;
  completed_at: string;
}

interface ProfileEditorProps {
  profile: MarketplaceContractorProfile;
  categories: MarketplaceWorkCategory[];
  organization: Organization | null;
  organizationProfile: OrganizationProfile | null;
  isSaving: boolean;
  isPublishing: boolean;
  isUploadingDocument: boolean;
  onSave: (payload: MarketplaceProfileUpdatePayload) => Promise<void>;
  onPublish: () => Promise<void>;
  onPause: () => Promise<void>;
  onUploadDocument: (file: File, type: string, title: string) => Promise<void>;
  onDeleteDocument: (documentId: number) => Promise<void>;
}

const flattenCategories = (categories: MarketplaceWorkCategory[]): MarketplaceWorkCategory[] => (
  categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])])
);

const portfolioDraftFromProfile = (item: MarketplacePortfolioItem): PortfolioDraft => ({
  category_id: item.category_id ? String(item.category_id) : 'none',
  title: item.title ?? '',
  description: item.description ?? '',
  city: item.city ?? '',
  completed_at: item.completed_at ? item.completed_at.slice(0, 10) : '',
});

const availabilityLabels: Record<MarketplaceAvailabilityStatus, string> = {
  available: 'Готов к новым работам',
  partially_available: 'Частично доступен',
  busy: 'Загружен',
  hidden: 'Скрыт из каталога',
};

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  active: 'Опубликован',
  paused: 'На паузе',
  blocked: 'Заблокирован',
};

export const ProfileEditor = ({
  profile,
  categories,
  organization,
  organizationProfile,
  isSaving,
  isPublishing,
  isUploadingDocument,
  onSave,
  onPublish,
  onPause,
  onUploadDocument,
  onDeleteDocument,
}: ProfileEditorProps) => {
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
  const [displayName, setDisplayName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [teamSizeMin, setTeamSizeMin] = useState('');
  const [teamSizeMax, setTeamSizeMax] = useState('');
  const [yearsOnMarket, setYearsOnMarket] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<MarketplaceAvailabilityStatus>('hidden');
  const [availableFrom, setAvailableFrom] = useState('');
  const [categoryDrafts, setCategoryDrafts] = useState<MarketplaceCategoryDraft[]>([]);
  const [regionDrafts, setRegionDrafts] = useState<MarketplaceRegionDraft[]>([]);
  const [portfolioDrafts, setPortfolioDrafts] = useState<PortfolioDraft[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('license');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentInputVersion, setDocumentInputVersion] = useState(0);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const defaults = buildContractorMarketplaceDraftDefaults({
      profile,
      categories,
      organization,
      organizationProfile,
    });

    setDisplayName(defaults.displayName);
    setShortDescription(defaults.shortDescription);
    setDescription(defaults.description);
    setTeamSizeMin(toStringValue(profile.team_size_min));
    setTeamSizeMax(toStringValue(profile.team_size_max));
    setYearsOnMarket(toStringValue(profile.years_on_market));
    setBaseCity(defaults.baseCity);
    setServiceRadiusKm(toStringValue(profile.service_radius_km));
    setAvailabilityStatus(profile.availability_status ?? 'hidden');
    setAvailableFrom(profile.available_from ? profile.available_from.slice(0, 10) : '');
    setCategoryDrafts(defaults.categoryDrafts);
    setRegionDrafts(defaults.regionDrafts);
    setPortfolioDrafts(profile.portfolio_items.map(portfolioDraftFromProfile));
    setValidationError(null);
  }, [categories, organization, organizationProfile, profile]);

  const readinessChecks = [
    Boolean(displayName.trim()),
    Boolean(baseCity.trim()),
    availabilityStatus !== 'hidden',
    categoryDrafts.length > 0,
  ];
  const readinessPercent = Math.round((readinessChecks.filter(Boolean).length / readinessChecks.length) * 100);
  const canPublish = readinessChecks.every(Boolean) && profile.status !== 'active';

  const addCategory = () => {
    const firstCategoryId = flatCategories[0]?.id;

    if (!firstCategoryId) {
      return;
    }

    setCategoryDrafts((current) => [
      ...current,
      {
        category_id: firstCategoryId,
        is_primary: current.length === 0,
        experience_years: '',
        team_capacity: '',
        min_project_budget: '',
        max_project_budget: '',
      },
    ]);
  };

  const updateCategory = <K extends keyof MarketplaceCategoryDraft>(
    index: number,
    key: K,
    value: MarketplaceCategoryDraft[K]
  ) => {
    setCategoryDrafts((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return key === 'is_primary' && value === true ? { ...item, is_primary: false } : item;
      }

      return { ...item, [key]: value };
    }));
  };

  const removeCategory = (index: number) => {
    setCategoryDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addRegion = () => {
    setRegionDrafts((current) => [
      ...current,
      {
        country: 'Россия',
        region: '',
        city: '',
        is_primary: current.length === 0,
      },
    ]);
  };

  const updateRegion = <K extends keyof MarketplaceRegionDraft>(
    index: number,
    key: K,
    value: MarketplaceRegionDraft[K]
  ) => {
    setRegionDrafts((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return key === 'is_primary' && value === true ? { ...item, is_primary: false } : item;
      }

      return { ...item, [key]: value };
    }));
  };

  const removeRegion = (index: number) => {
    setRegionDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addPortfolioItem = () => {
    setPortfolioDrafts((current) => [
      ...current,
      {
        category_id: 'none',
        title: '',
        description: '',
        city: '',
        completed_at: '',
      },
    ]);
  };

  const updatePortfolioItem = <K extends keyof PortfolioDraft>(index: number, key: K, value: PortfolioDraft[K]) => {
    setPortfolioDrafts((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  };

  const removePortfolioItem = (index: number) => {
    setPortfolioDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const buildPayload = (): MarketplaceProfileUpdatePayload | null => {
    if (teamSizeMin && teamSizeMax && Number(teamSizeMax) < Number(teamSizeMin)) {
      setValidationError('Максимальный размер команды не может быть меньше минимального.');
      return null;
    }

    const normalizedCategories = categoryDrafts.map((category): MarketplaceProfileCategory => ({
      category_id: category.category_id,
      is_primary: category.is_primary,
      experience_years: optionalNumber(category.experience_years),
      team_capacity: optionalNumber(category.team_capacity),
      min_project_budget: optionalNumber(category.min_project_budget),
      max_project_budget: optionalNumber(category.max_project_budget),
    }));

    const normalizedRegions = regionDrafts
      .filter((region) => region.city.trim() || region.region.trim())
      .map((region): MarketplaceRegion => ({
        country: region.country.trim() || 'Россия',
        region: region.region.trim() || null,
        city: region.city.trim() || null,
        is_primary: region.is_primary,
      }));

    const normalizedPortfolioItems = portfolioDrafts
      .filter((item) => item.title.trim() !== '')
      .map((item): MarketplacePortfolioItemPayload => ({
        category_id: item.category_id === 'none' ? null : Number(item.category_id),
        title: item.title.trim(),
        description: item.description.trim() || null,
        city: item.city.trim() || null,
        completed_at: item.completed_at || null,
        media: [],
      }));

    setValidationError(null);

    return {
      display_name: displayName.trim() || null,
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      team_size_min: optionalNumber(teamSizeMin),
      team_size_max: optionalNumber(teamSizeMax),
      years_on_market: optionalNumber(yearsOnMarket),
      base_city: baseCity.trim() || null,
      service_radius_km: optionalNumber(serviceRadiusKm),
      availability_status: availabilityStatus,
      available_from: availableFrom || null,
      verification_level: profile.verification_level,
      categories: normalizedCategories,
      regions: normalizedRegions,
      portfolio_items: normalizedPortfolioItems,
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();

    if (!payload) {
      return;
    }

    await onSave(payload);
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentTitle.trim()) {
      setValidationError('Укажите название документа и выберите файл.');
      return;
    }

    setValidationError(null);
    setDocumentError(null);
    try {
      await onUploadDocument(documentFile, documentType, documentTitle.trim());
      setDocumentTitle('');
      setDocumentType('license');
      setDocumentFile(null);
      setDocumentInputVersion((current) => current + 1);
    } catch {
      setDocumentError('Не удалось загрузить документ. Файл и название сохранены в форме — попробуйте ещё раз.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">Профиль в каталоге подрядчиков</CardTitle>
              <CardDescription>Карточка, которую увидят генподрядчики из вашей закрытой сети.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                {statusLabels[profile.status] ?? 'Статус не указан'}
              </Badge>
              {profile.is_visible_in_marketplace ? (
                <Badge className="bg-emerald-600">В каталоге</Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <EyeOff className="h-3.5 w-3.5" />
                  Скрыт
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-2">
              <Label>Готовность к публикации</Label>
              <Progress aria-label="Готовность к публикации" value={readinessPercent} className="h-2" />
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <span className={displayName.trim() ? 'text-emerald-700' : ''}>Название</span>
                <span className={baseCity.trim() ? 'text-emerald-700' : ''}>Город</span>
                <span className={availabilityStatus !== 'hidden' ? 'text-emerald-700' : ''}>Доступность</span>
                <span className={categoryDrafts.length > 0 ? 'text-emerald-700' : ''}>Категории работ</span>
              </div>
            </div>
            <Alert className={canPublish ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : ''}>
              {canPublish ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{canPublish ? 'Можно публиковать' : 'Профиль не готов'}</AlertTitle>
              <AlertDescription>
                {canPublish ? 'Профиль пройдет в закрытый каталог после публикации.' : 'Заполните обязательные поля для публикации.'}
              </AlertDescription>
            </Alert>
          </div>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="market-profile-name">Название в каталоге</Label>
              <Input id="market-profile-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-city">Базовый город</Label>
              <Input id="market-profile-city" value={baseCity} onChange={(event) => setBaseCity(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-team-min">Команда от</Label>
              <Input id="market-profile-team-min" type="number" value={teamSizeMin} onChange={(event) => setTeamSizeMin(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-team-max">Команда до</Label>
              <Input id="market-profile-team-max" type="number" value={teamSizeMax} onChange={(event) => setTeamSizeMax(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-years">Лет на рынке</Label>
              <Input id="market-profile-years" type="number" value={yearsOnMarket} onChange={(event) => setYearsOnMarket(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-radius">Радиус работ, км</Label>
              <Input id="market-profile-radius" type="number" value={serviceRadiusKm} onChange={(event) => setServiceRadiusKm(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-availability">Доступность</Label>
              <Select value={availabilityStatus} onValueChange={(value) => setAvailabilityStatus(value as MarketplaceAvailabilityStatus)}>
                <SelectTrigger id="market-profile-availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availabilityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-profile-date">Свободны с</Label>
              <Input id="market-profile-date" type="date" value={availableFrom} onChange={(event) => setAvailableFrom(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="market-profile-summary">Короткое описание</Label>
              <Input id="market-profile-summary" value={shortDescription} maxLength={500} onChange={(event) => setShortDescription(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="market-profile-description">Описание</Label>
              <Textarea id="market-profile-description" value={description} rows={5} onChange={(event) => setDescription(event.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Категории работ</CardTitle>
              <CardDescription>Специализации, по которым вас смогут найти и оценить.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addCategory} disabled={flatCategories.length === 0}>
              <Plus className="mr-2 h-5 w-5 shrink-0" />
              Категория
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {categoryDrafts.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Добавьте хотя бы одну категорию работ.
            </div>
          )}
          {categoryDrafts.map((category, index) => (
            <div key={`${category.category_id}-${index}`} className="rounded-xl border p-4">
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`market-category-${index}`}>Категория</Label>
                  <Select
                    value={String(category.category_id)}
                    onValueChange={(value) => updateCategory(index, 'category_id', Number(value))}
                  >
                    <SelectTrigger id={`market-category-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {flatCategories.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-category-experience-${index}`}>Опыт, лет</Label>
                  <Input id={`market-category-experience-${index}`}
                    type="number"
                    value={category.experience_years}
                    onChange={(event) => updateCategory(index, 'experience_years', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-category-team-${index}`}>Бригада</Label>
                  <Input id={`market-category-team-${index}`}
                    type="number"
                    value={category.team_capacity}
                    onChange={(event) => updateCategory(index, 'team_capacity', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-category-budget-min-${index}`}>Бюджет от</Label>
                  <Input id={`market-category-budget-min-${index}`}
                    type="number"
                    value={category.min_project_budget}
                    onChange={(event) => updateCategory(index, 'min_project_budget', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-category-budget-max-${index}`}>Бюджет до</Label>
                  <Input id={`market-category-budget-max-${index}`}
                    type="number"
                    value={category.max_project_budget}
                    onChange={(event) => updateCategory(index, 'max_project_budget', event.target.value)}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 pb-2 text-sm">
                    <Checkbox
                      checked={category.is_primary}
                      onCheckedChange={(checked) => updateCategory(index, 'is_primary', checked === true)}
                    />
                    Основная
                  </label>
                  <Button type="button" variant="ghost" size="icon" aria-label={`Удалить категорию ${index + 1}`} onClick={() => removeCategory(index)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>География работ</CardTitle>
              <CardDescription>Города и регионы, где команда готова выходить на объект.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addRegion}>
              <Plus className="mr-2 h-5 w-5 shrink-0" />
              Регион
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {regionDrafts.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              География пока не указана.
            </div>
          )}
          {regionDrafts.map((region, index) => (
            <div key={index} className="grid gap-4 rounded-xl border p-4 lg:grid-cols-2 2xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor={`market-region-country-${index}`}>Страна</Label>
                <Input id={`market-region-country-${index}`} value={region.country} onChange={(event) => updateRegion(index, 'country', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`market-region-name-${index}`}>Регион</Label>
                <Input id={`market-region-name-${index}`} value={region.region} onChange={(event) => updateRegion(index, 'region', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`market-region-city-${index}`}>Город</Label>
                <Input id={`market-region-city-${index}`} value={region.city} onChange={(event) => updateRegion(index, 'city', event.target.value)} />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <Checkbox
                    checked={region.is_primary}
                    onCheckedChange={(checked) => updateRegion(index, 'is_primary', checked === true)}
                  />
                  Основной
                </label>
                <Button type="button" variant="ghost" size="icon" aria-label={`Удалить регион ${index + 1}`} onClick={() => removeRegion(index)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Портфолио работ</CardTitle>
              <CardDescription>Завершенные объекты, которые подтверждают специализацию команды.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addPortfolioItem}>
              <Plus className="mr-2 h-5 w-5 shrink-0" />
              Проект
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {portfolioDrafts.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Добавьте выполненные проекты, чтобы генподрядчик быстрее оценил опыт команды.
            </div>
          )}
          {portfolioDrafts.map((item, index) => (
            <div key={index} className="rounded-xl border p-4">
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`market-portfolio-title-${index}`}>Название</Label>
                  <Input id={`market-portfolio-title-${index}`} value={item.title} onChange={(event) => updatePortfolioItem(index, 'title', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-portfolio-category-${index}`}>Категория</Label>
                  <Select
                    value={item.category_id}
                    onValueChange={(value) => updatePortfolioItem(index, 'category_id', value)}
                  >
                    <SelectTrigger id={`market-portfolio-category-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без категории</SelectItem>
                      {flatCategories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-portfolio-city-${index}`}>Город</Label>
                  <Input id={`market-portfolio-city-${index}`} value={item.city} onChange={(event) => updatePortfolioItem(index, 'city', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`market-portfolio-date-${index}`}>Дата завершения</Label>
                  <Input id={`market-portfolio-date-${index}`} type="date" value={item.completed_at} onChange={(event) => updatePortfolioItem(index, 'completed_at', event.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="ghost" size="icon" aria-label={`Удалить проект из портфолио ${index + 1}`} onClick={() => removePortfolioItem(index)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor={`market-portfolio-description-${index}`}>Описание</Label>
                <Textarea id={`market-portfolio-description-${index}`} value={item.description} rows={3} onChange={(event) => updatePortfolioItem(index, 'description', event.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Документы</CardTitle>
          <CardDescription>Добавьте лицензии, свидетельства и другие документы, подтверждающие квалификацию компании.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="market-document-type">Тип</Label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={isUploadingDocument}>
                <SelectTrigger id="market-document-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="license">Лицензия</SelectItem>
                  <SelectItem value="certificate">Сертификат</SelectItem>
                  <SelectItem value="insurance">Страхование</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-document-title">Название</Label>
              <Input id="market-document-title" disabled={isUploadingDocument} value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-document-file">Файл</Label>
              <Input id="market-document-file"
                key={documentInputVersion}
                disabled={isUploadingDocument}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={() => void handleUploadDocument()} disabled={isUploadingDocument}>
                {isUploadingDocument ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Загрузить
              </Button>
            </div>
          </div>

          {documentError && <p role="alert" className="text-sm text-destructive">{documentError}</p>}

          {profile.documents.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Документы пока не загружены.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {profile.documents.map((document) => (
                <div key={document.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{document.title}</p>
                      <p className="text-sm text-muted-foreground">{document.type} · {document.status}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isUploadingDocument}
                    aria-label={`Удалить документ «${document.title}»`}
                    onClick={() => void onDeleteDocument(document.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
          <Button variant="outline" onClick={handleSave} disabled={isSaving || isPublishing}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить профиль
          </Button>
          {profile.status === 'active' ? (
            <Button variant="secondary" onClick={onPause} disabled={isSaving || isPublishing}>
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Скрыть из каталога
            </Button>
          ) : (
            <Button onClick={onPublish} disabled={!canPublish || isSaving || isPublishing}>
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Опубликовать
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
