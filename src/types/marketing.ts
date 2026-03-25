export type MarketingSurface = 'admin' | 'mobile' | 'lk' | 'holding';

export type MarketingMaturity =
  | 'stable'
  | 'beta'
  | 'alpha'
  | 'coming_soon'
  | 'early_access';

export interface MarketingSeoMeta {
  title: string;
  description: string;
  keywords?: string;
  noIndex?: boolean;
}

export interface MarketingRouteLink {
  label: string;
  href: string;
  exact?: boolean;
}

export interface MarketingMaturityMeta {
  label: string;
  tone: string;
  description: string;
}

export interface MarketingSurfaceMeta {
  label: string;
  tone: string;
}

export interface MarketingHeroFact {
  value: string;
  label: string;
  detail: string;
}

export interface MarketingCapability {
  id: string;
  title: string;
  businessContour: string;
  summary: string;
  publicClaim: string;
  audiences: string[];
  outcomes: string[];
  surfaces: MarketingSurface[];
  maturity: MarketingMaturity;
  moduleSlugs: string[];
  packageSlugs: string[];
  sourceOfTruth: string[];
  cta: string;
}

export interface MarketingPackageTier {
  key: 'base' | 'pro' | 'enterprise';
  label: string;
  description: string;
  price: number;
  priceLabel?: string;
  billingModel: 'free' | 'subscription';
  durationDays?: number;
  moduleSlugs: string[];
  highlights: string[];
}

export interface MarketingPackageFamily {
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  bestFor: string;
  tiers: MarketingPackageTier[];
}

export interface MarketingAdvancedOffer {
  id: string;
  title: string;
  summary: string;
  maturity: MarketingMaturity;
  surfaces: MarketingSurface[];
  moduleSlugs: string[];
  sourceOfTruth: string[];
  cta: string;
}

export interface MarketingSolutionSegment {
  id: string;
  title: string;
  audience: string;
  challenge: string;
  transformation: string;
  workflows: string[];
  surfaces: MarketingSurface[];
  capabilityIds: string[];
  recommendedPackageSlugs: string[];
  cta: string;
}

export interface MarketingLaunchStep {
  title: string;
  description: string;
}

export interface MarketingTrustFact {
  title: string;
  text: string;
}

export interface MarketingFaqItem {
  question: string;
  answer: string;
}

export interface MarketingSecuritySection {
  title: string;
  description: string;
  bullets: string[];
}

export interface MarketingAboutSection {
  title: string;
  description: string;
  bullets: string[];
}

export interface MarketingContactCard {
  title: string;
  value: string;
  href?: string;
  description: string;
}

export interface LegalDocumentSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocumentMeta {
  title: string;
  shortTitle: string;
  path: string;
  version: string;
  updatedAt: string;
  seo: MarketingSeoMeta;
  intro: string;
  highlights: string[];
  sections: LegalDocumentSection[];
}
