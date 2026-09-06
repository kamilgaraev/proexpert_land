import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NotificationDropdown } from './NotificationDropdown';

const props = {
  notifications: [], loading: false, loadError: null,
  onRetry: vi.fn(), onMarkAsRead: vi.fn(), onMarkAllAsRead: vi.fn(),
  onDelete: vi.fn(), onExecuteAction: vi.fn(), onClose: vi.fn(),
};

describe('Состояния загрузки панели уведомлений', () => {
  it('показывает ошибку вместо пустого списка и позволяет повторить запрос', () => {
    const retry = vi.fn();
    render(<MemoryRouter><NotificationDropdown {...props} loadError="Не удалось загрузить уведомления. Попробуйте ещё раз." onRetry={retry} /></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить уведомления');
    expect(screen.queryByText('Нет новых уведомлений')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('сохраняет сообщение и блокирует повтор на время запроса', () => {
    const retry = vi.fn();
    render(<MemoryRouter><NotificationDropdown {...props} loading loadError="Не удалось загрузить уведомления." onRetry={retry} /></MemoryRouter>);
    const button = screen.getByRole('button', { name: 'Загружаем…' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(retry).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('отличает начальную загрузку от успешно загруженного пустого списка', () => {
    const { rerender } = render(<MemoryRouter><NotificationDropdown {...props} loading /></MemoryRouter>);
    expect(screen.getByRole('status', { name: 'Загрузка уведомлений' })).toBeInTheDocument();
    expect(screen.queryByText('Нет новых уведомлений')).not.toBeInTheDocument();
    rerender(<MemoryRouter><NotificationDropdown {...props} /></MemoryRouter>);
    expect(screen.getByText('Нет новых уведомлений')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
