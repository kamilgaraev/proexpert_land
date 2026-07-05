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

  it('recalculates preview when constructor inputs change', async () => {
    vi.mocked(billingService.previewEnterpriseConstructor).mockImplementation(async (payload: any) => {
      const total = 99000
        + (payload.users > 100 ? 50000 : 0)
        + ((payload.additional_organizations || 0) * 15000)
        + ((payload.extra_storage_units || 0) * 7000)
        + (payload.extended_ai ? 10000 : 0)
        + (payload.priority_support ? 25000 : 0);

      return {
        status: 200,
        statusText: 'OK',
        data: {
          success: true,
          data: {
            ...preview,
            price: {
              ...preview.price,
              total,
              label: `${total.toLocaleString('ru-RU')} ₽ в месяц`,
            },
            price_label: `${total.toLocaleString('ru-RU')} ₽ в месяц`,
            limits: {
              ...preview.limits,
              users: payload.users,
              organizations: 1 + (payload.additional_organizations || 0),
              storage_gb: 50 + ((payload.extra_storage_units || 0) * 100),
              ai_requests: 2000 + (payload.extended_ai ? 2000 : 0),
            },
            selected_extensions: [
              ...(payload.users > 100 ? [{ key: 'users_to_250', name: 'До 250 пользователей', label: 'До 250 пользователей', quantity: 1, price: 50000 }] : []),
              ...(payload.additional_organizations ? [{ key: 'additional_organization', name: 'Дополнительная организация', label: 'Дополнительная организация', quantity: payload.additional_organizations, price: payload.additional_organizations * 15000 }] : []),
              ...(payload.extra_storage_units ? [{ key: 'extra_storage_100gb', name: 'Дополнительные 100 ГБ', label: 'Дополнительные 100 ГБ', quantity: payload.extra_storage_units, price: payload.extra_storage_units * 7000 }] : []),
              ...(payload.extended_ai ? [{ key: 'extended_ai', name: 'Расширенный AI', label: 'Расширенный AI', quantity: 1, price: 10000 }] : []),
              ...(payload.priority_support ? [{ key: 'priority_support', name: 'Приоритетная поддержка', label: 'Приоритетная поддержка', quantity: 1, price: 25000 }] : []),
            ],
          },
        },
      } as any;
    });

    render(
      <EnterpriseConstructorModal
        isOpen
        onClose={vi.fn()}
        onActivated={vi.fn()}
      />,
    );

    expect(await screen.findByText('99 000 ₽ в месяц')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Точное количество пользователей'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText('Дополнительные организации'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Дополнительное хранилище по 100 ГБ'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('switch', { name: 'Расширенный AI' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Приоритетная поддержка' }));

    expect(screen.getByText('Пересчитываем...')).toBeInTheDocument();
    expect(await screen.findByText('250 000 ₽ в месяц')).toBeInTheDocument();
    expect(billingService.previewEnterpriseConstructor).toHaveBeenLastCalledWith(expect.objectContaining({
      users: 250,
      additional_organizations: 3,
      extra_storage_units: 3,
      extended_ai: true,
      priority_support: true,
    }));
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
