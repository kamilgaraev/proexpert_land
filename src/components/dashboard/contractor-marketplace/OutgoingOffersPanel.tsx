import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Briefcase,
  CalendarDays,
  Loader2,
  RefreshCw,
  Star,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useMyProjects } from '@/hooks/useMyProjects';
import contractorMarketplaceApi from '@/utils/contractorMarketplaceApi';
import type {
  MarketplaceHiringOffer,
  MarketplaceOfferReviewItemPayload,
  MarketplaceOfferStatus,
  MarketplaceOffersParams,
  MarketplacePaginatedResponse,
  MarketplaceWorkCategory,
  MoneyLike,
} from '@/types/contractor-marketplace';

const offerStatusLabels: Record<MarketplaceOfferStatus, string> = {
  draft: 'Черновик',
  sent: 'Отправлен',
  viewed: 'Просмотрен',
  accepted: 'Принят',
  declined: 'Отклонен',
  cancelled: 'Отменен',
  expired: 'Истек',
};

const offerStatusClasses: Record<MarketplaceOfferStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-indigo-100 text-indigo-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-rose-100 text-rose-800',
  cancelled: 'bg-slate-100 text-slate-700',
  expired: 'bg-amber-100 text-amber-800',
};

type ReviewScoreField = keyof Pick<
  MarketplaceOfferReviewItemPayload,
  | 'quality_score'
  | 'deadline_score'
  | 'communication_score'
  | 'safety_score'
  | 'financial_discipline_score'
>;

type ReviewDraft = Record<number, Required<Pick<
  MarketplaceOfferReviewItemPayload,
  ReviewScoreField
>> & { comment: string }>;

const reviewScoreLabels: Array<{ field: ReviewScoreField; label: string }> = [
  { field: 'quality_score', label: 'Качество' },
  { field: 'deadline_score', label: 'Сроки' },
  { field: 'communication_score', label: 'Коммуникация' },
  { field: 'safety_score', label: 'Безопасность' },
  { field: 'financial_discipline_score', label: 'Финансовая дисциплина' },
];

const scoreOptions = [1, 2, 3, 4, 5];
const cancellableStatuses = new Set<MarketplaceOfferStatus>(['sent', 'viewed']);

const normalizeErrorMessage = (error: unknown): string => {
  const responseMessage = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
    : null;

  return responseMessage || 'Не удалось выполнить действие. Попробуйте еще раз.';
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return 'Не указано';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const formatMoney = (value: MoneyLike | undefined, currency = 'RUB'): string | null => {
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

const formatBudgetRange = (min: MoneyLike | undefined, max: MoneyLike | undefined, currency = 'RUB'): string => {
  const minValue = formatMoney(min, currency);
  const maxValue = formatMoney(max, currency);

  if (minValue && maxValue) {
    return `${minValue} - ${maxValue}`;
  }

  return minValue || maxValue || 'Бюджет не указан';
};

const scoreValue = (value: unknown, defaultValue = 5): number => {
  const score = Number(value);

  return Number.isFinite(score) && score >= 1 ? score : defaultValue;
};

interface OutgoingOffersPanelProps {
  canCancelOffer: boolean;
  canReviewOffer: boolean;
}

export const OutgoingOffersPanel = ({ canCancelOffer, canReviewOffer }: OutgoingOffersPanelProps) => {
  const { projects, loading: projectsLoading, fetchProjects } = useMyProjects();
  const [offers, setOffers] = useState<MarketplaceHiringOffer[]>([]);
  const [meta, setMeta] = useState<MarketplacePaginatedResponse<MarketplaceHiringOffer>['meta'] | null>(null);
  const [filters, setFilters] = useState<MarketplaceOffersParams>({});
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<MarketplaceHiringOffer | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MarketplaceHiringOffer | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionOfferId, setActionOfferId] = useState<number | null>(null);
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>({});

  const activeProjects = useMemo(
    () => projects.filter((project) => !['completed', 'cancelled'].includes(project.status)),
    [projects]
  );

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await contractorMarketplaceApi.getOutgoingOffers({
        ...filters,
        page,
        per_page: 20,
      });

      setOffers(response.data);
      setMeta(response.meta);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const updateFilter = <K extends keyof MarketplaceOffersParams>(
    key: K,
    value: MarketplaceOffersParams[K] | undefined
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setPage(1);
  };

  const openDetails = async (offer: MarketplaceHiringOffer) => {
    setSelectedOffer(offer);
    setIsDetailLoading(true);
    setErrorMessage(null);

    try {
      setSelectedOffer(await contractorMarketplaceApi.getOutgoingOffer(offer.id));
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const patchOffer = (updatedOffer: MarketplaceHiringOffer) => {
    setOffers((current) => current.map((offer) => (
      offer.id === updatedOffer.id ? updatedOffer : offer
    )));
    setSelectedOffer((current) => (
      current?.id === updatedOffer.id ? updatedOffer : current
    ));
  };

  const confirmCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    setActionOfferId(cancelTarget.id);
    setErrorMessage(null);

    try {
      const updatedOffer = await contractorMarketplaceApi.cancelOutgoingOffer(cancelTarget.id, {
        reason: cancelReason.trim() || undefined,
      });
      patchOffer(updatedOffer);
      setCancelTarget(null);
      setCancelReason('');
      toast.success('Оффер отменен');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setActionOfferId(null);
    }
  };

  const reviewCategories = useMemo(() => {
    if (!selectedOffer) {
      return [];
    }

    const categories = new Map<number, MarketplaceWorkCategory>();

    selectedOffer.work_packages.forEach((workPackage) => {
      if (workPackage.category?.id) {
        categories.set(workPackage.category.id, workPackage.category);
      }
    });

    return Array.from(categories.values());
  }, [selectedOffer]);

  useEffect(() => {
    if (!selectedOffer || selectedOffer.status !== 'accepted') {
      setReviewDraft({});
      return;
    }

    const nextDraft: ReviewDraft = {};

    reviewCategories.forEach((category) => {
      const existingReview = selectedOffer.reviews.find((review) => review.category?.id === category.id);

      nextDraft[category.id] = {
        quality_score: scoreValue(existingReview?.quality_score),
        deadline_score: scoreValue(existingReview?.deadline_score),
        communication_score: scoreValue(existingReview?.communication_score),
        safety_score: scoreValue(existingReview?.safety_score),
        financial_discipline_score: scoreValue(existingReview?.financial_discipline_score),
        comment: existingReview?.comment ?? '',
      };
    });

    setReviewDraft(nextDraft);
  }, [reviewCategories, selectedOffer]);

  const updateReviewDraft = (
    categoryId: number,
    field: ReviewScoreField | 'comment',
    value: number | string
  ) => {
    setReviewDraft((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] ?? {
          quality_score: 5,
          deadline_score: 5,
          communication_score: 5,
          safety_score: 5,
          financial_discipline_score: 5,
          comment: '',
        }),
        [field]: field === 'comment' ? String(value) : scoreValue(value),
      },
    }));
  };

  const submitReview = async () => {
    if (!selectedOffer || reviewCategories.length === 0) {
      return;
    }

    setActionOfferId(selectedOffer.id);
    setErrorMessage(null);

    try {
      const reviews = reviewCategories.map((category) => {
        const draft = reviewDraft[category.id];

        return {
          category_id: category.id,
          quality_score: draft?.quality_score ?? 5,
          deadline_score: draft?.deadline_score ?? 5,
          communication_score: draft?.communication_score ?? 5,
          safety_score: draft?.safety_score ?? 5,
          financial_discipline_score: draft?.financial_discipline_score ?? 5,
          comment: draft?.comment?.trim() || undefined,
        };
      });

      const updatedOffer = await contractorMarketplaceApi.reviewOutgoingOffer(selectedOffer.id, { reviews });
      patchOffer(updatedOffer);
      toast.success('Оценка подрядчика сохранена');
    } catch (error) {
      const message = normalizeErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setActionOfferId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Исходящие офферы</h2>
          <p className="text-sm text-muted-foreground">
            Предложения, отправленные подрядчикам из закрытой сети.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={filters.project_id ? String(filters.project_id) : 'all'}
            disabled={projectsLoading}
            onValueChange={(value) => updateFilter('project_id', value === 'all' ? undefined : Number(value))}
          >
            <SelectTrigger className="h-9 w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проекты</SelectItem>
              {activeProjects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value as MarketplaceOfferStatus)}
          >
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(offerStatusLabels)
                .filter(([status]) => status !== 'draft')
                .map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => void loadOffers()} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Обновить
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <Briefcase className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Офферов пока нет</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Выберите подрядчика в каталоге и отправьте предложение по проекту.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardHeader className="space-y-3 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {offer.contractor_profile?.display_name ?? offer.contractor_organization?.name ?? 'Подрядчик'}
                    </p>
                  </div>
                  <Badge className={offerStatusClasses[offer.status]}>
                    {offerStatusLabels[offer.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{offer.project?.name ?? 'Проект не указан'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    <span>{formatBudgetRange(offer.budget_min, offer.budget_max, offer.currency)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDate(offer.starts_at)} - {formatDate(offer.ends_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>{offer.reviews.length > 0 ? 'Оценка сохранена' : 'Оценка не заполнена'}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => void openDetails(offer)}>
                    Открыть
                  </Button>
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

      <Sheet open={selectedOffer !== null} onOpenChange={(open) => !open && setSelectedOffer(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          {isDetailLoading || !selectedOffer ? (
            <div className="flex min-h-72 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selectedOffer.title}</SheetTitle>
                <SheetDescription>
                  {selectedOffer.contractor_profile?.display_name ?? selectedOffer.contractor_organization?.name ?? 'Подрядчик'}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-wrap gap-2">
                <Badge className={offerStatusClasses[selectedOffer.status]}>
                  {offerStatusLabels[selectedOffer.status]}
                </Badge>
                <Badge variant="outline">{selectedOffer.project?.name ?? 'Проект не указан'}</Badge>
              </div>

              <div className="grid gap-3 rounded-xl border p-4 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Бюджет</span>
                  <p className="font-medium">
                    {formatBudgetRange(selectedOffer.budget_min, selectedOffer.budget_max, selectedOffer.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Сроки</span>
                  <p className="font-medium">
                    {formatDate(selectedOffer.starts_at)} - {formatDate(selectedOffer.ends_at)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Отправлен</span>
                  <p className="font-medium">{formatDate(selectedOffer.sent_at ?? selectedOffer.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Действует до</span>
                  <p className="font-medium">{formatDate(selectedOffer.expires_at)}</p>
                </div>
              </div>

              {selectedOffer.message && (
                <div className="rounded-xl border p-4">
                  <h3 className="mb-2 font-semibold">Сообщение</h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{selectedOffer.message}</p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold">Пакеты работ</h3>
                {selectedOffer.work_packages.map((workPackage) => (
                  <div key={workPackage.id ?? workPackage.title} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium">{workPackage.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workPackage.category?.name ?? 'Категория не указана'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatBudgetRange(workPackage.budget_min, workPackage.budget_max, selectedOffer.currency)}
                      </Badge>
                    </div>
                    {workPackage.description && (
                      <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                        {workPackage.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {(selectedOffer.decline_reason || selectedOffer.status_reason) && (
                <Alert>
                  <AlertDescription>{selectedOffer.decline_reason ?? selectedOffer.status_reason}</AlertDescription>
                </Alert>
              )}

              {selectedOffer.status === 'accepted' && canReviewOffer && reviewCategories.length > 0 && (
                <div className="space-y-4 rounded-xl border p-4">
                  <h3 className="font-semibold">Оценка подрядчика</h3>
                  {reviewCategories.map((category) => {
                    const draft = reviewDraft[category.id];

                    return (
                      <div key={category.id} className="space-y-3 rounded-xl border p-4">
                        <h4 className="font-medium">{category.name}</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {reviewScoreLabels.map(({ field, label }) => (
                            <div key={field} className="space-y-2">
                              <Label>{label}</Label>
                              <Select
                                value={String(draft?.[field] ?? 5)}
                                onValueChange={(value) => updateReviewDraft(category.id, field, Number(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {scoreOptions.map((score) => (
                                    <SelectItem key={score} value={String(score)}>
                                      {score}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <Label>Комментарий</Label>
                          <Textarea
                            value={draft?.comment ?? ''}
                            rows={3}
                            onChange={(event) => updateReviewDraft(category.id, 'comment', event.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Button onClick={() => void submitReview()} disabled={actionOfferId === selectedOffer.id}>
                    {actionOfferId === selectedOffer.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить оценку
                  </Button>
                </div>
              )}

              {canCancelOffer && cancellableStatuses.has(selectedOffer.status) && (
                <div className="sticky bottom-0 -mx-6 border-t bg-background/95 p-4 backdrop-blur">
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={actionOfferId === selectedOffer.id}
                    onClick={() => setCancelTarget(selectedOffer)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Отменить оффер
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={cancelTarget !== null} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить оффер</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Alert>
              <AlertDescription>
                Подрядчик больше не сможет принять это предложение. Уже принятые офферы отменить нельзя.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Причина отмены</Label>
              <Textarea
                value={cancelReason}
                rows={4}
                maxLength={1000}
                onChange={(event) => setCancelReason(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={actionOfferId !== null}>
              Закрыть
            </Button>
            <Button variant="destructive" onClick={() => void confirmCancel()} disabled={actionOfferId !== null}>
              {actionOfferId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Отменить оффер
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutgoingOffersPanel;
