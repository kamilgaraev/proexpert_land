import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CapabilitiesSelector } from './CapabilitiesSelector';

const props = { availableCapabilities: [], onPackageClick: vi.fn() };

describe('Выбор направлений деятельности', () => {
  it('показывает именованные чекбоксы и сохраняет остальные выбранные направления', () => {
    const onChange = vi.fn();
    const { rerender } = render(<CapabilitiesSelector {...props} selectedCapabilities={['design']} onChange={onChange} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(8);
    const contracting = screen.getByRole('checkbox', { name: 'Генеральный подряд' }) as HTMLInputElement;
    contracting.focus();
    expect(document.activeElement).toBe(contracting);
    fireEvent.click(contracting);
    expect(onChange).toHaveBeenLastCalledWith(['design', 'general_contracting']);
    rerender(<CapabilitiesSelector {...props} selectedCapabilities={['design', 'general_contracting']} onChange={onChange} />);
    expect((screen.getByRole('checkbox', { name: 'Проектирование' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Генеральный подряд' }));
    expect(onChange).toHaveBeenLastCalledWith(['design']);
  });

  it('не изменяет выбор в заблокированном состоянии', () => {
    const onChange = vi.fn();
    render(<CapabilitiesSelector {...props} selectedCapabilities={['design']} onChange={onChange} disabled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Проектирование' });
    expect(checkbox.closest('fieldset')?.disabled).toBe(true);
    fireEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });
});