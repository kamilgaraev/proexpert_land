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

export interface MarketingContentLink {
  label: string;
  href: string;
  description: string;
}

export interface MarketingRoleView {
  role: string;
  description: string;
}

export interface MarketingProofMetric {
  label: string;
  value: string;
  detail: string;
}

export interface MarketingProofBlock {
  title: string;
  description: string;
  signals: string[];
  beforeLabel: string;
  beforeState: string[];
  afterLabel: string;
  afterState: string[];
  metrics: MarketingProofMetric[];
}

export interface MarketingTrustProfile {
  title: string;
  description: string;
  fitForTitle: string;
  fitFor: string[];
  cautionTitle: string;
  caution: string[];
  firstStepTitle: string;
  firstStep: string[];
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
  standalonePrice: number;
  priceLabel?: string;
  billingModel: 'free' | 'subscription';
  durationDays?: number;
  moduleSlugs: string[];
  highlights: string[];
  businessOutcome: string;
  maturityNote?: string;
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

export interface MarketingSalesOffer {
  title: string;
  planSlug: 'start' | 'business' | 'profi' | 'enterprise';
  planName: string;
  priceLabel: string;
  audience: string;
  packageSlugs: string[];
  outcome: string;
  comparison: string;
  isConsultative?: boolean;
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

export interface MarketingSeoLandingPage {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  supportingQueries: string[];
  proof: MarketingProofBlock;
  trust?: MarketingTrustProfile;
  audienceTitle: string;
  audienceDescription: string;
  audiences: string[];
  problemTitle: string;
  problemDescription: string;
  problems: string[];
  automationTitle: string;
  automationDescription: string;
  automations: string[];
  visibilityTitle: string;
  visibilityDescription: string;
  roleViews: MarketingRoleView[];
  relatedLinks: MarketingContentLink[];
  blogLinks: MarketingContentLink[];
  contactHighlights: string[];
  faq: MarketingFaqItem[];
}

export interface MarketingEditorialArticle {
  title: string;
  cluster: string;
  intent: 'commercial' | 'informational' | 'navigational';
  relatedPath: string;
  summary: string;
}

export interface MarketingEditorialSeries {
  id: string;
  title: string;
  description: string;
  articles: MarketingEditorialArticle[];
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
