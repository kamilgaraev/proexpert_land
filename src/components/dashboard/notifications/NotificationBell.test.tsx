import { act, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NotificationBell } from './NotificationBell';

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, current_organization_id: 1 }, token: 'test-token' }),
}));

vi.mock('../../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [], unreadCount: 0, loading: false,
    markAsRead: vi.fn(), markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(), executeAction: vi.fn(),
  }),
}));

function setup() {
  render(<MemoryRouter><NotificationBell /><button>Следующее действие</button></MemoryRouter>);
  const trigger = screen.getByRole('button', { name: 'Уведомления' });
  act(() => trigger.focus());
  fireEvent.click(trigger);
  return trigger;
}

describe('Клавиатура панели уведомлений', () => {
  it('закрывается Escape из панели с возвратом фокуса', () => {
    const trigger = setup();
    const panel = screen.getByRole('region', { name: 'Уведомления' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    const link = screen.getByRole('link', { name: 'Посмотреть все уведомления' });
    act(() => link.focus());
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Уведомления' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('сохраняет панель при переходе внутри и закрывает при уходе фокуса наружу', () => {
    setup();
    act(() => screen.getByRole('link', { name: 'Посмотреть все уведомления' }).focus());
    expect(screen.getByRole('region', { name: 'Уведомления' })).toBeInTheDocument();
    const next = screen.getByRole('button', { name: 'Следующее действие' });
    act(() => next.focus());
    expect(next).toHaveFocus();
    expect(screen.queryByRole('region', { name: 'Уведомления' })).not.toBeInTheDocument();
  });

  it('закрывает панель по Escape на колокольчике и клику снаружи', () => {
    const trigger = setup();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('region', { name: 'Уведомления' })).not.toBeInTheDocument();
  });
});
