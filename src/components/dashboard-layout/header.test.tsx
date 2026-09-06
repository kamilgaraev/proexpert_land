import { act, fireEvent, render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Header } from './header';

vi.mock('@/components/dashboard/notifications', () => ({ NotificationBell: () => null }));

function setup(query = 'команда') {
  render(<MemoryRouter><Header
    user={{ name: 'Тест' }} balance={null} balanceError={null}
    refreshBalance={vi.fn()} onLogout={vi.fn()}
    navigation={[{ name: 'Команда', href: '/dashboard/admins', icon: Users }]}
    sidebarProps={{ navigation: [], supportNavigation: [], userNavigation: [], onLogout: vi.fn() }}
  /></MemoryRouter>);
  const input = screen.getByRole('searchbox', { name: 'Поиск по личному кабинету' });
  fireEvent.change(input, { target: { value: query } });
  return input;
}

describe('Фокус поиска в шапке', () => {
  it.each(['результат', 'очистка', 'поле'])('Escape закрывает поиск: %s', (source) => {
    const input = setup();
    const target = source === 'результат'
      ? screen.getByRole('option', { name: 'Команда' })
      : source === 'очистка'
        ? screen.getByRole('button', { name: 'Очистить поиск' })
        : input;
    act(() => target.focus());
    fireEvent.keyDown(target, { key: 'Escape' });
    expect(input).toHaveFocus();
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Escape закрывает предложение поиска по проектам', () => {
    const input = setup('несуществующий');
    const fallback = screen.getByRole('button', { name: /Искать в проектах/ });
    act(() => fallback.focus());
    fireEvent.keyDown(fallback, { key: 'Escape' });
    expect(input).toHaveFocus();
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('клавиатурная очистка возвращает фокус в поле', () => {
    const input = setup();
    const clear = screen.getByRole('button', { name: 'Очистить поиск' });
    act(() => clear.focus());
    fireEvent.click(clear);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
