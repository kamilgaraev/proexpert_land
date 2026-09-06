import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../../../types/notification';

vi.mock('@/hooks/usePermissions', () => ({ useCanAccess: () => true }));

const notification: Notification = {
  id: 'notice-1', sequence: 1, organization_id: 44, type: 'system', interface: 'lk',
  data: { title: 'Изменён статус договора', message: 'Договор активен', interface: 'lk' },
  read_at: null, created_at: '2026-09-01T10:00:00Z',
};

function setup(overrides: Partial<Parameters<typeof NotificationItem>[0]> = {}) {
  const props = { notification, onMarkAsRead: vi.fn(), onDelete: vi.fn(), onExecuteAction: vi.fn(), ...overrides };
  render(<MemoryRouter><NotificationItem {...props} /></MemoryRouter>);
  return props;
}

describe('Явные действия уведомления', () => {
  it('не отмечает уведомление от наведения или клика по тексту', () => {
    const props = setup();
    fireEvent.mouseEnter(screen.getByRole('article'));
    fireEvent.click(screen.getByText('Договор активен'));
    expect(props.onMarkAsRead).not.toHaveBeenCalled();
    expect(screen.getByText('Новое')).toBeInTheDocument();
  });

  it('отмечает отдельной доступной кнопкой без повторной отправки', async () => {
    let resolve!: () => void;
    const pending = new Promise<void>(next => { resolve = next; });
    const onMarkAsRead = vi.fn(() => pending);
    setup({ onMarkAsRead });
    fireEvent.click(screen.getByRole('button', { name: 'Отметить прочитанным' }));
    expect(screen.getByRole('article')).toHaveFocus();
    const button = screen.getByRole('button', { name: 'Отмечаем…' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onMarkAsRead).toHaveBeenCalledTimes(1);
    await act(async () => { resolve(); await pending; });
    expect(screen.getByRole('button', { name: 'Отметить прочитанным' })).toBeEnabled();
  });

  it('восстанавливает удаление после отказа и разрешает повтор', async () => {
    const onDelete = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    setup({ onDelete });
    const button = screen.getByRole('button', { name: /Удалить уведомление/ });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось выполнить действие'));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('восстанавливает кнопку когда обработчик сам сообщил об ошибке и завершился', async () => {
    setup({ onDelete: vi.fn().mockResolvedValue(undefined) });
    const button = screen.getByRole('button', { name: /Удалить уведомление/ });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeEnabled());
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('показывает состояние прочтения текстом и не предлагает повторную отметку', () => {
    setup({ notification: { ...notification, read_at: '2026-09-01T11:00:00Z' } });
    expect(screen.getByText('Прочитано')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отметить прочитанным' })).not.toBeInTheDocument();
  });
});
