import { describe, expect, it } from 'vitest';
import {
  marketingCapabilityMatrix,
  marketingCommercialLandingLinks,
  marketingCompany,
  marketingModuleLandingLinks,
  marketingPackages,
  marketingRoleLandingLinks,
  marketingSeo,
  marketingSeoLandingPages,
  marketingSitemapRoutes,
  marketingSolutionSegments,
} from './index';

describe('marketing content consistency', () => {
  it('keeps construction CRM page focused on CRM semantics', () => {
    expect(marketingSeo['construction-crm'].title.toLowerCase()).toContain('crm');
    expect(marketingSeoLandingPages['construction-crm'].title.toLowerCase()).toContain('crm');
    expect(marketingSeoLandingPages['construction-crm'].title.toLowerCase()).not.toContain('erp');
  });

  it('keeps construction ERP page focused on ERP semantics', () => {
    expect(marketingSeo['construction-erp'].title.toLowerCase()).toContain('erp');
    expect(marketingSeoLandingPages['construction-erp'].title.toLowerCase()).toContain('erp');
  });

  it('has a clear public contact channel', () => {
    expect(marketingCompany.email).toMatch(/@prohelper\.pro$/);
    expect(marketingCompany.responseTime.length).toBeGreaterThan(0);
  });

  it('publishes new module capabilities without retired internal module slugs', () => {
    const capabilityIds = marketingCapabilityMatrix.map((item) => item.id);
    expect(capabilityIds).toEqual(
      expect.arrayContaining([
        'pir-project-documentation',
        'quality-handover',
        'construction-safety',
        'machinery-labor',
        'workforce-control',
        'change-control',
      ]),
    );

    const invalidModuleSlugs = [
      'acts',
      'advance-requests',
      'estimates',
      'engineering-documents',
      'analytics',
      'reporting',
      'holding-dashboard',
    ];
    const publishedModuleSlugs = [
      ...marketingCapabilityMatrix.flatMap((item) => item.moduleSlugs),
      ...marketingPackages.flatMap((item) => item.tiers.flatMap((tier) => tier.moduleSlugs)),
    ];

    for (const invalidSlug of invalidModuleSlugs) {
      expect(publishedModuleSlugs).not.toContain(invalidSlug);
    }
  });

  it('keeps new SEO module pages connected to meta, sitemap, and landing content', () => {
    const expectedPageKeys = [
      'pir-project-documentation',
      'construction-safety',
      'construction-quality-control',
      'handover-acceptance',
      'machinery-and-labor',
      'change-control',
    ];
    const sitemapPageKeys = new Set(marketingSitemapRoutes.map((route) => route.pageKey));

    for (const pageKey of expectedPageKeys) {
      const page = marketingSeoLandingPages[pageKey];

      expect(marketingSeo[pageKey]).toBeDefined();
      expect(marketingSeo[pageKey].noIndex).not.toBe(true);
      expect(sitemapPageKeys.has(pageKey)).toBe(true);
      expect(page.path).toBe(marketingSitemapRoutes.find((route) => route.pageKey === pageKey)?.path);
      expect(page.title.length).toBeGreaterThan(20);
      expect(page.supportingQueries.length).toBeGreaterThanOrEqual(4);
      expect(page.relatedLinks.length).toBeGreaterThanOrEqual(3);
      expect(page.faq.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps solution segment references resolvable', () => {
    const capabilityIds = new Set(marketingCapabilityMatrix.map((item) => item.id));
    const packageSlugs = new Set(marketingPackages.map((item) => item.slug));

    for (const segment of marketingSolutionSegments) {
      expect(segment.capabilityIds.length).toBeGreaterThan(0);
      expect(segment.recommendedPackageSlugs.length).toBeGreaterThan(0);

      for (const capabilityId of segment.capabilityIds) {
        expect(capabilityIds.has(capabilityId)).toBe(true);
      }

      for (const packageSlug of segment.recommendedPackageSlugs) {
        expect(packageSlugs.has(packageSlug)).toBe(true);
      }
    }
  });

  it('keeps landing link collections pointed at published SEO pages', () => {
    const landingPagePaths = new Set(Object.values(marketingSeoLandingPages).map((page) => page.path));
    const linkCollections = [
      marketingCommercialLandingLinks,
      marketingRoleLandingLinks,
      marketingModuleLandingLinks,
    ];

    for (const collection of linkCollections) {
      for (const link of collection) {
        expect(landingPagePaths.has(link.href)).toBe(true);
      }
    }
  });
});
