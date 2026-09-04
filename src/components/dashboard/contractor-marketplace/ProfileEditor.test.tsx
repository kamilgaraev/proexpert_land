import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { MarketplaceContractorProfile, MarketplaceWorkCategory } from '@/types/contractor-marketplace';
import { ProfileEditor } from './ProfileEditor';

const categories: MarketplaceWorkCategory[] = [{ id: 1, parent_id: null, slug: 'building', name: 'Строительные работы', type: 'construction', is_active: true, sort_order: 1, children: [] }];
const profile: MarketplaceContractorProfile = {
  id: 1, organization_id: 1, status: 'draft', display_name: 'Тестовая компания', short_description: null,
  description: null, team_size_min: null, team_size_max: null, years_on_market: null, base_city: 'Казань',
  service_radius_km: null, availability_status: 'hidden', available_from: null, verification_level: 'none',
  is_visible_in_marketplace: false, published_at: null, metadata: {}, categories: [], ratings: [], regions: [],
  portfolio_items: [], documents: [], created_at: null, updated_at: null,
};

function setup() {
  const onSave = vi.fn();
  const view = render(<ProfileEditor profile={profile} categories={categories} organization={null} organizationProfile={null}
    isSaving={false} isPublishing={false} isUploadingDocument={false} onSave={onSave}
    onPublish={vi.fn()} onPause={vi.fn()} onUploadDocument={vi.fn()} onDeleteDocument={vi.fn()} />);
  return { ...view, onSave };
}

describe('ProfileEditor field accessibility', () => {
  it('labels basic fields and removes implementation details', () => {
    setup();
    expect(screen.getByRole('textbox', { name: 'Название в каталоге' })).toHaveValue('Тестовая компания');
    expect(screen.getByRole('combobox', { name: 'Доступность' })).toBeInTheDocument();
    expect(screen.getByLabelText('Файл')).toHaveAttribute('type', 'file');
    expect(screen.getByRole('progressbar', { name: 'Готовность к публикации' })).toBeInTheDocument();
    expect(screen.queryByText(/S3/)).not.toBeInTheDocument();
  });

  it('keeps repeated field ids unique and names every visible control', () => {
    const { container, onSave } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Категория' }));
    fireEvent.click(screen.getByRole('button', { name: 'Категория' }));
    fireEvent.click(screen.getByRole('button', { name: 'Регион' }));
    fireEvent.click(screen.getByRole('button', { name: 'Проект' }));
    const controls = Array.from(container.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]), textarea, button[role="combobox"]'));
    expect(controls.length).toBeGreaterThan(20);
    for (const control of controls) {
      expect(Boolean(control.labels?.length || control.closest('label') || control.getAttribute('aria-label')), control.outerHTML).toBe(true);
    }
    const ids = controls.map((control) => control.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    fireEvent.click(screen.getByRole('button', { name: 'Удалить категорию 1' }));
    expect(screen.getAllByRole('button', { name: /Удалить категорию/ })).toHaveLength(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
