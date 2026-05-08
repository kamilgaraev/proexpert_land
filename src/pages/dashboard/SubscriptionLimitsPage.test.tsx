import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SubscriptionLimitsPage from './SubscriptionLimitsPage';

const useSubscriptionLimitsMock = vi.fn();

vi.mock('@hooks/useSubscriptionLimits', () => ({
  useSubscriptionLimits: () => useSubscriptionLimitsMock(),
}));

const renderPage = () => render(
  <MemoryRouter>
    <SubscriptionLimitsPage />
  </MemoryRouter>,
);

describe('SubscriptionLimitsPage', () => {
  beforeEach(() => {
    useSubscriptionLimitsMock.mockReturnValue({
      data: {
        has_subscription: true,
        subscription: {
          id: 12,
          status: 'active',
          plan_name: 'Enterprise Конструктор',
          plan_description: 'Индивидуальный тариф',
          is_trial: false,
          trial_ends_at: null,
          ends_at: null,
          next_billing_at: '2026-06-01T00:00:00.000000Z',
          is_canceled: false,
        },
        limits: {
          users: { limit: 25, used: 10, remaining: 15, percentage_used: 40, is_unlimited: false, status: 'normal' },
          projects: { limit: 8, used: 5, remaining: 3, percentage_used: 62, is_unlimited: false, status: 'approaching' },
          foremen: { limit: 12, used: 12, remaining: 0, percentage_used: 100, is_unlimited: false, status: 'exceeded' },
          storage: { limit_gb: 128, used_gb: 64, remaining_gb: 64, percentage_used: 50, is_unlimited: false, status: 'normal' },
          invitations: { limit: 20, used: 2, remaining: 18, percentage_used: 10, is_unlimited: false, status: 'normal' },
          ai_requests: { limit: null, used: 310, remaining: 0, percentage_used: 0, is_unlimited: false, status: 'normal' },
        },
        features: ['ai-contour'],
        warnings: [{ type: 'foremen', level: 'critical', message: 'Лимит прорабов исчерпан' }],
        upgrade_required: true,
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
      hasSubscription: true,
      needsUpgrade: true,
      hasWarnings: true,
      criticalWarnings: [],
      normalWarnings: [],
      lastUpdated: new Date('2026-05-08T09:10:00.000Z'),
    });
  });

  it('renders all available subscription limit groups in Russian', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Лимиты тарифа' })).toBeInTheDocument();
    expect(screen.getByText('Enterprise Конструктор')).toBeInTheDocument();
    expect(screen.getByText('Пользователи')).toBeInTheDocument();
    expect(screen.getByText('Проекты')).toBeInTheDocument();
    expect(screen.getByText('Прорабы')).toBeInTheDocument();
    expect(screen.getByText('Хранилище')).toBeInTheDocument();
    expect(screen.getByText('Приглашения')).toBeInTheDocument();
    expect(screen.getByText('AI-запросы')).toBeInTheDocument();
    expect(screen.getByText(/Индивидуально/)).toBeInTheDocument();
    expect(screen.getByText('Превышен')).toBeInTheDocument();
    expect(screen.getByText('Лимит прорабов исчерпан')).toBeInTheDocument();
  });

  it('does not expose raw technical identifiers', () => {
    renderPage();

    expect(screen.queryByText(/ai-contour|ai_requests|foremen|payload|slug|null/i)).not.toBeInTheDocument();
  });
});
