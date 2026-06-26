import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import contractorMarketplaceApi from '@/utils/contractorMarketplaceApi';
import type {
  MarketplaceHiringOffer,
  MarketplaceOfferStatus,
  MarketplacePaginatedResponse,
} from '@/types/contractor-marketplace';

const offerStatusLabels: Record<MarketplaceOfferStatus, string> = {
  draft: 'Черновик',
  sent: 'Новое предложение',
  viewed: 'Просмотрен',
  accepted: 'Принят',
  declined: 'Отклонен',
  cancelled: 'Отменен',
  expired: 'Истек',
};

const offerStatusClasses: Record<MarketplaceOfferStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-orange-100 text-orange-800',
  viewed: 'bg-blue-100 text-blue-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-rose-100 text-rose-800',
  cancelled: 'bg-slate-100 text-slate-700',
  expired: 'bg-amber-100 text-amber-800',
};

const openStatuses = new Set<MarketplaceOfferStatus>(['sent', 'viewed']);

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

const formatMoney = (value: number | string | null | undefined, currency = 'RUB'): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numeric);
};

const formatBudgetRange = (
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  currency = 'RUB'
): string => {
  const minValue = formatMoney(min, currency);
  const maxValue = formatMoney(max, currency);

  if (minValue && maxValue) {
    return `${minValue} - ${maxValue}`;
  }

  return minValue || maxValue || 'Бюджет не указан';
};

const normalizeErrorMessage = (error: unknown): string => {
  const responseMessage = typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
    : null;

  return responseMessage || 'Не удалось выполнить действие. Попробуйте еще раз.';
};

interface OfferInboxProps {
  initialStatus?: MarketplaceOfferStatus | 'all';
}

export const OfferInbox = ({ initialStatus = 'all' }: OfferInboxProps) => {
  const [offers, setOffers] = useState<MarketplaceHiringOffer[]>([]);
  const [meta, setMeta] = useState<MarketplacePaginatedResponse<MarketplaceHiringOffer>['meta'] | null>(null);
  const [statusFilter, setStatusFilter] = useState<MarketplaceOfferStatus | 'all'>(initialStatus);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<MarketplaceHiringOffer | null>(null);
  const [declineOffer, setDeclineOffer] = useState<MarketplaceHiringOffer | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionOfferId, setActionOfferId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openOffersCount = useMemo(
    () => offers.filter((offer) => openStatuses.has(offer.status)).length,
    [offers]
  );

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await contractorMarketplaceApi.getOffers({
        page,
        per_page: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      setOffers(response.data);
      setMeta(response.meta);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const patchOffer = (updatedOffer: MarketplaceHiringOffer) => {
    setOffers((current) => current.map((offer) => (
      offer.id === updatedOffer.id ? updatedOffer : offer
    )));
    setSelectedOffer((current) => (
      current?.id === updatedOffer.id ? updatedOffer : current
    ));
  };

  const openOfferDetail = async (offer: MarketplaceHiringOffer) => {
    setSelectedOffer(offer);
    setIsDetailLoading(true);
    setErrorMessage(null);

    try {
      const detail = await contractorMarketplaceApi.getOffer(offer.id);
      const nextDetail = detail.status === 'sent'
        ? await contractorMarketplaceApi.markOfferViewed(detail.id)
        : detail;

      patchOffer(nextDetail);
      setSelectedOffer(nextDetail);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const acceptSelectedOffer = async (offer: MarketplaceHiringOffer) => {
    setActionOfferId(offer.id);
    setErrorMessage(null);

    try {
      const updatedOffer = await contractorMarketplaceApi.acceptOffer(offer.id);
      patchOffer(updatedOffer);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setActionOfferId(null);
    }
  };

  const confirmDecline = async () => {
    if (!declineOffer) {
      return;
    }

    setActionOfferId(declineOffer.id);
    setErrorMessage(null);

    try {
      const updatedOffer = await contractorMarketplaceApi.declineOffer(declineOffer.id, declineReason);
      patchOffer(updatedOffer);
      setDeclineOffer(null);
      setDeclineReason('');
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
    } finally {
      setActionOfferId(null);
    }
  };

  const selectedCanRespond = selectedOffer ? openStatuses.has(selectedOffer.status) : false;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Предложения о работе</h2>
          <p className="text-sm text-muted-foreground">
            Входящие предложения от генподрядчиков из вашей закрытой сети.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Badge variant="outline" className="h-9 justify-center px-3">
            {openOffersCount} требуют ответа
          </Badge>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setPage(1);
              setStatusFilter(value as MarketplaceOfferStatus | 'all');
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="sent">Новые</SelectItem>
              <SelectItem value="viewed">Просмотренные</SelectItem>
              <SelectItem value="accepted">Принятые</SelectItem>
              <SelectItem value="declined">Отклоненные</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
              <SelectItem value="expired">Истекшие</SelectItem>
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
          <h3 className="text-lg font-semibold">Предложений пока нет</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Когда генподрядчик из вашей сети отправит предложение на проект, оно появится здесь.
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
                      {offer.hiring_organization?.name ?? 'Организация не указана'}
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
                    <Clock3 className="h-4 w-4" />
                    <span>Ответ до {formatDate(offer.expires_at)}</span>
                  </div>
                </div>

                {offer.work_packages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {offer.work_packages.slice(0, 3).map((workPackage) => (
                      <Badge key={workPackage.id ?? workPackage.title} variant="secondary">
                        {workPackage.category?.name ?? workPackage.title}
                      </Badge>
                    ))}
                    {offer.work_packages.length > 3 && (
                      <Badge variant="outline">+{offer.work_packages.length - 3}</Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => void openOfferDetail(offer)}>
                    <Eye className="mr-2 h-4 w-4" />
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedOffer?.title ?? 'Предложение о работе'}</SheetTitle>
          </SheetHeader>

          {isDetailLoading || !selectedOffer ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={offerStatusClasses[selectedOffer.status]}>
                  {offerStatusLabels[selectedOffer.status]}
                </Badge>
                <Badge variant="outline">{selectedOffer.hiring_organization?.name ?? 'Генподрядчик не указан'}</Badge>
              </div>

              <div className="grid gap-3 rounded-xl border p-4 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Проект</span>
                  <p className="font-medium">{selectedOffer.project?.name ?? 'Не указан'}</p>
                </div>
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
                  <span className="text-muted-foreground">Ответ до</span>
                  <p className="font-medium">{formatDate(selectedOffer.expires_at)}</p>
                </div>
                {selectedOffer.project?.address && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Адрес</span>
                    <p className="flex items-center gap-2 font-medium">
                      <MapPin className="h-4 w-4" />
                      {selectedOffer.project.address}
                    </p>
                  </div>
                )}
              </div>

              {selectedOffer.message && (
                <div className="rounded-xl border p-4">
                  <h3 className="mb-2 font-semibold">Сообщение</h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{selectedOffer.message}</p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold">Пакеты работ</h3>
                {selectedOffer.work_packages.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                    Пакеты работ не указаны.
                  </div>
                ) : (
                  selectedOffer.work_packages.map((workPackage) => (
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
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <span>Объем: {workPackage.quantity ?? 'не указан'} {workPackage.unit ?? ''}</span>
                        <span>Сроки: {formatDate(workPackage.starts_at)} - {formatDate(workPackage.ends_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedOffer.decline_reason && (
                <Alert>
                  <AlertDescription>{selectedOffer.decline_reason}</AlertDescription>
                </Alert>
              )}

              <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t bg-background/95 p-4 backdrop-blur sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  disabled={!selectedCanRespond || actionOfferId === selectedOffer.id}
                  onClick={() => setDeclineOffer(selectedOffer)}
                >
                  {actionOfferId === selectedOffer.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Отклонить
                </Button>
                <Button
                  disabled={!selectedCanRespond || actionOfferId === selectedOffer.id}
                  onClick={() => void acceptSelectedOffer(selectedOffer)}
                >
                  {actionOfferId === selectedOffer.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Принять предложение
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={declineOffer !== null} onOpenChange={(open) => !open && setDeclineOffer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить предложение</DialogTitle>
            <DialogDescription>
              Причина будет видна генподрядчику в карточке предложения.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Причина</Label>
            <Textarea
              value={declineReason}
              rows={4}
              maxLength={1000}
              onChange={(event) => setDeclineReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineOffer(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => void confirmDecline()} disabled={actionOfferId !== null}>
              {actionOfferId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferInbox;
