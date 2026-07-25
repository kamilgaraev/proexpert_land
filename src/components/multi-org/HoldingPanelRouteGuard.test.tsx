import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HoldingPanelRouteGuard } from './HoldingPanelRouteGuard';

const mocks = vi.hoisted(() => ({
  auth: {
    user: null as any,
    isAuthenticated: false,
    isLoading: false,
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mocks.auth,
}));

const renderGuard = () => render(
  <MemoryRouter initialEntries={['/landing/multi-organization/dashboard']}>
    <Routes>
      <Route
        path="/landing/multi-organization/dashboard"
        element={(
          <HoldingPanelRouteGuard>
            <div>Панель холдинга</div>
          </HoldingPanelRouteGuard>
        )}
      />
      <Route path="/dashboard/multi-organization" element={<div>Создание холдинга</div>} />
      <Route path="/login" element={<div>Вход</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('HoldingPanelRouteGuard', () => {
  beforeEach(() => {
    mocks.auth.isLoading = false;
    mocks.auth.user = null;
    mocks.auth.isAuthenticated = false;
  });

  it('renders holding panel for a parent organization', () => {
    mocks.auth.user = {
      organization: {
        organization_type: 'parent',
        is_holding: true,
      },
    };
    mocks.auth.isAuthenticated = true;

    renderGuard();

    expect(screen.getByText('Панель холдинга')).toBeInTheDocument();
  });

  it('redirects regular organizations to the holding setup screen', async () => {
    mocks.auth.user = {
      organization: {
        organization_type: 'standard',
        is_holding: false,
      },
    };
    mocks.auth.isAuthenticated = true;

    renderGuard();

    await waitFor(() => {
      expect(screen.getByText('Создание холдинга')).toBeInTheDocument();
    });
    expect(screen.queryByText('Панель холдинга')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to the holding login page', async () => {
    renderGuard();

    await waitFor(() => {
      expect(screen.getByText('Вход')).toBeInTheDocument();
    });
    expect(screen.queryByText('Панель холдинга')).not.toBeInTheDocument();
  });
});
