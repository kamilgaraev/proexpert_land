import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  Eye,
  Loader2,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import HiringOfferDialog from '@/components/dashboard/contractor-marketplace/HiringOfferDialog';
import contractorMarketplaceApi from '@/utils/contractorMarketplaceApi';
import type {
  MarketplaceAvailabilityStatus,
  MarketplaceContractorListItem,
  MarketplaceContractorProfile,
  MarketplaceCreateOfferPayload,
  MarketplaceSearchParams,
  MarketplaceSearchResponse,
  MarketplaceWorkCategory,
  MoneyLike,
} from '@/types/contractor-marketplace';

interface ContractorSearchPanelProps {
  categories: MarketplaceWorkCategory[];
  canCreateOffer: boolean;
}

const perPage = 12;

const availabilityOptions: Array<{ value: Exclude<MarketplaceAvailabilityStatus, 'hidden'>; label: string }> = [
  { value: 'available', label: 'Готов к работам' },
  { value: 'partially_available', label: 'Частично доступен' },
  { value: 'busy', label: 'Загружен' },
];

const verificationOptions = [
  { value: 'none', label: 'Без проверки' },
  { value: 'basic', label: 'Базовая' },
  { value: 'documents', label: 'Документы' },
  { value: 'verified', label: 'Проверен' },
];

const sortOptions = [
  { value: 'relevance', label: 'По релевантности' },
  { value: 'category_rating', label: 'По рейтингу категории' },
  { value: 'name', label: 'По названию' },
];

const flattenCategories = (categories: MarketplaceWorkCategory[]): MarketplaceWorkCategory[] => (
  categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])])
);

const normalizeErrorMessage = (error: unknown): string => {
  const responseMessage = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
    : null;

  return responseMessage || 'Не удалось выполнить действие. Попробуйте еще раз.';
};

const formatMoney = (value: MoneyLike, currency = 'RUB'): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatBudgetRange = (min: MoneyLike, max: MoneyLike): string => {
  const minValue = formatMoney(min);
  const maxValue = formatMoney(max);

  if (minValue && maxValue) {
    return `${minValue} - ${maxValue}`;
  }

  return minValue || maxValue || 'Бюджет не указан';
};

const formatTeam = (contractor: MarketplaceContractorListItem): string => {
  if (!contractor.team_size_min && !contractor.team_size_max) {
    return 'Команда не указана';
  }

  return `${contractor.team_size_min ?? 1}-${contractor.team_size_max ?? contractor.team_size_min} чел.`;
};

const ratingText = (value: MoneyLike): string => {
  const score = Number(value);

  return Number.isFinite(score) ? score.toFixed(1) : 'нет';
};

const compactDraft = (filters: MarketplaceSearchParams): MarketplaceSearchParams => {
  const next: MarketplaceSearchParams = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      next[key as keyof MarketplaceSearchParams] = value as never;
    }
  });

  return next;
};

export const ContractorSearchPanel = ({ categories, canCreateOffer }: ContractorSearchPanelProps) => {
  const [draftFilters, setDraftFilters] = useState<MarketplaceSearchParams>({ sort_by: 'relevance' });
  const [filters, setFilters] = useState<MarketplaceSearchParams>({ sort_by: 'relevance' });
  const [contractors, setContractors] = useState<MarketplaceContractorListItem[]>([]);
  const [meta, setMeta] = useState<MarketplaceSearchResponse['meta'] | null>(null);
  const [networkSize, setNetworkSize] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MarketplaceContractorProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [offerProfile, setOfferProfile] = useState<MarketplaceContractorProfile | null>(null);
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const loadContractors = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await contractorMarketplaceApi.searchContractors({
        ...filters,
        page,
        per_page: perPage,
      });

      setContractors(response.data);
      setMeta(response.meta);
      setNetworkSize(response.summary?.network_size ?? null);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void loadContractors();
  }, [loadContractors]);

  const updateDraftFilter = <K extends keyof MarketplaceSearchParams>(
    key: K,
    value: MarketplaceSearchParams[K] | undefined
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setPage(1);
    setFilters(compactDraft(draftFilters));
  };

  const resetFilters = () => {
    const nextFilters: MarketplaceSearchParams = { sort_by: 'relevance' };
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
    setPage(1);
  };

  const openProfile = async (profileId: number) => {
    setSelectedProfile(null);
    setIsProfileLoading(true);
    setErrorMessage(null);

    try {
      setSelectedProfile(await contractorMarketplaceApi.getPublicProfile(profileId));
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsProfileLoading(false);
    }
  };

  const openOfferDialog = async (contractor: MarketplaceContractorListItem | MarketplaceContractorProfile) => {
    if (!canCreateOffer) {
      return;
    }

    if ('categories' in contractor) {
      setOfferProfile(contractor);
      return;
    }

    setIsProfileLoading(true);
    setErrorMessage(null);

    try {
      setOfferProfile(await contractorMarketplaceApi.getPublicProfile(contractor.id));
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsProfileLoading(false);
    }
  };

  const submitOffer = async (payload: MarketplaceCreateOfferPayload) => {
    setIsOfferSubmitting(true);
    setErrorMessage(null);

    try {
      await contractorMarketplaceApi.createOffer(payload);
      setOfferProfile(null);
      toast.success('Оффер подрядчику отправлен');
      await loadContractors();
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsOfferSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Подрядчиков в сети</p>
            <p className="mt-1 text-2xl font-semibold">{networkSize ?? '...'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Найдено по фильтрам</p>
            <p className="mt-1 text-2xl font-semibold">{meta?.total ?? contractors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Категорий работ</p>
            <p className="mt-1 text-2xl font-semibold">{flatCategories.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Фильтры каталога</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Поиск</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={draftFilters.search ?? ''}
                onChange={(event) => updateDraftFilter('search', event.target.value || undefined)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select
              value={draftFilters.category_id ? String(draftFilters.category_id) : 'all'}
              onValueChange={(value) => updateDraftFilter('category_id', value === 'all' ? undefined : Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
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
            <Input
              value={draftFilters.city ?? ''}
              onChange={(event) => updateDraftFilter('city', event.target.value || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label>Сортировка</Label>
            <Select
              value={draftFilters.sort_by ?? 'relevance'}
              onValueChange={(value) => updateDraftFilter('sort_by', value as MarketplaceSearchParams['sort_by'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Доступность</Label>
            <Select
              value={draftFilters.availability_status ?? 'all'}
              onValueChange={(value) => updateDraftFilter(
                'availability_status',
                value === 'all' ? undefined : value as MarketplaceSearchParams['availability_status']
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                {availabilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Проверка</Label>
            <Select
              value={draftFilters.verification_level ?? 'all'}
              onValueChange={(value) => updateDraftFilter(
                'verification_level',
                value === 'all' ? undefined : value as MarketplaceSearchParams['verification_level']
              )}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                {verificationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Рейтинг от</Label>
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={draftFilters.min_rating ?? ''}
              onChange={(event) => updateDraftFilter(
                'min_rating',
                event.target.value === '' ? undefined : Number(event.target.value)
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Команда от</Label>
            <Input
              type="number"
              min={1}
              value={draftFilters.team_capacity_min ?? ''}
              onChange={(event) => updateDraftFilter(
                'team_capacity_min',
                event.target.value === '' ? undefined : Number(event.target.value)
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={resetFilters}>
            Сбросить
          </Button>
          <Button onClick={applyFilters}>
            <Search className="mr-2 h-4 w-4" />
            Найти
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      ) : contractors.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Подрядчики не найдены</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Проверьте фильтры или пригласите подрядчика в закрытую сеть.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contractors.map((contractor) => (
            <Card key={contractor.id} className="flex flex-col overflow-hidden">
              <CardHeader className="space-y-3 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="truncate text-base">{contractor.display_name}</CardTitle>
                    <p className="truncate text-sm text-muted-foreground">
                      {contractor.organization?.name ?? 'Организация'}
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {ratingText(contractor.category_rating?.score ?? null)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{contractor.base_city ?? contractor.organization?.city ?? 'Город не указан'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{formatTeam(contractor)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{contractor.verification_level === 'verified' ? 'Проверен' : 'Проверка не завершена'}</span>
                  </div>
                </div>

                {contractor.category_match && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="font-medium">{contractor.category_match.name ?? 'Категория работ'}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Опыт: {contractor.category_match.experience_years ?? 0} лет · {formatBudgetRange(
                        contractor.category_match.min_project_budget,
                        contractor.category_match.max_project_budget
                      )}
                    </p>
                  </div>
                )}

                {contractor.short_description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{contractor.short_description}</p>
                )}

                <div className="mt-auto flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => void openProfile(contractor.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Профиль
                  </Button>
                  {canCreateOffer && (
                    <Button className="flex-1" onClick={() => void openOfferDialog(contractor)}>
                      <Send className="mr-2 h-4 w-4" />
                      Оффер
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between rounded-xl border bg-background p-3">
          <span className="text-sm text-muted-foreground">
            Страница {meta.current_page} из {meta.last_page}, всего {meta.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.last_page || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}

      <Sheet open={isProfileLoading || selectedProfile !== null} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          {isProfileLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedProfile && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selectedProfile.display_name ?? selectedProfile.organization?.name ?? 'Профиль подрядчика'}</SheetTitle>
                <SheetDescription>
                  {selectedProfile.organization?.name ?? 'Организация'} · {selectedProfile.base_city ?? 'город не указан'}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selectedProfile.availability_status}</Badge>
                <Badge variant="outline">{selectedProfile.verification_level}</Badge>
                {selectedProfile.published_at && <Badge variant="secondary">Опубликован</Badge>}
              </div>

              {selectedProfile.description && (
                <div className="rounded-xl border p-4">
                  <h3 className="mb-2 font-semibold">О подрядчике</h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{selectedProfile.description}</p>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                {selectedProfile.categories.map((category) => (
                  <div key={category.id ?? category.category_id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium">{category.category?.name ?? `Категория #${category.category_id}`}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Опыт: {category.experience_years ?? 0} лет · Бригада: {category.team_capacity ?? 'не указана'}
                        </p>
                      </div>
                      <Badge variant="outline">{ratingText(category.rating_score ?? null)}</Badge>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Banknote className="h-4 w-4" />
                      {formatBudgetRange(category.min_project_budget, category.max_project_budget)}
                    </p>
                  </div>
                ))}
              </div>

              {selectedProfile.regions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">География работ</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.regions.map((region) => (
                      <Badge key={region.id ?? `${region.country}-${region.region}-${region.city}`} variant={region.is_primary ? 'default' : 'outline'}>
                        {[region.city, region.region, region.country].filter(Boolean).join(', ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.portfolio_items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Портфолио</h3>
                  <div className="space-y-2">
                    {selectedProfile.portfolio_items.map((item) => (
                      <div key={item.id} className="rounded-xl border p-4">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[item.city, item.completed_at].filter(Boolean).join(' · ')}
                        </p>
                        {item.description && (
                          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canCreateOffer && (
                <div className="sticky bottom-0 -mx-6 border-t bg-background/95 p-4 backdrop-blur">
                  <Button className="w-full" onClick={() => void openOfferDialog(selectedProfile)}>
                    <Send className="mr-2 h-4 w-4" />
                    Отправить оффер
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <HiringOfferDialog
        open={offerProfile !== null}
        profile={offerProfile}
        submitting={isOfferSubmitting}
        onClose={() => setOfferProfile(null)}
        onSubmit={submitOffer}
      />

      {isProfileLoading && !selectedProfile && !offerProfile && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаем профиль
        </div>
      )}
    </div>
  );
};

export default ContractorSearchPanel;
