import type {
  MarketplaceContractorProfile,
  MarketplaceProfileCategory,
  MarketplaceRegion,
  MarketplaceWorkCategory,
} from '@/types/contractor-marketplace';
import type { OrganizationCapability, OrganizationProfile } from '@/types/organization-profile';
import type { Organization } from '@/utils/api';

export interface MarketplaceCategoryDraft {
  category_id: number;
  is_primary: boolean;
  experience_years: string;
  team_capacity: string;
  min_project_budget: string;
  max_project_budget: string;
}

export interface MarketplaceRegionDraft {
  country: string;
  region: string;
  city: string;
  is_primary: boolean;
}

interface BuildDefaultsOptions {
  profile: MarketplaceContractorProfile;
  categories: MarketplaceWorkCategory[];
  organization?: Organization | null;
  organizationProfile?: OrganizationProfile | null;
}

interface MarketplaceDraftDefaults {
  displayName: string;
  shortDescription: string;
  description: string;
  baseCity: string;
  categoryDrafts: MarketplaceCategoryDraft[];
  regionDrafts: MarketplaceRegionDraft[];
}

const categorySlugsByCapability: Record<OrganizationCapability, string[]> = {
  general_contracting: ['construction'],
  subcontracting: ['construction'],
  design: ['design'],
  construction_supervision: ['construction_supervision'],
  equipment_rental: ['equipment_rental'],
  materials_supply: ['materials_supply'],
  consulting: ['services_supply'],
  facility_management: ['services_supply'],
};

const categorySlugsBySpecialization: Record<string, string[]> = {
  building_construction: ['construction'],
  road_construction: ['earthworks'],
  bridge_construction: ['construction'],
  electrical_works: ['electrical'],
  plumbing_works: ['plumbing'],
  hvac_systems: ['hvac'],
  roofing_works: ['roofing'],
  facade_works: ['facade'],
  foundation_works: ['monolith', 'earthworks'],
  interior_finishing: ['finishing'],
  landscape_works: ['construction'],
  demolition_works: ['earthworks'],
};

export const toStringValue = (value: string | number | null | undefined): string => (
  value === null || value === undefined ? '' : String(value)
);

export const optionalNumber = (value: string): number | null => {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const categoryDraftFromProfile = (
  category: MarketplaceProfileCategory
): MarketplaceCategoryDraft => ({
  category_id: category.category_id,
  is_primary: category.is_primary,
  experience_years: toStringValue(category.experience_years),
  team_capacity: toStringValue(category.team_capacity),
  min_project_budget: toStringValue(category.min_project_budget),
  max_project_budget: toStringValue(category.max_project_budget),
});

export const regionDraftFromProfile = (region: MarketplaceRegion): MarketplaceRegionDraft => ({
  country: region.country || 'Россия',
  region: region.region ?? '',
  city: region.city ?? '',
  is_primary: region.is_primary,
});

const nonEmpty = (...values: Array<string | null | undefined>): string => (
  values.find((value) => value !== null && value !== undefined && value.trim() !== '')?.trim() ?? ''
);

const shortDescriptionFrom = (description: string): string => {
  const sentence = description.split(/[.!?]\s/u)[0]?.trim() || description.trim();

  if (sentence.length <= 220) {
    return sentence;
  }

  return `${sentence.slice(0, 217).trim()}...`;
};

const flattenCategories = (categories: MarketplaceWorkCategory[]): MarketplaceWorkCategory[] => (
  categories.flatMap((category) => [category, ...flattenCategories(category.children ?? [])])
);

const uniqueValues = <T extends string>(values: T[]): T[] => Array.from(new Set(values));

const findCategoryDraftsFromOrganizationProfile = (
  categories: MarketplaceWorkCategory[],
  organizationProfile?: OrganizationProfile | null
): MarketplaceCategoryDraft[] => {
  if (!organizationProfile) {
    return [];
  }

  const categoriesBySlug = new Map(
    flattenCategories(categories).map((category) => [category.slug, category])
  );

  const capabilitySlugs = uniqueValues([
    ...(organizationProfile.primary_business_type
      ? categorySlugsByCapability[organizationProfile.primary_business_type]
      : []),
    ...organizationProfile.capabilities.flatMap((capability) => categorySlugsByCapability[capability] ?? []),
  ]);
  const specializationSlugs = uniqueValues(
    organizationProfile.specializations.flatMap(
      (specialization) => categorySlugsBySpecialization[specialization] ?? []
    )
  );
  const categoryIds = new Set<number>();

  return [...capabilitySlugs, ...specializationSlugs]
    .map((slug) => categoriesBySlug.get(slug))
    .filter((category): category is MarketplaceWorkCategory => Boolean(category))
    .filter((category) => {
      if (categoryIds.has(category.id)) {
        return false;
      }

      categoryIds.add(category.id);
      return true;
    })
    .map((category, index) => ({
      category_id: category.id,
      is_primary: index === 0,
      experience_years: '',
      team_capacity: '',
      min_project_budget: '',
      max_project_budget: '',
    }));
};

export const buildContractorMarketplaceDraftDefaults = ({
  profile,
  categories,
  organization,
  organizationProfile,
}: BuildDefaultsOptions): MarketplaceDraftDefaults => {
  const organizationName = nonEmpty(
    profile.organization?.name,
    organization?.name,
    organization?.legal_name,
    organizationProfile?.name
  );
  const organizationDescription = nonEmpty(organization?.description);
  const organizationCity = nonEmpty(profile.organization?.city, organization?.city);
  const organizationCountry = nonEmpty(organization?.country) || 'Россия';
  const profileCategories = profile.categories.map(categoryDraftFromProfile);
  const profileRegions = profile.regions.map(regionDraftFromProfile);

  return {
    displayName: nonEmpty(profile.display_name, organizationName),
    shortDescription: nonEmpty(
      profile.short_description,
      organizationDescription ? shortDescriptionFrom(organizationDescription) : null
    ),
    description: nonEmpty(profile.description, organizationDescription),
    baseCity: nonEmpty(profile.base_city, organizationCity),
    categoryDrafts: profileCategories.length > 0
      ? profileCategories
      : findCategoryDraftsFromOrganizationProfile(categories, organizationProfile),
    regionDrafts: profileRegions.length > 0
      ? profileRegions
      : organizationCity
        ? [{
            country: organizationCountry,
            region: '',
            city: organizationCity,
            is_primary: true,
          }]
        : [],
  };
};
