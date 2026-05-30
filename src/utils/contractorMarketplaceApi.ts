import api from './api';
import type {
  MarketplaceContractorProfile,
  MarketplaceHiringOffer,
  MarketplaceOffersParams,
  MarketplacePaginatedResponse,
  MarketplaceProfileUpdatePayload,
  MarketplaceWorkCategory,
} from '@/types/contractor-marketplace';

type RecordPayload = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordPayload => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const unwrapResponseData = <T>(payload: unknown): T => {
  let current = payload;

  for (let index = 0; index < 4; index += 1) {
    if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, 'data')) {
      break;
    }

    const hasWrapperKeys = ['success', 'message', 'meta', 'links', 'summary', 'errors'].some(
      (key) => key in (current as RecordPayload)
    );

    if (!hasWrapperKeys) {
      break;
    }

    current = current.data;
  }

  return current as T;
};

const compactParams = <T extends object>(params?: T): Partial<T> | undefined => {
  if (!params) {
    return undefined;
  }

  const compacted = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ) as Partial<T>;

  return Object.keys(compacted).length > 0 ? compacted : undefined;
};

const normalizeProfile = (payload: unknown): MarketplaceContractorProfile => {
  const profile = unwrapResponseData<MarketplaceContractorProfile>(payload);

  return {
    ...profile,
    categories: Array.isArray(profile.categories) ? profile.categories : [],
    ratings: Array.isArray(profile.ratings) ? profile.ratings : [],
    regions: Array.isArray(profile.regions) ? profile.regions : [],
    portfolio_items: Array.isArray(profile.portfolio_items) ? profile.portfolio_items : [],
    documents: Array.isArray(profile.documents) ? profile.documents : [],
    metadata: profile.metadata ?? {},
  };
};

const normalizeOffer = (payload: unknown): MarketplaceHiringOffer => {
  const offer = unwrapResponseData<MarketplaceHiringOffer>(payload);

  return {
    ...offer,
    contractor_profile: offer.contractor_profile ? normalizeProfile(offer.contractor_profile) : null,
    work_packages: Array.isArray(offer.work_packages) ? offer.work_packages : [],
    metadata: offer.metadata ?? {},
  };
};

const normalizePaginatedOffers = (payload: unknown): MarketplacePaginatedResponse<MarketplaceHiringOffer> => {
  const source = isRecord(payload) && isRecord(payload.data) && Array.isArray(payload.data.data)
    ? payload.data
    : payload;
  const data = isRecord(source) && Array.isArray(source.data)
    ? source.data.map(normalizeOffer)
    : [];
  const metaSource = isRecord(source) && isRecord(source.meta) ? source.meta : {};

  return {
    data,
    meta: {
      current_page: Number(metaSource.current_page ?? 1),
      last_page: Number(metaSource.last_page ?? 1),
      per_page: Number(metaSource.per_page ?? (data.length || 20)),
      total: Number(metaSource.total ?? data.length),
      ...metaSource,
    },
    links: isRecord(source) && isRecord(source.links) ? source.links : undefined,
  };
};

export const contractorMarketplaceApi = {
  async getCategories(): Promise<MarketplaceWorkCategory[]> {
    const response = await api.get('/contractor-marketplace/categories');
    const categories = unwrapResponseData<MarketplaceWorkCategory[]>(response.data);

    return Array.isArray(categories) ? categories : [];
  },

  async getProfile(): Promise<MarketplaceContractorProfile> {
    const response = await api.get('/contractor-marketplace/profile');

    return normalizeProfile(response.data);
  },

  async updateProfile(payload: MarketplaceProfileUpdatePayload): Promise<MarketplaceContractorProfile> {
    const response = await api.put('/contractor-marketplace/profile', payload);

    return normalizeProfile(response.data);
  },

  async publishProfile(): Promise<MarketplaceContractorProfile> {
    const response = await api.post('/contractor-marketplace/profile/publish');

    return normalizeProfile(response.data);
  },

  async pauseProfile(): Promise<MarketplaceContractorProfile> {
    const response = await api.post('/contractor-marketplace/profile/pause');

    return normalizeProfile(response.data);
  },

  async uploadDocument(file: File, type: string, title: string): Promise<MarketplaceContractorProfile> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    formData.append('title', title);

    const response = await api.post('/contractor-marketplace/profile/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return normalizeProfile(response.data);
  },

  async deleteDocument(documentId: number): Promise<MarketplaceContractorProfile> {
    const response = await api.delete(`/contractor-marketplace/profile/documents/${documentId}`);

    return normalizeProfile(response.data);
  },

  async getOffers(params: MarketplaceOffersParams = {}): Promise<MarketplacePaginatedResponse<MarketplaceHiringOffer>> {
    const requestParams = compactParams(params);
    const response = requestParams
      ? await api.get('/contractor-marketplace/offers', { params: requestParams })
      : await api.get('/contractor-marketplace/offers');

    return normalizePaginatedOffers(response.data);
  },

  async getOffer(offerId: number): Promise<MarketplaceHiringOffer> {
    const response = await api.get(`/contractor-marketplace/offers/${offerId}`);

    return normalizeOffer(response.data);
  },

  async markOfferViewed(offerId: number): Promise<MarketplaceHiringOffer> {
    const response = await api.post(`/contractor-marketplace/offers/${offerId}/view`);

    return normalizeOffer(response.data);
  },

  async acceptOffer(offerId: number): Promise<MarketplaceHiringOffer> {
    const response = await api.post(`/contractor-marketplace/offers/${offerId}/accept`);

    return normalizeOffer(response.data);
  },

  async declineOffer(offerId: number, reason?: string): Promise<MarketplaceHiringOffer> {
    const response = await api.post(`/contractor-marketplace/offers/${offerId}/decline`, {
      reason: reason?.trim() || undefined,
    });

    return normalizeOffer(response.data);
  },
};

export default contractorMarketplaceApi;
