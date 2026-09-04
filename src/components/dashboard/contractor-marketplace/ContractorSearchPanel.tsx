import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  ChevronDown,
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
  if (value === null || value === undefined || value === '') return 'Нет оценок';
  const score = Number(value);

  return Number.isFinite(score) ? score.toFixed(1) : 'Нет оценок';
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
  const additionalFilterCount = ['availability_status', 'verification_level', 'min_rating', 'team_capacity_min'].filter(
    key => draftFilters[key as keyof MarketplaceSearchParams] !== undefined
  ).length;
  const hasAppliedFilters = Object.entries(filters).some(([key, value]) => key !== 'sort_by' && value !== undefined && value !== '');

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
      toast.success('Предложение подрядчику отправлено');
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
      <form aria-label="Поиск подрядчиков" className="space-y-5 border-b border-border py-6" onSubmit={event => { event.preventDefault(); applyFilters(); }} onInvalidCapture={event => {
        if (event.target instanceof HTMLElement) {
          const details = event.target.closest('details');
          if (details) details.open = true;
        }
      }}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <div className="space-y-2">
            <Label htmlFor="contractor-search">Название или специализация</Label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="contractor-search"
                className="pl-11"
                placeholder="Например, монолитные работы"
                value={draftFilters.search ?? ''}
                onChange={(event) => updateDraftFilter('search', event.target.value || undefined)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractor-category">Категория</Label>
            <Select
              value={draftFilters.category_id ? String(draftFilters.category_id) : 'all'}
              onValueChange={(value) => updateDraftFilter('category_id', value === 'all' ? undefined : Number(value))}
            >
              <SelectTrigger id="contractor-category">
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
            <Label htmlFor="contractor-city">Город</Label>
            <Input
              id="contractor-city"
              value={draftFilters.city ?? ''}
              onChange={(event) => updateDraftFilter('city', event.target.value || undefined)}
            />
          </div>

          <Button type="submit" className="md:self-end" disabled={isLoading}>
            <Search aria-hidden="true" className="mr-2 h-5 w-5" />Найти подрядчика
          </Button>
        </div>

        <details className="group">
          <summary className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
            Уточнить поиск{additionalFilterCount > 0 ? ` · ${additionalFilterCount}` : ''}
            <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="contractor-sort">Сортировка</Label>
            <Select
              value={draftFilters.sort_by ?? 'relevance'}
              onValueChange={(value) => updateDraftFilter('sort_by', value as MarketplaceSearchParams['sort_by'])}
            >
              <SelectTrigger id="contractor-sort">
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
            <Label htmlFor="contractor-availability">Доступность</Label>
            <Select
              value={draftFilters.availability_status ?? 'all'}
              onValueChange={(value) => updateDraftFilter(
                'availability_status',
                value === 'all' ? undefined : value as MarketplaceSearchParams['availability_status']
              )}
            >
              <SelectTrigger id="contractor-availability">
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
            <Label htmlFor="contractor-verification">Проверка</Label>
            <Select
              value={draftFilters.verification_level ?? 'all'}
              onValueChange={(value) => updateDraftFilter(
                'verification_level',
                value === 'all' ? undefined : value as MarketplaceSearchParams['verification_level']
              )}
            >
              <SelectTrigger id="contractor-verification">
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
            <Label htmlFor="contractor-rating">Рейтинг от</Label>
            <Input
              id="contractor-rating"
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
            <Label htmlFor="contractor-team">Команда от</Label>
            <Input
              id="contractor-team"
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
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" disabled={isLoading}>Применить условия</Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>Сбросить поиск</Button>
          </div>
        </details>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <h2 className="most-workspace-heading" aria-live="polite">
          {isLoading ? 'Ищем подрядчиков…' : errorMessage ? 'Результаты поиска' : `Подрядчики · ${meta?.total ?? contractors.length}`}
        </h2>
        {hasAppliedFilters && <Button type="button" variant="ghost" onClick={resetFilters}>Сбросить фильтры</Button>}
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
      ) : errorMessage ? (
        <Button variant="outline" onClick={() => void loadContractors()}>Повторить поиск</Button>
      ) : contractors.length === 0 ? (
        <div className="py-12 sm:py-16">
          <BriefcaseBusiness aria-hidden="true" className="mb-5 h-8 w-8 text-muted-foreground" />
          <h3 className="most-workspace-heading">{networkSize === 0 ? 'В каталоге пока нет подрядчиков' : 'По этим условиям никого не нашли'}</h3>
          <p className="mt-3 max-w-lg text-base text-muted-foreground">
            {networkSize === 0 ? 'Опубликованные профили появятся здесь. В них можно будет посмотреть специализацию, команду и условия работы.' : 'Попробуйте другую категорию или город. Можно сбросить уточнения и посмотреть весь каталог.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contractors.map((contractor) => (
            <Card key={contractor.id} className="flex flex-col overflow-hidden">
              <CardHeader className="space-y-3 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="break-words text-lg">{contractor.display_name}</CardTitle>
                    <p className="truncate text-sm text-muted-foreground">
                      {contractor.organization?.name ?? 'Организация'}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {ratingText(contractor.category_rating?.score ?? null)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 shrink-0" />
                    <span>{contractor.base_city ?? contractor.organization?.city ?? 'Город не указан'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 shrink-0" />
                    <span>{formatTeam(contractor)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span>{contractor.verification_level === 'verified' ? 'Проверен' : 'Проверка не завершена'}</span>
                  </div>
                </div>

                {contractor.category_match && (
                  <div className="border-t border-border pt-4">
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

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => void openProfile(contractor.id)}>
                    <Eye className="mr-2 h-5 w-5 shrink-0" />
                    Профиль
                  </Button>
                  {canCreateOffer && (
                    <Button className="flex-1" onClick={() => void openOfferDialog(contractor)}>
                      <Send className="mr-2 h-5 w-5 shrink-0" />
                      Предложить работу
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
                <Badge variant="outline">{selectedProfile.availability_status === 'hidden' ? 'Скрыт из каталога' : availabilityOptions.find((option) => option.value === selectedProfile.availability_status)?.label ?? 'Доступность не указана'}</Badge>
                <Badge variant="outline">{verificationOptions.find((option) => option.value === selectedProfile.verification_level)?.label ?? 'Статус проверки не указан'}</Badge>
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
                      <Banknote className="h-5 w-5 shrink-0" />
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
                    <Send className="mr-2 h-5 w-5 shrink-0" />
                    Отправить предложение
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
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
          Загружаем профиль
        </div>
      )}
    </div>
  );
};

export default ContractorSearchPanel;
