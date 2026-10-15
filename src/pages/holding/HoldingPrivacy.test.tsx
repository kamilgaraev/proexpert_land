import type { ComponentProps, ReactNode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HoldingDashboardData, HoldingPublicData } from '@utils/api';
import HoldingDashboardPage from './HoldingDashboardPage';
import HoldingLandingPage from './HoldingLandingPage';
import HoldingLoginPage from './HoldingLoginPage';

const api = vi.hoisted(() => ({
  getHoldingPublicInfo: vi.fn(),
  getHoldingDashboardInfo: vi.fn(),
  getHoldingOrganizations: vi.fn(),
  getHierarchy: vi.fn(),
  getToken: vi.fn(),
  login: vi.fn(),
}));

vi.mock('@utils/api', () => ({
  multiOrganizationService: api,
  getTokenFromStorages: api.getToken,
}));
vi.mock('@components/shared/SEOHead', () => ({ SEOHead: () => null }));
vi.mock('@hooks/useAuth', () => ({ useAuth: () => ({ login: api.login }) }));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: ComponentProps<'div'>) => <div className={className}>{children}</div>,
    button: ({ children, className, disabled, type, onClick }: ComponentProps<'button'>) => <button className={className} disabled={disabled} type={type} onClick={onClick}>{children}</button>,
  },
}));
vi.mock('@components/holding/HoldingSummaryPanel', () => ({ default: () => null }));
vi.mock('@components/holding/shared', () => ({
  StatCard: ({ title, value }: { title: string; value: ReactNode }) => <div>{title}: {value}</div>,
  LoadingSpinner: () => <div>Загрузка</div>,
  PageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => <header>{title} {subtitle}</header>,
}));
vi.mock('@components/shared/ThemeProvider', () => ({
  useTheme: () => ({ color: 'blue', getThemeClasses: () => ({ background: 'bg-white', primary: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', accent: 'from-blue-50' }) }),
}));

const stats = {
  total_child_organizations: 77, total_users: 42, total_projects: 9,
  total_contracts: 12, total_contracts_value: 12500, active_contracts_count: 6,
};
const published: HoldingPublicData = {
  holding: { id: 7, name: 'Опубликованный холдинг', slug: 'company', description: 'Опубликованное описание' },
  parent_organization: { id: 10, name: 'Публичная компания', phone: '+70000000000' },
  stats: null,
};
const dashboard: HoldingDashboardData = {
  holding: { id: 7, name: 'Закрытый холдинг', slug: 'company', description: '', parent_organization_id: 10, status: 'active' },
  hierarchy: {
    parent: { id: 10, name: 'Головная организация', slug: 'company', organization_type: 'parent', is_holding: true, hierarchy_level: 0, created_at: '2026-10-15' },
    children: [], total_stats: { total_organizations: 77, total_users: 42, total_projects: 9, total_contracts: 12 },
  },
  user: { id: 5, name: 'Участник', email: 'member@example.test' },
  consolidated_stats: { ...stats, recent_activity: [], performance_metrics: { monthly_growth: 0, efficiency_score: 0, satisfaction_index: 0 } },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('location', new URL('https://company.1мост.рф'));
  api.getToken.mockReturnValue('test-session');
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Holding data privacy', () => {
  it('loads an unpublished private dashboard with the session and protected response', async () => {
    api.getHoldingDashboardInfo.mockResolvedValue(dashboard);
    api.getHoldingPublicInfo.mockRejectedValue(new Error('Сайт не опубликован'));
    render(<MemoryRouter><HoldingDashboardPage /></MemoryRouter>);

    await screen.findByText(/Добро пожаловать в панель управления Закрытый холдинг/);
    expect(api.getHoldingDashboardInfo).toHaveBeenCalledWith('company', 'test-session');
    expect(api.getHoldingPublicInfo).not.toHaveBeenCalled();
    expect(api.getHoldingOrganizations).not.toHaveBeenCalled();
    expect(screen.getByText('Организаций: 77')).toBeInTheDocument();
  });

  it.each([null, undefined])('shows published contacts without inventing statistics (%s)', async (value) => {
    api.getHoldingPublicInfo.mockResolvedValue({ ...published, stats: value });
    render(<MemoryRouter><HoldingLandingPage /></MemoryRouter>);

    await screen.findByText('Публичная компания');
    expect(api.getHoldingPublicInfo).toHaveBeenCalledWith('company');
    expect(screen.getByText('+70000000000')).toBeInTheDocument();
    expect(screen.queryByText('Ключевые показатели')).not.toBeInTheDocument();
    expect(screen.queryByText('Организаций')).not.toBeInTheDocument();
    expect(screen.queryByText('Ошибка загрузки данных')).not.toBeInTheDocument();
  });

  it('keeps previously supplied public statistics visible during the backend rollout', async () => {
    api.getHoldingPublicInfo.mockResolvedValue({ ...published, stats });
    render(<MemoryRouter><HoldingLandingPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Ключевые показатели')).toBeInTheDocument());
    expect(screen.getAllByText('77')).toHaveLength(2);
    expect(screen.getByText('Объем договоров')).toBeInTheDocument();
  });

  it('keeps the login form available when the holding site is unpublished', async () => {
    const error = new Error('Сайт не опубликован');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.getHoldingPublicInfo.mockRejectedValue(error);
    render(<MemoryRouter><HoldingLoginPage /></MemoryRouter>);

    await waitFor(() => expect(log).toHaveBeenCalledWith('Ошибка получения информации о холдинге:', error));
    expect(api.getHoldingPublicInfo).toHaveBeenCalledWith('company');
    expect(screen.getByRole('button', { name: 'Войти в панель управления' })).toBeEnabled();
  });
});
