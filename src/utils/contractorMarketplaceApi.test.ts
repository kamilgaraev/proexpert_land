import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from './api';
import contractorMarketplaceApi from './contractorMarketplaceApi';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const apiResponse = (data: unknown) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {}, url: '/contractor-marketplace/test' },
});

const category = {
  id: 3,
  parent_id: null,
  slug: 'monolith',
  name: 'Монолитные работы',
  type: 'construction',
  is_active: true,
  sort_order: 10,
  children: [],
};

const profile = {
  id: 11,
  organization_id: 7,
  status: 'draft',
  display_name: 'Монолит Про',
  short_description: null,
  description: null,
  team_size_min: null,
  team_size_max: null,
  years_on_market: null,
  base_city: null,
  service_radius_km: null,
  availability_status: 'hidden',
  available_from: null,
  verification_level: 'none',
  is_visible_in_marketplace: false,
  published_at: null,
  metadata: {},
  categories: [],
  ratings: [],
  regions: [],
  portfolio_items: [],
  documents: [],
  created_at: '2026-05-30T10:00:00+03:00',
  updated_at: '2026-05-30T10:00:00+03:00',
};

const offer = {
  id: 21,
  status: 'sent',
  role: 'contractor',
  title: 'Монолит на корпус 1',
  message: null,
  project: { id: 5, name: 'ЖК Север', address: 'Казань', status: 'active' },
  hiring_organization: { id: 2, name: 'Генподрядчик' },
  contractor_organization: { id: 7, name: 'Монолит Про' },
  contractor_profile: profile,
  work_packages: [{ id: 31, category, title: 'Каркас' }],
  reviews: [],
  starts_at: null,
  ends_at: null,
  budget_min: null,
  budget_max: null,
  currency: 'RUB',
  expires_at: null,
  sent_at: '2026-05-30T10:00:00+03:00',
  viewed_at: null,
  accepted_at: null,
  declined_at: null,
  cancelled_at: null,
  decline_reason: null,
  status_reason: null,
  metadata: {},
  created_at: '2026-05-30T10:00:00+03:00',
  updated_at: '2026-05-30T10:00:00+03:00',
};

describe('contractorMarketplaceApi', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.put).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  it('loads categories from LandingResponse payload', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse({
        success: true,
        data: [category],
    }));

    await expect(contractorMarketplaceApi.getCategories()).resolves.toEqual([category]);
    expect(api.get).toHaveBeenCalledWith('/contractor-marketplace/categories');
  });

  it('loads and updates profile with normalized optional arrays', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse({
        success: true,
        data: {
          ...profile,
          categories: undefined,
        },
    }));
    vi.mocked(api.put).mockResolvedValueOnce(apiResponse(profile));

    const loaded = await contractorMarketplaceApi.getProfile();
    await contractorMarketplaceApi.updateProfile({ display_name: 'Монолит Про' });

    expect(loaded.categories).toEqual([]);
    expect(api.get).toHaveBeenCalledWith('/contractor-marketplace/profile');
    expect(api.put).toHaveBeenCalledWith('/contractor-marketplace/profile', {
      display_name: 'Монолит Про',
    });
  });

  it('publishes and pauses profile', async () => {
    vi.mocked(api.post).mockResolvedValue(apiResponse(profile));

    await expect(contractorMarketplaceApi.publishProfile()).resolves.toMatchObject({ id: 11 });
    await expect(contractorMarketplaceApi.pauseProfile()).resolves.toMatchObject({ id: 11 });

    expect(api.post).toHaveBeenNthCalledWith(1, '/contractor-marketplace/profile/publish');
    expect(api.post).toHaveBeenNthCalledWith(2, '/contractor-marketplace/profile/pause');
  });

  it('uploads and deletes profile documents', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(apiResponse(profile));
    vi.mocked(api.delete).mockResolvedValueOnce(apiResponse(profile));

    const file = new File(['content'], 'license.pdf', { type: 'application/pdf' });

    await contractorMarketplaceApi.uploadDocument(file, 'license', 'Лицензия');
    await contractorMarketplaceApi.deleteDocument(45);

    expect(api.post).toHaveBeenCalledWith(
      '/contractor-marketplace/profile/documents',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    expect(api.delete).toHaveBeenCalledWith('/contractor-marketplace/profile/documents/45');
  });

  it('searches contractors and loads public contractor profile', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(apiResponse({
        data: [{
          id: 11,
          organization_id: 7,
          display_name: 'Монолит Про',
          short_description: 'Монолитные работы',
          base_city: 'Казань',
          availability_status: 'available',
          verification_level: 'verified',
          team_size_min: 12,
          team_size_max: 30,
          published_at: '2026-05-30T10:00:00+03:00',
          category_match: null,
          category_rating: null,
        }],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 12,
          total: 1,
        },
        summary: {
          network_size: 4,
        },
      }))
      .mockResolvedValueOnce(apiResponse(profile));

    const response = await contractorMarketplaceApi.searchContractors({
      search: 'монолит',
      category_id: undefined,
      page: 1,
      per_page: 12,
    });
    const loadedProfile = await contractorMarketplaceApi.getPublicProfile(11);

    expect(api.get).toHaveBeenNthCalledWith(1, '/contractor-marketplace/search', {
      params: {
        search: 'монолит',
        page: 1,
        per_page: 12,
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/contractor-marketplace/profiles/11');
    expect(response.summary?.network_size).toBe(4);
    expect(response.data[0].display_name).toBe('Монолит Про');
    expect(loadedProfile.id).toBe(11);
  });

  it('loads offer inbox with compact params and pagination', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse({
        data: [offer],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 1,
        },
    }));

    const response = await contractorMarketplaceApi.getOffers({
      status: 'sent',
      project_id: undefined,
      page: 1,
    });

    expect(api.get).toHaveBeenCalledWith('/contractor-marketplace/offers', {
      params: {
        status: 'sent',
        page: 1,
      },
    });
    expect(response.data[0].contractor_profile?.id).toBe(11);
    expect(response.meta.total).toBe(1);
  });

  it('manages outgoing offers through landing endpoints', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce(apiResponse({
        data: [offer],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 1,
        },
      }))
      .mockResolvedValueOnce(apiResponse(offer));
    vi.mocked(api.post).mockResolvedValue(apiResponse(offer));

    await contractorMarketplaceApi.getOutgoingOffers({ status: 'sent', page: 1 });
    await contractorMarketplaceApi.getOutgoingOffer(21);
    await contractorMarketplaceApi.createOffer({
      project_id: 5,
      contractor_profile_id: 11,
      role: 'contractor',
      title: 'Монолит на корпус 1',
      work_packages: [{ category_id: 3, title: 'Каркас' }],
    });
    await contractorMarketplaceApi.cancelOutgoingOffer(21, { reason: 'Изменили график' });
    await contractorMarketplaceApi.reviewOutgoingOffer(21, {
      reviews: [{
        category_id: 3,
        quality_score: 5,
        deadline_score: 5,
        communication_score: 4,
      }],
    });

    expect(api.get).toHaveBeenNthCalledWith(1, '/contractor-marketplace/outgoing-offers', {
      params: {
        status: 'sent',
        page: 1,
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, '/contractor-marketplace/outgoing-offers/21');
    expect(api.post).toHaveBeenNthCalledWith(1, '/contractor-marketplace/outgoing-offers', {
      project_id: 5,
      contractor_profile_id: 11,
      role: 'contractor',
      title: 'Монолит на корпус 1',
      work_packages: [{ category_id: 3, title: 'Каркас' }],
    });
    expect(api.post).toHaveBeenNthCalledWith(2, '/contractor-marketplace/outgoing-offers/21/cancel', {
      reason: 'Изменили график',
    });
    expect(api.post).toHaveBeenNthCalledWith(3, '/contractor-marketplace/outgoing-offers/21/review', {
      reviews: [{
        category_id: 3,
        quality_score: 5,
        deadline_score: 5,
        communication_score: 4,
      }],
    });
  });

  it('marks offer viewed, accepts and declines with reason', async () => {
    vi.mocked(api.post).mockResolvedValue(apiResponse(offer));

    await contractorMarketplaceApi.markOfferViewed(21);
    await contractorMarketplaceApi.acceptOffer(21);
    await contractorMarketplaceApi.declineOffer(21, 'Нет свободной бригады');

    expect(api.post).toHaveBeenNthCalledWith(1, '/contractor-marketplace/offers/21/view');
    expect(api.post).toHaveBeenNthCalledWith(2, '/contractor-marketplace/offers/21/accept');
    expect(api.post).toHaveBeenNthCalledWith(3, '/contractor-marketplace/offers/21/decline', {
      reason: 'Нет свободной бригады',
    });
  });
});
