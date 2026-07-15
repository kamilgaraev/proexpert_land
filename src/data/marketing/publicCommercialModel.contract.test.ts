import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicSellingFiles = [
  'src/pages/landing/PricingPage.tsx',
  'src/pages/landing/HomePage.tsx',
  'src/components/marketing/blocks/MarketingPricingSnapshot.tsx',
  'src/components/landing/Navbar.tsx',
  'src/components/landing/Footer.tsx',
  'src/data/marketing/packages.ts',
  'src/data/marketing/home.ts',
  'src/data/marketing/common.ts',
  'src/pages/dashboard/RegisterPage.tsx',
];

describe('единая публичная коммерческая модель', () => {
  it('не возвращает старые тарифы и ссылки их активации', () => {
    const source = publicSellingFiles
      .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/\b(?:Free|Start|Business|Profi|Enterprise Constructor|Enterprise Конструктор)\b/);
    expect(source).not.toMatch(/14[-‑ ]?(?:дней|днев)/i);
    expect(source).not.toContain('?plan=');
    expect(source).not.toContain("formData.append('plan_slug'");
    expect(source).not.toMatch(/оплат\w*\s+(?:с|из)\s+баланс/i);
  });
});
