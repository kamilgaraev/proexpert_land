import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationProfileModal } from './OrganizationProfileModal';

const service = vi.hoisted(() => ({
  profile: null, availableCapabilities: [], loading: false,
  fetchProfile: vi.fn(), fetchAvailableCapabilities: vi.fn(),
  updateCapabilities: vi.fn(), updateBusinessType: vi.fn(),
  updateSpecializations: vi.fn(), completeOnboarding: vi.fn(),
}));
vi.mock('@/hooks/useOrganizationProfile', () => ({ useOrganizationProfile: () => service }));

describe('Окно настройки организации', () => {
  it('имеет имя диалога и закрывается по Escape без сохранения', () => {
    const onClose = vi.fn();
    render(<MemoryRouter><OrganizationProfileModal isOpen onClose={onClose} onComplete={vi.fn()} /></MemoryRouter>);
    const dialog = screen.getByRole('dialog', { name: 'Направления деятельности' });
    expect(dialog).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(8);
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(service.updateCapabilities).not.toHaveBeenCalled();
    expect(service.completeOnboarding).not.toHaveBeenCalled();
  });
});