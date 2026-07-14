import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NotificationItem } from './NotificationItem';

const { access } = vi.hoisted(() => ({ access: { view: false, manage: false } }));
vi.mock('@/hooks/usePermissions', async () => {
  const React = await import('react');
  return { useCanAccess: ({ permission }: { permission: string }) => {
    React.useState(null);
    return permission === 'billing.view' ? access.view : access.manage;
  } };
});

const notification = {
  id: 'notice-1',
  type: 'commercial_trial_ending_1',
  data: { title: 'Пробный доступ', message: 'Пробный доступ скоро завершится', interface: 'lk' as const },
  read_at: null,
  created_at: '2026-07-15T10:00:00Z',
};

describe('NotificationItem commercial billing', () => {
  it('ведет только в коммерческий контур текущего личного кабинета', () => {
    access.view = true;
    render(<MemoryRouter><NotificationItem notification={notification} onMarkAsRead={vi.fn()} onDelete={vi.fn()} onExecuteAction={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Открыть пакеты и оплату' })).toHaveAttribute('href', '/dashboard/billing');
  });

  it('скрывает коммерческое уведомление без billing permission', () => {
    access.view = false;
    access.manage = false;
    const { container } = render(<MemoryRouter><NotificationItem notification={notification} onMarkAsRead={vi.fn()} onDelete={vi.fn()} onExecuteAction={vi.fn()} /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
  });

  it('сохраняет порядок hooks при переходе loading к billing.view', () => {
    access.view = false;
    access.manage = false;
    const props = { notification, onMarkAsRead: vi.fn(), onDelete: vi.fn(), onExecuteAction: vi.fn() };
    const { rerender } = render(<MemoryRouter><NotificationItem {...props} /></MemoryRouter>);
    access.view = true;
    expect(() => rerender(<MemoryRouter><NotificationItem {...props} /></MemoryRouter>)).not.toThrow();
    expect(screen.getByRole('link', { name: 'Открыть пакеты и оплату' })).toBeInTheDocument();
  });
});
