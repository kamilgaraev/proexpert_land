import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrganizationBoundary, { OrganizationSwitchButton } from './OrganizationBoundary';
import { organizationSession } from '../services/organizationSession';

vi.mock('../services/organizationSession', () => ({
  organizationSession: { list: vi.fn(), switch: vi.fn() },
}));

const user = { id: 10, current_organization_id: 1 };
const organizations = [{ id: 1, name: 'Первая организация' }, { id: 2, name: 'Вторая организация' }];
const show = () => render(
  <OrganizationBoundary user={user} ready logout={vi.fn()}>
    <span>Рабочие данные</span><OrganizationSwitchButton />
  </OrganizationBoundary>,
);

describe('OrganizationBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(organizationSession.list).mockResolvedValue(organizations);
  });

  it('requires an explicit organization choice before mounting workspace data', async () => {
    show();
    expect(screen.queryByText('Рабочие данные')).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /Первая организация/ }));
    expect(await screen.findByText('Рабочие данные')).toBeInTheDocument();
    expect(organizationSession.switch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Сменить организацию' }));
    expect(screen.queryByText('Рабочие данные')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Вторая организация/ })).toBeInTheDocument();
  });

  it('continues automatically when there is only one organization', async () => {
    vi.mocked(organizationSession.list).mockResolvedValue([organizations[0]]);
    show();
    expect(await screen.findByText('Рабочие данные')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Сменить организацию' })).not.toBeInTheDocument();
  });

  it('keeps workspace hidden and permits retry after a denied switch', async () => {
    vi.mocked(organizationSession.switch).mockRejectedValue(new Error('Forbidden'));
    show();
    fireEvent.click(await screen.findByRole('button', { name: /Вторая организация/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось сменить организацию');
    expect(organizationSession.switch).toHaveBeenCalledWith(2);
    expect(screen.queryByText('Рабочие данные')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Вторая организация/ })).toBeEnabled();
  });

  it('restores a choice only for the current user and organization', async () => {
    sessionStorage.setItem('most-organization-choice', '10:1');
    show();
    await waitFor(() => expect(screen.getByText('Рабочие данные')).toBeInTheDocument());
  });

  it('offers retry when organizations cannot be loaded', async () => {
    vi.mocked(organizationSession.list).mockRejectedValueOnce(new Error('Offline'));
    show();
    fireEvent.click(await screen.findByRole('button', { name: 'Повторить' }));
    expect(await screen.findByRole('button', { name: /Вторая организация/ })).toBeInTheDocument();
  });
});
