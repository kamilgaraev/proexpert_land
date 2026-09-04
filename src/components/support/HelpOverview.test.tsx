import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { HelpOverview } from './HelpOverview';

describe('HelpOverview', () => {
  it('offers accessible actions for the existing help tabs and instructions', () => {
    const onTabChange = vi.fn();
    render(<MemoryRouter><HelpOverview onTabChange={onTabChange} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Написать обращение' }));
    expect(onTabChange).toHaveBeenLastCalledWith('support');
    fireEvent.click(screen.getByRole('button', { name: 'Посмотреть ответы' }));
    expect(onTabChange).toHaveBeenLastCalledWith('faq');
    expect(screen.getByRole('link', { name: 'Открыть инструкции' })).toHaveAttribute('href', '/dashboard/help/knowledge');
    expect(screen.queryByText('+7 (800) 123-45-67')).not.toBeInTheDocument();
    expect(screen.queryByText('Открыть чат')).not.toBeInTheDocument();
  });
});
