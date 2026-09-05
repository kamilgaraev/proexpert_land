import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrganizationSettingsPage } from './OrganizationSettingsPage';

const service = vi.hoisted(() => ({
  profile: { name: 'Компания', capabilities: ['general_contracting'], primary_business_type: 'general_contracting', specializations: ['building_construction'], certifications: [], recommended_modules: [], profile_completeness: 80 },
  availableCapabilities: [], loading: false,
  fetchProfile: vi.fn(), fetchAvailableCapabilities: vi.fn(),
  updateCapabilities: vi.fn(), updateBusinessType: vi.fn(), updateSpecializations: vi.fn(), updateCertifications: vi.fn(),
}));
const verification = vi.hoisted(() => ({ getOrganization: vi.fn().mockResolvedValue(null), organization: null }));
vi.mock('@/hooks/useOrganizationProfile', () => ({ useOrganizationProfile: () => service }));
vi.mock('@/hooks/useOrganizationVerification', () => ({ useOrganizationVerification: () => verification }));

const originalScroll = HTMLElement.prototype.scrollIntoView;
const scroll = vi.fn();
beforeEach(() => {
  service.profile.capabilities = ['general_contracting'];
  service.profile.primary_business_type = 'general_contracting';
  service.profile.specializations = ['building_construction'];
  HTMLElement.prototype.scrollIntoView = scroll;
  scroll.mockClear();
});
afterAll(() => { HTMLElement.prototype.scrollIntoView = originalScroll; });

const openPage = () => render(<MemoryRouter><OrganizationSettingsPage /></MemoryRouter>);

describe('Переход к заполнению профиля', () => {
  it('открывает пустые сертификаты и переводит фокус, включая повторный переход', () => {
    openPage();
    fireEvent.click(screen.getByRole('button', { name: 'Завершить настройку профиля' }));
    expect(screen.getByRole('button', { name: 'Добавить сертификат' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Сертификаты и допуски' }));
    expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
    scroll.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Завершить настройку профиля' }));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(service.updateCertifications).not.toHaveBeenCalled();
  });

  it.each([
    ['capabilities', 'Направления деятельности'],
    ['primary_business_type', 'Основной режим работы'],
    ['specializations', 'Специализации'],
  ])('открывает первый незаполненный раздел %s', (field, title) => {
    if (field === 'capabilities') service.profile.capabilities = [];
    if (field === 'primary_business_type') service.profile.primary_business_type = '';
    if (field === 'specializations') service.profile.specializations = [];
    openPage();
    fireEvent.click(screen.getByRole('button', { name: 'Завершить настройку профиля' }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: title }));
    expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' });
    expect(service.updateCapabilities).not.toHaveBeenCalled();
    expect(service.updateBusinessType).not.toHaveBeenCalled();
    expect(service.updateSpecializations).not.toHaveBeenCalled();
  });
});
