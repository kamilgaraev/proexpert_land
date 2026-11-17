import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { saveAuthToken } from '@/utils/authTokenStorage';
import type { CanAccessOptions } from '@/types/permissions';
import ContractorMarketplacePage from './ContractorMarketplacePage';

const access = vi.hoisted(() => ({
  roles: [] as string[],
  permissions: [] as string[],
  modules: [] as string[],
}));

vi.mock('@/hooks/usePermissions', () => ({
  useCanAccess: ({ role, permission, module }: CanAccessOptions) => (
    (!role || access.roles.includes(role))
    && (!permission || access.permissions.includes(permission))
    && (!module || access.modules.includes(module))
  ),
}));
vi.mock('@/hooks/useSEO', () => ({ usePageTitle: vi.fn() }));

const baseUrl = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing';
const requests: string[] = [];
const server = setupServer(
  http.get(`${baseUrl}/*`, ({ request }) => {
    const path = new URL(request.url).pathname.replace('/api/v1/landing', '');
    requests.push(path);

    if (path === '/contractor-marketplace/categories') {
      return HttpResponse.json({ success: true, data: [] });
    }
    if (path === '/contractor-marketplace/profile') {
      return HttpResponse.json({ success: true, data: { id: 1, organization_id: 47, status: 'draft' } });
    }
    if (path === '/contractor-marketplace/search') {
      return HttpResponse.json({
        success: true,
        data: [],
        meta: { total: 0, current_page: 1, last_page: 1, per_page: 12 },
      });
    }
    if (path === '/organization/verification') {
      return HttpResponse.json({ success: true, data: { organization: null } });
    }
    if (path === '/organization/profile') {
      return HttpResponse.json({ success: true, data: null });
    }

    return HttpResponse.json({ success: false }, { status: 403 });
  }),
);

const renderPage = () => render(<MemoryRouter><ContractorMarketplacePage /></MemoryRouter>);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  access.roles = [];
  access.permissions = [];
  access.modules = [];
  requests.length = 0;
  saveAuthToken('marketplace-test-token');
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

describe('ContractorMarketplacePage access', () => {
  it.each(['organization_owner', 'organization_admin'])('does not load paid data for %s without access', async (role) => {
    access.roles = [role];
    renderPage();

    expect(await screen.findByText('У вас нет доступа к каталогу подрядчиков.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Обновить' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Обновить' })).toBeEnabled());
    expect(requests).toEqual([]);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('does not request paid data when permissions remain but the package module is unavailable', async () => {
    access.roles = ['organization_owner'];
    access.permissions = ['contractor_marketplace.categories.view', 'contractor_marketplace.search.view', 'contractor_marketplace.profile.view'];
    renderPage();

    expect(await screen.findByText('У вас нет доступа к каталогу подрядчиков.')).toBeInTheDocument();
    expect(requests).toEqual([]);
  });

  it('does not elevate an owner with an active module and no marketplace permissions', async () => {
    access.roles = ['organization_owner'];
    access.modules = ['contractor-portal'];
    renderPage();

    expect(await screen.findByText('У вас нет доступа к каталогу подрядчиков.')).toBeInTheDocument();
    expect(requests).toEqual([]);
  });

  it('loads the catalogue and search for a user with the package module and permissions', async () => {
    access.modules = ['contractor-portal'];
    access.permissions = ['contractor_marketplace.categories.view', 'contractor_marketplace.search.view', 'contractor_marketplace.profile.view'];
    renderPage();

    expect(await screen.findByRole('tab', { name: 'Поиск' })).toBeInTheDocument();
    await waitFor(() => expect(requests).toContain('/contractor-marketplace/search'));
    expect(requests).toContain('/contractor-marketplace/categories');
    expect(requests).toContain('/contractor-marketplace/profile');
    expect(screen.queryByRole('tab', { name: 'Исходящие' })).not.toBeInTheDocument();
  });

  it('only loads endpoints allowed to a search-only user', async () => {
    access.modules = ['contractor-portal'];
    access.permissions = ['contractor_marketplace.search.view'];
    renderPage();

    expect(await screen.findByRole('tab', { name: 'Поиск' })).toBeInTheDocument();
    await waitFor(() => expect(requests).toContain('/contractor-marketplace/search'));
    expect(requests).toEqual(['/contractor-marketplace/search']);
    expect(screen.queryByRole('tab', { name: 'Профиль' })).not.toBeInTheDocument();
  });
});
