import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EnterpriseConstructorModal from './EnterpriseConstructorModal';
import { billingService } from '@/utils/api';

vi.mock('@/components/shared/NotificationService', () => ({
  default: {
    show: vi.fn(),
  },
}));

vi.mock('@/utils/api', () => ({
  billingService: {
    previewEnterpriseConstructor: vi.fn(),
    checkoutEnterpriseConstructor: vi.fn(),
  },
}));

const preview = {
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
};

describe('EnterpriseConstructorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(billingService.previewEnterpriseConstructor).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        message: preview.message,
        data: preview,
      },
    } as any);
    vi.mocked(billingService.checkoutEnterpriseConstructor).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        message: 'Enterprise Конструктор подключен.',
        data: {
          preview,
          balance: { amount: 1000000, currency: 'RUB' },
          module_sync: {},
        },
      },
    } as any);
  });

  it('opens constructor and charges balance from the modal lifecycle', async () => {
    const onActivated = vi.fn();

    render(
      <EnterpriseConstructorModal
        isOpen
        onClose={vi.fn()}
        onActivated={onActivated}
      />,
    );

    expect(await screen.findByText('99 000 ₽ в месяц')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Оплатить с баланса' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Оплатить с баланса' }));

    await waitFor(() => {
      expect(billingService.checkoutEnterpriseConstructor).toHaveBeenCalledWith(expect.objectContaining({
        users: 100,
        additional_organizations: 0,
      }));
      expect(onActivated).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Enterprise Конструктор подключен')).toBeInTheDocument();
  });

  it('does not offer balance payment when project implementation is required', async () => {
    vi.mocked(billingService.previewEnterpriseConstructor).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        message: 'Для выбранной конфигурации подготовим отдельный проект внедрения.',
        data: {
          ...preview,
          can_checkout: false,
          requires_implementation_project: true,
        },
      },
    } as any);

    render(
      <EnterpriseConstructorModal
        isOpen
        onClose={vi.fn()}
        onActivated={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Нужен проект внедрения' })).toBeDisabled();
    });
  });
});
