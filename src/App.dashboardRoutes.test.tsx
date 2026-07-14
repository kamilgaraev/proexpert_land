import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('@components/analytics/YandexMetrika', () => ({
  default: () => null,
}));

vi.mock('@utils/seoTracking', () => ({
  initSEOTracking: vi.fn(),
  seoTracker: {
    trackPageView: vi.fn(),
  },
}));

vi.mock('@layouts/LandingLayout', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const { Outlet } = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return { default: () => React.createElement(Outlet) };
});

vi.mock('@layouts/DashboardLayout', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const { Outlet } = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return { default: () => React.createElement(Outlet) };
});

vi.mock('@components/DashboardProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/permissions/ProtectedComponent', () => ({
  ProtectedComponent: ({
    children,
    permission,
    role,
  }: {
    children: React.ReactNode;
    permission?: string;
    role?: string;
  }) => (
    <div data-testid="protected-route" data-permission={permission} data-role={role}>
      {children}
    </div>
  ),
}));

vi.mock('@pages/landing/HomePage', () => ({ default: () => <div /> }));
vi.mock('@pages/landing/SolutionsPage', () => ({ default: () => <div /> }));
vi.mock('@pages/landing/FeaturesPage', () => ({ default: () => <div /> }));
vi.mock('@pages/landing/PricingPage', () => ({ default: () => <div /> }));
vi.mock('@pages/landing/SeoClusterPage', () => ({ default: () => <div /> }));
vi.mock('@pages/company/AboutPage', () => ({ default: () => <div /> }));
vi.mock('@pages/company/ContactPage', () => ({ default: () => <div /> }));
vi.mock('@pages/company/SecurityPage', () => ({ default: () => <div /> }));
vi.mock('@pages/legal/PrivacyPage', () => ({ default: () => <div /> }));
vi.mock('@pages/legal/OfferPage', () => ({ default: () => <div /> }));
vi.mock('@pages/legal/CookiesPage', () => ({ default: () => <div /> }));
vi.mock('@pages/product/IntegrationsPage', () => ({ default: () => <div /> }));
vi.mock('@pages/solutions/ContractorsPage', () => ({ default: () => <div /> }));
vi.mock('@pages/solutions/DevelopersPage', () => ({ default: () => <div /> }));
vi.mock('@pages/solutions/EnterprisePage', () => ({ default: () => <div /> }));
vi.mock('@components/blog/public/BlogPublicPage', () => ({ default: () => <div /> }));
vi.mock('@components/blog/public/BlogArticlePage', () => ({ default: () => <div /> }));
vi.mock('@components/blog/public/BlogCategoryPage', () => ({ default: () => <div /> }));
vi.mock('@components/blog/public/BlogTagPage', () => ({ default: () => <div /> }));
vi.mock('@pages/dashboard/LoginPage', () => ({ default: () => <div /> }));
vi.mock('@pages/dashboard/RegisterPage', () => ({ default: () => <div /> }));
vi.mock('@pages/dashboard/ForgotPasswordPage', () => ({ default: () => <div /> }));
vi.mock('@pages/NotFoundPage', () => ({ default: () => <div /> }));
vi.mock('@pages/dashboard/EmailSentPage', () => ({ default: () => <div /> }));
vi.mock('@pages/dashboard/help/KnowledgeBasePage', () => ({
  default: () => <div>База знаний ЛК</div>,
}));
vi.mock('@pages/dashboard/help/KnowledgeArticlePage', () => ({
  default: () => <div>Материал базы знаний</div>,
}));
vi.mock('@pages/dashboard/help/ChangelogPage', () => ({
  default: () => <div>Обновления ЛК</div>,
}));
vi.mock('@pages/dashboard/help/ChangelogDetailPage', () => ({
  default: () => <div>Запись обновления</div>,
}));

describe('dashboard route guards', () => {
  it('registers knowledge hub dashboard routes', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/help/knowledge']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('База знаний ЛК')).toBeInTheDocument();
  });
});
