import { describe, expect, it } from 'vitest';
import { marketingCompany, marketingSeo, marketingSeoLandingPages } from './index';

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
});
