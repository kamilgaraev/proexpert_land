import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModulesPage from './ModulesPage';

const overview = {
  summary: {
    active_solutions_count: 1,
    total_solutions_count: 1,
    active_standalone_count: 1,
    monthly_total: 4890,
    expiring_count: 1,
  },
  solutions: [
    {
      slug: 'projects',
      name: 'Управление проектами',
      description: 'Контур планирования и контроля проектов',
      icon: 'clipboard-document-list',
      color: '#2563EB',
      current_tier: 'pro',
      active_tier: 'pro',
      effective_monthly_price: 4890,
      included_modules_count: 4,
      active_included_modules_count: 4,
      can_upgrade: false,
      can_downgrade: true,
      expires_at: null,
      tiers: [
        {
          key: 'base',
          label: 'Базовый',
          description: 'Базовый набор',
          price: 0,
          modules: ['project-management'],
          highlights: ['Создание и управление проектами'],
          is_current: false,
          included_modules_count: 1,
          active_modules_count: 1,
        },
        {
          key: 'pro',
          label: 'Профессиональный',
          description: 'Полный набор',
          price: 4890,
          modules: ['project-management', 'schedule-management', 'time-tracking', 'site-requests'],
          highlights: ['График работ', 'Учёт времени', 'Заявки с объекта'],
          is_current: true,
          included_modules_count: 4,
          active_modules_count: 4,
        },
      ],
    },
  ],
  standalone_modules: [
    {
      slug: 'brigades',
      name: 'Бригады',
      description: 'Контур подбора и управления строительными бригадами',
      billing_model: 'free',
      price: 0,
      currency: 'RUB',
      status: 'active',
      activation: { status: 'active', expires_at: null, is_auto_renew_enabled: false, is_bundled_with_plan: false },
      development_status: { label: 'Стабильно', can_be_activated: true, should_show_warning: false },
      can_activate: false,
      can_deactivate: true,
      icon: 'groups',
      features: ['Каталог проверенных бригад'],
    },
  ],
  advanced_modules: [
    {
      slug: 'users',
      name: 'Пользователи',
      description: 'Системный модуль',
      classification: 'system',
      package_slugs: [],
      is_system: true,
      is_bundled_with_plan: false,
      billing_model: 'free',
      price: 0,
      currency: 'RUB',
      status: 'active',
      activation: { status: 'active', expires_at: null, is_auto_renew_enabled: false, is_bundled_with_plan: false },
      development_status: { label: 'Стабильно', can_be_activated: true, should_show_warning: false },
      can_activate: false,
      can_deactivate: false,
      icon: 'users',
      category: 'core',
    },
  ],
  warnings: [
    {
      type: 'expiring',
      message: '1 возможность скоро истекает',
      count: 1,
    },
  ],
};

vi.mock('@hooks/useModulesOverview', () => ({
  useModulesOverview: () => ({
    overview,
    loading: false,
    error: null,
    refresh: vi.fn(),
    subscribeToPackage: vi.fn(),
    unsubscribeFromPackage: vi.fn(),
    activateModule: vi.fn(),
    deactivateModule: vi.fn(),
    renewModule: vi.fn(),
    toggleAutoRenew: vi.fn(),
  }),
}));

vi.mock('@components/shared/NotificationService', () => ({
  default: { show: vi.fn() },
}));

describe('ModulesPage', () => {
  it('renders solutions and standalone capabilities without the old all modules tab', () => {
    render(<ModulesPage />);

    expect(screen.getByRole('heading', { name: 'Модули и пакеты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Решения' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Отдельные возможности' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Все модули/i })).not.toBeInTheDocument();
    expect(screen.getByText('Управление проектами')).toBeInTheDocument();
    expect(screen.getByText('Бригады')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отключить' })).not.toBeInTheDocument();
  });

  it('keeps the full module inventory hidden behind advanced management', async () => {
    render(<ModulesPage />);

    expect(screen.queryByText('Пользователи')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ещё/i }));
    fireEvent.click(screen.getByRole('button', { name: /Расширенное управление/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { name: /Расширенное управление/i });
      expect(within(dialog).getByText('Пользователи')).toBeInTheDocument();
      expect(within(dialog).getByText('Системный')).toBeInTheDocument();
    });
  });
});
