import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  vi.clearAllMocks();
  service.updateSpecializations.mockReset();
  service.profile.capabilities = ['general_contracting'];
  service.profile.primary_business_type = 'general_contracting';
  service.profile.specializations = ['building_construction'];
  HTMLElement.prototype.scrollIntoView = scroll;
  scroll.mockClear();
});
afterAll(() => { HTMLElement.prototype.scrollIntoView = originalScroll; });

const openPage = () => render(<MemoryRouter><OrganizationSettingsPage /></MemoryRouter>);

describe('Редакторы направлений работы', () => {
  it.each([
    ['Изменить: Направления деятельности', 'Направления деятельности'],
    ['Изменить: Основной режим работы', 'Основной режим работы'],
    ['Изменить: Специализации', 'Специализации'],
    ['Заполнить: Сертификаты и допуски', 'Сертификаты и допуски'],
  ])('возвращает фокус после отмены: %s', (buttonName, title) => {
    openPage();
    fireEvent.click(screen.getByRole('button', { name: buttonName }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: title }));
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: buttonName }));
    expect(service.updateCapabilities).not.toHaveBeenCalled();
    expect(service.updateBusinessType).not.toHaveBeenCalled();
    expect(service.updateSpecializations).not.toHaveBeenCalled();
    expect(service.updateCertifications).not.toHaveBeenCalled();
  });

  it('возвращает исходный выбор после отмены и повторного открытия', () => {
    openPage();
    fireEvent.click(screen.getByRole('button', { name: 'Изменить: Специализации' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Дорожное строительство' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    fireEvent.click(screen.getByRole('button', { name: 'Изменить: Специализации' }));
    expect(screen.getByRole('checkbox', { name: 'Дорожное строительство', checked: false })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Промышленное и гражданское строительство', checked: true })).toBeTruthy();
  });

  it('сохраняет ввод при отказе и возвращает фокус после успешного повтора', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    service.updateSpecializations.mockRejectedValueOnce(new Error('Сохранение отклонено')).mockResolvedValueOnce(undefined);
    try {
      openPage();
      fireEvent.click(screen.getByRole('button', { name: 'Изменить: Специализации' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Дорожное строительство' }));
      fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Сохранить' }).hasAttribute('disabled')).toBe(false));
      expect(screen.getByRole('checkbox', { name: 'Дорожное строительство', checked: true })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Изменить: Специализации' })));
      expect(service.updateSpecializations).toHaveBeenCalledTimes(2);
      expect(service.updateSpecializations).toHaveBeenLastCalledWith(['building_construction', 'road_construction']);
    } finally {
      log.mockRestore();
    }
  });
});

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
