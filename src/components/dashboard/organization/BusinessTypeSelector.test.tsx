import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BusinessTypeSelector } from './BusinessTypeSelector';

describe('BusinessTypeSelector', () => {
  it('exposes named radio choices and sends the selected business type', () => {
    const onChange = vi.fn();
    render(<BusinessTypeSelector selectedType="general_contracting" onChange={onChange} availableTypes={['general_contracting', 'design']} />);
    expect(screen.getByRole('group', { name: 'Основной режим работы' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Генеральный подряд' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Проектирование' }));
    expect(onChange).toHaveBeenCalledWith('design');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('disables the entire group when edits are unavailable', () => {
    render(<BusinessTypeSelector selectedType="general_contracting" onChange={vi.fn()} availableTypes={['general_contracting']} disabled />);
    expect(screen.getByRole('radio', { name: 'Генеральный подряд' })).toBeDisabled();
  });
});
