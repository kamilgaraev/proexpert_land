import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlansGrid from './PlansGrid';
import { billingService } from '@/utils/api';

vi.mock('@/hooks/useBalance', () => ({
  dispatchBalanceUpdate: vi.fn(),
}));

vi.mock('@/components/shared/NotificationService', () => ({
  default: {
    show: vi.fn(),
  },
}));

vi.mock('@/utils/api', () => ({
  billingService: {
    getCurrentSubscription: vi.fn(),
    getPlans: vi.fn(),
    previewEnterpriseConstructor: vi.fn(),
    checkoutEnterpriseConstructor: vi.fn(),
    subscribeToPlan: vi.fn(),
    changePlanPreview: vi.fn(),
    changePlan: vi.fn(),
    updateAutoPayment: vi.fn(),
    cancelSubscription: vi.fn(),
  },
}));

describe('PlansGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(billingService.getCurrentSubscription).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: { success: true, data: { has_subscription: false, subscription: null } },
    } as any);
    vi.mocked(billingService.getPlans).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: [
        {
          id: 5,
          name: 'Enterprise Конструктор',
          slug: 'enterprise',
          description: 'Конструктор для крупных компаний и холдингов',
          price: 99000,
          currency: 'RUB',
          max_foremen: 100,
          max_projects: 100,
          max_storage_gb: 50,
          included_packages: [],
        },
      ],
    } as any);
    vi.mocked(billingService.previewEnterpriseConstructor).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        data: {
          plan_name: 'Enterprise Конструктор',
          price: {
            total: 99000,
            label: '99 000 ₽ в месяц',
            currency: 'RUB',
            period: 'month',
            period_label: 'в месяц',
          },
          price_label: '99 000 ₽ в месяц',
          limits: {
            users: 100,
            foremen: 100,
            projects: 100,
            organizations: 1,
            storage_gb: 50,
            ai_requests: 2000,
            contractor_invitations: 500,
          },
          selected_extensions: [],
          can_checkout: true,
          requires_implementation_project: false,
          primary_cta: 'Рассчитать стоимость',
          message: 'Стандартную конфигурацию можно оплатить с баланса организации.',
        },
      },
    } as any);
  });

  it('opens Enterprise constructor instead of buying Enterprise as a regular plan', async () => {
    render(<PlansGrid />);

    const button = await screen.findByRole('button', { name: /Открыть конструктор/ });
    fireEvent.click(button);

    expect(screen.getByRole('heading', { name: 'Enterprise Конструктор' })).toBeInTheDocument();

    await waitFor(() => {
      expect(billingService.previewEnterpriseConstructor).toHaveBeenCalled();
      expect(billingService.subscribeToPlan).not.toHaveBeenCalled();
      expect(billingService.changePlanPreview).not.toHaveBeenCalled();
    });
  });
});
