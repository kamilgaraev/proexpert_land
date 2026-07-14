import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from './DashboardPage';

const apiMocks = vi.hoisted(() => ({
  getLandingDashboard: vi.fn(),
}));

vi.mock('@utils/api', () => ({
  landingService: {
    getLandingDashboard: apiMocks.getLandingDashboard,
  },
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissionsReady: () => true,
  useCanAccess: () => true,
}));

vi.mock('@components/dashboard/LineChart', () => ({
  default: () => <div data-testid="line-chart" />,
}));

vi.mock('@components/dashboard/DonutStatusChart', () => ({
  default: ({ data }: { data: Record<string, number> }) => (
    <div data-testid="donut-chart">{Object.keys(data).join(', ')}</div>
  ),
}));

const dashboardPayload = {
  financial: {
    balance: 125000,
    credits_this_month: 50000,
    debits_this_month: 25000,
  },
  projects: {
    total: 3,
    active: 2,
    completed: 1,
  },
  contracts: {
    total: 7,
    active: 5,
    draft: 1,
    completed: 1,
    total_amount: 3000000,
  },
  works_materials: {
    works: {},
    materials: {},
  },
  acts: {
    total: 4,
    approved: 3,
    total_amount: 750000,
  },
  team: {
    total: 12,
    by_roles: {},
  },
  team_details: [],
  charts: {
    projects_monthly: { labels: ['Июнь'], values: [3] },
    contracts_monthly: { labels: ['Июнь'], values: [7] },
    completed_works_monthly: { labels: ['Июнь'], values: [4] },
    balance_monthly: { labels: ['Июнь'], values: [125000] },
    projects_status: { active: 2, completed: 1 },
    contracts_status: { active: 5, completed: 1 },
    status_labels: {
      projects: { active: 'Активные', completed: 'Завершенные' },
      contracts: { active: 'Активные', completed: 'Завершенные' },
    },
  },
};

describe('DashboardPage', () => {
  beforeEach(() => {
    apiMocks.getLandingDashboard.mockReset();
  });

  it('shows landing dashboard data when optional billing dashboard fails', async () => {
    apiMocks.getLandingDashboard.mockResolvedValue({ data: dashboardPayload, status: 200 });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await screen.findByText('125 000,00 ₽');

    await waitFor(() => {
      expect(document.querySelector('a[href="/dashboard/admins"]')).not.toBeNull();
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByTestId('donut-chart')).toHaveTextContent('Активные');
    expect(screen.getByTestId('donut-chart')).not.toHaveTextContent('active');
    expect(screen.queryByRole('link', { name: /Загрузить документы/ })).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/dashboard/billing"]')).toBeNull();
  });

  it('shows an error state when landing dashboard data is unavailable', async () => {
    apiMocks.getLandingDashboard.mockResolvedValue({ data: null, status: 500 });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Не удалось загрузить данные дашборда. Попробуйте обновить страницу.')).toBeInTheDocument();
  });
});
