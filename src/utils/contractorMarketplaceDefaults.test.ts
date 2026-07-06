import { describe, expect, it } from 'vitest';

import { buildContractorMarketplaceDraftDefaults } from './contractorMarketplaceDefaults';
import type {
  MarketplaceContractorProfile,
  MarketplaceWorkCategory,
} from '@/types/contractor-marketplace';
import type { OrganizationProfile } from '@/types/organization-profile';
import type { Organization } from '@/utils/api';

const category = (
  id: number,
  slug: string,
  name: string,
  children: MarketplaceWorkCategory[] = []
): MarketplaceWorkCategory => ({
  id,
  parent_id: null,
  slug,
  name,
  type: 'construction',
  is_active: true,
  sort_order: id,
  children,
});

const baseProfile: MarketplaceContractorProfile = {
  id: 10,
  organization_id: 20,
  status: 'draft',
  display_name: null,
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
  organization: {
    id: 20,
    name: 'Монолит Про',
    city: 'Казань',
    is_verified: true,
  },
  categories: [],
  ratings: [],
  regions: [],
  portfolio_items: [],
  documents: [],
  created_at: null,
  updated_at: null,
};

const organization = {
  id: 20,
  name: 'Монолит Про',
  legal_name: 'ООО Монолит Про',
  tax_number: '1650000000',
  city: 'Казань',
  country: 'Россия',
  description: 'Монолитные и фасадные работы на коммерческих объектах.',
  is_active: true,
  verification: {
    is_verified: true,
    verified_at: null,
    verification_status: 'verified',
    verification_status_text: 'Проверена',
    verification_score: 100,
    verification_data: {},
    verification_notes: '',
    can_be_verified: true,
  },
  created_at: '',
  updated_at: '',
} satisfies Organization;

const organizationProfile: OrganizationProfile = {
  organization_id: 20,
  name: 'Монолит Про',
  inn: '1650000000',
  capabilities: ['subcontracting'],
  primary_business_type: 'subcontracting',
  specializations: ['facade_works', 'roofing_works'],
  certifications: [],
  profile_completeness: 75,
  onboarding_completed: true,
  onboarding_completed_at: null,
  recommended_modules: [],
  workspace_profile: null,
};

const categories: MarketplaceWorkCategory[] = [
  category(1, 'construction', 'Строительно-монтажные работы', [
    category(2, 'facade', 'Фасадные работы'),
    category(3, 'roofing', 'Кровельные работы'),
  ]),
];

describe('buildContractorMarketplaceDraftDefaults', () => {
  it('fills empty marketplace draft from organization data and work directions', () => {
    const defaults = buildContractorMarketplaceDraftDefaults({
      profile: baseProfile,
      categories,
      organization,
      organizationProfile,
    });

    expect(defaults.displayName).toBe('Монолит Про');
    expect(defaults.baseCity).toBe('Казань');
    expect(defaults.shortDescription).toBe('Монолитные и фасадные работы на коммерческих объектах.');
    expect(defaults.description).toBe('Монолитные и фасадные работы на коммерческих объектах.');
    expect(defaults.regionDrafts).toEqual([
      {
        country: 'Россия',
        region: '',
        city: 'Казань',
        is_primary: true,
      },
    ]);
    expect(defaults.categoryDrafts.map((item) => item.category_id)).toEqual([1, 2, 3]);
    expect(defaults.categoryDrafts[0].is_primary).toBe(true);
  });

  it('keeps existing marketplace values instead of replacing them from organization data', () => {
    const defaults = buildContractorMarketplaceDraftDefaults({
      profile: {
        ...baseProfile,
        display_name: 'Фасадные системы',
        base_city: 'Москва',
        categories: [
          {
            category_id: 3,
            is_primary: true,
            experience_years: 8,
            team_capacity: null,
            min_project_budget: null,
            max_project_budget: null,
          },
        ],
        regions: [
          {
            country: 'Россия',
            region: 'Московская область',
            city: 'Москва',
            is_primary: true,
          },
        ],
      },
      categories,
      organization,
      organizationProfile,
    });

    expect(defaults.displayName).toBe('Фасадные системы');
    expect(defaults.baseCity).toBe('Москва');
    expect(defaults.categoryDrafts).toEqual([
      {
        category_id: 3,
        is_primary: true,
        experience_years: '8',
        team_capacity: '',
        min_project_budget: '',
        max_project_budget: '',
      },
    ]);
    expect(defaults.regionDrafts).toEqual([
      {
        country: 'Россия',
        region: 'Московская область',
        city: 'Москва',
        is_primary: true,
      },
    ]);
  });
});
