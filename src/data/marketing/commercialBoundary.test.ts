import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { marketingPackages } from './packages';

const read = (relativePath: string) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('граница новой коммерческой модели', () => {
  it('представляет каждый публичный пакет одной коммерческой позицией без тарифных уровней', () => {
    expect(marketingPackages).toHaveLength(10);

    for (const item of marketingPackages) {
      expect(item).toEqual(expect.objectContaining({
        price: expect.any(Number),
        moduleSlugs: expect.any(Array),
        highlights: expect.any(Array),
      }));
      expect(item).not.toHaveProperty('tiers');
      expect(item).not.toHaveProperty('plan');
    }
  });

  it('не возвращает старую семантику подписок и модулей в активные UI-контракты', () => {
    const activeSources = [
      'src/types/marketing.ts',
      'src/hooks/useUserManagement.ts',
      'src/components/dashboard/organization/CapabilitiesSelector.tsx',
      'src/components/dashboard/organization/RecommendedPackagesCard.tsx',
      'src/components/dashboard/onboarding/OnboardingWizard.tsx',
      'src/components/dashboard/organization/OrganizationProfileModal.tsx',
      'src/pages/dashboard/organization/OrganizationSettingsPage.tsx',
    ].map(read).join('\n');

    expect(activeSources).not.toMatch(/MarketingPackageTier|export interface SubscriptionLimits|RecommendedModulesCard|const \[limits/);
    expect(activeSources).not.toContain('Рекомендуемые модули');
  });
});
