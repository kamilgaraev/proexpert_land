export type MarketplaceProfileStatus = 'draft' | 'active' | 'paused' | 'blocked';
export type MarketplaceAvailabilityStatus = 'available' | 'busy' | 'partially_available' | 'hidden';
export type MarketplaceVerificationLevel = 'none' | 'basic' | 'documents' | 'verified';
export type MarketplaceOfferStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'cancelled' | 'expired';
export type MarketplaceProjectRole = 'contractor' | 'subcontractor' | 'construction_supervision' | 'designer' | 'observer';
export type MoneyLike = number | string | null;

export interface MarketplaceWorkCategory {
  id: number;
  parent_id: number | null;
  slug: string;
  name: string;
  type: string;
  is_active: boolean;
  sort_order: number;
  children: MarketplaceWorkCategory[];
}

export interface MarketplaceOrganizationMini {
  id: number;
  name: string;
  city?: string | null;
  tax_number?: string | null;
  email?: string | null;
  phone?: string | null;
  is_verified?: boolean;
}

export interface MarketplaceProjectMini {
  id: number;
  name: string;
  address?: string | null;
  status?: string | null;
}

export interface MarketplaceProfileCategory {
  id?: number;
  category_id: number;
  is_primary: boolean;
  experience_years: number | null;
  team_capacity: number | null;
  min_project_budget: MoneyLike;
  max_project_budget: MoneyLike;
  rating_score?: MoneyLike;
  ratings_count?: number;
  completed_projects_count?: number;
  category?: MarketplaceWorkCategory | null;
}

export interface MarketplaceCategoryRating {
  id?: number;
  category_id: number;
  score: MoneyLike;
  quality_score?: MoneyLike;
  deadline_score?: MoneyLike;
  communication_score?: MoneyLike;
  safety_score?: MoneyLike;
  financial_discipline_score?: MoneyLike;
  reviews_count: number;
  completed_offers_count: number;
  repeat_hires_count: number;
  last_recalculated_at?: string | null;
  category?: MarketplaceWorkCategory | null;
}

export interface MarketplaceCategoryMatch {
  category_id: number;
  slug: string | null;
  name: string | null;
  is_primary: boolean;
  experience_years: number | null;
  team_capacity: number | null;
  min_project_budget: MoneyLike;
  max_project_budget: MoneyLike;
}

export interface MarketplaceRegion {
  id?: number;
  country: string;
  region: string | null;
  city: string | null;
  is_primary: boolean;
}

export interface MarketplacePortfolioItem {
  id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  city: string | null;
  completed_at: string | null;
  media: Array<Record<string, unknown>>;
}

export interface MarketplacePortfolioItemPayload {
  category_id?: number | null;
  title: string;
  description?: string | null;
  city?: string | null;
  completed_at?: string | null;
  media?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceDocument {
  id: number;
  type: string;
  title: string;
  status: string;
  verified_at: string | null;
}

export interface MarketplaceContractorProfile {
  id: number;
  organization_id: number;
  status: MarketplaceProfileStatus;
  display_name: string | null;
  short_description: string | null;
  description: string | null;
  team_size_min: number | null;
  team_size_max: number | null;
  years_on_market: number | null;
  base_city: string | null;
  service_radius_km: number | null;
  availability_status: MarketplaceAvailabilityStatus;
  available_from: string | null;
  verification_level: MarketplaceVerificationLevel;
  is_visible_in_marketplace: boolean;
  published_at: string | null;
  metadata: Record<string, unknown>;
  organization?: MarketplaceOrganizationMini;
  categories: MarketplaceProfileCategory[];
  ratings: MarketplaceCategoryRating[];
  regions: MarketplaceRegion[];
  portfolio_items: MarketplacePortfolioItem[];
  documents: MarketplaceDocument[];
  created_at: string | null;
  updated_at: string | null;
}

export interface MarketplaceContractorListItem {
  id: number;
  organization_id: number;
  display_name: string;
  short_description: string | null;
  base_city: string | null;
  availability_status: MarketplaceAvailabilityStatus;
  verification_level: MarketplaceVerificationLevel;
  team_size_min: number | null;
  team_size_max: number | null;
  published_at: string | null;
  organization?: MarketplaceOrganizationMini;
  category_match?: MarketplaceCategoryMatch | null;
  category_rating?: MarketplaceCategoryRating | null;
}

export interface MarketplaceProfileUpdatePayload {
  display_name?: string | null;
  short_description?: string | null;
  description?: string | null;
  team_size_min?: number | null;
  team_size_max?: number | null;
  years_on_market?: number | null;
  base_city?: string | null;
  service_radius_km?: number | null;
  availability_status?: MarketplaceAvailabilityStatus;
  available_from?: string | null;
  verification_level?: MarketplaceVerificationLevel;
  metadata?: Record<string, unknown>;
  categories?: MarketplaceProfileCategory[];
  regions?: MarketplaceRegion[];
  portfolio_items?: MarketplacePortfolioItemPayload[];
}

export interface MarketplaceHiringOfferWorkPackage {
  id?: number;
  category?: MarketplaceWorkCategory | null;
  title: string;
  description?: string | null;
  quantity?: MoneyLike;
  unit?: string | null;
  budget_min?: MoneyLike;
  budget_max?: MoneyLike;
  starts_at?: string | null;
  ends_at?: string | null;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceHiringOfferReview {
  id: number;
  category: MarketplaceWorkCategory | null;
  quality_score: MoneyLike;
  deadline_score: MoneyLike;
  communication_score: MoneyLike;
  safety_score: MoneyLike;
  financial_discipline_score: MoneyLike;
  comment: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MarketplaceHiringOffer {
  id: number;
  status: MarketplaceOfferStatus;
  role: MarketplaceProjectRole;
  title: string;
  message: string | null;
  project: MarketplaceProjectMini | null;
  hiring_organization: MarketplaceOrganizationMini | null;
  contractor_organization: MarketplaceOrganizationMini | null;
  contractor_profile: MarketplaceContractorProfile | null;
  work_packages: MarketplaceHiringOfferWorkPackage[];
  reviews: MarketplaceHiringOfferReview[];
  starts_at: string | null;
  ends_at: string | null;
  budget_min: MoneyLike;
  budget_max: MoneyLike;
  currency: string;
  expires_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  cancelled_at: string | null;
  decline_reason: string | null;
  status_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export interface MarketplaceOffersParams {
  project_id?: number;
  status?: MarketplaceOfferStatus;
  page?: number;
  per_page?: number;
}

export interface MarketplaceSearchParams {
  search?: string;
  category_id?: number;
  city?: string;
  availability_status?: Exclude<MarketplaceAvailabilityStatus, 'hidden'>;
  verification_level?: MarketplaceVerificationLevel;
  min_rating?: number;
  team_capacity_min?: number;
  budget_min?: number;
  budget_max?: number;
  sort_by?: 'relevance' | 'category_rating' | 'name';
  page?: number;
  per_page?: number;
}

export interface MarketplacePaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  [key: string]: unknown;
}

export interface MarketplacePaginatedResponse<T> {
  data: T[];
  meta: MarketplacePaginationMeta;
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
}

export interface MarketplaceSearchResponse extends MarketplacePaginatedResponse<MarketplaceContractorListItem> {
  summary?: {
    network_size?: number;
  };
}

export interface MarketplaceCreateOfferWorkPackage {
  category_id: number;
  title: string;
  description?: string;
  quantity?: number;
  unit?: string;
  budget_min?: number;
  budget_max?: number;
  starts_at?: string;
  ends_at?: string;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceCreateOfferPayload {
  project_id: number;
  contractor_profile_id: number;
  role: MarketplaceProjectRole;
  title: string;
  message?: string;
  starts_at?: string;
  ends_at?: string;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
  work_packages: MarketplaceCreateOfferWorkPackage[];
}

export interface MarketplaceCancelOfferPayload {
  reason?: string;
}

export interface MarketplaceOfferReviewItemPayload {
  category_id: number;
  quality_score: number;
  deadline_score: number;
  communication_score: number;
  safety_score?: number;
  financial_discipline_score?: number;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceReviewOfferPayload {
  reviews: MarketplaceOfferReviewItemPayload[];
}
