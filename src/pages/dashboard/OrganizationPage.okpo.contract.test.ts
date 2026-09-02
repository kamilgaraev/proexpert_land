import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('реквизит ОКПО организации', () => {
  it('проходит через типизированный API-контракт', () => {
    const apiSource = readSource('src/utils/api.ts');

    expect(apiSource).toMatch(/interface Organization[\s\S]*?okpo\?: string;/);
    expect(apiSource).toMatch(/interface OrganizationUpdateData[\s\S]*?okpo\?: string;/);
  });

  it('загружается, редактируется с понятной подсказкой и отображается владельцу', () => {
    const pageSource = readSource('src/pages/dashboard/OrganizationPage.tsx');

    expect(pageSource).toContain("okpo: response.data.organization.okpo || ''");
    expect(pageSource).toContain('<Label htmlFor="organization-okpo">ОКПО</Label>');
    expect(pageSource).toContain('id="organization-okpo"');
    expect(pageSource).toContain('aria-describedby="organization-okpo-help"');
    expect(pageSource).toContain('8 цифр для организации, 10 — для ИП. Используется в складских документах.');
    expect(pageSource).toContain("{organization.okpo || '—'}");
  });
});
