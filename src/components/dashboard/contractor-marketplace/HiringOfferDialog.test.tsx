import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MarketplaceContractorProfile } from '@/types/contractor-marketplace';
import { HiringOfferDialog } from './HiringOfferDialog';

const projectState = vi.hoisted(() => ({
  projects: [{ id: 11, name: 'Тестовый объект', status: 'active' }],
  loading: false,
  fetchProjects: vi.fn(),
}));
vi.mock('@/hooks/useMyProjects', () => ({ useMyProjects: () => projectState }));

const profile: MarketplaceContractorProfile = {
  id: 1, organization_id: 1, status: 'active', display_name: 'Тестовая компания', short_description: null,
  description: null, team_size_min: null, team_size_max: null, years_on_market: null, base_city: 'Казань',
  service_radius_km: null, availability_status: 'available', available_from: null, verification_level: 'none',
  is_visible_in_marketplace: true, published_at: null, metadata: {}, ratings: [], regions: [],
  categories: [{ category_id: 1, is_primary: true, experience_years: null, team_capacity: null, min_project_budget: null, max_project_budget: null }],
  portfolio_items: [], documents: [], created_at: null, updated_at: null,
};

describe('HiringOfferDialog', () => {
  it('names every field and keeps repeated package controls distinct without sending an offer', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<HiringOfferDialog open profile={profile} submitting={false} onClose={onClose} onSubmit={onSubmit} />);
    const dialog = screen.getByRole('dialog', { name: 'Предложение подрядчику' });
    expect(within(dialog).getByRole('combobox', { name: 'Проект' })).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: 'Название предложения' })).toHaveValue('Предложение для Тестовая компания');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Добавить пакет' }));
    const controls = Array.from(dialog.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]),textarea,button[role="combobox"]'));
    expect(controls.length).toBeGreaterThan(20);
    for (const control of controls) {
      expect(Boolean(control.labels?.length || control.getAttribute('aria-label')), control.outerHTML).toBe(true);
    }
    const ids = controls.map((control) => control.id);
    expect(new Set(ids).size).toBe(ids.length);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить пакет работ 2' }));
    expect(within(dialog).getByRole('button', { name: 'Удалить пакет работ 1' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
