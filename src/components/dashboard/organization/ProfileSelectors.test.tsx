import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SpecializationsSelector } from './SpecializationsSelector';
import { CertificationsList } from './CertificationsList';

describe('Формы профиля компании', () => {
  it('фильтрует специализации и сохраняет выбранные значения вне результатов поиска', () => {
    const onChange = vi.fn();
    render(<SpecializationsSelector selectedSpecializations={['road_construction', 'custom']} onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Найти специализацию' }), { target: { value: 'САНТЕХ' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Сантехнические работы' }));
    expect(onChange).toHaveBeenLastCalledWith(['road_construction', 'custom', 'plumbing_works']);
    fireEvent.click(screen.getByRole('button', { name: 'Убрать специализацию «Дорожное строительство»' }));
    expect(onChange).toHaveBeenLastCalledWith(['custom']);
  });

  it('запрещает изменение специализаций при disabled', () => {
    const onChange = vi.fn();
    render(<SpecializationsSelector selectedSpecializations={[]} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Дорожное строительство' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('добавляет сертификат по Enter, предотвращает дубликат и отменяет ввод по Escape', () => {
    const onChange = vi.fn();
    render(<CertificationsList certifications={['ISO 9001']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить сертификат' }));
    const input = screen.getByRole('textbox', { name: 'Название сертификата' });
    fireEvent.change(input, { target: { value: ' ISO 9001 ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Этот сертификат уже добавлен.')).toBeTruthy();
    fireEvent.change(input, { target: { value: ' ISO 14001 ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['ISO 9001', 'ISO 14001']);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить сертификат' }));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Удалить сертификат «ISO 9001»' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});