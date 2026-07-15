import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { billingService } from '@/utils/api';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('commercial runtime boundary', () => {
  it('не содержит старых запросов управления модулями и подпиской', () => {
    const runtime = [
      source('src/layouts/DashboardLayout.tsx'),
      source('src/components/dashboard/organization/WorkspaceQuickActionsCard.tsx'),
      source('src/utils/organizationProfile.ts'),
      source('src/utils/api.ts'),
    ].join('\n');

    expect(runtime).not.toContain('useModules');
    expect(runtime).not.toContain('newModulesService');
    expect(runtime).not.toMatch(/\/modules(?:\/|`|'|")/);
    expect(runtime).not.toContain('/addons');
    expect(runtime).not.toContain('/org-addon');
    expect(runtime).not.toContain('/org-one-time-purchase');
    expect(runtime).not.toContain('/subscription/auto-payment');
    expect(runtime).not.toContain('/dashboard/modules');
    expect(runtime).not.toContain('open_modules');
    expect(runtime).not.toContain('Проверить модули');
  });

  it('оставляет в старом billingService только бонусный баланс', () => {
    expect(Object.keys(billingService).sort()).toEqual([
      'getBalance',
      'getBalanceTransactions',
    ]);
  });

  it('не запрашивает удалённые лимиты старой подписки', () => {
    const runtime = [
      source('src/utils/api.ts'),
      source('src/hooks/useUserManagement.ts'),
      source('src/pages/dashboard/AdminsPage.tsx'),
    ].join('\n');

    expect(runtime).not.toContain('/user-management/user-limits');
    expect(runtime).not.toContain('getUserLimits');
    expect(runtime).not.toContain('has_subscription');
  });
});
