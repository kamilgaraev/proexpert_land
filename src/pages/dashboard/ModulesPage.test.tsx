import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ModulesPage from './ModulesPage';

const subscribeToPackage = vi.fn();

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
      access_source: 'subscription',
      is_bundled_with_plan: true,
      foundation_modules: ['organizations', 'users', 'project-management'],
      integrations: [
        {
          package_slug: 'supply-warehouse',
          module_slug: 'basic-warehouse',
          label: 'Склад и заявки с объекта',
        },
      ],
      recommended_addons: [
        {
          module_slug: 'video-monitoring',
          label: 'Видео с площадки',
        },
      ],
      business_outcomes: [
        'Единый контур объектов, договоров и исполнения',
        'Понятная связь офиса и площадки',
      ],
      data_sources: [],
      admin_entries: [
        {
          module_slug: 'machinery-operations',
          label: 'Ресурсы → Техника',
          path: '/machinery-operations',
        },
        {
          module_slug: 'production-labor',
          label: 'Ресурсы → Наряды и выработка',
          path: '/production-labor',
        },
      ],
      capabilities: [],
      tiers: [
        {
          key: 'base',
          label: 'Базовый',
          description: 'Базовый набор',
          price: 0,
          modules: ['project-management'],
          included_modules: ['project-management'],
          highlights: ['Создание и управление проектами'],
          is_current: false,
          included_modules_count: 1,
          active_modules_count: 1,
        },
        {
          key: 'pro',
          label: 'Рост',
          description: 'Полный набор',
          price: 4890,
          modules: ['project-management', 'schedule-management', 'time-tracking', 'site-requests'],
          included_modules: ['project-management', 'schedule-management', 'time-tracking', 'site-requests'],
          highlights: ['График работ', 'Учёт времени', 'Заявки с объекта'],
          is_current: true,
          included_modules_count: 4,
          active_modules_count: 4,
        },
        {
          key: 'enterprise',
          label: 'Корпоративный',
          description: 'Расширенный набор',
          price: 10900,
          modules: ['project-management', 'schedule-management', 'time-tracking', 'site-requests', 'data-export'],
          included_modules: ['project-management', 'schedule-management', 'time-tracking', 'site-requests', 'data-export'],
          highlights: ['Контроль отклонений'],
          is_current: false,
          included_modules_count: 5,
          active_modules_count: 4,
        },
      ],
    },
    {
      slug: 'holding-analytics',
      name: 'Холдинг и аналитика',
      description: 'Управленческий контур для руководителя',
      icon: 'chart-bar',
      color: '#334155',
      current_tier: null,
      active_tier: null,
      effective_monthly_price: 0,
      included_modules_count: 3,
      active_included_modules_count: 0,
      can_upgrade: false,
      can_downgrade: false,
      expires_at: null,
      access_source: null,
      is_bundled_with_plan: false,
      foundation_modules: ['dashboard-widgets', 'data-filters'],
      integrations: [],
      recommended_addons: [
        {
          module_slug: 'integrations',
          label: 'Внешние интеграции',
        },
      ],
      business_outcomes: ['Управленческий обзор по компаниям'],
      data_sources: [
        {
          module_slug: 'dashboard-widgets',
          label: 'Дашборды',
        },
        {
          module_slug: 'data-filters',
          label: 'Фильтры',
        },
      ],
      capabilities: [],
      tiers: [],
    },
    {
      slug: 'ai-contour',
      name: 'AI-контур',
      description: 'Пилотные AI-сценарии для вопросов по данным',
      icon: 'cpu-chip',
      color: '#DB2777',
      current_tier: null,
      active_tier: null,
      effective_monthly_price: 0,
      included_modules_count: 2,
      active_included_modules_count: 0,
      can_upgrade: false,
      can_downgrade: false,
      expires_at: null,
      access_source: null,
      is_bundled_with_plan: false,
      foundation_modules: ['project-management'],
      integrations: [],
      recommended_addons: [],
      business_outcomes: ['AI-помощник по данным компании'],
      data_sources: [],
      capabilities: [
        {
          key: 'project_questions',
          label: 'Вопросы по объектам',
          requires_modules: ['project-management'],
        },
      ],
      tiers: [],
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
    subscribeToPackage,
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
  beforeEach(() => {
    subscribeToPackage.mockReset();
  });

  it('renders solutions and standalone capabilities without the old all modules tab', () => {
    render(<ModulesPage />);

    expect(screen.getByRole('heading', { name: 'Модули и пакеты' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Решения' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Отдельные возможности' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Все модули/i })).not.toBeInTheDocument();
    expect(screen.getByText('Управление проектами')).toBeInTheDocument();
    expect(screen.getByText('Тариф и доплаты')).toBeInTheDocument();
    expect(screen.getAllByText('Входит в тариф')).toHaveLength(2);
    expect(screen.getByText('Бригады')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отключить' })).not.toBeInTheDocument();
  });

  it('shows the current package tier label from the backend contract', () => {
    render(<ModulesPage />);

    expect(screen.getByText('Рост')).toBeInTheDocument();
    expect(screen.queryByText('Профессиональный')).not.toBeInTheDocument();
  });

  it('shows package v2 details as business-readable sections', () => {
    render(<ModulesPage />);

    expect(screen.getAllByText('Базовый слой').length).toBeGreaterThan(0);
    expect(screen.getByText('3 возможности уже входят в основу')).toBeInTheDocument();
    expect(screen.getByText('Связанные контуры')).toBeInTheDocument();
    expect(screen.getByText('Склад и заявки с объекта')).toBeInTheDocument();
    expect(screen.getAllByText('Что стоит добавить').length).toBeGreaterThan(0);
    expect(screen.getByText('Видео с площадки')).toBeInTheDocument();
    expect(screen.getByText('Единый контур объектов, договоров и исполнения')).toBeInTheDocument();
    expect(screen.getByText('Данные для аналитики')).toBeInTheDocument();
    expect(screen.getByText('Дашборды')).toBeInTheDocument();
    expect(screen.getByText('Где искать в админке')).toBeInTheDocument();
    expect(screen.getByText('Ресурсы → Техника')).toBeInTheDocument();
    expect(screen.getByText('Ресурсы → Наряды и выработка')).toBeInTheDocument();
    expect(screen.getByText('AI-сценарии')).toBeInTheDocument();
    expect(screen.getByText('Вопросы по объектам')).toBeInTheDocument();
    expect(screen.queryByText(/foundation_modules|recommended_addons|data_sources|capabilities/)).not.toBeInTheDocument();
    expect(screen.queryByText(/project-management|schedule-management|site-requests|basic-warehouse/)).not.toBeInTheDocument();
  });

  it('marks bundled packages with a Russian business status', () => {
    render(<ModulesPage />);

    expect(screen.getAllByText('Входит в тариф').length).toBeGreaterThan(0);
    expect(screen.queryByText('В тарифе')).not.toBeInTheDocument();
  });

  it('keeps higher package tiers available for separate purchase when the current tier comes from subscription', async () => {
    render(<ModulesPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Управлять' })[0]);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { name: /Управление проектами/i });
      expect(within(dialog).queryByText('Включено в подписку')).not.toBeInTheDocument();
      expect(within(dialog).getByText('Подключено по подписке')).toBeInTheDocument();
      expect(within(dialog).getByText('Покрыто уровнем «Рост»')).toBeInTheDocument();
      expect(within(dialog).getByText('Не входит в текущую подписку')).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Докупить пакет' })).toBeEnabled();
    });

    fireEvent.click(within(screen.getByRole('dialog', { name: /Управление проектами/i })).getByRole('button', { name: 'Докупить пакет' }));

    expect(subscribeToPackage).toHaveBeenCalledWith('projects', 'enterprise');
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
