import type {
  ContractorInvitation,
  InvitationFilters,
  InvitationListResponse,
} from '../types/contractor-invitations';

const emptyInvitationListResponse: InvitationListResponse = {
  data: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 0,
    total: 0,
    has_more_pages: false,
  },
  meta: {
    type: 'received',
    filters: {},
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown, fallback: number): number => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const normalizePagination = (value: unknown): InvitationListResponse['pagination'] => {
  if (!isRecord(value)) {
    return emptyInvitationListResponse.pagination;
  }

  return {
    current_page: toNumber(value.current_page, emptyInvitationListResponse.pagination.current_page),
    last_page: toNumber(value.last_page, emptyInvitationListResponse.pagination.last_page),
    per_page: toNumber(value.per_page, emptyInvitationListResponse.pagination.per_page),
    total: toNumber(value.total, emptyInvitationListResponse.pagination.total),
    has_more_pages: Boolean(value.has_more_pages),
  };
};

const normalizeMeta = (
  wrapperPayload: unknown,
  listPayload: unknown,
): InvitationListResponse['meta'] => {
  const wrapperMeta = isRecord(wrapperPayload) ? wrapperPayload.meta : undefined;
  const listMeta = isRecord(listPayload) ? listPayload.meta : undefined;
  const meta = isRecord(wrapperMeta) ? wrapperMeta : listMeta;

  if (!isRecord(meta)) {
    return emptyInvitationListResponse.meta;
  }

  return {
    type: meta.type === 'received' ? 'received' : emptyInvitationListResponse.meta.type,
    filters: isRecord(meta.filters) ? (meta.filters as InvitationFilters) : {},
  };
};

export const normalizeInvitationListResponse = (payload: unknown): InvitationListResponse => {
  const landingPayload = isRecord(payload) && 'data' in payload ? payload.data : payload;
  const listPayload =
    isRecord(landingPayload) &&
    isRecord(landingPayload.data) &&
    Array.isArray(landingPayload.data.data)
      ? landingPayload.data
      : landingPayload;

  if (!isRecord(listPayload)) {
    return emptyInvitationListResponse;
  }

  return {
    data: Array.isArray(listPayload.data) ? (listPayload.data as ContractorInvitation[]) : [],
    pagination: normalizePagination(listPayload.pagination),
    meta: normalizeMeta(landingPayload, listPayload),
  };
};
