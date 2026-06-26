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

interface CategoryDraft {
  category_id: number;
  is_primary: boolean;
  experience_years: string;
  team_capacity: string;
  min_project_budget: string;
  max_project_budget: string;
}

interface RegionDraft {
  country: string;
  region: string;
  city: string;
  is_primary: boolean;
}

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

const toStringValue = (value: string | number | null | undefined): string => (
  value === null || value === undefined ? '' : String(value)
);

const optionalNumber = (value: string): number | null => {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const categoryDraftFromProfile = (category: MarketplaceProfileCategory): CategoryDraft => ({
  category_id: category.category_id,
  is_primary: category.is_primary,
  experience_years: toStringValue(category.experience_years),
  team_capacity: toStringValue(category.team_capacity),
  min_project_budget: toStringValue(category.min_project_budget),
  max_project_budget: toStringValue(category.max_project_budget),
});

const regionDraftFromProfile = (region: MarketplaceRegion): RegionDraft => ({
  country: region.country || 'Россия',
  region: region.region ?? '',
  city: region.city ?? '',
  is_primary: region.is_primary,
});

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
  const [categoryDrafts, setCategoryDrafts] = useState<CategoryDraft[]>([]);
  const [regionDrafts, setRegionDrafts] = useState<RegionDraft[]>([]);
  const [portfolioDrafts, setPortfolioDrafts] = useState<PortfolioDraft[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('license');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(profile.display_name ?? '');
    setShortDescription(profile.short_description ?? '');
    setDescription(profile.description ?? '');
    setTeamSizeMin(toStringValue(profile.team_size_min));
    setTeamSizeMax(toStringValue(profile.team_size_max));
    setYearsOnMarket(toStringValue(profile.years_on_market));
    setBaseCity(profile.base_city ?? '');
    setServiceRadiusKm(toStringValue(profile.service_radius_km));
    setAvailabilityStatus(profile.availability_status ?? 'hidden');
    setAvailableFrom(profile.available_from ? profile.available_from.slice(0, 10) : '');
    setCategoryDrafts(profile.categories.map(categoryDraftFromProfile));
    setRegionDrafts(profile.regions.map(regionDraftFromProfile));
    setPortfolioDrafts(profile.portfolio_items.map(portfolioDraftFromProfile));
    setValidationError(null);
  }, [profile]);

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

  const updateCategory = <K extends keyof CategoryDraft>(index: number, key: K, value: CategoryDraft[K]) => {
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

  const updateRegion = <K extends keyof RegionDraft>(index: number, key: K, value: RegionDraft[K]) => {
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
    await onUploadDocument(documentFile, documentType, documentTitle.trim());
    setDocumentTitle('');
    setDocumentType('license');
    setDocumentFile(null);
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
                {statusLabels[profile.status] ?? profile.status}
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
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="space-y-2">
              <Label>Готовность к публикации</Label>
              <Progress value={readinessPercent} className="h-2" />
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
              <Label>Название в каталоге</Label>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Базовый город</Label>
              <Input value={baseCity} onChange={(event) => setBaseCity(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Команда от</Label>
              <Input type="number" value={teamSizeMin} onChange={(event) => setTeamSizeMin(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Команда до</Label>
              <Input type="number" value={teamSizeMax} onChange={(event) => setTeamSizeMax(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Лет на рынке</Label>
              <Input type="number" value={yearsOnMarket} onChange={(event) => setYearsOnMarket(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Радиус работ, км</Label>
              <Input type="number" value={serviceRadiusKm} onChange={(event) => setServiceRadiusKm(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Доступность</Label>
              <Select value={availabilityStatus} onValueChange={(value) => setAvailabilityStatus(value as MarketplaceAvailabilityStatus)}>
                <SelectTrigger>
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
              <Label>Свободны с</Label>
              <Input type="date" value={availableFrom} onChange={(event) => setAvailableFrom(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Короткое описание</Label>
              <Input value={shortDescription} maxLength={500} onChange={(event) => setShortDescription(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Описание</Label>
              <Textarea value={description} rows={5} onChange={(event) => setDescription(event.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Категории работ</CardTitle>
              <CardDescription>Специализации, по которым вас смогут найти и оценить.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addCategory} disabled={flatCategories.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
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
              <div className="grid gap-4 md:grid-cols-[1.5fr_repeat(4,1fr)_auto]">
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select
                    value={String(category.category_id)}
                    onValueChange={(value) => updateCategory(index, 'category_id', Number(value))}
                  >
                    <SelectTrigger>
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
                  <Label>Опыт, лет</Label>
                  <Input
                    type="number"
                    value={category.experience_years}
                    onChange={(event) => updateCategory(index, 'experience_years', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Бригада</Label>
                  <Input
                    type="number"
                    value={category.team_capacity}
                    onChange={(event) => updateCategory(index, 'team_capacity', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Бюджет от</Label>
                  <Input
                    type="number"
                    value={category.min_project_budget}
                    onChange={(event) => updateCategory(index, 'min_project_budget', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Бюджет до</Label>
                  <Input
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
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCategory(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>География работ</CardTitle>
              <CardDescription>Города и регионы, где команда готова выходить на объект.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addRegion}>
              <Plus className="mr-2 h-4 w-4" />
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
            <div key={index} className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <Label>Страна</Label>
                <Input value={region.country} onChange={(event) => updateRegion(index, 'country', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Регион</Label>
                <Input value={region.region} onChange={(event) => updateRegion(index, 'region', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Город</Label>
                <Input value={region.city} onChange={(event) => updateRegion(index, 'city', event.target.value)} />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <Checkbox
                    checked={region.is_primary}
                    onCheckedChange={(checked) => updateRegion(index, 'is_primary', checked === true)}
                  />
                  Основной
                </label>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRegion(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Портфолио работ</CardTitle>
              <CardDescription>Завершенные объекты, которые подтверждают специализацию команды.</CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addPortfolioItem}>
              <Plus className="mr-2 h-4 w-4" />
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
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input value={item.title} onChange={(event) => updatePortfolioItem(index, 'title', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select
                    value={item.category_id}
                    onValueChange={(value) => updatePortfolioItem(index, 'category_id', value)}
                  >
                    <SelectTrigger>
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
                  <Label>Город</Label>
                  <Input value={item.city} onChange={(event) => updatePortfolioItem(index, 'city', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Дата завершения</Label>
                  <Input type="date" value={item.completed_at} onChange={(event) => updatePortfolioItem(index, 'completed_at', event.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePortfolioItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Описание</Label>
                <Textarea value={item.description} rows={3} onChange={(event) => updatePortfolioItem(index, 'description', event.target.value)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Документы</CardTitle>
          <CardDescription>Лицензии, свидетельства и подтверждающие файлы хранятся в S3-папке вашей организации.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.4fr_auto]">
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
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
              <Label>Название</Label>
              <Input value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Файл</Label>
              <Input
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

          {profile.documents.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Документы пока не загружены.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {profile.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
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
                    onClick={() => void onDeleteDocument(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
